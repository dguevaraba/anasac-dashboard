import type { Payment, PaymentStatus } from "@anasac/shared";
import { getSupabase } from "@/supabase/client";
import { resumenMensualidad, type PagoResumenFila } from "@/lib/mensualidad";

export type PaymentListItem = Payment & {
  swimmerName: string;
};

export async function fetchPayments(): Promise<PaymentListItem[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select(
      "id, swimmer_id, concept, amount_crc, due_date, paid_at, status, period, created_at, updated_at, swimmers(first_name, last_name)",
    )
    .order("period", { ascending: false });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => {
    const rel = row.swimmers as
      | { first_name?: string; last_name?: string }
      | { first_name?: string; last_name?: string }[]
      | null;
    const swimmer = Array.isArray(rel) ? rel[0] : rel;
    return {
      id: row.id as string,
      swimmerId: row.swimmer_id as string,
      concept: row.concept as string,
      amountCrc: Number(row.amount_crc) || 0,
      dueDate: String(row.due_date).slice(0, 10),
      paidAt: row.paid_at ? String(row.paid_at).slice(0, 10) : undefined,
      status: row.status as PaymentStatus,
      period: row.period as string,
      createdAt: String(row.created_at),
      updatedAt: String(row.updated_at),
      swimmerName: swimmer
        ? `${swimmer.first_name ?? ""} ${swimmer.last_name ?? ""}`.trim()
        : "—",
    };
  });
}

export async function fetchMensualidadResumen() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("payments")
    .select("amount_crc, status, period");

  if (error) throw new Error(error.message);

  const pagos: PagoResumenFila[] = (data ?? []).map((row) => ({
    amount: Number(row.amount_crc) || 0,
    status: String(row.status),
    period: String(row.period),
  }));

  return {
    pagosCount: pagos.length,
    pendingCount: pagos.filter((p) => p.status !== "pagado").length,
    mensualidad: resumenMensualidad(pagos),
  };
}
