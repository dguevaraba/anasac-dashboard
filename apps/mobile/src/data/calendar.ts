import type { CalendarEvent } from "@anasac/shared";
import { getSupabase } from "@/supabase/client";

export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("calendar_events")
    .select(
      "id, title, description, start_at, end_at, location, type, competition_id, image_url",
    )
    .order("start_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? [])
    .map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string | null) ?? undefined,
      startAt: String(row.start_at),
      endAt: String(row.end_at),
      location: (row.location as string | null) ?? undefined,
      type: row.type as CalendarEvent["type"],
      competitionId: (row.competition_id as string | null) ?? undefined,
      imageUrl: (row.image_url as string | null) ?? undefined,
    }))
    .filter(
      (e) =>
        e.type === "competencia" ||
        e.type === "entrenamiento" ||
        e.type === "reunion" ||
        e.type === "otro",
    );
}

export async function fetchProximosEventosDashboard(limit = 100) {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, title, start_at, end_at, location, type, image_url")
    .gte("start_at", now)
    .neq("type", "entrenamiento")
    .order("start_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

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
      type: row.type as "competencia" | "reunion" | "otro",
      imageUrl: (row.image_url as string | null) ?? null,
    }));
}
