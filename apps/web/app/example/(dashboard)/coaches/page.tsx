"use client";

import { PageHeader } from "@/components/layout/page-header";
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
import { coaches, teams } from "@/lib/mock/data";

export default function CoachesPage() {
  return (
    <div>
      <PageHeader
        title="Entrenadores"
        description="Cuerpo técnico de ANASAC (datos de demostración)."
      />
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
              {coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-semibold text-[var(--anasac-navy)]">
                    {coach.fullName}
                  </TableCell>
                  <TableCell>{coach.email}</TableCell>
                  <TableCell>{coach.phone ?? "—"}</TableCell>
                  <TableCell>{coach.specialty ?? "—"}</TableCell>
                  <TableCell>
                    {coach.teamIds
                      .map((id) => teams.find((t) => t.id === id)?.name)
                      .filter(Boolean)
                      .join(", ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coach.isActive ? "success" : "muted"}>
                      {coach.isActive ? "activo" : "inactivo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
