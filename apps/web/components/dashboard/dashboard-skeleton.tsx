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
      className={`rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.04)] ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 rounded-2xl border border-[var(--anasac-border)] bg-white/80 px-5 py-4 sm:px-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <BoneCard key={i}>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl bg-[var(--anasac-navy)]/15" />
            </div>
          </BoneCard>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <BoneCard className="min-h-[180px]">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-4 h-8 w-40" />
          <Skeleton className="mt-3 h-3 w-48" />
        </BoneCard>
        <BoneCard className="min-h-[180px]">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-[120px] w-full rounded-xl" />
        </BoneCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <BoneCard>
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-xl bg-[var(--anasac-teal)]/25" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--anasac-border)] px-3 py-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <Skeleton className="mt-2 h-3 w-56 max-w-full" />
              </div>
            ))}
            <Skeleton className="h-4 w-32" />
          </div>
        </BoneCard>
        <div className="hidden lg:block" />
      </div>
    </div>
  );
}
