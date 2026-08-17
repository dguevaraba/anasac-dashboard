import Image from "next/image";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--anasac-mist)] px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <span className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-[var(--anasac-teal-soft)]/50" />
        <span className="absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-[var(--anasac-aqua)]/15" />
        <span className="absolute right-1/3 top-1/4 h-16 w-16 rounded-full bg-[var(--anasac-teal-soft)]/70" />
      </div>

      <div className="relative z-[1] flex flex-col items-center text-center">
        <div className="relative h-28 w-48 rounded-2xl bg-white p-3 shadow-[0_8px_24px_rgba(15,44,61,0.08)] sm:h-36 sm:w-64">
          <Image
            src="/anasac-logo.png"
            alt="ANASAC"
            fill
            className="object-contain p-2"
            sizes="256px"
            priority
          />
        </div>
        <p className="mt-6 font-[family-name:var(--font-display)] text-sm font-semibold tracking-[0.2em] text-[var(--anasac-teal)] uppercase">
          ANASAC
        </p>
        <p className="mt-2 max-w-sm text-sm text-slate-500">
          Asociación de Natación de Santa Cruz
        </p>
      </div>
    </main>
  );
}
