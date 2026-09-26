"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SuperAdminLoginView } from "@/components/auth/SuperAdminLoginView";
import { SuperAdminDashboard } from "@/components/superadmin/SuperAdminDashboard";
import { useStore } from "@/lib/store";
import {
  Shield,
  ArrowLeft,
  LogOut,
  Sparkles,
  Building2,
  FolderKanban,
  ExternalLink,
} from "lucide-react";

export default function SuperAdminPage() {
  const router = useRouter();
  const { currentUser, setCurrentUser, users } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const isSession = localStorage.getItem("alfasle_session_active") === "true";
      const savedUserRole = localStorage.getItem("alfasle_user_role");
      return isSession && (currentUser.role === "SUPER_ADMIN" || savedUserRole === "SUPER_ADMIN");
    }
    return currentUser.role === "SUPER_ADMIN";
  });

  useEffect(() => {
    if (currentUser.role === "SUPER_ADMIN") {
      setIsAuthenticated(true);
    }
  }, [currentUser]);

  const handleLoginSuccess = () => {
    const superAdminUser =
      users.find((u) => u.role === "SUPER_ADMIN" && u.email === "konedamaa@gmail.com") ||
      users.find((u) => u.role === "SUPER_ADMIN") ||
      users.find((u) => u.role === "ADMIN") ||
      users[0];

    if (typeof window !== "undefined") {
      localStorage.setItem("alfasle_session_active", "true");
      localStorage.setItem("alfasle_active_tab", "superadmin");
      localStorage.setItem("alfasle_user_role", "SUPER_ADMIN");
    }
    setCurrentUser({
      ...superAdminUser,
      role: "SUPER_ADMIN",
    });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("alfasle_session_active");
      localStorage.removeItem("alfasle_user_role");
    }
    setIsAuthenticated(false);
  };

  const handleBackToStandard = () => {
    router.push("/");
  };

  if (!isAuthenticated) {
    return (
      <SuperAdminLoginView
        onLoginSuccess={handleLoginSuccess}
        onBackToStandard={handleBackToStandard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Header Dedicated to Super Admin Route */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
                <div className="w-full h-full bg-amber-50 rounded-[14px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                    AlFasle
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px] font-bold uppercase tracking-wider">
                    Super Admin Root
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Console Centrale de Gestion des Établissements & des Classes
                </p>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToStandard}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              title="Retourner à l'interface standard de cours et tableaux de bord"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Espace Utilisateur</span>
            </button>

            {/* Super Admin Profile badge */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 font-bold text-xs">
                KA
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-slate-900 leading-none">KONE ADAMA</p>
                <p className="text-[10px] text-amber-700 font-mono leading-none mt-0.5">
                  Root Master
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Déconnexion de la session Super Admin"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 lg:p-8">
        <SuperAdminDashboard
          initialTab="ETABLISSEMENTS"
          onSelectClassForCourses={(classId) => {
            if (typeof window !== "undefined") {
              localStorage.setItem("alfasle_active_tab", "courses");
            }
            router.push("/");
          }}
        />
      </main>
    </div>
  );
}

