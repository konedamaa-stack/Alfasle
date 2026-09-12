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
  const { users, currentUser, setCurrentUser, classes, inscriptions } = useStore();

  const [selectedRole, setSelectedRole] = useState<UserRole>("STUDENT");
  const [identifier, setIdentifier] = useState("KONE");
  const [password, setPassword] = useState("Madouu1966@");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Classes specific to this establishment
  const schoolClasses = classes.filter((c) => c.etablissementId === etablissement.id);
  const enrolledCount = schoolClasses.reduce((acc, c) => acc + (c.enrolledCount || 0), 0);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg("");
    if (role === "STUDENT") {
      setIdentifier("KONE");
      setPassword("Madouu1966@");
    } else if (role === "TEACHER") {
      setIdentifier("sarah.mansouri@alfasle.edu");
      setPassword("Madouu1966@");
    } else if (role === "ADMIN") {
      if (etablissement.subdomain === "alarqam" || etablissement.id === "etab_dar_alarqam" || etablissement.directorName?.toLowerCase().includes("djibril")) {
        setIdentifier("djibril");
        setPassword("123");
      } else {
        setIdentifier(etablissement.directorEmail || etablissement.directorName || "konedamaa@gmail.com");
        setPassword("Madouu1966@");
      }
    } else if (role === "PARENT") {
      setIdentifier("parent.kone@gmail.com");
      setPassword("Madouu1966@");
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
          (u.role === selectedRole || selectedRole === "ADMIN")
      );
    }
    if (!matchedUser) {
      matchedUser = users.find(
        (u) =>
          u.name.toLowerCase().includes(cleanId) ||
          u.email.toLowerCase().includes(cleanId) ||
          (u.username && u.username.toLowerCase().includes(cleanId))
      );
    }

    // 4. Fallback
    if (!matchedUser && cleanId.length === 0) {
      matchedUser = users.find((u) => u.role === selectedRole);
    }

    if (matchedUser) {
      const expectedPass = (matchedUser.password || "Madouu1966@").trim();
      const isMasterPass = inputPass === "Madouu1966@" || inputPass === "admin";
      const isCorrectPass = inputPass === expectedPass || isMasterPass;

      if (inputPass && !isCorrectPass) {
        setErrorMsg("Mot de passe incorrect pour cet identifiant.");
        return;
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
    <div className="min-h-screen flex flex-col justify-between bg-[#060a14] text-slate-100 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Subdomain Top Indicator Bar */}
      <div className="w-full bg-[#080e1c] border-b border-blue-500/20 py-2 px-4 sm:px-8 text-xs flex items-center justify-between z-20">
        <div className="flex items-center gap-2 font-mono">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Sous-Domaine Établissement :</span>
          <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/30">
            https://{etablissement.subdomain}.alfasle.edu
          </span>
        </div>

        <button
          onClick={onBackToGlobal}
          className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
        >
          <span>Changer d&apos;établissement (Portail Global)</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Main Subdomain Header */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30">
            <img
              src={
                etablissement.logoUrl ||
                "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150"
              }
              alt={etablissement.name}
              className="w-full h-full object-cover rounded-[14px]"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl tracking-tight text-white">{etablissement.name}</h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {etablissement.code}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-blue-400" />
              {etablissement.city}, {etablissement.country} • {etablissement.type}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenJoinClassModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold shadow-md transition-all"
        >
          <KeyRound className="w-3.5 h-3.5 text-blue-400" />
          <span>Rejoindre une classe ({etablissement.subdomain})</span>
        </button>
      </header>

      {/* Center Subdomain Login Card (Split-Screen) */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 z-10">
        <div className="w-full max-w-4xl bg-[#0e1424] border border-blue-500/30 rounded-[32px] overflow-hidden shadow-2xl shadow-blue-950/40 grid grid-cols-1 md:grid-cols-12 min-h-[560px]">
          
          {/* LEFT COLUMN: School Custom Theme Banner */}
          <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />

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
                <p className="text-xs text-blue-100/90 leading-relaxed">
                  {etablissement.description}
                </p>
              </div>

              {/* School Metrics */}
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-2 text-xs">
                <div className="flex items-center justify-between text-blue-100">
                  <span>Classes disponibles sur ce campus :</span>
                  <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">
                    {schoolClasses.length} Classes
                  </span>
                </div>
                <div className="flex items-center justify-between text-blue-200">
                  <span>Effectif inscrits :</span>
                  <span className="font-bold">{enrolledCount} Élèves</span>
                </div>
                {etablissement.directorName && (
                  <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
                    <span>Directeur :</span>
                    <span className="font-semibold">{etablissement.directorName}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/15 text-[11px] text-blue-200/80">
              Instance sécurisée : <strong className="text-white">{etablissement.subdomain}.alfasle.edu</strong>
            </div>
          </div>

          {/* RIGHT COLUMN: School-scoped Login Form */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#0b101e]">
            <div className="space-y-6">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-mono">
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

              {/* 4 Role Selector Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("STUDENT")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "STUDENT"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/30"
                      : "bg-[#131929] border-slate-700/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">🎓</span>
                  <span className="text-[10px] font-bold">Élève</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("TEACHER")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "TEACHER"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/30"
                      : "bg-[#131929] border-slate-700/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👨‍🏫</span>
                  <span className="text-[10px] font-bold">Prof</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "ADMIN"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/30"
                      : "bg-[#131929] border-slate-700/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="text-lg">👑</span>
                  <span className="text-[10px] font-bold">Direction</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect("PARENT")}
                  className={`p-2.5 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all ${
                    selectedRole === "PARENT"
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md ring-2 ring-blue-500/30"
                      : "bg-[#131929] border-slate-700/60 text-slate-400 hover:text-white"
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
                    Identifiant élève / Nom / Email *
                  </label>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ex: KONE ou matricule..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#060a14] border border-slate-700 text-white focus:outline-none focus:border-blue-500"
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
                      className="w-full px-4 py-2.5 rounded-2xl bg-[#060a14] border border-slate-700 text-white focus:outline-none focus:border-blue-500"
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
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
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
                      const st = users.find((u) => u.role === "STUDENT") || users[0];
                      setCurrentUser({
                        ...st,
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                      });
                      onLoginSuccess();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-left transition-all text-xs"
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
                      const tc = users.find((u) => u.role === "TEACHER") || users[0];
                      setCurrentUser({
                        ...tc,
                        etablissementId: etablissement.id,
                        etablissementName: etablissement.name,
                      });
                      onLoginSuccess();
                    }}
                    className="flex items-center gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-left transition-all text-xs"
                  >
                    <span className="text-base">👨‍🏫</span>
                    <div>
                      <p className="text-[11px] font-bold text-white">Professeur</p>
                      <p className="text-[9px] text-slate-400">Gestion pédagogique</p>
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
                        className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[10px] text-blue-300 font-mono"
                      >
                        {c.classCode} ({c.title})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Pas encore inscrit dans une classe ?{" "}
              <button
                type="button"
                onClick={onOpenJoinClassModal}
                className="text-blue-400 font-bold hover:underline"
              >
                Rejoindre avec un Code &rarr;
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 text-xs text-slate-500 border-t border-slate-900 z-10">
        © 2026-2027 {etablissement.name} • Hébergé sur la plateforme AlFasle Multi-Tenant
      </footer>
    </div>
  );
}
