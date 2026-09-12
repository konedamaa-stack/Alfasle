"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Etablissement, Classe, User, UserRole } from "@/types";
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
} from "lucide-react";

interface SuperAdminDashboardProps {
  onOpenCreateClassForSchool?: (etablissementId: string) => void;
  onSelectClassForCourses?: (classId: string) => void;
}

export function SuperAdminDashboard({
  onOpenCreateClassForSchool,
  onSelectClassForCourses,
}: SuperAdminDashboardProps) {
  const {
    etablissements,
    classes,
    createEtablissement,
    updateEtablissement,
    deleteEtablissement,
    users,
    createUser,
    updateUser,
    deleteUser,
    currentUser,
  } = useStore();

  // Active top-level Tab
  const [activeTab, setActiveTab] = useState<"ETABLISSEMENTS" | "USERS" | "SYSTEM">("USERS");

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

  // Create User Modal State
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserName, setCreateUserName] = useState("");
  const [createUserUsername, setCreateUserUsername] = useState("");
  const [createUserEmail, setCreateUserEmail] = useState("");
  const [createUserPassword, setCreateUserPassword] = useState("Madouu1966@");
  const [createUserRole, setCreateUserRole] = useState<UserRole>("STUDENT");
  const [createUserEtabId, setCreateUserEtabId] = useState(etablissements[0]?.id || "");
  const [createUserBio, setCreateUserBio] = useState("");

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

  const handleDeleteSchool = (etabId: string, etabName: string) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer l'établissement « ${etabName} » ? Cette action est irréversible.`
      )
    ) {
      deleteEtablissement(etabId);
    }
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
      alert("Impossible de supprimer le compte Super Admin Master principal.");
      return;
    }
    if (window.confirm(`Voulez-vous vraiment supprimer le compte de « ${u.name} » (${u.email}) ?`)) {
      deleteUser(u.id);
    }
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
              Gestion Globale & Identifiants AlFasle
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Modifiez directement les logins, noms, emails et mots de passe de tous les comptes (Élèves, Professeurs, Parents, Directeurs). Les utilisateurs peuvent se connecter sur leur portail avec leur <strong>Nom / Identifiant</strong> ou leur <strong>Email</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {activeTab === "USERS" ? (
              <button
                onClick={() => setIsCreateUserModalOpen(true)}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-xs shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
              >
                <PlusCircle className="w-5 h-5 fill-black" />
                <span>+ Nouvel Utilisateur</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  resetSchoolForm();
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
              >
                <PlusCircle className="w-5 h-5 fill-black" />
                <span>+ Créer Établissement</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 flex-wrap">
        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all ${
            activeTab === "USERS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 Utilisateurs & Identifiants ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("ETABLISSEMENTS")}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all ${
            activeTab === "ETABLISSEMENTS"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>🏫 Établissements & Campus ({etablissements.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("SYSTEM")}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2.5 transition-all ${
            activeTab === "SYSTEM"
              ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
              : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>📊 Monitoring & Quotas</span>
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
                            <span className="flex items-center gap-1">
                              <Mail className="w-3.5 h-3.5 text-slate-400" />
                              {etab.directorEmail}
                            </span>
                          )}
                          <span className="flex items-center gap-1 font-mono text-blue-400">
                            <Globe2 className="w-3.5 h-3.5" />
                            .{etab.subdomain}.alfasle.xyz
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons on Establishment */}
                    <div className="flex items-center gap-2 flex-wrap self-end md:self-center">
                      {onOpenCreateClassForSchool && (
                        <button
                          type="button"
                          onClick={() => onOpenCreateClassForSchool(etab.id)}
                          className="px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
                          <span>+ Ajouter Classe</span>
                        </button>
                      )}

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
                  placeholder="Ex: Prof. Sarah Mansouri, Amine Benali..."
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
                    placeholder="Ex: kone, sarah, amine..."
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
                      placeholder="Ex: Institut Supérieur Polytechnique KONE, Groupe Scolaire Raya 1..."
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
                        placeholder="Ex: ALF-RAY-01 (Auto si vide)"
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
                          placeholder="ex: raya1"
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
    </div>
  );
}
