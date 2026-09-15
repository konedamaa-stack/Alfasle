"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { SchoolSubdomainPortal } from "@/components/auth/SchoolSubdomainPortal";
import { JoinClassModal } from "@/components/classes/JoinClassModal";
import { School, ArrowLeft } from "lucide-react";

import { MainAppLayout } from "@/components/layout/MainAppLayout";

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

  const handleLoginSuccess = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("alfasle_session_active", "true");
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("alfasle_session_active");
      localStorage.removeItem("alfasle_active_tab");
    }
    setIsAuthenticated(false);
  };

  const subdomain = (params?.subdomain as string) || "";

  // Find establishment by subdomain or code or id
  const targetEtab = etablissements.find(
    (e) =>
      e.subdomain?.toLowerCase() === subdomain.toLowerCase() ||
      e.id.toLowerCase() === subdomain.toLowerCase() ||
      e.code.toLowerCase() === subdomain.toLowerCase() ||
      e.name.toLowerCase().includes(subdomain.toLowerCase())
  );

  // If not found in local state (e.g., cross-subdomain isolated localStorage), dynamically auto-provision
  const effectiveEtab =
    targetEtab || {
      id: `etab_${subdomain.toLowerCase()}`,
      name: `Établissement ${subdomain.toUpperCase()}`,
      code: `ALF-${subdomain.substring(0, 3).toUpperCase()}-01`,
      subdomain: subdomain.toLowerCase(),
      type: "LYCEE" as const,
      city: "Abidjan",
      country: "Côte d'Ivoire",
      address: "Campus Principal",
      phone: "+225 01 02 03 04",
      email: `contact@${subdomain}.alfasle.xyz`,
      description: `Portail académique dédié de l'établissement ${subdomain}.`,
      logoUrl: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80",
      directorName: "Dr. KONE ADAMA",
      directorEmail: "konedamaa@gmail.com",
      status: "ACTIVE" as const,
      subscriptionPlan: "ENTERPRISE" as const,
      maxStudentsQuota: 1500,
      maxClassesQuota: 50,
      classesCount: 1,
      studentsCount: 30,
      createdAt: new Date().toISOString(),
    };

  if (isAuthenticated) {
    return <MainAppLayout onLogout={handleLogout} />;
  }

  return (
    <>
      <SchoolSubdomainPortal
        etablissement={effectiveEtab}
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
