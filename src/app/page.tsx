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
  const [showLandingView, setShowLandingView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const isSessionActive = localStorage.getItem("alfasle_session_active");
      if (isSessionActive === "true") {
        return false;
      }
    }
    return true;
  });
  const [showSuperAdminView, setShowSuperAdminView] = useState<boolean>(false);
  const [selectedSubdomainSchool, setSelectedSubdomainSchool] = useState<Etablissement | null>(null);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);

  const handleLoginSuccess = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("alfasle_session_active", "true");
    }
    setShowLandingView(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("alfasle_session_active");
    }
    setShowLandingView(true);
  };

  // If a school's dedicated subdomain portal is selected
  if (selectedSubdomainSchool) {
    return (
      <>
        <SchoolSubdomainPortal
          etablissement={selectedSubdomainSchool}
          onLoginSuccess={() => {
            setSelectedSubdomainSchool(null);
            handleLoginSuccess();
          }}
          onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
          onBackToGlobal={() => setSelectedSubdomainSchool(null)}
        />
        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccessNavigateToCourses={() => {
            setSelectedSubdomainSchool(null);
            handleLoginSuccess();
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
          handleLoginSuccess();
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
          onLoginSuccess={handleLoginSuccess}
          onOpenJoinClassModal={() => setIsJoinClassOpen(true)}
          onOpenSuperAdmin={() => setShowSuperAdminView(true)}
          onSelectSubdomainSchool={(etab) => setSelectedSubdomainSchool(etab)}
        />

        <JoinClassModal
          isOpen={isJoinClassOpen}
          onClose={() => setIsJoinClassOpen(false)}
          onSuccessNavigateToCourses={handleLoginSuccess}
        />
      </>
    );
  }

  return <MainAppLayout onLogout={handleLogout} />;
}
