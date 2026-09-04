"use client";

import { useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";
import { formatCrc } from "@/lib/mock/analytics";
import { calcularIva, IVA_RATE, montoTotalPago } from "@/lib/pagos/iva";
import { cn, formatDate } from "@/lib/utils";
import { actualizarPagoAction } from "../actions";
import type { PagoItem } from "../gestor-pagos";

const VARIANTE_PAGO = {
  pagado: "success",
  pendiente: "warning",
  vencido: "danger",
  parcial: "default",
} as const;

function esPdf(url: string) {
  return /\.pdf(\?|$)/i.test(url);
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {etiqueta}
      </p>
      <div className="mt-1 text-sm font-medium text-[var(--anasac-navy)]">
        {valor}
      </div>
    </div>
  );
}

export function FichaPago({ pago }: { pago: PagoItem }) {
  const { can } = useAuth();
  const { basePath } = useAppConfig();
  const puedeGestionar = can("payments:manage");
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [estadoForm, setEstadoForm] = useState(pago.status);
  const [facturaUrl, setFacturaUrl] = useState(pago.invoiceUrl);
  const [montoForm, setMontoForm] = useState(pago.amount);

  function abrirEdicion() {
    setEstadoForm(pago.status);
    setFacturaUrl(pago.invoiceUrl);
    setMontoForm(pago.amount);
    setErrorFormulario(null);
    setEditando(true);
  }

  function cancelarEdicion() {
    setEditando(false);
    setErrorFormulario(null);
    setEstadoForm(pago.status);
    setFacturaUrl(pago.invoiceUrl);
    setMontoForm(pago.amount);
  }

  async function alGuardar(formData: FormData) {
    setGuardando(true);
    setErrorFormulario(null);
    const resultado = await actualizarPagoAction(formData);
    setGuardando(false);
    if (!resultado.ok) {
      setErrorFormulario(resultado.error ?? "No se pudo guardar el pago.");
      return;
    }
    setEditando(false);
  }

  if (!can("payments:view")) {
    notFound();
  }

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
        title={pago.nadador}
        description={pago.concept}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={VARIANTE_PAGO[pago.status]}>{pago.status}</Badge>
            <Link
              href={appHref(basePath, `/pagos/nadador/${pago.swimmerId}`)}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Cuenta del nadador
            </Link>
            {puedeGestionar && !editando ? (
              <Button type="button" variant="outline" size="sm" onClick={abrirEdicion}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            ) : null}
          </div>
        }
      />

      {editando && puedeGestionar ? (
        <Card className="mb-4" bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--anasac-navy)]">
              Editar pago
            </h2>
            <form
              key={`editar-${pago.id}`}
              action={alGuardar}
              className="grid gap-3 md:grid-cols-3"
            >
              <input type="hidden" name="id" value={pago.id} />
              <div className="space-y-1">
                <Label htmlFor="period">Periodo</Label>
                <Input
                  id="period"
                  name="period"
                  type="month"
                  required
                  defaultValue={pago.period}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="concept">Concepto</Label>
                <Input
                  id="concept"
                  name="concept"
                  required
                  defaultValue={pago.concept}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="amount">Cuota base (₡)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={montoForm}
                  onChange={(e) => setMontoForm(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-slate-500">
                  IVA {Math.round(IVA_RATE * 100)}%:{" "}
                  {formatCrc(calcularIva(montoForm))} · Total:{" "}
                  {formatCrc(montoForm + calcularIva(montoForm))}
                </p>
              </div>
              <div className="space-y-1">
                <Label htmlFor="dueDate">Vence</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  required
                  defaultValue={pago.dueDate}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Estado</Label>
                <Select
                  id="status"
                  name="status"
                  value={estadoForm}
                  onChange={(e) =>
                    setEstadoForm(e.target.value as PagoItem["status"])
                  }
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
                  defaultValue={pago.paidAt ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="receiptNumber">Comprobante</Label>
                <Input
                  id="receiptNumber"
                  name="receiptNumber"
                  defaultValue={pago.receiptNumber ?? ""}
                  placeholder="Nº SINPE"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentMethod">Método</Label>
                <Input
                  id="paymentMethod"
                  name="paymentMethod"
                  defaultValue={pago.paymentMethod ?? ""}
                  placeholder="SINPE"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="bank">Banco</Label>
                <Input
                  id="bank"
                  name="bank"
                  defaultValue={pago.bank ?? ""}
                  placeholder="BCR, BAC…"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="invoice">Factura (opcional)</Label>
                <Input
                  id="invoice"
                  name="invoice"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFacturaUrl(
                      file ? URL.createObjectURL(file) : pago.invoiceUrl,
                    );
                  }}
                />
                <p className="text-xs text-slate-500">
                  JPG, PNG, WEBP o PDF · máximo 10 MB
                </p>
                {pago.invoiceUrl ? (
                  <label className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" name="removeInvoice" />
                    Quitar factura actual
                  </label>
                ) : null}
              </div>
              <div className="space-y-1 md:col-span-3">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input id="notes" name="notes" />
              </div>
              <div className="flex items-end gap-2 md:col-span-3">
                <Button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelarEdicion}
                >
                  Cancelar
                </Button>
              </div>
            </form>
            {errorFormulario ? (
              <p className="mt-3 text-sm text-red-600">{errorFormulario}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card bubbles bubblePreset="panel">
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
            <Dato etiqueta="Periodo" valor={pago.period} />
            <Dato etiqueta="Cuota base" valor={formatCrc(pago.amount)} />
            <Dato
              etiqueta="IVA (13%)"
              valor={formatCrc(calcularIva(pago.amount))}
            />
            <Dato
              etiqueta="Total"
              valor={formatCrc(montoTotalPago(pago))}
            />
            <Dato etiqueta="Vence" valor={formatDate(pago.dueDate)} />
            <Dato
              etiqueta="Pagado"
              valor={pago.paidAt ? formatDate(pago.paidAt) : "—"}
            />
            <Dato etiqueta="Concepto" valor={pago.concept} />
            <Dato
              etiqueta="Estado"
              valor={
                <Badge variant={VARIANTE_PAGO[pago.status]}>{pago.status}</Badge>
              }
            />
            {pago.grupo ? <Dato etiqueta="Grupo" valor={pago.grupo} /> : null}
            {pago.receiptNumber ? (
              <Dato etiqueta="Comprobante" valor={pago.receiptNumber} />
            ) : null}
            {pago.paymentMethod ? (
              <Dato etiqueta="Método" valor={pago.paymentMethod} />
            ) : null}
            {pago.bank ? <Dato etiqueta="Banco" valor={pago.bank} /> : null}
          </CardContent>
        </Card>

        <Card bubbles bubblePreset="card">
          <CardContent className="p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Factura
            </p>
            {(editando ? facturaUrl : pago.invoiceUrl) ? (
              <div className="mt-3 space-y-3">
                {esPdf(editando ? facturaUrl! : pago.invoiceUrl!) ? (
                  <a
                    href={editando ? facturaUrl! : pago.invoiceUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-[var(--anasac-border)] bg-[var(--anasac-mist)]/50 px-4 py-6 text-[var(--anasac-navy)] transition hover:border-[var(--anasac-teal)]"
                  >
                    <FileText className="h-8 w-8 shrink-0 text-[var(--anasac-teal)]" />
                    <span className="text-sm font-medium">
                      Abrir PDF de la factura
                    </span>
                  </a>
                ) : (
                  <a
                    href={editando ? facturaUrl! : pago.invoiceUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block overflow-hidden rounded-xl border border-[var(--anasac-border)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editando ? facturaUrl! : pago.invoiceUrl!}
                      alt={`Factura de ${pago.nadador}`}
                      className="max-h-80 w-full object-contain bg-white"
                    />
                  </a>
                )}
                <a
                  href={editando ? facturaUrl! : pago.invoiceUrl!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-medium text-[var(--anasac-teal)] underline-offset-2 hover:underline"
                >
                  Abrir en pestaña nueva
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Sin factura adjunta.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
