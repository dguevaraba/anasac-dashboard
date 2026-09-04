"use client";

import { useEffect, useMemo, useState } from "react";
import { BrushCleaning } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { NextPaymentCard } from "@/components/dashboard/next-payment-card";
import { PaymentsChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { daysUntil, formatCrc } from "@/lib/mock/analytics";
import { formatDate } from "@/lib/utils";

export type PagoItem = {
  id: string;
  swimmerId: string;
  nadador: string;
  concept: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: "pagado" | "pendiente" | "vencido" | "parcial";
  period: string;
};

export type NadadorOpcion = { id: string; etiqueta: string };

const VARIANTE_PAGO = {
  pagado: "success",
  pendiente: "warning",
  vencido: "danger",
  parcial: "default",
} as const;

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

function mesAnteriorDe(period: string) {
  const [y, m] = period.split("-").map(Number);
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function cobroMesEnCurso(pagos: PagoItem[]) {
  const now = new Date();
  const period = mesActualIso();
  const dueDate = `${period}-15`;
  const pendientes = pagos.filter(
    (p) => p.period === period && p.status !== "pagado",
  );
  return {
    dueDate,
    daysRemaining: daysUntil(dueDate),
    pendingAmount: pendientes.reduce((s, p) => s + p.amount, 0),
    pendingCount: pendientes.length,
    monthLabel: `${MESES_LARGO[now.getMonth()]} ${now.getFullYear()}`,
  };
}

function etiquetaPeriodo(period: string) {
  const [y, m] = period.split("-");
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return period;
  return `${MESES_CORTO[idx]} ${y.slice(2)}`;
}

function construirSerieMensual(pagos: PagoItem[]) {
  const map = new Map<string, { cobrado: number; pendiente: number }>();
  for (const p of pagos) {
    const bucket = map.get(p.period) ?? { cobrado: 0, pendiente: 0 };
    if (p.status === "pagado") {
      bucket.cobrado += p.amount;
    } else {
      bucket.pendiente += p.amount;
    }
    map.set(p.period, bucket);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, values]) => ({
      mes: etiquetaPeriodo(period),
      cobrado: values.cobrado,
      pendiente: values.pendiente,
    }));
}

export function GestorPagos({
  pagos,
  nadadores,
}: {
  pagos: PagoItem[];
  nadadores: NadadorOpcion[];
}) {
  const periodoWidgets = useMemo(() => {
    const actual = mesActualIso();
    if (pagos.some((p) => p.period === actual)) return actual;
    return mesAnteriorIso();
  }, [pagos]);

  const proximo = useMemo(() => {
    const corte = cobroMesEnCurso(pagos);
    const pendientes = pagos.filter(
      (p) => p.period === periodoWidgets && p.status !== "pagado",
    );
    return {
      ...corte,
      pendingAmount: pendientes.reduce((s, p) => s + p.amount, 0),
      pendingCount: pendientes.length,
    };
  }, [pagos, periodoWidgets]);

  const totalesMes = useMemo(() => {
    const delMes = pagos.filter((p) => p.period === periodoWidgets);
    const paid = delMes
      .filter((p) => p.status === "pagado")
      .reduce((s, p) => s + p.amount, 0);
    const pending = delMes
      .filter((p) => p.status !== "pagado")
      .reduce((s, p) => s + p.amount, 0);
    return {
      paid,
      esperado: paid + pending,
      etiqueta: etiquetaPeriodo(periodoWidgets),
      cuotas: delMes.length,
    };
  }, [pagos, periodoWidgets]);

  const [mesDesde, setMesDesde] = useState(mesAnteriorIso);
  const [mesHasta, setMesHasta] = useState(mesAnteriorIso);
  const [nadadorId, setNadadorId] = useState("todos");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  useEffect(() => {
    setMesDesde(periodoWidgets);
    setMesHasta(periodoWidgets);
  }, [periodoWidgets]);

  const filtrados = useMemo(() => {
    const desde = mesDesde <= mesHasta ? mesDesde : mesHasta;
    const hasta = mesDesde <= mesHasta ? mesHasta : mesDesde;
    return [...pagos]
      .filter((p) => p.period >= desde && p.period <= hasta)
      .filter((p) => nadadorId === "todos" || p.swimmerId === nadadorId)
      .filter((p) => filtroEstado === "todos" || p.status === filtroEstado)
      .sort((a, b) => {
        const byPeriod = b.period.localeCompare(a.period);
        if (byPeriod !== 0) return byPeriod;
        return a.nadador.localeCompare(b.nadador, "es");
      });
  }, [pagos, mesDesde, mesHasta, nadadorId, filtroEstado]);

  const chartData = useMemo(() => {
    let desde = mesDesde <= mesHasta ? mesDesde : mesHasta;
    let hasta = mesDesde <= mesHasta ? mesHasta : mesDesde;
    if (desde === hasta) {
      desde = mesAnteriorDe(desde);
    }
    const paraChart = pagos
      .filter((p) => p.period >= desde && p.period <= hasta)
      .filter((p) => nadadorId === "todos" || p.swimmerId === nadadorId)
      .filter((p) => filtroEstado === "todos" || p.status === filtroEstado);
    const serie = construirSerieMensual(paraChart);
    if (serie.length >= 2) return serie;
    // Rellena meses faltantes del rango para que el eje tenga al menos 2 puntos
    const puntos: { mes: string; cobrado: number; pendiente: number }[] = [];
    let cursor = desde;
    while (cursor <= hasta) {
      const existing = serie.find((s) => s.mes === etiquetaPeriodo(cursor));
      puntos.push(
        existing ?? {
          mes: etiquetaPeriodo(cursor),
          cobrado: 0,
          pendiente: 0,
        },
      );
      const [y, m] = cursor.split("-").map(Number);
      const next = new Date(y, m, 1); // m is 1-based → Date(y, m, 1) = first of next month
      cursor = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    }
    return puntos;
  }, [pagos, mesDesde, mesHasta, nadadorId, filtroEstado]);

  const totalVista = useMemo(
    () => filtrados.reduce((s, p) => s + p.amount, 0),
    [filtrados],
  );

  const filtrosActivos =
    mesDesde !== periodoWidgets ||
    mesHasta !== periodoWidgets ||
    nadadorId !== "todos" ||
    filtroEstado !== "todos";

  function limpiarFiltros() {
    setMesDesde(periodoWidgets);
    setMesHasta(periodoWidgets);
    setNadadorId("todos");
    setFiltroEstado("todos");
  }

  if (pagos.length === 0) {
    return (
      <EmptyState
        title="No hay cobros registrados"
        description="Cuando se carguen mensualidades e inscripciones, el estado de cuentas va a aparecer acá."
      />
    );
  }

  return (
    <div>
      <div className="mb-4 grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <div className="lg:col-span-3">
          <NextPaymentCard
            next={proximo}
            title="Mensualidad"
            monthLabel={proximo.monthLabel}
            showLink={false}
            showBadge={false}
            className="h-full"
          />
        </div>
        <div className="flex min-h-[220px] flex-col gap-3 lg:col-span-2">
          <Card bubbles bubblePreset="card" className="min-h-[100px] flex-1">
            <CardContent className="flex h-full flex-col justify-center p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total cobrado
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--anasac-navy)]">
                {formatCrc(totalesMes.paid)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">{totalesMes.etiqueta}</p>
            </CardContent>
          </Card>
          <Card bubbles bubblePreset="panel" className="min-h-[100px] flex-1">
            <CardContent className="flex h-full flex-col justify-center p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Esperado del mes
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--anasac-teal)]">
                {formatCrc(totalesMes.esperado)}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {totalesMes.cuotas} cuota{totalesMes.cuotas === 1 ? "" : "s"} ·{" "}
                {totalesMes.etiqueta}
              </p>
            </CardContent>
          </Card>
        </div>
        <PaymentsChart
          className="lg:col-span-7"
          compact
          data={chartData}
          subtitle=""
        />
      </div>

      <Card className="mb-4" bubbles bubblePreset="card">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-end">
          <div className="space-y-1">
            <Label htmlFor="mesDesde">Desde</Label>
            <Input
              id="mesDesde"
              type="month"
              className="md:w-44"
              value={mesDesde}
              onChange={(e) => setMesDesde(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="mesHasta">Hasta</Label>
            <Input
              id="mesHasta"
              type="month"
              className="md:w-44"
              value={mesHasta}
              onChange={(e) => setMesHasta(e.target.value)}
            />
          </div>
          <div className="min-w-[200px] flex-1 space-y-1">
            <Label htmlFor="nadador">Nadador</Label>
            <Select
              id="nadador"
              value={nadadorId}
              onChange={(e) => setNadadorId(e.target.value)}
            >
              <option value="todos">Todos los nadadores</option>
              {nadadores.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.etiqueta}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="estadoPago">Estado</Label>
            <Select
              id="estadoPago"
              className="md:w-44"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
              <option value="parcial">Parcial</option>
            </Select>
          </div>
          {filtrosActivos ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-slate-500"
              onClick={limpiarFiltros}
              aria-label="Restablecer filtros al mes anterior"
              title="Restablecer al mes anterior"
            >
              <BrushCleaning className="h-4 w-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card bubbles bubblePreset="panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Nadador</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pagado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((p, index) => (
                <TableRow key={p.id}>
                  <TableCell className="text-center text-slate-500">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-semibold text-[var(--anasac-navy)]">
                    {p.nadador}
                  </TableCell>
                  <TableCell>{p.period}</TableCell>
                  <TableCell>{p.concept}</TableCell>
                  <TableCell className="font-medium">
                    {formatCrc(p.amount)}
                  </TableCell>
                  <TableCell>{formatDate(p.dueDate)}</TableCell>
                  <TableCell>
                    <Badge variant={VARIANTE_PAGO[p.status]}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.paidAt ? formatDate(p.paidAt) : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {filtrados.length > 0 ? (
              <TableFooter>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-center font-semibold text-[var(--anasac-navy)]">
                    {filtrados.length}
                  </TableCell>
                  <TableCell colSpan={3} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="font-semibold text-[var(--anasac-navy)]">
                    {formatCrc(totalVista)}
                  </TableCell>
                  <TableCell colSpan={3} />
                </TableRow>
              </TableFooter>
            ) : null}
          </Table>
          {filtrados.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              No hay pagos en ese rango. Probá ampliar los meses.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
