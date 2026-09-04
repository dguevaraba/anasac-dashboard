import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { fetchProfileById } from "@/lib/auth/profile";
import { hasPermission } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import {
  GestorPagos,
  type NadadorOpcion,
  type PagoItem,
} from "./gestor-pagos";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver cobros reales."
      />
    );
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const profile = await fetchProfileById(supabase, user.id);
  if (!profile || !hasPermission(profile.role, "payments:view")) {
    notFound();
  }

  const [{ data: filasPagos }, { data: filasNadadores }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, swimmer_id, concept, amount_crc, tax_crc, due_date, paid_at, status, period, invoice_url, receipt_number, payment_method, bank, swimmers(first_name, last_name, training_group)",
      )
      .order("period", { ascending: true }),
    supabase
      .from("swimmers")
      .select("id, first_name, last_name")
      .order("last_name", { ascending: true }),
  ]);

  const pagos: PagoItem[] = (filasPagos ?? []).map((row) => {
    const rel = row.swimmers as
      | {
          first_name?: string;
          last_name?: string;
          training_group?: string | null;
        }
      | {
          first_name?: string;
          last_name?: string;
          training_group?: string | null;
        }[]
      | null;
    const swimmer = Array.isArray(rel) ? rel[0] : rel;
    return {
      id: row.id as string,
      swimmerId: row.swimmer_id as string,
      nadador: swimmer
        ? `${swimmer.first_name ?? ""} ${swimmer.last_name ?? ""}`.trim()
        : "—",
      grupo: swimmer?.training_group ?? null,
      concept: row.concept as string,
      amount: Number(row.amount_crc) || 0,
      tax: Number(row.tax_crc) || 0,
      dueDate: String(row.due_date).slice(0, 10),
      paidAt: row.paid_at ? String(row.paid_at).slice(0, 10) : null,
      status: row.status as PagoItem["status"],
      period: row.period as string,
      invoiceUrl: (row.invoice_url as string | null) ?? null,
      receiptNumber: (row.receipt_number as string | null) ?? null,
      paymentMethod: (row.payment_method as string | null) ?? null,
      bank: (row.bank as string | null) ?? null,
    };
  });

  const nadadores: NadadorOpcion[] = (filasNadadores ?? []).map((n) => ({
    id: n.id,
    etiqueta: `${n.first_name} ${n.last_name}`.trim(),
  }));

  return <GestorPagos pagos={pagos} nadadores={nadadores} />;
}
