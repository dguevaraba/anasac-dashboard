"use client";

import { NextPaymentCard } from "@/components/dashboard/next-payment-card";
import { PaymentsChart } from "@/components/dashboard/charts";

export function DashboardPagosWidgets({
  mensualidad,
  chartData,
}: {
  mensualidad: {
    dueDate: string;
    daysRemaining: number;
    pendingAmount: number;
    pendingCount: number;
    monthLabel: string;
  };
  chartData: {
    mes: string;
    pagado: number;
    pendiente: number;
    vencido: number;
    parcial: number;
    cobertura: number;
  }[];
}) {
  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-12 lg:items-stretch">
      <div className="lg:col-span-3">
        <NextPaymentCard
          next={mensualidad}
          title="Mensualidad"
          monthLabel={mensualidad.monthLabel}
          showBadge={false}
          className="h-full"
        />
      </div>
      <PaymentsChart
        className="lg:col-span-9"
        compact
        data={chartData}
        subtitle="Últimos 6 meses · barras = montos · línea = % cobrado"
      />
    </div>
  );
}
