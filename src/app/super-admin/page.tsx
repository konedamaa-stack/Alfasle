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
    <div className="min-h-screen bg-[#F4F7F6] text-slate-800 selection:bg-[#0D5B4D] selection:text-white flex flex-col">
      {/* Top Header Dedicated to Super Admin Route */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left Brand & Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D5B4D] to-[#00A896] p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-[#0D5B4D] rounded-[14px] flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#0D5B4D] text-base sm:text-lg tracking-tight">
                    AlFasle
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FFF8F2] border border-[#EB6A1D]/40 text-[#EB6A1D] font-mono text-[10px] font-bold uppercase tracking-wider">
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
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Retourner à l'interface standard de cours et tableaux de bord"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Espace Utilisateur</span>
            </button>

            {/* Super Admin Profile badge */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#E8F5F2] border border-[#00A896]/30">
              <div className="w-7 h-7 rounded-lg bg-[#0D5B4D] flex items-center justify-center text-white font-bold text-xs">
                KA
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-[#0D5B4D] leading-none">KONE ADAMA</p>
                <p className="text-[10px] text-[#EB6A1D] font-mono leading-none mt-0.5 font-bold">
                  Root Master
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Déconnexion de la session Super Admin"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
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

