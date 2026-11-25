"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Etablissement } from "@/types";
import {
  Globe2,
  ArrowRight,
  School,
  Search,
  Shield,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Building2,
} from "lucide-react";

interface DomainGatewayViewProps {
  onSelectSubdomainSchool?: (etab: Etablissement) => void;
  onOpenSuperAdmin?: () => void;
  onOpenStandardLogin?: () => void;
}

export function DomainGatewayView({
  onSelectSubdomainSchool,
  onOpenSuperAdmin,
  onOpenStandardLogin,
}: DomainGatewayViewProps) {
  const router = useRouter();
  const { etablissements } = useStore();

  const [inputDomain, setInputDomain] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Clean the user input to extract domain or subdomain
  const cleanInput = useMemo(() => {
    return inputDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "")
      .replace(/\.solutionecoles\.com$/, "")
      .replace(/\.alfasle\.xyz$/, "");
  }, [inputDomain]);

  // Real-time suggestions filtering
  const matchingSchools = useMemo(() => {
    if (!cleanInput) return [];
    return etablissements.filter((e) => {
      const matchSub = e.subdomain?.toLowerCase().includes(cleanInput);
      const matchCustom = e.customDomain?.toLowerCase().includes(cleanInput);
      const matchCode = e.code?.toLowerCase().includes(cleanInput);
      const matchName = e.name?.toLowerCase().includes(cleanInput);
      const matchCity = e.city?.toLowerCase().includes(cleanInput);
      return matchSub || matchCustom || matchCode || matchName || matchCity;
    });
  }, [cleanInput, etablissements]);

  const handleNavigateToSchool = (targetEtab: Etablissement) => {
    setErrorMessage(null);
    if (typeof window !== "undefined") {
      const currentHost = window.location.hostname.toLowerCase();
      // If we are on solutionecoles.com or custom domain
      if (currentHost.includes("solutionecoles.com")) {
        const targetSubdomain = targetEtab.subdomain || targetEtab.code.toLowerCase();
        window.location.href = `https://${targetSubdomain}.solutionecoles.com`;
        return;
      }
    }

    if (onSelectSubdomainSchool) {
      onSelectSubdomainSchool(targetEtab);
    } else {
      router.push(`/e/${targetEtab.subdomain || targetEtab.code.toLowerCase()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cleanInput) {
      setErrorMessage("Veuillez saisir le nom de domaine ou l'identifiant de votre école.");
      return;
    }

    // 1. Direct match by exact subdomain, customDomain, or code
    const exactMatch = etablissements.find(
      (e) =>
        e.subdomain?.toLowerCase() === cleanInput ||
        e.customDomain?.toLowerCase() === cleanInput ||
        e.code?.toLowerCase() === cleanInput ||
        e.id.toLowerCase() === cleanInput
    );

    if (exactMatch) {
      handleNavigateToSchool(exactMatch);
      return;
    }

    // 2. Partial match if only 1 matching school
    if (matchingSchools.length === 1) {
      handleNavigateToSchool(matchingSchools[0]);
      return;
    }

    // 3. Fallback: navigate directly to /e/[cleanInput] or external custom domain
    if (inputDomain.includes(".") && !inputDomain.includes("solutionecoles.com")) {
      const targetUrl = inputDomain.startsWith("http") ? inputDomain : `https://${inputDomain}`;
      window.location.href = targetUrl;
      return;
    }

    setErrorMessage(
      `Aucun établissement trouvé avec le domaine « ${inputDomain} ». Vérifiez l'orthographe ou sélectionnez votre école ci-dessous.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background Cyber Mesh & Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/15 to-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/40">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-900">
                Solution Écoles
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Multi-Tenant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Portail National d&apos;Accès aux Établissements Scolaires
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenSuperAdmin && (
            <button
              type="button"
              onClick={onOpenSuperAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="Console Super Administrateur Global"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Super Admin</span>
            </button>
          )}
        </div>
      </header>

      {/* Center Gateway Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10">
        <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-slate-300/60 backdrop-blur-xl space-y-6 relative">
          {/* Header Title Inside Card */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-md shadow-indigo-500/10 mb-3">
              <Globe2 className="w-8 h-8 text-indigo-600 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Accédez à votre Établissement
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Saisissez le nom de domaine ou l&apos;identifiant de votre école pour ouvrir directement votre portail sécurisé.
            </p>
          </div>

          {/* Saisie Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-700 font-bold text-xs mb-1.5 font-mono">
                Nom de Domaine ou Sous-Domaine de l&apos;École
              </label>

              <div
                className={`relative flex items-center rounded-2xl border transition-all ${
                  isFocused
                    ? "border-indigo-600 ring-4 ring-indigo-500/10 shadow-md"
                    : "border-slate-300 bg-white"
                }`}
              >
                <div className="pl-4 pr-2 text-slate-400">
                  <Globe2 className="w-4 h-4 text-indigo-600" />
                </div>
                <input
                  type="text"
                  autoFocus
                  required
                  value={inputDomain}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                  onChange={(e) => {
                    setInputDomain(e.target.value);
                    setErrorMessage(null);
                  }}
                  placeholder="ex: cherifla1 ou cherifla1.solutionecoles.com"
                  className="flex-1 py-3.5 pr-3 text-slate-900 font-mono text-sm placeholder-slate-400 focus:outline-none bg-transparent"
                />
                <button
                  type="submit"
                  className="mr-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer shrink-0"
                >
                  <span>Accéder</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Live Autocomplete Suggestions */}
            {matchingSchools.length > 0 && isFocused && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto">
                <div className="p-2 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Établissements correspondants ({matchingSchools.length})
                </div>
                {matchingSchools.map((etab) => (
                  <button
                    key={etab.id}
                    type="button"
                    onClick={() => handleNavigateToSchool(etab)}
                    className="w-full text-left p-3 hover:bg-indigo-50/70 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={etab.logoUrl || "/icon-192.png"}
                        alt={etab.name}
                        className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs group-hover:text-indigo-600">
                          {etab.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {etab.city} • {etab.subdomain}.solutionecoles.com
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transform group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Quick Click Badges for Registered Establishments */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block font-mono text-center">
              Ou sélectionnez votre établissement en 1 clic :
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {etablissements.slice(0, 6).map((etab) => (
                <button
                  key={etab.id}
                  type="button"
                  onClick={() => handleNavigateToSchool(etab)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-all cursor-pointer shadow-2xs group"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
                  <span>{etab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Switch to Standard Login */}
          {onOpenStandardLogin && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={onOpenStandardLogin}
                className="text-xs text-slate-400 hover:text-slate-700 underline font-medium"
              >
                Accéder à la vue de connexion globale (démo & rôles)
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-400 border-t border-slate-200 z-10 font-mono">
        Solution Écoles • Architecture Multi-Tenant & Domaines Dédiés v3.5
      </footer>
    </div>
  );
}
