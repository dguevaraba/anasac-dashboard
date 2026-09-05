import { PageHeader } from "@/components/layout/page-header";
import { DashboardHome } from "@/components/dashboard/dashboard-home";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchProfileById } from "@/lib/auth/profile";
import { hasPermission } from "@/lib/auth/permissions";
import {
  getLiveDashboardStats,
  getProximosEventosDashboard,
} from "@/lib/live/stats";
import {
  resumenMensualidad,
  serieCobranzaUltimosMeses,
} from "@/lib/pagos/resumen-dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, proximosEventos] = await Promise.all([
    getLiveDashboardStats(),
    getProximosEventosDashboard(),
  ]);
  let firstName = "";
  let mensualidad: ReturnType<typeof resumenMensualidad> | null = null;
  let chartData: ReturnType<typeof serieCobranzaUltimosMeses> = [];
  let pagosCount = 0;

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const profile = await fetchProfileById(supabase, user.id);
      firstName = profile?.fullName.split(" ")[0] ?? "";

      // Carga datos si el rol real puede ver pagos (p. ej. admin).
      // La UI final se oculta en cliente si “ver como” no tiene payments:view.
      if (profile && hasPermission(profile.role, "payments:view")) {
        const { data: filas } = await supabase
          .from("payments")
          .select("amount_crc, tax_crc, status, period");
        const pagos = (filas ?? []).map((row) => ({
          amount: Number(row.amount_crc) || 0,
          tax: Number(row.tax_crc) || 0,
          status: String(row.status),
          period: String(row.period),
        }));
        pagosCount = pagos.length;
        mensualidad = resumenMensualidad(pagos);
        chartData = serieCobranzaUltimosMeses(pagos);
      }
    }
  }

  return (
    <div>
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Inicio"}
        description="Resumen operativo de ANASAC."
      />

      <DashboardHome
        stats={{
          swimmers: stats.swimmers,
          activeSwimmers: stats.activeSwimmers,
          competitions: stats.competitions,
          upcomingEvents: stats.upcomingEvents,
        }}
        pagosCount={pagosCount}
        mensualidad={mensualidad}
        chartData={chartData}
        proximosEventos={proximosEventos}
      />
    </div>
  );
}
