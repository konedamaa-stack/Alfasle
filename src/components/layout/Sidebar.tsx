"use client";

import React from "react";
import { useStore } from "@/lib/store";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  FileCheck2,
  Users,
  UserCheck,
  Settings,
  Compass,
  Award,
  BarChart3,
  Video,
  FolderKanban,
  School,
  HeartHandshake,
  Shield,
  Sparkles,
} from "lucide-react";

export type NavTab =
  | "dashboard"
  | "superadmin"
  | "etablissements"
  | "classes"
  | "catalog"
  | "inscriptions"
  | "courses"
  | "assignments"
  | "grades"
  | "analytics"
  | "settings";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenSuperAdminModal?: () => void;
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const { currentUser, inscriptions, submissions, assignments, etablissements } = useStore();

  const pendingInscriptionsCount = inscriptions.filter((i) => i.status === "PENDING").length;
  const pendingGradingCount = submissions.filter((s) => s.status === "SUBMITTED").length;
  const pendingAssignmentsCount = assignments.filter((a) => new Date() <= new Date(a.dueDate)).length;

  const getNavItems = () => {
    switch (currentUser.role) {
      case "SUPER_ADMIN":
        return [
          {
            id: "etablissements",
            label: "Gestion des Établissements",
            icon: <School className="w-4 h-4 text-amber-400" />,
            badge: `${etablissements.length} Écoles`,
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          },
          { id: "dashboard", label: "Vue Pédagogique", icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: "classes", label: "Toutes les Classes", icon: <FolderKanban className="w-4 h-4" /> },
          { id: "inscriptions", label: "Inscriptions Globales", icon: <Users className="w-4 h-4" /> },
          { id: "analytics", label: "Métriques & Rapports", icon: <BarChart3 className="w-4 h-4" /> },
          { id: "settings", label: "Paramètres Multi-Tenant", icon: <Settings className="w-4 h-4" /> },
        ];

      case "TEACHER":
        return [
          { id: "dashboard", label: "Tableau de Bord", icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: "classes", label: "Mes Classes", icon: <FolderKanban className="w-4 h-4" /> },
          {
            id: "inscriptions",
            label: "Préinscriptions",
            icon: <UserCheck className="w-4 h-4" />,
            badge: pendingInscriptionsCount > 0 ? pendingInscriptionsCount : null,
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          },
          { id: "courses", label: "Cours & Vidéos", icon: <Video className="w-4 h-4" /> },
          {
            id: "assignments",
            label: "Devoirs & Corrections",
            icon: <FileCheck2 className="w-4 h-4" />,
            badge: pendingGradingCount > 0 ? `${pendingGradingCount} à noter` : null,
            badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          },
          { id: "analytics", label: "Statistiques & Notes", icon: <BarChart3 className="w-4 h-4" /> },
        ];

      case "STUDENT":
        return [
          { id: "dashboard", label: "Mon Espace", icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: "classes", label: "Mes Classes Inscrites", icon: <GraduationCap className="w-4 h-4" /> },
          { id: "catalog", label: "Catalogue des Classes", icon: <Compass className="w-4 h-4" /> },
          { id: "courses", label: "Mes Cours & Leçons", icon: <BookOpen className="w-4 h-4" /> },
          {
            id: "assignments",
            label: "Mes Devoirs",
            icon: <FileCheck2 className="w-4 h-4" />,
            badge: pendingAssignmentsCount > 0 ? pendingAssignmentsCount : null,
            badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          },
          { id: "grades", label: "Mes Notes & Relevés", icon: <Award className="w-4 h-4" /> },
        ];

      case "PARENT":
        return [
          { id: "dashboard", label: "Espace Famille", icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: "classes", label: "Classes des Enfants", icon: <GraduationCap className="w-4 h-4" /> },
          { id: "courses", label: "Cours & Programmes", icon: <BookOpen className="w-4 h-4" /> },
          { id: "grades", label: "Bulletins & Notes", icon: <Award className="w-4 h-4" /> },
        ];

      case "ADMIN":
        return [
          {
            id: "dashboard",
            label: "Direction & Inscriptions",
            icon: <School className="w-4 h-4 text-emerald-400" />,
            badge: currentUser.etablissementName ? currentUser.etablissementName.slice(0, 14) : "Campus",
            badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
          },
          { id: "classes", label: "Classes du Campus", icon: <FolderKanban className="w-4 h-4" /> },
          {
            id: "inscriptions",
            label: "Préinscriptions",
            icon: <UserCheck className="w-4 h-4" />,
            badge: pendingInscriptionsCount > 0 ? `${pendingInscriptionsCount} en attente` : null,
            badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
          },
          { id: "courses", label: "Cours & Formations", icon: <BookOpen className="w-4 h-4" /> },
          { id: "assignments", label: "Devoirs & Évaluations", icon: <FileCheck2 className="w-4 h-4" /> },
          { id: "grades", label: "Notes & Relevés", icon: <Award className="w-4 h-4" /> },
          { id: "analytics", label: "Statistiques Campus", icon: <BarChart3 className="w-4 h-4" /> },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 shrink-0 glass-panel border-r border-slate-800/80 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="space-y-5">
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Menu Principal
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as NavTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? item.id === "superadmin"
                        ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg shadow-amber-600/30"
                        : "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive ? "bg-white/20 text-white border-white/30" : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Super Admin Access Banner for Admins */}
        {currentUser.role === "ADMIN" && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#141208] to-orange-950/40 border border-amber-500/40 space-y-2.5 shadow-lg">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold font-mono">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Accès Super Admin</span>
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed">
              Création d&apos;établissements, quotas d&apos;élèves et gestion des sous-domaines DNS.
            </p>
            <button
              onClick={() => setActiveTab("superadmin")}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-md transition-all"
            >
              <span>Ouvrir Super Admin &rarr;</span>
            </button>
          </div>
        )}

        {/* Quick status card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-semibold text-emerald-400">Plateforme en Ligne</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Année Académique 2026-2027 • Multi-Campus
          </p>
        </div>
      </div>

      {/* Footer support */}
      <div className="pt-4 border-t border-slate-800/80">
        <p className="text-[10px] text-slate-500 text-center">
          AlFasle v1.0.0 • Tous droits réservés
        </p>
      </div>
    </aside>
  );
}
