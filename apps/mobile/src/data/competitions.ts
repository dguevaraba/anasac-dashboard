import type { Competition } from "@anasac/shared";
import { getSupabase } from "@/supabase/client";

export async function fetchCompetitions(): Promise<Competition[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("competitions")
    .select(
      "id, name, location, start_date, end_date, status, description, pool_length, created_at, updated_at",
    )
    .order("start_date", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    location: (row.location as string) ?? "",
    startDate: String(row.start_date).slice(0, 10),
    endDate: String(row.end_date).slice(0, 10),
    status: row.status as Competition["status"],
    description: (row.description as string | null) ?? undefined,
    poolLength: (row.pool_length as Competition["poolLength"]) ?? "50m",
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }));
}
