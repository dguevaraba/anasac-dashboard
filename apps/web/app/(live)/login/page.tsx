"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { Bubbles } from "@/components/ui/bubbles";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const ERRORS: Record<string, string> = {
  sin_invitacion: "Esta cuenta no tiene acceso. Pedí una invitación.",
  inactivo: "Tu cuenta está inactiva.",
  oauth: "No se pudo completar el inicio de sesión.",
  config: "Falta configurar Supabase en el servidor.",
  invitacion: "El enlace no es válido o ya fue utilizado.",
};

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

function LoginForm() {
  const { login, loginWithGoogle, loginWithMicrosoft, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(
    ERRORS[searchParams.get("error") ?? ""] ?? null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "azure" | null>(
    null,
  );
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/dashboard");
    }
  }, [isLoading, user, router]);

  async function onOAuth(provider: "google" | "azure") {
    setError(null);
    setOauthLoading(provider);
    const result =
      provider === "google"
        ? await loginWithGoogle("/dashboard")
        : await loginWithMicrosoft("/dashboard");
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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "No se pudo iniciar sesión.");
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

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#0f2c3d_0%,#2e768d_55%,#3ecfc0_140%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Bubbles preset="hero" />
          <div className="relative z-[1]">
            <div className="relative mb-8 h-24 w-44 rounded-2xl bg-white/95 p-3">
              <Image
                src="/anasac-logo.png"
                alt="Logo ANASAC"
                fill
                className="object-contain p-1"
                sizes="176px"
                priority
              />
            </div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--anasac-aqua)]">
              Asociación de Natación
            </p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight">
              ANASAC Dashboard
            </h1>
            <p className="mt-4 max-w-md text-sm text-white/80">
              Panel administrativo de la Asociación de Natación de Santa Cruz.
            </p>
          </div>
          <div className="relative z-[1] space-y-2 text-sm text-white/80">
            <p className="font-bold text-white">«Supera tus límites. Conquista tus metas.»</p>
            <p className="text-xs font-medium text-white/90">Santa Cruz, Costa Rica</p>
          </div>
        </div>

        <div className="relative overflow-hidden p-8 md:p-10">
          <Bubbles preset="panel" className="opacity-80" />
          <div className="relative z-[1]">
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="relative h-24 w-44 rounded-2xl bg-[var(--anasac-mist)] p-3">
                <Image
                  src="/anasac-logo.png"
                  alt="Logo ANASAC"
                  fill
                  className="object-contain p-1"
                  sizes="176px"
                  priority
                />
              </div>
            </div>

            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--anasac-navy)]">
              Iniciar sesión
            </h2>

            {!configured ? (
              <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Falta configurar Supabase. Agregá las variables de entorno en
                Vercel y en <code>.env.local</code>.
              </p>
            ) : null}

            {error ? (
              <p className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            <div className="mt-8 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={!configured || oauthLoading !== null}
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
                disabled={!configured || oauthLoading !== null}
                onClick={() => void onOAuth("azure")}
              >
                <MicrosoftIcon />
                {oauthLoading === "azure"
                  ? "Conectando..."
                  : "Continuar con Microsoft"}
              </Button>
            </div>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--anasac-border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide text-slate-400">
                <span className="bg-white px-2">o con correo</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-[var(--anasac-teal)] hover:text-[var(--anasac-navy)]"
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                variant="outline"
                className="w-full"
                disabled={!configured || submitting}
              >
                {submitting ? "Ingresando..." : "Entrar"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--anasac-navy)] text-white">
          Cargando...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
