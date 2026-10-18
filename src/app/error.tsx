"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, Trash2, Home, CheckCircle2 } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    console.error("AlFasle Error Boundary caught error:", error);
  }, [error]);

  const handleCleanAndReload = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (_) {}
      setCleared(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full bg-slate-900/95 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl relative z-10 text-center space-y-6 backdrop-blur-xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            RÉCUPÉRATION SYSTÈME
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Une mise à jour a été appliquée
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            Votre navigateur a besoin de synchroniser les nouveaux campus et paramètres multi-établissements. Cliquez ci-dessous pour réinitialiser la session en toute sécurité.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleCleanAndReload}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-rose-600/30 transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            {cleared ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Rechargement en cours...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Réparer & Recharger l&apos;application</span>
              </>
            )}
          </button>

          <a
            href="/"
            onClick={handleCleanAndReload}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer block"
          >
            <Home className="w-3.5 h-3.5 inline mr-1" />
            <span>Retourner au portail d&apos;accueil</span>
          </a>
        </div>

        {error?.message && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-left text-[11px] font-mono text-rose-300/80 overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <p className="text-[10px] text-slate-500 font-mono">
          Code digest : {error?.digest || "CLIENT_READY"}
        </p>
      </div>
    </div>
  );
}
