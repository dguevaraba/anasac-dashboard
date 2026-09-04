"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FileSpreadsheet, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GRUPOS_NADADOR } from "@/lib/nadadores/grupos";
import {
  descargarExcelPagos,
  descargarPdfPagos,
  filtrarPagosReporte,
  type FilaReportePago,
  type FiltrosReportePagos,
} from "@/lib/reportes/pagos-export";

type FormatoExport = "excel" | "pdf";

export function ModalExportarPagos({
  abierto,
  formato,
  onClose,
  pagos,
  filtrosBase,
  etiquetaNadador,
}: {
  abierto: boolean;
  formato: FormatoExport | null;
  onClose: () => void;
  pagos: FilaReportePago[];
  filtrosBase: Omit<FiltrosReportePagos, "grupo">;
  etiquetaNadador?: string;
}) {
  const tituloId = useId();
  const [grupo, setGrupo] = useState("todos");
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) {
      setGrupo("todos");
      setError(null);
      setExportando(false);
    }
  }, [abierto, formato]);

  useEffect(() => {
    if (!abierto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onClose]);

  const filtros = useMemo(
    () => ({ ...filtrosBase, grupo }),
    [filtrosBase, grupo],
  );

  const filas = useMemo(
    () => filtrarPagosReporte(pagos, filtros),
    [pagos, filtros],
  );

  if (!abierto || !formato) return null;

  const esExcel = formato === "excel";

  async function confirmar() {
    setError(null);
    setExportando(true);
    try {
      if (esExcel) {
        await descargarExcelPagos(filas, filtros);
      } else {
        await descargarPdfPagos(filas, filtros);
      }
      onClose();
    } catch {
      setError(
        esExcel
          ? "No se pudo generar el Excel."
          : "No se pudo generar el PDF.",
      );
    } finally {
      setExportando(false);
    }
  }

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
        className="relative z-[1] w-full max-w-md rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_16px_48px_rgba(15,44,61,0.18)]"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id={tituloId}
              className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-navy)]"
            >
              Exportar {esExcel ? "Excel" : "PDF"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Usa el rango, nadador y estado del filtro principal. Podés limitar
              por grupo acá.
            </p>
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

        <div className="space-y-3">
          <div className="rounded-xl bg-[var(--anasac-mist)]/70 px-3 py-2 text-xs text-slate-600">
            <p>
              Periodo:{" "}
              <span className="font-medium text-[var(--anasac-navy)]">
                {filtrosBase.mesDesde === filtrosBase.mesHasta
                  ? filtrosBase.mesDesde
                  : `${filtrosBase.mesDesde} → ${filtrosBase.mesHasta}`}
              </span>
            </p>
            <p className="mt-0.5">
              Nadador:{" "}
              <span className="font-medium text-[var(--anasac-navy)]">
                {filtrosBase.nadadorId === "todos"
                  ? "Todos"
                  : (etiquetaNadador ?? "Filtrado")}
              </span>
              {" · "}
              Estado:{" "}
              <span className="font-medium text-[var(--anasac-navy)]">
                {filtrosBase.estado === "todos" ? "Todos" : filtrosBase.estado}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="exportGrupo">Grupo</Label>
            <Select
              id="exportGrupo"
              value={grupo}
              onChange={(e) => setGrupo(e.target.value)}
            >
              <option value="todos">Todos los grupos</option>
              {GRUPOS_NADADOR.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </Select>
          </div>

          <p className="text-sm text-slate-500">
            {filas.length === 0
              ? "No hay cuotas con esos parámetros."
              : `${filas.length} cuota${filas.length === 1 ? "" : "s"} se van a exportar.`}
          </p>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={filas.length === 0 || exportando}
              onClick={confirmar}
            >
              {esExcel ? (
                <FileSpreadsheet className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              {exportando ? "Generando..." : `Descargar ${esExcel ? "Excel" : "PDF"}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
