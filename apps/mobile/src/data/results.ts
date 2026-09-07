import { getSupabase } from "@/supabase/client";

export type ResultListItem = {
  id: string;
  timeMs: number;
  place: number | null;
  createdAt: string;
  swimmerName: string;
  eventName: string | null;
  competitionName: string | null;
};

type RelName = { name?: string; first_name?: string; last_name?: string } | null;

function one<T>(rel: T | T[] | null): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? rel[0] ?? null : rel;
}

export async function fetchResults(): Promise<ResultListItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("results")
    .select(
      "id, time_ms, place, created_at, swimmers(first_name, last_name), competition_events!event_id(name), competitions!competition_id(name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const swimmer = one(row.swimmers as RelName | RelName[]);
    const event = one(row.competition_events as RelName | RelName[]);
    const competition = one(row.competitions as RelName | RelName[]);
    return {
      id: row.id as string,
      timeMs: Number(row.time_ms) || 0,
      place: row.place == null ? null : Number(row.place),
      createdAt: String(row.created_at),
      swimmerName: swimmer
        ? `${swimmer.first_name ?? ""} ${swimmer.last_name ?? ""}`.trim()
        : "—",
      eventName: event?.name ?? null,
      competitionName: competition?.name ?? null,
    };
  });
}
