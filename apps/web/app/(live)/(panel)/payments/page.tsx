import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";

export const dynamic = "force-dynamic";

export default function PaymentsPage() {
  return (
    <div>
      <PageHeader
        title="Pagos"
        description="Cobros, mensualidades y estado de cuentas."
      />
      <EmptyState
        title="No hay cobros registrados"
        description="Cuando se carguen mensualidades e inscripciones, el estado de cuentas va a aparecer acá."
      />
    </div>
  );
}
