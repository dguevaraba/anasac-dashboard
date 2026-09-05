"use client";

import Link from "next/link";
import { CalendarDays, CreditCard, Trophy, Users, Waves } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { NextPaymentCard } from "@/components/dashboard/next-payment-card";
import {
  AttendanceChart,
  PaymentsChart,
  ResultsCharts,
} from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bubbles } from "@/components/ui/bubbles";
import { useAuth } from "@/lib/auth/auth-context";
import { appHref, useAppConfig } from "@/lib/app-config";
import {
  formatCrc,
  getNextInstitutionalPayment,
  payments,
} from "@/lib/mock/analytics";
import {
  calendarEvents,
  competitions,
  findCompetition,
  findEvent,
  findSwimmer,
  results,
  swimmers,
} from "@/lib/mock/data";
import { formatDate, formatTimeMs } from "@/lib/utils";

const STATUS_VARIANT = {
  programada: "default",
  en_curso: "warning",
  finalizada: "success",
  cancelada: "danger",
} as const;

export default function DashboardPage() {
  const { user } = useAuth();
  const { basePath, demo } = useAppConfig();
  const activeSwimmers = swimmers.filter((s) => s.status === "activo").length;
  const nextCompetition = [...competitions]
    .filter((c) => c.status === "programada" || c.status === "en_curso")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  const upcoming = [...calendarEvents]
    .filter((e) => e.type !== "entrenamiento")
    .filter((e) => e.startAt >= new Date().toISOString())
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 4);
  const recentResults = [...results]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);
  const nextPayment = getNextInstitutionalPayment();
  const pendingPayments = payments.filter((p) => p.status === "pendiente").length;

  return (
    <div>
      <PageHeader
        title={`Hola, ${user?.fullName.split(" ")[0]}`}
        description={
          demo
            ? "Resumen operativo de ANASAC — datos de demostración."
            : "Resumen operativo de ANASAC."
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Nadadores"
          value={swimmers.length}
          hint={`${activeSwimmers} activos`}
          icon={<Waves className="h-5 w-5" />}
        />
        <StatCard
          title="Competencias"
          value={competitions.length}
          hint="Temporada demo 2026"
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="Próximo evento"
          value={upcoming[0] ? formatDate(upcoming[0].startAt) : "—"}
          hint={upcoming[0]?.title}
          icon={<CalendarDays className="h-5 w-5" />}
          href={appHref(basePath, "/calendar")}
        />
        <StatCard
          title="Resultados"
          value={results.length}
          hint="Últimas marcas registradas"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Pagos pendientes"
          value={pendingPayments}
          hint={`${nextPayment.daysRemaining} días al cobro`}
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <NextPaymentCard />
        </div>

        <Card className="xl:col-span-1" bubbles bubblePreset="panel">
          <CardHeader>
            <CardTitle>Próxima competencia</CardTitle>
          </CardHeader>
          <CardContent>
            {nextCompetition ? (
              <div className="space-y-3">
                <div className="relative overflow-hidden rounded-xl bg-[linear-gradient(135deg,#0f2c3d,#2e768d)] p-4 text-white">
                  <Bubbles preset="hero" />
                  <div className="relative z-[1]">
                    <p className="text-xs uppercase tracking-wide text-[var(--anasac-aqua)]">
                      Destacada
                    </p>
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold">
                      {nextCompetition.name}
                    </h3>
                    <p className="mt-2 text-sm text-white/80">{nextCompetition.location}</p>
                    <p className="mt-1 text-sm text-white/70">
                      {formatDate(nextCompetition.startDate)} —{" "}
                      {formatDate(nextCompetition.endDate)}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[nextCompetition.status]}>
                  {nextCompetition.status.replace("_", " ")}
                </Badge>
                <Link
                  href={appHref(basePath, "/competitions")}
                  className="inline-block text-sm font-semibold text-[var(--anasac-teal)] hover:underline"
                >
                  Ver competencias →
                </Link>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No hay competencias próximas.</p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1" bubbles bubblePreset="card">
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay competencias, reuniones u otros eventos próximos.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((event, index) => {
                  const dia = new Intl.DateTimeFormat("en-CA", {
                    timeZone: "America/Costa_Rica",
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  }).format(new Date(event.startAt));
                  const href = appHref(basePath, `/calendar?dia=${dia}`);
                  if (index === 0) {
                    return (
                      <Link
                        key={event.id}
                        href={href}
                        className="relative block overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1a7a72_0%,#2e768d_45%,#3ecfc0_120%)] p-4 text-white transition hover:brightness-105"
                      >
                        <Bubbles preset="hero" />
                        <div className="relative z-[1]">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--anasac-aqua)]">
                            Próximo · {event.type}
                          </p>
                          <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-bold">
                            {event.title}
                          </h3>
                          {event.location ? (
                            <p className="mt-2 text-sm text-white/80">
                              {event.location}
                            </p>
                          ) : null}
                          <p className="mt-1 text-sm text-white/70">
                            {formatDate(event.startAt)}
                          </p>
                        </div>
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={event.id}
                      href={href}
                      className="relative block overflow-hidden rounded-xl border border-[var(--anasac-border)] bg-white px-3 py-3 transition hover:border-[var(--anasac-teal)]"
                    >
                      <div className="relative z-[1] flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-[var(--anasac-navy)]">
                          {event.title}
                        </p>
                        <Badge variant="muted">{event.type}</Badge>
                      </div>
                      <p className="relative z-[1] mt-1 text-xs text-slate-500">
                        {formatDate(event.startAt)} · {event.location}
                      </p>
                    </Link>
                  );
                })}
                <Link
                  href={appHref(basePath, "/calendar")}
                  className="inline-block text-sm font-semibold text-[var(--anasac-teal)] hover:underline"
                >
                  Ver calendario →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--anasac-navy)]">
              Estadísticas
            </h2>
            <p className="text-sm text-slate-500">
              Asistencia, resultados y pagos — gráficos demo
            </p>
          </div>
          <Link
            href={appHref(basePath, "/pagos")}
            className="text-sm font-semibold text-[var(--anasac-teal)] hover:underline"
          >
            Ir a pagos →
          </Link>
        </div>

        <AttendanceChart />
        <ResultsCharts />
        <PaymentsChart />
      </div>

      <div className="mt-6">
        <Card bubbles bubblePreset="panel">
          <CardHeader>
            <CardTitle>Resultados recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentResults.map((result) => {
              const swimmer = findSwimmer(result.swimmerId);
              const event = findEvent(result.eventId);
              const competition = findCompetition(result.competitionId);
              return (
                <div
                  key={result.id}
                  className="relative flex items-center justify-between gap-3 overflow-hidden rounded-xl border border-[var(--anasac-border)] px-3 py-3"
                >
                  <Bubbles preset="card" className="opacity-40" />
                  <div className="relative z-[1]">
                    <p className="text-sm font-semibold text-[var(--anasac-navy)]">
                      {swimmer
                        ? `${swimmer.firstName} ${swimmer.lastName}`
                        : "Nadador"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {event?.name} · {competition?.name}
                    </p>
                  </div>
                  <div className="relative z-[1] text-right">
                    <p className="font-mono text-sm font-semibold text-[var(--anasac-teal)]">
                      {formatTimeMs(result.timeMs)}
                    </p>
                    {result.place ? (
                      <p className="text-xs text-slate-500">Puesto {result.place}</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <div className="flex items-center justify-between pt-1 text-sm">
              <span className="text-slate-500">
                Pendiente de cobro: {formatCrc(nextPayment.pendingAmount)}
              </span>
              <Link
                href={appHref(basePath, "/results")}
                className="font-semibold text-[var(--anasac-teal)] hover:underline"
              >
                Ver todos los resultados →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
