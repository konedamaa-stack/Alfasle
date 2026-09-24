"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Classe, User, UserRole, Inscription } from "@/types";
import {
  School,
  GraduationCap,
  BookOpen,
  Users,
  PlusCircle,
  Search,
  FolderKanban,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Phone,
  Mail,
  Award,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Trash2,
  Edit,
  UserCheck,
  Sparkles,
  MapPin,
  Building2,
  X,
  Lock,
} from "lucide-react";

import { ConfirmModal, ConfirmVariant } from "@/components/common/ConfirmModal";
import { useToast } from "@/lib/toast-context";

interface DirecteurDashboardProps {
  onNavigate?: (tab: string) => void;
  onOpenCreateClass?: () => void;
  onSelectClassForCourses?: (classId: string) => void;
}

const COMMON_SUBJECTS = [
  "Mathématiques",
  "Sciences Physiques & Chimie",
  "Sciences de la Vie et de la Terre (SVT)",
  "Français & Littérature",
  "Informatique & Technologies",
  "Histoire - Géographie",
  "Philosophie",
  "Anglais",
  "Arabe & Éducation Islamique",
  "Économie & Gestion",
  "Autre spécialité",
];

export function DirecteurDashboard({
  onNavigate,
  onOpenCreateClass,
  onSelectClassForCourses,
}: DirecteurDashboardProps) {
  const {
    currentUser,
    etablissements,
    classes,
    users,
    inscriptions,
    createUser,
    updateUser,
    deleteUser,
    createClass,
    updateClass,
    deleteClass,
    updateEtablissement,
    approveInscription,
    rejectInscription,
  } = useStore();
  const { toast } = useToast();

  // Find the Director's establishment
  const currentEtab =
    etablissements.find(
      (e) =>
        e.id === currentUser.etablissementId ||
        (currentUser.etablissementName && e.name === currentUser.etablissementName) ||
        (currentUser.username && e.directorName?.toLowerCase().includes(currentUser.username.toLowerCase()))
    ) || etablissements[0];

  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<"STUDENTS" | "TEACHERS" | "CLASSES" | "INSCRIPTIONS">("STUDENTS");

  // Search queries
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherSearch, setTeacherSearch] = useState("");
  const [classSearch, setClassSearch] = useState("");
  const [inscriptionSearch, setInscriptionSearch] = useState("");

  // Visible passwords state
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals state (Creation)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);

  // Modals state (Edition)
  const [isEditCampusOpen, setIsEditCampusOpen] = useState(false);
  const [editCampusName, setEditCampusName] = useState("");
  const [editCampusPhone, setEditCampusPhone] = useState("");
  const [editCampusAddress, setEditCampusAddress] = useState("");
  const [editCampusDesc, setEditCampusDesc] = useState("");
  const [editCampusDirectorName, setEditCampusDirectorName] = useState("");
  const [editCampusDirectorPassword, setEditCampusDirectorPassword] = useState("");
  const [showCampusDirectorPassword, setShowCampusDirectorPassword] = useState(false);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editStudentName, setEditStudentName] = useState("");
  const [editStudentEmail, setEditStudentEmail] = useState("");
  const [editStudentUsername, setEditStudentUsername] = useState("");
  const [editStudentPassword, setEditStudentPassword] = useState("");
  const [showEditStudentPassword, setShowEditStudentPassword] = useState(false);
  const [editStudentClasseId, setEditStudentClasseId] = useState("");
  const [editStudentBio, setEditStudentBio] = useState("");

  // Edit Teacher State
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [isEditTeacherOpen, setIsEditTeacherOpen] = useState(false);
  const [editTeacherName, setEditTeacherName] = useState("");
  const [editTeacherEmail, setEditTeacherEmail] = useState("");
  const [editTeacherUsername, setEditTeacherUsername] = useState("");
  const [editTeacherPassword, setEditTeacherPassword] = useState("");
  const [showEditTeacherPassword, setShowEditTeacherPassword] = useState(false);
  const [editTeacherSubject, setEditTeacherSubject] = useState(COMMON_SUBJECTS[0]);
  const [editTeacherClasseId, setEditTeacherClasseId] = useState("");
  const [editTeacherBio, setEditTeacherBio] = useState("");

  // Class Edit State
  const [editingClass, setEditingClass] = useState<Classe | null>(null);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [editClassTitle, setEditClassTitle] = useState("");
  const [editClassCode, setEditClassCode] = useState("");
  const [editClassLevel, setEditClassLevel] = useState("Terminale");
  const [editClassCategory, setEditClassCategory] = useState("Sciences & Informatique");
  const [editClassCapacity, setEditClassCapacity] = useState(35);
  const [editClassTeacherId, setEditClassTeacherId] = useState("");
  const [editClassDesc, setEditClassDesc] = useState("");

  // Confirmation Modal State
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

  // New Student Form State
  const [newStudentName, setNewStudentName] = useState("");
  const [newStudentEmail, setNewStudentEmail] = useState("");
  const [newStudentUsername, setNewStudentUsername] = useState("");
  const [newStudentPhone, setNewStudentPhone] = useState("");
  const [newStudentPassword, setNewStudentPassword] = useState("Madouu1966@");
  const [newStudentClasseId, setNewStudentClasseId] = useState("");
  const [newStudentBio, setNewStudentBio] = useState("");

  // New Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState("");
  const [newTeacherEmail, setNewTeacherEmail] = useState("");
  const [newTeacherUsername, setNewTeacherUsername] = useState("");
  const [newTeacherPhone, setNewTeacherPhone] = useState("");
  const [newTeacherPassword, setNewTeacherPassword] = useState("Madouu1966@");
  const [newTeacherSubject, setNewTeacherSubject] = useState(COMMON_SUBJECTS[0]);
  const [newTeacherCustomSubject, setNewTeacherCustomSubject] = useState("");
  const [newTeacherClasseId, setNewTeacherClasseId] = useState("");
  const [newTeacherDiploma, setNewTeacherDiploma] = useState("");

  // New Class Form State
  const [newClassTitle, setNewClassTitle] = useState("");
  const [newClassCode, setNewClassCode] = useState("");
  const [newClassLevel, setNewClassLevel] = useState("Terminale");
  const [newClassCategory, setNewClassCategory] = useState("Sciences & Informatique");
  const [newClassCapacity, setNewClassCapacity] = useState(35);
  const [newClassTeacherId, setNewClassTeacherId] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");

  // School Specific Data
  const schoolClasses = classes.filter(
    (c) =>
      c.etablissementId === currentEtab?.id ||
      c.etablissementId === currentEtab?.subdomain ||
      (currentEtab && c.etablissementName === currentEtab.name)
  );

  const schoolStudents = users.filter(
    (u) =>
      u.role === "STUDENT" &&
      (u.etablissementId === currentEtab?.id ||
        (currentEtab && u.etablissementName === currentEtab.name))
  );

  const schoolTeachers = users.filter(
    (u) =>
      u.role === "TEACHER" &&
      (u.etablissementId === currentEtab?.id ||
        (currentEtab && u.etablissementName === currentEtab.name))
  );

  const schoolInscriptions = inscriptions.filter(
    (i) =>
      i.etablissementId === currentEtab?.id ||
      (currentEtab && i.etablissementName === currentEtab.name) ||
      schoolClasses.some((c) => c.id === i.classeId)
  );

  const pendingInscriptionsCount = schoolInscriptions.filter((i) => i.status === "PENDING").length;

  // Filtered lists
  const filteredStudents = schoolStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.username && s.username.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const filteredTeachers = schoolTeachers.filter(
    (t) =>
      t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      (t.bio && t.bio.toLowerCase().includes(teacherSearch.toLowerCase()))
  );

  const filteredClasses = schoolClasses.filter(
    (c) =>
      c.title.toLowerCase().includes(classSearch.toLowerCase()) ||
      c.classCode.toLowerCase().includes(classSearch.toLowerCase()) ||
      (c.teacherName && c.teacherName.toLowerCase().includes(classSearch.toLowerCase()))
  );

  const filteredInscriptions = schoolInscriptions.filter(
    (i) =>
      i.userName.toLowerCase().includes(inscriptionSearch.toLowerCase()) ||
      i.userEmail.toLowerCase().includes(inscriptionSearch.toLowerCase()) ||
      i.classeTitle.toLowerCase().includes(inscriptionSearch.toLowerCase()) ||
      (i.subject && i.subject.toLowerCase().includes(inscriptionSearch.toLowerCase()))
  );

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Submit Add Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;

    const autoLogin =
      newStudentUsername.trim().toLowerCase() ||
      newStudentName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    createUser({
      name: newStudentName.trim(),
      username: autoLogin,
      email: newStudentEmail.trim().toLowerCase(),
      password: newStudentPassword || "Madouu1966@",
      role: "STUDENT",
      etablissementId: currentEtab?.id,
      etablissementName: currentEtab?.name,
      bio: newStudentBio || `Élève inscrit par la Direction (${currentEtab?.name}).`,
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    });

    setIsAddStudentOpen(false);
    setNewStudentName("");
    setNewStudentEmail("");
    setNewStudentUsername("");
    setNewStudentPhone("");
    setNewStudentClasseId("");
    setNewStudentBio("");
  };

  // 2. Submit Add Teacher
  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherName.trim() || !newTeacherEmail.trim()) return;

    const autoLogin =
      newTeacherUsername.trim().toLowerCase() ||
      newTeacherName.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    const finalSubject =
      newTeacherSubject === "Autre spécialité"
        ? newTeacherCustomSubject.trim() || "Spécialité générale"
        : newTeacherSubject;

    createUser({
      name: newTeacherName.trim(),
      username: autoLogin,
      email: newTeacherEmail.trim().toLowerCase(),
      password: newTeacherPassword || "Madouu1966@",
      role: "TEACHER",
      etablissementId: currentEtab?.id,
      etablissementName: currentEtab?.name,
      bio: `Enseignant en ${finalSubject}. ${newTeacherDiploma ? "Titres: " + newTeacherDiploma : ""}`,
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    });

    setIsAddTeacherOpen(false);
    setNewTeacherName("");
    setNewTeacherEmail("");
    setNewTeacherUsername("");
    setNewTeacherPhone("");
    setNewTeacherClasseId("");
    setNewTeacherDiploma("");
  };

  // 3. Submit Add Class
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassTitle.trim()) return;

    const assignedTeacher = users.find((u) => u.id === newClassTeacherId);

    const generatedCode =
      newClassCode.trim().toUpperCase() ||
      `AF-${newClassCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    createClass({
      classCode: generatedCode,
      etablissementId: currentEtab?.id || etablissements[0]?.id || "etab_lycee_excellence",
      etablissementName: currentEtab?.name || etablissements[0]?.name || "Lycée d'Excellence AlFasle",
      title: newClassTitle.trim(),
      description: newClassDesc.trim() || `Classe officielle dispensée au sein de ${currentEtab?.name}.`,
      level: newClassLevel,
      category: newClassCategory,
      capacity: newClassCapacity || 35,
      enrollmentMode: "OPEN",
      status: "ACTIVE",
      teacherId: assignedTeacher?.id,
      teacherName: assignedTeacher?.name || currentUser.name,
      coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80",
    });

    setIsAddClassOpen(false);
    setNewClassTitle("");
    setNewClassCode("");
    setNewClassDesc("");
    setNewClassTeacherId("");
  };

  // --- EDIT HANDLERS ---
  const handleOpenEditCampus = () => {
    if (!currentEtab) return;
    setEditCampusName(currentEtab.name);
    setEditCampusPhone(currentEtab.phone || "");
    setEditCampusAddress(currentEtab.address || "");
    setEditCampusDesc(currentEtab.description || "");
    setEditCampusDirectorName(currentEtab.directorName || currentUser.name);
    setEditCampusDirectorPassword(currentUser.password || currentEtab.directorPassword || "Madouu1966@");
    setShowCampusDirectorPassword(false);
    setIsEditCampusOpen(true);
  };

  const handleSaveEditCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEtab) return;
    updateEtablissement(currentEtab.id, {
      name: editCampusName.trim(),
      phone: editCampusPhone.trim(),
      address: editCampusAddress.trim(),
      description: editCampusDesc.trim(),
      directorName: editCampusDirectorName.trim(),
      directorPassword: editCampusDirectorPassword.trim(),
    });
    setIsEditCampusOpen(false);
  };

  const handleOpenEditStudent = (s: User) => {
    const studentInscription = inscriptions.find((i) => i.userId === s.id);
    setEditingStudent(s);
    setEditStudentName(s.name);
    setEditStudentEmail(s.email);
    setEditStudentUsername(s.username || s.name.split(" ")[0].toLowerCase());
    setEditStudentPassword(s.password || "Madouu1966@");
    setShowEditStudentPassword(false);
    setEditStudentClasseId(studentInscription?.classeId || "");
    setEditStudentBio(s.bio || "");
    setIsEditStudentOpen(true);
  };

  const handleSaveEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateUser(editingStudent.id, {
      name: editStudentName.trim(),
      email: editStudentEmail.trim().toLowerCase(),
      username: editStudentUsername.trim().toLowerCase(),
      password: editStudentPassword.trim(),
      bio: editStudentBio.trim(),
    });
    setIsEditStudentOpen(false);
  };

  const handleOpenEditTeacher = (t: User) => {
    setEditingTeacher(t);
    setEditTeacherName(t.name);
    setEditTeacherEmail(t.email);
    setEditTeacherUsername(t.username || t.name.split(" ")[0].toLowerCase());
    setEditTeacherPassword(t.password || "Madouu1966@");
    setShowEditTeacherPassword(false);
    setEditTeacherSubject(
      COMMON_SUBJECTS.find((sub) => t.bio?.includes(sub)) || COMMON_SUBJECTS[0]
    );
    setEditTeacherBio(t.bio || "");
    setIsEditTeacherOpen(true);
  };

  const handleSaveEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    updateUser(editingTeacher.id, {
      name: editTeacherName.trim(),
      email: editTeacherEmail.trim().toLowerCase(),
      username: editTeacherUsername.trim().toLowerCase(),
      password: editTeacherPassword.trim(),
      bio: editTeacherBio.trim() || `Professeur de ${editTeacherSubject}`,
    });
    setIsEditTeacherOpen(false);
  };

  const handleOpenEditClass = (c: Classe) => {
    setEditingClass(c);
    setEditClassTitle(c.title);
    setEditClassCode(c.classCode);
    setEditClassLevel(c.level);
    setEditClassCategory(c.category);
    setEditClassCapacity(c.capacity || 35);
    setEditClassTeacherId(c.teacherId || "");
    setEditClassDesc(c.description || "");
    setIsEditClassOpen(true);
  };

  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    const assignedTeacher = users.find((u) => u.id === editClassTeacherId);
    updateClass(editingClass.id, {
      title: editClassTitle.trim(),
      classCode: editClassCode.trim().toUpperCase(),
      level: editClassLevel,
      category: editClassCategory,
      capacity: editClassCapacity,
      description: editClassDesc.trim(),
      teacherId: assignedTeacher?.id || editingClass.teacherId,
      teacherName: assignedTeacher?.name || editingClass.teacherName,
    });
    setIsEditClassOpen(false);
    toast.success("Enregistrement effectué avec succès", `La classe « ${editClassTitle} » a été mise à jour.`);
  };

  const handleDeleteClass = (c: Classe) => {
    setConfirmModal({
      isOpen: true,
      title: `Supprimer la classe « ${c.title} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement la classe « ${c.title} » (${c.classCode}) ? Tous les cours et inscriptions associés à cette classe seront également supprimés.`,
      confirmLabel: "Supprimer la classe",
      variant: "danger",
      onConfirm: () => {
        deleteClass(c.id);
        setIsEditClassOpen(false);
        toast.success("Enregistrement effectué avec succès", `La classe « ${c.title} » a été supprimée avec succès.`);
      },
    });
  };

  const handleDeleteStudent = (u: User) => {
    setConfirmModal({
      isOpen: true,
      title: `Supprimer l'élève « ${u.name} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte élève de « ${u.name} » (${u.email}) ? Cette action est irréversible.`,
      confirmLabel: "Supprimer l'élève",
      variant: "danger",
      onConfirm: () => {
        deleteUser(u.id);
        setIsEditStudentOpen(false);
        toast.success("Enregistrement effectué avec succès", `Le compte élève « ${u.name} » a été supprimé.`);
      },
    });
  };

  const handleDeleteTeacher = (u: User) => {
    setConfirmModal({
      isOpen: true,
      title: `Supprimer l'enseignant « ${u.name} » ?`,
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte enseignant de « ${u.name} » (${u.email}) ? Cette action est irréversible.`,
      confirmLabel: "Supprimer l'enseignant",
      variant: "danger",
      onConfirm: () => {
        deleteUser(u.id);
        setIsEditTeacherOpen(false);
        toast.success("Enregistrement effectué avec succès", `L'enseignant « ${u.name} » a été supprimé.`);
      },
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Hero Director Banner */}
      <div className="relative rounded-[28px] p-6 sm:p-8 overflow-hidden bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-500/30 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Top Header Row: Title, Badges & Campus Settings */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>ESPACE DIRECTION & ADMINISTRATION D'ÉTABLISSEMENT</span>
              </div>
              {currentEtab?.code && (
                <span className="px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-mono font-semibold">
                  {currentEtab.code}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {currentEtab?.name || "Administration du Campus"}
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              En tant que Directeur, vous avez le contrôle total sur votre établissement : inscrivez vos <strong>Élèves</strong>, recrutez vos <strong>Professeurs</strong>, ouvrez vos <strong>Classes</strong> et validez les admissions.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={handleOpenEditCampus}
              className="px-4 py-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-2 transition-all shadow-md hover:border-amber-400"
              title="Modifier les informations et mot de passe du campus"
            >
              <Edit className="w-4 h-4 text-amber-400" />
              <span>Modifier Campus</span>
            </button>
          </div>
        </div>

        {/* Quick Action Buttons Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setIsAddStudentOpen(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-blue-500/20 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-xs text-white">+ Inscrire Élève</div>
              <div className="text-[10px] text-sky-100/80 font-normal">Nouveau compte</div>
            </div>
          </button>

          <button
            onClick={() => setIsAddTeacherOpen(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="p-2 rounded-xl bg-black/15 group-hover:bg-black/25 transition-colors">
              <Users className="w-4 h-4 text-slate-950" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-xs text-slate-950">+ Inscrire Professeur</div>
              <div className="text-[10px] text-emerald-950/80 font-normal">Recruter enseignant</div>
            </div>
          </button>

          <button
            onClick={() => setIsAddClassOpen(true)}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="p-2 rounded-xl bg-black/15 group-hover:bg-black/25 transition-colors">
              <FolderKanban className="w-4 h-4 text-slate-950" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-xs text-slate-950">+ Créer Classe</div>
              <div className="text-[10px] text-amber-950/80 font-normal">Ouvrir promotion</div>
            </div>
          </button>

          <button
            onClick={() => onNavigate && onNavigate("courses")}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/20 flex items-center gap-3 transition-all transform hover:-translate-y-0.5 group"
          >
            <div className="p-2 rounded-xl bg-white/20 group-hover:bg-white/30 transition-colors">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-xs text-white">+ Publier Cours</div>
              <div className="text-[10px] text-purple-100/80 font-normal">Leçons & vidéos</div>
            </div>
          </button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab("STUDENTS")}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "STUDENTS" ? "border-sky-500/60 bg-sky-950/20" : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">🎓 Élèves Inscrits</span>
            <GraduationCap className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-white">{schoolStudents.length}</span>
            <span className="text-[10px] text-slate-400">Effectif total</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("TEACHERS")}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "TEACHERS" ? "border-emerald-500/60 bg-emerald-950/20" : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">👨‍🏫 Professeurs</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-emerald-300">{schoolTeachers.length}</span>
            <span className="text-[10px] text-slate-400">Corps enseignant</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("CLASSES")}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "CLASSES" ? "border-amber-500/60 bg-amber-950/20" : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">🏫 Classes Ouvertes</span>
            <FolderKanban className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-amber-300">{schoolClasses.length}</span>
            <span className="text-[10px] text-slate-400">Classes actives</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab("INSCRIPTIONS")}
          className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "INSCRIPTIONS" ? "border-purple-500/60 bg-purple-950/20" : "border-slate-800 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">📝 Candidatures</span>
            <UserCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-black text-purple-300">{schoolInscriptions.length}</span>
            <span className="text-[10px] text-amber-400 font-bold font-mono">
              ({pendingInscriptionsCount} en attente)
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar whitespace-nowrap -mx-1 px-1">
        <button
          onClick={() => setActiveTab("STUDENTS")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "STUDENTS"
              ? "bg-sky-600 text-white shadow-lg shadow-sky-600/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-sky-300" />
          <span><span className="hidden sm:inline">Inscription & </span>Élèves ({schoolStudents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TEACHERS")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "TEACHERS"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-300" />
          <span><span className="hidden sm:inline">Gestion des </span>Professeurs ({schoolTeachers.length})</span>
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
          <span><span className="hidden sm:inline">Création des </span>Classes ({schoolClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("INSCRIPTIONS")}
          className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
            activeTab === "INSCRIPTIONS"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4 text-purple-300" />
          <span>Préinscriptions</span>
          {pendingInscriptionsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono text-[10px] font-black animate-pulse">
              {pendingInscriptionsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: STUDENTS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "STUDENTS" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher un élève par nom, email, identifiant..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              onClick={() => setIsAddStudentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 flex items-center gap-2 transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Inscrire un Nouvel Élève</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Élève & Identité</th>
                    <th className="py-3.5 px-4">Login / Identifiant</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Mot de Passe</th>
                    <th className="py-3.5 px-4">Classe Rattachée</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        Aucun élève inscrit sur ce campus. Cliquez sur « + Inscrire un Nouvel Élève » pour ajouter vos élèves.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isPwdVisible = visiblePasswords[s.id] || false;
                      const pwd = s.password || "Madouu1966@";
                      const studentLogin = s.username || s.name.split(" ")[0].toLowerCase();
                      const studentInscription = inscriptions.find((i) => i.userId === s.id);

                      return (
                        <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={s.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                                alt={s.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white text-xs">{s.name}</p>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {s.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-mono text-sky-300 font-bold bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                              {studentLogin}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">{s.email}</td>

                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 bg-slate-900 px-2 py-1 rounded border border-slate-700/80 font-bold">
                                {isPwdVisible ? pwd : "••••••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(s.id)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                {isPwdVisible ? <EyeOff className="w-3.5 h-3.5 text-sky-400" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            {studentInscription ? (
                              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                                {studentInscription.classeTitle}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic">Tronc Commun</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenEditStudent(s)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 transition-all mr-1.5"
                              title="Modifier l'élève"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                              title="Supprimer l'élève"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      {/* SUB-TAB 2: TEACHERS MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "TEACHERS" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher un professeur par nom, matière, email..."
                value={teacherSearch}
                onChange={(e) => setTeacherSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              onClick={() => setIsAddTeacherOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Inscrire un Professeur</span>
            </button>
          </div>

          {/* Teachers Table */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Professeur</th>
                    <th className="py-3.5 px-4">Matière / Spécialité</th>
                    <th className="py-3.5 px-4">Identifiant & Email</th>
                    <th className="py-3.5 px-4">Mot de Passe</th>
                    <th className="py-3.5 px-4">Classes Affectées</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400">
                        Aucun professeur enregistré sur ce campus. Cliquez sur « + Inscrire un Professeur ».
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t) => {
                      const isPwdVisible = visiblePasswords[t.id] || false;
                      const pwd = t.password || "Madouu1966@";
                      const tLogin = t.username || t.name.split(" ")[0].toLowerCase();
                      const teacherClasses = schoolClasses.filter(
                        (c) => c.teacherId === t.id
                      );

                      return (
                        <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={t.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"}
                                alt={t.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                              />
                              <div>
                                <p className="font-bold text-white text-xs">{t.name}</p>
                                <span className="text-[10px] text-slate-500 font-mono">ID: {t.id}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-emerald-300 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-500/30 text-[11px]">
                              {t.bio?.includes("Enseignant en ") ? t.bio.split(".")[0].replace("Enseignant en ", "") : "Discipline Générale"}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-slate-300">
                            <span className="font-bold text-white block">{tLogin}</span>
                            <span className="text-[10px] text-slate-400">{t.email}</span>
                          </td>

                          <td className="py-3 px-4 font-mono">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-200 bg-slate-900 px-2 py-1 rounded border border-slate-700/80 font-bold">
                                {isPwdVisible ? pwd : "••••••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(t.id)}
                                className="p-1 text-slate-400 hover:text-white"
                              >
                                {isPwdVisible ? <EyeOff className="w-3.5 h-3.5 text-emerald-400" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {teacherClasses.map((c) => (
                                <span key={c.id} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                                  {c.title}
                                </span>
                              ))}
                              {teacherClasses.length === 0 && (
                                <span className="text-slate-500 italic text-[11px]">Non assigné</span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleOpenEditTeacher(t)}
                              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-all mr-1.5"
                              title="Modifier le professeur"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTeacher(t)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                              title="Supprimer le professeur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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
      {/* SUB-TAB 3: CLASSES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === "CLASSES" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher une classe, code d'accès, professeur..."
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => setIsAddClassOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all shrink-0"
            >
              <PlusCircle className="w-4 h-4 fill-black" />
              <span>+ Créer une Nouvelle Classe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.length === 0 ? (
              <div className="col-span-full py-12 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400">
                Aucune classe enregistrée pour cet établissement. Cliquez sur « + Créer une Nouvelle Classe ».
              </div>
            ) : (
              filteredClasses.map((cls) => (
                <div key={cls.id} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4 shadow-xl flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono text-xs font-bold">
                        {cls.classCode}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">{cls.level}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-white leading-snug">{cls.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{cls.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Professeur assigné :</span>
                      <span className="font-bold text-white">{cls.teacherName || "Non assigné"}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span>Effectif :</span>
                      <span className="font-bold text-sky-400">
                        {cls.enrolledCount || 0} / {cls.capacity} élèves
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      onClick={() => handleOpenEditClass(cls)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Modifier</span>
                    </button>

                    {onSelectClassForCourses && (
                      <button
                        onClick={() => onSelectClassForCourses(cls.id)}
                        className="flex-1 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Cours</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteClass(cls)}
                      title="Supprimer définitivement cette classe"
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center justify-center shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: CAMPUS INSCRIPTIONS & ADMISSIONS */}
      {/* ========================================================================= */}
      {activeTab === "INSCRIPTIONS" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 glass-panel rounded-2xl border border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rechercher parmi les candidatures du campus..."
                value={inscriptionSearch}
                onChange={(e) => setInscriptionSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/15 px-3 py-1 rounded-xl border border-amber-500/30">
              {pendingInscriptionsCount} candidature(s) en attente
            </span>
          </div>

          <div className="space-y-3">
            {filteredInscriptions.length === 0 ? (
              <div className="py-12 text-center glass-panel rounded-3xl border border-slate-800 text-slate-400">
                Aucune demande de pré-inscription pour ce campus.
              </div>
            ) : (
              filteredInscriptions.map((ins) => (
                <div key={ins.id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{ins.userName}</h4>
                      <span className="text-xs text-slate-400">({ins.userEmail})</span>
                      {ins.role === "TEACHER" ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          👨‍🏫 Enseignant ({ins.subject || "Discipline générale"})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                          🎓 Élève
                        </span>
                      )}
                      {ins.status === "PENDING" && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> En attente
                        </span>
                      )}
                      {ins.status === "APPROVED" && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Validé
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-indigo-300">
                      Classe visée : <span className="text-white font-semibold">{ins.classeTitle}</span>
                    </p>
                    {ins.motivation && (
                      <p className="text-xs text-slate-400 italic">« {ins.motivation} »</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ins.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => approveInscription(ins.id)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accepter</span>
                        </button>
                        <button
                          onClick={() => rejectInscription(ins.id)}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-700 text-xs transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Refuser</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD STUDENT */}
      {/* ========================================================================= */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-sky-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Inscrire un Nouvel Élève</h3>
                  <p className="text-xs text-sky-400 font-mono">{currentEtab?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAddStudentOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom Complet de l&apos;Élève *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aminata Diallo, Mohamed Traoré..."
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login / Identifiant</label>
                  <input
                    type="text"
                    placeholder="Auto si vide"
                    value={newStudentUsername}
                    onChange={(e) => setNewStudentUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email de l&apos;Élève *</label>
                  <input
                    type="email"
                    required
                    placeholder="eleve@exemple.com"
                    value={newStudentEmail}
                    onChange={(e) => setNewStudentEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mot de Passe *</label>
                  <input
                    type="text"
                    required
                    value={newStudentPassword}
                    onChange={(e) => setNewStudentPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Affecter à une Classe</label>
                  <select
                    value={newStudentClasseId}
                    onChange={(e) => setNewStudentClasseId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="">-- Tronc Commun --</option>
                    {schoolClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({c.classCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button type="button" onClick={() => setIsAddStudentOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer l&apos;Élève</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD TEACHER */}
      {/* ========================================================================= */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Inscrire un Nouveau Professeur</h3>
                  <p className="text-xs text-emerald-400 font-mono">{currentEtab?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAddTeacherOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom Complet du Professeur *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dr. Mamadou Coulibaly..."
                  value={newTeacherName}
                  onChange={(e) => setNewTeacherName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Login / Identifiant</label>
                  <input
                    type="text"
                    placeholder="Auto si vide"
                    value={newTeacherUsername}
                    onChange={(e) => setNewTeacherUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Institutionnel *</label>
                  <input
                    type="email"
                    required
                    placeholder="prof@exemple.com"
                    value={newTeacherEmail}
                    onChange={(e) => setNewTeacherEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Matière / Discipline Enseignée *</label>
                  <select
                    value={newTeacherSubject}
                    onChange={(e) => setNewTeacherSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {COMMON_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mot de Passe *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherPassword}
                    onChange={(e) => setNewTeacherPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {newTeacherSubject === "Autre spécialité" && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Précisez la matière :</label>
                  <input
                    type="text"
                    placeholder="Ex: Espagnol, Sciences Économiques..."
                    value={newTeacherCustomSubject}
                    onChange={(e) => setNewTeacherCustomSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Diplômes & Expérience (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: Master 2 Mathématiques, 8 ans d'expérience"
                  value={newTeacherDiploma}
                  onChange={(e) => setNewTeacherDiploma(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button type="button" onClick={() => setIsAddTeacherOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Enregistrer l&apos;Enseignant</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD CLASS */}
      {/* ========================================================================= */}
      {isAddClassOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Créer une Classe pour ce Campus</h3>
                  <p className="text-xs text-amber-400 font-mono">{currentEtab?.name}</p>
                </div>
              </div>
              <button onClick={() => setIsAddClassOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom / Titre de la Classe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Terminale Scientifique (Tle S2) - Mathématiques"
                  value={newClassTitle}
                  onChange={(e) => setNewClassTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code Classe (Optionnel)</label>
                  <input
                    type="text"
                    placeholder="Auto si vide"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau d&apos;Étude *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Seconde, 1ère, Terminale..."
                    value={newClassLevel}
                    onChange={(e) => setNewClassLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Professeur Responsable</label>
                  <select
                    value={newClassTeacherId}
                    onChange={(e) => setNewClassTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Assigner plus tard --</option>
                    {schoolTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacité Max (Élèves)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={newClassCapacity}
                    onChange={(e) => setNewClassCapacity(parseInt(e.target.value) || 35)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Programme</label>
                <textarea
                  rows={2}
                  placeholder="Objectifs et compétences..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button type="button" onClick={() => setIsAddClassOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 fill-black" />
                  <span>Créer la Classe</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EDIT CAMPUS / ETABLISSEMENT */}
      {/* ========================================================================= */}
      {isEditCampusOpen && currentEtab && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-blue-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modifier les Infos de l&apos;Établissement</h3>
                  <p className="text-xs text-blue-400 font-mono">{currentEtab.code} • {currentEtab.subdomain}.alfasle.com</p>
                </div>
              </div>
              <button onClick={() => setIsEditCampusOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCampus} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom de l&apos;Établissement *</label>
                <input
                  type="text"
                  required
                  value={editCampusName}
                  onChange={(e) => setEditCampusName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Téléphone de Contact</label>
                  <input
                    type="text"
                    value={editCampusPhone}
                    onChange={(e) => setEditCampusPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Adresse & Ville</label>
                  <input
                    type="text"
                    value={editCampusAddress}
                    onChange={(e) => setEditCampusAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Identifiants du Directeur</p>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nom du Directeur *</label>
                  <input
                    type="text"
                    required
                    value={editCampusDirectorName}
                    onChange={(e) => setEditCampusDirectorName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mot de Passe du Directeur *</label>
                  <div className="relative">
                    <input
                      type={showCampusDirectorPassword ? "text" : "password"}
                      required
                      value={editCampusDirectorPassword}
                      onChange={(e) => setEditCampusDirectorPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCampusDirectorPassword(!showCampusDirectorPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showCampusDirectorPassword ? <EyeOff className="w-4 h-4 text-blue-400" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description du Campus</label>
                <textarea
                  rows={3}
                  value={editCampusDesc}
                  onChange={(e) => setEditCampusDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button type="button" onClick={() => setIsEditCampusOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                  Annuler
                </button>
                <button type="submit" className="px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mettre à jour l&apos;Établissement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: EDIT STUDENT */}
      {/* ========================================================================= */}
      {isEditStudentOpen && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-sky-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modifier l&apos;Élève</h3>
                  <p className="text-xs text-sky-400 font-mono">{editingStudent.name}</p>
                </div>
              </div>
              <button onClick={() => setIsEditStudentOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStudent} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  value={editStudentName}
                  onChange={(e) => setEditStudentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editStudentEmail}
                    onChange={(e) => setEditStudentEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Identifiant / Login</label>
                  <input
                    type="text"
                    value={editStudentUsername}
                    onChange={(e) => setEditStudentUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sky-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mot de Passe *</label>
                <div className="relative">
                  <input
                    type={showEditStudentPassword ? "text" : "password"}
                    required
                    value={editStudentPassword}
                    onChange={(e) => setEditStudentPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditStudentPassword(!showEditStudentPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showEditStudentPassword ? <EyeOff className="w-4 h-4 text-sky-400" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio / Notes</label>
                <textarea
                  rows={2}
                  value={editStudentBio}
                  onChange={(e) => setEditStudentBio(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteStudent(editingStudent)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Supprimer l&apos;Élève</span>
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsEditStudentOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT TEACHER */}
      {/* ========================================================================= */}
      {isEditTeacherOpen && editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modifier le Professeur</h3>
                  <p className="text-xs text-emerald-400 font-mono">{editingTeacher.name}</p>
                </div>
              </div>
              <button onClick={() => setIsEditTeacherOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditTeacher} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom Complet *</label>
                <input
                  type="text"
                  required
                  value={editTeacherName}
                  onChange={(e) => setEditTeacherName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={editTeacherEmail}
                    onChange={(e) => setEditTeacherEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Identifiant / Login</label>
                  <input
                    type="text"
                    value={editTeacherUsername}
                    onChange={(e) => setEditTeacherUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Matière / Spécialité</label>
                  <select
                    value={editTeacherSubject}
                    onChange={(e) => setEditTeacherSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                  >
                    {COMMON_SUBJECTS.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mot de Passe *</label>
                  <div className="relative">
                    <input
                      type={showEditTeacherPassword ? "text" : "password"}
                      required
                      value={editTeacherPassword}
                      onChange={(e) => setEditTeacherPassword(e.target.value)}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditTeacherPassword(!showEditTeacherPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showEditTeacherPassword ? <EyeOff className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bio & Expérience</label>
                <textarea
                  rows={2}
                  value={editTeacherBio}
                  onChange={(e) => setEditTeacherBio(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteTeacher(editingTeacher)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Supprimer le Professeur</span>
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsEditTeacherOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 7: EDIT CLASS */}
      {/* ========================================================================= */}
      {isEditClassOpen && editingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg bg-[#0a0f1e] border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-800 bg-[#070b16] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Modifier la Classe</h3>
                  <p className="text-xs text-amber-400 font-mono">{editingClass.classCode} • {editingClass.title}</p>
                </div>
              </div>
              <button onClick={() => setIsEditClassOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClass} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom / Titre de la Classe *</label>
                <input
                  type="text"
                  required
                  value={editClassTitle}
                  onChange={(e) => setEditClassTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Code Classe *</label>
                  <input
                    type="text"
                    required
                    value={editClassCode}
                    onChange={(e) => setEditClassCode(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Niveau d&apos;Étude *</label>
                  <input
                    type="text"
                    required
                    value={editClassLevel}
                    onChange={(e) => setEditClassLevel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Professeur Responsable</label>
                  <select
                    value={editClassTeacherId}
                    onChange={(e) => setEditClassTeacherId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">-- Non assigné --</option>
                    {schoolTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capacité Max (Élèves)</label>
                  <input
                    type="number"
                    min={5}
                    max={200}
                    value={editClassCapacity}
                    onChange={(e) => setEditClassCapacity(parseInt(e.target.value) || 35)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Description & Programme</label>
                <textarea
                  rows={2}
                  value={editClassDesc}
                  onChange={(e) => setEditClassDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteClass(editingClass)}
                  className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Supprimer la Classe</span>
                </button>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setIsEditClassOpen(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                    Annuler
                  </button>
                  <button type="submit" className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 fill-black" />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Uniform In-App Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

