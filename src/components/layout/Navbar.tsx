"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { UserRole } from "@/types";
import {
  School,
  Bell,
  GraduationCap,
  Sparkles,
  ChevronDown,
  User,
  Shield,
  BookOpen,
  Check,
  Search,
  KeyRound,
  LogOut,
  Menu,
  X,
  FileCheck2,
  UserCheck,
  ArrowRight,
  Award,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ChangePasswordModal } from "@/components/common/ChangePasswordModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { NavTab } from "./Sidebar";

interface NavbarProps {
  onLogoutToLanding?: () => void;
  onOpenSuperAdmin?: () => void;
  onOpenEtablissements?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  onNavigate?: (tab: NavTab) => void;
  onOpenGrading?: (submissionId: string) => void;
}

export function Navbar({
  onLogoutToLanding,
  onOpenSuperAdmin,
  onOpenEtablissements,
  onToggleMobileMenu,
  isMobileMenuOpen,
  onNavigate,
  onOpenGrading,
}: NavbarProps) {
  const {
    currentUser,
    users,
    setCurrentUser,
    switchRole,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    submissions,
    inscriptions,
    classes,
  } = useStore();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const isEducator =
    currentUser.role === "ADMIN" ||
    currentUser.role === "TEACHER" ||
    currentUser.role === "SUPER_ADMIN";

  // Classes de l'établissement
  const userSchoolClasses = currentUser.role === "SUPER_ADMIN"
    ? classes
    : classes.filter(
        (c) =>
          c.etablissementId === currentUser.etablissementId ||
          (currentUser.etablissementName && c.etablissementName === currentUser.etablissementName)
      );
  const schoolClassIds = new Set(userSchoolClasses.map((c) => c.id));

  // Devoirs en attente de correction pour l'éducateur
  const pendingSubmissions = isEducator
    ? submissions.filter(
        (s) =>
          s.status === "SUBMITTED" &&
          (currentUser.role === "SUPER_ADMIN" ||
            !s.classeId ||
            schoolClassIds.size === 0 ||
            schoolClassIds.has(s.classeId))
      )
    : [];

  // Demandes d'inscription en attente
  const pendingInscriptions = isEducator
    ? inscriptions.filter(
        (i) =>
          i.status === "PENDING" &&
          (currentUser.role === "SUPER_ADMIN" ||
            !currentUser.etablissementId ||
            i.etablissementId === currentUser.etablissementId ||
            (currentUser.etablissementName && i.etablissementName === currentUser.etablissementName) ||
            schoolClassIds.has(i.classeId))
      )
    : [];

  // Notifications de l'utilisateur
  const myNotifications = notifications.filter(
    (n) =>
      n.userId === currentUser.id ||
      (isEducator &&
        (n.userId === "u_super_admin_root" ||
          n.userId === "u_dir_cherif" ||
          n.type === "INSCRIPTION" ||
          n.type === "ASSIGNMENT"))
  );
  const unreadNotifsCount = myNotifications.filter((n) => !n.isRead).length;

  // Total alertes en attente (badge cloche)
  const totalAlertsCount = unreadNotifsCount + pendingSubmissions.length + pendingInscriptions.length;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin",
          icon: <Shield className="w-3.5 h-3.5 text-amber-600" />,
          color: "bg-amber-50 text-amber-800 border-amber-200 shadow-sm",
        };
      case "TEACHER":
        return {
          label: "Enseignant",
          icon: <BookOpen className="w-3.5 h-3.5 text-blue-600" />,
          color: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "STUDENT":
        return {
          label: "Élève",
          icon: <GraduationCap className="w-3.5 h-3.5 text-sky-600" />,
          color: "bg-sky-50 text-sky-700 border-sky-200",
        };
      case "PARENT":
        return {
          label: "Parent",
          icon: <User className="w-3.5 h-3.5 text-purple-600" />,
          color: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "DIRECTEUR":
      case "ADMIN":
      default:
        return {
          label: "Directeur",
          icon: <Shield className="w-3.5 h-3.5 text-rose-600" />,
          color: "bg-rose-50 text-rose-700 border-rose-200",
        };
    }
  };

  const badge = getRoleBadge(currentUser?.role) || {
    label: "Directeur",
    icon: <Shield className="w-3.5 h-3.5 text-rose-600" />,
    color: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Mobile Drawer Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors cursor-pointer"
            aria-label="Menu Mobile"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-indigo-600" />
            ) : (
              <Menu className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 truncate max-w-[200px] sm:max-w-xs">
              {currentUser.role === "SUPER_ADMIN" ? "ALFASLE" : (currentUser.etablissementName || "ALFASLE")}
            </span>
            <span className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200 uppercase tracking-wider">
              {currentUser.role === "SUPER_ADMIN" ? "Super Admin" : "Campus"}
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
            {currentUser.role === "SUPER_ADMIN"
              ? "Console d'Administration Globale Multi-Campus"
              : `Espace Dédié • ${currentUser.etablissementName || "Établissement"}`}
          </p>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Rechercher un cours, une classe, un devoir..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {/* Right Controls: Role Switcher & Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Light / Dark Mode Switcher */}
        <ThemeToggle />

        {/* Direct Super Admin button for Super Admins only */}
        {currentUser.role === "SUPER_ADMIN" && onOpenSuperAdmin && (
          <button
            onClick={onOpenSuperAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold font-mono transition-all transform hover:-translate-y-0.5 shadow-sm cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Console Super Admin</span>
            <span className="sm:hidden">Super Admin</span>
          </button>
        )}

        {/* Shortcut to Établissements Scolaires (Strictly Super Admin) */}
        {onOpenEtablissements && currentUser.role === "SUPER_ADMIN" && (
          <button
            onClick={onOpenEtablissements}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Gérer ou créer les établissements scolaires"
          >
            <School className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Établissements Scolaires</span>
            <span className="sm:hidden">Écoles</span>
          </button>
        )}

        {/* Active Role Badge */}
        <div className="hidden sm:flex items-center">
          <span
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${badge.color}`}
          >
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Alertes & Notifications"
          >
            <Bell className="w-4 h-4" />
            {totalAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white animate-pulse">
                {totalAlertsCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 md:w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 sm:p-4 z-50 animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Alertes & Notifications</span>
                  {totalAlertsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold animate-pulse">
                      {totalAlertsCount} action{totalAlertsCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                {myNotifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 cursor-pointer font-medium"
                  >
                    Tout marquer lu
                  </button>
                )}
              </div>

              <div className="max-h-[75vh] overflow-y-auto space-y-3 pr-1">
                {/* 1. SECTION DEVOIRS À CORRIGER */}
                {pendingSubmissions.length > 0 && (
                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <FileCheck2 className="w-4 h-4 text-purple-600" />
                        Devoirs à corriger ({pendingSubmissions.length})
                      </span>
                      <button
                        onClick={() => {
                          setShowNotifs(false);
                          onNavigate?.("assignments");
                        }}
                        className="text-[10px] text-purple-700 hover:underline font-bold"
                      >
                        Voir tout ➔
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {pendingSubmissions.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => {
                            setShowNotifs(false);
                            onNavigate?.("assignments");
                            if (onOpenGrading) {
                              setTimeout(() => onOpenGrading(sub.id), 120);
                            }
                          }}
                          className="p-2.5 rounded-lg bg-white border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-purple-700 transition-colors">
                              🎓 {sub.studentName}
                            </p>
                            <p className="text-[11px] text-purple-700 font-medium truncate">
                              Devoir : {sub.devoirTitle || "Devoir"} {sub.attachmentName ? `📎 ${sub.attachmentName}` : ""}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {sub.classeTitle} • {formatDateTime(sub.submittedAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold shrink-0 transition-colors shadow-xs"
                          >
                            Corriger ➔
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SECTION PRÉINSCRIPTIONS EN ATTENTE */}
                {pendingInscriptions.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-amber-600" />
                        Inscriptions en attente ({pendingInscriptions.length})
                      </span>
                      <button
                        onClick={() => {
                          setShowNotifs(false);
                          onNavigate?.("inscriptions");
                        }}
                        className="text-[10px] text-amber-700 hover:underline font-bold"
                      >
                        Gérer ➔
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {pendingInscriptions.map((ins) => (
                        <div
                          key={ins.id}
                          onClick={() => {
                            setShowNotifs(false);
                            onNavigate?.("inscriptions");
                          }}
                          className="p-2.5 rounded-lg bg-white border border-amber-100 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-2 group"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-800 transition-colors">
                              👤 {ins.userName}
                            </p>
                            <p className="text-[11px] text-amber-700 font-medium truncate">
                              Classe : {ins.classeTitle}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {ins.etablissementName} • {formatDateTime(ins.appliedAt)}
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shrink-0 transition-colors shadow-xs"
                          >
                            Valider ➔
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. HISTORIQUE DES NOTIFICATIONS */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                    Historique des messages
                  </span>
                  {myNotifications.length === 0 && pendingSubmissions.length === 0 && pendingInscriptions.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">
                      Aucune notification pour le moment.
                    </p>
                  ) : myNotifications.length === 0 ? (
                    <p className="text-center py-3 text-xs text-slate-400">
                      Aucun autre message.
                    </p>
                  ) : (
                    myNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setShowNotifs(false);
                          if (
                            n.type === "ASSIGNMENT" ||
                            n.title.toLowerCase().includes("devoir") ||
                            n.title.toLowerCase().includes("copie")
                          ) {
                            onNavigate?.("assignments");
                          } else if (
                            n.type === "INSCRIPTION" ||
                            n.title.toLowerCase().includes("inscription")
                          ) {
                            onNavigate?.("inscriptions");
                          } else if (
                            n.type === "GRADE" ||
                            n.title.toLowerCase().includes("note")
                          ) {
                            onNavigate?.("grades");
                          } else if (
                            n.type === "COURSE" ||
                            n.title.toLowerCase().includes("cours")
                          ) {
                            onNavigate?.("courses");
                          }
                        }}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all border ${
                          !n.isRead
                            ? "bg-indigo-50/70 border-indigo-200 text-slate-800"
                            : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-slate-800 text-xs">{n.title}</p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap">
                            {formatDateTime(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] mt-1 text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{currentUser.email}</p>
          </div>

          {/* Change Password Button */}
          <button
            onClick={() => setIsChangePassOpen(true)}
            title="Modifier mon mot de passe"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1 text-xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden xl:inline text-[11px]">Mot de passe</span>
          </button>

          {onLogoutToLanding && (
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              title="Se déconnecter de la session"
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm transform hover:-translate-y-0.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={() => {
          if (onLogoutToLanding) onLogoutToLanding();
        }}
        title="Déconnexion de votre Session"
        message="Voulez-vous vraiment vous déconnecter de votre compte AlFasle ?"
        confirmLabel="Se Déconnecter"
        cancelLabel="Rester Connecté"
        variant="logout"
      />
    </header>
  );
}
