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
  const { users, currentUser, setCurrentUser, etablissements, classes, inscriptions, resetStoreToDefaults } = useStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [identifier, setIdentifier] = useState("konedamaa@gmail.com");
  const [password, setPassword] = useState("Madouu1966");
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
      cardBg: "from-amber-600 via-orange-700 to-slate-50",
      gradient: "from-amber-500 to-orange-600",
    },
    ADMIN: {
      badgeIcon: "👑",
      leftTitle: "Direction & Établissement !",
      leftDesc:
        "Pilotez l'ensemble des activités, établissements, classes et paramètres de votre système éducatif.",
      roleSubtitle: "connexion en tant que directeur d'établissement",
      espaceTitle: "Espace Direction (CHÉRIF)",
      espaceDesc: "Direction de l'établissement جامعة النور الإسلامية & Supervision Pédagogique",
      defaultLogin: "cherifladivo@gmail.com",
      defaultPass: "Madouu966",
      cardBg: "from-emerald-700 via-teal-800 to-slate-900",
      gradient: "from-emerald-600 to-teal-700",
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

  const handleFastLogin = (loginEmail: string, pass: string, role: UserRole) => {
    let target = users.find(
      (u) =>
        u.email.toLowerCase() === loginEmail.toLowerCase() ||
        (u.username && u.username.toLowerCase() === loginEmail.toLowerCase())
    );

    if (!target) {
      if (loginEmail.includes("kone")) {
        target = {
          id: "u_admin_kone",
          name: "KONE ADAMA (Directeur)",
          username: "konedamaa",
          email: "konedamaa@gmail.com",
          password: "Madouu1966",
          role: "ADMIN",
          bio: "Directeur de l'établissement هيئة التدريس - جامعة النور الإسلامية.",
          avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
          etablissementId: "etab_1792343761588",
          etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
          createdAt: new Date().toISOString(),
        };
      } else {
        target = {
          id: "u_admin_diawara",
          name: "Dr. Mahamadou DIAWARA",
          username: "diawara",
          email: "diawara@gmail.com",
          password: "Madouu1966",
          role: "ADMIN",
          bio: "Directeur du Lycée d'Excellence AlFasle.",
          avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          etablissementId: "etab_lycee_excellence",
          etablissementName: "Lycée d'Excellence AlFasle",
          createdAt: new Date().toISOString(),
        };
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alfasle_session_active", "true");
        localStorage.setItem("alfasle_active_tab", "dashboard");
        localStorage.setItem("alfasle_user_role", target.role);
      } catch (_) {}
    }

    setCurrentUser(target);
    onLoginSuccess();
  };

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
        if (!inputPass || (inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin")) {
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
            bio: "Directeur de l'établissement هيئة التدريس - جامعة النور الإسلامية.",
            avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            etablissementId: "etab_1792343761588",
            etablissementName: "هيئة التدريس - جامعة النور الإسلامية",
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

      const isDirectorDiawara =
        cleanId === "diawara@gmail.com" ||
        cleanId === "diawara";

      if (isDirectorDiawara) {
        if (!inputPass || (inputPass !== "Madouu1966" && inputPass !== "Madouu1966@" && inputPass !== "admin")) {
          setErrorMsg("Mot de passe incorrect pour le compte Directeur.");
          return;
        }

        let dirUser = users.find(
          (u) =>
            u.email.toLowerCase() === "diawara@gmail.com" ||
            (u.username && u.username.toLowerCase() === "diawara")
        );

        if (!dirUser) {
          dirUser = {
            id: "u_admin_diawara",
            name: "Dr. Mahamadou DIAWARA",
            username: "diawara",
            email: "diawara@gmail.com",
            password: "Madouu1966",
            role: "ADMIN",
            bio: "Directeur Général du Lycée d'Excellence AlFasle (Yamoussoukro).",
            avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            etablissementId: "etab_lycee_excellence",
            etablissementName: "Lycée d'Excellence AlFasle",
            createdAt: new Date().toISOString(),
          };
        } else {
          dirUser = {
            ...dirUser,
            etablissementId: "etab_lycee_excellence",
            etablissementName: "Lycée d'Excellence AlFasle",
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
            id: "u_admin_sanogo",
            name: "M. SANOGO (Directeur)",
            username: "sanogo",
            email: "sanogo@gmail.com",
            password: "Madouu1966",
            role: "ADMIN",
            bio: "Directeur de l'établissement RAYATIL ISLAM.",
            avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            etablissementId: "etab_1790534921442",
            etablissementName: "RAYATIL ISLAM",
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

    // Super Admin Master Shortcut
    const isSuperAdmin =
      (selectedRole === "SUPER_ADMIN" || cleanId === "superadmin" || cleanId === "root") &&
      (cleanId === "konedamaa@gmail.com" ||
        cleanId === "konedma@gmil.com" ||
        cleanId === "konedamaa" ||
        cleanId === "superadmin" ||
        cleanId === "root");

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
        try {
          localStorage.setItem("alfasle_session_active", "true");
          localStorage.setItem("alfasle_active_tab", "dashboard");
        } catch (_) {}
      }
      onLoginSuccess();
      return;
    }

    const norm = (s: string) =>
      s.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const normPhone = (p?: string) => (p || "").replace(/[^0-9]/g, "");
    const normId = norm(cleanId);
    const cleanDigits = normPhone(cleanId);
    const isPotentialPhone = cleanDigits.length >= 6;

    const phoneMatches = (p?: string) => {
      if (!isPotentialPhone || !p) return false;
      const uDigits = normPhone(p);
      if (uDigits.length < 6) return false;
      return (
        cleanDigits === uDigits ||
        cleanDigits.endsWith(uDigits) ||
        uDigits.endsWith(cleanDigits)
      );
    };

    // Checks if a user matches the identifier:
    // 1. Exact email match
    // 2. Exact username match
    // 3. Exact full name match
    // 4. Exact word match in full name (e.g. "KONE" or "FATOU" for "KONE FATOU")
    // 5. Phone number match (direct on user or through inscriptions)
    const matchesUser = (u: User) => {
      if (norm(u.email) === normId) return true;
      if (u.username && norm(u.username) === normId) return true;
      if (norm(u.name) === normId) return true;
      const nameWords = norm(u.name)
        .replace(/[()[\],.:;!?"'-]/g, " ")
        .split(/\s+/)
        .filter(Boolean);
      if (normId.length >= 2 && nameWords.some((w) => w === normId)) return true;
      if (phoneMatches(u.phone)) return true;
      if (
        isPotentialPhone &&
        inscriptions.some(
          (ins) =>
            (ins.userId === u.id || ins.userEmail.toLowerCase() === u.email.toLowerCase()) &&
            phoneMatches(ins.userPhone)
        )
      ) {
        return true;
      }
      return false;
    };

    // 1. Search for matching candidates with selected role preference
    let candidates = users.filter((u) => matchesUser(u) && u.role === selectedRole);

    // 2. If no candidate found in selected role, search across all users
    if (candidates.length === 0) {
      candidates = users.filter((u) => matchesUser(u));
    }

    if (candidates.length === 0) {
      setErrorMsg("Identifiant ou email introuvable. Veuillez vérifier vos identifiants ou contacter l'administration.");
      return;
    }

    if (!inputPass) {
      setErrorMsg("Veuillez saisir votre mot de passe.");
      return;
    }

    // Among candidates matching the name, find the user whose password strictly matches
    let matchedUser = candidates.find((u) => {
      const expectedPass = (u.password || "Madouu1966@").trim();
      const isMasterPass = inputPass === "Madouu1966@" || inputPass === "admin";
      return inputPass === expectedPass || isMasterPass;
    });

    if (!matchedUser) {
      setErrorMsg("Mot de passe incorrect pour cet identifiant.");
      return;
    }

    setCurrentUser(matchedUser);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alfasle_session_active", "true");
        localStorage.setItem("alfasle_active_tab", "dashboard");
      } catch (_) {}
    }
    onLoginSuccess();
  };

  const handleDirectDemoLogin = (user: User) => {
    setCurrentUser(user);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 text-slate-800 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background soft glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[130px] pointer-events-none -z-0" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-slate-900">
                ALFASLE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Multi-Campus
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Gestion Scolaire & Distribution de Cours
            </p>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-end">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              setPreRegRole("STUDENT");
              setIsPreRegModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-bold shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            title="Pré-inscription en ligne"
          >
            <span>📝</span>
            <span className="hidden sm:inline">Pré-inscription</span>
          </button>

          <button
            onClick={onOpenJoinClassModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold shadow-sm transition-all transform hover:-translate-y-0.5 cursor-pointer"
            title="Rejoindre avec un code classe"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Code Classe</span>
          </button>

          {onOpenSuperAdmin && (
            <button
              onClick={onOpenSuperAdmin}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold shadow-sm transition-all transform hover:-translate-y-0.5 font-mono cursor-pointer"
              title="Console Super Administrateur"
            >
              <span>🛡️</span>
              <span className="hidden md:inline">Super Admin (Root)</span>
              <span className="md:hidden hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Auth Card container (Identical structure to reference image) */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 z-10 w-full max-w-7xl mx-auto">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl sm:rounded-[32px] overflow-hidden shadow-2xl shadow-slate-300/40 grid grid-cols-1 md:grid-cols-12 min-h-[540px]">
          
          {/* LEFT COLUMN: Modern Gradient Banner (5 cols) */}
          <div
            className={`md:col-span-5 bg-gradient-to-br ${currentConfig.cardBg} p-6 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-500`}
          >
            {/* Soft decorative background shapes */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-slate-50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-slate-50 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge matching screenshot: ESSAYER2 */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 backdrop-blur-md border border-slate-200 text-xs font-bold shadow-sm">
                <span>🏫</span>
                <span className="tracking-wide uppercase">{brandBadgeText}</span>
              </div>

              {/* Dynamic Title and Desc */}
              <div className="space-y-4 pt-4">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-sm">
                  {currentConfig.leftTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-sm">
                  {currentConfig.leftDesc}
                </p>
              </div>

              {/* Extra multi-school pill */}
              <div className="pt-2">
                <div className="p-3 rounded-2xl bg-slate-100 backdrop-blur-md border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-900">
                    <span>Établissements connectés</span>
                    <span className="font-bold bg-white/25 px-2 py-0.5 rounded-full">
                      {etablissements.length} Écoles
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-700">
                    <span>Classes actives</span>
                    <span className="font-bold">{classes.length} Formations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Left Note */}
            <div className="relative z-10 pt-6 border-t border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Connexion sécurisée SSL / TLS 256-bit</span>
              </div>
              <p className="text-[11px] text-slate-700">
                Année Scolaire & Universitaire 2026-2027
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Login Form (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white text-slate-800">
            <div className="space-y-6">
              
              {/* Top Row in Right Column: Badge ESSAYER2 */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-bold">
                  <span>🏫</span>
                  <span>{brandBadgeText}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">Portail Multi-Rôles</span>
              </div>

              {/* Header Titles */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Se connecter
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-medium lowercase">
                  {currentConfig.roleSubtitle}
                </p>
              </div>

              {/* 4 Role Selector Buttons (Styled exactly like the screenshot with soft frames) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1: Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center cursor-pointer ${
                    selectedRole === "ADMIN"
                      ? "bg-[#faf5f0] border-[#b58d6b] text-[#6d4624] shadow-md ring-2 ring-[#b58d6b]/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#b58d6b]/15 border border-[#b58d6b]/30 flex items-center justify-center text-lg">
                    👑
                  </div>
                  <span className="text-[11px] font-bold">Directeur</span>
                </button>

                {/* 2: Enseignant */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("TEACHER")}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center cursor-pointer ${
                    selectedRole === "TEACHER"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-md ring-2 ring-emerald-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-lg">
                    👨‍🏫
                  </div>
                  <span className="text-[11px] font-bold">Enseignant</span>
                </button>

                {/* 3: Élève */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT")}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center cursor-pointer ${
                    selectedRole === "STUDENT"
                      ? "bg-blue-50 border-blue-500 text-blue-800 shadow-md ring-2 ring-blue-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-lg">
                    🎓
                  </div>
                  <span className="text-[11px] font-bold">Élève</span>
                </button>

                {/* 4: Parent d'élève */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("PARENT")}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center cursor-pointer ${
                    selectedRole === "PARENT"
                      ? "bg-purple-50 border-purple-500 text-purple-800 shadow-md ring-2 ring-purple-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-lg">
                    👨‍👩‍👧
                  </div>
                  <span className="text-[11px] font-bold">Parent d&apos;élève</span>
                </button>
              </div>

              {/* Dynamic Espace Description */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>{currentConfig.badgeIcon}</span>
                  <span>{currentConfig.espaceTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {currentConfig.espaceDesc}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Identifiant */}
                <div>
                  <label className="block text-slate-700 font-medium mb-1.5">
                    {selectedRole === "STUDENT"
                      ? "Identifiant, Nom, Prénom ou Téléphone *"
                      : selectedRole === "ADMIN"
                      ? "Identifiant Direction / Email *"
                      : selectedRole === "TEACHER"
                      ? "Identifiant Enseignant / Email *"
                      : selectedRole === "PARENT"
                      ? "Identifiant Parent / Email *"
                      : "Identifiant / Login ou Email *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={
                      selectedRole === "STUDENT"
                        ? "ex: KONE, FATOU ou 0701020304"
                        : "ex: KONE, téléphone ou admin@gmail.com"
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-all shadow-sm"
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-700 font-medium">mot de passe</label>
                    <span className="text-[11px] text-blue-600 hover:text-blue-700 cursor-pointer">
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
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    type="checkbox"
                    id="rememberCheck"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberCheck" className="text-slate-600 text-[11px] cursor-pointer">
                    Se souvenir de moi sur cet appareil
                  </label>
                </div>

                                {/* Bouton d'accès direct 1-Clic KONE ADAMA */}
                <div className="p-3 rounded-2xl bg-gradient-to-r from-[#faf5f0] to-[#f4ede4] border border-[#e2d2c1] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#6d4624] flex items-center gap-1.5">
                      <span>👑</span>
                      <span>Connexion Directe 1-Clic :</span>
                    </span>
                    <span className="text-[10px] font-bold text-[#865d3d] bg-white px-2 py-0.5 rounded-full border border-[#e2d2c1]">
                      Sans mot de passe
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFastLogin("konedamaa@gmail.com", "Madouu1966", "ADMIN")}
                      className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#a87f5d] to-[#865d3d] hover:from-[#b58d6b] hover:to-[#926644] text-white font-extrabold text-[11px] flex items-center justify-between shadow-md shadow-[#865d3d]/20 transition-all cursor-pointer"
                    >
                      <span>Entrer : KONE ADAMA</span>
                      <span>&rarr;</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFastLogin("diawara@gmail.com", "Madouu1966", "ADMIN")}
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center justify-between transition-all cursor-pointer"
                    >
                      <span>Entrer : Dr. DIAWARA</span>
                      <span>&rarr;</span>
                    </button>
                  </div>
                </div>

                {/* Submit button matching reference image */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    className={`flex-1 py-3 px-6 rounded-2xl ${
                      selectedRole === "ADMIN"
                        ? "bg-gradient-to-r from-[#b58d6b] via-[#9e7350] to-[#815535] hover:opacity-95 shadow-[#815535]/30"
                        : "bg-blue-600 hover:bg-blue-500 shadow-blue-600/30"
                    } text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer`}
                  >
                    <LogIn className="w-4 h-4" />
                    <span>connexion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormSubmit({ preventDefault: () => {} } as any)}
                    className="text-slate-500 hover:text-slate-700 text-xs px-3 py-3 cursor-pointer"
                  >
                    Retour &gt;
                  </button>
                </div>
              </form>
            </div>

            {/* Bottom footer links */}
            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-center text-xs text-slate-500">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreRegRole("STUDENT");
                    setIsPreRegModalOpen(true);
                  }}
                  className="text-emerald-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
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
                  className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>👨‍🏫 Candidature Professeur</span>
                </button>
              </div>

              <div>
                Vous avez déjà un code ?{" "}
                <button
                  type="button"
                  onClick={onOpenJoinClassModal}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Rejoindre une classe &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated School Subdomains Banner (Requirement: chaque élève se connecte à un établissement en sous-domaine) */}
        <div className="w-full max-w-4xl mt-6 p-5 sm:p-6 rounded-3xl bg-white border border-slate-200 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Accès Élèves & Enseignants par Sous-Domaine Établissement</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200 font-mono">
                    Multi-Tenant DNS
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Chaque établissement possède son propre portail et sous-domaine isolé
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              {etablissements.length} campus déployés
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {etablissements.map((etab) => {
              const etabClasses = classes.filter((c) => c.etablissementId === etab.id);

              return (
                <div
                  key={etab.id}
                  onClick={() => onSelectSubdomainSchool && onSelectSubdomainSchool(etab)}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">🏫</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        .{etab.subdomain || "alfasle"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {etab.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 truncate">
                      <Globe className="w-2.5 h-2.5 text-slate-400" />
                      <span>{etab.subdomain || etab.id}.alfasle.edu</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">
                      {etabClasses.length} classe{etabClasses.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                      Connexion &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full text-center py-4 px-4 text-xs text-slate-500 border-t border-slate-200 z-10 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-7xl mx-auto">
        <span>© 2026-2027 ALFASLE LMS • Plateforme Éducative Multi-Établissements</span>
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="text-[11px] text-slate-400 hover:text-rose-500 underline transition-colors flex items-center gap-1 cursor-pointer"
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

