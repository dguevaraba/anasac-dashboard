"use client";

import { Eye } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { Button } from "@/components/ui/button";

export function RolePreviewBanner() {
  const { viewAsRole, setViewAsRole, realRole } = useAuth();

  if (!viewAsRole || realRole !== "administrador") return null;

  return (
    <div className="relative z-[2] flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-950 md:px-6">
      <p className="flex items-center gap-2 font-medium">
        <Eye className="h-4 w-4 shrink-0" />
        Vista previa como {ROLE_LABELS[viewAsRole]}. Los menús cambian; tu cuenta sigue siendo administrador.
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-300 bg-white hover:bg-amber-100"
        onClick={() => setViewAsRole(null)}
      >
        Salir
      </Button>
    </div>
  );
}
