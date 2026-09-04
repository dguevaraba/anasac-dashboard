"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BrushCleaning, Eye, FileSpreadsheet, FileText, Plus, Wallet } from "lucide-react";
import { EmptyState } from "@/components/layout/empty-state";
import { NextPaymentCard } from "@/components/dashboard/next-payment-card";
import { PaymentsChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";
import { daysUntil, formatCrc } from "@/lib/mock/analytics";
import { cn, formatDate } from "@/lib/utils";
import { ModalExportarPagos } from "@/components/pagos/modal-exportar-pagos";
import { crearPagoAction } from "./actions";

export type PagoItem = {
  id: string;
  swimmerId: string;
  nadador: string;
  grupo: string | null;
  concept: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  status: "pagado" | "pendiente" | "vencido" | "parcial";
  period: string;
  invoiceUrl: string | null;
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

function construirSerieEstados(pagos: PagoItem[]) {
  const map = new Map<
    string,
    { pagado: number; pendiente: number; vencido: number; parcial: number }
  >();
  for (const p of pagos) {
    const bucket = map.get(p.period) ?? {
      pagado: 0,
      pendiente: 0,
      vencido: 0,
      parcial: 0,
    };
    if (p.status === "pagado") bucket.pagado += p.amount;
    else if (p.status === "vencido") bucket.vencido += p.amount;
    else if (p.status === "parcial") bucket.parcial += p.amount;
    else bucket.pendiente += p.amount;
    map.set(p.period, bucket);
  }
  return map;
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

export function GestorPagos({
  pagos,
  nadadores,
}: {
  pagos: PagoItem[];
  nadadores: NadadorOpcion[];
}) {
  const { can } = useAuth();
  const { basePath } = useAppConfig();
  const puedeGestionar = can("payments:manage");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [periodoForm, setPeriodoForm] = useState(mesActualIso);
  const [estadoForm, setEstadoForm] = useState("pendiente");
  const [exportFormato, setExportFormato] = useState<"excel" | "pdf" | null>(
    null,
  );

  const periodoWidgets = useMemo(() => {
    const actual = mesActualIso();
    if (pagos.some((p) => p.period === actual)) return actual;
    return mesAnteriorIso();
  }, [pagos]);

  const vencimientoPorDefecto = useMemo(() => {
    const [y, m] = periodoForm.split("-");
    if (!y || !m) return `${mesActualIso()}-15`;
    return `${periodoForm}-15`;
  }, [periodoForm]);

  function abrirCrear() {
    setPeriodoForm(mesActualIso());
    setEstadoForm("pendiente");
    setErrorFormulario(null);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setErrorFormulario(null);
  }

  async function alEnviar(formData: FormData) {
    setGuardando(true);
    setErrorFormulario(null);
    const resultado = await crearPagoAction(formData);
    setGuardando(false);
    if (!resultado.ok) {
      setErrorFormulario(resultado.error ?? "No se pudo guardar el pago.");
      return;
    }
    cerrarFormulario();
  }

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
    const hasta = mesDesde <= mesHasta ? mesHasta : mesDesde;
    // Siempre últimos 6 meses del “hasta” del filtro, para poder comparar tendencia
    const desde = restarMeses(hasta, 5);
    const porPeriodo = construirSerieEstados(
      pagos.filter(
        (p) =>
          p.period >= desde &&
          p.period <= hasta &&
          (nadadorId === "todos" || p.swimmerId === nadadorId),
      ),
    );
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
      const values = porPeriodo.get(cursor) ?? {
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
  }, [pagos, mesDesde, mesHasta, nadadorId]);

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

  if (!can("payments:view")) {
    notFound();
  }

  const formulario = mostrarFormulario && puedeGestionar ? (
    <Card className="mb-4" bubbles bubblePreset="panel">
      <CardContent className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-[var(--anasac-navy)]">
          Nuevo pago
        </h2>
        <form
          key="nuevo-pago"
          action={alEnviar}
          className="grid gap-3 md:grid-cols-3"
        >
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="swimmerId">Nadador</Label>
            <Select id="swimmerId" name="swimmerId" required defaultValue="">
              <option value="" disabled>
                Seleccioná un nadador
              </option>
              {nadadores.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.etiqueta}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="period">Periodo</Label>
            <Input
              id="period"
              name="period"
              type="month"
              required
              value={periodoForm}
              onChange={(e) => setPeriodoForm(e.target.value)}
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="concept">Concepto</Label>
            <Input
              id="concept"
              name="concept"
              placeholder={`Mensualidad ${periodoForm}`}
              defaultValue={`Mensualidad ${periodoForm}`}
              key={`concept-${periodoForm}`}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="amount">Monto (₡)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min={0}
              step={1}
              required
              defaultValue={15000}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="dueDate">Vence</Label>
            <Input
              id="dueDate"
              name="dueDate"
              type="date"
              required
              key={`due-${vencimientoPorDefecto}`}
              defaultValue={vencimientoPorDefecto}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="status">Estado</Label>
            <Select
              id="status"
              name="status"
              value={estadoForm}
              onChange={(e) => setEstadoForm(e.target.value)}
            >
              <option value="pendiente">Pendiente</option>
              <option value="pagado">Pagado</option>
              <option value="vencido">Vencido</option>
              <option value="parcial">Parcial</option>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="paidAt">
              Fecha de pago{estadoForm === "pagado" ? "" : " (opcional)"}
            </Label>
            <Input
              id="paidAt"
              name="paidAt"
              type="date"
              required={estadoForm === "pagado"}
            />
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label htmlFor="invoice">Factura (opcional)</Label>
            <Input
              id="invoice"
              name="invoice"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
            />
            <p className="text-xs text-slate-500">
              JPG, PNG, WEBP o PDF · máximo 10 MB
            </p>
          </div>
          <div className="space-y-1 md:col-span-3">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Input id="notes" name="notes" />
          </div>
          <div className="flex items-end gap-2 md:col-span-3">
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar pago"}
            </Button>
            <Button type="button" variant="outline" onClick={cerrarFormulario}>
              Cancelar
            </Button>
          </div>
        </form>
        {errorFormulario ? (
          <p className="mt-3 text-sm text-red-600">{errorFormulario}</p>
        ) : null}
      </CardContent>
    </Card>
  ) : null;

  if (pagos.length === 0) {
    return (
      <div>
        <div className="mb-4 flex justify-end">
          {puedeGestionar ? (
            <Button type="button" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nuevo pago
            </Button>
          ) : null}
        </div>
        {formulario}
        {!mostrarFormulario ? (
          <EmptyState
            title="No hay cobros registrados"
            description={
              puedeGestionar
                ? "Usá «Nuevo pago» para registrar la primera mensualidad."
                : "Cuando se carguen mensualidades e inscripciones, el estado de cuentas va a aparecer acá."
            }
          />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        {puedeGestionar ? (
          <Button type="button" onClick={abrirCrear}>
            <Plus className="h-4 w-4" />
            Nuevo pago
          </Button>
        ) : null}
      </div>

      {formulario}

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
          subtitle="Últimos 6 meses · barras = montos · línea = % cobrado"
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
          <div className="flex flex-wrap gap-2 md:ml-auto">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExportFormato("excel")}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </Button>
            <Button type="button" onClick={() => setExportFormato("pdf")}>
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
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
                <TableHead>Factura</TableHead>
                <TableHead className="w-20 text-center">
                  <span className="sr-only">Acciones</span>
                </TableHead>
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
                  <TableCell>
                    {p.invoiceUrl ? (
                      <a
                        href={p.invoiceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-[var(--anasac-teal)] underline-offset-2 hover:underline"
                      >
                        Ver
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-0.5">
                      <Link
                        href={appHref(basePath, `/pagos/nadador/${p.swimmerId}`)}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8",
                        )}
                        aria-label={`Ver cuenta de pagos de ${p.nadador}`}
                        title="Cuenta del nadador"
                      >
                        <Wallet className="h-4 w-4" />
                      </Link>
                      <Link
                        href={appHref(basePath, `/pagos/${p.id}`)}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8",
                        )}
                        aria-label={`Ver pago de ${p.nadador}`}
                        title="Detalle del pago"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </div>
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
                  <TableCell colSpan={5} />
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

      <ModalExportarPagos
        abierto={exportFormato !== null}
        formato={exportFormato}
        onClose={() => setExportFormato(null)}
        pagos={pagos.map((p) => ({
          id: p.id,
          swimmerId: p.swimmerId,
          nadador: p.nadador,
          grupo: p.grupo,
          concept: p.concept,
          amount: p.amount,
          dueDate: p.dueDate,
          paidAt: p.paidAt,
          status: p.status,
          period: p.period,
        }))}
        filtrosBase={{
          mesDesde,
          mesHasta,
          nadadorId,
          estado: filtroEstado,
        }}
        etiquetaNadador={
          nadadorId === "todos"
            ? undefined
            : nadadores.find((n) => n.id === nadadorId)?.etiqueta
        }
      />
    </div>
  );
}
