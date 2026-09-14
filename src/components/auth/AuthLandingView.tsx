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
  const { users, currentUser, setCurrentUser, etablissements, classes } = useStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [identifier, setIdentifier] = useState("konedamaa@gmail.com");
  const [password, setPassword] = useState("Madouu1966@");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [brandBadgeText, setBrandBadgeText] = useState("ESSAYER2");
  const [isPreRegModalOpen, setIsPreRegModalOpen] = useState(false);
  const [preRegRole, setPreRegRole] = useState<InscriptionRole>("STUDENT");

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
      espaceTitle: "Espace Directeur (Dr. DIAWARA)",
      espaceDesc: "Accès Direction, Supervision de l'Établissement et Gestion",
      defaultLogin: "diawara@gmail.com",
      defaultPass: "Madouu1966@",
      cardBg: "from-blue-600 via-blue-700 to-indigo-800",
      gradient: "from-blue-600 to-indigo-600",
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
      defaultPass: "Madouu1966@",
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
      defaultPass: "Madouu1966@",
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
      defaultPass: "Madouu1966@",
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

    // Super Admin Master Shortcut
    const isSuperAdmin =
      cleanId === "konedamaa@gmail.com" ||
      cleanId === "konedma@gmil.com" ||
      cleanId === "konedama@gmail.com" ||
      cleanId === "konedma@gmail.com" ||
      cleanId === "konedamaa" ||
      cleanId === "konedama" ||
      cleanId === "konedma" ||
      cleanId === "superadmin" ||
      cleanId === "root";

    if (isSuperAdmin) {
      if (inputPass && inputPass !== "Madouu1966@" && inputPass !== "admin") {
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
    <div className="min-h-screen flex flex-col justify-between bg-[#070b14] text-slate-100 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none -z-0" />

      {/* Top Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200">
                ALFASLE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Multi-Campus
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Gestion Scolaire & Distribution de Cours
            </p>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => {
              setPreRegRole("STUDENT");
              setIsPreRegModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <span>📝</span>
            <span>Pré-inscription</span>
          </button>

          <button
            onClick={onOpenJoinClassModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-blue-300 border border-blue-500/30 text-xs font-semibold shadow-md transition-all transform hover:-translate-y-0.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-blue-400" />
            <span>Code Classe</span>
          </button>

          {onOpenSuperAdmin && (
            <button
              onClick={onOpenSuperAdmin}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold shadow-md transition-all transform hover:-translate-y-0.5 font-mono"
            >
              <span>🛡️</span>
              <span>Super Admin (Root)</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Auth Card container (Identical structure to reference image) */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 z-10">
        <div className="w-full max-w-4xl bg-[#111726] border border-slate-700/60 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-950/40 grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
          
          {/* LEFT COLUMN: Modern Blue Gradient Banner (5 cols) */}
          <div
            className={`md:col-span-5 bg-gradient-to-br ${currentConfig.cardBg} p-8 sm:p-10 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-500`}
          >
            {/* Soft decorative background shapes */}
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Badge matching screenshot: ESSAYER2 */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-xs font-bold shadow-sm">
                <span>🏫</span>
                <span className="tracking-wide uppercase">{brandBadgeText}</span>
              </div>

              {/* Dynamic Title and Desc */}
              <div className="space-y-4 pt-4">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight drop-shadow-sm">
                  {currentConfig.leftTitle}
                </h1>
                <p className="text-xs sm:text-sm text-blue-50/90 leading-relaxed max-w-sm">
                  {currentConfig.leftDesc}
                </p>
              </div>

              {/* Extra multi-school pill */}
              <div className="pt-2">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-blue-100">
                    <span>Établissements connectés</span>
                    <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">
                      {etablissements.length} Écoles
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-blue-200">
                    <span>Classes actives</span>
                    <span className="font-bold">{classes.length} Formations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Left Note */}
            <div className="relative z-10 pt-6 border-t border-white/15 space-y-2">
              <div className="flex items-center gap-2 text-xs text-blue-100">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Connexion sécurisée SSL / TLS 256-bit</span>
              </div>
              <p className="text-[11px] text-blue-200/70">
                Année Scolaire & Universitaire 2026-2027
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Login Form (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#0e1424]">
            <div className="space-y-6">
              
              {/* Top Row in Right Column: Badge ESSAYER2 */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                  <span>🏫</span>
                  <span>{brandBadgeText}</span>
                </div>
                <span className="text-[11px] text-slate-400">Portail Multi-Rôles</span>
              </div>

              {/* Header Titles */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Se connecter
                </h2>
                <p className="text-xs text-blue-400 mt-1 font-medium lowercase">
                  {currentConfig.roleSubtitle}
                </p>
              </div>

              {/* 4 Role Selector Buttons (Styled exactly like the screenshot with soft frames) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1: Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center ${
                    selectedRole === "ADMIN"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/15 ring-2 ring-blue-500/40"
                      : "bg-[#151c2f] border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg">
                    👑
                  </div>
                  <span className="text-[11px] font-bold">Directeur</span>
                </button>

                {/* 2: Enseignant */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("TEACHER")}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center ${
                    selectedRole === "TEACHER"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/15 ring-2 ring-blue-500/40"
                      : "bg-[#151c2f] border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
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
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center ${
                    selectedRole === "STUDENT"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/15 ring-2 ring-blue-500/40"
                      : "bg-[#151c2f] border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
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
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border transition-all text-center ${
                    selectedRole === "PARENT"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-lg shadow-blue-600/15 ring-2 ring-blue-500/40"
                      : "bg-[#151c2f] border-slate-700/60 text-slate-300 hover:text-white hover:border-slate-600 hover:bg-slate-800"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-lg">
                    👨‍👩‍👧
                  </div>
                  <span className="text-[11px] font-bold">Parent d&apos;élève</span>
                </button>
              </div>

              {/* Dynamic Espace Description */}
              <div className="pt-2 border-t border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentConfig.badgeIcon}</span>
                  <span>{currentConfig.espaceTitle}</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {currentConfig.espaceDesc}
                </p>
              </div>

              {/* Login Form (With exact placeholder from image: ex: KONE ou admin@gmail.com) */}
              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs">
                    {errorMsg}
                  </div>
                )}

                {/* Identifiant */}
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    identifiant / login ou mail
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="ex: KONE ou admin@gmail.com"
                    className="w-full px-4 py-3 rounded-2xl bg-[#080d1a] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-all shadow-inner"
                  />
                </div>

                {/* Mot de passe */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-medium">mot de passe</label>
                    <span className="text-[11px] text-blue-400 hover:text-blue-300 cursor-pointer">
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
                      className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#080d1a] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
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
                    className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="rememberCheck" className="text-slate-400 text-[11px] cursor-pointer">
                    Se souvenir de moi sur cet appareil
                  </label>
                </div>

                {/* Submit button matching reference image */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>connexion</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormSubmit({ preventDefault: () => {} } as any)}
                    className="text-slate-400 hover:text-white text-xs px-3 py-3"
                  >
                    Retour &gt;
                  </button>
                </div>
              </form>

              {/* Quick 1-Click Demo Profiles */}
              <div className="pt-4 border-t border-slate-800/80">
                <p className="text-[11px] text-slate-400 font-semibold mb-2">
                  ⚡ Connexion Rapide Démo (1 Clic) :
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {users.map((u) => {
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleDirectDemoLogin(u)}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800 text-left transition-all text-xs group"
                      >
                        <img
                          src={
                            u.avatarUrl ||
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"
                          }
                          alt={u.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-blue-300">
                            {u.name}
                          </p>
                          <p className="text-[9px] text-slate-400 truncate capitalize">
                            {u.role.toLowerCase()}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom footer links */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-2 text-center text-xs text-slate-400">
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
                  className="text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>👨‍🏫 Candidature Professeur</span>
                </button>
              </div>

              <div>
                Vous avez déjà un code ?{" "}
                <button
                  type="button"
                  onClick={onOpenJoinClassModal}
                  className="text-blue-400 font-bold hover:underline"
                >
                  Rejoindre une classe &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dedicated School Subdomains Banner (Requirement: chaque élève se connecte à un établissement en sous-domaine) */}
        <div className="w-full max-w-4xl mt-6 p-5 sm:p-6 rounded-3xl bg-[#0d1322]/90 border border-slate-800/90 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <span>Accès Élèves & Enseignants par Sous-Domaine Établissement</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-mono">
                    Multi-Tenant DNS
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Chaque établissement possède son propre portail et sous-domaine isolé
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">
              {etablissements.length} campus déployés
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {etablissements.map((etab) => {
              const etabClasses = classes.filter((c) => c.etablissementId === etab.id);
              const etabSubdomainUrl = `https://${etab.subdomain || etab.id}.alfasle.edu`;

              return (
                <div
                  key={etab.id}
                  onClick={() => onSelectSubdomainSchool && onSelectSubdomainSchool(etab)}
                  className="p-3.5 rounded-2xl bg-[#131b2e] hover:bg-[#18233c] border border-slate-700/60 hover:border-blue-500/60 transition-all cursor-pointer group flex flex-col justify-between shadow-md"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-lg">🏫</span>
                      <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                        .{etab.subdomain || "alfasle"}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                      {etab.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1 truncate">
                      <Globe className="w-2.5 h-2.5 text-slate-500" />
                      <span>{etab.subdomain || etab.id}.alfasle.edu</span>
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">
                      {etabClasses.length} classe{etabClasses.length > 1 ? "s" : ""}
                    </span>
                    <span className="text-blue-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
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
      <footer className="w-full text-center py-4 text-xs text-slate-500 border-t border-slate-900/80 z-10">
        © 2026-2027 ALFASLE LMS • Plateforme Éducative Multi-Établissements
      </footer>

      {/* Public Pre-Registration Modal */}
      <PreRegistrationModal
        isOpen={isPreRegModalOpen}
        onClose={() => setIsPreRegModalOpen(false)}
        defaultRole={preRegRole}
      />
    </div>
  );
}
