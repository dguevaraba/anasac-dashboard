import type { SupabaseClient } from "@supabase/supabase-js";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import type { Role, UserProfile } from "@/types";

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  roles: { code: string } | { code: string }[] | null;
};

function asRole(code: string | undefined): Role {
  if (code && code in ROLE_LABELS) return code as Role;
  return "nadador";
}

function roleCodeFromJoin(roles: ProfileRow["roles"]) {
  if (!roles) return undefined;
  return Array.isArray(roles) ? roles[0]?.code : roles.code;
}

export function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    role: asRole(roleCodeFromJoin(row.roles)),
    avatarUrl: row.avatar_url ?? undefined,
    phone: row.phone ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isActive: row.is_active,
  };
}

export async function fetchProfileById(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, is_active, avatar_url, created_at, updated_at, roles!role_id(code)",
    )
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}

export function displayNameFromAuthUser(user: {
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  if (fromMeta.trim()) return fromMeta.trim();
  const email = user.email ?? "";
  return email.split("@")[0] || "Administrador";
}
