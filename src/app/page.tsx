"use client";

import { School } from "lucide-react";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { MainAppLayout } from "@/components/layout/MainAppLayout";
import { AuthLandingView } from "@/components/auth/AuthLandingView";
import { SuperAdminLoginView } from "@/components/auth/SuperAdminLoginView";
import { SchoolSubdomainPortal } from "@/components/auth/SchoolSubdomainPortal";
import { JoinClassModal } from "@/components/classes/JoinClassModal";
import { Etablissement } from "@/types";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showLandingView, setShowLandingView] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const isSessionActive =
          localStorage.getItem("alfasle_session_active") === "true" ||
          localStorage.getItem("alfasle_v100_purged_session_active") === "true";
        if (isSessionActive) return false;

        const savedUser = localStorage.getItem("alfasle_v100_purged_currentUser");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          if (parsed && parsed.id && parsed.role) return false;
        }
      } catch (_) {}
    }
    return true;
  });
  const [showSuperAdminView, setShowSuperAdminView] = useState<boolean>(false);
  const [selectedSubdomainSchool, setSelectedSubdomainSchool] = useState<Etablissement | null>(null);
  const [isJoinClassOpen, setIsJoinClassOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      try {
        const isSessionActive =
          localStorage.getItem("alfasle_session_active") === "true" ||
          localStorage.getItem("alfasle_v100_purged_session_active") === "true";
        const savedUser = localStorage.getItem("alfasle_v100_purged_currentUser");
        const hasUser = savedUser ? Boolean(JSON.parse(savedUser)?.id) : false;

        if (isSessionActive || hasUser) {
          setShowLandingView(false);
        }
      } catch (_) {}
    }
  }, []);

  const handleLoginSuccess = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("alfasle_session_active", "true");
        localStorage.setItem("alfasle_v100_purged_session_active", "true");
      } catch (_) {}
    }
    setShowLandingView(false);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("alfasle_session_active");
        localStorage.removeItem("alfasle_v100_purged_session_active");
        localStorage.removeItem("alfasle_active_tab");
        localStorage.removeItem("alfasle_v100_purged_active_tab");
      } catch (_) {}
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
