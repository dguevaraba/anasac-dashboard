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
import {
  findCompetition,
  findEvent,
  findSwimmer,
  results,
} from "@/lib/mock/data";
import { formatDate, formatTimeMs } from "@/lib/utils";

export default function ResultsPage() {
  const sorted = [...results].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div>
      <PageHeader
        title="Resultados"
        description="Marcas y puestos registrados en competencias (mock)."
      />
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
              {sorted.map((result) => {
                const swimmer = findSwimmer(result.swimmerId);
                const event = findEvent(result.eventId);
                const competition = findCompetition(result.competitionId);
                return (
                  <TableRow key={result.id}>
                    <TableCell className="font-semibold text-[var(--anasac-navy)]">
                      {swimmer
                        ? `${swimmer.firstName} ${swimmer.lastName}`
                        : "—"}
                    </TableCell>
                    <TableCell>{event?.name ?? "—"}</TableCell>
                    <TableCell>{competition?.name ?? "—"}</TableCell>
                    <TableCell className="font-mono font-semibold text-[var(--anasac-teal)]">
                      {formatTimeMs(result.timeMs)}
                    </TableCell>
                    <TableCell>
                      {result.place ? (
                        <Badge variant="default">{result.place}°</Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{formatDate(result.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
