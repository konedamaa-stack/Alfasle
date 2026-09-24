"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Etablissement, UserRole, User, Classe } from "@/types";
import {
  School,
  GraduationCap,
  Shield,
  BookOpen,
  Eye,
  EyeOff,
  LogIn,
  KeyRound,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Globe,
  ExternalLink,
  Users,
  Award,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { PreRegistrationModal } from "@/components/inscriptions/PreRegistrationModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { InscriptionRole } from "@/types";

interface SchoolSubdomainPortalProps {
  etablissement: Etablissement;
  onLoginSuccess: () => void;
  onOpenJoinClassModal: () => void;
  onBackToGlobal: () => void;
}

export function SchoolSubdomainPortal({
  etablissement,
  onLoginSuccess,
  onOpenJoinClassModal,
  onBackToGlobal,
}: SchoolSubdomainPortalProps) {
  const { users, currentUser, setCurrentUser, classes, inscriptions, resetStoreToDefaults } = useStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [identifier, setIdentifier] = useState(() => {
    return etablissement.directorEmail || etablissement.directorName || `directeur@${etablissement.subdomain}.alfasle.edu`;
  });
  const [password, setPassword] = useState(() => {
    return etablissement.directorPassword || "Madouu1966@";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPreRegModalOpen, setIsPreRegModalOpen] = useState(false);
  const [preRegRole, setPreRegRole] = useState<InscriptionRole>("STUDENT");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Classes specific to this establishment
  const schoolClasses = classes.filter((c) => c.etablissementId === etablissement.id);
  const enrolledCount = schoolClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg("");
    if (role === "ADMIN") {
      setIdentifier(etablissement.directorEmail || "konedamaa@gmail.com");
      setPassword(etablissement.directorPassword || "Madouu1966");
    } else if (role === "TEACHER") {
      setIdentifier("sarah.mansouri@alfasle.edu");
      setPassword("Madouu1966");
    } else if (role === "STUDENT") {
      setIdentifier("KONE");
      setPassword("Madouu1966");
    } else if (role === "PARENT") {
      setIdentifier("parent.kone@gmail.com");
      setPassword("Madouu1966");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const cleanId = identifier.trim().toLowerCase();
    const inputPass = password.trim();

    if (!cleanId) {
      setErrorMsg("Veuillez saisir votre identifiant ou adresse email.");
      return;
    }

    // 1. Direct login to Campus Director Dashboard for Direction role
    if (selectedRole === "ADMIN") {
      const isDirectorKone =
        cleanId === "konedamaa@gmail.com" ||
        cleanId === "konedma@gmil.com" ||
        cleanId === "konedamaa" ||
        cleanId === "konedama";

      if (isDirectorKone) {
        if (inputPass && inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin") {
          setErrorMsg("Mot de passe incorrect pour le compte Directeur (utilisez Madouu1966).");
          return;
        }

        const dirUser: User = {
          id: `u_dir_${etablissement.id}`,
          name: "KONE ADAMA (Directeur)",
          email: "konedamaa@gmail.com",
          username: "konedamaa",
          role: "ADMIN",
          password: "Madouu1966",
          etablissementId: etablissement.id,
          etablissementName: etablissement.name,
          bio: `Directeur officiel de ${etablissement.name}`,
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          createdAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("alfasle_active_tab", "dashboard");
          localStorage.setItem("alfasle_user_role", "ADMIN");
        }
        setCurrentUser(dirUser);
        onLoginSuccess();
        return;
      }

      const isDirectorSanogo =
        cleanId === "sanogo@gmail.com" ||
        cleanId === "sanogo";

      if (isDirectorSanogo) {
        let dirUser = users.find(
          (u) =>
            u.email.toLowerCase() === "sanogo@gmail.com" ||
            (u.username && u.username.toLowerCase() === "sanogo")
        );

        if (!dirUser) {
          dirUser = {
            id: `u_dir_sanogo_${etablissement.id}`,
            name: "M. SANOGO (Directeur)",
            email: "sanogo@gmail.com",
            username: "sanogo",
            role: "ADMIN",
            password: inputPass || "Madouu1966",
            etablissementId: etablissement.id,
            etablissementName: etablissement.name,
            bio: `Directeur officiel de ${etablissement.name}`,
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            createdAt: new Date().toISOString(),
          };
        } else {
          dirUser = {
            ...dirUser,
            name: "M. SANOGO (Directeur)",
            email: "sanogo@gmail.com",
            role: "ADMIN",
          };
        }

        if (typeof window !== "undefined") {
          localStorage.setItem("alfasle_active_tab", "dashboard");
          localStorage.setItem("alfasle_user_role", "ADMIN");
        }
        setCurrentUser(dirUser);
        onLoginSuccess();
        return;
      }

      let dirUser = users.find(
        (u) =>
          (u.email.toLowerCase() === cleanId ||
            (u.username && u.username.toLowerCase() === cleanId) ||
            u.name.toLowerCase().includes(cleanId)) &&
          u.role === "ADMIN"
      );

      if (!dirUser) {
        dirUser = {
          id: `u_dir_${etablissement.id}`,
          name: etablissement.directorName || identifier.trim() || "Direction de l'Établissement",
          email: identifier.includes("@")
            ? identifier.trim()
            : etablissement.directorEmail || `${etablissement.subdomain}.directeur@alfasle.edu`,
          username: identifier.trim().toLowerCase(),
          role: "ADMIN",
          password: inputPass || "Madouu1966",
          etablissementId: etablissement.id,
          etablissementName: etablissement.name,
          bio: `Directeur officiel de ${etablissement.name}`,
          createdAt: new Date().toISOString(),
        };
      } else {
        dirUser = {
          ...dirUser,
          role: "ADMIN",
          etablissementId: etablissement.id,
          etablissementName: etablissement.name,
        };
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("alfasle_active_tab", "dashboard");
        localStorage.setItem("alfasle_user_role", "ADMIN");
      }
      setCurrentUser(dirUser);
      onLoginSuccess();
      return;
    }

    // Super Admin Master Shortcut (only if not logging in as ADMIN)
    const isSuperAdmin =
      cleanId === "superadmin" ||
      cleanId === "root" ||
      cleanId === "konedamaa@gmail.com" ||
      cleanId === "konedma@gmil.com" ||
      cleanId === "konedamaa";

    if (isSuperAdmin) {
      if (inputPass && inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin") {
        setErrorMsg("Mot de passe incorrect pour le compte Super Admin Master.");
        return;
      }

      let superUser =
        users.find((u) => u.role === "SUPER_ADMIN") ||
        users.find((u) => u.email.toLowerCase() === "konedamaa@gmail.com");

      if (!superUser) {
        superUser = {
          id: "u_super_admin_root",
          name: "KONE ADAMA (Super Admin Master)",
          email: "konedamaa@gmail.com",
          username: "konedamaa",
          role: "SUPER_ADMIN",
          bio: "Super Administrateur Global de la Plateforme AlFasle Multi-Établissements.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          createdAt: new Date().toISOString(),
        };
      } else {
        superUser = {
          ...superUser,
          role: "SUPER_ADMIN",
        };
      }

      setCurrentUser(superUser);

      if (typeof window !== "undefined") {
        window.location.href = "/super-admin";
        return;
      }

      onLoginSuccess();
      return;
    }

    // 1. Exact match on username or email
    let matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId)
    );

    // 2. Exact match with role preference
    if (!matchedUser) {
      matchedUser = users.find(
        (u) =>
          (u.email.toLowerCase() === cleanId ||
            (u.username && u.username.toLowerCase() === cleanId)) &&
          u.role === selectedRole
      );
    }

    // 3. Name match
    if (!matchedUser) {
      matchedUser = users.find((u) => u.name.toLowerCase() === cleanId);
    }
    if (!matchedUser) {
      matchedUser = users.find(
        (u) =>
          u.name.toLowerCase().includes(cleanId) &&
          u.role === selectedRole
      );
    }
    if (!matchedUser) {
      matchedUser = users.find(
        (u) =>
          u.name.toLowerCase().includes(cleanId) ||
          u.email.toLowerCase().includes(cleanId) ||
          (u.username && u.username.toLowerCase() === cleanId)
      );
    }

    // 4. Fallback
    if (!matchedUser && cleanId.length === 0) {
      matchedUser = users.find((u) => u.role === selectedRole);
    }

    // 5. Direct Director / Admin Fallback on this campus
    if (
      !matchedUser &&
      ((etablissement.directorEmail &&
        etablissement.directorEmail.toLowerCase().includes(cleanId)) ||
        (etablissement.directorName &&
          etablissement.directorName.toLowerCase().includes(cleanId)) ||
        cleanId.includes("directeur") ||
        cleanId.includes("direction") ||
        cleanId.includes("admin"))
    ) {
      matchedUser = {
        id: `u_dir_${etablissement.id}`,
        name: etablissement.directorName || identifier.trim() || "Directeur de l'Établissement",
        email: identifier.includes("@")
          ? identifier.trim()
          : etablissement.directorEmail || `${etablissement.subdomain}.directeur@alfasle.edu`,
        username: identifier.trim().toLowerCase(),
        role: "ADMIN",
        password: inputPass || "Madouu1966@",
        etablissementId: etablissement.id,
        etablissementName: etablissement.name,
        bio: `Directeur & Administrateur officiel de ${etablissement.name}`,
        createdAt: new Date().toISOString(),
      };
    }

    if (matchedUser) {
      const expectedPass = (matchedUser.password || "Madouu1966@").trim();
      const isMasterPass = inputPass === "Madouu1966@" || inputPass === "admin";
      const isCorrectPass = inputPass === expectedPass || isMasterPass;

      if (inputPass && !isCorrectPass) {
        setErrorMsg("Mot de passe incorrect pour cet identifiant.");
        return;
      }

      if (matchedUser.role === "SUPER_ADMIN") {
        setCurrentUser(matchedUser);
        if (typeof window !== "undefined") {
          window.location.href = "/super-admin";
          return;
        }
      }

      setCurrentUser({
        ...matchedUser,
        etablissementId: etablissement.id,
        etablissementName: etablissement.name,
      });
      onLoginSuccess();
    } else {
      setErrorMsg("Identifiant ou email introuvable sur cet établissement.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#080504] text-slate-100 relative overflow-hidden selection:bg-[#8B4513] selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#7B3F00]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#3D1A04]/25 rounded-full blur-[130px] pointer-events-none" />

      {/* Subdomain Top Indicator Bar */}
      <div className="w-full bg-[#110c09] border-b border-[#8B4513]/25 py-2 px-3 sm:px-8 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20">
        <div className="flex items-center gap-2 font-mono flex-wrap">
          <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-slate-400">Sous-Domaine :</span>
          <span className="text-amber-300 font-bold bg-[#7B3F00]/20 px-2 py-0.5 rounded-md border border-[#8B4513]/30 text-[11px] truncate max-w-[220px] sm:max-w-none">
            https://{etablissement.subdomain}.alfasle.edu
          </span>
        </div>

        <button
          onClick={onBackToGlobal}
          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-[11px] self-end sm:self-auto"
        >
          <span>Changer d&apos;établissement (Portail Global)</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Main Subdomain Header */}
      <header className="w-full max-w-7xl mx-auto px-3 sm:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#8B4513] via-[#A0522D] to-[#5C2D0A] p-0.5 shadow-lg shadow-[#7B3F00]/30 shrink-0">
            <img
              src={
                etablissement.logoUrl ||
                "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150"
              }
              alt={etablissement.name}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-white truncate">{etablissement.name}</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#7B3F00]/25 text-amber-200 border border-[#8B4513]/40">
                {etablissement.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{etablissement.city}, {etablissement.country} • {etablissement.type}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap justify-end">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              setPreRegRole("STUDENT");
              setIsPreRegModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-md transition-all transform hover:-translate-y-0.5"
            title="Pré-inscription"
          >
            <span>📝</span>
            <span className="hidden sm:inline">Pré-inscription</span>
          </button>

          <button
            onClick={onOpenJoinClassModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#7B3F00]/25 hover:bg-[#7B3F00]/35 text-amber-200 border border-[#8B4513]/40 text-xs font-semibold shadow-md transition-all"
            title="Rejoindre une classe"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Rejoindre une classe</span>
            <span className="sm:hidden">Rejoindre</span>
          </button>
        </div>
      </header>

      {/* Center Subdomain Login Card (Split-Screen) */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10 w-full max-w-7xl mx-auto">
        <div className="w-full max-w-4xl bg-[#120d0a] border border-[#8B4513]/40 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl shadow-[#3D1A04]/60 grid grid-cols-1 md:grid-cols-12 min-h-[540px]">

          {/* LEFT COLUMN: School Custom Theme Banner (Brown) */}
          <div className="md:col-span-5 bg-gradient-to-br from-[#8B4513] via-[#7B3F00] to-[#3D1A04] p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Badge specific to establishment */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold shadow-sm">
                <span>🏫</span>
                <span className="tracking-wide uppercase truncate max-w-[200px]">
                  {etablissement.name}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Espace Campus & Cours en Ligne !
                </h2>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  {etablissement.description}
                </p>
              </div>

              {/* School Metrics */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 text-xs">
                <div className="flex items-center justify-between text-amber-100">
                  <span>Classes disponibles sur ce campus :</span>
                  <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {schoolClasses.length} Classes
                  </span>
                </div>
                <div className="flex items-center justify-between text-amber-200">
                  <span>Effectif inscrits :</span>
                  <span className="font-bold">{enrolledCount} Élèves</span>
                </div>
                {etablissement.directorName && (
                  <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200">
                    <span>Directeur :</span>
                    <span className="font-semibold">{etablissement.directorName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-amber-200/80">
              Instance sécurisée : <strong className="text-white">{etablissement.subdomain}.alfasle.edu</strong>
            </div>
          </div>

          {/* RIGHT COLUMN: School-scoped Login Form */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#0e0907]">
            <div className="space-y-6">

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">
                    Portail Étudiant & Enseignant
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {etablissement.code}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                  Se connecter à {etablissement.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Accédez aux cours, devoirs et ressources dispensés par votre établissement.
                </p>
              </div>

              {/* 4 Role Selector Buttons - Direction FIRST */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "ADMIN"
                      ? "bg-[#7B3F00]/30 border-[#8B4513] text-white shadow-md ring-2 ring-[#8B4513]/40"
                      : "bg-[#160f0b] border-[#5C2D0A]/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👑</span>
                  <span className="text-[10px] font-bold">Direction</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("TEACHER")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "TEACHER"
                      ? "bg-[#7B3F00]/30 border-[#8B4513] text-white shadow-md ring-2 ring-[#8B4513]/40"
                      : "bg-[#160f0b] border-[#5C2D0A]/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👨‍🏫</span>
                  <span className="text-[10px] font-bold">Prof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "STUDENT"
                      ? "bg-[#7B3F00]/30 border-[#8B4513] text-white shadow-md ring-2 ring-[#8B4513]/40"
                      : "bg-[#160f0b] border-[#5C2D0A]/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-[10px] font-bold">Élève</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("PARENT")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "PARENT"
                      ? "bg-[#7B3F00]/30 border-[#8B4513] text-white shadow-md ring-2 ring-[#8B4513]/40"
                      : "bg-[#160f0b] border-[#5C2D0A]/40 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👨‍👩‍👧</span>
                  <span className="text-[10px] font-bold">Parent</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    {selectedRole === "ADMIN"
                      ? "Identifiant Direction / Nom / Email *"
                      : selectedRole === "TEACHER"
                      ? "Identifiant Enseignant / Nom / Email *"
                      : selectedRole === "PARENT"
                      ? "Identifiant Parent / Nom / Email *"
                      : "Identifiant Élève / Nom / Email *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === "ADMIN"
                        ? `Ex: ${etablissement.directorName || "Directeur"} ou email...`
                        : selectedRole === "TEACHER"
                        ? "Ex: sarah.mansouri@alfasle.edu..."
                        : selectedRole === "PARENT"
                        ? "Ex: parent.kone@gmail.com..."
                        : "Ex: KONE ou matricule..."
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#070504] border border-[#5C2D0A]/60 text-white focus:outline-none focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/40"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#070504] border border-[#5C2D0A]/60 text-white focus:outline-none focus:border-[#8B4513] focus:ring-1 focus:ring-[#8B4513]/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#8B4513] via-[#7B3F00] to-[#5C2D0A] hover:opacity-95 text-white font-bold shadow-lg shadow-[#7B3F00]/40 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Accéder à mon Espace {etablissement.name}</span>
                </button>
              </form>

              {/* Quick 1-Click Demo Profiles */}
              <div className="pt-3 border-t border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 mb-2">
                  ⚡ Connexion Rapide Démo sur ce Campus :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const dirUser: User = {
                        id: `u_dir_${etablissement.id}`,
                        name: etablissement.directorName || "Direction de l'Établissement",
                        email: etablissement.directorEmail || `${etablissement.subdomain}.directeur@alfasle.edu`,
                        username: "directeur",
                        role: "ADMIN",
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                        bio: `Directeur officiel de ${etablissement.name}`,
                        createdAt: new Date().toISOString(),
                      };
                      setCurrentUser(dirUser);
                      onLoginSuccess();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-[#3D1A04]/60 border border-[#8B4513]/50 hover:border-[#A0522D] text-left transition-all text-xs group"
                  >
                    <span className="text-base">👑</span>
                    <div>
                      <p className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200">
                        Direction (Admin)
                      </p>
                      <p className="text-[9px] text-slate-400">Élèves, profs & classes</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const tc = users.find((u) => u.role === "TEACHER") || users[0];
                      setCurrentUser({
                        ...tc,
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                      });
                      onLoginSuccess();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#8B4513] text-left transition-all text-xs"
                  >
                    <span className="text-base">👨‍🏫</span>
                    <div>
                      <p className="text-[11px] font-bold text-white">Professeur</p>
                      <p className="text-[9px] text-slate-400">Pédagogie & devoirs</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const st = users.find((u) => u.role === "STUDENT") || users[0];
                      setCurrentUser({
                        ...st,
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                      });
                      onLoginSuccess();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#8B4513] text-left transition-all text-xs"
                  >
                    <span className="text-base">🎓</span>
                    <div>
                      <p className="text-[11px] font-bold text-white">Élève KONE</p>
                      <p className="text-[9px] text-slate-400">Accès cours & devoirs</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const pr = users.find((u) => u.role === "PARENT") || {
                        id: `u_parent_${Date.now()}`,
                        name: "Parent d'Élève",
                        email: "parent.kone@gmail.com",
                        username: "parentkone",
                        role: "PARENT" as const,
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                        createdAt: new Date().toISOString(),
                      };
                      setCurrentUser({
                        ...pr,
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                      });
                      onLoginSuccess();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-[#8B4513] text-left transition-all text-xs"
                  >
                    <span className="text-base">👨‍👩‍👧</span>
                    <div>
                      <p className="text-[11px] font-bold text-white">Parent</p>
                      <p className="text-[9px] text-slate-400">Suivi des notes</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Classes Preview on Subdomain */}
              {schoolClasses.length > 0 && (
                <div className="pt-3 border-t border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Classes ouvertes aux inscriptions sur ce campus :
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {schoolClasses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-[#8B4513]/40 text-[10px] text-amber-200 font-mono"
                      >
                        {c.classCode} ({c.title})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 space-y-2 text-center text-xs text-slate-400">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreRegRole("STUDENT");
                    setIsPreRegModalOpen(true);
                  }}
                  className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>🎓 Pré-inscription Élève</span>
                </button>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreRegRole("TEACHER");
                    setIsPreRegModalOpen(true);
                  }}
                  className="text-amber-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>👨‍🏫 Candidature Professeur</span>
                </button>
              </div>

              <div>
                Pas encore inscrit dans une classe ?{" "}
                <button
                  type="button"
                  onClick={onOpenJoinClassModal}
                  className="text-amber-400 font-bold hover:underline"
                >
                  Rejoindre avec un Code &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 px-4 text-xs text-slate-500 border-t border-slate-900 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
        <span>© 2026-2027 {etablissement.name} • Hébergé sur la plateforme AlFasle Multi-Tenant</span>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="text-[11px] text-slate-400 hover:text-rose-400 underline transition-colors flex items-center gap-1"
        >
          <span>🧹 Vider le cache & Réinitialiser</span>
        </button>
      </footer>

      {/* Campus Pre-Registration Modal */}
      <PreRegistrationModal
        isOpen={isPreRegModalOpen}
        onClose={() => setIsPreRegModalOpen(false)}
        defaultEstablishmentId={etablissement.id}
        defaultRole={preRegRole}
      />

      {/* Reset Cache Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetStoreToDefaults}
        title="Réinitialisation du Campus"
        message="Voulez-vous vider le cache et réinitialiser les données de démonstration de cet établissement ?"
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        variant="warning"
      />
    </div>
  );
}
