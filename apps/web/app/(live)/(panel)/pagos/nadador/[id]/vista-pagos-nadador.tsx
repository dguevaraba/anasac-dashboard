"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CreditCard,
  Eye,
  Wallet,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { formatCrc } from "@/lib/mock/analytics";
import { cn, formatDate } from "@/lib/utils";
import type { PagoItem } from "../../gestor-pagos";

const VARIANTE_PAGO = {
  pagado: "success",
  pendiente: "warning",
  vencido: "danger",
  parcial: "default",
} as const;

export type NadadorPagosInfo = {
  id: string;
  nombre: string;
  apellido: string;
  grupo: string | null;
  estado: string;
  diaPago: number | null;
};

function estadoCuenta(pagos: PagoItem[]) {
  if (pagos.some((p) => p.status === "vencido")) {
    return { etiqueta: "Con deuda vencida", variante: "danger" as const };
  }
  if (pagos.some((p) => p.status === "pendiente" || p.status === "parcial")) {
    return { etiqueta: "Con pendientes", variante: "warning" as const };
  }
  if (pagos.length === 0) {
    return { etiqueta: "Sin cuotas", variante: "muted" as const };
  }
  return { etiqueta: "Al día", variante: "success" as const };
}

function Dato({
  etiqueta,
  valor,
  hint,
}: {
  etiqueta: string;
  valor: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {etiqueta}
      </p>
      <div className="mt-1 text-sm font-semibold text-[var(--anasac-navy)]">
        {valor}
      </div>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function VistaPagosNadador({
  nadador,
  pagos,
}: {
  nadador: NadadorPagosInfo;
  pagos: PagoItem[];
}) {
  const { can } = useAuth();
  const { basePath } = useAppConfig();

  if (!can("payments:view")) {
    notFound();
  }

  const ordenados = [...pagos].sort((a, b) => {
    const byPeriod = b.period.localeCompare(a.period);
    if (byPeriod !== 0) return byPeriod;
    return b.dueDate.localeCompare(a.dueDate);
  });

  const cobrado = pagos
    .filter((p) => p.status === "pagado")
    .reduce((s, p) => s + p.amount, 0);
  const pendiente = pagos
    .filter((p) => p.status !== "pagado")
    .reduce((s, p) => s + p.amount, 0);
  const total = cobrado + pendiente;
  const cobertura = total > 0 ? Math.round((cobrado / total) * 100) : 0;
  const cuenta = estadoCuenta(pagos);

  const ultimoPago = [...pagos]
    .filter((p) => p.status === "pagado" && p.paidAt)
    .sort((a, b) => (b.paidAt ?? "").localeCompare(a.paidAt ?? ""))[0];

  const proximo = [...pagos]
    .filter((p) => p.status !== "pagado")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.period.localeCompare(b.period))[0];

  const nombreCompleto = `${nadador.nombre} ${nadador.apellido}`.trim();

  return (
    <div>
      <Link
        href={appHref(basePath, "/pagos")}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-4 -ml-2 gap-1.5 text-slate-500",
        )}
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a pagos
      </Link>

      <PageHeader
        title={nombreCompleto}
        description={
          nadador.grupo
            ? `Cuenta de pagos · ${nadador.grupo}`
            : "Cuenta de pagos"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={cuenta.variante}>{cuenta.etiqueta}</Badge>
            <Link
              href={appHref(basePath, `/nadadores/${nadador.id}`)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Ver ficha
            </Link>
          </div>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card bubbles bubblePreset="card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--anasac-mist)] text-[var(--anasac-navy)]">
              <Wallet className="h-5 w-5" />
            </div>
            <Dato
              etiqueta="Estado de cuenta"
              valor={cuenta.etiqueta}
              hint={`${pagos.length} cuota${pagos.length === 1 ? "" : "s"} en historial`}
            />
          </CardContent>
        </Card>
        <Card bubbles bubblePreset="panel">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--anasac-mist)] text-[var(--anasac-teal)]">
              <CreditCard className="h-5 w-5" />
            </div>
            <Dato
              etiqueta="Último pago"
              valor={
                ultimoPago
                  ? formatCrc(ultimoPago.amount)
                  : "Sin pagos registrados"
              }
              hint={
                ultimoPago
                  ? `${ultimoPago.period} · ${formatDate(ultimoPago.paidAt!)}`
                  : undefined
              }
            />
          </CardContent>
        </Card>
        <Card bubbles bubblePreset="card">
          <CardContent className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--anasac-mist)] text-[var(--anasac-navy)]">
              <CalendarClock className="h-5 w-5" />
            </div>
            <Dato
              etiqueta="Próximo / pendiente"
              valor={
                proximo ? formatCrc(proximo.amount) : "Sin pendientes"
              }
              hint={
                proximo
                  ? `${proximo.period} · vence ${formatDate(proximo.dueDate)} · ${proximo.status}`
                  : undefined
              }
            />
          </CardContent>
        </Card>
        <Card bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <Dato
              etiqueta="Cobertura"
              valor={`${cobertura}%`}
              hint={`${formatCrc(cobrado)} cobrado · ${formatCrc(pendiente)} pendiente`}
            />
          </CardContent>
        </Card>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <Card bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <Dato etiqueta="Total cobrado" valor={formatCrc(cobrado)} />
          </CardContent>
        </Card>
        <Card bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <Dato etiqueta="Total pendiente" valor={formatCrc(pendiente)} />
          </CardContent>
        </Card>
        <Card bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <Dato
              etiqueta="Día de pago"
              valor={nadador.diaPago != null ? `Día ${nadador.diaPago}` : "—"}
            />
          </CardContent>
        </Card>
      </div>

      <Card bubbles bubblePreset="panel">
        <CardContent className="p-0">
          {ordenados.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              Este nadador todavía no tiene cuotas registradas.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Vence</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pagado</TableHead>
                  <TableHead>Factura</TableHead>
                  <TableHead className="w-12 text-center">
                    <span className="sr-only">Ver</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordenados.map((p, index) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-center text-slate-500">
                      {index + 1}
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
                      <Link
                        href={appHref(basePath, `/pagos/${p.id}`)}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "icon" }),
                          "h-8 w-8",
                        )}
                        aria-label={`Ver pago ${p.period}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="hover:bg-transparent">
                  <TableCell className="text-center font-semibold">
                    {ordenados.length}
                  </TableCell>
                  <TableCell colSpan={2} className="font-semibold">
                    Total
                  </TableCell>
                  <TableCell className="font-semibold text-[var(--anasac-navy)]">
                    {formatCrc(total)}
                  </TableCell>
                  <TableCell colSpan={5} />
                </TableRow>
              </TableFooter>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
