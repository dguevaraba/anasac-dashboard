import Link from "next/link";
import { EmptyState } from "@/components/layout/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PagoNoEncontrado() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Página no encontrada"
        description="Puede que el enlace no sea válido o que la página ya no exista."
      />
      <div className="flex justify-center">
        <Link
          href="/dashboard"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
