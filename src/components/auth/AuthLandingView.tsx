"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { UserRole, User, Etablissement } from "@/types";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
  KeyRound,
  GraduationCap,
  Sparkles,
  School,
  Check,
  Compass,
  Globe,
  ExternalLink,
  Building2,
} from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { PreRegistrationModal } from "@/components/inscriptions/PreRegistrationModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { InscriptionRole } from "@/types";

interface AuthLandingViewProps {
  onLoginSuccess: () => void;
  onOpenJoinClassModal: () => void;
  onOpenSuperAdmin?: () => void;
  onSelectSubdomainSchool?: (etab: Etablissement) => void;
}

export function AuthLandingView({
  onLoginSuccess,
  onOpenJoinClassModal,
  onOpenSuperAdmin,
  onSelectSubdomainSchool,
}: AuthLandingViewProps) {
  const { users, currentUser, setCurrentUser, etablissements, classes, resetStoreToDefaults } = useStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [identifier, setIdentifier] = useState("diawara@gmail.com");
  const [password, setPassword] = useState("Madouu1966@");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [brandBadgeText, setBrandBadgeText] = useState("ESSAYER2");
  const [isPreRegModalOpen, setIsPreRegModalOpen] = useState(false);
  const [preRegRole, setPreRegRole] = useState<InscriptionRole>("STUDENT");
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Role metadata corresponding to the screenshot & design system
  const roleConfig: Record<
    UserRole,
    {
      badgeIcon: string;
      leftTitle: string;
      leftDesc: string;
      roleSubtitle: string;
      espaceTitle: string;
      espaceDesc: string;
      defaultLogin: string;
      defaultPass: string;
      cardBg: string;
      gradient: string;
    }
  > = {
    SUPER_ADMIN: {
      badgeIcon: "🛡️",
      leftTitle: "Super Admin & Multi-Campus !",
      leftDesc:
        "Gérez tous les établissements, les quotas, les serveurs et l'architecture multi-tenant globale.",
      roleSubtitle: "connexion en tant que super administrateur",
      espaceTitle: "Console Super Admin (Root)",
      espaceDesc: "Gestion et création globale des établissements scolaires",
      defaultLogin: "konedamaa@gmail.com",
      defaultPass: "Madouu1966@",
      cardBg: "from-amber-600 via-orange-700 to-slate-900",
      gradient: "from-amber-500 to-orange-600",
    },
    ADMIN: {
      badgeIcon: "👑",
      leftTitle: "Direction & Établissement !",
      leftDesc:
        "Pilotez l'ensemble des activités, établissements, classes et paramètres de votre système éducatif.",
      roleSubtitle: "connexion en tant que directeur d'établissement",
      espaceTitle: "Espace Directeur (KONE ADAMA)",
      espaceDesc: "Direction du Groupe Scolaire AlFasle (Abidjan) & Supervision Pédagogique",
      defaultLogin: "konedamaa@gmail.com",
      defaultPass: "Madouu1966",
      cardBg: "from-[#8B4513] via-[#7B3F00] to-[#3D1A04]",
      gradient: "from-[#8B4513] to-[#5C2D0A]",
    },
    TEACHER: {
      badgeIcon: "👨‍🏫",
      leftTitle: "Espace Enseignant & Cours !",
      leftDesc:
        "Gérez vos classes, diffusez vos leçons et supports multimédias, et notez vos devoirs facilement.",
      roleSubtitle: "connexion en tant que enseignant",
      espaceTitle: "Espace Enseignant",
      espaceDesc: "Gestion pédagogique, création de cours et notation",
      defaultLogin: "sarah.mansouri@alfasle.edu",
      defaultPass: "Madouu1966",
      cardBg: "from-blue-600 via-indigo-600 to-violet-800",
      gradient: "from-indigo-600 to-violet-600",
    },
    STUDENT: {
      badgeIcon: "🎓",
      leftTitle: "Espace Élève & Étudiant !",
      leftDesc:
        "Rejoignez votre classe, recevez tous vos cours, regardez vos vidéos et soumettez vos devoirs en ligne.",
      roleSubtitle: "connexion en tant que élève",
      espaceTitle: "Espace Élève",
      espaceDesc: "Accès aux cours multimédias, leçons et réception des devoirs",
      defaultLogin: "KONE",
      defaultPass: "Madouu1966",
      cardBg: "from-sky-600 via-blue-600 to-indigo-800",
      gradient: "from-sky-600 to-blue-600",
    },
    PARENT: {
      badgeIcon: "👨‍👩‍👧",
      leftTitle: "Espace Parent d'Élève !",
      leftDesc:
        "Consultez l'assiduité, les cours dispensés, les devoirs et les bulletins de notes de vos enfants.",
      roleSubtitle: "connexion en tant que parent d'élève",
      espaceTitle: "Espace Parent d'Élève",
      espaceDesc: "Suivi des résultats scolaires et communications établissement",
      defaultLogin: "parent.kone@gmail.com",
      defaultPass: "Madouu1966",
      cardBg: "from-indigo-600 via-blue-700 to-sky-800",
      gradient: "from-blue-600 to-cyan-600",
    },
  };

  const currentConfig = roleConfig[selectedRole];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg("");
    const cfg = roleConfig[role];
    setIdentifier(cfg.defaultLogin);
    setPassword(cfg.defaultPass);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanId = identifier.trim().toLowerCase();
    const inputPass = password.trim();

    if (!cleanId) {
      setErrorMsg("Veuillez saisir un identifiant ou une adresse email.");
      return;
    }

    // 0. SPECIAL CASE: When logging in as Directeur (role ADMIN)
    if (selectedRole === "ADMIN") {
      const isDirectorKone =
        cleanId === "konedamaa@gmail.com" ||
        cleanId === "konedma@gmil.com" ||
        cleanId === "konedama@gmail.com" ||
        cleanId === "konedma@gmail.com" ||
        cleanId === "konedamaa" ||
        cleanId === "konedama" ||
        cleanId === "konedma";

      if (isDirectorKone) {
        if (inputPass && inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin") {
          setErrorMsg("Mot de passe incorrect pour le compte Directeur (utilisez Madouu1966).");
          return;
        }

        let dirUser = users.find(
          (u) =>
            (u.email.toLowerCase() === "konedamaa@gmail.com" || (u.username && u.username.toLowerCase() === "konedamaa")) &&
            u.role === "ADMIN"
        );

        if (!dirUser) {
          dirUser = {
            id: "u_admin_kone",
            name: "KONE ADAMA (Directeur)",
            username: "konedamaa",
            email: "konedamaa@gmail.com",
            password: "Madouu1966",
            role: "ADMIN",
            bio: "Directeur & Administrateur Principal du Groupe Scolaire AlFasle.",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            etablissementId: "etab_gs_alfasle",
            etablissementName: "Groupe Scolaire AlFasle",
            createdAt: new Date().toISOString(),
          };
        } else {
          dirUser = {
            ...dirUser,
            role: "ADMIN",
            password: "Madouu1966",
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
            id: "u_admin_sanogo",
            name: "M. SANOGO (Directeur)",
            username: "sanogo",
            email: "sanogo@gmail.com",
            password: inputPass || "Madouu1966",
            role: "ADMIN",
            bio: "Directeur & Administrateur d'Établissement.",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            etablissementId: "etab_gs_alfasle",
            etablissementName: "Groupe Scolaire AlFasle",
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
    }

    // Super Admin Master Shortcut (only when role is SUPER_ADMIN or user types superadmin / root)
    const isSuperAdmin =
      (selectedRole === "SUPER_ADMIN" || cleanId === "superadmin" || cleanId === "root") &&
      (cleanId === "konedamaa@gmail.com" ||
        cleanId === "konedma@gmil.com" ||
        cleanId === "konedamaa" ||
        cleanId === "superadmin" ||
        cleanId === "root");

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

      if (onOpenSuperAdmin) {
        onOpenSuperAdmin();
        return;
      }

      onLoginSuccess();
      return;
    }

    // 1. Search for matching user: exact email or username match
    let matchedUser = users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        (u.username && u.username.toLowerCase() === cleanId)
    );

    // 2. Exact match with role preference if not found
    if (!matchedUser) {
      matchedUser = users.find(
        (u) =>
          (u.email.toLowerCase() === cleanId ||
            (u.username && u.username.toLowerCase() === cleanId)) &&
          u.role === selectedRole
      );
    }

    // 3. Name matches (exact, starts with, or includes)
    if (!matchedUser) {
      matchedUser = users.find((u) => u.name.toLowerCase() === cleanId);
    }
    if (!matchedUser) {
      matchedUser = users.find(
        (u) =>
          u.name.toLowerCase().includes(cleanId) &&
          (u.role === selectedRole || selectedRole === "ADMIN")
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

    // 4. Fallback: first user with the selected role if still not found
    if (!matchedUser && cleanId.length === 0) {
      matchedUser = users.find((u) => u.role === selectedRole);
    }

    if (matchedUser) {
      // Validate password
      const expectedPass = (matchedUser.password || "Madouu1966@").trim();
      const isMasterPass = inputPass === "Madouu1966@" || inputPass === "admin";
      const isCorrectPass = inputPass === expectedPass || isMasterPass;

      if (inputPass && !isCorrectPass) {
        setErrorMsg("Mot de passe incorrect pour cet identifiant.");
        return;
      }

      setCurrentUser(matchedUser);

      if (matchedUser.role === "SUPER_ADMIN" && onOpenSuperAdmin) {
        onOpenSuperAdmin();
        return;
      }

      onLoginSuccess();
    } else {
      setErrorMsg("Identifiant ou email introuvable. Veuillez vérifier ou créer le compte dans le Super Admin.");
    }
  };

  const handleDirectDemoLogin = (user: User) => {
    setCurrentUser(user);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#F4F7F6] text-slate-800 relative selection:bg-[#00A896] selection:text-white">
      {/* Top Header Bar (Clean White Navbar) */}
      <header className="w-full bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between z-20 shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D5B4D] via-[#0D5B4D] to-[#00A896] flex items-center justify-center shadow-md shadow-[#0D5B4D]/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-[#0D5B4D]">
                ALFASLE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5F2] text-[#0D5B4D] border border-[#00A896]/30 uppercase tracking-wider">
                Multi-Campus
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Gestion Scolaire & Distribution de Cours
            </p>
          </div>
        </div>

        {/* Quick action buttons matching ONECI top bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <button
            type="button"
            onClick={() => {
              setPreRegRole("STUDENT");
              setIsPreRegModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#EB6A1D] hover:bg-[#D95511] text-white text-xs font-bold shadow-sm shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
            title="Pré-inscription en ligne"
          >
            <span>📝</span>
            <span>Pré-inscription</span>
          </button>

          <button
            onClick={onOpenJoinClassModal}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white text-xs font-bold shadow-sm shadow-teal-500/25 transition-all transform hover:-translate-y-0.5"
            title="Rejoindre avec un code classe"
          >
            <KeyRound className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Code Classe</span>
          </button>

          {onOpenSuperAdmin && (
            <button
              onClick={onOpenSuperAdmin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold shadow-sm transition-all"
              title="Console Super Administrateur"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">Super Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Deep Forest Green Banner (ONECI Signature Header) */}
      <section className="w-full bg-[#0D5B4D] pt-8 pb-28 px-4 text-center text-white relative shadow-inner">
        <div className="max-w-4xl mx-auto space-y-2">
          <span className="text-xs font-bold tracking-widest text-[#80dfd3] uppercase">
            Plateforme Nationale Multi-Établissements & Gestion Scolaire
          </span>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Portail Numérique Éducatif AlFasle
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
            Accès sécurisé pour les Directeurs, Enseignants, Élèves et Parents d&apos;élèves.
          </p>
        </div>
      </section>

      {/* Center Auth Card container (ONECI Inspired Design System) */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10 w-full max-w-5xl mx-auto -mt-6 sm:-mt-10">
        <div className="w-full bg-white border border-slate-200/80 rounded-2xl sm:rounded-[28px] shadow-2xl shadow-emerald-950/10 p-6 sm:p-10 transition-all">
          
          {/* Card Header (Title & Breadcrumbs matching ONECI screenshot) */}
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0D5B4D] tracking-tight">
              Inscrire l&apos;identité exacte du concerné
            </h2>
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#00A896] flex-wrap">
              <span>Sélection du profil</span>
              <span className="text-slate-300">/</span>
              <span>Identifiants & Sécurité</span>
              <span className="text-slate-300">/</span>
              <span>Accès à l&apos;espace</span>
            </div>
          </div>

          {/* Stepper matching ONECI screenshot (1 orange, 2 gray, 3 gray with connecting line) */}
          <div className="relative max-w-2xl mx-auto mb-10 px-4">
            {/* Horizontal Line behind steps */}
            <div className="absolute top-5 left-12 right-12 h-[2px] bg-slate-200 -z-0" />
            
            <div className="relative z-10 flex items-center justify-between">
              {/* Step 1: Active Orange */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#EB6A1D] text-white font-bold flex items-center justify-center shadow-md shadow-orange-500/30 text-sm">
                  1
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 max-w-[110px] leading-tight">
                  Sélection du rôle
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-500 font-bold flex items-center justify-center text-sm">
                  2
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 max-w-[110px] leading-tight">
                  Authentification
                </span>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-500 font-bold flex items-center justify-center text-sm">
                  3
                </div>
                <span className="text-xs sm:text-sm font-medium text-slate-500 max-w-[120px] leading-tight">
                  Espace Personnel
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 space-y-8">
            {/* Section Heading matching ONECI "Sélectionnez un produit" */}
            <div className="text-center">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800">
                Sélectionnez un rôle
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Choisissez le profil correspondant à votre fonction au sein de l&apos;établissement
              </p>
            </div>

            {/* 4 Choice Cards matching CNI / DID / CRC card style with teal / orange borders */}
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

            {/* Selected Role Notification Banner */}
            <div className="p-3.5 rounded-xl bg-[#E8F5F2] border border-[#00A896]/30 flex items-center justify-between text-xs text-[#0D5B4D]">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentConfig.badgeIcon}</span>
                <span className="font-bold">{currentConfig.espaceTitle} :</span>
                <span className="text-slate-600">{currentConfig.espaceDesc}</span>
              </div>
              <span className="font-bold text-[11px] bg-white text-[#0D5B4D] px-2.5 py-1 rounded-full border border-[#00A896]/20">
                {selectedRole}
              </span>
            </div>

            {/* Login Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 max-w-xl mx-auto pt-2">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Identifiant */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Identifiant / Email ou Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ex: konedamaa@gmail.com ou KONE"
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
                <span className="text-slate-400 text-[11px]">Connexion sécurisée SSL</span>
              </div>

              {/* Submit Button (ONECI Vibrant Orange) */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#EB6A1D] hover:bg-[#d85b12] active:bg-[#c44f0d] text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Se Connecter</span>
                </button>
              </div>
            </form>

            {/* Quick 1-Click Demo Profiles (Light harmonized style) */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span>⚡</span>
                  <span>Connexion Rapide Démo (1 Clic) :</span>
                </p>
                <span className="text-[11px] text-slate-400">Cliquez pour tester un rôle</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {users.slice(0, 4).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleDirectDemoLogin(u)}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#00A896] hover:bg-[#E8F5F2]/40 text-left transition-all text-xs group flex items-center gap-2.5 shadow-sm"
                  >
                    <img
                      src={
                        u.avatarUrl ||
                        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                      }
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate group-hover:text-[#0D5B4D]">
                        {u.name}
                      </p>
                      <p className="text-[10px] text-[#00A896] truncate capitalize font-medium">
                        {u.role.toLowerCase()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

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
                  <span>👨‍🏫 Candidature Enseignant</span>
                </button>
              </div>

              <div>
                Vous avez un code ?{" "}
                <button
                  type="button"
                  onClick={onOpenJoinClassModal}
                  className="text-[#EB6A1D] font-bold hover:underline"
                >
                  Rejoindre une classe &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated School Subdomains Section (Harmonized light cards) */}
        <div className="w-full bg-white border border-slate-200/80 rounded-2xl sm:rounded-[24px] shadow-lg shadow-slate-900/5 p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#E8F5F2] border border-[#00A896]/30 flex items-center justify-center text-[#0D5B4D]">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>Accès Élèves & Enseignants par Établissement</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5F2] text-[#0D5B4D] border border-[#00A896]/30 font-mono">
                    Multi-Tenant DNS
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Chaque établissement possède son propre portail et sous-domaine dédié
                </p>
              </div>
            </div>
            <span className="text-xs text-[#00A896] font-bold">
              {etablissements.length} campus déployés
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {etablissements.map((etab) => {
              const etabClasses = classes.filter((c) => c.etablissementId === etab.id);

              return (
                <div
                  key={etab.id}
                  onClick={() => onSelectSubdomainSchool && onSelectSubdomainSchool(etab)}
                  className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-[#00A896] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xl">🏫</span>
                      <span className="text-[10px] font-mono font-bold text-[#0D5B4D] bg-[#E8F5F2] px-2 py-0.5 rounded-md border border-[#00A896]/20">
                        .{etab.subdomain || "alfasle"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#0D5B4D] transition-colors line-clamp-1">
                      {etab.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1 truncate">
                      <Globe className="w-3 h-3 text-[#00A896]" />
                      <span>{etab.subdomain || etab.id}.alfasle.edu</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">
                      {etabClasses.length} classe{etabClasses.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-[#EB6A1D] font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Accéder &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-slate-500 border-t border-slate-200/80 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <span>© 2026-2027 ALFASLE LMS • Plateforme Éducative Multi-Établissements</span>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="text-[11px] text-slate-400 hover:text-rose-400 underline transition-colors flex items-center gap-1"
        >
          <span>🧹 Vider le cache & Réinitialiser</span>
        </button>
      </footer>

      {/* Public Pre-Registration Modal */}
      <PreRegistrationModal
        isOpen={isPreRegModalOpen}
        onClose={() => setIsPreRegModalOpen(false)}
        defaultRole={preRegRole}
      />

      {/* Reset Cache Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetStoreToDefaults}
        title="Réinitialisation des Données"
        message="Voulez-vous vider le cache et réinitialiser les données de démonstration de la plateforme ?"
        confirmLabel="Réinitialiser"
        cancelLabel="Annuler"
        variant="warning"
      />
    </div>
  );
}
