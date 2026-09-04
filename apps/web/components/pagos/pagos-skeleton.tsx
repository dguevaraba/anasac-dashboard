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

export function PagosSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-4 flex justify-end">
        <Skeleton className="h-10 w-36 shrink-0 rounded-lg" />
      </div>

      <div className="mb-4 grid gap-3 lg:grid-cols-12 lg:items-stretch">
        <BoneCard className="min-h-[220px] bg-[linear-gradient(145deg,#0f2c3d_0%,#2e768d_70%,#1a7a72_120%)] p-5 lg:col-span-3">
          <div className="flex h-full flex-col justify-between gap-4">
            <div>
              <Skeleton className="h-3 w-24 bg-white/25" />
              <Skeleton className="mt-3 h-6 w-36 bg-white/30" />
              <Skeleton className="mt-2 h-3 w-40 bg-white/20" />
            </div>
            <div>
              <Skeleton className="h-3 w-20 bg-white/25" />
              <Skeleton className="mt-2 h-8 w-28 bg-white/35" />
              <Skeleton className="mt-2 h-3 w-16 bg-white/20" />
            </div>
          </div>
        </BoneCard>

        <div className="flex min-h-[220px] flex-col gap-3 lg:col-span-2">
          <BoneCard className="flex min-h-[100px] flex-1 flex-col justify-center p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-7 w-28" />
            <Skeleton className="mt-2 h-3 w-16" />
          </BoneCard>
          <BoneCard className="flex min-h-[100px] flex-1 flex-col justify-center p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="mt-2 h-7 w-28" />
            <Skeleton className="mt-2 h-3 w-24" />
          </BoneCard>
        </div>

        <BoneCard className="min-h-[220px] p-5 lg:col-span-7">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-[160px] w-full rounded-xl" />
        </BoneCard>
      </div>

      <BoneCard className="mb-4 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-10 w-full rounded-lg md:w-44" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-10 w-full rounded-lg md:w-44" />
          </div>
          <div className="min-w-[200px] flex-1 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="h-10 w-full rounded-lg md:w-44" />
          </div>
          <div className="flex gap-2 md:ml-auto">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
          </div>
        </div>
      </BoneCard>

      <BoneCard className="overflow-hidden">
        <div className="grid grid-cols-4 gap-3 border-b border-[var(--anasac-border)] bg-[var(--anasac-mist)]/60 px-4 py-3 md:grid-cols-9">
          <Skeleton className="mx-auto h-3 w-4" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="hidden h-3 w-14 md:block" />
          <Skeleton className="hidden h-3 w-16 md:block" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="hidden h-3 w-12 md:block" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="hidden h-3 w-14 md:block" />
          <Skeleton className="mx-auto h-3 w-6" />
        </div>
        <div className="divide-y divide-[var(--anasac-border)]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-4 items-center gap-3 px-4 py-3.5 md:grid-cols-9"
            >
              <Skeleton className="mx-auto h-3 w-4" />
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="hidden h-3 w-16 md:block" />
              <Skeleton className="hidden h-3 w-20 md:block" />
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="hidden h-3 w-16 md:block" />
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="hidden h-3 w-16 md:block" />
              <Skeleton className="mx-auto h-8 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </BoneCard>
    </div>
  );
}
