import * as React from "react";
import { Bubbles } from "@/components/ui/bubbles";
import { cn } from "@/lib/utils";

export function Card({
  className,
  bubbles = false,
  bubblePreset = "panel",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  bubbles?: boolean;
  bubblePreset?: "card" | "header" | "panel" | "hero" | "avatar";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-white shadow-[0_8px_24px_rgba(15,44,61,0.06)]",
        className,
      )}
      {...props}
    >
      {bubbles ? <Bubbles preset={bubblePreset} /> : null}
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative z-[1] flex flex-col gap-1 p-5 pb-3", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-[var(--anasac-navy)]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-slate-500", className)} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative z-[1] p-5 pt-0", className)} {...props} />;
}
