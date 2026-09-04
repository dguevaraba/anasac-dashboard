import { Skeleton } from "@/components/ui/skeleton";

export function FichaPagoSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="mb-4 h-4 w-36" />

      <div className="mb-6 rounded-2xl border border-[var(--anasac-border)] bg-white/80 px-5 py-4 sm:px-6">
        <Skeleton className="h-8 w-56 max-w-full" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5 rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.04)] sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.04)]">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-4 h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
