"use client";

import { Bell, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppConfig } from "@/lib/app-config";
import { notifications } from "@/lib/mock/data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bubbles } from "@/components/ui/bubbles";
import { UserMenu } from "@/components/layout/user-menu";
import { formatDateTime } from "@/lib/utils";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { demo } = useAppConfig();
  const [openNotif, setOpenNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const unread = demo ? notifications.filter((n) => !n.read).length : 0;

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!notifRef.current?.contains(event.target as Node)) {
        setOpenNotif(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <header className="relative sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-[var(--anasac-border)] bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Bubbles preset="header" className="opacity-70" />
      </div>
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
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notificaciones"
            onClick={() => setOpenNotif((v) => !v)}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--anasac-aqua)]" />
            ) : null}
          </Button>
          {openNotif ? (
            <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-[var(--anasac-border)] bg-white p-2 shadow-xl">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notificaciones
              </p>
              {demo ? (
                notifications.map((n) => (
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
                ))
              ) : (
                <p className="px-2 py-6 text-center text-sm text-slate-500">
                  No hay notificaciones.
                </p>
              )}
            </div>
          ) : null}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
