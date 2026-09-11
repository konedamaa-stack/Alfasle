"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { SchoolSubdomainPortal } from "@/components/auth/SchoolSubdomainPortal";
import { JoinClassModal } from "@/components/classes/JoinClassModal";
import { School, ArrowLeft } from "lucide-react";

export default function SubdomainSchoolPage() {
  const params = useParams();
  const router = useRouter();
  const { etablissements } = useStore();
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);

  const subdomain = (params?.subdomain as string) || "";

  // Find establishment by subdomain or code or id
  const targetEtab = etablissements.find(
    (e) =>
      e.subdomain?.toLowerCase() === subdomain.toLowerCase() ||
      e.id.toLowerCase() === subdomain.toLowerCase() ||
      e.code.toLowerCase() === subdomain.toLowerCase()
  );

  if (!targetEtab) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <School className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white">Établissement non trouvé</h1>
        <p className="text-xs text-slate-400 max-w-md">
          Le sous-domaine « <strong className="text-rose-400 font-mono">{subdomain}.alfasle.edu</strong> » n&apos;est pas attribué ou a été suspendu par le Super Administrateur.
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au portail global AlFasle</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <SchoolSubdomainPortal
        etablissement={targetEtab}
        onLoginSuccess={() => router.push("/")}
        onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
        onBackToGlobal={() => router.push("/")}
      />

      <JoinClassModal
        isOpen={isJoinClassOpen}
        onClose={() => setIsJoinClassOpen(false)}
        onSuccessNavigateToCourses={() => router.push("/")}
      />
    </>
  );
}
