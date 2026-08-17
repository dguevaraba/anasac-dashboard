import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { mapProfile } from "@/lib/auth/profile";
import { UsersManager } from "./users-manager";
import type { UserProfile } from "@/types";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-sm text-slate-500">
        Falta configurar Supabase para gestionar usuarios.
      </p>
    );
  }

  const supabase = await createServerSupabase();

  const { data: profileRows } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, is_active, avatar_url, created_at, updated_at, roles!role_id(code)",
    )
    .order("created_at", { ascending: true });

  const users: UserProfile[] = (profileRows ?? []).map((row) =>
    mapProfile(
      row as Parameters<typeof mapProfile>[0],
    ),
  );

  const { data: invitations } = await supabase
    .from("invitations")
    .select(
      "id, token, invited_email, full_name, expires_at, accepted_at, created_at, roles!role_id(code, name)",
    )
    .order("created_at", { ascending: false });

  return (
    <UsersManager users={users} invitations={invitations ?? []} />
  );
}
