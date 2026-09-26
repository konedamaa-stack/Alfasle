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
  LogOut,
  X,
} from "lucide-react";
import { ConfirmModal } from "@/components/common/ConfirmModal";

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
  onLogout?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const { currentUser, inscriptions, submissions, assignments, etablissements } = useStore();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false);

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
          {
            id: "classes",
            label: "Gestion des Classes",
            icon: <FolderKanban className="w-4 h-4 text-purple-400" />,
            badge: `${classes.length} Classes`,
            badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
          },
          {
            id: "superadmin",
            label: "Console Root Master",
            icon: <Shield className="w-4 h-4 text-emerald-400" />,
          },
          { id: "dashboard", label: "Vue Pédagogique", icon: <LayoutDashboard className="w-4 h-4" /> },
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

  const renderSidebarContent = (isMobile = false) => (
    <div className="space-y-5 flex-1 flex flex-col justify-between">
      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between px-3 mb-3">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Menu Principal
            </p>
            {isMobile && onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                aria-label="Fermer le menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as NavTab);
                    if (isMobile && onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? item.id === "superadmin"
                        ? "bg-[#EB6A1D] text-white font-bold shadow-md shadow-orange-500/25"
                        : "bg-[#0D5B4D] text-white font-bold shadow-md shadow-[#0D5B4D]/25"
                      : "text-slate-600 hover:bg-[#E8F5F2] hover:text-[#0D5B4D]"
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

        {/* Super Admin Access Banner (uniquement pour le rôle SUPER_ADMIN) */}
        {currentUser.role === "SUPER_ADMIN" && (
          <div className="p-3.5 rounded-2xl bg-orange-50/80 border border-orange-200 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-[#EB6A1D] text-xs font-bold font-mono">
              <Shield className="w-3.5 h-3.5 text-[#EB6A1D]" />
              <span>Console Root Master</span>
            </div>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              Création d&apos;établissements, quotas d&apos;élèves et gestion globale des sous-domaines.
            </p>
            <button
              onClick={() => {
                setActiveTab("superadmin");
                if (isMobile && onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#EB6A1D] hover:bg-[#D95511] text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/20 transition-all"
            >
              <span>Ouvrir Console Master &rarr;</span>
            </button>
          </div>
        )}

        {/* Quick status card */}
        <div className="p-3.5 rounded-xl bg-[#E8F5F2] border border-[#00A896]/30">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00A896] animate-pulse" />
            <span className="text-[11px] font-bold text-[#0D5B4D]">Plateforme en Ligne</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Année Académique 2026-2027 • Multi-Campus
          </p>
        </div>
      </div>

      {/* Footer support & Logout */}
      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        {onLogout && (
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm group"
          >
            <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Se Déconnecter</span>
          </button>
        )}
        <p className="text-[10px] text-slate-400 text-center">
          AlFasle • Tous droits réservés
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)] shadow-sm">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden animate-fadeIn">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <aside className="absolute top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 p-4 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Sleek Logout Confirmation Dialog */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          if (onLogout) onLogout();
        }}
        title="Déconnexion de session"
        message="Voulez-vous vraiment vous déconnecter de votre compte AlFasle ?"
        confirmLabel="Se Déconnecter"
        cancelLabel="Rester Connecté"
        variant="logout"
      />
    </>
  );
}
