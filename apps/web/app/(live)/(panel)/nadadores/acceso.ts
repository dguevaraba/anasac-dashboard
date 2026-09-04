import { fetchProfileById } from "@/lib/auth/profile";
import { createServerSupabase } from "@/lib/supabase/server";
import type { Role } from "@/types";

export function puedeVerDatosSensiblesNadador(role: Role | null | undefined) {
  return role === "administrador" || role === "contador";
}

export async function rolActualNadadores() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, role: null as Role | null };
  const profile = await fetchProfileById(supabase, user.id);
  return { supabase, role: profile?.role ?? null };
}

/** Literal fijo para el client tipado de Supabase. */
export const SELECT_NADADOR =
  "id, first_name, last_name, document_id, birth_date, gender, email, phone, guardian_phone, blood_type, photo_url, join_date, payment_day, status, category_id, coach_id, training_group, created_at, categories(name), coaches(full_name)" as const;
