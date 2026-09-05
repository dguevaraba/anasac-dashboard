import { Skeleton } from "@/components/ui/skeleton";

function BoneCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--anasac-border)] bg-white shadow-[0_8px_24px_rgba(15,44,61,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function CalendarioSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 rounded-2xl border border-[var(--anasac-border)] bg-white/80 px-5 py-4 sm:px-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      </div>

      <BoneCard className="mb-4 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-9 w-40 rounded-lg" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-10 w-52 rounded-lg" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-9 w-14 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-28 rounded-full" />
          ))}
        </div>
      </BoneCard>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <BoneCard className="p-3 md:p-4">
          <div className="mb-2 grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="mx-auto h-3 w-8" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-1.5">
            {Array.from({ length: 35 }).map((_, i) => (
              <div
                key={i}
                className="flex min-h-[88px] flex-col gap-1 rounded-xl border border-[var(--anasac-border)] bg-white p-1.5 md:min-h-[110px] md:p-2"
              >
                <Skeleton className="h-6 w-6 rounded-full" />
                {i % 4 === 0 ? (
                  <Skeleton className="mt-1 h-4 w-full rounded-md" />
                ) : null}
                {i % 7 === 2 ? (
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                ) : null}
              </div>
            ))}
          </div>
        </BoneCard>

        <BoneCard className="p-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="mt-2 h-3 w-40" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--anasac-border)] p-3"
              >
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BoneCard>
      </div>
    </div>
  );
}
