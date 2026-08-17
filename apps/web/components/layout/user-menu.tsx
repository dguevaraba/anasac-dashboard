"use client";

import Link from "next/link";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { useSignOut } from "@/lib/auth/use-sign-out";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

export function UserMenu() {
  const { user, viewAsRole, realRole } = useAuth();
  const { basePath } = useAppConfig();
  const { signOut, pending } = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)] px-2.5 py-1.5 text-left transition hover:border-[var(--anasac-teal)]/40 hover:bg-white"
        onClick={() => setOpen((value) => !value)}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--anasac-teal)] text-xs font-bold text-white">
          {initials(user.fullName)}
        </div>
        <div className="hidden min-w-0 md:block">
          <p className="max-w-[10rem] truncate text-sm font-semibold text-[var(--anasac-navy)]">
            {user.fullName}
          </p>
          <p className="text-xs text-slate-500">
            {viewAsRole
              ? `Vista: ${ROLE_LABELS[viewAsRole]}`
              : ROLE_LABELS[user.role]}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-white shadow-xl"
        >
          <div className="border-b border-[var(--anasac-border)] bg-[var(--anasac-mist)] px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--anasac-teal)] text-sm font-bold text-white">
                {initials(user.fullName)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--anasac-navy)]">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="navy">
                    {ROLE_LABELS[realRole ?? user.role]}
                  </Badge>
                  {viewAsRole ? (
                    <Badge variant="warning">Vista: {ROLE_LABELS[viewAsRole]}</Badge>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="p-2">
            <Link
              href={appHref(basePath, "/profile")}
              role="menuitem"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--anasac-navy)] hover:bg-[var(--anasac-mist)]"
              onClick={() => setOpen(false)}
            >
              <UserCircle2 className="h-4 w-4 text-[var(--anasac-teal)]" />
              Ver perfil
            </Link>
            <button
              type="button"
              role="menuitem"
              disabled={pending}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
              onClick={() => {
                setOpen(false);
                void signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              {pending ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
