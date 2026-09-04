import { CalendarDays, CreditCard, Trophy, Users, Waves } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchProfileById } from "@/lib/auth/profile";
import { getLiveDashboardStats } from "@/lib/live/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getLiveDashboardStats();
  let firstName = "";

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const profile = await fetchProfileById(supabase, user.id);
      firstName = profile?.fullName.split(" ")[0] ?? "";
    }
  }

  const empty =
    stats.swimmers === 0 &&
    stats.competitions === 0 &&
    stats.upcomingEvents === 0 &&
    stats.results === 0;

  return (
    <div>
      <PageHeader
        title={firstName ? `Hola, ${firstName}` : "Inicio"}
        description="Resumen operativo de ANASAC."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Nadadores"
          value={stats.swimmers}
          hint={`${stats.activeSwimmers} activos`}
          icon={<Waves className="h-5 w-5" />}
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
        <StatCard
          title="Resultados"
          value={stats.results}
          hint="Marcas registradas"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Pagos"
          value={0}
          hint="Sin cobros aún"
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      {empty ? (
        <div className="mt-6">
          <EmptyState
            title="Todavía no hay actividad"
            description="Cuando cargues nadadores, competencias y pagos, el resumen va a aparecer acá."
          />
        </div>
      ) : null}
    </div>
  );
}
