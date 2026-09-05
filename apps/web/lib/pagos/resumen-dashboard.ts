import { daysUntil } from "@/lib/mock/analytics";
import { montoTotalPago } from "@/lib/pagos/iva";

export type PagoResumenFila = {
  amount: number;
  tax?: number;
  status: string;
  period: string;
};

const MESES_CORTO = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

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

function etiquetaPeriodo(period: string) {
  const [y, m] = period.split("-");
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return period;
  return `${MESES_CORTO[idx]} ${y.slice(2)}`;
}

function restarMeses(period: string, cantidad: number) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 1 - cantidad, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function siguienteMes(period: string) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Periodo de referencia: mes actual si hay pagos, si no el anterior. */
export function periodoWidgetsPagos(pagos: PagoResumenFila[]) {
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

export function serieCobranzaUltimosMeses(
  pagos: PagoResumenFila[],
  meses = 6,
) {
  const hasta = periodoWidgetsPagos(pagos);
  const desde = restarMeses(hasta, meses - 1);
  const map = new Map<
    string,
    { pagado: number; pendiente: number; vencido: number; parcial: number }
  >();

  for (const p of pagos) {
    if (p.period < desde || p.period > hasta) continue;
    const bucket = map.get(p.period) ?? {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      parcial: 0,
    };
    const total = montoTotalPago(p);
    if (p.status === "pagado") bucket.pagado += total;
    else if (p.status === "vencido") bucket.vencido += total;
    else if (p.status === "parcial") bucket.parcial += total;
    else bucket.pendiente += total;
    map.set(p.period, bucket);
  }

  const puntos: {
    mes: string;
    pagado: number;
    pendiente: number;
    vencido: number;
    parcial: number;
    cobertura: number;
  }[] = [];

  let cursor = desde;
  while (cursor <= hasta) {
    const values = map.get(cursor) ?? {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      parcial: 0,
    };
    const total =
      values.pagado + values.pendiente + values.vencido + values.parcial;
    puntos.push({
      mes: etiquetaPeriodo(cursor),
      ...values,
      cobertura: total > 0 ? Math.round((values.pagado / total) * 100) : 0,
    });
    cursor = siguienteMes(cursor);
  }

  return puntos;
}
