import type { ReactNode } from "react";
import { Bubbles } from "@/components/ui/bubbles";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mb-6 overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-white/80 px-5 py-4 shadow-[0_8px_24px_rgba(15,44,61,0.04)] sm:px-6",
        className,
      )}
    >
      <Bubbles preset="header" />
      <div className="relative z-[1] flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold tracking-tight text-[var(--anasac-navy)] md:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-slate-500 md:text-base">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}
