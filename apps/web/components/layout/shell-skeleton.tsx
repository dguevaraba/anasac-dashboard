import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export function ShellSkeleton() {
  return (
    <div
      className="flex min-h-dvh bg-[var(--anasac-mist)]"
      role="status"
      aria-live="polite"
      aria-label="Cargando panel"
    >
      <aside className="hidden h-dvh w-72 shrink-0 flex-col bg-[var(--anasac-navy)] lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Skeleton className="h-11 w-16 rounded-md bg-white/20" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-white/25" />
            <Skeleton className="h-2.5 w-28 bg-white/15" />
          </div>
        </div>
        <div className="flex-1 space-y-2 px-3 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-10 w-full rounded-xl bg-white/10"
            />
          ))}
        </div>
        <div className="border-t border-white/10 p-4">
          <Skeleton className="h-10 w-full rounded-xl bg-white/10" />
          <Skeleton className="mt-3 h-3 w-36 bg-white/15" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[var(--anasac-border)] bg-white/90 px-4 md:px-6">
          <div className="space-y-2">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </header>
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">
          <DashboardSkeleton />
        </main>
      </div>
      <span className="sr-only">Cargando panel</span>
    </div>
  );
}
