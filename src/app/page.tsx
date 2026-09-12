"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { MainAppLayout } from "@/components/layout/MainAppLayout";
import { AuthLandingView } from "@/components/auth/AuthLandingView";
import { SuperAdminLoginView } from "@/components/auth/SuperAdminLoginView";
import { SchoolSubdomainPortal } from "@/components/auth/SchoolSubdomainPortal";
import { JoinClassModal } from "@/components/classes/JoinClassModal";
import { Soumission, Devoir, Etablissement } from "@/types";

export default function Home() {
  const [showLandingView, setShowLandingView] = useState<boolean>(true);
  const [showSuperAdminView, setShowSuperAdminView] = useState<boolean>(false);
  const [selectedSubdomainSchool, setSelectedSubdomainSchool] = useState<Etablissement | null>(null);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);

  // If a school's dedicated subdomain portal is selected
  if (selectedSubdomainSchool) {
    return (
      <>
        <SchoolSubdomainPortal
          etablissement={selectedSubdomainSchool}
          onLoginSuccess={() => {
            setSelectedSubdomainSchool(null);
            setShowLandingView(false);
          }}
          onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
          onBackToGlobal={() => setSelectedSubdomainSchool(null)}
        />
        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccessNavigateToCourses={() => {
            setSelectedSubdomainSchool(null);
            setShowLandingView(false);
          }}
        />
      </>
    );
  }

  // If Super Admin view is requested
  if (showSuperAdminView) {
    return (
      <SuperAdminLoginView
        onLoginSuccess={() => {
          setShowSuperAdminView(false);
          setShowLandingView(false);
        }}
        onBackToStandard={() => {
          setShowSuperAdminView(false);
          setShowLandingView(true);
        }}
      />
    );
  }

  // If landing / auth view is active
  if (showLandingView) {
    return (
      <>
        <AuthLandingView
          onLoginSuccess={() => setShowLandingView(false)}
          onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
          onOpenSuperAdmin={() => setShowSuperAdminView(true)}
          onSelectSubdomainSchool={(etab) => setSelectedSubdomainSchool(etab)}
        />

        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccessNavigateToCourses={() => {
            setShowLandingView(false);
          }}
        />
      </>
    );
  }

  return <MainAppLayout onLogout={() => setShowLandingView(true)} />;
}
