"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NextPaymentCard } from "@/components/dashboard/next-payment-card";
import { PaymentsChart } from "@/components/dashboard/charts";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/auth/auth-context";
import {
  formatCrc,
  getNextInstitutionalPayment,
  payments as initialPayments,
} from "@/lib/mock/analytics";
import { findSwimmer } from "@/lib/mock/data";
import { formatDate } from "@/lib/utils";
import type { PaymentStatus } from "@/types";

const STATUS_VARIANT: Record<PaymentStatus, "success" | "warning" | "danger" | "muted"> = {
  pagado: "success",
  pendiente: "warning",
  vencido: "danger",
  parcial: "muted",
};

export default function PaymentsPage() {
  const { can } = useAuth();
  const canManage = can("payments:manage");
  const [statusFilter, setStatusFilter] = useState("todos");
  const next = getNextInstitutionalPayment();

  const filtered = useMemo(() => {
    return [...initialPayments]
      .filter((p) => statusFilter === "todos" || p.status === statusFilter)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [statusFilter]);

  const totals = useMemo(() => {
    const paid = initialPayments
      .filter((p) => p.status === "pagado")
      .reduce((s, p) => s + p.amountCrc, 0);
    const pending = initialPayments
      .filter((p) => p.status === "pendiente" || p.status === "vencido")
      .reduce((s, p) => s + p.amountCrc, 0);
    return { paid, pending };
  }, []);

  if (!can("payments:view")) {
    return (
      <div>
        <PageHeader
          title="Pagos"
          description="No tienes permiso para ver esta sección."
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pagos"
        description="Cobros, mensualidades y estado de cuentas (datos mock)."
        actions={
          !canManage ? <Badge variant="muted">Solo lectura</Badge> : undefined
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <NextPaymentCard />
        </div>
        <Card bubbles bubblePreset="card">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total cobrado
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--anasac-navy)]">
              {formatCrc(totals.paid)}
            </p>
            <p className="mt-1 text-xs text-slate-500">Pagos confirmados (demo)</p>
          </CardContent>
        </Card>
        <Card bubbles bubblePreset="panel">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Por cobrar
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--anasac-teal)]">
              {formatCrc(totals.pending)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Próximo corte: {formatDate(next.dueDate)} · {next.daysRemaining} días
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <PaymentsChart />
      </div>

      <Card className="mb-4" bubbles bubblePreset="card">
        <CardContent className="p-4">
          <Select
            className="md:w-56"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="pagado">Pagado</option>
            <option value="vencido">Vencido</option>
            <option value="parcial">Parcial</option>
          </Select>
        </CardContent>
      </Card>

      <Card bubbles bubblePreset="panel">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nadador</TableHead>
                <TableHead>Concepto</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Vence</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pagado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((payment) => {
                const swimmer = findSwimmer(payment.swimmerId);
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-semibold text-[var(--anasac-navy)]">
                      {swimmer
                        ? `${swimmer.firstName} ${swimmer.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>{payment.concept}</TableCell>
                    <TableCell className="font-medium">
                      {formatCrc(payment.amountCrc)}
                    </TableCell>
                    <TableCell>{formatDate(payment.dueDate)}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[payment.status]}>
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payment.paidAt ? formatDate(payment.paidAt) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filtered.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">
              No hay pagos con ese filtro.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
