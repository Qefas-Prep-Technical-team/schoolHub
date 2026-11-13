"use client";

import React from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useActualLogoutMutation } from "@/app/(auth)/login/services/use-auth-mutations";
import { LogoutModal } from "./LogoutModal";

export function GlobalLogoutModal() {
  const user = useAuthStore((state) => state.user);
  const isLogoutModalOpen = useAuthStore((state) => state.isLogoutModalOpen);
  const setLogoutModalOpen = useAuthStore((state) => state.setLogoutModalOpen);
  const { mutateAsync: logout } = useActualLogoutMutation();

  const handleConfirm = async () => {
    try {
      await logout();
      setLogoutModalOpen(false);
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <LogoutModal
      isOpen={isLogoutModalOpen}
      user={user}
      onClose={() => setLogoutModalOpen(false)}
      onConfirm={handleConfirm}
    />
  );
}
