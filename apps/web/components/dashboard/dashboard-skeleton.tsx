import { Skeleton } from "@/components/ui/skeleton";

function BoneCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--anasac-border)] bg-white p-5 shadow-[0_8px_24px_rgba(15,44,61,0.04)]">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
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

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <BoneCard>
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-4 h-10 w-24" />
          <Skeleton className="mt-3 h-3 w-40" />
          <Skeleton className="mt-6 h-2 w-full rounded-full" />
        </BoneCard>
        <BoneCard>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-28 w-full rounded-xl" />
          <Skeleton className="mt-3 h-6 w-24 rounded-full" />
        </BoneCard>
        <BoneCard>
          <Skeleton className="h-4 w-36" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        </BoneCard>
      </div>

      <div className="mt-6 space-y-6">
        <div>
          <Skeleton className="h-6 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
        </div>
        <BoneCard>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-4 h-48 w-full rounded-xl" />
        </BoneCard>
        <div className="grid gap-6 lg:grid-cols-2">
          <BoneCard>
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-4 h-40 w-full rounded-xl" />
          </BoneCard>
          <BoneCard>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mx-auto mt-6 h-36 w-36 rounded-full" />
          </BoneCard>
        </div>
      </div>
    </div>
  );
}
