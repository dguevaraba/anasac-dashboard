import type { UserProfile } from "@anasac/shared";
import { getSupabase } from "@/supabase/client";
import { mapProfile } from "@/supabase/profile";

export async function fetchUsers(): Promise<UserProfile[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, is_active, avatar_url, created_at, updated_at, roles!role_id(code)",
    )
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => mapProfile(row as Parameters<typeof mapProfile>[0]));
}
