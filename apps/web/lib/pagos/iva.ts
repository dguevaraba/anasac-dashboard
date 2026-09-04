/** Tasa de IVA Costa Rica usada en cuotas ANASAC. */
export const IVA_RATE = 0.13;

export function calcularIva(montoBase: number, rate = IVA_RATE) {
  if (!Number.isFinite(montoBase) || montoBase < 0) return 0;
  return Math.round(montoBase * rate);
}

export function montoConIva(montoBase: number, tax = calcularIva(montoBase)) {
  return montoBase + tax;
}

/** Total a cobrar: cuota base + IVA 13% (siempre calculado). */
export function montoTotalPago(p: { amount: number }) {
  return montoConIva(p.amount);
}
