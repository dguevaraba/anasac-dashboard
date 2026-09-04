"use client";

import { useEffect, useId } from "react";
import { Calculator, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCrc } from "@/lib/mock/analytics";
import { calcularIva, IVA_RATE, montoTotalPago } from "@/lib/pagos/iva";

type FilaIva = {
  amount: number;
  status: string;
};

export function ModalIvaPagos({
  abierto,
  onClose,
  filas,
}: {
  abierto: boolean;
  onClose: () => void;
  filas: FilaIva[];
}) {
  const tituloId = useId();

  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onClose]);

  if (!abierto) return null;

  const base = filas.reduce((s, p) => s + p.amount, 0);
  const iva = filas.reduce((s, p) => s + calcularIva(p.amount), 0);
  const total = filas.reduce((s, p) => s + montoTotalPago(p), 0);
  const cobrado = filas
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + montoTotalPago(p), 0);
  const pct = Math.round(IVA_RATE * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--anasac-mist)] text-[var(--anasac-teal)]">
              <Calculator className="h-5 w-5" />
            </div>
            <div>
              <h2
                id={tituloId}
                className="text-base font-semibold text-[var(--anasac-navy)]"
              >
                Cálculo de IVA ({pct}%)
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Sobre {filas.length} cuota{filas.length === 1 ? "" : "s"} del
                filtro actual
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <dl className="space-y-3 rounded-xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)]/40 p-4">
          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-slate-500">Cuotas (base)</dt>
            <dd className="font-semibold text-[var(--anasac-navy)]">
              {formatCrc(base)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-slate-500">IVA ({pct}%)</dt>
            <dd className="font-semibold text-[var(--anasac-navy)]">
              {formatCrc(iva)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-[var(--anasac-border)] pt-3 text-sm">
            <dt className="font-medium text-[var(--anasac-navy)]">Total</dt>
            <dd className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-teal)]">
              {formatCrc(total)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-slate-500">Cobrado (base + IVA)</dt>
            <dd className="font-medium text-[var(--anasac-navy)]">
              {formatCrc(cobrado)}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex justify-end">
          <Button type="button" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
