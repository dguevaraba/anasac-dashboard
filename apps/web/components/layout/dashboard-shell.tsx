"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { RolePreviewBanner } from "@/components/layout/role-preview-banner";
import { ShellSkeleton } from "@/components/layout/shell-skeleton";
import { Topbar } from "@/components/layout/topbar";
import { useAuth } from "@/lib/auth/auth-context";
import { appHref, useAppConfig } from "@/lib/app-config";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const { basePath } = useAppConfig();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(appHref(basePath, "/login"));
    }
  }, [isLoading, user, router, basePath]);

  if (isLoading || !user) {
    return <ShellSkeleton />;
  }

  return (
    <div className="flex min-h-dvh bg-[var(--anasac-mist)]">
      <div className="hidden w-72 shrink-0 lg:block" aria-hidden />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <span className="absolute -right-16 top-24 h-64 w-64 rounded-full bg-[var(--anasac-teal-soft)]/40" />
          <span className="absolute -left-20 bottom-10 h-48 w-48 rounded-full bg-[var(--anasac-aqua)]/10" />
          <span className="absolute right-1/3 top-1/2 h-20 w-20 rounded-full bg-[var(--anasac-teal-soft)]/50" />
        </div>
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <RolePreviewBanner />
        <main className="relative z-[1] flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
