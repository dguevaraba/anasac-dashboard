import type { AttendanceRecord, Payment } from "./types";
import { daysUntil, formatCrc } from "./format";

export { formatCrc, daysUntil };

/** Datos mock de asistencia semanal / mensual */
export const attendanceByMonth: AttendanceRecord[] = [
  { id: "att-1", date: "2026-03", present: 42, absent: 8, excused: 3, total: 53 },
  { id: "att-2", date: "2026-04", present: 48, absent: 6, excused: 2, total: 56 },
  { id: "att-3", date: "2026-05", present: 51, absent: 5, excused: 4, total: 60 },
  { id: "att-4", date: "2026-06", present: 46, absent: 9, excused: 3, total: 58 },
  { id: "att-5", date: "2026-07", present: 54, absent: 4, excused: 2, total: 60 },
  { id: "att-6", date: "2026-08", present: 50, absent: 7, excused: 3, total: 60 },
];

export const attendanceByWeek = [
  { semana: "Sem 1", presentes: 22, ausentes: 3, justificados: 1 },
  { semana: "Sem 2", presentes: 24, ausentes: 2, justificados: 0 },
  { semana: "Sem 3", presentes: 20, ausentes: 5, justificados: 2 },
  { semana: "Sem 4", presentes: 25, ausentes: 1, justificados: 1 },
  { semana: "Sem 5", presentes: 23, ausentes: 3, justificados: 1 },
  { semana: "Sem 6", presentes: 26, ausentes: 2, justificados: 0 },
];

/** Resultados por estilo (cantidad de marcas registradas) */
export const resultsByStroke = [
  { estilo: "Libre", marcas: 18, promedioMs: 64200 },
  { estilo: "Espalda", marcas: 12, promedioMs: 71800 },
  { estilo: "Pecho", marcas: 9, promedioMs: 81200 },
  { estilo: "Mariposa", marcas: 11, promedioMs: 69400 },
  { estilo: "Combinado", marcas: 7, promedioMs: 152400 },
];

export const resultsTrend = [
  { mes: "Mar", marcas: 4, podios: 1 },
  { mes: "Abr", marcas: 6, podios: 2 },
  { mes: "May", marcas: 8, podios: 3 },
  { mes: "Jun", marcas: 5, podios: 1 },
  { mes: "Jul", marcas: 11, podios: 4 },
  { mes: "Ago", marcas: 7, podios: 2 },
];

export const paymentsByMonth = [
  { mes: "Mar", cobrado: 420000, pendiente: 80000 },
  { mes: "Abr", cobrado: 510000, pendiente: 60000 },
  { mes: "May", cobrado: 480000, pendiente: 90000 },
  { mes: "Jun", cobrado: 530000, pendiente: 45000 },
  { mes: "Jul", cobrado: 560000, pendiente: 70000 },
  { mes: "Ago", cobrado: 390000, pendiente: 150000 },
];

/** Próxima fecha de cobro institucional (mock) */
export const NEXT_PAYMENT_DUE = "2026-09-01";

export const payments: Payment[] = [
  {
    id: "pay-1",
    swimmerId: "sw-1",
    concept: "Mensualidad agosto",
    amountCrc: 35000,
    dueDate: "2026-08-01",
    paidAt: "2026-07-28",
    status: "pagado",
    period: "2026-08",
    createdAt: "2026-07-15T10:00:00.000Z",
    updatedAt: "2026-07-28T10:00:00.000Z",
  },
  {
    id: "pay-2",
    swimmerId: "sw-2",
    concept: "Mensualidad agosto",
    amountCrc: 35000,
    dueDate: "2026-08-01",
    paidAt: "2026-08-02",
    status: "pagado",
    period: "2026-08",
    createdAt: "2026-07-15T10:00:00.000Z",
    updatedAt: "2026-08-02T10:00:00.000Z",
  },
  {
    id: "pay-3",
    swimmerId: "sw-3",
    concept: "Mensualidad septiembre",
    amountCrc: 35000,
    dueDate: "2026-09-01",
    status: "pendiente",
    period: "2026-09",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
  },
  {
    id: "pay-4",
    swimmerId: "sw-5",
    concept: "Mensualidad septiembre",
    amountCrc: 35000,
    dueDate: "2026-09-01",
    status: "pendiente",
    period: "2026-09",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
  },
  {
    id: "pay-5",
    swimmerId: "sw-4",
    concept: "Mensualidad julio",
    amountCrc: 35000,
    dueDate: "2026-07-01",
    status: "vencido",
    period: "2026-07",
    createdAt: "2026-06-15T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "pay-6",
    swimmerId: "sw-6",
    concept: "Inscripción festival infantil",
    amountCrc: 12000,
    dueDate: "2026-08-20",
    status: "pendiente",
    period: "2026-08",
    createdAt: "2026-08-05T10:00:00.000Z",
    updatedAt: "2026-08-05T10:00:00.000Z",
  },
  {
    id: "pay-7",
    swimmerId: "sw-1",
    concept: "Mensualidad septiembre",
    amountCrc: 35000,
    dueDate: "2026-09-01",
    status: "pendiente",
    period: "2026-09",
    createdAt: "2026-08-10T10:00:00.000Z",
    updatedAt: "2026-08-10T10:00:00.000Z",
  },
  {
    id: "pay-8",
    swimmerId: "sw-2",
    concept: "Uniforme ANASAC",
    amountCrc: 18000,
    dueDate: "2026-08-25",
    paidAt: "2026-08-12",
    status: "pagado",
    period: "2026-08",
    createdAt: "2026-08-01T10:00:00.000Z",
    updatedAt: "2026-08-12T10:00:00.000Z",
  },
];

export function getNextInstitutionalPayment() {
  const days = daysUntil(NEXT_PAYMENT_DUE);
  const pendingAmount = payments
    .filter((p) => p.dueDate === NEXT_PAYMENT_DUE && p.status === "pendiente")
    .reduce((sum, p) => sum + p.amountCrc, 0);
  const pendingCount = payments.filter(
    (p) => p.dueDate === NEXT_PAYMENT_DUE && p.status === "pendiente",
  ).length;

  return {
    dueDate: NEXT_PAYMENT_DUE,
    daysRemaining: days,
    pendingAmount,
    pendingCount,
  };
}
