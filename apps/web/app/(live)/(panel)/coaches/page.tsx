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

export const dynamic = "force-dynamic";

export default async function CoachesPage() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver entrenadores reales."
      />
    );
  }

  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("coaches")
    .select("id, full_name, email, phone, specialty, is_active, coach_teams(teams(name))")
    .order("full_name", { ascending: true });

  const rows = data ?? [];

  return (
    <div>
      <PageHeader
        title="Entrenadores"
        description="Cuerpo técnico registrado en ANASAC."
      />
      {rows.length === 0 ? (
        <EmptyState
          title="No hay entrenadores todavía"
          description="Cuando se registren, van a aparecer en esta lista."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Equipos</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((coach) => {
                  const teams = (coach.coach_teams ?? []) as {
                    teams: { name: string } | { name: string }[] | null;
                  }[];
                  const teamNames = teams
                    .map((link) => {
                      const team = Array.isArray(link.teams) ? link.teams[0] : link.teams;
                      return team?.name;
                    })
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <TableRow key={coach.id}>
                      <TableCell className="font-semibold text-[var(--anasac-navy)]">
                        {coach.full_name}
                      </TableCell>
                      <TableCell>{coach.email ?? "—"}</TableCell>
                      <TableCell>{coach.phone ?? "—"}</TableCell>
                      <TableCell>{coach.specialty ?? "—"}</TableCell>
                      <TableCell>{teamNames || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={coach.is_active ? "success" : "muted"}>
                          {coach.is_active ? "activo" : "inactivo"}
                        </Badge>
                      </TableCell>
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
