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
import { findUsersMatchingLogin, verifyUserLoginPassword } from "@/lib/utils";

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
    return etablissement.directorPassword || "Madouu966";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isPreRegModalOpen, setIsPreRegModalOpen] = useState(false);
  const [preRegRole, setPreRegRole] = useState<InscriptionRole>("STUDENT");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Classes specific to this establishment
  const schoolClasses = classes.filter(
    (c) =>
      c.etablissementId === etablissement.id ||
      c.etablissementId === etablissement.subdomain ||
      (etablissement.name && c.etablissementName?.toLowerCase().trim() === etablissement.name.toLowerCase().trim())
  );
  const schoolClassIds = new Set(schoolClasses.map((c) => c.id));

  // Count approved student inscriptions for this establishment or any of its classes
  const approvedStudentsInscriptions = inscriptions.filter(
    (i) =>
      (i.etablissementId === etablissement.id ||
        i.etablissementId === etablissement.subdomain ||
        (etablissement.name && i.etablissementName?.toLowerCase().trim() === etablissement.name.toLowerCase().trim()) ||
        schoolClassIds.has(i.classeId)) &&
      i.role === "STUDENT" &&
      (i.status === "APPROVED" || i.status === "CONFIRMED")
  );

  // Count active students in users belonging to this establishment
  const schoolStudentsUsers = users.filter(
    (u) =>
      u.role === "STUDENT" &&
      (u.etablissementId === etablissement.id ||
        (etablissement.name && u.etablissementName === etablissement.name) ||
        u.etablissementId === etablissement.subdomain)
  );

  // Sum from classes
  const classesEnrolledSum = schoolClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  // Compute real enrolled count (at least the real approved students or enrolled counts)
  const enrolledCount = Math.max(
    approvedStudentsInscriptions.length,
    schoolStudentsUsers.length,
    classesEnrolledSum
  );

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg("");
    if (role === "ADMIN") {
      setIdentifier(etablissement.directorEmail || "cherifladivo@gmail.com");
      setPassword(etablissement.directorPassword || "Madouu966");
    } else if (role === "TEACHER") {
      setIdentifier("sarah.mansouri@alfasle.edu");
      setPassword("Madouu1966");
    } else if (role === "STUDENT") {
      const schoolStudent = users.find(
        (u) =>
          u.role === "STUDENT" &&
          (u.etablissementId === etablissement.id ||
            u.etablissementId === etablissement.subdomain ||
            (etablissement.name && u.etablissementName === etablissement.name))
      );
      setIdentifier(schoolStudent?.name || schoolStudent?.phone || "");
      setPassword(schoolStudent?.password || "Madouu1966@");
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
      const isDirectorCherif =
        cleanId === "cherifladivo@gmail.com" ||
        cleanId === "cherifladivo" ||
        cleanId === "cherif" ||
        cleanId === "lamine@gmail.com" ||
        cleanId === "lamine" ||
        cleanId === (etablissement.directorEmail || "").toLowerCase() ||
        cleanId === (etablissement.directorName || "").toLowerCase();

      if (isDirectorCherif) {
        const isMasterPass = inputPass === "Madouu1966@" || inputPass === "admin" || inputPass === "Madouu1966";
        const expectedPass = (etablissement.directorPassword || "Madouu966").trim();

        if (!inputPass || (inputPass !== expectedPass && !isMasterPass)) {
          setErrorMsg("Mot de passe incorrect pour le compte Directeur (utilisez Madouu966).");
          return;
        }

        const dirUser: User = {
          id: `u_dir_cherif`,
          name: etablissement.directorName ? `${etablissement.directorName} (Directeur)` : "CHÉRIF (Directeur)",
          email: "cherifladivo@gmail.com",
          username: "cherif",
          role: "ADMIN",
          password: etablissement.directorPassword || "Madouu966",
          etablissementId: etablissement.id,
          etablissementName: etablissement.name,
          bio: `Directeur officiel de ${etablissement.name}`,
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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

      const isDirectorKone =
        cleanId === "konedamaa@gmail.com" ||
        cleanId === "konedma@gmil.com" ||
        cleanId === "konedamaa" ||
        cleanId === "konedama";

      if (isDirectorKone) {
        if (!inputPass || (inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin")) {
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
        if (!inputPass || (inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin")) {
          setErrorMsg("Mot de passe incorrect pour le compte Directeur.");
          return;
        }

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
            password: "Madouu1966",
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
            u.name.toLowerCase() === cleanId) &&
          u.role === "ADMIN"
      );

      if (dirUser) {
        const expectedPass = (dirUser.password || "Madouu1966").trim();
        const isMasterPass = inputPass === "Madouu1966@" || inputPass === "admin";
        if (!inputPass || (inputPass !== expectedPass && !isMasterPass)) {
          setErrorMsg("Mot de passe incorrect pour le compte Directeur.");
          return;
        }

        dirUser = {
          ...dirUser,
          role: "ADMIN",
          etablissementId: etablissement.id,
          etablissementName: etablissement.name,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("alfasle_active_tab", "dashboard");
          localStorage.setItem("alfasle_user_role", "ADMIN");
        }
        setCurrentUser(dirUser);
        onLoginSuccess();
        return;
      }
    }

    // Super Admin Master Shortcut
    const isSuperAdmin =
      cleanId === "superadmin" ||
      cleanId === "root" ||
      cleanId === "konedamaa@gmail.com" ||
      cleanId === "konedma@gmil.com" ||
      cleanId === "konedamaa";

    if (isSuperAdmin) {
      if (!inputPass || (inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin")) {
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

    const allMatched = findUsersMatchingLogin(cleanId, users, inscriptions);

    // 1. Match candidates with role preference on this school
    let candidates = allMatched.filter((u) => u.role === selectedRole);

    // 2. Fallback search across all matched users
    if (candidates.length === 0) {
      candidates = allMatched;
    }

    if (candidates.length === 0) {
      setErrorMsg("Aucun élève ou utilisateur trouvé avec ce Nom, Prénom ou Numéro de téléphone.");
      return;
    }

    if (!inputPass) {
      setErrorMsg("Veuillez saisir votre mot de passe.");
      return;
    }

    // Among candidates matching the name/phone, find the user whose password matches
    let matchedUser = candidates.find((u) => verifyUserLoginPassword(u, inputPass, inscriptions));

    if (!matchedUser) {
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
      etablissementId: matchedUser.etablissementId || etablissement.id,
      etablissementName: matchedUser.etablissementName || etablissement.name,
    });
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 relative overflow-hidden selection:bg-emerald-600 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-100/30 rounded-full blur-[130px] pointer-events-none" />

      {/* Subdomain Top Indicator Bar */}
      <div className="w-full bg-white border-b border-slate-200 py-2 px-3 sm:px-8 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20 shadow-sm">
        <div className="flex items-center gap-2 font-mono flex-wrap">
          <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="text-slate-500">Sous-Domaine :</span>
          <span className="text-emerald-950 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-[11px] truncate max-w-[220px] sm:max-w-none">
            https://{etablissement.subdomain}.alfasle.xyz
          </span>
        </div>

        <button
          onClick={onBackToGlobal}
          className="text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors text-[11px] self-end sm:self-auto cursor-pointer"
        >
          <span>Changer d&apos;établissement (Portail Global)</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Main Subdomain Header */}
      <header className="w-full max-w-7xl mx-auto px-3 sm:px-8 py-3 sm:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-500 p-0.5 shadow-lg shadow-emerald-600/20 shrink-0">
            <img
              src={
                etablissement.logoUrl && !etablissement.logoUrl.includes("photo-1546410531-bb4caa6b424d")
                  ? etablissement.logoUrl
                  : "/logo-an-nour.png"
              }
              alt={etablissement.name}
              className="w-full h-full object-contain bg-white rounded-[14px]"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-black text-lg sm:text-xl tracking-tight text-slate-900 truncate">{etablissement.name}</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300">
                {etablissement.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
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
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            title="Pré-inscription"
          >
            <span>📝</span>
            <span className="hidden sm:inline">Pré-inscription</span>
          </button>

          <button
            onClick={onOpenJoinClassModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            title="Rejoindre une classe"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Rejoindre une classe</span>
            <span className="sm:hidden">Rejoindre</span>
          </button>
        </div>
      </header>

      {/* Center Subdomain Login Card (Split-Screen) */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10 w-full max-w-7xl mx-auto">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-300/40 grid grid-cols-1 md:grid-cols-12 min-h-[540px]">

          {/* LEFT COLUMN: School Custom Theme Banner (Green / Emerald) */}
          <div className="md:col-span-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 sm:p-8 flex flex-col justify-between text-white relative overflow-hidden shadow-inner">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-teal-400/25 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Badge specific to establishment */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-bold text-white shadow-sm">
                <span>🏫</span>
                <span className="tracking-wide uppercase truncate max-w-none">
                  {etablissement.name}
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                  Espace Campus & Cours en Ligne !
                </h2>
                <p className="text-xs text-emerald-100 leading-relaxed font-medium">
                  {etablissement.description}
                </p>
              </div>

              {/* School Metrics */}
              <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-100 shadow-md space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                    Classes disponibles sur ce campus :
                  </span>
                  <span className="font-bold bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                    {schoolClasses.length} Classes
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" />
                    Effectif inscrits :
                  </span>
                  <span className="font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full border border-teal-200 shadow-xs">
                    {enrolledCount} Élève{enrolledCount > 1 ? "s" : ""}
                  </span>
                </div>
                {etablissement.directorName && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-slate-500" />
                      Directeur :
                    </span>
                    <span className="font-bold text-slate-900">{etablissement.directorName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-emerald-500/30 text-[11px] text-emerald-100">
              Instance sécurisée : <strong className="text-white font-bold">{etablissement.subdomain}.alfasle.edu</strong>
            </div>
          </div>

          {/* RIGHT COLUMN: School-scoped Login Form */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white text-slate-800">
            <div className="space-y-6">

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
                    Portail Étudiant & Enseignant
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {etablissement.code}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                  Se connecter à {etablissement.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accédez aux cours, devoirs et ressources dispensés par votre établissement.
                </p>
              </div>

              {/* 4 Role Selector Buttons - Direction FIRST */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    selectedRole === "ADMIN"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md ring-2 ring-emerald-400/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">👑</span>
                  <span className="text-[10px] font-bold">Direction</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("TEACHER")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    selectedRole === "TEACHER"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md ring-2 ring-emerald-400/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">👨‍🏫</span>
                  <span className="text-[10px] font-bold">Prof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    selectedRole === "STUDENT"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md ring-2 ring-emerald-400/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-[10px] font-bold">Élève</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("PARENT")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    selectedRole === "PARENT"
                      ? "bg-emerald-50 border-emerald-600 text-emerald-900 shadow-md ring-2 ring-emerald-400/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-lg">👨‍👩‍👧</span>
                  <span className="text-[10px] font-bold">Parent</span>
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {errorMsg}
                  </div>
                )}
                <div>
                  <label className="block text-slate-700 font-medium mb-1">
                    {selectedRole === "ADMIN"
                      ? "Identifiant Direction / Nom / Email *"
                      : selectedRole === "TEACHER"
                      ? "Identifiant Enseignant / Nom / Email *"
                      : selectedRole === "PARENT"
                      ? "Identifiant Parent / Nom / Email *"
                      : "Identifiant, Nom, Prénom ou Téléphone *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === "ADMIN"
                        ? `Ex: cherifladivo@gmail.com ou ${etablissement.directorName || "Directeur"}...`
                        : selectedRole === "TEACHER"
                        ? "Ex: sarah.mansouri@alfasle.edu..."
                        : selectedRole === "PARENT"
                        ? "Ex: parent.kone@gmail.com..."
                        : "Ex: KONE, FATOU ou 0701020304..."
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Mot de passe *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Accéder à mon Espace {etablissement.name}</span>
                </button>
              </form>

              {/* Classes Preview on Subdomain */}
              {schoolClasses.length > 0 && (
                <div className="pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Classes ouvertes aux inscriptions sur ce campus :
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {schoolClasses.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800 font-mono font-medium"
                      >
                        {c.classCode} ({c.title})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-center text-xs text-slate-500">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreRegRole("STUDENT");
                    setIsPreRegModalOpen(true);
                  }}
                  className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>👨‍🏫 Candidature Professeur</span>
                </button>
              </div>

              <div>
                Pas encore inscrit dans une classe ?{" "}
                <button
                  type="button"
                  onClick={onOpenJoinClassModal}
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Rejoindre avec un Code &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-slate-500 border-t border-slate-200 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
        <span>© 2026-2027 {etablissement.name} • Hébergé sur la plateforme AlFasle Multi-Tenant</span>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="text-[11px] text-slate-400 hover:text-rose-500 underline transition-colors flex items-center gap-1 cursor-pointer"
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
