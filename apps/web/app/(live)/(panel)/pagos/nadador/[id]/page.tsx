import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { fetchProfileById } from "@/lib/auth/profile";
import { hasPermission } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { PagoItem } from "../../gestor-pagos";
import {
  VistaPagosNadador,
  type NadadorPagosInfo,
} from "./vista-pagos-nadador";

export const dynamic = "force-dynamic";

export default async function PaginaPagosNadador({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver la cuenta del nadador."
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

  const [{ data: swimmer }, { data: filasPagos }] = await Promise.all([
    supabase
      .from("swimmers")
      .select("id, first_name, last_name, training_group, status, payment_day")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("payments")
      .select(
        "id, swimmer_id, concept, amount_crc, tax_crc, due_date, paid_at, status, period, invoice_url, receipt_number, payment_method, bank",
      )
      .eq("swimmer_id", id)
      .order("period", { ascending: false }),
  ]);

  if (!swimmer) {
    notFound();
  }

  const nadador: NadadorPagosInfo = {
    id: swimmer.id,
    nombre: swimmer.first_name,
    apellido: swimmer.last_name,
    grupo: swimmer.training_group,
    estado: swimmer.status,
    diaPago: swimmer.payment_day ?? null,
  };

  const nombreCompleto =
    `${swimmer.first_name} ${swimmer.last_name}`.trim() || "—";

  const pagos: PagoItem[] = (filasPagos ?? []).map((row) => ({
    id: row.id as string,
    swimmerId: row.swimmer_id as string,
    nadador: nombreCompleto,
    grupo: swimmer.training_group,
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
  }));

  return <VistaPagosNadador nadador={nadador} pagos={pagos} />;
}
