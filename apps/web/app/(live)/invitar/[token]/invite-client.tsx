"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bubbles } from "@/components/ui/bubbles";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";

export function InviteClient({
  token,
  roleName,
  fullName,
}: {
  token: string;
  roleName: string;
  fullName: string | null;
}) {
  const { loginWithGoogle, user, logout, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function onGoogle() {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle(`/invitar/${token}`);
    if (!result.ok) {
      setGoogleLoading(false);
      setError(result.error ?? "No se pudo conectar con Google.");
    }
  }

  async function onSignOut() {
    setSigningOut(true);
    await logout();
    setSigningOut(false);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--anasac-navy)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--anasac-teal)]/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[var(--anasac-aqua)]/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white p-8 shadow-2xl">
        <Bubbles preset="panel" className="opacity-70" />
        <div className="relative z-[1]">
          <div className="relative mx-auto mb-6 h-14 w-24">
            <Image
              src="/anasac-logo.png"
              alt="ANASAC"
              fill
              className="object-contain"
              sizes="96px"
              priority
            />
          </div>
          <h1 className="text-center font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--anasac-navy)]">
            Invitación a ANASAC
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            {fullName ? `${fullName}, te` : "Te"} invitaron con el rol{" "}
            <span className="font-semibold text-[var(--anasac-teal)]">
              {roleName}
            </span>
            .
          </p>

          {error ? (
            <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <p className="mt-6 text-center text-sm text-slate-500">Cargando...</p>
          ) : user ? (
            <div className="mt-6 space-y-3 rounded-2xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)] p-4">
              <p className="text-sm text-slate-600">
                Estás conectado como{" "}
                <span className="font-semibold text-[var(--anasac-navy)]">
                  {user.email}
                </span>{" "}
                ({ROLE_LABELS[user.role]}). Esta invitación es para otra persona.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={signingOut}
                onClick={() => void onSignOut()}
              >
                {signingOut ? "Cerrando sesión..." : "Cerrar sesión para continuar"}
              </Button>
            </div>
          ) : (
            <>
              <p className="mt-4 text-center text-sm text-slate-500">
                Entrá con tu Gmail para unirte.
              </p>
              <Button
                type="button"
                className="mt-6 w-full"
                disabled={googleLoading}
                onClick={() => void onGoogle()}
              >
                {googleLoading ? "Conectando..." : "Continuar con Google"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
