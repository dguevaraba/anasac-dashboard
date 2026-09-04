"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Eye, Plus, Search, User, BrushCleaning } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/layout/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";
import {
  GRUPOS_NADADOR,
  GRUPO_DEFAULT,
} from "@/lib/nadadores/grupos";
import { formatDate, getAge, cn } from "@/lib/utils";
import {
  crearNadadorAction,
} from "./actions";

export type NadadorItem = {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string | null;
  fechaNacimiento: string | null;
  genero: string;
  correo: string | null;
  telefono: string | null;
  telefonoEncargado: string | null;
  tipoSangre: string | null;
  fotoUrl: string | null;
  fechaIngreso: string | null;
  diaPago: number | null;
  estado: "activo" | "inactivo" | "pendiente" | "becado";
  categoriaId: string | null;
  entrenadorId: string | null;
  grupo: string | null;
  categoriaNombre: string | null;
  entrenadorNombre: string | null;
  creadoEn: string;
};

export type OpcionItem = { id: string; etiqueta: string };

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

export const VARIANTE_ESTADO = {
  activo: "success",
  inactivo: "danger",
  pendiente: "warning",
  becado: "default",
} as const;

export function AvatarNadador({
  nombre,
  apellido,
  fotoUrl,
  size = "md",
}: {
  nombre: string;
  apellido: string;
  fotoUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "sm" ? "h-9 w-9" : size === "lg" ? "h-24 w-24" : "h-16 w-16";
  const icon =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-10 w-10" : "h-6 w-6";
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={`${nombre} ${apellido}`}
        className={`${dim} shrink-0 rounded-full object-cover ring-1 ring-[var(--anasac-border)]`}
      />
    );
  }
  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-full bg-[var(--anasac-mist)] text-[var(--anasac-navy)] ring-1 ring-[var(--anasac-border)]`}
      aria-hidden
    >
      <User className={icon} />
    </div>
  );
}

export function GestorNadadores({
  nadadores,
  categorias,
  entrenadores,
}: {
  nadadores: NadadorItem[];
  categorias: OpcionItem[];
  entrenadores: OpcionItem[];
}) {
  const { can, user } = useAuth();
  const { basePath } = useAppConfig();
  const puedeGestionar = can("swimmers:manage");
  const puedeVerEstado = user?.role !== "asociado";
  const [consulta, setConsulta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroGrupo, setFiltroGrupo] = useState(GRUPO_DEFAULT);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState<string | null>(null);

  const filtrados = useMemo(() => {
    return nadadores.filter((n) => {
      const q = consulta.trim().toLowerCase();
      const coincideConsulta =
        !q ||
        n.nombre.toLowerCase().includes(q) ||
        n.apellido.toLowerCase().includes(q);
      const coincideEstado =
        !puedeVerEstado ||
        filtroEstado === "todos" ||
        n.estado === filtroEstado;
      const coincideCategoria =
        filtroCategoria === "todas" || n.categoriaId === filtroCategoria;
      const coincideGrupo =
        filtroGrupo === "todos" || n.grupo === filtroGrupo;
      return (
        coincideConsulta &&
        coincideEstado &&
        coincideCategoria &&
        coincideGrupo
      );
    });
  }, [
    nadadores,
    consulta,
    filtroEstado,
    filtroCategoria,
    filtroGrupo,
    puedeVerEstado,
  ]);

  const totalVista = filtrados.length;

  const columnasExtra =
    (puedeGestionar ? 3 : 0) + (puedeVerEstado ? 1 : 0);

  const filtrosActivos =
    consulta.trim() !== "" ||
    filtroCategoria !== "todas" ||
    filtroGrupo !== GRUPO_DEFAULT ||
    (puedeVerEstado && filtroEstado !== "todos");

  function limpiarFiltros() {
    setConsulta("");
    setFiltroEstado("todos");
    setFiltroCategoria("todas");
    setFiltroGrupo(GRUPO_DEFAULT);
  }

  function abrirCrear() {
    setVistaPreviaFoto(null);
    setErrorFormulario(null);
    setMostrarFormulario(true);
  }

  function cerrarFormulario() {
    setMostrarFormulario(false);
    setVistaPreviaFoto(null);
    setErrorFormulario(null);
  }

  function alElegirFoto(file: File | null) {
    if (!file) {
      setVistaPreviaFoto(null);
      return;
    }
    setVistaPreviaFoto(URL.createObjectURL(file));
  }

  async function alEnviar(formData: FormData) {
    setGuardando(true);
    setErrorFormulario(null);
    const resultado = await crearNadadorAction(formData);
    setGuardando(false);
    if (!resultado.ok) {
      setErrorFormulario(resultado.error ?? "No se pudo guardar el nadador.");
      return;
    }
    cerrarFormulario();
  }

  return (
    <div>
      <PageHeader
        title="Nadadores"
        description="Plantel registrado en ANASAC."
        actions={
          puedeGestionar ? (
            <Button type="button" onClick={abrirCrear}>
              <Plus className="h-4 w-4" />
              Nuevo nadador
            </Button>
          ) : undefined
        }
      />

      <Card className="mb-4" bubbles bubblePreset="card">
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:flex-wrap md:items-center">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre o apellido..."
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
            />
          </div>
          <Select
            className="md:w-52"
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            aria-label="Filtrar por grupo"
          >
            <option value="todos">Todos los grupos</option>
            {GRUPOS_NADADOR.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
              </option>
            ))}
          </Select>
          <Select
            className="md:w-48"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            aria-label="Filtrar por categoría"
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.etiqueta}
              </option>
            ))}
          </Select>
          {puedeVerEstado ? (
            <Select
              className="md:w-48"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="pendiente">Pendiente</option>
              <option value="becado">Becado</option>
            </Select>
          ) : null}
          {filtrosActivos ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0 text-slate-500"
              onClick={limpiarFiltros}
              aria-label="Limpiar filtros"
              title="Limpiar filtros"
            >
              <BrushCleaning className="h-4 w-4" />
            </Button>
          ) : null}
        </CardContent>
      </Card>

      {mostrarFormulario && puedeGestionar ? (
        <Card className="mb-4" bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--anasac-navy)]">
              Nuevo nadador
            </h2>
            <form
              key="nuevo"
              action={alEnviar}
              className="grid gap-3 md:grid-cols-3"
            >
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="photo">Foto de perfil</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <AvatarNadador
                    nombre="Nadador"
                    apellido=""
                    fotoUrl={vistaPreviaFoto}
                    size="md"
                  />
                  <div className="min-w-[220px] flex-1 space-y-2">
                    <Input
                      id="photo"
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => alElegirFoto(e.target.files?.[0] ?? null)}
                    />
                    <p className="text-xs text-slate-500">
                      JPG, PNG, WEBP o GIF · máximo 5 MB
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="birthDate">Fecha de nacimiento (opcional)</Label>
                <Input id="birthDate" name="birthDate" type="date" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender">Género</Label>
                <Select id="gender" name="gender" defaultValue="femenino">
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="documentId">Cédula (opcional)</Label>
                <Input id="documentId" name="documentId" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Estado</Label>
                <Select id="status" name="status" defaultValue="activo">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="becado">Becado</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="categoryId">Categoría</Label>
                <Select id="categoryId" name="categoryId" defaultValue="">
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.etiqueta}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="trainingGroup">Grupo</Label>
                <Select
                  id="trainingGroup"
                  name="trainingGroup"
                  defaultValue={GRUPO_DEFAULT}
                >
                  <option value="">Sin grupo</option>
                  {GRUPOS_NADADOR.map((grupo) => (
                    <option key={grupo} value={grupo}>
                      {grupo}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bloodType">Tipo de sangre</Label>
                <Select id="bloodType" name="bloodType" defaultValue="">
                  <option value="">Sin especificar</option>
                  {TIPOS_SANGRE.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="coachId">Entrenador</Label>
                <Select id="coachId" name="coachId" defaultValue="">
                  <option value="">Sin entrenador</option>
                  {entrenadores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.etiqueta}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Correo (opcional)</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Teléfono (opcional)</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guardianPhone">Teléfono encargado (opcional)</Label>
                <Input id="guardianPhone" name="guardianPhone" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="joinDate">Fecha de ingreso</Label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  defaultValue={hoyIso()}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentDay">Día de pago</Label>
                <Select id="paymentDay" name="paymentDay" defaultValue="">
                  <option value="">Sin definir</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                    <option key={dia} value={dia}>
                      {dia}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex items-end gap-2 md:col-span-3">
                <Button type="submit" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar nadador"}
                </Button>
                <Button type="button" variant="outline" onClick={cerrarFormulario}>
                  Cancelar
                </Button>
              </div>
            </form>
            {errorFormulario ? (
              <p className="mt-3 text-sm text-red-600">{errorFormulario}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {nadadores.length === 0 && !mostrarFormulario ? (
        <EmptyState
          title="No hay nadadores todavía"
          description={
            puedeGestionar
              ? "Usá «Nuevo nadador» para registrar el primero."
              : "Cuando se registren, van a aparecer en esta lista."
          }
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>
                  <TableHead>Nadador</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Categoría</TableHead>
                  {puedeGestionar ? (
                    <>
                      <TableHead>Ingreso</TableHead>
                      <TableHead>Día pago</TableHead>
                      <TableHead>Teléfono</TableHead>
                    </>
                  ) : null}
                  {puedeVerEstado ? <TableHead>Estado</TableHead> : null}
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((n, index) => (
                  <TableRow key={n.id}>
                    <TableCell className="text-center text-slate-500">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarNadador
                          nombre={n.nombre}
                          apellido={n.apellido}
                          fotoUrl={n.fotoUrl}
                          size="sm"
                        />
                        <div>
                          <p className="font-semibold text-[var(--anasac-navy)]">
                            {n.nombre} {n.apellido}
                          </p>
                          <p className="text-xs capitalize text-slate-500">
                            {n.genero}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {n.fechaNacimiento ? getAge(n.fechaNacimiento) : "—"}
                    </TableCell>
                    <TableCell>{n.grupo ?? "—"}</TableCell>
                    <TableCell>{n.categoriaNombre ?? "—"}</TableCell>
                    {puedeGestionar ? (
                      <>
                        <TableCell>
                          {n.fechaIngreso ? formatDate(n.fechaIngreso) : "—"}
                        </TableCell>
                        <TableCell>
                          {n.diaPago != null ? n.diaPago : "—"}
                        </TableCell>
                        <TableCell>{n.telefono ?? "—"}</TableCell>
                      </>
                    ) : null}
                    {puedeVerEstado ? (
                      <TableCell>
                        <Badge variant={VARIANTE_ESTADO[n.estado]}>
                          {n.estado}
                        </Badge>
                      </TableCell>
                    ) : null}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Link
                          href={appHref(basePath, `/nadadores/${n.id}`)}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-8 w-8",
                          )}
                          aria-label={`Ver ficha de ${n.nombre} ${n.apellido}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              {filtrados.length > 0 ? (
                <TableFooter>
                  <TableRow className="hover:bg-transparent">
                    <TableCell className="text-center font-semibold text-[var(--anasac-navy)]">
                      {totalVista}
                    </TableCell>
                    <TableCell
                      colSpan={5 + columnasExtra}
                      className="font-semibold text-[var(--anasac-navy)]"
                    >
                      Total
                    </TableCell>
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
            {filtrados.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500">
                No se encontraron nadadores.
              </p>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
