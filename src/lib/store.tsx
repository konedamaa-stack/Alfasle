"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  UserRole,
  Etablissement,
  Classe,
  Inscription,
  InscriptionRole,
  Cours,
  Devoir,
  Soumission,
  Correction,
  AppNotification,
} from "@/types";
import {
  initialUsers,
  initialEtablissements,
  initialClasses,
  initialInscriptions,
  initialCourses,
  initialAssignments,
  initialSubmissions,
  initialNotifications,
} from "./mock-data";
import {
  supabase,
  isSupabaseConfigured,
  mapRowToClasse,
  mapClasseToRow,
  mapRowToEtablissement,
  mapEtablissementToRow,
  mapRowToCours,
  mapCoursToRow,
  mapRowToDevoir,
  mapDevoirToRow,
  mapRowToInscription,
  mapInscriptionToRow,
} from "./supabase";
import { isStudentMatchingInscription } from "./utils";

interface StoreContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  switchRole: (role: UserRole) => void;
  createUser: (userData: Omit<User, "id" | "createdAt">) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Etablissements (Multi-Écoles)
  etablissements: Etablissement[];
  createEtablissement: (data: Omit<Etablissement, "id" | "createdAt" | "classesCount" | "studentsCount">) => Etablissement;
  updateEtablissement: (id: string, data: Partial<Etablissement>) => void;
  deleteEtablissement: (id: string) => void;

  // Classes
  classes: Classe[];
  createClass: (newClass: Omit<Classe, "id" | "createdAt" | "teacherId" | "teacherName" | "enrolledCount" | "pendingCount"> & { teacherId?: string; teacherName?: string }) => Classe;
  updateClass: (id: string, data: Partial<Classe>) => void;
  deleteClass: (id: string) => void;
  archiveClass: (id: string) => void;
  purgeDemoClasses: () => void;

  // Inscriptions & Pré-inscriptions
  inscriptions: Inscription[];
  applyToClass: (classeId: string, motivation?: string) => { success: boolean; message: string; inscription?: Inscription };
  joinClassByCode: (classCode: string, motivation?: string) => { success: boolean; message: string; classe?: Classe };
  submitPreRegistration: (data: {
    userName: string;
    userEmail: string;
    userPhone?: string;
    role: "STUDENT" | "TEACHER";
    etablissementId: string;
    classeId: string;
    subject?: string;
    diplomaOrBio?: string;
    motivation?: string;
  }) => { success: boolean; message: string; inscription?: Inscription };
  approveInscription: (inscriptionId: string) => void;
  rejectInscription: (inscriptionId: string) => void;

  // Courses
  courses: Cours[];
  createCourse: (newCourse: Omit<Cours, "id" | "publishedAt">) => void;
  updateCourse: (id: string, data: Partial<Cours>) => void;
  deleteCourse: (id: string) => void;

  // Assignments
  assignments: Devoir[];
  createAssignment: (newAssignment: Omit<Devoir, "id" | "createdAt" | "submissionsCount" | "gradedCount">) => void;
  deleteAssignment: (id: string) => void;

  // Submissions & Corrections
  submissions: Soumission[];
  submitAssignment: (devoirId: string, content: string, attachmentName?: string, attachmentUrl?: string) => void;
  gradeSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Theme Mode (Dark / Light)
  theme: "dark" | "light";
  toggleTheme: () => void;

  // Notifications
  notifications: AppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Account Activation & Password
  activateAccountWithPassword: (data: {
    emailOrToken: string;
    newPassword: string;
  }) => { success: boolean; message: string; user?: User };
  changeUserPassword: (data: {
    userId: string;
    currentPassword?: string;
    newPassword: string;
  }) => { success: boolean; message: string };

  // Storage versioning
  resetStoreToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);
const STORAGE_PREFIX = "alfasle_v202_classes_";

const PRESERVED_EXACT_KEYS = new Set([
  "alfasle_session_active",
  "alfasle_active_tab",
  "alfasle_user_role",
  "alfasle_theme",
  "alfasle_selected_school",
]);

function cleanLegacyStorage() {
  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (PRESERVED_EXACT_KEYS.has(k)) continue;
        if (k.startsWith(STORAGE_PREFIX)) continue;

        if (
          k.startsWith("alfasle") ||
          k === "classes" ||
          k === "courses" ||
          k === "inscriptions" ||
          k === "users" ||
          k === "assignments" ||
          k === "submissions"
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
  }
}

function loadInitialData<T extends { id: string }>(suffix: string, initialData: T[]): T[] {
  const key = `${STORAGE_PREFIX}${suffix}`;
  if (typeof window !== "undefined") {
    cleanLegacyStorage();
    try {
      const saved = localStorage.getItem(key);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let merged = [...parsed];

          // Assurer que le compte Super Admin Master existe toujours dans users
          if (suffix === "users") {
            const hasSuperAdmin = merged.some((u: any) => u.role === "SUPER_ADMIN");
            if (!hasSuperAdmin && initialData[0]) {
              merged.unshift(initialData[0]);
            }

            // Migration automatique: lamine -> cherifladivo
            merged = merged.map((u: any) => {
              if (u.email === "lamine@gmail.com" || u.id === "u_dir_lamine") {
                return {
                  ...u,
                  id: "u_dir_cherif",
                  name: "CHÉRIF (Directeur)",
                  username: "cherif",
                  email: "cherifladivo@gmail.com",
                };
              }
              return u;
            });
          }

          if (suffix === "etablissements") {
            // Migration automatique: directeur lamine -> cherifladivo
            merged = merged.map((e: any) => {
              if (e.id === "etab_1793080550879" || e.subdomain === "kouliyat" || e.directorEmail === "lamine@gmail.com") {
                return {
                  ...e,
                  directorName: "CHÉRIF",
                  directorEmail: "cherifladivo@gmail.com",
                  email: "cherifladivo@gmail.com",
                };
              }
              return e;
            });
          }

          if (suffix === "classes") {
            merged = merged.map((c: any) => {
              if (c.teacherId === "u_dir_lamine" || c.teacherName === "LAMINE (Directeur)") {
                return {
                  ...c,
                  teacherId: "u_dir_cherif",
                  teacherName: "CHÉRIF (Directeur)",
                };
              }
              return c;
            });
          }

          return merged;
        }
      }
    } catch (e) {
      console.error(`Erreur de chargement localStorage pour ${key}:`, e);
    }
  }
  return initialData;
}

function loadInitialUser(defaultUser: User): User {
  if (typeof window !== "undefined") {
    cleanLegacyStorage();
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}currentUser`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) {
          if (parsed.email === "lamine@gmail.com" || parsed.id === "u_dir_lamine") {
            return {
              ...parsed,
              id: "u_dir_cherif",
              name: "CHÉRIF (Directeur)",
              username: "cherif",
              email: "cherifladivo@gmail.com",
            };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error("Erreur chargement currentUser:", e);
    }
  }
  return defaultUser;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">("light");

  const toggleTheme = () => {
    // Theme sombre supprimé, permanent light mode
    setTheme("light");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("alfasle_theme");
        localStorage.setItem("alfasle_theme", "light");
      } catch (_) {}
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const [users, setUsers] = useState<User[]>(() => loadInitialData("users", initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => loadInitialUser(initialUsers[0])); // Default: Super Admin Master
  const [etablissements, setEtablissements] = useState<Etablissement[]>(() =>
    loadInitialData("etablissements", initialEtablissements)
  );
  const [classes, setClasses] = useState<Classe[]>(() =>
    loadInitialData("classes", initialClasses)
  );
  const [inscriptions, setInscriptions] = useState<Inscription[]>(() =>
    loadInitialData("inscriptions", initialInscriptions)
  );
  const [courses, setCourses] = useState<Cours[]>(() =>
    loadInitialData("courses", initialCourses)
  );
  const [assignments, setAssignments] = useState<Devoir[]>(() =>
    loadInitialData("assignments", initialAssignments)
  );
  const [submissions, setSubmissions] = useState<Soumission[]>(() =>
    loadInitialData("submissions", initialSubmissions)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadInitialData("notifications", initialNotifications)
  );

  // Synchronisation Cloud avec Supabase au chargement et en temps réel
  const syncFromSupabase = React.useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const [etabsRes, classesRes, coursesRes, assignmentsRes, inscriptionsRes] = await Promise.all([
        supabase.from("etablissements").select("*"),
        supabase.from("classes").select("*"),
        supabase.from("courses").select("*"),
        supabase.from("assignments").select("*"),
        supabase.from("inscriptions").select("*"),
      ]);

      if (etabsRes.data) {
        const fetchedEtabs = etabsRes.data.map(mapRowToEtablissement).map((e) =>
          // Migration: directeur LAMINE -> CHÉRIF (cherifladivo@gmail.com)
          (e.directorEmail || "").toLowerCase() === "lamine@gmail.com" ||
          (e.directorName || "").trim().toUpperCase() === "LAMINE"
            ? { ...e, directorName: "CHÉRIF", directorEmail: "cherifladivo@gmail.com" }
            : e
        );
        setEtablissements(fetchedEtabs);
      }

      let fetchedInscriptions: Inscription[] = [];
      if (inscriptionsRes.data) {
        fetchedInscriptions = inscriptionsRes.data.map(mapRowToInscription);
        setInscriptions((prev) => {
          const fetchedIds = new Set(fetchedInscriptions.map((i) => i.id));
          const localOnly = prev.filter((i) => !fetchedIds.has(i.id));
          return [...fetchedInscriptions, ...localOnly];
        });

        // Synchroniser automatiquement la classe obligatoire choisie par chaque élève sur son profil User
        setUsers((prevUsers) => {
          let updatedUsers = prevUsers.map((u) => {
            if (u.role !== "STUDENT") return u;
            const matchedIns = fetchedInscriptions.find((i) => isStudentMatchingInscription(u, i));
            if (matchedIns && matchedIns.classeId) {
              return {
                ...u,
                classeId: matchedIns.classeId,
                classeTitle: matchedIns.classeTitle || u.classeTitle,
              };
            }
            return u;
          });

          // S'assurer que tout élève validé (APPROVED / CONFIRMED) dans Supabase existe aussi dans users avec sa classe
          fetchedInscriptions.forEach((ins) => {
            if (ins.role === "STUDENT" && (ins.status === "APPROVED" || ins.status === "CONFIRMED")) {
              const exists = updatedUsers.some((u) => isStudentMatchingInscription(u, ins));
              if (!exists) {
                const generatedUsername =
                  (ins.userEmail || ins.userName).split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") ||
                  `eleve${Date.now().toString().slice(-4)}`;
                updatedUsers.push({
                  id: ins.userId || `u_cand_${ins.id}`,
                  name: ins.userName,
                  email: ins.userEmail.toLowerCase(),
                  phone: ins.userPhone,
                  username: generatedUsername,
                  password: "Madouu1966@",
                  role: "STUDENT",
                  etablissementId: ins.etablissementId,
                  etablissementName: ins.etablissementName,
                  classeId: ins.classeId,
                  classeTitle: ins.classeTitle,
                  bio: ins.motivation || `Élève inscrit dans la classe ${ins.classeTitle}`,
                  avatarUrl: ins.userAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                  createdAt: ins.appliedAt || new Date().toISOString(),
                });
              }
            }
          });

          return updatedUsers;
        });
      }

      // Compute approved student enrollments per class
      const classEnrollmentMap = new Map<string, number>();
      fetchedInscriptions.forEach((ins) => {
        if (ins.role === "STUDENT" && (ins.status === "APPROVED" || ins.status === "CONFIRMED")) {
          classEnrollmentMap.set(ins.classeId, (classEnrollmentMap.get(ins.classeId) || 0) + 1);
        }
      });

      if (classesRes.data) {
        const fetchedClasses = classesRes.data.map((row: any) => {
          const c = mapRowToClasse(row);
          const enrolled = Math.max(c.enrolledCount || 0, classEnrollmentMap.get(c.id) || 0);
          return { ...c, enrolledCount: enrolled };
        });
        setClasses(fetchedClasses);
      }

      if (coursesRes.data) {
        const fetchedCourses: Cours[] = coursesRes.data.map(mapRowToCours);
        setCourses(fetchedCourses);
      }

      if (assignmentsRes.data) {
        const fetchedAssignments: Devoir[] = assignmentsRes.data.map(mapRowToDevoir);
        setAssignments(fetchedAssignments);
      }
    } catch (err) {
      console.warn("Supabase initial sync:", err);
    }
  }, []);

  // Initialisation et chargement des données Cloud
  useEffect(() => {
    syncFromSupabase();
  }, [syncFromSupabase]);

  // Synchronisation temps réel MULTI-NAVIGATEURS (Chrome, Firefox, Edge, Opera, Mobile)
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const realtimeChannel = supabase
      .channel("alfasle_cloud_realtime_sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public" },
        () => {
          syncFromSupabase();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [syncFromSupabase]);

  // Synchronisation temps réel intra-navigateur (multi-onglets même navigateur)
  useEffect(() => {
    if (typeof window === "undefined") return;
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel("alfasle_sync_channel");
      channel.onmessage = (event) => {
        if (event.data?.type === "NEW_INSCRIPTION" && event.data.inscription) {
          setInscriptions((prev) => {
            if (prev.some((i) => i.id === event.data.inscription.id)) return prev;
            return [event.data.inscription, ...prev];
          });
        }
        if (event.data?.type === "INSCRIPTION_STATUS_CHANGED") {
          setInscriptions((prev) =>
            prev.map((i) =>
              i.id === event.data.id ? { ...i, status: event.data.status } : i
            )
          );
        }
        if (event.data?.type === "CLASS_SYNC" && event.data.classe) {
          setClasses((prev) => {
            const map = new Map(prev.map((c) => [c.id, c]));
            map.set(event.data.classe.id, event.data.classe);
            return Array.from(map.values());
          });
        }
      };
    } catch (_) {}

    return () => {
      if (channel) channel.close();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_PREFIX}currentUser`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_PREFIX}etablissements`, JSON.stringify(etablissements));
      localStorage.setItem(`${STORAGE_PREFIX}classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_PREFIX}inscriptions`, JSON.stringify(inscriptions));
      localStorage.setItem(`${STORAGE_PREFIX}courses`, JSON.stringify(courses));
      localStorage.setItem(`${STORAGE_PREFIX}assignments`, JSON.stringify(assignments));
      localStorage.setItem(`${STORAGE_PREFIX}submissions`, JSON.stringify(submissions));
      localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
    }
  }, [currentUser, users, etablissements, classes, inscriptions, courses, assignments, submissions, notifications]);

  const resetStoreToDefaults = () => {
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (
            key &&
            (key.startsWith("alfasle") ||
              key.includes("active_tab") ||
              key.includes("classes") ||
              key.includes("courses") ||
              key.includes("inscriptions") ||
              key.includes("assignments") ||
              key.includes("submissions") ||
              key.includes("notifications"))
          ) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.error("Erreur reset localStorage:", e);
      }
    }

    if (isSupabaseConfigured()) {
      Promise.all([
        supabase.from("submissions").delete().neq("id", "non_existent_fake_id"),
        supabase.from("corrections").delete().neq("id", "non_existent_fake_id"),
        supabase.from("assignments").delete().neq("id", "non_existent_fake_id"),
        supabase.from("courses").delete().neq("id", "non_existent_fake_id"),
        supabase.from("inscriptions").delete().neq("id", "non_existent_fake_id"),
        supabase.from("classes").delete().neq("id", "non_existent_fake_id"),
        supabase.from("notifications").delete().neq("id", "non_existent_fake_id"),
        supabase.from("etablissements").update({ classes_count: 0, students_count: 0 }).neq("id", "non_existent_fake_id"),
      ]).then(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      });
    }

    setUsers(initialUsers);
    setEtablissements(initialEtablissements);
    setClasses(initialClasses);
    setInscriptions(initialInscriptions);
    setCourses(initialCourses);
    setAssignments(initialAssignments);
    setSubmissions(initialSubmissions);
    setNotifications(initialNotifications);
    setCurrentUser(initialUsers[0]); // KONE ADAMA (Super Admin Master)
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const switchRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) setCurrentUser(found);
  };

  // User Management (Super Admin & Admins)
  const createUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUserId = `u_${Date.now()}`;
    const targetClass = userData.classeId ? classes.find((c) => c.id === userData.classeId) : undefined;
    const newUser: User = {
      ...userData,
      id: newUserId,
      classeId: userData.classeId || targetClass?.id,
      classeTitle: userData.classeTitle || targetClass?.title,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);

    // Si c'est un élève rattaché à une classe, enregistrer également son inscription validée (local + Supabase)
    if (newUser.role === "STUDENT" && newUser.classeId) {
      const nowIso = new Date().toISOString();
      const autoIns: Inscription = {
        id: `ins_${Date.now()}`,
        etablissementId: newUser.etablissementId || targetClass?.etablissementId,
        etablissementName: newUser.etablissementName || targetClass?.etablissementName,
        classeId: newUser.classeId,
        classeTitle: newUser.classeTitle || targetClass?.title || "Classe choisie",
        userId: newUser.id,
        userName: newUser.name,
        userEmail: newUser.email,
        role: "STUDENT",
        userAvatar: newUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        status: "APPROVED",
        motivation: newUser.bio || `Inscrit dans la classe ${newUser.classeTitle || targetClass?.title || ""}`,
        createdAt: nowIso,
        appliedAt: nowIso,
        reviewedAt: nowIso,
        reviewedBy: currentUser.name,
      };
      setInscriptions((prev) => [autoIns, ...prev]);
      if (isSupabaseConfigured()) {
        supabase.from("inscriptions").upsert(mapInscriptionToRow(autoIns)).then();
      }
    }

    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const targetClass = data.classeId ? classes.find((c) => c.id === data.classeId) : undefined;
    const enrichedData: Partial<User> = {
      ...data,
      ...(targetClass ? { classeId: targetClass.id, classeTitle: targetClass.title } : {}),
    };

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...enrichedData };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );

    if (enrichedData.classeId) {
      const targetUser = users.find((u) => u.id === id);
      const clsTitle = enrichedData.classeTitle || targetClass?.title || "Classe choisie";
      setInscriptions((prev) => {
        const existingIdx = prev.findIndex(
          (i) => i.userId === id || (targetUser && isStudentMatchingInscription(i, targetUser))
        );
        if (existingIdx >= 0) {
          const updatedIns: Inscription = {
            ...prev[existingIdx],
            userId: id,
            userName: enrichedData.name || prev[existingIdx].userName,
            userEmail: enrichedData.email || prev[existingIdx].userEmail,
            classeId: enrichedData.classeId!,
            classeTitle: clsTitle,
          };
          if (isSupabaseConfigured()) {
            supabase.from("inscriptions").upsert(mapInscriptionToRow(updatedIns)).then();
          }
          const copy = [...prev];
          copy[existingIdx] = updatedIns;
          return copy;
        } else if (targetUser) {
          const nowIso = new Date().toISOString();
          const newIns: Inscription = {
            id: `ins_${Date.now()}`,
            etablissementId: targetUser.etablissementId || targetClass?.etablissementId,
            etablissementName: targetUser.etablissementName || targetClass?.etablissementName,
            classeId: enrichedData.classeId!,
            classeTitle: clsTitle,
            userId: id,
            userName: enrichedData.name || targetUser.name,
            userEmail: enrichedData.email || targetUser.email,
            role: "STUDENT",
            userAvatar: targetUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            status: "APPROVED",
            motivation: enrichedData.bio || targetUser.bio || `Affecté à la classe ${clsTitle}`,
            createdAt: nowIso,
            appliedAt: nowIso,
            reviewedAt: nowIso,
            reviewedBy: currentUser.name,
          };
          if (isSupabaseConfigured()) {
            supabase.from("inscriptions").upsert(mapInscriptionToRow(newIns)).then();
          }
          return [newIns, ...prev];
        }
        return prev;
      });
    }
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Etablissement Management
  const createEtablissement = (data: Omit<Etablissement, "id" | "createdAt" | "classesCount" | "studentsCount">) => {
    const etabId = `etab_${Date.now()}`;

    const newEtab: Etablissement = {
      ...data,
      id: etabId,
      classesCount: 0,
      studentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setEtablissements((prev) => [newEtab, ...prev]);

    // If director has email, provision Director user in system
    if (data.directorEmail && data.directorName) {
      const directorPass = data.directorPassword?.trim() || "Madouu1966";
      const directorUser: User = {
        id: `u_dir_${Date.now()}`,
        name: data.directorName,
        email: data.directorEmail,
        username: data.directorEmail.split("@")[0].toLowerCase(),
        role: "ADMIN",
        password: directorPass,
        etablissementId: etabId,
        etablissementName: data.name,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        bio: `Directeur / Responsable de l'établissement ${data.name}.`,
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => {
        const existingIndex = prev.findIndex(
          (u) => u.email.toLowerCase() === data.directorEmail?.toLowerCase()
        );
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            name: data.directorName || updated[existingIndex].name,
            password: directorPass,
            role: "ADMIN",
            etablissementId: etabId,
            etablissementName: data.name,
          };
          return updated;
        }
        return [...prev, directorUser];
      });
    }

    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        userId: currentUser.id,
        title: "Nouvel établissement déployé 🏫",
        message: `L'établissement « ${newEtab.name} » (.${newEtab.subdomain}.alfasle.xyz) est maintenant actif.`,
        type: "SYSTEM",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    if (isSupabaseConfigured()) {
      supabase.from("etablissements").upsert(mapEtablissementToRow(newEtab)).then();
    }

    return newEtab;
  };

  const updateEtablissement = (id: string, data: Partial<Etablissement>) => {
    setEtablissements((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, ...data } : e));
      const target = next.find((e) => e.id === id);
      if (target && isSupabaseConfigured()) {
        supabase.from("etablissements").upsert(mapEtablissementToRow(target)).then(
          ({ error }: any) => {
            if (error) console.error("Erreur mise a jour etablissement Supabase:", error);
          }
        );
      }
      return next;
    });

    if (data.name) {
      setClasses((prev) =>
        prev.map((c) => (c.etablissementId === id ? { ...c, etablissementName: data.name! } : c))
      );
    }

    if (data.directorEmail || data.directorName || data.directorPassword) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.etablissementId === id && u.role === "ADMIN") {
            return {
              ...u,
              name: data.directorName || u.name,
              email: data.directorEmail || u.email,
              password: data.directorPassword || u.password,
              etablissementName: data.name || u.etablissementName,
            };
          }
          return u;
        })
      );
    }
  };

  const deleteEtablissement = (id: string) => {
    setEtablissements((prev) => prev.filter((e) => e.id !== id));
    setClasses((prev) => prev.filter((c) => c.etablissementId !== id));
    setInscriptions((prev) => prev.filter((i) => i.etablissementId !== id));
    setUsers((prev) => prev.filter((u) => u.etablissementId !== id || u.role === "SUPER_ADMIN"));

    if (isSupabaseConfigured()) {
      supabase.from("etablissements").delete().eq("id", id).then();
    }
  };

  // Class Management
  const createClass = (newClassData: Omit<Classe, "id" | "createdAt" | "teacherId" | "teacherName" | "enrolledCount" | "pendingCount"> & { teacherId?: string; teacherName?: string }) => {
    const newClass: Classe = {
      coursesCount: 0,
      assignmentsCount: 0,
      ...newClassData,
      id: `cls_${Date.now()}`,
      teacherId: newClassData.teacherId || currentUser.id,
      teacherName: newClassData.teacherName || currentUser.name,
      createdAt: new Date().toISOString(),
      enrolledCount: 0,
      pendingCount: 0,
    };
    setClasses((prev) => [newClass, ...prev]);

    // Persistance Cloud Supabase
    if (isSupabaseConfigured()) {
      supabase
        .from("classes")
        .upsert(mapClasseToRow(newClass))
        .then(
          ({ error }: any) => {
            if (error) console.error("Erreur sauvegarde classe Supabase:", error);
          },
          (err: any) => console.error("Erreur réseau Supabase:", err)
        );
    }

    // Notification
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: "Nouvelle classe créée",
      message: `Votre classe « ${newClass.title} » est maintenant active.`,
      type: "SYSTEM",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newClass;
  };

  const updateClass = (id: string, data: Partial<Classe>) => {
    setClasses((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      const target = next.find((c) => c.id === id);
      if (target && isSupabaseConfigured()) {
        supabase.from("classes").upsert(mapClasseToRow(target)).then();
      }
      return next;
    });
  };

  const deleteClass = (id: string) => {
    if (isSupabaseConfigured()) {
      supabase.from("classes").delete().eq("id", id).then();
    }
    setClasses((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}classes`, JSON.stringify(next));
        } catch (e) {
          console.error("Erreur sauvegarde immédiate classe:", e);
        }
      }
      return next;
    });
    setInscriptions((prev) => {
      const next = prev.filter((i) => i.classeId !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}inscriptions`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    setCourses((prev) => {
      const next = prev.filter((crs) => crs.classeId !== id);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}courses`, JSON.stringify(next));
        } catch (e) {}
      }
      return next;
    });
    setAssignments((prev) => {
      const remaining = prev.filter((a) => a.classeId !== id);
      const removedIds = new Set(prev.filter((a) => a.classeId === id).map((a) => a.id));
      setSubmissions((subs) => {
        const remainingSubs = subs.filter((s) => !removedIds.has(s.devoirId));
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(`${STORAGE_PREFIX}submissions`, JSON.stringify(remainingSubs));
          } catch (e) {}
        }
        return remainingSubs;
      });
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}assignments`, JSON.stringify(remaining));
        } catch (e) {}
      }
      return remaining;
    });
  };

  const archiveClass = (id: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, status: "ARCHIVED" } : c)));
  };

  const purgeDemoClasses = () => {
    const demoClassIds = new Set([
      "cls_nextjs_mastery",
      "cls_algo_data",
      "cls_physique_chimie",
      "cls_litterature_philo",
      "cls_reseaux_telecoms",
      "cls_cloud_distrib",
    ]);
    const demoEtabIds = new Set(["etab_lycee_excellence", "etab_polytech_kone"]);

    setEtablissements((prev) => {
      const next = prev.filter((e) => !demoEtabIds.has(e.id));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}etablissements`, JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });

    setUsers((prev) => {
      const next = prev.filter((u) => u.role === "SUPER_ADMIN" || (!demoEtabIds.has(u.etablissementId || "")));
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(next));
        } catch (_) {}
      }
      return next;
    });

    setClasses([]);
    setCourses([]);
    setInscriptions([]);
    setAssignments([]);
    setSubmissions([]);
    setNotifications([]);
    setUsers((prev) => prev.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN"));

    if (isSupabaseConfigured()) {
      supabase.from("classes").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("courses").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("inscriptions").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("assignments").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("submissions").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("corrections").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("notifications").delete().neq("id", "non_existent_fake_id").then();
      supabase.from("etablissements").update({ classes_count: 0, students_count: 0 }).neq("id", "non_existent_fake_id").then();
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${STORAGE_PREFIX}classes`);
        localStorage.removeItem(`${STORAGE_PREFIX}courses`);
        localStorage.removeItem(`${STORAGE_PREFIX}inscriptions`);
        localStorage.removeItem(`${STORAGE_PREFIX}assignments`);
        localStorage.removeItem(`${STORAGE_PREFIX}submissions`);
        localStorage.removeItem(`${STORAGE_PREFIX}notifications`);
      } catch (_) {}
    }
  };

  // Inscriptions (Règle stricte : 1 seule classe par élève)
  const applyToClass = (classeId: string, motivation?: string) => {
    const targetClass = classes.find((c) => c.id === classeId);
    if (!targetClass) {
      return { success: false, message: "Classe introuvable." };
    }

    // Un élève ne peut s'inscrire que dans UNE SEULE classe
    if (currentUser.role === "STUDENT") {
      const existingStudentEnrollment = inscriptions.find(
        (i) =>
          i.userId === currentUser.id &&
          (i.status === "APPROVED" || i.status === "PENDING" || i.status === "CONFIRMED")
      );

      if (existingStudentEnrollment) {
        if (existingStudentEnrollment.classeId === classeId) {
          return {
            success: false,
            message:
              existingStudentEnrollment.status === "APPROVED"
                ? `Vous êtes déjà inscrit(e) et actif(ve) dans la classe « ${existingStudentEnrollment.classeTitle} ».`
                : `Votre candidature pour « ${existingStudentEnrollment.classeTitle} » est déjà en cours de validation.`,
          };
        } else {
          return {
            success: false,
            message: `Règle de scolarité : Un élève ne peut s'inscrire que dans UNE SEULE classe. Vous êtes déjà rattaché(e) ou en attente pour la classe « ${existingStudentEnrollment.classeTitle} » (${existingStudentEnrollment.etablissementName}).`,
          };
        }
      }
    }

    // Check if already applied (enseignant ou profil général)
    const existing = inscriptions.find((i) => i.classeId === classeId && i.userId === currentUser.id);
    if (existing) {
      return {
        success: false,
        message: `Une inscription existe déjà pour cette classe.`,
      };
    }

    const isAutoApprove = targetClass.enrollmentMode === "OPEN";

    const newInscription: Inscription = {
      id: `ins_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatarUrl,
      role: (currentUser.role === "TEACHER" ? "TEACHER" : "STUDENT") as InscriptionRole,
      etablissementId: targetClass.etablissementId,
      etablissementName: targetClass.etablissementName,
      classeId,
      classeTitle: targetClass.title,
      status: isAutoApprove ? "APPROVED" : "PENDING",
      motivation: motivation || "Candidature via le portail étudiant AlFasle",
      appliedAt: new Date().toISOString(),
      reviewedAt: isAutoApprove ? new Date().toISOString() : undefined,
    };

    setInscriptions((prev) => [newInscription, ...prev]);

    if (isSupabaseConfigured()) {
      supabase.from("inscriptions").upsert(mapInscriptionToRow(newInscription)).then();
    }

    // Update class counters
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classeId) {
          return {
            ...c,
            enrolledCount: isAutoApprove ? (c.enrolledCount || 0) + 1 : c.enrolledCount,
            pendingCount: !isAutoApprove ? (c.pendingCount || 0) + 1 : c.pendingCount,
          };
        }
        return c;
      })
    );

    // Notify teacher
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        userId: targetClass.teacherId,
        title: isAutoApprove ? "Nouvel étudiant inscrit" : "Nouvelle préinscription",
        message: `${currentUser.name} a rejoint ${targetClass.title}${!isAutoApprove ? " (en attente de validation)" : ""}.`,
        type: "INSCRIPTION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return {
      success: true,
      message: isAutoApprove
        ? `Félicitations ! Vous avez rejoint la classe « ${targetClass.title} ». Vos cours sont disponibles.`
        : `Votre demande pour « ${targetClass.title} » a été transmise à la direction pour validation.`,
      inscription: newInscription,
    };
  };

  // Rejoindre une classe avec code unique (ex: AF-DEV-101, AF-MATH-202)
  const joinClassByCode = (classCode: string, motivation?: string) => {
    const cleanCode = classCode.trim().toUpperCase();
    const targetClass = classes.find(
      (c) => c.classCode?.toUpperCase() === cleanCode || c.id.toUpperCase() === cleanCode
    );

    if (!targetClass) {
      return {
        success: false,
        message: `Aucune classe trouvée avec le code « ${cleanCode} ». Veuillez vérifier le code fourni par votre établissement ou professeur.`,
      };
    }

    // Un élève ne peut s'inscrire que dans UNE SEULE classe
    if (currentUser.role === "STUDENT") {
      const existingStudentEnrollment = inscriptions.find(
        (i) =>
          i.userId === currentUser.id &&
          (i.status === "APPROVED" || i.status === "PENDING" || i.status === "CONFIRMED")
      );

      if (existingStudentEnrollment) {
        if (existingStudentEnrollment.classeId === targetClass.id) {
          if (existingStudentEnrollment.status === "APPROVED") {
            return {
              success: true,
              message: `Vous êtes déjà inscrit et actif dans la classe « ${targetClass.title} ». Vos cours sont immédiatement disponibles !`,
              classe: targetClass,
            };
          } else {
            return {
              success: false,
              message: `Votre demande d'inscription pour « ${targetClass.title} » est actuellement en cours de traitement.`,
              classe: targetClass,
            };
          }
        } else {
          return {
            success: false,
            message: `Règle de scolarité : Un élève ne peut s'inscrire que dans UNE SEULE classe. Vous êtes déjà rattaché(e) à la classe « ${existingStudentEnrollment.classeTitle} » (${existingStudentEnrollment.etablissementName}).`,
          };
        }
      }
    }

    const existing = inscriptions.find(
      (i) => i.classeId === targetClass.id && i.userId === currentUser.id
    );

    if (existing) {
      if (existing.status === "APPROVED") {
        return {
          success: true,
          message: `Vous êtes déjà inscrit et actif dans la classe « ${targetClass.title} ». Vos cours sont immédiatement disponibles !`,
          classe: targetClass,
        };
      } else {
        return {
          success: false,
          message: `Votre demande d'inscription pour « ${targetClass.title} » est actuellement en cours de traitement.`,
          classe: targetClass,
        };
      }
    }

    // Auto-approve or apply
    const isAutoApprove = targetClass.enrollmentMode === "OPEN";

    const newInscription: Inscription = {
      id: `ins_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatarUrl,
      role: (currentUser.role === "TEACHER" ? "TEACHER" : "STUDENT") as InscriptionRole,
      etablissementId: targetClass.etablissementId,
      etablissementName: targetClass.etablissementName,
      classeId: targetClass.id,
      classeTitle: targetClass.title,
      status: isAutoApprove ? "APPROVED" : "PENDING",
      motivation: motivation || `Inscription directe via le code classe ${cleanCode}`,
      appliedAt: new Date().toISOString(),
      reviewedAt: isAutoApprove ? new Date().toISOString() : undefined,
    };

    setInscriptions((prev) => [newInscription, ...prev]);

    if (isSupabaseConfigured()) {
      supabase.from("inscriptions").upsert(mapInscriptionToRow(newInscription)).then();
    }

    // Update class counters
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === targetClass.id) {
          return {
            ...c,
            enrolledCount: isAutoApprove ? (c.enrolledCount || 0) + 1 : c.enrolledCount,
            pendingCount: !isAutoApprove ? (c.pendingCount || 0) + 1 : c.pendingCount,
          };
        }
        return c;
      })
    );

    // Notify student & teacher
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        userId: currentUser.id,
        title: isAutoApprove ? "Inscription réussie 🎉" : "Demande transmise ⏳",
        message: isAutoApprove
          ? `Vous avez rejoint « ${targetClass.title} » (${targetClass.etablissementName}). Vos cours sont prêts !`
          : `Votre demande pour « ${targetClass.title} » a été transmise à la direction.`,
        type: "INSCRIPTION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: `notif_${Date.now() + 1}`,
        userId: targetClass.teacherId,
        title: "Nouvel étudiant inscrit",
        message: `${currentUser.name} a rejoint la classe ${targetClass.title} via le code ${cleanCode}.`,
        type: "INSCRIPTION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return {
      success: true,
      message: isAutoApprove
        ? `Félicitations ! Vous avez rejoint la classe « ${targetClass.title} » avec succès.`
        : `Demande envoyée pour validation auprès de la direction de « ${targetClass.etablissementName} ».`,
      classe: targetClass,
    };
  };

  // Soumission d'une Pré-inscription publique (Élève ou Enseignant)
  const submitPreRegistration = (data: {
    userName: string;
    userEmail: string;
    userPhone?: string;
    role: "STUDENT" | "TEACHER";
    etablissementId: string;
    classeId: string;
    subject?: string;
    diplomaOrBio?: string;
    motivation?: string;
  }) => {
    // Règle stricte AlFasle : Un élève ne peut s'inscrire que dans UNE SEULE classe
    if (data.role === "STUDENT") {
      const cleanEmail = data.userEmail.trim().toLowerCase();
      const cleanPhone = data.userPhone?.trim();
      const cleanName = data.userName.trim().toLowerCase();

      const existingStudent = inscriptions.find((i) => {
        if (i.role !== "STUDENT") return false;
        if (i.status !== "PENDING" && i.status !== "APPROVED" && i.status !== "CONFIRMED") return false;
        const sameEmail = Boolean(cleanEmail && i.userEmail && i.userEmail.toLowerCase() === cleanEmail);
        const samePhone = Boolean(cleanPhone && i.userPhone && i.userPhone === cleanPhone);
        const sameName = Boolean(cleanName && i.userName && i.userName.trim().toLowerCase() === cleanName);
        return sameEmail || (samePhone && sameName);
      });

      if (existingStudent) {
        const isSameClass = existingStudent.classeId === data.classeId;
        return {
          success: false,
          message: isSameClass
            ? `Vous avez déjà soumis une inscription pour « ${existingStudent.classeTitle} » (${existingStudent.status === "PENDING" ? "en attente de validation" : "validée"}). Un élève ne peut s'inscrire qu'une seule fois.`
            : `Règle de l'établissement : Un élève ne peut s'inscrire que dans UNE SEULE classe. Une inscription existe déjà pour la classe « ${existingStudent.classeTitle} » (${existingStudent.etablissementName}).`,
        };
      }
    }

    if (!data.classeId) {
      return {
        success: false,
        message: "Veuillez obligatoirement choisir une classe pour votre inscription.",
      };
    }

    const targetClass = classes.find((c) => c.id === data.classeId);
    const targetEtab =
      etablissements.find(
        (e) => e.id === data.etablissementId || e.subdomain === data.etablissementId
      ) ||
      (targetClass ? etablissements.find((e) => e.id === targetClass.etablissementId) : null);

    const finalEtabId =
      targetEtab?.id ||
      targetClass?.etablissementId ||
      (data.etablissementId && data.etablissementId !== "ALL"
        ? data.etablissementId
        : etablissements[0]?.id || "etab_default");

    const finalEtabName =
      targetEtab?.name ||
      targetClass?.etablissementName ||
      "Établissement AlFasle";

    const finalClasseId = targetClass?.id || data.classeId;
    const finalClasseTitle = targetClass?.title || "Classe AlFasle";

    const activationToken = `act_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const insId = `ins_${Date.now()}`;
    const existingCandidateUser = users.find(
      (u) =>
        u.email.toLowerCase() === data.userEmail.trim().toLowerCase() ||
        (u.role === "STUDENT" && u.name.trim().toLowerCase() === data.userName.trim().toLowerCase())
    );
    const candidateUserId = existingCandidateUser?.id || `u_cand_${insId}`;

    // Si l'utilisateur existe déjà dans users, le rattacher obligatoirement à la classe choisie
    if (existingCandidateUser && data.role === "STUDENT") {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === existingCandidateUser.id
            ? { ...u, classeId: finalClasseId, classeTitle: finalClasseTitle }
            : u
        )
      );
    }

    const newInscription: Inscription = {
      id: insId,
      userId: candidateUserId,
      userName: data.userName.trim(),
      userEmail: data.userEmail.trim().toLowerCase(),
      userPhone: data.userPhone?.trim(),
      userAvatar:
        data.role === "TEACHER"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: data.role,
      etablissementId: finalEtabId,
      etablissementName: finalEtabName,
      classeId: finalClasseId,
      classeTitle: finalClasseTitle,
      subject: data.subject?.trim(),
      diplomaOrBio: data.diplomaOrBio?.trim(),
      status: "PENDING",
      emailConfirmed: false,
      activationToken,
      motivation: data.motivation?.trim() || "Candidature en ligne en attente de validation Super Admin",
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setInscriptions((prev) => [newInscription, ...prev]);

    // Multi-tab automatic real-time broadcast
    if (typeof window !== "undefined") {
      try {
        const channel = new BroadcastChannel("alfasle_sync_channel");
        channel.postMessage({ type: "NEW_INSCRIPTION", inscription: newInscription });
        channel.close();
      } catch (_) {}

      // Direct Supabase Cloud persistence
      if (isSupabaseConfigured()) {
        supabase.from("inscriptions").upsert(mapInscriptionToRow(newInscription)).then();
      }

      // Asynchronous Full-Stack API persistence
      fetch("/api/inscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newInscription),
      }).catch((err) => console.warn("API inscription sync warning:", err));
    }

    // Update pending counter on class
    setClasses((cls) =>
      cls.map((c) =>
        c.id === finalClasseId ? { ...c, pendingCount: (c.pendingCount || 0) + 1 } : c
      )
    );

    // Create system notification for Super Admin and Director
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        userId: "u_super_admin_root",
        title: `Nouvelle préinscription (${data.role === "TEACHER" ? "👨‍🏫 Enseignant" : "🎓 Élève"})`,
        message: `${data.userName} a postulé pour ${finalClasseTitle} (${finalEtabName}). Dossier consultable dans l'établissement.`,
        type: "INSCRIPTION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `Votre demande de pré-inscription pour « ${finalClasseTitle} » a été enregistrée pour ${finalEtabName}.`,
      inscription: newInscription,
    };
  };

  // Activation de compte par confirmation Email et Définition du mot de passe
  const activateAccountWithPassword = (data: {
    emailOrToken: string;
    newPassword: string;
  }) => {
    const cleanSearch = data.emailOrToken.trim().toLowerCase();
    const targetIns = inscriptions.find(
      (i) =>
        i.id.toLowerCase() === cleanSearch ||
        i.userEmail.toLowerCase() === cleanSearch ||
        (i.activationToken && i.activationToken.toLowerCase() === cleanSearch)
    );

    const targetEmail = targetIns ? targetIns.userEmail.toLowerCase() : cleanSearch;
    let existingUser = users.find(
      (u) =>
        u.email.toLowerCase() === targetEmail ||
        (targetIns?.userId && u.id === targetIns.userId)
    );

    let activeUser: User;

    if (existingUser) {
      activeUser = {
        ...existingUser,
        phone: targetIns?.userPhone || existingUser.phone,
        password: data.newPassword,
        role: targetIns?.role || existingUser.role,
        etablissementId: targetIns?.etablissementId || existingUser.etablissementId,
        etablissementName: targetIns?.etablissementName || existingUser.etablissementName,
        classeId: targetIns?.classeId || existingUser.classeId,
        classeTitle: targetIns?.classeTitle || existingUser.classeTitle,
      };
      setUsers((prev) => prev.map((u) => (u.id === activeUser.id ? activeUser : u)));
    } else {
      const generatedUsername =
        targetEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") ||
        `user${Date.now().toString().slice(-4)}`;

      activeUser = {
        id: targetIns?.userId || `u_act_${Date.now()}`,
        name: targetIns?.userName || targetEmail.split("@")[0],
        email: targetEmail,
        phone: targetIns?.userPhone,
        username: generatedUsername,
        password: data.newPassword,
        role: targetIns?.role || "STUDENT",
        etablissementId: targetIns?.etablissementId || "etab_1793080550879",
        etablissementName: targetIns?.etablissementName || "جامعة النور الإسلامية",
        classeId: targetIns?.classeId,
        classeTitle: targetIns?.classeTitle,
        bio:
          targetIns?.diplomaOrBio ||
          (targetIns?.role === "TEACHER"
            ? `Professeur de ${targetIns.subject || "matières scientifiques"}`
            : `Élève inscrit dans la classe ${targetIns?.classeTitle || ""}`),
        avatarUrl:
          targetIns?.role === "TEACHER"
            ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
            : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date().toISOString(),
      };
      setUsers((prev) => [activeUser, ...prev]);
    }

    // Update matching inscription to approved and confirmed
    if (targetIns) {
      const updatedIns: Inscription = {
        ...targetIns,
        userId: activeUser.id,
        status: "APPROVED",
        emailConfirmed: true,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "Activation Email",
      };

      setInscriptions((prev) =>
        prev.map((ins) => (ins.id === targetIns.id ? updatedIns : ins))
      );

      if (isSupabaseConfigured()) {
        supabase
          .from("inscriptions")
          .upsert(mapInscriptionToRow(updatedIns))
          .then();
      }

      // Update class counter
      setClasses((cls) =>
        cls.map((c) => {
          if (c.id === targetIns.classeId) {
            return {
              ...c,
              enrolledCount:
                targetIns.role === "STUDENT" ? (c.enrolledCount || 0) + 1 : c.enrolledCount,
              pendingCount: Math.max(0, (c.pendingCount || 1) - 1),
              teacherName: targetIns.role === "TEACHER" ? targetIns.userName : c.teacherName,
              teacherId: targetIns.role === "TEACHER" ? activeUser.id : c.teacherId,
            };
          }
          return c;
        })
      );
    }

    // Connect user directly
    setCurrentUser(activeUser);

    // Notification
    setNotifications((n) => [
      {
        id: `notif_${Date.now()}`,
        userId: activeUser.id,
        title: "Compte activé avec succès 🎉",
        message: `Bienvenue ${activeUser.name} ! Votre mot de passe personnalisé est configuré et votre espace est prêt.`,
        type: "SYSTEM",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...n,
    ]);

    return {
      success: true,
      message: `Félicitations ${activeUser.name} ! Votre compte a été activé avec succès.`,
      user: activeUser,
    };
  };

  // Modification du mot de passe utilisateur
  const changeUserPassword = (data: {
    userId: string;
    currentPassword?: string;
    newPassword: string;
  }) => {
    const targetUser = users.find((u) => u.id === data.userId);
    if (!targetUser) {
      return { success: false, message: "Utilisateur introuvable." };
    }

    if (
      data.currentPassword &&
      targetUser.password &&
      targetUser.password !== data.currentPassword &&
      currentUser.role !== "SUPER_ADMIN"
    ) {
      return { success: false, message: "L'ancien mot de passe saisi est incorrect." };
    }

    const updatedUser: User = {
      ...targetUser,
      password: data.newPassword,
    };

    setUsers((prev) => prev.map((u) => (u.id === data.userId ? updatedUser : u)));
    if (currentUser.id === data.userId) {
      setCurrentUser(updatedUser);
    }

    // Notification
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        userId: targetUser.id,
        title: "Mot de passe modifié 🔒",
        message: "Votre mot de passe a été mis à jour avec succès.",
        type: "SYSTEM",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return { success: true, message: "Votre mot de passe a été modifié avec succès !" };
  };

  const approveInscription = (inscriptionId: string) => {
    const targetIns = inscriptions.find((i) => i.id === inscriptionId);
    if (!targetIns) return;

    // 1. If user account does not exist, create it automatically with the chosen class; if it exists, assign the chosen class!
    const existingUser = users.find(
      (u) =>
        u.email.toLowerCase() === targetIns.userEmail.toLowerCase() ||
        (targetIns.userId && u.id === targetIns.userId)
    );

    let createdUserId = existingUser?.id || targetIns.userId || `u_cand_${Date.now()}`;

    if (!existingUser) {
      const generatedUsername = targetIns.userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || `user${Date.now().toString().slice(-4)}`;
      const newUser: User = {
        id: createdUserId,
        name: targetIns.userName,
        email: targetIns.userEmail.toLowerCase(),
        phone: targetIns.userPhone,
        username: generatedUsername,
        password: "Madouu1966@",
        role: targetIns.role || "STUDENT",
        etablissementId: targetIns.etablissementId,
        etablissementName: targetIns.etablissementName,
        classeId: targetIns.classeId,
        classeTitle: targetIns.classeTitle,
        bio: targetIns.diplomaOrBio || targetIns.motivation || (targetIns.role === "TEACHER" ? `Enseignant de ${targetIns.subject || "matières scientifiques"}` : `Élève inscrit dans la classe ${targetIns.classeTitle}`),
        avatarUrl: targetIns.userAvatar || (targetIns.role === "TEACHER" ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"),
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);
    } else {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === existingUser.id
            ? {
                ...u,
                classeId: targetIns.classeId || u.classeId,
                classeTitle: targetIns.classeTitle || u.classeTitle,
                etablissementId: targetIns.etablissementId || u.etablissementId,
                etablissementName: targetIns.etablissementName || u.etablissementName,
              }
            : u
        )
      );
    }

    const updatedIns: Inscription = {
      ...targetIns,
      userId: createdUserId,
      status: "APPROVED",
      emailConfirmed: true,
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser.name || "Super Admin",
    };

    // 2. Update inscription state
    setInscriptions((prev) =>
      prev.map((ins) => (ins.id === inscriptionId ? updatedIns : ins))
    );

    // 3. Update class counters & teacher assignment
    setClasses((cls) =>
      cls.map((c) => {
        if (c.id === targetIns.classeId) {
          return {
            ...c,
            enrolledCount: targetIns.role === "STUDENT" ? (c.enrolledCount || 0) + 1 : c.enrolledCount,
            pendingCount: Math.max(0, (c.pendingCount || 1) - 1),
            teacherName: targetIns.role === "TEACHER" ? targetIns.userName : c.teacherName,
            teacherId: targetIns.role === "TEACHER" && createdUserId ? createdUserId : c.teacherId,
          };
        }
        return c;
      })
    );

    // 4. Send Confirmation Notifications
    setNotifications((n) => [
      {
        id: `notif_${Date.now()}`,
        userId: createdUserId || "u_super_admin_root",
        title: "Préinscription validée par le Super Admin 🎉",
        message: `Félicitations ${targetIns.userName} ! Votre compte ${targetIns.role === "TEACHER" ? "Enseignant" : "Élève"} est maintenant actif sur ${targetIns.classeTitle}. Vos identifiants de connexion ont été activés (Mot de passe: Madouu1966@).`,
        type: "INSCRIPTION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...n,
    ]);

    // 5. Cloud Supabase Persistence
    if (isSupabaseConfigured()) {
      supabase
        .from("inscriptions")
        .upsert(mapInscriptionToRow(updatedIns))
        .then();
    }
  };

  const rejectInscription = (inscriptionId: string) => {
    setInscriptions((prev) =>
      prev.map((ins) => {
        if (ins.id === inscriptionId) {
          setClasses((cls) =>
            cls.map((c) =>
              c.id === ins.classeId
                ? { ...c, pendingCount: Math.max(0, (c.pendingCount || 1) - 1) }
                : c
            )
          );
          return {
            ...ins,
            status: "REJECTED",
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser.name || "Super Admin",
          };
        }
        return ins;
      })
    );

    if (isSupabaseConfigured()) {
      supabase
        .from("inscriptions")
        .update({
          status: "REJECTED",
          reviewed_at: new Date().toISOString(),
          reviewed_by: currentUser.name || "Super Admin",
        })
        .eq("id", inscriptionId)
        .then();
    }
  };

  // Courses
  const createCourse = (newCourseData: Omit<Cours, "id" | "publishedAt">) => {
    const newCourse: Cours = {
      ...newCourseData,
      id: `crs_${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    setCourses((prev) => [...prev, newCourse]);

    setClasses((cls) =>
      cls.map((c) =>
        c.id === newCourseData.classeId
          ? { ...c, coursesCount: (c.coursesCount || 0) + 1 }
          : c
      )
    );

    if (isSupabaseConfigured()) {
      supabase
        .from("courses")
        .upsert({
          id: newCourse.id,
          classe_id: newCourse.classeId,
          chapter_title: newCourse.chapterTitle || "Module Général",
          title: newCourse.title,
          summary: newCourse.summary || "",
          content: newCourse.content || "",
          display_order: newCourse.order || 1,
          status: newCourse.status || "PUBLISHED",
          discipline: newCourse.discipline || "",
          teacher_name: newCourse.teacherName || "",
          pdf_url: newCourse.pdfUrl || "",
          pdf_name: newCourse.pdfName || "",
          video_url: newCourse.video?.streamUrl || "",
          video_duration: newCourse.video?.durationMinutes || 0,
          resources: newCourse.resources || [],
          published_at: newCourse.publishedAt,
        })
        .then();
    }
  };

  const updateCourse = (id: string, data: Partial<Cours>) => {
    setCourses((prev) => {
      const next = prev.map((crs) => (crs.id === id ? { ...crs, ...data } : crs));
      const target = next.find((crs) => crs.id === id);
      if (target && isSupabaseConfigured()) {
        supabase
          .from("courses")
          .upsert({
            id: target.id,
            classe_id: target.classeId,
            chapter_title: target.chapterTitle || "Module Général",
            title: target.title,
            summary: target.summary || "",
            content: target.content || "",
            display_order: target.order || 1,
            status: target.status || "PUBLISHED",
            discipline: target.discipline || "",
            teacher_name: target.teacherName || "",
            pdf_url: target.pdfUrl || "",
            pdf_name: target.pdfName || "",
            video_url: target.video?.streamUrl || "",
            video_duration: target.video?.durationMinutes || 0,
            resources: target.resources || [],
            published_at: target.publishedAt,
          })
          .then();
      }
      return next;
    });
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((crs) => crs.id !== id));
    if (isSupabaseConfigured()) {
      supabase.from("courses").delete().eq("id", id).then();
    }
  };

  // Assignments
  const createAssignment = (newAssignmentData: Omit<Devoir, "id" | "createdAt" | "submissionsCount" | "gradedCount">) => {
    if (currentUser.role === "STUDENT") {
      console.warn("Action interdite : Un élève ne peut pas créer de devoir.");
      return;
    }
    const newAssignment: Devoir = {
      ...newAssignmentData,
      id: `dev_${Date.now()}`,
      createdAt: new Date().toISOString(),
      submissionsCount: 0,
      gradedCount: 0,
    };
    setAssignments((prev) => [newAssignment, ...prev]);

    setClasses((cls) =>
      cls.map((c) =>
        c.id === newAssignmentData.classeId
          ? { ...c, assignmentsCount: (c.assignmentsCount || 0) + 1 }
          : c
      )
    );

    if (isSupabaseConfigured()) {
      supabase
        .from("assignments")
        .upsert(mapDevoirToRow(newAssignment))
        .then(
          ({ error }: any) => {
            if (error) console.error("Erreur sauvegarde devoir Supabase:", error);
          },
          (err: any) => console.error("Erreur réseau Supabase devoir:", err)
        );
    }
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    if (isSupabaseConfigured()) {
      supabase
        .from("assignments")
        .delete()
        .eq("id", id)
        .then(
          ({ error }: any) => {
            if (error) console.error("Erreur suppression devoir Supabase:", error);
          },
          (err: any) => console.error("Erreur réseau Supabase suppression:", err)
        );
    }
  };

  // Submissions & Grading
  const submitAssignment = (devoirId: string, content: string, attachmentName?: string, attachmentUrl?: string) => {
    const assignment = assignments.find((a) => a.id === devoirId);
    if (!assignment) return;

    const targetClass = classes.find((c) => c.id === assignment.classeId);

    const isLate = new Date() > new Date(assignment.dueDate);

    const newSub: Soumission = {
      id: `sub_${Date.now()}`,
      devoirId,
      devoirTitle: assignment.title,
      classeId: assignment.classeId,
      classeTitle: targetClass?.title || "Classe",
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentAvatar: currentUser.avatarUrl,
      content,
      attachmentName: attachmentName || "devoir_rendu.pdf",
      attachmentUrl: attachmentUrl || "#",
      submittedAt: new Date().toISOString(),
      status: isLate ? "LATE" : "SUBMITTED",
    };

    setSubmissions((prev) => [newSub, ...prev]);

    // Update assignment counter
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === devoirId
          ? { ...a, submissionsCount: (a.submissionsCount || 0) + 1 }
          : a
      )
    );

    // Notify teacher
    if (targetClass) {
      setNotifications((n) => [
        {
          id: `notif_${Date.now()}`,
          userId: targetClass.teacherId,
          title: "Nouveau devoir soumis 📝",
          message: `${currentUser.name} a déposé son travail pour « ${assignment.title} ».`,
          type: "ASSIGNMENT",
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        ...n,
      ]);
    }
  };

  const gradeSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.id === submissionId) {
          const correction: Correction = {
            id: `cor_${Date.now()}`,
            soumissionId: sub.id,
            graderId: currentUser.id,
            graderName: currentUser.name,
            score,
            maxScore: 20,
            feedback,
            gradedAt: new Date().toISOString(),
          };

          // Update assignment graded counter
          setAssignments((as) =>
            as.map((a) =>
              a.id === sub.devoirId
                ? { ...a, gradedCount: (a.gradedCount || 0) + 1 }
                : a
            )
          );

          // Notify student
          setNotifications((n) => [
            {
              id: `notif_${Date.now()}`,
              userId: sub.studentId,
              title: "Devoir corrigé et noté 🎓",
              message: `Votre note pour « ${sub.devoirTitle} » est de ${score}/20.`,
              type: "GRADE",
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...n,
          ]);

          return {
            ...sub,
            status: "GRADED",
            correction,
          };
        }
        return sub;
      })
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <StoreContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        switchRole,
        createUser,
        updateUser,
        deleteUser,
        etablissements,
        createEtablissement,
        updateEtablissement,
        deleteEtablissement,
        classes,
        createClass,
        updateClass,
        deleteClass,
        archiveClass,
        purgeDemoClasses,
        inscriptions,
        applyToClass,
        submitPreRegistration,
        joinClassByCode,
        approveInscription,
        rejectInscription,
        courses,
        createCourse,
        updateCourse,
        deleteCourse,
        assignments,
        createAssignment,
        deleteAssignment,
        submissions,
        submitAssignment,
        gradeSubmission,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        activateAccountWithPassword,
        changeUserPassword,
        theme,
        toggleTheme,
        resetStoreToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
