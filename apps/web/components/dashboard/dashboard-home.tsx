"use client";

import { CalendarDays, CreditCard, Trophy, Waves } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { DashboardPagosWidgets } from "@/components/dashboard/dashboard-pagos-widgets";
import { useAuth } from "@/lib/auth/auth-context";

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

export function DashboardHome({
  stats,
  pagosCount,
  mensualidad,
  chartData,
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
}) {
  const { can } = useAuth();
  const puedeVerPagos = can("payments:view");

  const empty =
    stats.swimmers === 0 &&
    stats.competitions === 0 &&
    stats.upcomingEvents === 0 &&
    (!puedeVerPagos || pagosCount === 0);

  const cols = puedeVerPagos
    ? "sm:grid-cols-2 xl:grid-cols-4"
    : "sm:grid-cols-2 xl:grid-cols-3";

  return (
    <>
      <div className={`grid gap-4 ${cols}`}>
        <StatCard
          title="Nadadores"
          value={stats.swimmers}
          hint={`${stats.activeSwimmers} activos`}
          icon={<Waves className="h-5 w-5" />}
          href="/nadadores"
        />
        <StatCard
          title="Competencias"
          value={stats.competitions}
          hint="Temporada actual"
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="Próximos eventos"
          value={stats.upcomingEvents}
          hint="En el calendario"
          icon={<CalendarDays className="h-5 w-5" />}
        />
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
      </div>

      {puedeVerPagos && mensualidad ? (
        <DashboardPagosWidgets
          mensualidad={mensualidad}
          chartData={chartData}
        />
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
