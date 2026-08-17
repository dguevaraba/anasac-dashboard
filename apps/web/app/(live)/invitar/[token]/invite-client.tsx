"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bubbles } from "@/components/ui/bubbles";
import { useAuth } from "@/lib/auth/auth-context";
import { fetchProfileById } from "@/lib/auth/profile";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function InviteClient({
  token,
  roleName,
  fullName,
}: {
  token: string;
  roleName: string;
  fullName: string | null;
}) {
  const { loginWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "invitacion"
      ? "No se pudo aceptar la invitación. Probá de nuevo."
      : null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let cancelled = false;

    async function acceptIfSignedIn() {
      const supabase = createBrowserSupabase();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (!authUser || cancelled) return;

      setAccepting(true);
      const { error: rpcError } = await supabase.rpc("accept_invitation", {
        invite_token: token,
      });
      if (cancelled) return;
      if (rpcError) {
        const profile = await fetchProfileById(supabase, authUser.id);
        if (profile) {
          router.replace("/dashboard");
          return;
        }
        setAccepting(false);
        setError(rpcError.message);
        return;
      }
      router.replace("/dashboard");
    }

    void acceptIfSignedIn();
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  async function onGoogle() {
    setError(null);
    setGoogleLoading(true);
    const result = await loginWithGoogle(`/invitar/${token}`);
    if (!result.ok) {
      setGoogleLoading(false);
      setError(result.error ?? "No se pudo conectar con Google.");
    }
  }

  async function onEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured()) return;
    setSubmitting(true);
    setError(null);
    const supabase = createBrowserSupabase();
    const { data, error: signError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (signError) {
      setSubmitting(false);
      setError(signError.message);
      return;
    }
    if (!data.session) {
      setSubmitting(false);
      setError(
        "Revisá tu correo para confirmar la cuenta y después volvé a este enlace.",
      );
      return;
    }
    const { error: rpcError } = await supabase.rpc("accept_invitation", {
      invite_token: token,
    });
    setSubmitting(false);
    if (rpcError) {
      setError(rpcError.message);
      return;
    }
    router.replace("/dashboard");
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
            . Entrá con tu Gmail (o el correo que uses).
          </p>

          {accepting ? (
            <p className="mt-6 text-center text-sm text-slate-500">
              Aceptando invitación...
            </p>
          ) : (
            <>
              {error ? (
                <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button
                type="button"
                className="mt-6 w-full"
                disabled={googleLoading}
                onClick={() => void onGoogle()}
              >
                {googleLoading ? "Conectando..." : "Continuar con Google"}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[var(--anasac-border)]" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide text-slate-400">
                  <span className="bg-white px-2">o crear con otro correo</span>
                </div>
              </div>

              <form onSubmit={onEmailSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="invite-email">Tu correo</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="invite-password">Elegí una contraseña</Label>
                  <Input
                    id="invite-password"
                    type="password"
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Creando cuenta..." : "Crear cuenta"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
