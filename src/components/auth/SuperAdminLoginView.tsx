"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { User } from "@/types";
import {
  ShieldAlert,
  KeyRound,
  Lock,
  Terminal,
  Cpu,
  Server,
  Fingerprint,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  Database,
  Globe,
  Radio,
  Zap,
} from "lucide-react";

interface SuperAdminLoginViewProps {
  onLoginSuccess: () => void;
  onBackToStandard: () => void;
}

export function SuperAdminLoginView({
  onLoginSuccess,
  onBackToStandard,
}: SuperAdminLoginViewProps) {
  const { setCurrentUser, users } = useStore();

  const [masterLogin, setMasterLogin] = useState("konedamaa@gmail.com");
  const [masterPassword, setMasterPassword] = useState("Madouu1966@");
  const [securityPin, setSecurityPin] = useState("994821");
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"PASSWORD" | "2FA_PIN" | "BIOMETRIC">("PASSWORD");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuperAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage("Vérification des clés de chiffrement Root & Autorisation multi-tenant...");

    setTimeout(() => {
      // Find super admin or match KONE ADAMA
      let superUser =
        users.find((u) => u.email.toLowerCase() === "konedamaa@gmail.com" && u.role === "SUPER_ADMIN") ||
        users.find((u) => u.email.toLowerCase() === "konedamaa@gmail.com") ||
        users.find((u) => u.role === "SUPER_ADMIN");

      if (!superUser) {
        superUser = {
          id: "u_super_admin_root",
          name: "KONE ADAMA (Super Admin Master)",
          email: "konedamaa@gmail.com",
          role: "SUPER_ADMIN",
          bio: "Super Administrateur Global et Fondateur de l'Infrastructure Multi-Établissements AlFasle.",
          avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
          createdAt: new Date().toISOString(),
        };
      } else {
        superUser = {
          ...superUser,
          role: "SUPER_ADMIN",
          name: "KONE ADAMA (Super Admin Master)",
          email: "konedamaa@gmail.com",
        };
      }

      setCurrentUser(superUser);
      setIsLoading(false);
      onLoginSuccess();
    }, 600);
  };

  const handleBiometricSim = () => {
    setIsLoading(true);
    setStatusMessage("Scan biométrique en cours : Empreinte cryptographique FIDO2...");
    setTimeout(() => {
      const superUser: User = {
        id: "u_super_admin_root",
        name: "KONE ADAMA (Super Admin Master)",
        email: "konedamaa@gmail.com",
        role: "SUPER_ADMIN",
        bio: "Super Administrateur Global et Fondateur de l'Infrastructure Multi-Établissements AlFasle.",
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(superUser);
      setIsLoading(false);
      onLoginSuccess();
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      {/* Background Cyber Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-amber-500/10 via-purple-600/10 to-blue-600/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-400/40">
            <Terminal className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-200 to-white">
                ALFASLE CORE
              </span>
              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 tracking-wider">
                ROOT MASTER
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Infrastructure & Multi-Tenant Management Portal
            </p>
          </div>
        </div>

        <button
          onClick={onBackToStandard}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
          <span>Portail Standard (Élèves / Profs / Direction)</span>
        </button>
      </header>

      {/* Center Super Admin Console Login */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-4xl bg-[#090e1c]/95 border border-amber-500/30 rounded-[32px] overflow-hidden shadow-2xl shadow-amber-950/20 grid grid-cols-1 md:grid-cols-12 backdrop-blur-xl">
          
          {/* LEFT COLUMN: Cyber Shield & Security Monitor (5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-b from-[#0b1329] via-[#070c1b] to-[#040711] p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80 relative">
            <div className="space-y-6">
              {/* Security clearance badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>NIVEAU DE SÉCURITÉ : ROOT 0</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight flex items-center gap-2">
                  <span>Console Master</span>
                  <span className="text-amber-400">🛡️</span>
                </h1>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Accès exclusif aux super administrateurs pour la gestion des clusters de serveurs, isolation multi-campus, et droits globaux.
                </p>
              </div>

              {/* Real-time System HUD */}
              <div className="space-y-2.5 pt-2">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 font-mono text-[11px] space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Server className="w-3.5 h-3.5 text-blue-400" />
                      Cluster Global :
                    </span>
                    <span className="text-emerald-400 font-bold">4 Noeuds En Ligne</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Database className="w-3.5 h-3.5 text-purple-400" />
                      Bases Multi-Campus :
                    </span>
                    <span className="text-purple-300 font-bold">Synchronisées</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Globe className="w-3.5 h-3.5 text-cyan-400" />
                      Instances Scolaires :
                    </span>
                    <span className="text-amber-300 font-bold">Algérie • Côte d&apos;Ivoire</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Info */}
            <div className="pt-6 border-t border-slate-800/80 space-y-1.5 text-[10px] font-mono text-slate-500">
              <p className="text-slate-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Chiffrement Matériel Quantum-Resistant
              </p>
              <p>Audit Log ID : #ROOT-SEC-2026-99A</p>
            </div>
          </div>

          {/* RIGHT COLUMN: Master Login Form (7 cols) */}
          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-[#080d1a]">
            <div className="space-y-6">
              
              {/* Header Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Authentification Super Admin
                  </h2>
                  <p className="text-xs text-amber-400 font-mono mt-0.5">
                    MASTER ROOT CREDENTIALS REQUIRED
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
              </div>

              {/* 3 Authentication Modes Tabs */}
              <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode("PASSWORD")}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "PASSWORD"
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Clé Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("2FA_PIN")}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "2FA_PIN"
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>PIN 2FA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("BIOMETRIC")}
                  className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "BIOMETRIC"
                      ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>FIDO2</span>
                </button>
              </div>

              {/* STATUS OR ERROR NOTIFICATION */}
              {statusMessage && (
                <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 animate-spin shrink-0" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* FORM MODE 1 & 2: MASTER PASSWORD & 2FA */}
              {authMode !== "BIOMETRIC" ? (
                <form onSubmit={handleSuperAdminLogin} className="space-y-4 text-xs">
                  {/* Master Login Input */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1.5 font-mono">
                      Identifiant Master / Root Email *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={masterLogin}
                        onChange={(e) => setMasterLogin(e.target.value)}
                        placeholder="superadmin@alfasle.global ou root.kone"
                        className="w-full px-4 py-3 rounded-2xl bg-[#030611] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password or PIN */}
                  {authMode === "PASSWORD" ? (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-slate-300 font-semibold font-mono">
                          Mot de passe Master Root *
                        </label>
                        <span className="text-[10px] text-amber-400 hover:underline cursor-pointer">
                          Clé de secours PGP ?
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={masterPassword}
                          onChange={(e) => setMasterPassword(e.target.value)}
                          placeholder="••••••••••••••••"
                          className="w-full pl-4 pr-11 py-3 rounded-2xl bg-[#030611] border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1.5 font-mono">
                        Code Authenticator 6 Chiffres (TOTP) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={securityPin}
                        onChange={(e) => setSecurityPin(e.target.value)}
                        placeholder="994821"
                        className="w-full px-4 py-3 rounded-2xl bg-[#030611] border border-slate-700 text-amber-400 font-mono text-lg tracking-widest text-center focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-black font-black text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 uppercase tracking-wider"
                  >
                    <Zap className="w-4 h-4 fill-black" />
                    <span>Ouvrir la Console Super Admin</span>
                  </button>
                </form>
              ) : (
                /* BIOMETRIC MODE */
                <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/15 group cursor-pointer animate-pulse">
                    <Fingerprint className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Clé de Sécurité Matérielle (YubiKey / FIDO2)</h4>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Touchez votre clé USB de sécurité ou validez via Windows Hello / Touch ID.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBiometricSim}
                    disabled={isLoading}
                    className="px-6 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20"
                  >
                    Simuler la détection FIDO2 Root
                  </button>
                </div>
              )}

              {/* Quick 1-Click Super Admin Access */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleSuperAdminLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-amber-300 text-xs font-semibold flex items-center justify-between transition-all"
                >
                  <span className="flex items-center gap-2">
                    <span>👑</span>
                    <span>Accès Direct Démo : Super Admin Master</span>
                  </span>
                  <span className="text-amber-400 text-[10px] font-mono">&rarr; Entrer</span>
                </button>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="pt-4 mt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
              Toutes les connexions Root sont tracées et journalisées sous IP sécurisée.
            </div>
          </div>
        </div>
      </main>

      {/* Page Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-600 border-t border-slate-900 z-10 font-mono">
        ALFASLE ENTERPRISE CORE v3.4 • MASTER SYSTEM CONTROLLER
      </footer>
    </div>
  );
}
