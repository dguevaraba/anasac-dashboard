import { EmptyState } from "@/components/layout/empty-state";
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
  const [{ data: filasPagos }, { data: filasNadadores }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, swimmer_id, concept, amount_crc, due_date, paid_at, status, period, swimmers(first_name, last_name)",
      )
      .order("period", { ascending: true }),
    supabase
      .from("swimmers")
      .select("id, first_name, last_name")
      .order("last_name", { ascending: true }),
  ]);

  const pagos: PagoItem[] = (filasPagos ?? []).map((row) => {
    const rel = row.swimmers as
      | { first_name?: string; last_name?: string }
      | { first_name?: string; last_name?: string }[]
      | null;
    const swimmer = Array.isArray(rel) ? rel[0] : rel;
    return {
      id: row.id as string,
      swimmerId: row.swimmer_id as string,
      nadador: swimmer
        ? `${swimmer.first_name ?? ""} ${swimmer.last_name ?? ""}`.trim()
        : "—",
      concept: row.concept as string,
      amount: Number(row.amount_crc) || 0,
      dueDate: String(row.due_date).slice(0, 10),
      paidAt: row.paid_at ? String(row.paid_at).slice(0, 10) : null,
      status: row.status as PagoItem["status"],
      period: row.period as string,
    };
  });

  const nadadores: NadadorOpcion[] = (filasNadadores ?? []).map((n) => ({
    id: n.id,
    etiqueta: `${n.first_name} ${n.last_name}`.trim(),
  }));

  return <GestorPagos pagos={pagos} nadadores={nadadores} />;
}
