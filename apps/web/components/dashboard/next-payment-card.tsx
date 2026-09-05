"use client";

import Link from "next/link";
import { CreditCard } from "lucide-react";
import { Bubbles } from "@/components/ui/bubbles";
import { Badge } from "@/components/ui/badge";
import {
  formatCrc,
  getNextInstitutionalPayment,
} from "@/lib/mock/analytics";
import { formatDate, cn } from "@/lib/utils";
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";

export type NextPaymentCardProps = {
  next?: {
    dueDate: string;
    daysRemaining: number;
    pendingAmount: number;
    pendingCount: number;
  };
  /** Ej. "Mensualidad" */
  title?: string;
  /** Ej. "Septiembre 2026" */
  monthLabel?: string;
  compact?: boolean;
  showLink?: boolean;
  /** Si false, no muestra badge Vencido/Próximo */
  showBadge?: boolean;
};

export function NextPaymentCard({
  next,
  title = "Mensualidad institucional",
  monthLabel,
  compact = false,
  showLink = true,
  showBadge = true,
  className,
}: NextPaymentCardProps & { className?: string }) {
  const data = next ?? getNextInstitutionalPayment();
  const { basePath } = useAppConfig();
  const { can } = useAuth();
  const isOverdue = data.daysRemaining < 0;
  const isToday = data.daysRemaining === 0;
  const showFooter = showBadge || (showLink && can("payments:view"));
  const eyebrow = monthLabel ? title : "Próximo cobro";
  const heading = monthLabel ?? title;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-[linear-gradient(145deg,#0f2c3d_0%,#2e768d_70%,#1a7a72_120%)] text-white shadow-[0_12px_32px_rgba(15,44,61,0.25)]",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <Bubbles preset="hero" />
      <div className="relative z-[1] flex h-full flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--anasac-aqua)]">
              {eyebrow}
            </p>
            <h3
              className={cn(
                "font-[family-name:var(--font-display)] font-bold",
                compact ? "mt-1 text-lg" : "mt-2 text-2xl",
              )}
            >
              {heading}
            </h3>
            <p className={cn("text-white/75", compact ? "mt-0.5 text-xs" : "mt-1 text-sm")}>
              Fecha límite: {formatDate(data.dueDate)}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-white/10 text-[var(--anasac-aqua)]",
              compact ? "h-9 w-9" : "h-11 w-11",
            )}
          >
            <CreditCard className={compact ? "h-4 w-4" : "h-5 w-5"} />
          </div>
        </div>

        <div className={cn("grid grid-cols-2 gap-2", compact ? "mt-3" : "mt-5 gap-3")}>
          <div
            className={cn(
              "relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm",
              compact ? "px-3 py-2" : "px-4 py-3",
            )}
          >
            <p className="text-[10px] uppercase tracking-wide text-white/60">
              {isOverdue ? "Días de atraso" : "Días restantes"}
            </p>
            <p
              className={cn(
                "font-[family-name:var(--font-display)] font-bold text-[var(--anasac-aqua)]",
                compact ? "mt-0.5 text-2xl" : "mt-1 text-4xl",
              )}
            >
              {isOverdue ? Math.abs(data.daysRemaining) : data.daysRemaining}
            </p>
            <p className="text-[11px] text-white/70">
              {isOverdue
                ? "después del límite"
                : isToday
                  ? "vence hoy"
                  : data.daysRemaining === 1
                    ? "día"
                    : "días"}
            </p>
          </div>
          <div
            className={cn(
              "relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm",
              compact ? "px-3 py-2" : "px-4 py-3",
            )}
          >
            <p className="text-[10px] uppercase tracking-wide text-white/60">
              Pendientes
            </p>
            <p
              className={cn(
                "font-[family-name:var(--font-display)] font-bold",
                compact ? "mt-0.5 text-base" : "mt-1 text-lg",
              )}
            >
              {formatCrc(data.pendingAmount)}
            </p>
            <p
              className={cn(
                "font-semibold text-[var(--anasac-aqua)]",
                compact ? "mt-0.5 text-xs" : "mt-1 text-sm",
              )}
            >
              {data.pendingCount} cuota{data.pendingCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {showFooter ? (
          <div className={cn("flex flex-wrap items-center gap-2", compact ? "mt-3" : "mt-4")}>
            {showBadge ? (
              <Badge className="bg-white/15 text-white hover:bg-white/20">
                {isOverdue ? "Vencido" : isToday ? "Vence hoy" : "Próximo"}
              </Badge>
            ) : null}
            {showLink && can("payments:view") ? (
              <Link
                href={appHref(basePath, "/pagos")}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-[var(--anasac-navy)] transition hover:bg-[var(--anasac-aqua)]"
              >
                Ver pagos
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
