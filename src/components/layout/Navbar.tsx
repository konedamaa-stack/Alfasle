"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { UserRole } from "@/types";
import {
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
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ChangePasswordModal } from "@/components/common/ChangePasswordModal";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface NavbarProps {
  onLogoutToLanding?: () => void;
  onOpenSuperAdmin?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Navbar({
  onLogoutToLanding,
  onOpenSuperAdmin,
  onToggleMobileMenu,
  isMobileMenuOpen,
}: NavbarProps) {
  const {
    currentUser,
    users,
    setCurrentUser,
    switchRole,
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
  } = useStore();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isChangePassOpen, setIsChangePassOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const unreadNotifs = notifications.filter((n) => !n.isRead && n.userId === currentUser.id);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return {
          label: "Super Admin (Root)",
          icon: <Shield className="w-3.5 h-3.5 text-amber-400" />,
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm",
        };
      case "TEACHER":
        return {
          label: "Enseignant",
          icon: <BookOpen className="w-3.5 h-3.5" />,
          color: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        };
      case "STUDENT":
        return {
          label: "Élève",
          icon: <GraduationCap className="w-3.5 h-3.5" />,
          color: "bg-sky-500/20 text-sky-300 border-sky-500/30",
        };
      case "PARENT":
        return {
          label: "Parent",
          icon: <User className="w-3.5 h-3.5" />,
          color: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        };
      case "ADMIN":
        return {
          label: "Directeur",
          icon: <Shield className="w-3.5 h-3.5" />,
          color: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between shadow-sm">
      {/* Brand Logo & Mobile Drawer Toggle */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
            aria-label="Menu Mobile"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-[#0D5B4D]" />
            ) : (
              <Menu className="w-5 h-5 text-[#0D5B4D]" />
            )}
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#0D5B4D] via-[#0D5B4D] to-[#00A896] flex items-center justify-center shadow-md shadow-[#0D5B4D]/20 shrink-0">
          <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#0D5B4D]">
              ALFASLE
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F5F2] text-[#0D5B4D] border border-[#00A896]/30 uppercase tracking-wider">
              LMS Pro
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">
            Plateforme de Gestion de Classes & Cours
          </p>
        </div>
      </div>

      {/* Center Search bar */}
      <div className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Rechercher un cours, une classe, un devoir..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00A896] focus:ring-1 focus:ring-[#00A896] transition-all"
        />
      </div>

      {/* Right Controls: Role Switcher & Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Direct Super Admin button for Super Admins only */}
        {currentUser.role === "SUPER_ADMIN" && onOpenSuperAdmin && (
          <button
            onClick={onOpenSuperAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EB6A1D] hover:bg-[#D95511] text-white border border-[#EB6A1D] text-xs font-bold font-mono transition-all transform hover:-translate-y-0.5 shadow-sm shadow-orange-500/20"
          >
            <Shield className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Console Super Admin</span>
            <span className="sm:hidden">Super Admin</span>
          </button>
        )}

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-[#00A896] text-xs font-semibold text-slate-800 transition-all shadow-sm"
          >
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badge.color}`}
            >
              {badge.icon}
              {badge.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Changer de vue (Mode Démo)
                </p>
              </div>
              <div className="space-y-1">
                {users.map((u) => {
                  const uBadge = getRoleBadge(u.role);
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        setCurrentUser(u);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
                          alt={u.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-semibold text-slate-200 leading-tight">{u.name}</p>
                          <span className="text-[10px] text-slate-400">{uBadge.label}</span>
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg bg-white border border-slate-200 hover:border-[#00A896] text-slate-700 hover:text-[#0D5B4D] transition-colors shadow-sm"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EB6A1D] text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-[#EB6A1D] text-[10px] font-bold">
                      {unreadNotifs.length} nouvelle{unreadNotifs.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-[#00A896] hover:text-[#0D5B4D] font-semibold"
                >
                  Tout marquer lu
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400">
                    Aucune notification pour le moment.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`p-2.5 rounded-lg text-xs cursor-pointer transition-all ${
                        !n.isRead
                          ? "bg-[#E8F5F2] border-l-2 border-[#00A896] text-slate-800"
                          : "bg-slate-50 text-slate-500"
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
          )}
        </div>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt={currentUser.name}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</p>
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{currentUser.email}</p>
          </div>

          {/* Change Password Button */}
          <button
            onClick={() => setIsChangePassOpen(true)}
            title="Modifier mon mot de passe"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1 text-xs"
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden xl:inline text-[11px]">Mot de passe</span>
          </button>

          {onLogoutToLanding && (
            <button
              onClick={() => setIsLogoutConfirmOpen(true)}
              title="Se déconnecter de la session"
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 hover:text-rose-200 border border-rose-500/30 transition-all flex items-center gap-1.5 text-xs font-bold shadow-md shadow-rose-500/10 transform hover:-translate-y-0.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
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
