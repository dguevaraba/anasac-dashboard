import { daysUntil } from "@anasac/shared";

const IVA_RATE = 0.13;

export function montoTotalPago(p: { amount: number }) {
  const base = Number.isFinite(p.amount) && p.amount > 0 ? p.amount : 0;
  return base + Math.round(base * IVA_RATE);
}

export type PagoResumenFila = {
  amount: number;
  status: string;
  period: string;
};

const MESES_LARGO = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

function mesActualIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function mesAnteriorIso(desde = new Date()) {
  const d = new Date(desde.getFullYear(), desde.getMonth() - 1, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function periodoWidgetsPagos(pagos: PagoResumenFila[]) {
  const actual = mesActualIso();
  if (pagos.some((p) => p.period === actual)) return actual;
  return mesAnteriorIso();
}

export function resumenMensualidad(pagos: PagoResumenFila[]) {
  const now = new Date();
  const periodCorte = mesActualIso();
  const periodPendientes = periodoWidgetsPagos(pagos);
  const dueDate = `${periodCorte}-15`;
  const pendientes = pagos.filter(
    (p) => p.period === periodPendientes && p.status !== "pagado",
  );
  return {
    dueDate,
    daysRemaining: daysUntil(dueDate),
    pendingAmount: pendientes.reduce((s, p) => s + montoTotalPago(p), 0),
    pendingCount: pendientes.length,
    monthLabel: `${MESES_LARGO[now.getMonth()]} ${now.getFullYear()}`,
  };
}
