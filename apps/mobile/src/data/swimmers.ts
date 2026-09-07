import type { Swimmer } from "@anasac/shared";
import { getSupabase } from "@/supabase/client";

export type SwimmerListItem = {
  id: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  status: Swimmer["status"];
  categoryName: string | null;
  coachName: string | null;
  trainingGroup: string | null;
};

type Rel = { name?: string; full_name?: string } | { name?: string; full_name?: string }[] | null;

function textoRelacion(rel: Rel, key: "name" | "full_name" = "name") {
  if (!rel) return null;
  const row = Array.isArray(rel) ? rel[0] : rel;
  return row?.[key] || null;
}

export async function fetchSwimmers(): Promise<SwimmerListItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("swimmers")
    .select(
      "id, first_name, last_name, birth_date, status, training_group, categories(name), coaches(full_name)",
    )
    .order("last_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    birthDate: row.birth_date ? String(row.birth_date).slice(0, 10) : null,
    status: row.status as Swimmer["status"],
    categoryName: textoRelacion(row.categories as Rel),
    coachName: textoRelacion(row.coaches as Rel, "full_name"),
    trainingGroup: (row.training_group as string | null) ?? null,
  }));
}

export async function fetchSwimmerCounts() {
  const supabase = getSupabase();
  const [{ count: total }, { count: active }] = await Promise.all([
    supabase.from("swimmers").select("id", { count: "exact", head: true }),
    supabase
      .from("swimmers")
      .select("id", { count: "exact", head: true })
      .neq("status", "inactivo"),
  ]);
  return { total: total ?? 0, active: active ?? 0 };
}
