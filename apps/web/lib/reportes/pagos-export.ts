import { formatCrc } from "@/lib/mock/analytics";
import { calcularIva, montoTotalPago } from "@/lib/pagos/iva";

export type FilaReportePago = {
  id: string;
  swimmerId: string;
  nadador: string;
  grupo: string | null;
  concept: string;
  amount: number;
  tax?: number;
  dueDate: string;
  paidAt: string | null;
  status: string;
  period: string;
  receiptNumber?: string | null;
  paymentMethod?: string | null;
  bank?: string | null;
};

export type FiltrosReportePagos = {
  mesDesde: string;
  mesHasta: string;
  grupo: string;
  nadadorId: string;
  estado: string;
};

export function filtrarPagosReporte(
  pagos: FilaReportePago[],
  filtros: FiltrosReportePagos,
) {
  const desde =
    filtros.mesDesde <= filtros.mesHasta
      ? filtros.mesDesde
      : filtros.mesHasta;
  const hasta =
    filtros.mesDesde <= filtros.mesHasta
      ? filtros.mesHasta
      : filtros.mesDesde;

  return [...pagos]
    .filter((p) => p.period >= desde && p.period <= hasta)
    .filter((p) => filtros.grupo === "todos" || p.grupo === filtros.grupo)
    .filter(
      (p) =>
        filtros.nadadorId === "todos" || p.swimmerId === filtros.nadadorId,
    )
    .filter((p) => filtros.estado === "todos" || p.status === filtros.estado)
    .sort((a, b) => {
      const byPeriod = b.period.localeCompare(a.period);
      if (byPeriod !== 0) return byPeriod;
      const byGrupo = (a.grupo ?? "").localeCompare(b.grupo ?? "", "es");
      if (byGrupo !== 0) return byGrupo;
      return a.nadador.localeCompare(b.nadador, "es");
    });
}

export function resumenPagos(filas: FilaReportePago[]) {
  const cobrado = filas
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + montoTotalPago(p), 0);
  const pendiente = filas
    .filter((p) => p.status !== "pagado")
    .reduce((s, p) => s + montoTotalPago(p), 0);
  const base = filas.reduce((s, p) => s + p.amount, 0);
  const iva = filas.reduce((s, p) => s + calcularIva(p.amount), 0);
  return {
    cuotas: filas.length,
    cobrado,
    pendiente,
    total: cobrado + pendiente,
    base,
    iva,
  };
}

function slugFiltros(filtros: FiltrosReportePagos) {
  const partes = [
    filtros.mesDesde === filtros.mesHasta
      ? filtros.mesDesde
      : `${filtros.mesDesde}_${filtros.mesHasta}`,
  ];
  if (filtros.grupo !== "todos") {
    partes.push(filtros.grupo.replace(/\s+/g, "-").toLowerCase());
  }
  if (filtros.estado !== "todos") partes.push(filtros.estado);
  return partes.join("_");
}

function filasTabla(filas: FilaReportePago[]) {
  return filas.map((p) => [
    p.period,
    p.nadador,
    p.grupo ?? "—",
    p.concept,
    p.amount,
    calcularIva(p.amount),
    montoTotalPago(p),
    p.status,
    p.dueDate,
    p.paidAt ?? "—",
    p.receiptNumber ?? "—",
    p.paymentMethod ?? "—",
    p.bank ?? "—",
  ]);
}

const HEADERS = [
  "Periodo",
  "Nadador",
  "Grupo",
  "Concepto",
  "Cuota (CRC)",
  "IVA (CRC)",
  "Total (CRC)",
  "Estado",
  "Vence",
  "Pagado",
  "Comprobante",
  "Método",
  "Banco",
] as const;

export async function descargarExcelPagos(
  filas: FilaReportePago[],
  filtros: FiltrosReportePagos,
) {
  const XLSX = await import("xlsx");
  const resumen = resumenPagos(filas);
  const sheetData = [
    ["ANASAC — Reporte de pagos"],
    [
      "Rango",
      filtros.mesDesde === filtros.mesHasta
        ? filtros.mesDesde
        : `${filtros.mesDesde} → ${filtros.mesHasta}`,
    ],
    ["Grupo", filtros.grupo === "todos" ? "Todos" : filtros.grupo],
    ["Estado", filtros.estado === "todos" ? "Todos" : filtros.estado],
    [],
    ["Cuotas", resumen.cuotas],
    ["Base (cuotas)", resumen.base],
    ["IVA", resumen.iva],
    ["Cobrado", resumen.cobrado],
    ["Pendiente", resumen.pendiente],
    ["Total esperado", resumen.total],
    [],
    [...HEADERS],
    ...filasTabla(filas),
  ];

  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(sheetData);
  sheet["!cols"] = [
    { wch: 10 },
    { wch: 28 },
    { wch: 16 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 14 },
    { wch: 10 },
    { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(workbook, sheet, "Pagos");
  XLSX.writeFile(workbook, `anasac-pagos_${slugFiltros(filtros)}.xlsx`);
}

export async function descargarPdfPagos(
  filas: FilaReportePago[],
  filtros: FiltrosReportePagos,
) {
  const { default: JsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");
  const resumen = resumenPagos(filas);

  const doc = new JsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const rango =
    filtros.mesDesde === filtros.mesHasta
      ? filtros.mesDesde
      : `${filtros.mesDesde} → ${filtros.mesHasta}`;

  doc.setFontSize(16);
  doc.text("ANASAC — Reporte de pagos", 14, 16);
  doc.setFontSize(10);
  doc.text(`Rango: ${rango}`, 14, 24);
  doc.text(
    `Grupo: ${filtros.grupo === "todos" ? "Todos" : filtros.grupo}`,
    14,
    30,
  );
  doc.text(
    `Estado: ${filtros.estado === "todos" ? "Todos" : filtros.estado}`,
    14,
    36,
  );
  doc.text(
    `Cuotas: ${resumen.cuotas}  ·  Base: ${formatCrc(resumen.base)}  ·  IVA: ${formatCrc(resumen.iva)}  ·  Cobrado: ${formatCrc(resumen.cobrado)}  ·  Esperado: ${formatCrc(resumen.total)}`,
    14,
    42,
  );

  autoTable(doc, {
    startY: 48,
    head: [[...HEADERS]],
    body: filas.map((p) => [
      p.period,
      p.nadador,
      p.grupo ?? "—",
      p.concept,
      formatCrc(p.amount),
      formatCrc(calcularIva(p.amount)),
      formatCrc(montoTotalPago(p)),
      p.status,
      p.dueDate,
      p.paidAt ?? "—",
      p.receiptNumber ?? "—",
      p.paymentMethod ?? "—",
      p.bank ?? "—",
    ]),
    styles: { fontSize: 7, cellPadding: 1.5 },
    headStyles: { fillColor: [15, 44, 61] },
    alternateRowStyles: { fillColor: [245, 248, 250] },
  });

  doc.save(`anasac-pagos_${slugFiltros(filtros)}.pdf`);
}
