import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_VARIANT = {
  programada: "default",
  en_curso: "warning",
  finalizada: "success",
  cancelada: "danger",
} as const;

export default async function CompetitionsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver competencias reales."
      />
    );
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("competitions")
    .select("id, name, location, start_date, end_date, status, pool_length")
    .order("start_date", { ascending: true });

  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Competencias"
        description="Eventos oficiales de la temporada."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No hay competencias todavía"
          description="Cuando se programen, van a aparecer en esta lista."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {rows.map((comp) => (
            <Card key={comp.id} bubbles bubblePreset="panel">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--anasac-navy)]">
                      {comp.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{comp.location}</p>
                  </div>
                  <Badge
                    variant={
                      STATUS_VARIANT[comp.status as keyof typeof STATUS_VARIANT] ??
                      "muted"
                    }
                  >
                    {String(comp.status).replace("_", " ")}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-slate-600">
                  {formatDate(comp.start_date)} — {formatDate(comp.end_date)} ·{" "}
                  {comp.pool_length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
