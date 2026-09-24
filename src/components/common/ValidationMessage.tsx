"use client";

import React from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export interface ValidationMessageProps {
  type?: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function ValidationMessage({
  type = "success",
  title,
  message,
  onClose,
  className = "",
}: ValidationMessageProps) {
  if (!message) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      container: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
      iconColor: "text-emerald-400",
      titleColor: "text-emerald-300",
      bodyColor: "text-emerald-200/90",
      badgeText: "Succès",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    error: {
      icon: AlertCircle,
      container: "bg-rose-500/10 border-rose-500/30 text-rose-300",
      iconColor: "text-rose-400",
      titleColor: "text-rose-300",
      bodyColor: "text-rose-200/90",
      badgeText: "Erreur",
      badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    },
    warning: {
      icon: AlertTriangle,
      container: "bg-amber-500/10 border-amber-500/30 text-amber-300",
      iconColor: "text-amber-400",
      titleColor: "text-amber-300",
      bodyColor: "text-amber-200/90",
      badgeText: "Attention",
      badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    info: {
      icon: Info,
      container: "bg-sky-500/10 border-sky-500/30 text-sky-300",
      iconColor: "text-sky-400",
      titleColor: "text-sky-300",
      bodyColor: "text-sky-200/90",
      badgeText: "Info",
      badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/30",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`rounded-2xl border p-4 flex items-start gap-3.5 backdrop-blur-md transition-all duration-200 shadow-lg animate-in fade-in slide-in-from-top-2 ${config.container} ${className}`}
    >
      <div className="shrink-0 pt-0.5">
        <Icon className={`w-5 h-5 ${config.iconColor}`} />
      </div>

      <div className="flex-1 min-w-0 text-sm">
        {title && (
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-bold ${config.titleColor}`}>{title}</span>
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full border ${config.badgeClass}`}
            >
              {config.badgeText}
            </span>
          </div>
        )}
        <p className={`${config.bodyColor} text-xs sm:text-sm leading-relaxed`}>{message}</p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors"
          aria-label="Fermer le message"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
