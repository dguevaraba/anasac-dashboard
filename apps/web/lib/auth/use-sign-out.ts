"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";

export function useSignOut() {
  const { logout } = useAuth();
  const { basePath } = useAppConfig();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = useCallback(async () => {
    if (pending) return;
    setPending(true);
    try {
      await logout();
      router.replace(appHref(basePath, "/login"));
    } finally {
      setPending(false);
    }
  }, [pending, logout, router, basePath]);

  return { signOut, pending };
}
