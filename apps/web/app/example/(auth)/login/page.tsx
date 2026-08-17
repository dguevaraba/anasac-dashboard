"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_PASSWORD } from "@/lib/mock/data";
import { Bubbles } from "@/components/ui/bubbles";

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("admin@anasaccr.com");
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/example/dashboard");
    }
  }, [isLoading, user, router]);

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
    router.replace("/example/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--anasac-navy)] px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--anasac-teal)]/30 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-[var(--anasac-aqua)]/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 40%, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(160deg,#0f2c3d_0%,#2e768d_55%,#3ecfc0_140%)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <Bubbles preset="hero" />
          <div className="relative z-[1]">
            <div className="relative mb-8 h-16 w-28 rounded-xl bg-white/95 p-2">
              <Image
                src="/anasac-logo.png"
                alt="Logo ANASAC"
                fill
                className="object-contain p-1"
                sizes="112px"
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
              Sistema administrativo para gestionar nadadores, competencias,
              calendario y resultados de Santa Cruz, Costa Rica.
            </p>
          </div>
          <div className="relative z-[1] space-y-2 text-sm text-white/70">
            <p>«Supera tus límites. Conquista tus metas.»</p>
            <p className="text-xs text-white/50">Versión demo con datos mock</p>
          </div>
        </div>

        <div className="relative overflow-hidden p-8 md:p-10">
          <Bubbles preset="panel" className="opacity-80" />
          <div className="relative z-[1]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="relative h-12 w-20 rounded-lg bg-[var(--anasac-mist)] p-1">
                <Image
                  src="/anasac-logo.png"
                  alt="Logo ANASAC"
                  fill
                  className="object-contain"
                  sizes="80px"
                  priority
                />
              </div>
              <div>
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-navy)]">
                  ANASAC
                </p>
                <p className="text-xs text-slate-500">Panel administrativo</p>
              </div>
            </div>

            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--anasac-navy)]">
              Iniciar sesión
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Accede con una cuenta de demostración.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error ? (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Ingresando..." : "Entrar"}
              </Button>
            </form>

            <div className="relative mt-6 overflow-hidden rounded-xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)] p-4 text-xs text-slate-600">
              <Bubbles preset="card" className="opacity-60" />
              <div className="relative z-[1]">
                <p className="font-semibold text-[var(--anasac-navy)]">Cuentas demo</p>
                <ul className="mt-2 space-y-1">
                  <li>admin@anasaccr.com — Administrador</li>
                  <li>entrenador@anasaccr.com — Entrenador</li>
                  <li>consulta@anasaccr.com — Consulta</li>
                </ul>
                <p className="mt-2">
                  Contraseña: <code className="font-mono">{DEMO_PASSWORD}</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
