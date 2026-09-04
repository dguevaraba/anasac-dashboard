import type { SupabaseClient } from "@supabase/supabase-js";

/** Org inicial ANASAC (migración 023). */
export const ANASAC_ORGANIZATION_ID =
  "a0000001-0000-4000-8000-000000000001";

/** Org activa del perfil, o ANASAC si aún no hay. */
export async function resolveOrganizationId(
  supabase: SupabaseClient,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from("profiles")
    .select("active_organization_id")
    .eq("id", userId)
    .maybeSingle();

  return (
    (data?.active_organization_id as string | null | undefined) ??
    ANASAC_ORGANIZATION_ID
  );
}
