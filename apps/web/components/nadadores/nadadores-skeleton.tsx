import { Skeleton } from "@/components/ui/skeleton";

export function NadadoresSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="rounded-2xl border border-[var(--anasac-border)] bg-white/80 px-5 py-4 sm:flex-1 sm:px-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-3 h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-10 w-40 shrink-0 rounded-lg" />
      </div>

      <div className="mb-4 rounded-2xl border border-[var(--anasac-border)] bg-white p-4 shadow-[0_8px_24px_rgba(15,44,61,0.04)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg md:w-48" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--anasac-border)] bg-white shadow-[0_8px_24px_rgba(15,44,61,0.04)]">
        <div className="grid grid-cols-6 gap-3 border-b border-[var(--anasac-border)] bg-[var(--anasac-mist)]/60 px-4 py-3 md:grid-cols-7">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="hidden h-3 w-16 md:block" />
          <Skeleton className="hidden h-3 w-20 md:block" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="divide-y divide-[var(--anasac-border)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 items-center gap-3 px-4 py-3.5 md:grid-cols-7"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="hidden h-3 w-20 md:block" />
              <Skeleton className="hidden h-3 w-24 md:block" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <div className="flex items-center justify-end gap-2">
                <Skeleton className="h-8 w-20 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
