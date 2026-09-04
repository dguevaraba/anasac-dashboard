"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bubbles } from "@/components/ui/bubbles";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 5.4c1.5 0 2.9.5 3.9 1.6l2.9-2.9C17.2 2.4 14.8 1.4 12 1.4 7.3 1.4 3.3 4.2 1.7 8.4l3.4 2.6C6 7.7 8.7 5.4 12 5.4z"
      />
      <path
        fill="#4285F4"
        d="M22.6 12.2c0-.8-.1-1.6-.2-2.3H12v4.4h5.9c-.3 1.4-1.1 2.6-2.3 3.4l3.5 2.7c2.1-1.9 3.5-4.8 3.5-8.2z"
      />
      <path
        fill="#FBBC05"
        d="M5.1 14.3c-.3-.9-.5-1.8-.5-2.8s.2-1.9.5-2.8L1.7 6.1C.9 7.8.4 9.8.4 11.5s.5 3.7 1.3 5.4l3.4-2.6z"
      />
      <path
        fill="#34A853"
        d="M12 22.6c2.8 0 5.1-.9 6.8-2.5l-3.5-2.7c-.9.6-2.1 1-3.3 1-3.3 0-6-2.2-7-5.3L1.7 16.9C3.3 21.1 7.3 22.6 12 22.6z"
      />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 23 23" className="h-5 w-5" aria-hidden>
      <path fill="#f25022" d="M1 1h10v10H1z" />
      <path fill="#00a4ef" d="M12 1h10v10H12z" />
      <path fill="#7fba00" d="M1 12h10v10H1z" />
      <path fill="#ffb900" d="M12 12h10v10H12z" />
    </svg>
  );
}

export function InviteClient({
  token,
  roleName,
  fullName,
}: {
  token: string;
  roleName: string;
  fullName: string | null;
}) {
  const { loginWithGoogle, loginWithMicrosoft, user, logout, isLoading } =
    useAuth();
  const [error, setError] = useState<string | null>(null);
  const [oauthLoading, setOauthLoading] = useState<"google" | "azure" | null>(
    null,
  );
  const [signingOut, setSigningOut] = useState(false);

  async function onOAuth(provider: "google" | "azure") {
    setError(null);
    setOauthLoading(provider);
    const next = `/invitar/${token}`;
    const result =
      provider === "google"
        ? await loginWithGoogle(next)
        : await loginWithMicrosoft(next);
    if (!result.ok) {
      setOauthLoading(null);
      setError(
        result.error ??
          (provider === "google"
            ? "No se pudo conectar con Google."
            : "No se pudo conectar con Microsoft."),
      );
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
                Entrá con Google o Microsoft (Outlook / Hotmail) para unirte.
              </p>
              <div className="mt-6 space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={oauthLoading !== null}
                  onClick={() => void onOAuth("google")}
                >
                  <GoogleIcon />
                  {oauthLoading === "google"
                    ? "Conectando..."
                    : "Continuar con Google"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  disabled={oauthLoading !== null}
                  onClick={() => void onOAuth("azure")}
                >
                  <MicrosoftIcon />
                  {oauthLoading === "azure"
                    ? "Conectando..."
                    : "Continuar con Microsoft"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
