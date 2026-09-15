"use client";

import React from "react";
import { X, LogOut, Trash2, AlertTriangle, RotateCcw, ShieldAlert, Check } from "lucide-react";

export type ConfirmVariant = "danger" | "warning" | "logout" | "info";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  variant = "danger",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "logout":
        return {
          icon: <LogOut className="w-6 h-6 text-rose-400" />,
          iconBg: "bg-rose-500/20 border-rose-500/30",
          border: "border-rose-500/40",
          confirmBtn:
            "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30",
        };
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-rose-400" />,
          iconBg: "bg-rose-500/20 border-rose-500/30",
          border: "border-rose-500/40",
          confirmBtn:
            "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-400" />,
          iconBg: "bg-amber-500/20 border-amber-500/30",
          border: "border-amber-500/40",
          confirmBtn:
            "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-amber-500/30 font-black",
        };
      case "info":
      default:
        return {
          icon: <RotateCcw className="w-6 h-6 text-indigo-400" />,
          iconBg: "bg-indigo-500/20 border-indigo-500/30",
          border: "border-indigo-500/40",
          confirmBtn:
            "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30",
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-md bg-[#0a0f1e] border ${vStyles.border} rounded-3xl overflow-hidden shadow-2xl animate-scaleUp flex flex-col`}
      >
        <div className="p-6 text-center space-y-4">
          <div
            className={`w-14 h-14 rounded-2xl ${vStyles.iconBg} border flex items-center justify-center mx-auto shadow-inner`}
          >
            {vStyles.icon}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-black text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all transform hover:-translate-y-0.5 ${vStyles.confirmBtn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
