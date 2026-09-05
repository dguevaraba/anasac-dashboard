"use client";

import Link from "next/link";
import { CalendarDays, CreditCard, Waves } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardPagosWidgets } from "@/components/dashboard/dashboard-pagos-widgets";
import { Badge } from "@/components/ui/badge";
import { Bubbles } from "@/components/ui/bubbles";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth/auth-context";
import { appHref, useAppConfig } from "@/lib/app-config";
import {
  etiquetaTipoEvento,
  puedeVerTipoEvento,
  type TipoEventoCalendario,
} from "@/lib/calendario/permisos";
import type { ProximoEventoDashboard } from "@/lib/live/stats";
import { daysUntil } from "@/lib/mock/analytics";
import { formatDateTime } from "@/lib/utils";

type Mensualidad = {
  dueDate: string;
  daysRemaining: number;
  pendingAmount: number;
  pendingCount: number;
  monthLabel: string;
};

type ChartPoint = {
  mes: string;
  pagado: number;
  pendiente: number;
  vencido: number;
  parcial: number;
  cobertura: number;
};

const TYPE_VARIANT: Record<
  Exclude<TipoEventoCalendario, "entrenamiento">,
  "navy" | "warning" | "muted"
> = {
  competencia: "navy",
  reunion: "warning",
  otro: "muted",
};

function claveDiaCostaRica(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Costa_Rica",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function DashboardHome({
  stats,
  pagosCount,
  mensualidad,
  chartData,
  proximosEventos,
}: {
  stats: {
    swimmers: number;
    activeSwimmers: number;
    competitions: number;
    upcomingEvents: number;
  };
  pagosCount: number;
  mensualidad: Mensualidad | null;
  chartData: ChartPoint[];
  proximosEventos: ProximoEventoDashboard[];
}) {
  const { can, user } = useAuth();
  const { basePath } = useAppConfig();
  const role = user?.role ?? null;
  const puedeVerPagos = can("payments:view");
  const puedeVerNadadores = can("swimmers:view");
  const puedeVerCalendario = can("calendar:view");

  const eventosVisibles = proximosEventos.filter((e) =>
    puedeVerTipoEvento(role, e.type),
  );
  const proximosCount = eventosVisibles.length;
  const eventosLista = eventosVisibles.slice(0, 8);
  const proximoEvento = eventosVisibles[0] ?? null;
  const diasProximoEvento = proximoEvento
    ? daysUntil(claveDiaCostaRica(proximoEvento.startAt))
    : null;
  const hrefProximo = proximoEvento
    ? appHref(
        basePath,
        `/calendar?dia=${claveDiaCostaRica(proximoEvento.startAt)}`,
      )
    : appHref(basePath, "/calendar");

  const empty =
    (!puedeVerNadadores || stats.swimmers === 0) &&
    (!puedeVerCalendario || proximosCount === 0) &&
    (!puedeVerPagos || pagosCount === 0);

  const cardCount =
    (puedeVerNadadores ? 1 : 0) +
    (puedeVerPagos ? 1 : 0) +
    (puedeVerCalendario ? 1 : 0);
  const cols =
    cardCount >= 3
      ? "sm:grid-cols-2 xl:grid-cols-3"
      : cardCount === 2
        ? "sm:grid-cols-2"
        : "sm:grid-cols-1";

  let hintDias = "Sin eventos próximos";
  if (diasProximoEvento != null && proximoEvento) {
    if (diasProximoEvento === 0) hintDias = proximoEvento.title;
    else if (diasProximoEvento === 1) hintDias = `Mañana · ${proximoEvento.title}`;
    else hintDias = proximoEvento.title;
  }

  return (
    <>
      {cardCount > 0 ? (
        <div className={`grid gap-4 ${cols}`}>
          {puedeVerNadadores ? (
            <StatCard
              title="Nadadores"
              value={stats.swimmers}
              hint={`${stats.activeSwimmers} activos`}
              icon={<Waves className="h-5 w-5" />}
              href="/nadadores"
            />
          ) : null}
          {puedeVerPagos ? (
            <StatCard
              title="Pagos"
              value={pagosCount}
              hint={
                pagosCount === 0
                  ? "Sin cobros aún"
                  : `${mensualidad?.pendingCount ?? 0} pendiente${(mensualidad?.pendingCount ?? 0) === 1 ? "" : "s"} del mes`
              }
              icon={<CreditCard className="h-5 w-5" />}
              href="/pagos"
            />
          ) : null}
          {puedeVerCalendario ? (
            <StatCard
              title="Días al próximo evento"
              value={
                diasProximoEvento == null
                  ? "—"
                  : diasProximoEvento === 0
                    ? "Hoy"
                    : Math.max(0, diasProximoEvento)
              }
              hint={hintDias}
              icon={<CalendarDays className="h-5 w-5" />}
              href={hrefProximo}
            />
          ) : null}
        </div>
      ) : null}

      {puedeVerPagos && mensualidad ? (
        <DashboardPagosWidgets
          mensualidad={mensualidad}
          chartData={chartData}
        />
      ) : null}

      {puedeVerCalendario ? (
        <Card className="mt-6" bubbles bubblePreset="card">
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent>
            {eventosLista.length === 0 ? (
              <p className="text-sm text-slate-500">
                No hay eventos próximos para tu rol.
              </p>
            ) : (
              <div className="space-y-3">
                {eventosLista.map((event, index) => {
                  const dia = claveDiaCostaRica(event.startAt);
                  const href = appHref(basePath, `/calendar?dia=${dia}`);
                  const tipo = etiquetaTipoEvento(event.type);
                  const esProximo = index === 0;

                  if (esProximo) {
                    return (
                      <Link
                        key={event.id}
                        href={href}
                        className="relative block overflow-hidden rounded-xl bg-[linear-gradient(135deg,#1a7a72_0%,#2e768d_45%,#3ecfc0_120%)] text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anasac-aqua)] focus-visible:ring-offset-2"
                      >
                        {event.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={event.imageUrl}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover opacity-35"
                          />
                        ) : (
                          <Bubbles preset="hero" />
                        )}
                        <div className="relative z-[1] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--anasac-aqua)]">
                            Próximo · {tipo}
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
                            {formatDateTime(event.startAt)}
                          </p>
                        </div>
                      </Link>
                    );
                  }

                  return (
                    <Link
                      key={event.id}
                      href={href}
                      className="relative flex gap-3 overflow-hidden rounded-xl border border-[var(--anasac-border)] bg-white px-3 py-3 transition hover:border-[var(--anasac-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anasac-teal)]"
                    >
                      {event.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={event.imageUrl}
                          alt=""
                          className="h-12 w-12 shrink-0 rounded-lg object-cover"
                        />
                      ) : null}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-[var(--anasac-navy)]">
                            {event.title}
                          </p>
                          <Badge
                            variant={
                              TYPE_VARIANT[
                                event.type as Exclude<
                                  TipoEventoCalendario,
                                  "entrenamiento"
                                >
                              ] ?? "muted"
                            }
                          >
                            {tipo}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatDateTime(event.startAt)}
                          {event.location ? ` · ${event.location}` : ""}
                        </p>
                      </div>
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
      ) : null}

      {empty ? (
        <div className="mt-6">
          <EmptyState
            title="Todavía no hay actividad"
            description="Cuando cargues nadadores, competencias y pagos, el resumen va a aparecer acá."
          />
        </div>
      ) : null}
    </>
  );
}
