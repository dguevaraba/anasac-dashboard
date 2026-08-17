"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Bubbles } from "@/components/ui/bubbles";
import { Badge } from "@/components/ui/badge";
import {
  formatCrc,
  getNextInstitutionalPayment,
} from "@/lib/mock/analytics";
import { formatDate } from "@/lib/utils";

export function NextPaymentCard() {
  const next = getNextInstitutionalPayment();
  const isOverdue = next.daysRemaining < 0;
  const isToday = next.daysRemaining === 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-[linear-gradient(145deg,#0f2c3d_0%,#2e768d_70%,#1a7a72_120%)] p-5 text-white shadow-[0_12px_32px_rgba(15,44,61,0.25)]">
      <Bubbles preset="hero" />
      <div className="relative z-[1]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--anasac-aqua)]">
              Próximo cobro
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl font-bold">
              Mensualidad institucional
            </h3>
            <p className="mt-1 text-sm text-white/75">
              Fecha límite: {formatDate(next.dueDate)}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[var(--anasac-aqua)]">
            <CreditCard className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="relative overflow-hidden rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-[var(--anasac-aqua)]/20" />
            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Días restantes
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--anasac-aqua)]">
              {isOverdue ? Math.abs(next.daysRemaining) : next.daysRemaining}
            </p>
            <p className="text-xs text-white/70">
              {isOverdue
                ? "días de atraso"
                : isToday
                  ? "vence hoy"
                  : next.daysRemaining === 1
                    ? "día"
                    : "días"}
            </p>
          </div>
          <div className="relative overflow-hidden rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
            <span className="absolute -right-3 -top-3 h-12 w-12 rounded-full bg-white/10" />
            <p className="text-[11px] uppercase tracking-wide text-white/60">
              Pendiente
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-lg font-bold">
              {formatCrc(next.pendingAmount)}
            </p>
            <p className="text-xs text-white/70">
              {next.pendingCount} cuota{next.pendingCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge className="bg-white/15 text-white hover:bg-white/20">
            {isOverdue ? "Vencido" : isToday ? "Vence hoy" : "Próximo"}
          </Badge>
          <Link
            href="/example/payments"
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--anasac-navy)] transition hover:bg-[var(--anasac-aqua)]"
          >
            Ver pagos
          </Link>
        </div>
      </div>
    </div>
  );
}
