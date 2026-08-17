import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card bubbles bubblePreset="panel">
      <CardContent className="px-6 py-16 text-center">
        <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-navy)]">
          {title}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
      </CardContent>
    </Card>
  );
}
