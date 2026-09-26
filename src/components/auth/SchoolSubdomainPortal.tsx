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
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F7F6] text-slate-800 relative selection:bg-[#0D5B4D] selection:text-white">
      {/* Subdomain Top Indicator Bar (Light & Clean) */}
      <div className="w-full bg-white border-b border-slate-200 py-2.5 px-4 sm:px-8 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-20 shadow-sm">
        <div className="flex items-center gap-2 font-mono flex-wrap">
          <Globe className="w-4 h-4 text-[#00A896] shrink-0" />
          <span className="text-slate-500 font-sans font-medium">Sous-Domaine Dédié :</span>
          <span className="text-[#0D5B4D] font-bold bg-[#E8F5F2] px-2.5 py-0.5 rounded-md border border-[#00A896]/30 text-xs truncate max-w-[260px] sm:max-w-none">
            https://{etablissement.subdomain}.alfasle.edu
          </span>
        </div>

        <button
          onClick={onBackToGlobal}
          className="text-[#0D5B4D] hover:text-[#EB6A1D] font-medium flex items-center gap-1.5 transition-colors text-xs self-end sm:self-auto cursor-pointer"
        >
          <span>Changer d&apos;établissement (Portail Global)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Subdomain Header / Deep Green Hero Banner (ONECI Signature Banner) */}
      <section className="w-full bg-[#0D5B4D] text-white pt-6 pb-14 sm:pb-16 px-4 sm:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 border border-white/20">
              <img
                src={
                  etablissement.logoUrl ||
                  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150"
                }
                alt={etablissement.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="font-black text-xl sm:text-2xl tracking-tight text-white">
                  {etablissement.name}
                </h1>
                <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/20 text-white border border-white/30">
                  {etablissement.code}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>{etablissement.city}, {etablissement.country} • {etablissement.type}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap justify-end">
            <button
              type="button"
              onClick={() => {
                setPreRegRole("STUDENT");
                setIsPreRegModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EB6A1D] hover:bg-[#d85b12] text-white text-xs font-bold shadow-md shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>📝</span>
              <span>Pré-inscription</span>
            </button>

            <button
              onClick={onOpenJoinClassModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
              <span>Rejoindre une classe</span>
            </button>
          </div>
        </div>
      </section>

      {/* Center Subdomain Login Card (ONECI Style) */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10 w-full max-w-5xl mx-auto -mt-8 sm:-mt-10">
        <div className="w-full bg-white border border-slate-200/80 rounded-2xl sm:rounded-[28px] shadow-2xl shadow-emerald-950/10 p-6 sm:p-10 transition-all">
          
          {/* Card Header (Title & Breadcrumbs) */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0D5B4D] tracking-tight">
              Inscrire l&apos;identité exacte du concerné
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#00A896] flex-wrap">
              <span>Sélection du profil</span>
              <span className="text-slate-300">/</span>
              <span>Authentification Campus</span>
              <span className="text-slate-300">/</span>
              <span>Accès aux cours</span>
            </div>
          </div>

          {/* Stepper matching ONECI screenshot */}
          <div className="relative max-w-2xl mx-auto mb-10 px-4">
            <div className="absolute top-5 left-12 right-12 h-[2px] bg-slate-200 -z-0" />
            <div className="relative z-10 flex items-center justify-between">
              {/* Step 1: Active Orange */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#EB6A1D] text-white font-bold flex items-center justify-center shadow-md shadow-orange-500/30 text-sm">
                  1
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 max-w-[110px] leading-tight">
                  Choix du Rôle
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-500 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 max-w-[110px] leading-tight">
                  Identifiants
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-500 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 max-w-[120px] leading-tight">
                  Espace {etablissement.name}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 space-y-8">
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                Sélectionnez un rôle
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Portail officiel de formation de {etablissement.name}
              </p>
            </div>

            {/* 4 Choice Cards matching CNI / DID / CRC style with teal / orange borders */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1: DIRECTEUR */}
              <button
                type="button"
                onClick={() => handleRoleSelect("ADMIN")}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center group ${
                  selectedRole === "ADMIN"
                    ? "border-[#EB6A1D] bg-[#FFF8F2] shadow-md ring-2 ring-[#EB6A1D]/20"
                    : "border-[#00A896] bg-white hover:bg-slate-50 hover:border-[#0D5B4D]"
                }`}
              >
                <div className="text-2xl mb-1">👑</div>
                <h4
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    selectedRole === "ADMIN" ? "text-[#EB6A1D]" : "text-[#0D5B4D]"
                  }`}
                >
                  DIRECTEUR
                </h4>
                <p className="text-[11px] text-[#00A896] font-medium mt-0.5">
                  Direction & Administration
                </p>
              </button>

              {/* 2: ENSEIGNANT */}
              <button
                type="button"
                onClick={() => handleRoleSelect("TEACHER")}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center group ${
                  selectedRole === "TEACHER"
                    ? "border-[#EB6A1D] bg-[#FFF8F2] shadow-md ring-2 ring-[#EB6A1D]/20"
                    : "border-[#00A896] bg-white hover:bg-slate-50 hover:border-[#0D5B4D]"
                }`}
              >
                <div className="text-2xl mb-1">👨‍🏫</div>
                <h4
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    selectedRole === "TEACHER" ? "text-[#EB6A1D]" : "text-[#0D5B4D]"
                  }`}
                >
                  ENSEIGNANT
                </h4>
                <p className="text-[11px] text-[#00A896] font-medium mt-0.5">
                  Gestion des Cours & Notes
                </p>
              </button>

              {/* 3: ÉLÈVE */}
              <button
                type="button"
                onClick={() => handleRoleSelect("STUDENT")}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center group ${
                  selectedRole === "STUDENT"
                    ? "border-[#EB6A1D] bg-[#FFF8F2] shadow-md ring-2 ring-[#EB6A1D]/20"
                    : "border-[#00A896] bg-white hover:bg-slate-50 hover:border-[#0D5B4D]"
                }`}
              >
                <div className="text-2xl mb-1">🎓</div>
                <h4
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    selectedRole === "STUDENT" ? "text-[#EB6A1D]" : "text-[#0D5B4D]"
                  }`}
                >
                  ÉLÈVE
                </h4>
                <p className="text-[11px] text-[#00A896] font-medium mt-0.5">
                  Apprenant & Devoirs
                </p>
              </button>

              {/* 4: PARENT */}
              <button
                type="button"
                onClick={() => handleRoleSelect("PARENT")}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center group ${
                  selectedRole === "PARENT"
                    ? "border-[#EB6A1D] bg-[#FFF8F2] shadow-md ring-2 ring-[#EB6A1D]/20"
                    : "border-[#00A896] bg-white hover:bg-slate-50 hover:border-[#0D5B4D]"
                }`}
              >
                <div className="text-2xl mb-1">👨‍👩‍👧</div>
                <h4
                  className={`text-base sm:text-lg font-black tracking-tight ${
                    selectedRole === "PARENT" ? "text-[#EB6A1D]" : "text-[#0D5B4D]"
                  }`}
                >
                  PARENT
                </h4>
                <p className="text-[11px] text-[#00A896] font-medium mt-0.5">
                  Suivi Scolaire & Bulletins
                </p>
              </button>
            </div>

            {/* School Stats Pill */}
            <div className="p-3.5 rounded-xl bg-[#E8F5F2] border border-[#00A896]/30 flex flex-wrap items-center justify-between text-xs text-[#0D5B4D] gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold">🏫 {etablissement.name}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-600">{schoolClasses.length} classe(s) actives</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-600">{enrolledCount} apprenant(s)</span>
              </div>
              <span className="font-bold text-[11px] bg-white text-[#0D5B4D] px-2.5 py-1 rounded-full border border-[#00A896]/20">
                Portail {selectedRole}
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4 max-w-xl mx-auto pt-2">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Identifiant */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {selectedRole === "ADMIN"
                    ? "Identifiant Direction / Nom / Email"
                    : selectedRole === "TEACHER"
                    ? "Identifiant Enseignant / Email"
                    : selectedRole === "PARENT"
                    ? "Identifiant Parent / Email"
                    : "Identifiant Élève / Nom / Matricule"}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    selectedRole === "ADMIN"
                      ? `Ex: ${etablissement.directorName || "Directeur"} ou konedamaa@gmail.com`
                      : selectedRole === "TEACHER"
                      ? "Ex: sarah.mansouri@alfasle.edu"
                      : selectedRole === "PARENT"
                      ? "Ex: parent.kone@gmail.com"
                      : "Ex: KONE ou matricule..."
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00A896] focus:bg-white focus:ring-2 focus:ring-[#00A896]/20 text-sm transition-all"
                />
              </div>

              {/* Mot de passe */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mot de passe
                  </label>
                  <span className="text-xs text-[#00A896] hover:underline cursor-pointer font-medium">
                    Mot de passe oublié ?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#00A896] focus:bg-white focus:ring-2 focus:ring-[#00A896]/20 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#EB6A1D] focus:ring-[#EB6A1D]"
                  />
                  <span>Mémoriser mes identifiants</span>
                </label>
                <span className="text-slate-400 text-[11px]">Instance isolée SSL</span>
              </div>

              {/* Submit Button (ONECI Vibrant Orange) */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#EB6A1D] hover:bg-[#d85b12] active:bg-[#c44f0d] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Accéder à l&apos;Espace {etablissement.name}</span>
                </button>
              </div>
            </form>

            {/* Quick 1-Click Demo Profiles (Light harmonized style) */}
            <div className="pt-6 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <span>⚡</span>
                <span>Connexion Rapide Démo sur ce Campus :</span>
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00A896] hover:bg-[#E8F5F2]/40 text-left transition-all text-xs group flex items-center gap-2.5 shadow-sm"
                >
                  <span className="text-xl">👑</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0D5B4D]">
                      Direction
                    </p>
                    <p className="text-[10px] text-[#00A896] truncate font-medium">
                      Gestion campus
                    </p>
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
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00A896] hover:bg-[#E8F5F2]/40 text-left transition-all text-xs group flex items-center gap-2.5 shadow-sm"
                >
                  <span className="text-xl">👨‍🏫</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0D5B4D]">
                      Professeur
                    </p>
                    <p className="text-[10px] text-[#00A896] truncate font-medium">
                      Pédagogie
                    </p>
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
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00A896] hover:bg-[#E8F5F2]/40 text-left transition-all text-xs group flex items-center gap-2.5 shadow-sm"
                >
                  <span className="text-xl">🎓</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0D5B4D]">
                      Élève KONE
                    </p>
                    <p className="text-[10px] text-[#00A896] truncate font-medium">
                      Apprenant
                    </p>
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
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00A896] hover:bg-[#E8F5F2]/40 text-left transition-all text-xs group flex items-center gap-2.5 shadow-sm"
                >
                  <span className="text-xl">👨‍👩‍👧</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0D5B4D]">
                      Parent
                    </p>
                    <p className="text-[10px] text-[#00A896] truncate font-medium">
                      Suivi notes
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Classes Preview on Subdomain */}
            {schoolClasses.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-2">
                  Classes ouvertes sur ce campus :
                </p>
                <div className="flex flex-wrap gap-2">
                  {schoolClasses.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 rounded-lg bg-[#E8F5F2] border border-[#00A896]/30 text-xs text-[#0D5B4D] font-mono font-medium"
                    >
                      {c.classCode} ({c.title})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Inscriptions & Join class links */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setPreRegRole("STUDENT");
                    setIsPreRegModalOpen(true);
                  }}
                  className="text-[#0D5B4D] font-bold hover:underline flex items-center gap-1"
                >
                  <span>🎓 Pré-inscription Élève</span>
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setPreRegRole("TEACHER");
                    setIsPreRegModalOpen(true);
                  }}
                  className="text-[#00A896] font-bold hover:underline flex items-center gap-1"
                >
                  <span>👨‍🏫 Candidature Professeur</span>
                </button>
              </div>

              <div>
                Pas encore inscrit ?{" "}
                <button
                  type="button"
                  onClick={onOpenJoinClassModal}
                  className="text-[#EB6A1D] font-bold hover:underline"
                >
                  Rejoindre avec un Code &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-slate-500 border-t border-slate-200/80 z-10 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-5xl mx-auto">
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
