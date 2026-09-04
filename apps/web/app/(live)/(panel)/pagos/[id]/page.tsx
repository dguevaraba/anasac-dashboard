import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { fetchProfileById } from "@/lib/auth/profile";
import { hasPermission } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";
import type { PagoItem } from "../gestor-pagos";
import { FichaPago } from "./ficha-pago";

export const dynamic = "force-dynamic";

export default async function PaginaFichaPago({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver el detalle del pago."
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

  const { data: row } = await supabase
    .from("payments")
    .select(
      "id, swimmer_id, concept, amount_crc, due_date, paid_at, status, period, invoice_url, swimmers(first_name, last_name, training_group)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!row) {
    notFound();
  }

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

  const pago: PagoItem = {
    id: row.id as string,
    swimmerId: row.swimmer_id as string,
    nadador: swimmer
      ? `${swimmer.first_name ?? ""} ${swimmer.last_name ?? ""}`.trim()
      : "—",
    grupo: swimmer?.training_group ?? null,
    concept: row.concept as string,
    amount: Number(row.amount_crc) || 0,
    dueDate: String(row.due_date).slice(0, 10),
    paidAt: row.paid_at ? String(row.paid_at).slice(0, 10) : null,
    status: row.status as PagoItem["status"],
    period: row.period as string,
    invoiceUrl: (row.invoice_url as string | null) ?? null,
  };

  return <FichaPago pago={pago} />;
}
