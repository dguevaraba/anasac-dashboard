import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

async function countRows(
  table: "swimmers" | "competitions" | "results" | "calendar_events" | "coaches",
) {
  const supabase = await createServerSupabase();
  const { count } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

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
