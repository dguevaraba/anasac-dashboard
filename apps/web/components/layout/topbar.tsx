"use client";

import Link from "next/link";
import { Bell, LogOut, Menu, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { notifications } from "@/lib/mock/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bubbles } from "@/components/ui/bubbles";
import { formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <header className="relative sticky top-0 z-30 flex h-16 items-center justify-between gap-3 overflow-hidden border-b border-[var(--anasac-border)] bg-white/90 px-4 backdrop-blur md:px-6">
      <Bubbles preset="header" className="opacity-70" />
      <div className="relative z-[1] flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden sm:block">
          <p className="text-xs uppercase tracking-wider text-slate-400">ANASAC Dashboard</p>
          <p className="text-sm font-semibold text-[var(--anasac-navy)]">
            Gestión deportiva
          </p>
        </div>
      </div>

      <div className="relative z-[1] flex items-center gap-2">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificaciones"
            onClick={() => {
              setOpenNotif((v) => !v);
              setOpenProfile(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--anasac-aqua)]" />
            ) : null}
          </Button>
          {openNotif ? (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--anasac-border)] bg-white p-2 shadow-xl">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notificaciones
              </p>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="rounded-lg px-2 py-2 hover:bg-[var(--anasac-mist)]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-[var(--anasac-navy)]">{n.title}</p>
                    {!n.read ? <Badge variant="default">Nueva</Badge> : null}
                  </div>
                  <p className="text-xs text-slate-500">{n.body}</p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)] px-2.5 py-1.5 text-left transition hover:bg-white"
            onClick={() => {
              setOpenProfile((v) => !v);
              setOpenNotif(false);
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--anasac-teal)] text-xs font-bold text-white">
              {user.fullName
                .split(" ")
                .map((p) => p[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-sm font-semibold text-[var(--anasac-navy)]">
                {user.fullName}
              </p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
            </div>
          </button>

          {openProfile ? (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--anasac-border)] bg-white p-2 shadow-xl">
              <Link
                href="/example/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-[var(--anasac-mist)]"
                onClick={() => setOpenProfile(false)}
              >
                <UserCircle2 className="h-4 w-4" />
                Mi perfil
              </Link>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  logout();
                  router.push("/example/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
