"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AuthMode = "mock" | "live";

interface AppConfig {
  basePath: string;
  authMode: AuthMode;
  demo: boolean;
}

const AppConfigContext = createContext<AppConfig>({
  basePath: "",
  authMode: "live",
  demo: false,
});

export function AppConfigProvider({
  basePath,
  authMode,
  children,
}: {
  basePath: string;
  authMode: AuthMode;
  children: ReactNode;
}) {
  return (
    <AppConfigContext.Provider
      value={{ basePath, authMode, demo: authMode === "mock" }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}

export function appHref(basePath: string, path: string) {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  if (!basePath) return suffix;
  return `${basePath}${suffix}`;
}
