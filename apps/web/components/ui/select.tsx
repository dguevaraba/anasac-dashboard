import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className={cn("relative", className)}>
    <select
      ref={ref}
      className="flex h-10 w-full appearance-none rounded-lg border border-[var(--anasac-border)] bg-white py-2 pl-3 pr-10 text-sm text-[var(--anasac-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--anasac-teal)] disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    >
      {children}
    </select>
    <ChevronDown
      aria-hidden
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
    />
  </div>
));
Select.displayName = "Select";
