"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Etablissement, Classe, User, UserRole, EnrollmentMode, ClassStatus } from "@/types";
import { ValidationQueue } from "@/components/inscriptions/ValidationQueue";
import { ConfirmModal, ConfirmVariant } from "@/components/common/ConfirmModal";
import { useToast } from "@/lib/toast-context";
import {
  School,
  PlusCircle,
  FolderKanban,
  Users,
  MapPin,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Search,
  CheckCircle2,
  X,
  Building2,
  Lock,
  Globe2,
  Server,
  Zap,
  Power,
  Trash2,
  ExternalLink,
  Award,
  Layers,
  UserCheck,
  GraduationCap,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff,
  Edit,
  Check,
  Copy,
  AlertCircle,
  Archive,
  ArrowRight,
  Filter,
  UserPlus,
  RefreshCw,
  BarChart2,
  BookMarked,
  Layers3,
} from "lucide-react";

interface SuperAdminDashboardProps {
  initialTab?: "ETABLISSEMENTS" | "CLASSES" | "USERS" | "INSCRIPTIONS" | "SYSTEM";
  onOpenCreateClassForSchool?: (etablissementId: string) => void;
  onSelectClassForCourses?: (classId: string) => void;
}

export function SuperAdminDashboard({
  initialTab,
  onOpenCreateClassForSchool,
  onSelectClassForCourses,
}: SuperAdminDashboardProps) {
  const {
    etablissements,
    classes,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
    createClass,
    updateClass,
    deleteClass,
    archiveClass,
    users,
    createUser,
    updateUser,
    deleteUser,
    currentUser,
    inscriptions,
    resetStoreToDefaults,
  } = useStore();
  const { toast } = useToast();

  // Active top-level Tab (default: ETABLISSEMENTS for school/class management focus)
  const [activeTab, setActiveTab] = useState<
    "ETABLISSEMENTS" | "CLASSES" | "USERS" | "INSCRIPTIONS" | "SYSTEM"
  >(initialTab || "ETABLISSEMENTS");

  // --- SCHOOLS MANAGEMENT STATE ---
  const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  // New School Wizard Form State
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newSubdomain, setNewSubdomain] = useState("");
  const [newType, setNewType] = useState<Etablissement["type"]>("LYCEE");
  const [newCity, setNewCity] = useState("Abidjan");
  const [newCountry, setNewCountry] = useState("Côte d'Ivoire");
  const [newAddress, setNewAddress] = useState("");
  const [newDirectorName, setNewDirectorName] = useState("");
  const [newDirectorEmail, setNewDirectorEmail] = useState("");
  const [newDirectorPassword, setNewDirectorPassword] = useState("Madouu1966@");
  const [showDirectorPassword, setShowDirectorPassword] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newPlan, setNewPlan] = useState<"STANDARD" | "PREMIUM" | "ENTERPRISE">("ENTERPRISE");
  const [newMaxStudents, setNewMaxStudents] = useState(500);
  const [newMaxClasses, setNewMaxClasses] = useState(25);
  const [newDesc, setNewDesc] = useState("");
  const [newLogoUrl, setNewLogoUrl] = useState(
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80"
  );

  // --- USERS MANAGEMENT STATE ---
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserRole, setSelectedUserRole] = useState<string>("ALL");
  const [selectedUserSchool, setSelectedUserSchool] = useState<string>("ALL");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("STUDENT");
  const [editEtabId, setEditEtabId] = useState("");
  const [editBio, setEditBio] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Edit School Modal State
  const [editingEtab, setEditingEtab] = useState<Etablissement | null>(null);
  const [isEditEtabModalOpen, setIsEditEtabModalOpen] = useState(false);
  const [editEtabName, setEditEtabName] = useState("");
  const [editEtabCode, setEditEtabCode] = useState("");
  const [editEtabSubdomain, setEditEtabSubdomain] = useState("");
  const [editEtabType, setEditEtabType] = useState<"LYCEE" | "COLLEGE" | "UNIVERSITE" | "INSTITUT" | "ECOLE_PRIMAIRE">("LYCEE");
  const [editEtabCity, setEditEtabCity] = useState("");
  const [editEtabCountry, setEditEtabCountry] = useState("");
  const [editEtabAddress, setEditEtabAddress] = useState("");
  const [editEtabPhone, setEditEtabPhone] = useState("");
  const [editEtabDirectorName, setEditEtabDirectorName] = useState("");
  const [editEtabDirectorEmail, setEditEtabDirectorEmail] = useState("");
  const [editEtabDirectorPassword, setEditEtabDirectorPassword] = useState("");
  const [showEditDirectorPassword, setShowEditDirectorPassword] = useState(false);
  const [editEtabPlan, setEditEtabPlan] = useState<"STANDARD" | "PREMIUM" | "ENTERPRISE">("ENTERPRISE");
  const [editEtabMaxStudents, setEditEtabMaxStudents] = useState(500);
  const [editEtabMaxClasses, setEditEtabMaxClasses] = useState(25);
  const [editEtabDesc, setEditEtabDesc] = useState("");

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserName, setCreateUserName] = useState("");
  const [createUserUsername, setCreateUserUsername] = useState("");
  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPassword, setCreateUserPassword] = useState("Madouu1966@");
  const [createUserRole, setCreateUserRole] = useState<UserRole>("STUDENT");
  const [createUserEtabId, setCreateUserEtabId] = useState(etablissements[0]?.id || "");
  const [createUserBio, setCreateUserBio] = useState("");

  // =========================================================================
  // --- CLASSES MANAGEMENT STATE (SUPER ADMIN) ---
  // =========================================================================
  const [classSearchQuery, setClassSearchQuery] = useState("");
  const [selectedClassEtabFilter, setSelectedClassEtabFilter] = useState<string>("ALL");
  const [selectedClassStatusFilter, setSelectedClassStatusFilter] = useState<string>("ALL");
  const [selectedClassLevelFilter, setSelectedClassLevelFilter] = useState<string>("ALL");

  // Create Class Modal State
  const [isSuperCreateClassOpen, setIsSuperCreateClassOpen] = useState(false);
  const [newClassEtabId, setNewClassEtabId] = useState(etablissements[0]?.id || "");
  const [newClassTitle, setNewClassTitle] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newClassTeacherId, setNewClassTeacherId] = useState("");
  const [newClassLevel, setNewClassLevel] = useState("Terminale");
  const [newClassCategory, setNewClassCategory] = useState("Sciences");
  const [newClassCapacity, setNewClassCapacity] = useState(35);
  const [newClassEnrollmentMode, setNewClassEnrollmentMode] = useState<EnrollmentMode>("OPEN");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [newClassCoverImage, setNewClassCoverImage] = useState(
    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
  );

  // Edit Class Modal State
  const [editingClass, setEditingClass] = useState<Classe | null>(null);
  const [editClassTitle, setEditClassTitle] = useState("");
  const [editClassCode, setEditClassCode] = useState("");
  const [editClassEtabId, setEditClassEtabId] = useState("");
  const [editClassTeacherId, setEditClassTeacherId] = useState("");
  const [editClassLevel, setEditClassLevel] = useState("");
  const [editClassCategory, setEditClassCategory] = useState("");
  const [editClassCapacity, setEditClassCapacity] = useState(35);
  const [editClassEnrollmentMode, setEditClassEnrollmentMode] = useState<EnrollmentMode>("OPEN");
  const [editClassStatus, setEditClassStatus] = useState<ClassStatus>("ACTIVE");
  const [editClassDescription, setEditClassDescription] = useState("");
  const [editClassCoverImage, setEditClassCoverImage] = useState("");

  // Viewing Students Modal State
  const [viewingClassStudents, setViewingClassStudents] = useState<Classe | null>(null);

  // Confirmation Modal State
  const [adminConfirmModal, setAdminConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Helper auto-code generator
  const handleGenerateClassCode = (etabId: string, levelVal: string, catVal: string) => {
    const etab = etablissements.find((e) => e.id === etabId) || etablissements[0];
    const prefix = (etab?.code || "AF").replace(/[^A-Z0-9]/gi, "").substring(0, 4).toUpperCase();
    const cleanLevel = levelVal.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, "") || "CLS";
    const randNum = Math.floor(10 + Math.random() * 90);
    return `${prefix}-${cleanLevel}-${randNum}`;
  };

  const resetCreateClassForm = (presetEtabId?: string) => {
    const targetEtabId = presetEtabId || etablissements[0]?.id || "";
    setNewClassEtabId(targetEtabId);
    setNewClassTitle("");
    setNewClassLevel("Terminale");
    setNewClassCategory("Sciences");
    setNewClassCode(handleGenerateClassCode(targetEtabId, "Terminale", "Sciences"));
    const teacherForSchool =
      users.find((u) => u.role === "TEACHER" && (!targetEtabId || u.etablissementId === targetEtabId)) ||
      users.find((u) => u.role === "TEACHER") ||
      users[0];
    setNewClassTeacherId(teacherForSchool?.id || "");
    setNewClassCapacity(35);
    setNewClassEnrollmentMode("OPEN");
    setNewClassDescription("");
    setNewClassCoverImage("https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80");
  };

  const handleOpenSuperCreateClass = (presetEtabId?: string) => {
    resetCreateClassForm(presetEtabId);
    setIsSuperCreateClassOpen(true);
  };

  const handleCreateSuperClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTitle.trim()) return;

    const targetEtab = etablissements.find((et) => et.id === newClassEtabId) || etablissements[0];
    const targetTeacher = users.find((u) => u.id === newClassTeacherId);

    const generatedCode =
      newClassCode.trim().toUpperCase() ||
      handleGenerateClassCode(targetEtab?.id || "", newClassLevel, newClassCategory);

    createClass({
      title: newClassTitle.trim(),
      classCode: generatedCode,
      etablissementId: targetEtab?.id || etablissements[0]?.id || "etab_def",
      etablissementName: targetEtab?.name || "Établissement AlFasle",
      teacherId: targetTeacher?.id || currentUser.id,
      teacherName: targetTeacher?.name || currentUser.name,
      level: newClassLevel.trim() || "Général",
      category: newClassCategory.trim() || "Tronc Commun",
      capacity: newClassCapacity || 35,
      enrollmentMode: newClassEnrollmentMode,
      status: "ACTIVE",
      description:
        newClassDescription.trim() ||
        `Classe ${newClassTitle.trim()} rattachée à l'établissement ${targetEtab?.name}.`,
      coverImage: newClassCoverImage,
    });

    setIsSuperCreateClassOpen(false);
  };

  const handleOpenEditClass = (cls: Classe) => {
    setEditingClass(cls);
    setEditClassTitle(cls.title);
    setEditClassCode(cls.classCode);
    setEditClassEtabId(cls.etablissementId);
    setEditClassTeacherId(cls.teacherId);
    setEditClassLevel(cls.level);
    setEditClassCategory(cls.category);
    setEditClassCapacity(cls.capacity || 35);
    setEditClassEnrollmentMode(cls.enrollmentMode || "OPEN");
    setEditClassStatus(cls.status || "ACTIVE");
    setEditClassDescription(cls.description || "");
    setEditClassCoverImage(cls.coverImage || "");
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !editClassTitle.trim()) return;

    const targetEtab =
      etablissements.find((et) => et.id === editClassEtabId) ||
      etablissements.find((et) => et.id === editingClass.etablissementId);
    const targetTeacher = users.find((u) => u.id === editClassTeacherId);

    updateClass(editingClass.id, {
      title: editClassTitle.trim(),
      classCode: editClassCode.trim().toUpperCase(),
      etablissementId: targetEtab?.id || editingClass.etablissementId,
      etablissementName: targetEtab?.name || editingClass.etablissementName,
      teacherId: targetTeacher ? targetTeacher.id : editingClass.teacherId,
      teacherName: targetTeacher ? targetTeacher.name : editingClass.teacherName,
      level: editClassLevel.trim(),
      category: editClassCategory.trim(),
      capacity: editClassCapacity,
      enrollmentMode: editClassEnrollmentMode,
      status: editClassStatus,
      description: editClassDescription.trim(),
      coverImage: editClassCoverImage,
    });

    setEditingClass(null);
  };

  const handleDeleteClass = (cls: Classe) => {
    setAdminConfirmModal({
      isOpen: true,
      title: `Supprimer la classe « ${cls.title} » ?`,
      message: `Êtes-vous certain de vouloir supprimer définitivement la classe « ${cls.title} » (${cls.classCode}) de l'établissement « ${cls.etablissementName} » ? Cette action supprimera également les cours, devoirs et inscriptions associés.`,
      confirmLabel: "Supprimer la classe",
      variant: "danger",
      onConfirm: () => {
        deleteClass(cls.id);
        toast.success("Enregistrement effectué avec succès", `La classe « ${cls.title} » a été supprimée avec succès.`);
      },
    });
  };

  const handleToggleArchiveClass = (cls: Classe) => {
    if (cls.status === "ARCHIVED") {
      updateClass(cls.id, { status: "ACTIVE" });
    } else {
      archiveClass(cls.id);
    }
  };

  // Handlers for Schools
  const resetSchoolForm = () => {
    setFormStep(1);
    setNewName("");
    setNewCode("");
    setNewSubdomain("");
    setNewType("LYCEE");
    setNewCity("Abidjan");
    setNewCountry("Côte d'Ivoire");
    setNewAddress("");
    setNewDirectorName("");
    setNewDirectorEmail("");
    setNewDirectorPassword("Madouu1966@");
    setShowDirectorPassword(false);
    setNewPhone("");
    setNewPlan("ENTERPRISE");
    setNewMaxStudents(500);
    setNewMaxClasses(25);
    setNewDesc("");
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const generatedCode =
      newCode.trim().toUpperCase() ||
      `ALF-${newType.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;

    const autoSubdomain =
      newSubdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, "-") ||
      newName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    createEtablissement({
      name: newName,
      code: generatedCode,
      subdomain: autoSubdomain || `campus-${Date.now().toString().slice(-4)}`,
      type: newType,
      city: newCity,
      country: newCountry,
      address: newAddress || `${newCity}, ${newCountry}`,
      directorName: newDirectorName || "Direction de l'Établissement",
      directorEmail: newDirectorEmail || `direction@${autoSubdomain}.edu`,
      directorPassword: newDirectorPassword || "Madouu1966@",
      phone: newPhone || "+225 01 02 03 04",
      status: "ACTIVE",
      subscriptionPlan: newPlan,
      maxStudentsQuota: newMaxStudents,
      maxClassesQuota: newMaxClasses,
      description:
        newDesc ||
        `Établissement d'enseignement ${newType.toLowerCase()} rattaché au réseau AlFasle.`,
      logoUrl: newLogoUrl,
      coverImage:
        "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
    });

    setIsCreateModalOpen(false);
    resetSchoolForm();
  };

  const handleToggleStatus = (etab: Etablissement) => {
    const nextStatus = etab.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    updateEtablissement(etab.id, { status: nextStatus });
  };

  const handleOpenEditEtab = (etab: Etablissement) => {
    const dirUser = users.find(
      (u) =>
        (etab.directorEmail && u.email.toLowerCase() === etab.directorEmail.toLowerCase()) ||
        (u.etablissementId === etab.id && u.role === "ADMIN")
    );
    setEditingEtab(etab);
    setEditEtabName(etab.name);
    setEditEtabCode(etab.code);
    setEditEtabSubdomain(etab.subdomain);
    setEditEtabType(etab.type);
    setEditEtabCity(etab.city);
    setEditEtabCountry(etab.country);
    setEditEtabAddress(etab.address || "");
    setEditEtabPhone(etab.phone || "");
    setEditEtabDirectorName(etab.directorName || dirUser?.name || "");
    setEditEtabDirectorEmail(etab.directorEmail || dirUser?.email || "");
    setEditEtabDirectorPassword(dirUser?.password || etab.directorPassword || "Madouu1966@");
    setShowEditDirectorPassword(false);
    setEditEtabPlan(etab.subscriptionPlan || "ENTERPRISE");
    setEditEtabMaxStudents(etab.maxStudentsQuota || 500);
    setEditEtabMaxClasses(etab.maxClassesQuota || 25);
    setEditEtabDesc(etab.description || "");
    setIsEditEtabModalOpen(true);
  };

  const handleSaveEditEtab = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEtab) return;

    updateEtablissement(editingEtab.id, {
      name: editEtabName.trim(),
      code: editEtabCode.trim().toUpperCase(),
      subdomain: editEtabSubdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, "-"),
      type: editEtabType,
      city: editEtabCity.trim(),
      country: editEtabCountry.trim(),
      address: editEtabAddress.trim(),
      phone: editEtabPhone.trim(),
      directorName: editEtabDirectorName.trim(),
      directorEmail: editEtabDirectorEmail.trim(),
      directorPassword: editEtabDirectorPassword.trim(),
      subscriptionPlan: editEtabPlan,
      maxStudentsQuota: editEtabMaxStudents,
      maxClassesQuota: editEtabMaxClasses,
      description: editEtabDesc.trim(),
    });

    setIsEditEtabModalOpen(false);
  };

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    variant?: ConfirmVariant;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleDeleteSchool = (etabId: string, etabName: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Supprimer l'établissement « ${etabName} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement l'établissement « ${etabName} » ? Tous les comptes, classes et données associés seront définitivement effacés.`,
      confirmLabel: "Supprimer l'établissement",
      variant: "danger",
      onConfirm: () => {
        deleteEtablissement(etabId);
      },
    });
  };

  // Handlers for Users
  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditUsername(u.username || u.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
    setEditEmail(u.email);
    setEditPassword(u.password || "Madouu1966@");
    setEditRole(u.role);
    setEditEtabId(u.etablissementId || "");
    setEditBio(u.bio || "");
    setSaveSuccessMsg("");
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const targetSchool = etablissements.find((et) => et.id === editEtabId);

    updateUser(editingUser.id, {
      name: editName.trim(),
      username: editUsername.trim().toLowerCase(),
      email: editEmail.trim().toLowerCase(),
      password: editPassword,
      role: editRole,
      etablissementId: editEtabId || undefined,
      etablissementName: targetSchool ? targetSchool.name : undefined,
      bio: editBio,
    });

    setSaveSuccessMsg("Compte utilisateur mis à jour avec succès !");
    setTimeout(() => {
      setEditingUser(null);
      setSaveSuccessMsg("");
    }, 900);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUserName.trim() || !createUserEmail.trim()) return;

    const targetSchool = etablissements.find((et) => et.id === createUserEtabId);
    const autoUsername =
      createUserUsername.trim().toLowerCase() ||
      createUserName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    createUser({
      name: createUserName.trim(),
      username: autoUsername,
      email: createUserEmail.trim().toLowerCase(),
      password: createUserPassword || "Madouu1966@",
      role: createUserRole,
      etablissementId: createUserEtabId || undefined,
      etablissementName: targetSchool ? targetSchool.name : undefined,
      bio: createUserBio || `Compte ${createUserRole.toLowerCase()} créé par le Super Administrateur.`,
      avatarUrl:
        createUserRole === "STUDENT"
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
          : createUserRole === "TEACHER"
          ? "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
          : createUserRole === "PARENT"
          ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
          : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    });

    setIsCreateUserModalOpen(false);
    setCreateUserName("");
    setCreateUserUsername("");
    setCreateUserEmail("");
    setCreateUserPassword("Madouu1966@");
    setCreateUserBio("");
  };

  const handleDeleteUser = (u: User) => {
    if (u.id === "u_super_admin_root" || u.email === "konedamaa@gmail.com") {
      setAdminConfirmModal({
        isOpen: true,
        title: "Action impossible",
        message: "Impossible de supprimer le compte Super Admin Master principal.",
        confirmLabel: "Compris",
        variant: "info",
        onConfirm: () => {},
      });
      return;
    }
    setAdminConfirmModal({
      isOpen: true,
      title: `Supprimer le compte de « ${u.name} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte de « ${u.name} » (${u.email}) ? Cette action est irréversible.`,
      confirmLabel: "Supprimer le compte",
      variant: "danger",
      onConfirm: () => {
        deleteUser(u.id);
      },
    });
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered Lists
  const filteredEtabs = etablissements.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      e.city.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      e.code.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      (e.directorName && e.directorName.toLowerCase().includes(schoolSearchQuery.toLowerCase()));
    const matchesType = selectedType === "ALL" || e.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || (e.status || "ACTIVE") === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredUsers = users
    .filter((u) => {
      const cleanSearch = userSearchQuery.toLowerCase();
      const matchesSearch =
        u.name.toLowerCase().includes(cleanSearch) ||
        u.email.toLowerCase().includes(cleanSearch) ||
        (u.username && u.username.toLowerCase().includes(cleanSearch)) ||
        (u.etablissementName && u.etablissementName.toLowerCase().includes(cleanSearch));
      const matchesRole = selectedUserRole === "ALL" || u.role === selectedUserRole;
      const matchesSchool = selectedUserSchool === "ALL" || u.etablissementId === selectedUserSchool;
      return matchesSearch && matchesRole && matchesSchool;
    })
    .sort((a, b) => {
      const rolePriority: Record<UserRole, number> = {
        ADMIN: 1,
        SUPER_ADMIN: 2,
        TEACHER: 3,
        STUDENT: 4,
        PARENT: 5,
      };
      const pA = rolePriority[a.role] || 99;
      const pB = rolePriority[b.role] || 99;
      return pA - pB;
    });

  const totalClassesCount = classes.length;
  const totalEnrolledStudents = classes.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
  const activeClassesCount = classes.filter((c) => c.status === "ACTIVE").length;
  const archivedClassesCount = classes.filter((c) => c.status === "ARCHIVED").length;
  const totalCapacityCount = classes.reduce((acc, c) => acc + (c.capacity || 0), 0);
  const distinctLevels = Array.from(new Set(classes.map((c) => c.level).filter(Boolean)));

  // Filtered Classes
  const filteredClasses = classes.filter((c) => {
    const q = classSearchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.classCode.toLowerCase().includes(q) ||
      c.etablissementName.toLowerCase().includes(q) ||
      c.teacherName.toLowerCase().includes(q) ||
      c.level.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q);

    const matchesEtab =
      selectedClassEtabFilter === "ALL" || c.etablissementId === selectedClassEtabFilter;

    const matchesStatus =
      selectedClassStatusFilter === "ALL" || c.status === selectedClassStatusFilter;

    const matchesLevel =
      selectedClassLevelFilter === "ALL" ||
      c.level.toLowerCase().includes(selectedClassLevelFilter.toLowerCase());

    return matchesSearch && matchesEtab && matchesStatus && matchesLevel;
  });

  // User breakdown statistics
  const countStudents = users.filter((u) => u.role === "STUDENT").length;
  const countTeachers = users.filter((u) => u.role === "TEACHER").length;
  const countParents = users.filter((u) => u.role === "PARENT").length;
  const countAdmins = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Super Admin Top Hero Banner */}
      <div className="relative rounded-[28px] p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-[#0d1629] via-[#091020] to-[#120f26] border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>CONSOLE SUPER ADMINISTRATEUR (ROOT MASTER)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Gestion des Établissements & des Classes AlFasle
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Supervisez l&apos;ensemble de la plateforme multi-tenant : déployez des <strong>établissements</strong> (lycées, collèges, universités), gérez et créez toutes les <strong>classes</strong>, assignez les professeurs et contrôlez les identifiants d&apos;accès.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setConfirmModal({
                  isOpen: true,
                  title: "Réinitialiser et Vider le Cache ?",
                  message: "Voulez-vous réinitialiser toutes les données aux valeurs d'origine propres et vider le cache du navigateur ? Toutes les modifications locales non synchronisées seront réinitialisées.",
                  confirmLabel: "Réinitialiser les données",
                  variant: "warning",
                  onConfirm: () => {
                    resetStoreToDefaults();
                  },
                });
              }}
              title="Vider le cache du navigateur et réinitialiser les données"
              className="px-4 py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>🧹 Vider Cache</span>
            </button>

            <button
              onClick={() => {
                resetSchoolForm();
                setIsCreateModalOpen(true);
              }}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
            >
              <Building2 className="w-4 h-4 text-black" />
              <span>+ Créer Établissement</span>
            </button>

            <button
              onClick={() => handleOpenSuperCreateClass()}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
            >
              <FolderKanban className="w-4 h-4 text-white" />
              <span>+ Nouvelle Classe</span>
            </button>

            <button
              onClick={() => setIsCreateUserModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
            >
              <Users className="w-4 h-4 text-black" />
              <span>+ Utilisateur</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar whitespace-nowrap -mx-1 px-1">
        <button
          onClick={() => setActiveTab("ETABLISSEMENTS")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "ETABLISSEMENTS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏫 Établissements ({etablissements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("CLASSES")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "CLASSES"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <FolderKanban className="w-4 h-4" />
          <span>🎓 Classes & Filières ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "USERS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Utilisateurs ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INSCRIPTIONS")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "INSCRIPTIONS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>📝 Préinscriptions</span>
          {inscriptions.filter((i) => i.status === "PENDING").length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black animate-pulse">
              {inscriptions.filter((i) => i.status === "PENDING").length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("SYSTEM")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "SYSTEM"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>📊 Monitoring</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: USERS MANAGEMENT (ELEVES, PROFS, PARENTS, ADMINS - LOGIN & MDP) */}
      {/* ========================================================================= */}
      {activeTab === "USERS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* User Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  🎓 Élèves & Étudiants
                </span>
                <GraduationCap className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-white">{countStudents}</span>
                <span className="text-[10px] text-slate-400">Comptes élèves</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  👨‍🏫 Enseignants
                </span>
                <BookOpen className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-indigo-300">{countTeachers}</span>
                <span className="text-[10px] text-slate-400">Professeurs actifs</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  👨‍👩‍👧 Parents d&apos;Élèves
                </span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-cyan-300">{countParents}</span>
                <span className="text-[10px] text-slate-400">Tuteurs légaux</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  👑 Administrations
                </span>
                <Shield className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-amber-300">{countAdmins}</span>
                <span className="text-[10px] text-amber-400/80">Directeurs / Super Admin</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, identifiant..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Rôle :</label>
                <select
                  value={selectedUserRole}
                  onChange={(e) => setSelectedUserRole(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="STUDENT">🎓 Élèves / Étudiants</option>
                  <option value="TEACHER">👨‍🏫 Professeurs</option>
                  <option value="PARENT">👨‍👩‍👧 Parents d&apos;Élèves</option>
                  <option value="ADMIN">👑 Directeurs / Admins</option>
                  <option value="SUPER_ADMIN">🛡️ Super Administrateurs</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Établissement :</label>
                <select
                  value={selectedUserSchool}
                  onChange={(e) => setSelectedUserSchool(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 max-w-[180px]"
                >
                  <option value="ALL">Tous les campus</option>
                  {etablissements.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* User Account Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Utilisateur & Identité</th>
                    <th className="py-3.5 px-4">Login / Identifiant</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Mot de Passe</th>
                    <th className="py-3.5 px-4">Rôle</th>
                    <th className="py-3.5 px-4">Établissement Rattaché</th>
                    <th className="py-3.5 px-4 text-right">Actions Super Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">
                        Aucun utilisateur ne correspond à vos critères de recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isPwdVisible = visiblePasswords[u.id] || false;
                      const userPwd = u.password || "Madouu1966@";
                      const userLogin = u.username || u.name.split(" ")[0].toLowerCase();

                      return (
                        <tr
                          key={u.id}
                          className="hover:bg-slate-900/40 transition-colors group"
                        >
                          {/* Name & Avatar */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  u.avatarUrl ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                                }
                                alt={u.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white text-xs">{u.name}</p>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ID: {u.id}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Username / Login */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                {userLogin}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(userLogin, `login_${u.id}`)}
                                className="text-slate-500 hover:text-white p-1"
                                title="Copier l'identifiant"
                              >
                                {copiedId === `login_${u.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-4 font-mono text-slate-300">
                            <div className="flex items-center gap-1.5">
                              <span>{u.email}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(u.email, `email_${u.id}`)}
                                className="text-slate-500 hover:text-white p-1"
                                title="Copier l'email"
                              >
                                {copiedId === `email_${u.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Password with View Toggle */}
                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 bg-slate-900 px-2 py-1 rounded border border-slate-700/80 font-bold">
                                {isPwdVisible ? userPwd : "••••••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(u.id)}
                                className="p-1 text-slate-400 hover:text-white transition-colors"
                                title={isPwdVisible ? "Masquer" : "Afficher le mot de passe"}
                              >
                                {isPwdVisible ? (
                                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                                ) : (
                                  <Eye className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono inline-flex items-center gap-1 border ${
                                u.role === "SUPER_ADMIN"
                                  ? "bg-amber-500/15 text-amber-300 border-amber-500/40"
                                  : u.role === "ADMIN"
                                  ? "bg-blue-500/15 text-blue-300 border-blue-500/40"
                                  : u.role === "TEACHER"
                                  ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/40"
                                  : u.role === "PARENT"
                                  ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
                                  : "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
                              }`}
                            >
                              {u.role === "SUPER_ADMIN" && "🛡️ SUPER ADMIN"}
                              {u.role === "ADMIN" && "👑 DIRECTION"}
                              {u.role === "TEACHER" && "👨‍🏫 PROFESSEUR"}
                              {u.role === "PARENT" && "👨‍👩‍👧 PARENT"}
                              {u.role === "STUDENT" && "🎓 ÉLÈVE"}
                            </span>
                          </td>

                          {/* Establishment */}
                          <td className="py-3 px-4 text-slate-300">
                            {u.etablissementName ? (
                              <span className="font-semibold text-slate-200">
                                {u.etablissementName}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Plateforme Globale</span>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(u)}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Modifier</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                                title="Supprimer le compte"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ESTABLISHMENTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "ETABLISSEMENTS" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Dedicated Establishment Creation Callout */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2.5">
                <Building2 className="w-5 h-5 text-amber-400" />
                <span>Campus & Établissements Scolaires ({etablissements.length})</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Déployez de nouveaux établissements scolaires, configurez leur sous-domaine isolé (*.alfasle.xyz), assignez le directeur et ajustez les quotas de classes et d&apos;élèves.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                resetSchoolForm();
                setIsCreateModalOpen(true);
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider shrink-0"
            >
              <PlusCircle className="w-4 h-4 fill-black" />
              <span>+ Créer un Établissement</span>
            </button>
          </div>

          {/* Filter & Search Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par nom, code, ville, directeur..."
                value={schoolSearchQuery}
                onChange={(e) => setSchoolSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Type :</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Tous les types</option>
                  <option value="LYCEE">Lycées</option>
                  <option value="COLLEGE">Collèges</option>
                  <option value="INSTITUT">Instituts Supérieurs</option>
                  <option value="UNIVERSITE">Universités</option>
                  <option value="ECOLE_PRIMAIRE">Écoles Primaires</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium">Statut :</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of Managed Establishments */}
          <div className="space-y-6">
            {filteredEtabs.map((etab) => {
              const schoolClasses = classes.filter((c) => c.etablissementId === etab.id);
              const enrolled = schoolClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);
              const isActive = (etab.status || "ACTIVE") === "ACTIVE";

              return (
                <div
                  key={etab.id}
                  className={`glass-panel rounded-3xl p-6 border transition-all shadow-xl space-y-5 ${
                    isActive
                      ? "border-slate-800/90 hover:border-amber-500/40"
                      : "border-rose-900/40 opacity-75 bg-rose-950/10"
                  }`}
                >
                  {/* Card Top */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
                        <img
                          src={
                            etab.logoUrl ||
                            "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150"
                          }
                          alt={etab.name}
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="text-lg font-black text-white">{etab.name}</h3>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                            {etab.code}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-semibold">
                            {etab.type}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            }`}
                          >
                            {isActive ? "● Actif" : "● Suspendu"}
                          </span>
                          {etab.subscriptionPlan && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-mono font-bold">
                              {etab.subscriptionPlan}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 mt-1 max-w-2xl">{etab.description}</p>

                        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                            {etab.city}, {etab.country}
                          </span>
                          {etab.directorName && (
                            <span className="flex items-center gap-1 font-medium text-slate-300">
                              <Shield className="w-3.5 h-3.5 text-amber-400" />
                              Dir : {etab.directorName}
                            </span>
                          )}
                          {etab.directorEmail && (
                            <span className="flex items-center gap-1 text-slate-300 font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                              <Mail className="w-3 h-3 text-amber-400" />
                              {etab.directorEmail}
                            </span>
                          )}
                          {/* Director Password Display */}
                          {(() => {
                            const dirUser = users.find(
                              (u) =>
                                (etab.directorEmail && u.email.toLowerCase() === etab.directorEmail.toLowerCase()) ||
                                (u.etablissementId === etab.id && u.role === "ADMIN")
                            );
                            const dirPass = dirUser?.password || etab.directorPassword || "Madouu1966@";
                            const isVisible = visiblePasswords[`dir_${etab.id}`] || false;
                            return (
                              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300">
                                <span>Pass Dir:</span>
                                <span className="font-bold">
                                  {isVisible ? dirPass : "••••••••"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setVisiblePasswords((prev) => ({
                                      ...prev,
                                      [`dir_${etab.id}`]: !prev[`dir_${etab.id}`],
                                    }))
                                  }
                                  className="text-amber-400/80 hover:text-amber-200 ml-1"
                                >
                                  {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard?.writeText(dirPass);
                                    setCopiedId(`dir_${etab.id}`);
                                    setTimeout(() => setCopiedId(null), 2000);
                                  }}
                                  className="text-amber-400/80 hover:text-amber-200 ml-0.5"
                                  title="Copier mot de passe"
                                >
                                  {copiedId === `dir_${etab.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            );
                          })()}
                          <span className="flex items-center gap-1 font-mono text-blue-400">
                            <Globe2 className="w-3.5 h-3.5" />
                            .{etab.subdomain}.alfasle.xyz
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons on Establishment */}
                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedClassEtabFilter(etab.id);
                          setActiveTab("CLASSES");
                        }}
                        className="px-3.5 py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Voir et gérer toutes les classes de cet établissement"
                      >
                        <FolderKanban className="w-3.5 h-3.5 text-purple-400" />
                        <span>Gérer les classes ({schoolClasses.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenSuperCreateClass(etab.id)}
                        className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        title="Créer une nouvelle classe rattachée à cet établissement"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span>+ Ajouter Classe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditEtab(etab)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title="Modifier les informations de l'établissement"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Modifier</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleStatus(etab)}
                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                          isActive
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30"
                            : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{isActive ? "Suspendre" : "Activer"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSchool(etab.id, etab.name)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                        title="Supprimer l'établissement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Quotas & Classes preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <span className="text-[11px] text-slate-400">Quota Classes Alloué :</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold text-white">
                          {schoolClasses.length} / {etab.maxClassesQuota || 20} classes
                        </span>
                        <span className="text-[10px] text-blue-400 font-mono">
                          {Math.round((schoolClasses.length / (etab.maxClassesQuota || 20)) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <span className="text-[11px] text-slate-400">Capacité Étudiants :</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-base font-bold text-white">
                          {enrolled} / {etab.maxStudentsQuota || 500} élèves
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {Math.round((enrolled / (etab.maxStudentsQuota || 500)) * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                      <span className="text-[11px] text-slate-400">Administration Locale :</span>
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {etab.directorName}
                      </p>
                    </div>
                  </div>

                  {/* Associated Classes Mini List */}
                  {schoolClasses.length > 0 && (
                    <div className="pt-2">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Classes rattachées :
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {schoolClasses.map((cls) => (
                          <div
                            key={cls.id}
                            className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-semibold text-white truncate">{cls.title}</p>
                              <span className="text-[10px] text-blue-400 font-mono">
                                {cls.classCode} • {cls.enrolledCount || 0} élèves
                              </span>
                            </div>
                            {onSelectClassForCourses && (
                              <button
                                type="button"
                                onClick={() => onSelectClassForCourses(cls.id)}
                                className="p-1 text-slate-400 hover:text-white"
                                title="Voir les cours"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: CLASSES & CURRICULUM MANAGEMENT (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {activeTab === "CLASSES" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header Callout & Add Class Button */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-slate-900 border border-purple-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-xs font-bold mb-2">
                <FolderKanban className="w-3.5 h-3.5 text-purple-400" />
                <span>PILOTAGE CENTRALISÉ DES CLASSES</span>
              </div>
              <h2 className="text-xl font-black text-white flex items-center gap-2.5">
                <span>Gestion Globale des Classes ({filteredClasses.length} / {classes.length})</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Créez, modifiez, assignez des professeurs et organisez les classes pour tous les établissements. Vous pouvez également réassigner une classe à un autre campus ou ajuster son quota d&apos;élèves.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenSuperCreateClass(selectedClassEtabFilter !== "ALL" ? selectedClassEtabFilter : undefined)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider shrink-0"
            >
              <PlusCircle className="w-4 h-4 fill-white text-indigo-950" />
              <span>+ Créer une Classe</span>
            </button>
          </div>

          {/* Classes Top Metrics (4 cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                  Total Classes
                </span>
                <FolderKanban className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-white">{classes.length}</span>
                <span className="text-[10px] text-slate-400">tous campus</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  Classes Actives
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-emerald-300">{activeClassesCount}</span>
                <span className="text-[10px] text-slate-400">{archivedClassesCount} archivée(s)</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                  Élèves Inscrits
                </span>
                <Users className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-amber-300">{totalEnrolledStudents}</span>
                <span className="text-[10px] text-slate-400">/ {totalCapacityCount} places</span>
              </div>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                  Couverture Campus
                </span>
                <Building2 className="w-4 h-4 text-sky-400" />
              </div>
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-2xl font-black text-sky-300">
                  {new Set(classes.map((c) => c.etablissementId)).size}
                </span>
                <span className="text-[10px] text-slate-400">/ {etablissements.length} établissements</span>
              </div>
            </div>
          </div>

          {/* Filter & Search Controls Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col lg:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="w-full lg:w-96 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher par titre, code, prof, niveau, campus..."
                value={classSearchQuery}
                onChange={(e) => setClassSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Campus :</label>
                <select
                  value={selectedClassEtabFilter}
                  onChange={(e) => setSelectedClassEtabFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 max-w-[200px] truncate"
                >
                  <option value="ALL">Tous les établissements ({etablissements.length})</option>
                  {etablissements.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name} ({et.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Statut :</label>
                <select
                  value={selectedClassStatusFilter}
                  onChange={(e) => setSelectedClassStatusFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">Tous statuts</option>
                  <option value="ACTIVE">Actives</option>
                  <option value="ARCHIVED">Archivées</option>
                  <option value="DRAFT">Brouillons</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Niveau :</label>
                <select
                  value={selectedClassLevelFilter}
                  onChange={(e) => setSelectedClassLevelFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                >
                  <option value="ALL">Tous niveaux</option>
                  {distinctLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {(classSearchQuery || selectedClassEtabFilter !== "ALL" || selectedClassStatusFilter !== "ALL" || selectedClassLevelFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setClassSearchQuery("");
                    setSelectedClassEtabFilter("ALL");
                    setSelectedClassStatusFilter("ALL");
                    setSelectedClassLevelFilter("ALL");
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          </div>

          {/* Classes Cards List */}
          {filteredClasses.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
                <FolderKanban className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Aucune classe ne correspond à ces critères</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Ajustez vos filtres ou créez une nouvelle classe pour les établissements configurés.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleOpenSuperCreateClass()}
                className="px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Créer une classe maintenant</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredClasses.map((cls) => {
                const parentSchool = etablissements.find((e) => e.id === cls.etablissementId);
                const isArchived = cls.status === "ARCHIVED";
                const isDraft = cls.status === "DRAFT";
                const enrolled = cls.enrolledCount || 0;
                const capacity = cls.capacity || 35;
                const fillRatio = Math.round((enrolled / capacity) * 100);

                return (
                  <div
                    key={cls.id}
                    className={`glass-panel rounded-3xl border transition-all shadow-xl overflow-hidden flex flex-col justify-between ${
                      isArchived
                        ? "border-slate-800 bg-slate-950/40 opacity-70"
                        : "border-slate-800/90 hover:border-purple-500/40 bg-gradient-to-b from-[#0d1326] to-[#080d1a]"
                    }`}
                  >
                    <div>
                      {/* Top Cover Banner */}
                      <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
                        <img
                          src={
                            cls.coverImage ||
                            "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80"
                          }
                          alt={cls.title}
                          className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1326] via-transparent to-black/60" />

                        {/* Badges on Cover */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedClassEtabFilter(cls.etablissementId)}
                            className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-slate-700/80 text-[10px] font-bold text-white flex items-center gap-1.5 hover:bg-purple-950/80 hover:border-purple-500/50 transition-colors"
                            title="Filtrer uniquement cet établissement"
                          >
                            <Building2 className="w-3 h-3 text-purple-400" />
                            <span className="truncate max-w-[160px]">{cls.etablissementName}</span>
                          </button>

                          <div className="flex items-center gap-1.5">
                            {cls.status === "ACTIVE" && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold">
                                ACTIVE
                              </span>
                            )}
                            {cls.status === "ARCHIVED" && (
                              <span className="px-2 py-0.5 rounded-full bg-slate-700/60 border border-slate-600 text-slate-300 font-mono text-[10px] font-bold">
                                ARCHIVÉE
                              </span>
                            )}
                            {cls.status === "DRAFT" && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 font-mono text-[10px] font-bold">
                                BROUILLON
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Category & Level Badges Bottom Cover */}
                        <div className="absolute bottom-2 left-3 flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/30 border border-purple-500/40 text-purple-200 text-[10px] font-bold">
                            {cls.level}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[10px] font-semibold">
                            {cls.category}
                          </span>
                        </div>
                      </div>

                      {/* Card Content Body */}
                      <div className="p-5 space-y-4">
                        <div>
                          <h3 className="font-black text-white text-base leading-snug line-clamp-1 hover:text-purple-300 transition-colors">
                            {cls.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {cls.description || "Aucune description renseignée pour cette classe."}
                          </p>
                        </div>

                        {/* Class Code & Teacher */}
                        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Code de classe :</span>
                            <div className="flex items-center gap-1 bg-slate-950 border border-purple-500/30 px-2 py-0.5 rounded-lg font-mono text-purple-300 text-[11px] font-bold">
                              <span>{cls.classCode}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(cls.classCode, `code_${cls.id}`)}
                                className="text-purple-400 hover:text-white ml-1"
                                title="Copier le code de classe"
                              >
                                {copiedId === `code_${cls.id}` ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Enseignant :</span>
                            <div className="flex items-center gap-1.5 text-slate-200 font-semibold truncate max-w-[170px]">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{cls.teacherName || "Non affecté"}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">Mode Inscription :</span>
                            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                              {cls.enrollmentMode === "OPEN"
                                ? "Accès Libre"
                                : cls.enrollmentMode === "INVITATION"
                                ? "Invitation Seulement"
                                : "Validation Manuelle"}
                            </span>
                          </div>
                        </div>

                        {/* Enrolled Students Progress Bar */}
                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[11px] text-slate-400">Occupation :</span>
                            <span className="font-bold text-white font-mono text-[11px]">
                              {enrolled} / {capacity} élèves ({fillRatio}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                fillRatio >= 90
                                  ? "bg-rose-500"
                                  : fillRatio >= 70
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(fillRatio, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditClass(cls)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                          title="Modifier les paramètres de la classe"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Modifier</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewingClassStudents(cls)}
                          className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
                          title="Consulter la liste des élèves inscrits"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>Élèves ({enrolled})</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        {onSelectClassForCourses && (
                          <button
                            type="button"
                            onClick={() => onSelectClassForCourses(cls.id)}
                            className="p-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                            title="Voir les cours et leçons de cette classe"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleToggleArchiveClass(cls)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
                          title={isArchived ? "Restaurer la classe (Activer)" : "Archiver la classe"}
                        >
                          <Archive className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClass(cls)}
                          className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                          title="Supprimer la classe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SYSTEM MONITORING */}
      {/* ========================================================================= */}
      {activeTab === "SYSTEM" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Super Admin Master</h3>
                  <p className="text-xs text-slate-400">Compte Root Principal</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                <p className="text-amber-300 font-bold">Email : konedamaa@gmail.com</p>
                <p className="text-slate-400">Mot de passe : Madouu1966@</p>
                <p className="text-emerald-400 text-[11px]">● Accès Root Multi-Tenant Illimité</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Routage Multi-Sous-Domaines</h3>
                  <p className="text-xs text-slate-400">Wildcard DNS / Proxies</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                <p className="text-blue-300">Routage : *.alfasle.xyz / /e/[subdomain]</p>
                <p className="text-slate-400">Sous-domaines configurés : {etablissements.length}</p>
                <p className="text-emerald-400 text-[11px]">● Auto-provisioning actif</p>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Base de Données & Store</h3>
                  <p className="text-xs text-slate-400">Persistance & Sync</p>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono space-y-1">
                <p className="text-purple-300">Total Utilisateurs : {users.length}</p>
                <p className="text-slate-400">Total Classes : {classes.length}</p>
                <p className="text-emerald-400 text-[11px]">● Synchronisation temps réel</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INSCRIPTIONS & VALIDATION QUEUE (SUPER ADMIN EXCLUSIVE) */}
      {/* ========================================================================= */}
      {activeTab === "INSCRIPTIONS" && (
        <div className="glass-panel p-6 rounded-3xl border border-slate-800">
          <ValidationQueue />
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT USER CREDENTIALS (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Modifier les Identifiants & Rôles
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    COMPTE : {editingUser.name} ({editingUser.id})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom Complet de l&apos;utilisateur *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Prof. Sarah Mansouri, Yasmine Khelifi..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Login / Identifiant de connexion *
                  </label>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    placeholder="Ex: kone, sarah, yasmine..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Permet de se connecter avec ce login
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email de connexion *
                  </label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="email@domaine.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Permet de se connecter avec cet email
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mot de Passe du Compte *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Définir un nouveau mot de passe"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  💡 Vous pouvez modifier ou réinitialiser le mot de passe à tout moment.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rôle de l&apos;Utilisateur *
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="STUDENT">🎓 Élève / Étudiant</option>
                    <option value="TEACHER">👨‍🏫 Professeur</option>
                    <option value="PARENT">👨‍👩‍👧 Parent d&apos;Élève</option>
                    <option value="ADMIN">👑 Directeur / Admin</option>
                    <option value="SUPER_ADMIN">🛡️ Super Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Établissement Rattaché
                  </label>
                  <select
                    value={editEtabId}
                    onChange={(e) => setEditEtabId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Aucun (Global / Root)</option>
                    {etablissements.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.name} ({et.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Biographie / Note interne
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Informations supplémentaires..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 fill-black" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW USER (SUPER ADMIN) */}
      {/* ========================================================================= */}
      {isCreateUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Créer un Nouvel Utilisateur
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    ÉLÈVE, PROFESSEUR, PARENT OU DIRECTEUR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateUserModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom Complet de l&apos;utilisateur *
                </label>
                <input
                  type="text"
                  required
                  value={createUserName}
                  onChange={(e) => setCreateUserName(e.target.value)}
                  placeholder="Ex: Yacine Mansour, Fatou Diallo..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Login / Identifiant (Username)
                  </label>
                  <input
                    type="text"
                    value={createUserUsername}
                    onChange={(e) => setCreateUserUsername(e.target.value)}
                    placeholder="Ex: yacine (Auto si vide)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Email de connexion *
                  </label>
                  <input
                    type="email"
                    required
                    value={createUserEmail}
                    onChange={(e) => setCreateUserEmail(e.target.value)}
                    placeholder="utilisateur@domaine.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mot de Passe Initial *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={createUserPassword}
                    onChange={(e) => setCreateUserPassword(e.target.value)}
                    placeholder="Madouu1966@"
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Rôle du Compte *
                  </label>
                  <select
                    value={createUserRole}
                    onChange={(e) => setCreateUserRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="STUDENT">🎓 Élève / Étudiant</option>
                    <option value="TEACHER">👨‍🏫 Professeur</option>
                    <option value="PARENT">👨‍👩‍👧 Parent d&apos;Élève</option>
                    <option value="ADMIN">👑 Directeur / Admin</option>
                    <option value="SUPER_ADMIN">🛡️ Super Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Établissement Rattaché
                  </label>
                  <select
                    value={createUserEtabId}
                    onChange={(e) => setCreateUserEtabId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Aucun (Global)</option>
                    {etablissements.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.name} ({et.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Biographie / Note
                </label>
                <textarea
                  rows={2}
                  value={createUserBio}
                  onChange={(e) => setCreateUserBio(e.target.value)}
                  placeholder="Note facultative..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsCreateUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black shadow-lg shadow-emerald-500/25 flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 fill-black" />
                  <span>Créer l&apos;Utilisateur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE ESTABLISHMENT WIZARD */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                  <Building2 className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Création & Provisionnement d&apos;Établissement
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">
                    AUTORISATION SUPER ADMIN ACTIVE
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicators */}
            <div className="px-6 pt-4 border-b border-slate-800 flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFormStep(1)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  formStep === 1
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  1
                </span>
                <span>Identité & Campus</span>
              </button>

              <button
                type="button"
                onClick={() => setFormStep(2)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  formStep === 2
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  2
                </span>
                <span>Direction & Contact</span>
              </button>

              <button
                type="button"
                onClick={() => setFormStep(3)}
                className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-all ${
                  formStep === 3
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] flex items-center justify-center">
                  3
                </span>
                <span>Quotas & Formule</span>
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleCreateSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* STEP 1: IDENTITY */}
              {formStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nom officiel de l&apos;établissement *
                    </label>
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ex: Institut Supérieur Polytechnique KONE, Lycée d'Excellence..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Code Unique Établissement
                      </label>
                      <input
                        type="text"
                        value={newCode}
                        onChange={(e) => setNewCode(e.target.value)}
                        placeholder="Ex: ALF-EXC-01 (Auto si vide)"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Sous-domaine Dédié (DNS)
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newSubdomain}
                          onChange={(e) => setNewSubdomain(e.target.value)}
                          placeholder="ex: polytech-kone"
                          className="w-full px-4 py-2.5 rounded-l-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono lowercase focus:outline-none focus:border-amber-500 text-xs"
                        />
                        <span className="px-2.5 py-2.5 bg-slate-800 border border-l-0 border-slate-700 text-slate-400 text-xs rounded-r-xl font-mono">
                          .alfasle.xyz
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Type d&apos;Établissement *
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="LYCEE">Lycée</option>
                      <option value="COLLEGE">Collège</option>
                      <option value="INSTITUT">Institut Supérieur</option>
                      <option value="UNIVERSITE">Université</option>
                      <option value="ECOLE_PRIMAIRE">École Primaire</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Ville *</label>
                      <input
                        type="text"
                        required
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        placeholder="Ex: Abidjan, Alger, Oran, Paris..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Pays *</label>
                      <input
                        type="text"
                        required
                        value={newCountry}
                        onChange={(e) => setNewCountry(e.target.value)}
                        placeholder="Ex: Côte d'Ivoire, Algérie..."
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Adresse géographique
                    </label>
                    <input
                      type="text"
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Ex: Cocody Riviera, Boulevard de la République"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                    >
                      Suivant : Direction & Contact &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DIRECTOR */}
              {formStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    💡 Un compte Administrateur local sera automatiquement créé pour le directeur avec ces coordonnées.
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Nom du Directeur / Recteur *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDirectorName}
                        onChange={(e) => setNewDirectorName(e.target.value)}
                        placeholder="Ex: Dr. KONE ADAMA"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Email du Directeur (Login Admin) *
                      </label>
                      <input
                        type="email"
                        required
                        value={newDirectorEmail}
                        onChange={(e) => setNewDirectorEmail(e.target.value)}
                        placeholder="konedamaa@gmail.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Mot de Passe de Connexion du Directeur *
                      </label>
                      <div className="relative">
                        <input
                          type={showDirectorPassword ? "text" : "password"}
                          required
                          value={newDirectorPassword}
                          onChange={(e) => setNewDirectorPassword(e.target.value)}
                          placeholder="Madouu1966@"
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono focus:outline-none focus:border-amber-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDirectorPassword(!showDirectorPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-white"
                        >
                          {showDirectorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        🔑 Le directeur utilisera ce mot de passe pour gérer ses élèves, profs et classes.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Téléphone de contact
                      </label>
                      <input
                        type="text"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        placeholder="+225 07 00 11 22"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Description de la mission pédagogique
                    </label>
                    <textarea
                      rows={2}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Présentation des filières, diplômes et vocation..."
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      &larr; Retour
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStep(3)}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                    >
                      Suivant : Quotas & Formule &rarr;
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: QUOTAS & PLAN */}
              {formStep === 3 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5">
                      Formule d&apos;Abonnement Multi-Campus
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {(["STANDARD", "PREMIUM", "ENTERPRISE"] as const).map((plan) => (
                        <button
                          key={plan}
                          type="button"
                          onClick={() => setNewPlan(plan)}
                          className={`p-3 rounded-2xl border text-center transition-all ${
                            newPlan === plan
                              ? "bg-amber-500/20 border-amber-500 text-white shadow-lg ring-1 ring-amber-500"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          <Award className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                          <span className="font-bold text-xs block">{plan}</span>
                          <span className="text-[10px] opacity-75">
                            {plan === "ENTERPRISE" ? "Illimité" : plan === "PREMIUM" ? "Pro" : "Base"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Quota Max Classes
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={newMaxClasses}
                        onChange={(e) => setNewMaxClasses(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Capacité Max Étudiants
                      </label>
                      <input
                        type="number"
                        min={10}
                        max={5000}
                        value={newMaxStudents}
                        onChange={(e) => setNewMaxStudents(parseInt(e.target.value) || 10)}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Logo Établissement (URL)
                    </label>
                    <input
                      type="url"
                      value={newLogoUrl}
                      onChange={(e) => setNewLogoUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setFormStep(2)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                    >
                      &larr; Retour
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 uppercase tracking-wider"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-black" />
                      <span>Déployer l&apos;Établissement</span>
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDIT ESTABLISHMENT MODAL */}
      {/* ========================================================================= */}
      {isEditEtabModalOpen && editingEtab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-black shadow-lg shadow-amber-500/20">
                  <Edit className="w-5 h-5 font-bold" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Modifier les Informations de l&apos;Établissement
                  </h3>
                  <p className="text-xs text-amber-400/90 font-mono">
                    ÉDITION DU CAMPUS : {editingEtab.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditEtabModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEditEtab} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom officiel de l&apos;établissement *
                </label>
                <input
                  type="text"
                  required
                  value={editEtabName}
                  onChange={(e) => setEditEtabName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Code Unique
                  </label>
                  <input
                    type="text"
                    required
                    value={editEtabCode}
                    onChange={(e) => setEditEtabCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Sous-domaine Dédié (DNS)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="text"
                      required
                      value={editEtabSubdomain}
                      onChange={(e) => setEditEtabSubdomain(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-l-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono lowercase focus:outline-none focus:border-amber-500 text-xs"
                    />
                    <span className="px-2.5 py-2.5 bg-slate-800 border border-l-0 border-slate-700 text-slate-400 text-xs rounded-r-xl font-mono">
                      .alfasle.xyz
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Type *</label>
                  <select
                    value={editEtabType}
                    onChange={(e) => setEditEtabType(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LYCEE">Lycée</option>
                    <option value="COLLEGE">Collège</option>
                    <option value="INSTITUT">Institut Supérieur</option>
                    <option value="UNIVERSITE">Université</option>
                    <option value="ECOLE_PRIMAIRE">École Primaire</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ville *</label>
                  <input
                    type="text"
                    required
                    value={editEtabCity}
                    onChange={(e) => setEditEtabCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Pays *</label>
                  <input
                    type="text"
                    required
                    value={editEtabCountry}
                    onChange={(e) => setEditEtabCountry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Adresse géographique
                  </label>
                  <input
                    type="text"
                    value={editEtabAddress}
                    onChange={(e) => setEditEtabAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Téléphone de contact
                  </label>
                  <input
                    type="text"
                    value={editEtabPhone}
                    onChange={(e) => setEditEtabPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Direction Information */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <p className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Direction & Accès Administrateur du Campus</span>
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Nom du Directeur / Recteur *
                    </label>
                    <input
                      type="text"
                      required
                      value={editEtabDirectorName}
                      onChange={(e) => setEditEtabDirectorName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Email du Directeur (Login) *
                    </label>
                    <input
                      type="email"
                      required
                      value={editEtabDirectorEmail}
                      onChange={(e) => setEditEtabDirectorEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Mot de Passe du Directeur *
                  </label>
                  <div className="relative">
                    <input
                      type={showEditDirectorPassword ? "text" : "password"}
                      required
                      value={editEtabDirectorPassword}
                      onChange={(e) => setEditEtabDirectorPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono focus:outline-none focus:border-amber-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditDirectorPassword(!showEditDirectorPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showEditDirectorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Modifiez le mot de passe pour mettre à jour les accès de connexion du directeur.
                  </p>
                </div>
              </div>

              {/* Quotas & Plan */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Formule Plan</label>
                  <select
                    value={editEtabPlan}
                    onChange={(e) => setEditEtabPlan(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="ENTERPRISE">Enterprise (Illimité)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quota Élèves</label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    value={editEtabMaxStudents}
                    onChange={(e) => setEditEtabMaxStudents(parseInt(e.target.value) || 10)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quota Classes</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={editEtabMaxClasses}
                    onChange={(e) => setEditEtabMaxClasses(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description de l&apos;Établissement
                </label>
                <textarea
                  rows={2}
                  value={editEtabDesc}
                  onChange={(e) => setEditEtabDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsEditEtabModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 fill-black" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: SUPER ADMIN CREATE CLASS MODAL */}
      {/* ========================================================================= */}
      {isSuperCreateClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0a0f1e] border border-purple-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/20">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Créer une Classe (Super Admin)
                  </h3>
                  <p className="text-xs text-purple-400 font-mono">
                    DÉPLOIEMENT MULTI-TENANT SUR N&apos;IMPORTE QUEL CAMPUS
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSuperCreateClassOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSuperClass} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Target Establishment */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Établissement de rattachement *
                </label>
                <select
                  required
                  value={newClassEtabId}
                  onChange={(e) => {
                    const newEtab = e.target.value;
                    setNewClassEtabId(newEtab);
                    setNewClassCode(handleGenerateClassCode(newEtab, newClassLevel, newClassCategory));
                  }}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                >
                  {etablissements.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name} ({et.city} • .{et.subdomain}.alfasle.xyz)
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nom / Intitulé de la Classe *
                </label>
                <input
                  type="text"
                  required
                  value={newClassTitle}
                  onChange={(e) => setNewClassTitle(e.target.value)}
                  placeholder="Ex: Terminale S1 - Sciences Expérimentales, Licence 1 Informatique..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Class Code & Auto-generate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Code de Classe *</label>
                    <button
                      type="button"
                      onClick={() =>
                        setNewClassCode(
                          handleGenerateClassCode(newClassEtabId, newClassLevel, newClassCategory)
                        )
                      }
                      className="text-[10px] text-purple-400 hover:text-purple-300 font-mono underline"
                    >
                      Générer auto
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value.toUpperCase())}
                    placeholder="Ex: AF-TERM-S1"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-purple-500/40 text-purple-300 font-mono font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Enseignant Responsable
                  </label>
                  <select
                    value={newClassTeacherId}
                    onChange={(e) => setNewClassTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">Sélectionner un professeur...</option>
                    {users
                      .filter((u) => u.role === "TEACHER")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.etablissementName || "Professeur Global"})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Level & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau / Grade</label>
                  <input
                    type="text"
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    placeholder="Ex: Terminale, 1ère, L1, Collège..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discipline / Filière</label>
                  <input
                    type="text"
                    value={newClassCategory}
                    onChange={(e) => setNewClassCategory(e.target.value)}
                    placeholder="Ex: Sciences, Mathématiques, Informatique..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Capacity & Enrollment Mode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacité Max Élèves</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={newClassCapacity}
                    onChange={(e) => setNewClassCapacity(parseInt(e.target.value) || 30)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mode d&apos;Inscription</label>
                  <select
                    value={newClassEnrollmentMode}
                    onChange={(e) => setNewClassEnrollmentMode(e.target.value as EnrollmentMode)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="OPEN">Accès Libre (Immédiat)</option>
                    <option value="INVITATION">Sur Invitation / Code Privé</option>
                    <option value="MANUAL_APPROVAL">Validation Manuelle Requise</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Description & Programme
                </label>
                <textarea
                  rows={2}
                  value={newClassDescription}
                  onChange={(e) => setNewClassDescription(e.target.value)}
                  placeholder="Objectifs pédagogiques, matières dispensées, informations importantes..."
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Cover Image URL */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Image d&apos;Illustration (URL)
                </label>
                <input
                  type="url"
                  value={newClassCoverImage}
                  onChange={(e) => setNewClassCoverImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsSuperCreateClassOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black shadow-lg shadow-indigo-500/25 flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 fill-white text-indigo-950" />
                  <span>+ Déployer la Classe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SUPER ADMIN EDIT CLASS MODAL */}
      {/* ========================================================================= */}
      {editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-xl bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Modifier la Classe
                  </h3>
                  <p className="text-xs text-amber-400 font-mono">
                    {editingClass.title} ({editingClass.classCode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Transfer School */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Établissement d&apos;appartenance (Transfert possible) *
                </label>
                <select
                  required
                  value={editClassEtabId}
                  onChange={(e) => setEditClassEtabId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                >
                  {etablissements.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.name} ({et.city})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Intitulé de la classe *
                </label>
                <input
                  type="text"
                  required
                  value={editClassTitle}
                  onChange={(e) => setEditClassTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Code & Teacher */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code de classe *</label>
                  <input
                    type="text"
                    required
                    value={editClassCode}
                    onChange={(e) => setEditClassCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-amber-500/40 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Enseignant Responsable
                  </label>
                  <select
                    value={editClassTeacherId}
                    onChange={(e) => setEditClassTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Sélectionner un enseignant...</option>
                    {users
                      .filter((u) => u.role === "TEACHER")
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.etablissementName || "Global"})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Level & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau / Grade</label>
                  <input
                    type="text"
                    value={editClassLevel}
                    onChange={(e) => setEditClassLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Discipline / Filière</label>
                  <input
                    type="text"
                    value={editClassCategory}
                    onChange={(e) => setEditClassCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Status, Mode, Capacity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Statut</label>
                  <select
                    value={editClassStatus}
                    onChange={(e) => setEditClassStatus(e.target.value as ClassStatus)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archivée</option>
                    <option value="DRAFT">Brouillon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mode d&apos;accès</label>
                  <select
                    value={editClassEnrollmentMode}
                    onChange={(e) => setEditClassEnrollmentMode(e.target.value as EnrollmentMode)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="OPEN">Libre</option>
                    <option value="INVITATION">Invitation</option>
                    <option value="MANUAL_APPROVAL">Validation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacité</label>
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={editClassCapacity}
                    onChange={(e) => setEditClassCapacity(parseInt(e.target.value) || 30)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editClassDescription}
                  onChange={(e) => setEditClassDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL</label>
                <input
                  type="url"
                  value={editClassCoverImage}
                  onChange={(e) => setEditClassCoverImage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setEditingClass(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black shadow-lg shadow-amber-500/25 flex items-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4 fill-black" />
                  <span>Enregistrer les Modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW CLASS STUDENTS LIST */}
      {/* ========================================================================= */}
      {viewingClassStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#0a0f1e] border border-sky-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-lg shadow-sky-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Élèves Inscrits ({viewingClassStudents.enrolledCount || 0} / {viewingClassStudents.capacity})
                  </h3>
                  <p className="text-xs text-sky-400 font-mono">
                    {viewingClassStudents.title} • {viewingClassStudents.classCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingClassStudents(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {/* Summary Stats */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="text-slate-400 text-[11px]">Établissement :</p>
                  <p className="font-bold text-white mt-0.5">{viewingClassStudents.etablissementName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-[11px]">Enseignant Référent :</p>
                  <p className="font-bold text-indigo-300 mt-0.5">{viewingClassStudents.teacherName || "Non affecté"}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[11px]">Taux d&apos;occupation :</p>
                  <p className="font-mono font-bold text-emerald-400 mt-0.5">
                    {Math.round(((viewingClassStudents.enrolledCount || 0) / viewingClassStudents.capacity) * 100)}%
                  </p>
                </div>
              </div>

              {/* Students List from Inscriptions & Users */}
              {(() => {
                const classInscriptions = inscriptions.filter(
                  (i) => i.classeId === viewingClassStudents.id && i.status === "APPROVED"
                );
                // Also find students belonging to this school if inscriptions is empty
                const schoolStudents = users.filter(
                  (u) => u.role === "STUDENT" && u.etablissementId === viewingClassStudents.etablissementId
                );

                const displayStudents = classInscriptions.length > 0
                  ? classInscriptions.map((i) => ({
                      id: i.id,
                      name: i.userName,
                      email: i.userEmail,
                      avatar: i.userAvatar,
                      date: i.appliedAt,
                      phone: i.userPhone,
                    }))
                  : schoolStudents.slice(0, viewingClassStudents.enrolledCount || 5).map((u) => ({
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      avatar: u.avatarUrl,
                      date: u.createdAt,
                      phone: "+225 05 06 07 08",
                    }));

                if (displayStudents.length === 0) {
                  return (
                    <div className="py-8 text-center space-y-3">
                      <GraduationCap className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-sm font-semibold text-slate-300">
                        Aucun élève inscrit pour le moment dans cette classe
                      </p>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Partagez le code de classe <strong className="text-purple-300 font-mono">{viewingClassStudents.classCode}</strong> avec vos élèves pour leur permettre de rejoindre la classe.
                      </p>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(viewingClassStudents.classCode, "modal_code")}
                        className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-bold inline-flex items-center gap-2 hover:bg-purple-600/30 transition-all"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le Code ({viewingClassStudents.classCode})</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Liste des Inscrits ({displayStudents.length}) :
                    </p>
                    <div className="divide-y divide-slate-800/80 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                      {displayStudents.map((st, idx) => (
                        <div key={st.id || idx} className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-900/60 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/30 overflow-hidden shrink-0 flex items-center justify-center text-sky-300 font-bold text-xs">
                              {st.avatar ? (
                                <img src={st.avatar} alt={st.name} className="w-full h-full object-cover" />
                              ) : (
                                st.name.substring(0, 2).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-white">{st.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{st.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold font-mono">
                              INSCRIT ACTIF
                            </span>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {new Date(st.date).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-[#070b16] flex justify-end">
              <button
                type="button"
                onClick={() => setViewingClassStudents(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uniform In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={adminConfirmModal.isOpen}
        title={adminConfirmModal.title}
        message={adminConfirmModal.message}
        confirmLabel={adminConfirmModal.confirmLabel}
        variant={adminConfirmModal.variant}
        onConfirm={adminConfirmModal.onConfirm}
        onClose={() => setAdminConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
