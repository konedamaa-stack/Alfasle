"use client";

import React, { useEffect, useState } from "react";
import { useToast, ToastItem } from "@/lib/toast-context";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onDismiss }: ToastProps) {
  const duration = toast.duration || 4000;
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const intervalTime = 20;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= step) {
          clearInterval(timer);
          onDismiss(toast.id);
          return 0;
        }
        return prev - step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [duration, isPaused, onDismiss, toast.id]);

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20 border-emerald-500/30",
      borderColor: "border-emerald-500/40 hover:border-emerald-500/60",
      glowColor: "shadow-emerald-500/10",
      progressBar: "bg-emerald-500",
      badgeText: "Succès",
      badgeBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    },
    error: {
      icon: AlertCircle,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/20 border-rose-500/30",
      borderColor: "border-rose-500/40 hover:border-rose-500/60",
      glowColor: "shadow-rose-500/10",
      progressBar: "bg-rose-500",
      badgeText: "Erreur",
      badgeBg: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
    },
    warning: {
      icon: AlertTriangle,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/20 border-amber-500/30",
      borderColor: "border-amber-500/40 hover:border-amber-500/60",
      glowColor: "shadow-amber-500/10",
      progressBar: "bg-amber-500",
      badgeText: "Attention",
      badgeBg: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    },
    info: {
      icon: Info,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/20 border-sky-500/30",
      borderColor: "border-sky-500/40 hover:border-sky-500/60",
      glowColor: "shadow-sky-500/10",
      progressBar: "bg-sky-500",
      badgeText: "Info",
      badgeBg: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    },
  }[toast.type];

  const Icon = config.icon;

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-full max-w-sm rounded-2xl border ${config.borderColor} ${config.glowColor} bg-slate-900/95 backdrop-blur-xl shadow-2xl p-4 overflow-hidden transition-all duration-300 transform translate-y-0 opacity-100 animate-in fade-in slide-in-from-top-4`}
      style={{
        boxShadow: "0 20px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px rgba(16, 185, 129, 0.08)",
      }}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${config.iconBg} ${config.iconColor}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-sm font-semibold text-white tracking-tight">{toast.title}</h4>
            <span
              className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${config.badgeBg}`}
            >
              {config.badgeText}
            </span>
          </div>
          {toast.message && (
            <p className="text-xs text-slate-300 leading-relaxed break-words">{toast.message}</p>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Fermer la notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full ${config.progressBar} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-[calc(100vw-2.5rem)]"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <SingleToast toast={toast} onDismiss={removeToast} />
        </div>
      ))}
    </div>
  );
}
