"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SuperAdminLoginView } from "@/components/auth/SuperAdminLoginView";
import { useStore } from "@/lib/store";

export default function SuperAdminPage() {
  const router = useRouter();
  const { setCurrentUser, users } = useStore();

  const handleLoginSuccess = () => {
    // Navigate to dashboard with super admin root profile
    const superAdminUser = users.find((u) => u.role === "SUPER_ADMIN") || users.find((u) => u.role === "ADMIN") || users[0];
    if (typeof window !== "undefined") {
      localStorage.setItem("alfasle_session_active", "true");
      localStorage.setItem("alfasle_active_tab", "superadmin");
    }
    setCurrentUser(superAdminUser);
    router.push("/");
  };

  const handleBackToStandard = () => {
    router.push("/");
  };

  return (
    <SuperAdminLoginView
      onLoginSuccess={handleLoginSuccess}
      onBackToStandard={handleBackToStandard}
    />
  );
}
