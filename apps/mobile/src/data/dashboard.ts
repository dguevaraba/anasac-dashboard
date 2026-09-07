import { fetchProximosEventosDashboard } from "@/data/calendar";
import { fetchMensualidadResumen } from "@/data/payments";
import { fetchSwimmerCounts } from "@/data/swimmers";

export async function fetchDashboardData(opts: {
  canPayments: boolean;
  canSwimmers: boolean;
}) {
  const [proximosEventos, swimmers, pagos] = await Promise.all([
    fetchProximosEventosDashboard(),
    opts.canSwimmers
      ? fetchSwimmerCounts()
      : Promise.resolve({ total: 0, active: 0 }),
    opts.canPayments
      ? fetchMensualidadResumen()
      : Promise.resolve({
          pagosCount: 0,
          pendingCount: 0,
          mensualidad: null as Awaited<
            ReturnType<typeof fetchMensualidadResumen>
          >["mensualidad"] | null,
        }),
  ]);

  return {
    proximosEventos,
    swimmers,
    pagosCount: pagos.pagosCount,
    pendingCount: pagos.pendingCount,
    mensualidad: pagos.mensualidad,
  };
}
