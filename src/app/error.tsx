"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Trash2, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("AlFasle Runtime Exception:", error);
  }, [error]);

  const handleClearCacheAndReload = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (_) {}
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            STABILISATION AUTOMATIQUE
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Une mise à jour a été appliquée
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Pour synchroniser la nouvelle version de l&apos;application et vos campus scolaires, veuillez rafraîchir la page.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Rafraîchir et charger l&apos;application</span>
          </button>

          <button
            onClick={handleClearCacheAndReload}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Réinitialiser la session locale & Recharger</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-400 font-mono">
          Code erreur : {error?.digest || "CLIENT_EXCEPTION_HANDLED"}
        </p>
      </div>
    </div>
  );
}
