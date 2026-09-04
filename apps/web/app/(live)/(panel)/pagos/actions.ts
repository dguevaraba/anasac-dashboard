"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { fetchProfileById } from "@/lib/auth/profile";

const ESTADOS = new Set(["pendiente", "pagado", "vencido", "parcial"]);
const TIPOS_FACTURA = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);
const TAMANO_MAX_FACTURA = 10 * 1024 * 1024;
const BUCKET_FACTURAS = "payment-invoices";

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabase>>;

async function exigirPersonalPagos() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { supabase, error: "No autenticado" as const };
  }
  const profile = await fetchProfileById(supabase, user.id);
  if (
    !profile ||
    (profile.role !== "administrador" && profile.role !== "contador")
  ) {
    return {
      supabase,
      error: "No autorizado." as const,
    };
  }
  return { supabase, error: null };
}

function extensionFactura(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "application/pdf") return "pdf";
  return "bin";
}

function obtenerArchivoFactura(formData: FormData) {
  const value = formData.get("invoice");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

async function subirFactura(
  supabase: SupabaseClient,
  pagoId: string,
  file: File,
) {
  if (!TIPOS_FACTURA.has(file.type)) {
    return { error: "La factura debe ser JPG, PNG, WEBP o PDF." as const };
  }
  if (file.size > TAMANO_MAX_FACTURA) {
    return { error: "La factura no puede superar 10 MB." as const };
  }

  const path = `${pagoId}/factura.${extensionFactura(file.type)}`;
  const { error } = await supabase.storage
    .from(BUCKET_FACTURAS)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: "3600",
    });

  if (error) {
    return { error: error.message };
  }

  const { data } = supabase.storage.from(BUCKET_FACTURAS).getPublicUrl(path);
  return { url: `${data.publicUrl}?v=${Date.now()}` };
}

export async function crearPagoAction(formData: FormData) {
  const { supabase, error } = await exigirPersonalPagos();
  if (error) return { ok: false as const, error };

  const swimmerId = String(formData.get("swimmerId") ?? "").trim();
  const period = String(formData.get("period") ?? "").trim();
  const conceptRaw = String(formData.get("concept") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const status = String(formData.get("status") ?? "pendiente").trim();
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();

  if (!swimmerId) {
    return { ok: false as const, error: "Seleccioná un nadador." };
  }
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { ok: false as const, error: "Periodo no válido (YYYY-MM)." };
  }
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
    return {
      ok: false as const,
      error: "El monto debe ser un entero en colones (≥ 0).",
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { ok: false as const, error: "Fecha de vencimiento no válida." };
  }
  if (!ESTADOS.has(status)) {
    return { ok: false as const, error: "Estado no válido." };
  }

  const paidAt =
    paidAtRaw && /^\d{4}-\d{2}-\d{2}$/.test(paidAtRaw) ? paidAtRaw : null;
  if (status === "pagado" && !paidAt) {
    return {
      ok: false as const,
      error: "Si el estado es pagado, indicá la fecha de pago.",
    };
  }

  const concept = conceptRaw || `Mensualidad ${period}`;
  const notes = notesRaw || null;
  const pagoId = randomUUID();

  let invoiceUrl: string | null = null;
  const factura = obtenerArchivoFactura(formData);
  if (factura) {
    const subida = await subirFactura(supabase, pagoId, factura);
    if ("error" in subida && subida.error) {
      return { ok: false as const, error: subida.error };
    }
    if ("url" in subida && subida.url) {
      invoiceUrl = subida.url;
    }
  }

  const { error: insertError } = await supabase.from("payments").insert({
    id: pagoId,
    swimmer_id: swimmerId,
    concept,
    amount_crc: amount,
    due_date: dueDate,
    paid_at: paidAt,
    status,
    period,
    notes,
    invoice_url: invoiceUrl,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      return {
        ok: false as const,
        error: "Ese nadador ya tiene un pago para ese periodo.",
      };
    }
    return { ok: false as const, error: insertError.message };
  }

  revalidatePath("/pagos");
  revalidatePath(`/pagos/${pagoId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function actualizarPagoAction(formData: FormData) {
  const { supabase, error } = await exigirPersonalPagos();
  if (error) return { ok: false as const, error };

  const id = String(formData.get("id") ?? "").trim();
  const period = String(formData.get("period") ?? "").trim();
  const conceptRaw = String(formData.get("concept") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const status = String(formData.get("status") ?? "pendiente").trim();
  const paidAtRaw = String(formData.get("paidAt") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const quitarFactura = String(formData.get("removeInvoice") ?? "") === "on";

  if (!id) {
    return { ok: false as const, error: "Pago no válido." };
  }
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { ok: false as const, error: "Periodo no válido (YYYY-MM)." };
  }
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount < 0 || !Number.isInteger(amount)) {
    return {
      ok: false as const,
      error: "El monto debe ser un entero en colones (≥ 0).",
    };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    return { ok: false as const, error: "Fecha de vencimiento no válida." };
  }
  if (!ESTADOS.has(status)) {
    return { ok: false as const, error: "Estado no válido." };
  }

  const paidAt =
    paidAtRaw && /^\d{4}-\d{2}-\d{2}$/.test(paidAtRaw) ? paidAtRaw : null;
  if (status === "pagado" && !paidAt) {
    return {
      ok: false as const,
      error: "Si el estado es pagado, indicá la fecha de pago.",
    };
  }

  const updatePayload: Record<string, unknown> = {
    concept: conceptRaw || `Mensualidad ${period}`,
    amount_crc: amount,
    due_date: dueDate,
    paid_at: paidAt,
    status,
    period,
    notes: notesRaw || null,
    updated_at: new Date().toISOString(),
  };

  const factura = obtenerArchivoFactura(formData);
  if (factura) {
    const subida = await subirFactura(supabase, id, factura);
    if ("error" in subida && subida.error) {
      return { ok: false as const, error: subida.error };
    }
    if ("url" in subida && subida.url) {
      updatePayload.invoice_url = subida.url;
    }
  } else if (quitarFactura) {
    updatePayload.invoice_url = null;
    await supabase.storage.from(BUCKET_FACTURAS).remove([
      `${id}/factura.jpg`,
      `${id}/factura.png`,
      `${id}/factura.webp`,
      `${id}/factura.pdf`,
    ]);
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update(updatePayload)
    .eq("id", id);

  if (updateError) {
    if (updateError.code === "23505") {
      return {
        ok: false as const,
        error: "Ese nadador ya tiene un pago para ese periodo.",
      };
    }
    return { ok: false as const, error: updateError.message };
  }

  revalidatePath("/pagos");
  revalidatePath(`/pagos/${id}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}
