"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import {
  CalendarDays,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Settings,
  Trophy,
  Users,
  UserRound,
  Waves,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { appHref, useAppConfig } from "@/lib/app-config";
import { Bubbles } from "@/components/ui/bubbles";
import type { Permission } from "@/types";

const NAV_ITEMS: {
  path: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  permission: Permission;
}[] = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
  { path: "/swimmers", label: "Nadadores", icon: Waves, permission: "swimmers:view" },
  { path: "/coaches", label: "Entrenadores", icon: UserRound, permission: "coaches:view" },
  { path: "/competitions", label: "Competencias", icon: Trophy, permission: "competitions:view" },
  { path: "/calendar", label: "Calendario", icon: CalendarDays, permission: "calendar:view" },
  { path: "/results", label: "Resultados", icon: ClipboardList, permission: "results:view" },
  { path: "/payments", label: "Pagos", icon: CreditCard, permission: "payments:view" },
  { path: "/users", label: "Usuarios", icon: Users, permission: "users:view" },
  { path: "/settings", label: "Configuración", icon: Settings, permission: "settings:view" },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { can } = useAuth();
  const { basePath, demo } = useAppConfig();
  const homeHref = appHref(basePath, "/dashboard");

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col overflow-hidden border-r border-white/10 bg-[var(--anasac-navy)] text-white transition-transform duration-300 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Bubbles preset="sidebar" />
        <div className="relative z-[1] flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <Link href={homeHref} className="flex items-center gap-3" onClick={onClose}>
            <div className="relative h-11 w-16 overflow-hidden rounded-md bg-white/95 p-1">
              <Image
                src="/anasac-logo.png"
                alt="ANASAC"
                fill
                className="object-contain"
                sizes="64px"
                priority
              />
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] text-sm font-bold tracking-wide">
                ANASAC
              </p>
              <p className="text-[11px] text-[var(--anasac-aqua)]">Panel administrativo</p>
            </div>
          </Link>
          <button
            type="button"
            className="rounded-md p-2 text-white/80 hover:bg-white/10 lg:hidden"
            onClick={onClose}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="relative z-[1] flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.filter((item) => can(item.permission)).map((item) => {
            const Icon = item.icon;
            const href = appHref(basePath, item.path);
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={item.path}
                href={href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--anasac-teal)] text-white shadow-lg shadow-teal-900/20"
                    : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-[1] border-t border-white/10 p-4 text-xs text-white/50">
          <p>Asociación de Natación</p>
          <p>Santa Cruz, Costa Rica</p>
          {demo ? (
            <p className="mt-2 text-[var(--anasac-aqua)]">Modo demostración</p>
          ) : null}
        </div>
      </aside>
    </>
  );
}
