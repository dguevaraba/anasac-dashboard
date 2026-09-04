import { Skeleton } from "@/components/ui/skeleton";

export function FichaNadadorSkeleton() {
  return (
    <div aria-hidden>
      <Skeleton className="mb-4 h-4 w-36" />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="rounded-2xl border border-[var(--anasac-border)] bg-white/80 px-5 py-4 sm:flex-1 sm:px-6">
          <Skeleton className="h-8 w-56 max-w-full" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        </div>
        <div className="flex shrink-0 gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--anasac-border)] bg-white p-6 shadow-[0_8px_24px_rgba(15,44,61,0.04)]">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex w-full flex-col items-center gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-md" />
        </div>

        <div className="grid gap-5 rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.04)] sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.04)]"
          >
            <div className="mb-3 flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-36" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="mt-2 h-3 w-48 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
