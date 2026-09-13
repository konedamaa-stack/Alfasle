"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useStore();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isLight ? "Basculer vers le Mode Sombre" : "Basculer vers le Mode Claire"}
      aria-label={isLight ? "Basculer vers le Mode Sombre" : "Basculer vers le Mode Claire"}
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-sm ${
        isLight
          ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 border-amber-500/30"
          : "bg-slate-800/80 hover:bg-slate-700 text-blue-300 border-slate-700 hover:border-blue-500/40"
      } ${className}`}
    >
      {isLight ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
          <span className="hidden sm:inline font-medium">Mode Claire</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline font-medium">Mode Sombre</span>
        </>
      )}
    </button>
  );
}
