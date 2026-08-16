import { cn } from "@/lib/utils";

type BubbleTone = "soft" | "aqua" | "navy" | "white";
type BubblePreset = "card" | "header" | "panel" | "hero" | "sidebar" | "avatar";

const TONE_CLASS: Record<BubbleTone, string> = {
  soft: "bg-[var(--anasac-teal-soft)]",
  aqua: "bg-[var(--anasac-aqua)]",
  navy: "bg-[var(--anasac-navy)]",
  white: "bg-white",
};

const PRESETS: Record<
  BubblePreset,
  { className: string; tone: BubbleTone; opacity: string }[]
> = {
  card: [
    { className: "-right-6 -top-6 h-24 w-24", tone: "soft", opacity: "opacity-70" },
    { className: "-right-2 top-10 h-10 w-10", tone: "aqua", opacity: "opacity-25" },
  ],
  header: [
    { className: "-right-4 -top-8 h-28 w-28", tone: "soft", opacity: "opacity-60" },
    { className: "right-10 -top-3 h-12 w-12", tone: "aqua", opacity: "opacity-20" },
    { className: "right-28 top-6 h-6 w-6", tone: "soft", opacity: "opacity-80" },
  ],
  panel: [
    { className: "-right-8 -top-10 h-32 w-32", tone: "soft", opacity: "opacity-55" },
    { className: "-left-6 bottom-0 h-20 w-20", tone: "aqua", opacity: "opacity-15" },
    { className: "right-8 bottom-2 h-8 w-8", tone: "soft", opacity: "opacity-70" },
  ],
  hero: [
    { className: "-right-10 -top-12 h-40 w-40", tone: "white", opacity: "opacity-10" },
    { className: "right-16 top-8 h-16 w-16", tone: "aqua", opacity: "opacity-20" },
    { className: "-left-8 bottom-4 h-24 w-24", tone: "white", opacity: "opacity-10" },
    { className: "left-20 -bottom-4 h-10 w-10", tone: "aqua", opacity: "opacity-25" },
  ],
  sidebar: [
    { className: "-right-10 top-24 h-36 w-36", tone: "aqua", opacity: "opacity-10" },
    { className: "-left-8 bottom-28 h-28 w-28", tone: "white", opacity: "opacity-[0.06]" },
    { className: "right-6 bottom-16 h-8 w-8", tone: "aqua", opacity: "opacity-20" },
  ],
  avatar: [
    { className: "-right-4 -top-4 h-20 w-20", tone: "soft", opacity: "opacity-70" },
    { className: "-left-3 bottom-2 h-12 w-12", tone: "aqua", opacity: "opacity-20" },
    { className: "right-8 top-16 h-5 w-5", tone: "soft", opacity: "opacity-90" },
  ],
};

export function Bubbles({
  preset = "card",
  className,
}: {
  preset?: BubblePreset;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {PRESETS[preset].map((bubble, index) => (
        <span
          key={`${preset}-${index}`}
          className={cn(
            "absolute rounded-full",
            TONE_CLASS[bubble.tone],
            bubble.opacity,
            bubble.className,
          )}
        />
      ))}
    </div>
  );
}
