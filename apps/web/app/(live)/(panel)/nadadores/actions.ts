"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchProfileById } from "@/lib/auth/profile";

const GENEROS = new Set(["masculino", "femenino", "otro"]);
const ESTADOS = new Set(["activo", "inactivo", "moroso", "becado"]);
const TIPOS_SANGRE = new Set(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]);
const TIPOS_FOTO = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const TAMANO_MAX_FOTO = 5 * 1024 * 1024;
const BUCKET_FOTOS = "swimmer-photos";

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabase>>;

async function exigirPersonalNadadores() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, error: "No autenticado" as const, profile: null };
  }
  const profile = await fetchProfileById(supabase, user.id);
  if (
    !profile ||
    (profile.role !== "administrador" && profile.role !== "contador")
  ) {
    return {
      supabase,
      error: "Solo administrador o contador pueden gestionar nadadores" as const,
      profile: null,
    };
  }
  return { supabase, error: null, profile };
}

function vacioANulo(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function extensionFoto(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

function obtenerArchivoFoto(formData: FormData) {
  const value = formData.get("photo");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

async function subirFotoNadador(
  supabase: SupabaseClient,
  nadadorId: string,
  file: File,
) {
  if (!TIPOS_FOTO.has(file.type)) {
    return { error: "La foto debe ser JPG, PNG, WEBP o GIF." as const };
  }
  if (file.size > TAMANO_MAX_FOTO) {
    return { error: "La foto no puede superar 5 MB." as const };
  }

  const path = `${nadadorId}/perfil.${extensionFoto(file.type)}`;
  const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(path, file, {
    upsert: true,
    contentType: file.type,
    cacheControl: "3600",
  });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET_FOTOS).getPublicUrl(path);
  // cache-bust para que el navegador vea la foto nueva
  const url = `${data.publicUrl}?v=${Date.now()}`;
  return { url };
}

function parsearCamposNadador(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const birthDate = String(formData.get("birthDate") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const status = String(formData.get("status") ?? "activo").trim();
  const documentId = vacioANulo(String(formData.get("documentId") ?? ""));
  const email = vacioANulo(String(formData.get("email") ?? ""));
  const phone = vacioANulo(String(formData.get("phone") ?? ""));
  const guardianPhone = vacioANulo(String(formData.get("guardianPhone") ?? ""));
  const categoryId = vacioANulo(String(formData.get("categoryId") ?? ""));
  const coachId = vacioANulo(String(formData.get("coachId") ?? ""));
  const bloodType = vacioANulo(String(formData.get("bloodType") ?? ""));
  const joinDate = vacioANulo(String(formData.get("joinDate") ?? ""));
  const paymentDayRaw = String(formData.get("paymentDay") ?? "").trim();
  const paymentDay = paymentDayRaw ? Number(paymentDayRaw) : null;

  if (!firstName || !lastName) {
    return { error: "Nombre y apellido son obligatorios." as const };
  }
  if (!birthDate) {
    return { error: "La fecha de nacimiento es obligatoria." as const };
  }
  if (!GENEROS.has(gender)) {
    return { error: "Género no válido." as const };
  }
  if (!ESTADOS.has(status)) {
    return { error: "Estado no válido." as const };
  }
  if (bloodType && !TIPOS_SANGRE.has(bloodType)) {
    return { error: "Tipo de sangre no válido." as const };
  }
  if (
    paymentDay !== null &&
    (!Number.isInteger(paymentDay) || paymentDay < 1 || paymentDay > 31)
  ) {
    return { error: "El día de pago debe ser entre 1 y 31." as const };
  }

  return {
    error: null,
    row: {
      first_name: firstName,
      last_name: lastName,
      birth_date: birthDate,
      gender,
      status,
      document_id: documentId,
      email,
      phone,
      guardian_phone: guardianPhone,
      category_id: categoryId,
      coach_id: coachId,
      blood_type: bloodType,
      join_date: joinDate,
      payment_day: paymentDay,
    },
  };
}

export async function crearNadadorAction(formData: FormData) {
  const { supabase, error } = await exigirPersonalNadadores();
  if (error) return { ok: false as const, error };

  const parsed = parsearCamposNadador(formData);
  if (parsed.error || !parsed.row) {
    return { ok: false as const, error: parsed.error };
  }

  const foto = obtenerArchivoFoto(formData);

  const { data: creado, error: insertError } = await supabase
    .from("swimmers")
    .insert(parsed.row)
    .select("id")
    .single();

  if (insertError || !creado) {
    return { ok: false as const, error: insertError?.message ?? "No se pudo crear." };
  }

  if (foto) {
    const subida = await subirFotoNadador(supabase, creado.id, foto);
    if ("error" in subida && subida.error) {
      return {
        ok: false as const,
        error: `Nadador creado, pero la foto falló: ${subida.error}`,
      };
    }
    if ("url" in subida && subida.url) {
      await supabase
        .from("swimmers")
        .update({ photo_url: subida.url, updated_at: new Date().toISOString() })
        .eq("id", creado.id);
    }
  }

  revalidatePath("/nadadores");
  revalidatePath(`/nadadores/${creado.id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function actualizarNadadorAction(formData: FormData) {
  const { supabase, error } = await exigirPersonalNadadores();
  if (error) return { ok: false as const, error };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false as const, error: "Nadador no válido." };
  }

  const parsed = parsearCamposNadador(formData);
  if (parsed.error || !parsed.row) {
    return { ok: false as const, error: parsed.error };
  }

  const quitarFoto = String(formData.get("removePhoto") ?? "") === "on";
  const foto = obtenerArchivoFoto(formData);
  const updatePayload: Record<string, unknown> = {
    ...parsed.row,
    updated_at: new Date().toISOString(),
  };

  if (foto) {
    const subida = await subirFotoNadador(supabase, id, foto);
    if ("error" in subida && subida.error) {
      return { ok: false as const, error: subida.error };
    }
    if ("url" in subida && subida.url) {
      updatePayload.photo_url = subida.url;
    }
  } else if (quitarFoto) {
    updatePayload.photo_url = null;
    await supabase.storage.from(BUCKET_FOTOS).remove([
      `${id}/perfil.jpg`,
      `${id}/perfil.png`,
      `${id}/perfil.webp`,
      `${id}/perfil.gif`,
    ]);
  }

  const { error: updateError } = await supabase
    .from("swimmers")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  revalidatePath("/nadadores");
  revalidatePath(`/nadadores/${id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function actualizarEstadoNadadorAction(formData: FormData) {
  const { supabase, error } = await exigirPersonalNadadores();
  if (error) return { ok: false as const, error };

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id) {
    return { ok: false as const, error: "Nadador no válido." };
  }
  if (!ESTADOS.has(status)) {
    return { ok: false as const, error: "Estado no válido." };
  }

  const { error: updateError } = await supabase
    .from("swimmers")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (updateError) {
    return { ok: false as const, error: updateError.message };
  }

  revalidatePath("/nadadores");
  revalidatePath(`/nadadores/${id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}
