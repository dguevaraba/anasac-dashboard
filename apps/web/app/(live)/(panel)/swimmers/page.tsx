import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
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
import { getAge } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Rel = { name?: string; full_name?: string } | { name?: string; full_name?: string }[] | null;

function relText(rel: Rel, key: "name" | "full_name" = "name") {
  if (!rel) return "—";
  const row = Array.isArray(rel) ? rel[0] : rel;
  return row?.[key] || "—";
}

export default async function SwimmersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver nadadores reales."
      />
    );
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("swimmers")
    .select(
      "id, first_name, last_name, document_id, birth_date, gender, status, categories(name), teams(name), coaches(full_name)",
    )
    .order("last_name", { ascending: true });

  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Nadadores"
        description="Plantel registrado en ANASAC."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No hay nadadores todavía"
          description="Cuando se registren, van a aparecer en esta lista."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Equipo</TableHead>
                  <TableHead>Entrenador</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((swimmer) => (
                  <TableRow key={swimmer.id}>
                    <TableCell className="font-semibold text-[var(--anasac-navy)]">
                      {swimmer.first_name} {swimmer.last_name}
                    </TableCell>
                    <TableCell>{getAge(swimmer.birth_date)}</TableCell>
                    <TableCell>{relText(swimmer.categories as Rel)}</TableCell>
                    <TableCell>{relText(swimmer.teams as Rel)}</TableCell>
                    <TableCell>
                      {relText(swimmer.coaches as Rel, "full_name")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          swimmer.status === "activo"
                            ? "success"
                            : swimmer.status === "lesionado"
                              ? "warning"
                              : "muted"
                        }
                      >
                        {swimmer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
