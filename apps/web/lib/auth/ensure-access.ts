import type { User } from "@supabase/supabase-js";
import { createServiceSupabase } from "@/lib/supabase/admin";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { displayNameFromAuthUser, fetchProfileById } from "@/lib/auth/profile";
import { ANASAC_ORGANIZATION_ID } from "@/lib/organizations/constants";
import type { UserProfile } from "@/types";

type AccessResult =
  | { status: "ok"; profile: UserProfile }
  | { status: "inactive"; profile: UserProfile }
  | { status: "no_access"; reason: string };

export async function ensureAccessAfterLogin(params: {
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createServerSupabase>>;
  user: User;
  inviteToken?: string | null;
}): Promise<AccessResult> {
  const { supabase, user, inviteToken } = params;

  if (inviteToken) {
    const existing = await fetchProfileById(supabase, user.id);
    if (existing) {
      if (!existing.isActive) {
        return { status: "inactive", profile: existing };
      }
      return { status: "ok", profile: existing };
    }

    const { error } = await supabase.rpc("accept_invitation", {
      invite_token: inviteToken,
    });
    if (error) {
      return { status: "no_access", reason: error.message };
    }
  }

  let profile = await fetchProfileById(supabase, user.id);
  if (!profile) {
    profile = await maybeBootstrapAdmin(user);
  }

  if (!profile) {
    return {
      status: "no_access",
      reason:
        "Esta cuenta no tiene acceso. Pedí una invitación.",
    };
  }

  if (!profile.isActive) {
    return { status: "inactive", profile };
  }

  return { status: "ok", profile };
}

async function maybeBootstrapAdmin(user: User): Promise<UserProfile | null> {
  const expected = getSupabaseEnv().bootstrapAdminEmail;
  const email = (user.email ?? "").toLowerCase().trim();
  if (!expected || !email || email !== expected) return null;

  const admin = createServiceSupabase();
  const { data: adminRole, error: roleError } = await admin
    .from("roles")
    .select("id")
    .eq("code", "administrador")
    .single();

  if (roleError || !adminRole) return null;

  const { count, error: countError } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role_id", adminRole.id);

  if (countError || (count ?? 0) > 0) return null;

  const { error: insertError } = await admin.from("profiles").insert({
    id: user.id,
    email: user.email,
    full_name: displayNameFromAuthUser(user),
    role_id: adminRole.id,
    is_active: true,
    active_organization_id: ANASAC_ORGANIZATION_ID,
    avatar_url:
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null,
  });

  if (insertError) return null;

  await admin.from("organization_members").insert({
    organization_id: ANASAC_ORGANIZATION_ID,
    profile_id: user.id,
  });

  return fetchProfileById(admin, user.id);
}

export function safeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("://")) {
    return "/dashboard";
  }
  return next;
}

export function inviteTokenFromNext(next: string) {
  const match = next.match(/^\/invitar\/([^/?#]+)/);
  return match?.[1] ?? null;
}
