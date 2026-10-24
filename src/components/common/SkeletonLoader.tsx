"use client";

import React from "react";

export function SkeletonLoader({
  className = "",
  rows = 3,
  type = "table",
}: {
  className?: string;
  rows?: number;
  type?: "table" | "card" | "stats" | "text";
}) {
  if (type === "stats") {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl border border-slate-200 bg-white/60 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
              <div className="h-4 w-4 bg-slate-200 rounded-full" />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="h-7 w-12 bg-slate-300 rounded-md" />
              <div className="h-3 w-16 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "card") {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="p-5 rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-slate-200 rounded-lg" />
              <div className="h-4 w-16 bg-slate-200 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-3/4 bg-slate-300 rounded-md" />
              <div className="h-3 w-full bg-slate-100 rounded-md" />
              <div className="h-3 w-2/3 bg-slate-100 rounded-md" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded-md" />
              <div className="h-3 w-16 bg-slate-200 rounded-md" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-8 flex-1 bg-slate-200 rounded-xl" />
              <div className="h-8 flex-1 bg-slate-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div className={`space-y-2.5 animate-pulse ${className}`}>
        {Array.from({ length: rows }).map((_, idx) => (
          <div
            key={idx}
            className="h-3 bg-slate-200 rounded-md"
            style={{ width: `${Math.max(45, 100 - idx * 15)}%` }}
          />
        ))}
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className={`w-full rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm animate-pulse ${className}`}>
      <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-4">
        <div className="h-3 w-28 bg-slate-300 rounded-md" />
        <div className="h-3 w-20 bg-slate-200 rounded-md hidden sm:block" />
        <div className="h-3 w-32 bg-slate-200 rounded-md hidden md:block" />
        <div className="h-3 w-24 bg-slate-200 rounded-md ml-auto" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, idx) => (
          <div key={idx} className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 shrink-0" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-36 bg-slate-300 rounded-md" />
                <div className="h-2.5 w-24 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded-full hidden sm:block" />
            <div className="h-3 w-28 bg-slate-200 rounded-md hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-16 bg-slate-200 rounded-xl" />
              <div className="h-8 w-8 bg-slate-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
