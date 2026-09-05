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

const TIPOS_IMAGEN = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const TAMANO_MAX_IMAGEN = 5 * 1024 * 1024;
const BUCKET_IMAGENES = "calendar-event-images";

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabase>>;

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

function extensionImagen(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function obtenerArchivoImagen(formData: FormData) {
  const value = formData.get("image");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

async function subirImagenEvento(
  supabase: SupabaseClient,
  eventId: string,
  file: File,
) {
  if (!TIPOS_IMAGEN.has(file.type)) {
    return { error: "La imagen debe ser JPG, PNG, WEBP o GIF." as const };
  }
  if (file.size > TAMANO_MAX_IMAGEN) {
    return { error: "La imagen no puede superar 5 MB." as const };
  }

  const path = `${eventId}/portada.${extensionImagen(file.type)}`;
  const { error } = await supabase.storage
    .from(BUCKET_IMAGENES)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET_IMAGENES).getPublicUrl(path);
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

function parseCamposEvento(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = String(formData.get("location") ?? "").trim() || null;
  const type = String(formData.get("type") ?? "").trim();
  const startRaw = String(formData.get("startAt") ?? "").trim();
  const endRaw = String(formData.get("endAt") ?? "").trim();
  const clearImage = String(formData.get("clearImage") ?? "") === "1";

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
    clearImage,
  };
}

function revalidateCalendario() {
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
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
  const { data: inserted, error: insertError } = await supabase
    .from("calendar_events")
    .insert({
      title,
      description,
      location,
      type,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      organization_id: organizationId,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return {
      ok: false as const,
      error: insertError?.message ?? "No se pudo crear el evento.",
    };
  }

  const archivo = obtenerArchivoImagen(formData);
  if (archivo) {
    const subida = await subirImagenEvento(
      supabase,
      inserted.id as string,
      archivo,
    );
    if ("error" in subida && subida.error) {
      revalidateCalendario();
      return {
        ok: false as const,
        error: `Evento creado, pero la imagen falló: ${subida.error}`,
      };
    }
    if ("url" in subida && subida.url) {
      await supabase
        .from("calendar_events")
        .update({
          image_url: subida.url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inserted.id);
    }
  }

  revalidateCalendario();
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
    .select("id, type, image_url")
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
  const { title, description, location, type, startAt, endAt, clearImage } =
    parsed as {
      title: string;
      description: string | null;
      location: string | null;
      type: TipoEventoCalendario;
      startAt: Date;
      endAt: Date;
      clearImage: boolean;
    };

  if (!puedeGestionarTipoEvento(role, type)) {
    return {
      ok: false as const,
      error: "No tenés permiso para cambiar el evento a ese tipo.",
    };
  }

  const updatePayload: Record<string, unknown> = {
    title,
    description,
    location,
    type,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    updated_at: new Date().toISOString(),
  };

  const archivo = obtenerArchivoImagen(formData);
  if (archivo) {
    const subida = await subirImagenEvento(supabase, id, archivo);
    if ("error" in subida && subida.error) {
      return { ok: false as const, error: subida.error };
    }
    if ("url" in subida && subida.url) {
      updatePayload.image_url = subida.url;
    }
  } else if (clearImage) {
    updatePayload.image_url = null;
    await supabase.storage.from(BUCKET_IMAGENES).remove([`${id}/portada.jpg`]);
    await supabase.storage.from(BUCKET_IMAGENES).remove([`${id}/portada.png`]);
    await supabase.storage.from(BUCKET_IMAGENES).remove([`${id}/portada.webp`]);
    await supabase.storage.from(BUCKET_IMAGENES).remove([`${id}/portada.gif`]);
  }

  const { error: updateError } = await supabase
    .from("calendar_events")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  revalidateCalendario();
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

  await supabase.storage.from(BUCKET_IMAGENES).remove([
    `${id}/portada.jpg`,
    `${id}/portada.png`,
    `${id}/portada.webp`,
    `${id}/portada.gif`,
  ]);

  const { error: deleteError } = await supabase
    .from("calendar_events")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return { ok: false as const, error: deleteError.message };
  }

  revalidateCalendario();
  return { ok: true as const };
}
