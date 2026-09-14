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
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { ChangePasswordModal } from "@/components/common/ChangePasswordModal";

interface NavbarProps {
  onLogoutToLanding?: () => void;
  onOpenSuperAdmin?: () => void;
}

export function Navbar({ onLogoutToLanding, onOpenSuperAdmin }: NavbarProps) {
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
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200">
              ALFASLE
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
              LMS Pro
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
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
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/60 border border-slate-700/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Right Controls: Role Switcher & Notifications & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Light / Dark Mode Switcher */}
        <ThemeToggle />

        {/* Direct Super Admin button for Admins */}
        {(currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && onOpenSuperAdmin && (
          <button
            onClick={onOpenSuperAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition-all transform hover:-translate-y-0.5 shadow-sm"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Console Super Admin</span>
            <span className="sm:hidden">Super Admin</span>
          </button>
        )}

        {/* Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all shadow-sm"
          >
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${badge.color}`}
            >
              {badge.icon}
              {badge.label}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl shadow-2xl border border-slate-700 p-2 z-50">
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
            className="relative p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl border border-slate-700 p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-medium">
                      {unreadNotifs.length} nouvelle{unreadNotifs.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={clearAllNotifications}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300"
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
                          ? "bg-slate-800/90 border-l-2 border-indigo-500 text-slate-200"
                          : "bg-slate-900/40 text-slate-400"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-200 text-xs">{n.title}</p>
                        <span className="text-[10px] text-slate-500 whitespace-nowrap">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] mt-1 text-slate-300 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar & Info */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
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
              onClick={onLogoutToLanding}
              title="Page d'accueil / Changer de compte"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <span>🚪</span>
              <span className="hidden sm:inline">Accueil / Connexion</span>
            </button>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePassOpen}
        onClose={() => setIsChangePassOpen(false)}
      />
    </header>
  );
}
