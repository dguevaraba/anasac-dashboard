import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TipoEventoCalendario } from "@/lib/calendario/permisos";

async function countRows(
  table: "swimmers" | "competitions" | "results" | "calendar_events" | "coaches",
) {
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export type ProximoEventoDashboard = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  location: string | null;
  type: TipoEventoCalendario;
};

export async function getLiveDashboardStats() {
  if (!isSupabaseConfigured()) {
    return {
      swimmers: 0,
      activeSwimmers: 0,
      competitions: 0,
      upcomingEvents: 0,
      results: 0,
    };
  }

  const supabase = await createServerSupabase();
  const now = new Date().toISOString();

  const [swimmers, activeSwimmers, competitions, upcomingEvents, results] =
    await Promise.all([
      countRows("swimmers"),
      supabase
        .from("swimmers")
        .select("id", { count: "exact", head: true })
        .neq("status", "inactivo")
        .then((r) => r.count ?? 0),
      countRows("competitions"),
      supabase
        .from("calendar_events")
        .select("id", { count: "exact", head: true })
        .gte("start_at", now)
        .neq("type", "entrenamiento")
        .then((r) => r.count ?? 0),
      countRows("results"),
    ]);

  return {
    swimmers,
    activeSwimmers,
    competitions,
    upcomingEvents,
    results,
  };
}

/** Próximos eventos del home: todo excepto entrenamientos. */
export async function getProximosEventosDashboard(
  limit = 100,
): Promise<ProximoEventoDashboard[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabase();
  const now = new Date().toISOString();
  const { data } = await supabase
    .from("calendar_events")
    .select("id, title, start_at, end_at, location, type")
    .gte("start_at", now)
    .neq("type", "entrenamiento")
    .order("start_at", { ascending: true })
    .limit(limit);

  return (data ?? [])
    .filter(
      (row) =>
        row.type === "competencia" ||
        row.type === "reunion" ||
        row.type === "otro",
    )
    .map((row) => ({
      id: row.id as string,
      title: row.title as string,
      startAt: String(row.start_at),
      endAt: String(row.end_at),
      location: (row.location as string | null) ?? null,
      type: row.type as TipoEventoCalendario,
    }));
}
