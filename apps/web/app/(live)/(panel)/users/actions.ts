"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchProfileById } from "@/lib/auth/profile";
import { ALL_ROLES } from "@/lib/auth/permissions";
import { resolveOrganizationId } from "@/lib/organizations/constants";
import type { Role } from "@/types";

async function requireAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, error: "No autenticado" as const, profile: null };
  }
  const profile = await fetchProfileById(supabase, user.id);
  if (!profile || profile.role !== "administrador") {
    return {
      supabase,
      error: "Solo el administrador puede gestionar usuarios" as const,
      profile: null,
    };
  }
  return { supabase, error: null, profile };
}

export async function createInvitationAction(formData: FormData) {
  const { supabase, error, profile } = await requireAdmin();
  if (error || !profile) return { ok: false as const, error };

  const role = String(formData.get("role") ?? "") as Role;
  if (!ALL_ROLES.includes(role)) {
    return { ok: false as const, error: "Rol no válido" };
  }

  const fullName = String(formData.get("fullName") ?? "").trim() || null;
  const invitedEmail = String(formData.get("invitedEmail") ?? "").trim() || null;
  const days = Number(formData.get("days") ?? 14);
  const expiresInDays = Number.isFinite(days) ? Math.min(Math.max(days, 1), 60) : 14;

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("code", role)
    .single();

  if (roleError || !roleRow) {
    return { ok: false as const, error: "No se encontró el rol" };
  }

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const organizationId = await resolveOrganizationId(supabase, profile.id);

  const { error: insertError } = await supabase.from("invitations").insert({
    token,
    role_id: roleRow.id,
    invited_email: invitedEmail,
    full_name: fullName,
    invited_by: profile.id,
    expires_at: expiresAt,
    organization_id: organizationId,
  });

  if (insertError) {
    return { ok: false as const, error: insertError.message };
  }

  revalidatePath("/users");
  return { ok: true as const, token };
}

export async function updateUserAction(formData: FormData) {
  const { supabase, error } = await requireAdmin();
  if (error) return { ok: false as const, error };

  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "") as Role;
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!id || !ALL_ROLES.includes(role)) {
    return { ok: false as const, error: "Datos incompletos" };
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id")
    .eq("code", role)
    .single();

  if (roleError || !roleRow) {
    return { ok: false as const, error: "No se encontró el rol" };
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      role_id: roleRow.id,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  revalidatePath("/users");
  return { ok: true as const };
}
