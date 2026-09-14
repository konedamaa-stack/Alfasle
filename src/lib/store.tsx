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
  archiveClass: (id: string) => void;

  // Inscriptions & Pré-inscriptions
  inscriptions: Inscription[];
  applyToClass: (classeId: string, motivation?: string) => void;
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
  }) => { success: boolean; message: string; inscription: Inscription };
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
  submitAssignment: (devoirId: string, content: string, attachmentName?: string) => void;
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
const STORAGE_PREFIX = "alfasle_v7_";

function cleanLegacyStorage() {
  if (typeof window !== "undefined") {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          key.startsWith("alfasle") &&
          !key.startsWith(STORAGE_PREFIX) &&
          key !== "alfasle_theme"
        ) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {
      console.error("Erreur nettoyage legacy localStorage:", e);
    }
  }
}

// Run legacy storage clean immediately
cleanLegacyStorage();

function loadInitialData<T extends { id: string }>(suffix: string, initialData: T[]): T[] {
  const key = `${STORAGE_PREFIX}${suffix}`;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out deleted establishments and related records
          const filteredSaved = parsed.filter((item: any) => {
            const id = (item.id || "").toLowerCase();
            const name = (item.name || item.title || item.userName || "").toLowerCase();
            const email = (item.email || item.userEmail || "").toLowerCase();
            const subdomain = (item.subdomain || "").toLowerCase();
            const etabId = (item.etablissementId || "").toLowerCase();
            const desc = (item.description || item.bio || item.motivation || "").toLowerCase();

            const isDeleted =
              id.includes("raya") ||
              id.includes("arqam") ||
              id.includes("tawhid") ||
              id.includes("quran") ||
              id.includes("coran") ||
              id.includes("lycee_excellence") ||
              name.includes("raya") ||
              name.includes("arqam") ||
              name.includes("tawhid") ||
              name.includes("djibril") ||
              name.includes("quran") ||
              name.includes("coran") ||
              name.includes("lycée d'excellence") ||
              name.includes("lycee d'excellence") ||
              name.includes("قرآن") ||
              name.includes("القرآن") ||
              name.includes("تعليم القرآن") ||
              name.includes("توحيد") ||
              desc.includes("قرآن") ||
              desc.includes("القرآن") ||
              desc.includes("تعليم القرآن") ||
              email.includes("raya") ||
              email.includes("arqam") ||
              email.includes("djibril") ||
              email.includes("quran") ||
              email.includes("coran") ||
              email.includes("tawhid") ||
              subdomain.includes("raya") ||
              subdomain.includes("arqam") ||
              subdomain.includes("tawhid") ||
              subdomain.includes("quran") ||
              subdomain.includes("coran") ||
              subdomain.includes("lycee-excellence") ||
              etabId.includes("raya") ||
              etabId.includes("arqam") ||
              etabId.includes("tawhid") ||
              etabId.includes("quran") ||
              etabId.includes("coran") ||
              etabId.includes("lycee_excellence");

            return !isDeleted;
          });

          const existingIds = new Set(filteredSaved.map((item: T) => item.id));
          const missingFromInitial = initialData.filter((item) => !existingIds.has(item.id));
          let merged = [...filteredSaved, ...missingFromInitial];

          // Auto-sync Dr. Mahamadou DIAWARA
          if (suffix === "users") {
            merged = (merged as unknown as User[]).map((u) => {
              if (u.id === "u_admin_diawara" || u.id === "u_admin_excellence" || u.username === "diawara" || u.email === "diawara@gmail.com") {
                return {
                  ...u,
                  id: "u_admin_diawara",
                  name: "Dr. Mahamadou DIAWARA (Directeur)",
                  username: "diawara",
                  email: "diawara@gmail.com",
                  password: u.password || "Madouu1966@",
                  role: "ADMIN" as const,
                  bio: "Directeur & Administrateur Principal du Groupe Scolaire AlFasle.",
                  etablissementId: "etab_gs_alfasle",
                  etablissementName: "Groupe Scolaire AlFasle",
                };
              }
              return u;
            }) as unknown as T[];
          }

          if (suffix === "etablissements") {
            merged = (merged as unknown as Etablissement[]).map((e) => {
              if (e.id === "etab_gs_alfasle" || e.id === "etab_lycee_excellence") {
                return {
                  ...e,
                  id: "etab_gs_alfasle",
                  name: "Groupe Scolaire AlFasle",
                  subdomain: "gs-alfasle",
                  city: "Abidjan",
                  country: "Côte d'Ivoire",
                  directorName: "Dr. Mahamadou DIAWARA",
                  directorEmail: "diawara@gmail.com",
                };
              }
              return e;
            }) as unknown as T[];
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("alfasle_theme") as "dark" | "light";
      if (savedTheme === "light" || savedTheme === "dark") return savedTheme;
    }
    return "dark";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      if (typeof window !== "undefined") {
        localStorage.setItem("alfasle_theme", next);
        document.documentElement.setAttribute("data-theme", next);
        if (next === "light") {
          document.documentElement.classList.add("light");
          document.documentElement.classList.remove("dark");
        } else {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "light") {
        document.documentElement.classList.add("light");
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      }
    }
  }, [theme]);

  const [users, setUsers] = useState<User[]>(() => loadInitialData("users", initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]); // Default: Dr. Mahamadou DIAWARA (Directeur)
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

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_PREFIX}users`, JSON.stringify(users));
      localStorage.setItem(`${STORAGE_PREFIX}etablissements`, JSON.stringify(etablissements));
      localStorage.setItem(`${STORAGE_PREFIX}classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_PREFIX}inscriptions`, JSON.stringify(inscriptions));
      localStorage.setItem(`${STORAGE_PREFIX}courses`, JSON.stringify(courses));
      localStorage.setItem(`${STORAGE_PREFIX}assignments`, JSON.stringify(assignments));
      localStorage.setItem(`${STORAGE_PREFIX}submissions`, JSON.stringify(submissions));
      localStorage.setItem(`${STORAGE_PREFIX}notifications`, JSON.stringify(notifications));
    }
  }, [users, etablissements, classes, inscriptions, courses, assignments, submissions, notifications]);

  const resetStoreToDefaults = () => {
    if (typeof window !== "undefined") {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("alfasle")) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.error("Erreur reset localStorage:", e);
      }
    }
    setUsers(initialUsers);
    setEtablissements(initialEtablissements);
    setClasses(initialClasses);
    setInscriptions(initialInscriptions);
    setCourses(initialCourses);
    setAssignments(initialAssignments);
    setSubmissions(initialSubmissions);
    setNotifications(initialNotifications);
    setCurrentUser(initialUsers[1]); // Dr. Mahamadou DIAWARA
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
    const newUser: User = {
      ...userData,
      id: `u_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updated = { ...u, ...data };
          if (currentUser.id === id) {
            setCurrentUser(updated);
          }
          return updated;
        }
        return u;
      })
    );
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Etablissement Management
  const createEtablissement = (data: Omit<Etablissement, "id" | "createdAt" | "classesCount" | "studentsCount">) => {
    const etabId = `etab_${Date.now()}`;
    const starterClassId = `cls_${Date.now()}`;

    // 1. Create starter class for this new school
    const starterClass: Classe = {
      id: starterClassId,
      classCode: `${data.code.replace(/[^A-Z0-9]/gi, "").substring(0, 4).toUpperCase()}-101`,
      etablissementId: etabId,
      etablissementName: data.name,
      title: `Tronc Commun & Pédagogie - ${data.name}`,
      description: `Classe inaugurale de l'établissement ${data.name}. Cours, devoirs et ressources partagés.`,
      level: "Tous Niveaux",
      category: "Général",
      capacity: data.maxStudentsQuota || 250,
      enrollmentMode: "OPEN",
      status: "ACTIVE",
      teacherId: "u_teacher_sarah",
      teacherName: "Prof. Sarah Mansouri",
      coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      enrolledCount: 0,
      pendingCount: 0,
      coursesCount: 1,
      assignmentsCount: 0,
    };

    const newEtab: Etablissement = {
      ...data,
      id: etabId,
      classesCount: 1,
      studentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    setEtablissements((prev) => [newEtab, ...prev]);
    setClasses((prev) => [starterClass, ...prev]);

    // 2. If director has email, provision Director user in system
    if (data.directorEmail && data.directorName) {
      const directorPass = data.directorPassword?.trim() || "Madouu1966@";
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
        message: `L'établissement « ${newEtab.name} » (.${newEtab.subdomain}.alfasle.xyz) est maintenant actif avec sa classe inaugurale.`,
        type: "SYSTEM",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    return newEtab;
  };

  const updateEtablissement = (id: string, data: Partial<Etablissement>) => {
    setEtablissements((prev) => prev.map((e) => (e.id === id ? { ...e, ...data } : e)));

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
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const archiveClass = (id: string) => {
    setClasses((prev) => prev.map((c) => (c.id === id ? { ...c, status: "ARCHIVED" } : c)));
  };

  // Inscriptions
  const applyToClass = (classeId: string, motivation?: string) => {
    const targetClass = classes.find((c) => c.id === classeId);
    if (!targetClass) return;

    // Check if already applied
    const existing = inscriptions.find((i) => i.classeId === classeId && i.userId === currentUser.id);
    if (existing) return;

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
    const targetEtab = etablissements.find((e) => e.id === data.etablissementId);
    const targetClass = classes.find((c) => c.id === data.classeId);

    const activationToken = `act_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const newInscription: Inscription = {
      id: `ins_${Date.now()}`,
      userName: data.userName.trim(),
      userEmail: data.userEmail.trim().toLowerCase(),
      userPhone: data.userPhone?.trim(),
      userAvatar:
        data.role === "TEACHER"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: data.role,
      etablissementId: data.etablissementId,
      etablissementName: targetEtab?.name || "Établissement AlFasle",
      classeId: data.classeId,
      classeTitle: targetClass?.title || "Classe AlFasle",
      subject: data.subject?.trim(),
      diplomaOrBio: data.diplomaOrBio?.trim(),
      status: "PENDING",
      emailConfirmed: false,
      activationToken,
      motivation: data.motivation?.trim() || "Candidature en ligne en attente de validation Super Admin",
      appliedAt: new Date().toISOString(),
    };

    setInscriptions((prev) => [newInscription, ...prev]);

    // Update pending counter on class
    setClasses((cls) =>
      cls.map((c) =>
        c.id === data.classeId ? { ...c, pendingCount: (c.pendingCount || 0) + 1 } : c
      )
    );

    // Create system notification for Super Admin
    setNotifications((prev) => [
      {
        id: `notif_${Date.now()}`,
        userId: "u_super_admin_root",
        title: `Nouvelle préinscription (${data.role === "TEACHER" ? "👨‍🏫 Enseignant" : "🎓 Élève"})`,
        message: `${data.userName} a postulé pour ${targetClass?.title || "une classe"} (${targetEtab?.name || "Campus"}). Email de confirmation envoyé.`,
        type: "INSCRIPTION",
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return {
      success: true,
      message: `Votre demande de pré-inscription pour « ${targetClass?.title || "la classe"} » a été enregistrée. Un email de confirmation a été envoyé à ${data.userEmail}.`,
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
        i.userEmail.toLowerCase() === cleanSearch ||
        (i.activationToken && i.activationToken.toLowerCase() === cleanSearch)
    );

    const targetEmail = targetIns ? targetIns.userEmail.toLowerCase() : cleanSearch;
    let existingUser = users.find((u) => u.email.toLowerCase() === targetEmail);

    let activeUser: User;

    if (existingUser) {
      activeUser = {
        ...existingUser,
        password: data.newPassword,
        role: targetIns?.role || existingUser.role,
        etablissementId: targetIns?.etablissementId || existingUser.etablissementId,
        etablissementName: targetIns?.etablissementName || existingUser.etablissementName,
      };
      setUsers((prev) => prev.map((u) => (u.id === activeUser.id ? activeUser : u)));
    } else {
      const generatedUsername =
        targetEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") ||
        `user${Date.now().toString().slice(-4)}`;

      activeUser = {
        id: `u_act_${Date.now()}`,
        name: targetIns?.userName || targetEmail.split("@")[0],
        email: targetEmail,
        username: generatedUsername,
        password: data.newPassword,
        role: targetIns?.role || "STUDENT",
        etablissementId: targetIns?.etablissementId || "etab_gs_alfasle",
        etablissementName: targetIns?.etablissementName || "Groupe Scolaire AlFasle",
        bio:
          targetIns?.diplomaOrBio ||
          (targetIns?.role === "TEACHER"
            ? `Professeur de ${targetIns.subject || "matières scientifiques"}`
            : "Élève actif"),
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
      setInscriptions((prev) =>
        prev.map((ins) =>
          ins.id === targetIns.id
            ? {
                ...ins,
                userId: activeUser.id,
                status: "APPROVED",
                emailConfirmed: true,
                reviewedAt: new Date().toISOString(),
                reviewedBy: "Activation Email",
              }
            : ins
        )
      );

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

    // 1. If user account does not exist, create it automatically!
    const existingUser = users.find(
      (u) => u.email.toLowerCase() === targetIns.userEmail.toLowerCase()
    );

    let createdUserId = existingUser?.id;

    if (!existingUser) {
      const generatedUsername = targetIns.userEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || `user${Date.now().toString().slice(-4)}`;
      const newUser: User = {
        id: `u_cand_${Date.now()}`,
        name: targetIns.userName,
        email: targetIns.userEmail.toLowerCase(),
        username: generatedUsername,
        password: "Madouu1966@",
        role: targetIns.role || "STUDENT",
        etablissementId: targetIns.etablissementId,
        etablissementName: targetIns.etablissementName,
        bio: targetIns.diplomaOrBio || targetIns.motivation || (targetIns.role === "TEACHER" ? `Enseignant de ${targetIns.subject || "matières scientifiques"}` : "Élève validé"),
        avatarUrl: targetIns.userAvatar || (targetIns.role === "TEACHER" ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150" : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"),
        createdAt: new Date().toISOString(),
      };

      setUsers((prev) => [newUser, ...prev]);
      createdUserId = newUser.id;
    }

    // 2. Update inscription state
    setInscriptions((prev) =>
      prev.map((ins) => {
        if (ins.id === inscriptionId) {
          return {
            ...ins,
            userId: createdUserId,
            status: "APPROVED",
            emailConfirmed: true,
            reviewedAt: new Date().toISOString(),
            reviewedBy: currentUser.name || "Super Admin",
          };
        }
        return ins;
      })
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
  };

  const updateCourse = (id: string, data: Partial<Cours>) => {
    setCourses((prev) => prev.map((crs) => (crs.id === id ? { ...crs, ...data } : crs)));
  };

  const deleteCourse = (id: string) => {
    setCourses((prev) => prev.filter((crs) => crs.id !== id));
  };

  // Assignments
  const createAssignment = (newAssignmentData: Omit<Devoir, "id" | "createdAt" | "submissionsCount" | "gradedCount">) => {
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
  };

  const deleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  // Submissions & Grading
  const submitAssignment = (devoirId: string, content: string, attachmentName?: string) => {
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
      attachmentUrl: "#",
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
        archiveClass,
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
