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
    const adminUser = users.find((u) => u.role === "ADMIN") || users[0];
    setCurrentUser(adminUser);
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
