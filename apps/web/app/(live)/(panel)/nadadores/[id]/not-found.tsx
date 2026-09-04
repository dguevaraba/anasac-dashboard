import Link from "next/link";
import { EmptyState } from "@/components/layout/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NadadorNoEncontrado() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="Nadador no encontrado"
        description="Puede que lo hayan eliminado o que el enlace no sea válido."
      />
      <div className="flex justify-center">
        <Link
          href="/nadadores"
          className={cn(buttonVariants({ variant: "default" }))}
        >
          Volver a nadadores
        </Link>
      </div>
    </div>
  );
}
