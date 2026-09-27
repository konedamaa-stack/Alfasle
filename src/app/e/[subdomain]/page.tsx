"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { SchoolSubdomainPortal } from "@/components/auth/SchoolSubdomainPortal";
import { JoinClassModal } from "@/components/classes/JoinClassModal";
import { School, ArrowLeft, Loader2 } from "lucide-react";
import { MainAppLayout } from "@/components/layout/MainAppLayout";
import { supabase, isSupabaseConfigured, mapRowToEtablissement } from "@/lib/supabase";
import { Etablissement } from "@/types";

export default function SubdomainSchoolPage() {
  const params = useParams();
  const router = useRouter();
  const { etablissements } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("alfasle_session_active") === "true";
    }
    return false;
  });
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);
  const [cloudEtab, setCloudEtab] = useState<Etablissement | null>(null);
  const [isCheckingCloud, setIsCheckingCloud] = useState(true);

  const subdomain = (params?.subdomain as string) || "";

  // 1. Check in local store
  const localEtab = etablissements.find(
    (e) =>
      e.subdomain?.toLowerCase() === subdomain.toLowerCase() ||
      e.id.toLowerCase() === subdomain.toLowerCase() ||
      e.code.toLowerCase() === subdomain.toLowerCase()
  );

  // 2. If not found in local store, fetch directly from Supabase by subdomain
  useEffect(() => {
    if (localEtab) {
      setIsCheckingCloud(false);
      return;
    }

    async function fetchFromSupabase() {
      if (!isSupabaseConfigured() || !subdomain) {
        setIsCheckingCloud(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("etablissements")
          .select("*")
          .or(`subdomain.ilike.${subdomain},id.ilike.${subdomain},code.ilike.${subdomain}`)
          .maybeSingle();

        if (data && !error) {
          setCloudEtab(mapRowToEtablissement(data));
        }
      } catch (err) {
        console.warn("Error looking up school by subdomain:", err);
      } finally {
        setIsCheckingCloud(false);
      }
    }

    fetchFromSupabase();
  }, [subdomain, localEtab]);

  const targetEtab = localEtab || cloudEtab;

  // If establishment does NOT exist, show a clean 404 error page
  if (!targetEtab) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-rose-500/30 text-center space-y-6 relative z-10 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <School className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
              CAMPUS INTROUVABLE
            </span>
            <h1 className="text-xl font-bold text-white">Établissement Non Enregistré</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Le sous-domaine <strong className="text-rose-300 font-mono">.{subdomain}.alfasle.xyz</strong> n&apos;est associé à aucun établissement actif du réseau AlFasle.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <a
              href="https://alfasle.xyz"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au Portail Principal</span>
            </a>

            <a
              href="/super-admin"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Espace Super Admin (Déployer ce campus)</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <MainAppLayout onLogout={handleLogout} />;
  }

  return (
    <>
      <SchoolSubdomainPortal
        etablissement={targetEtab}
        onLoginSuccess={handleLoginSuccess}
        onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
        onBackToGlobal={() => router.push("/")}
      />

      <JoinClassModal
        isOpen={isJoinClassOpen}
        onClose={() => setIsJoinClassOpen(false)}
        onSuccessNavigateToCourses={handleLoginSuccess}
      />
    </>
  );
}
