import { getSupabase } from "@/supabase/client";

export type CoachListItem = {
  id: string;
  fullName: string;
  email: string | null;
  specialty: string | null;
  isActive: boolean;
};

export async function fetchCoaches(): Promise<CoachListItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("coaches")
    .select("id, full_name, email, specialty, is_active")
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id as string,
    fullName: row.full_name as string,
    email: (row.email as string | null) ?? null,
    specialty: (row.specialty as string | null) ?? null,
    isActive: Boolean(row.is_active),
  }));
}
