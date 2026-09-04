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

export const SELECT_NADADOR_BASE =
  "id, first_name, last_name, birth_date, gender, blood_type, photo_url, status, category_id, coach_id, created_at, categories(name), coaches(full_name)";

export const SELECT_NADADOR_SENSIBLE =
  "document_id, email, phone, guardian_phone, join_date, payment_day";

export function selectNadador(incluyeSensibles: boolean) {
  return incluyeSensibles
    ? `${SELECT_NADADOR_BASE}, ${SELECT_NADADOR_SENSIBLE}`
    : SELECT_NADADOR_BASE;
}
