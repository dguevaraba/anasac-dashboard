import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { formatDate, formatTimeMs } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Rel = { name?: string; first_name?: string; last_name?: string } | null | unknown;

function asRecord(rel: Rel) {
  if (!rel) return null;
  return (Array.isArray(rel) ? rel[0] : rel) as {
    name?: string;
    first_name?: string;
    last_name?: string;
  } | null;
}

export default async function ResultsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver resultados reales."
      />
    );
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("results")
    .select(
      "id, time_ms, place, created_at, swimmers(first_name, last_name), competition_events(name), competitions(name)",
    )
    .order("created_at", { ascending: false });

  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Resultados"
        description="Marcas y puestos registrados en competencias."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No hay resultados todavía"
          description="Las marcas van a aparecer cuando se registren en una competencia."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nadador</TableHead>
                  <TableHead>Prueba</TableHead>
                  <TableHead>Competencia</TableHead>
                  <TableHead>Tiempo</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((result) => {
                  const swimmer = asRecord(result.swimmers as Rel);
                  const event = asRecord(result.competition_events as Rel);
                  const competition = asRecord(result.competitions as Rel);
                  return (
                    <TableRow key={result.id}>
                      <TableCell className="font-semibold text-[var(--anasac-navy)]">
                        {swimmer
                          ? `${swimmer.first_name} ${swimmer.last_name}`
                          : "—"}
                      </TableCell>
                      <TableCell>{event?.name ?? "—"}</TableCell>
                      <TableCell>{competition?.name ?? "—"}</TableCell>
                      <TableCell className="font-mono text-[var(--anasac-teal)]">
                        {formatTimeMs(result.time_ms)}
                      </TableCell>
                      <TableCell>{result.place ?? "—"}</TableCell>
                      <TableCell>{formatDate(result.created_at)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
