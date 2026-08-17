"use client";

import type { ReactNode } from "react";
import { AppConfigProvider, type AuthMode } from "@/lib/app-config";
import { MockAuthProvider } from "@/lib/auth/auth-context";
import { LiveAuthProvider } from "@/lib/auth/live-auth-context";

export function AppProviders({
  basePath,
  authMode,
  children,
}: {
  basePath: string;
  authMode: AuthMode;
  children: ReactNode;
}) {
  const auth =
    authMode === "mock" ? (
      <MockAuthProvider>{children}</MockAuthProvider>
    ) : (
      <LiveAuthProvider>{children}</LiveAuthProvider>
    );

  return (
    <AppConfigProvider basePath={basePath} authMode={authMode}>
      {auth}
    </AppConfigProvider>
  );
}
