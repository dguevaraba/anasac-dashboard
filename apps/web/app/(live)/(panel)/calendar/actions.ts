"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchProfileById } from "@/lib/auth/profile";
import { resolveOrganizationId } from "@/lib/organizations/constants";
import {
  puedeGestionarTipoEvento,
  type TipoEventoCalendario,
} from "@/lib/calendario/permisos";
import type { Role } from "@/types";

const TIPOS = new Set<string>([
  "competencia",
  "entrenamiento",
  "reunion",
  "otro",
]);

async function exigirUsuarioCalendario() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      supabase,
      error: "No autenticado" as const,
      userId: null as string | null,
      role: null as Role | null,
    };
  }
  const profile = await fetchProfileById(supabase, user.id);
  if (!profile) {
    return {
      supabase,
      error: "No autorizado." as const,
      userId: null as string | null,
      role: null as Role | null,
    };
  }
  return {
    supabase,
    error: null,
    userId: user.id as string,
    role: profile.role as Role,
  };
}

function parseCamposEvento(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  const endRaw = String(formData.get("endAt") ?? "").trim();

  if (!title) return { error: "Indicá un título." as const };
  if (!TIPOS.has(type)) return { error: "Tipo de evento no válido." as const };
  if (!startRaw || !endRaw) {
    return { error: "Indicá inicio y fin." as const };
  }

  const startAt = new Date(startRaw);
  const endAt = new Date(endRaw);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { error: "Fechas no válidas." as const };
  }
  if (endAt < startAt) {
    return { error: "El fin debe ser después del inicio." as const };
  }

  return {
    title,
    description,
    location,
    type: type as TipoEventoCalendario,
    startAt,
    endAt,
  };
}

export async function crearEventoCalendarioAction(formData: FormData) {
  const { supabase, error, userId, role } = await exigirUsuarioCalendario();
  if (error || !userId || !role) {
    return { ok: false as const, error: error ?? "No autenticado" };
  }

  const parsed = parseCamposEvento(formData);
  if ("error" in parsed && parsed.error) {
    return { ok: false as const, error: parsed.error };
  }
  const { title, description, location, type, startAt, endAt } = parsed as {
    title: string;
    description: string | null;
    location: string | null;
    type: TipoEventoCalendario;
    startAt: Date;
    endAt: Date;
  };

  if (!puedeGestionarTipoEvento(role, type)) {
    return {
      ok: false as const,
      error: "No tenés permiso para crear este tipo de evento.",
    };
  }

  const organizationId = await resolveOrganizationId(supabase, userId);
  const { error: insertError } = await supabase.from("calendar_events").insert({
    title,
    description,
    location,
    type,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    organization_id: organizationId,
  });

  if (insertError) {
    return { ok: false as const, error: insertError.message };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function actualizarEventoCalendarioAction(formData: FormData) {
  const { supabase, error, role } = await exigirUsuarioCalendario();
  if (error || !role) {
    return { ok: false as const, error: error ?? "No autenticado" };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false as const, error: "Evento no válido." };

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id, type")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { ok: false as const, error: "Evento no encontrado." };
  }
  if (!puedeGestionarTipoEvento(role, String(existing.type))) {
    return {
      ok: false as const,
      error: "No tenés permiso para editar este evento.",
    };
  }

  const parsed = parseCamposEvento(formData);
  if ("error" in parsed && parsed.error) {
    return { ok: false as const, error: parsed.error };
  }
  const { title, description, location, type, startAt, endAt } = parsed as {
    title: string;
    description: string | null;
    location: string | null;
    type: TipoEventoCalendario;
    startAt: Date;
    endAt: Date;
  };

  if (!puedeGestionarTipoEvento(role, type)) {
    return {
      ok: false as const,
      error: "No tenés permiso para cambiar el evento a ese tipo.",
    };
  }

  const { error: updateError } = await supabase
    .from("calendar_events")
    .update({
      title,
      description,
      location,
      type,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function eliminarEventoCalendarioAction(formData: FormData) {
  const { supabase, error, role } = await exigirUsuarioCalendario();
  if (error || !role) {
    return { ok: false as const, error: error ?? "No autenticado" };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { ok: false as const, error: "Evento no válido." };

  const { data: existing } = await supabase
    .from("calendar_events")
    .select("id, type")
    .eq("id", id)
    .maybeSingle();

  if (!existing) {
    return { ok: false as const, error: "Evento no encontrado." };
  }
  if (!puedeGestionarTipoEvento(role, String(existing.type))) {
    return {
      ok: false as const,
      error: "No tenés permiso para eliminar este evento.",
    };
  }

  const { error: deleteError } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { ok: false as const, error: deleteError.message };
  }

  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true as const };
}
