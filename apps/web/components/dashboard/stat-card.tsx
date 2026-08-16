import type { ReactNode } from "react";
import { Bubbles } from "@/components/ui/bubbles";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  hint,
  icon,
  className,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.06)]",
        className,
      )}
    >
      <Bubbles preset="card" />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-[var(--anasac-navy)]">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--anasac-navy)] text-[var(--anasac-aqua)] shadow-sm">
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[var(--anasac-teal-soft)]" />
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
