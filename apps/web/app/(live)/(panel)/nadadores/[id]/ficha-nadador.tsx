"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Activity, CreditCard, Pencil, Trophy } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { appHref, useAppConfig } from "@/lib/app-config";
import { useAuth } from "@/lib/auth/auth-context";
import { cn, formatDate, getAge } from "@/lib/utils";
import {
  actualizarEstadoNadadorAction,
  actualizarNadadorAction,
} from "../actions";
import {
  AvatarNadador,
  VARIANTE_ESTADO,
  type NadadorItem,
  type OpcionItem,
} from "../gestor-nadadores";

const TIPOS_SANGRE = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

function Dato({ etiqueta, valor }: { etiqueta: string; valor: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {etiqueta}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--anasac-navy)]">{valor}</p>
    </div>
  );
}

export function FichaNadador({
  nadador,
  categorias,
  entrenadores,
}: {
  nadador: NadadorItem;
  categorias: OpcionItem[];
  entrenadores: OpcionItem[];
}) {
  const { can } = useAuth();
  const { basePath } = useAppConfig();
  const puedeGestionar = can("swimmers:manage");
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [vistaPreviaFoto, setVistaPreviaFoto] = useState<string | null>(
    nadador.fotoUrl,
  );
  const [actualizandoEstado, setActualizandoEstado] = useState(false);

  function alElegirFoto(file: File | null) {
    if (!file) {
      setVistaPreviaFoto(nadador.fotoUrl);
      return;
    }
    setVistaPreviaFoto(URL.createObjectURL(file));
  }

  async function alGuardar(formData: FormData) {
    setGuardando(true);
    setErrorFormulario(null);
    const resultado = await actualizarNadadorAction(formData);
    setGuardando(false);
    if (!resultado.ok) {
      setErrorFormulario(resultado.error ?? "No se pudo guardar.");
      return;
    }
    setEditando(false);
  }

  async function alCambiarEstado() {
    if (!puedeGestionar) return;
    setActualizandoEstado(true);
    const formData = new FormData();
    formData.set("id", nadador.id);
    formData.set(
      "status",
      nadador.estado === "activo" ? "inactivo" : "activo",
    );
    await actualizarEstadoNadadorAction(formData);
    setActualizandoEstado(false);
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href={appHref(basePath, "/nadadores")}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "gap-2 px-0 text-slate-600 hover:bg-transparent hover:text-[var(--anasac-navy)]",
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a nadadores
        </Link>
      </div>

      <PageHeader
        title={`${nadador.nombre} ${nadador.apellido}`}
        description="Ficha del nadador · datos, pagos y más."
        actions={
          puedeGestionar ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={actualizandoEstado}
                onClick={() => void alCambiarEstado()}
              >
                {nadador.estado === "activo" ? "Desactivar" : "Activar"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={editando ? "outline" : "default"}
                onClick={() => {
                  setEditando((v) => !v);
                  setErrorFormulario(null);
                  setVistaPreviaFoto(nadador.fotoUrl);
                }}
              >
                <Pencil className="h-4 w-4" />
                {editando ? "Cancelar edición" : "Editar"}
              </Button>
            </div>
          ) : null
        }
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card bubbles bubblePreset="avatar">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <AvatarNadador
              nombre={nadador.nombre}
              apellido={nadador.apellido}
              fotoUrl={nadador.fotoUrl}
              size="lg"
            />
            <div>
              <p className="font-semibold text-[var(--anasac-navy)]">
                {nadador.nombre} {nadador.apellido}
              </p>
              <p className="mt-1 text-sm capitalize text-slate-500">
                {nadador.genero}
                {nadador.categoriaNombre ? ` · ${nadador.categoriaNombre}` : ""}
              </p>
            </div>
            <Badge variant={VARIANTE_ESTADO[nadador.estado]}>
              {nadador.estado}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <Dato etiqueta="Edad" valor={`${getAge(nadador.fechaNacimiento)} años`} />
            <Dato
              etiqueta="Nacimiento"
              valor={formatDate(nadador.fechaNacimiento)}
            />
            <Dato etiqueta="Tipo de sangre" valor={nadador.tipoSangre ?? "—"} />
            <Dato
              etiqueta="Entrenador"
              valor={nadador.entrenadorNombre ?? "—"}
            />
            {puedeGestionar ? (
              <>
                <Dato etiqueta="Cédula" valor={nadador.cedula ?? "—"} />
                <Dato etiqueta="Teléfono" valor={nadador.telefono ?? "—"} />
                <Dato
                  etiqueta="Teléfono encargado"
                  valor={nadador.telefonoEncargado ?? "—"}
                />
                <Dato etiqueta="Correo" valor={nadador.correo ?? "—"} />
                <Dato
                  etiqueta="Fecha de ingreso"
                  valor={
                    nadador.fechaIngreso ? formatDate(nadador.fechaIngreso) : "—"
                  }
                />
                <Dato
                  etiqueta="Día de pago"
                  valor={nadador.diaPago != null ? `Día ${nadador.diaPago}` : "—"}
                />
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {editando && puedeGestionar ? (
        <Card className="mb-6" bubbles bubblePreset="panel">
          <CardContent className="p-4">
            <h2 className="mb-3 text-sm font-semibold text-[var(--anasac-navy)]">
              Editar datos
            </h2>
            <form
              key={nadador.id}
              action={alGuardar}
              className="grid gap-3 md:grid-cols-3"
            >
              <input type="hidden" name="id" value={nadador.id} />
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="photo">Foto de perfil</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <AvatarNadador
                    nombre={nadador.nombre}
                    apellido={nadador.apellido}
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
                    {nadador.fotoUrl ? (
                      <label className="flex items-center gap-2 text-sm text-slate-600">
                        <input type="checkbox" name="removePhoto" className="rounded" />
                        Quitar foto actual
                      </label>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  defaultValue={nadador.nombre}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  defaultValue={nadador.apellido}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="birthDate">Fecha de nacimiento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  required
                  defaultValue={nadador.fechaNacimiento}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gender">Género</Label>
                <Select id="gender" name="gender" defaultValue={nadador.genero}>
                  <option value="femenino">Femenino</option>
                  <option value="masculino">Masculino</option>
                  <option value="otro">Otro</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="documentId">Cédula</Label>
                <Input
                  id="documentId"
                  name="documentId"
                  defaultValue={nadador.cedula ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="status">Estado</Label>
                <Select id="status" name="status" defaultValue={nadador.estado}>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="moroso">Moroso</option>
                  <option value="becado">Becado</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="categoryId">Categoría</Label>
                <Select
                  id="categoryId"
                  name="categoryId"
                  defaultValue={nadador.categoriaId ?? ""}
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.etiqueta}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bloodType">Tipo de sangre</Label>
                <Select
                  id="bloodType"
                  name="bloodType"
                  defaultValue={nadador.tipoSangre ?? ""}
                >
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
                <Select
                  id="coachId"
                  name="coachId"
                  defaultValue={nadador.entrenadorId ?? ""}
                >
                  <option value="">Sin entrenador</option>
                  {entrenadores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.etiqueta}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={nadador.correo ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={nadador.telefono ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guardianPhone">Teléfono encargado</Label>
                <Input
                  id="guardianPhone"
                  name="guardianPhone"
                  defaultValue={nadador.telefonoEncargado ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="joinDate">Fecha de ingreso</Label>
                <Input
                  id="joinDate"
                  name="joinDate"
                  type="date"
                  defaultValue={nadador.fechaIngreso ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentDay">Día de pago</Label>
                <Select
                  id="paymentDay"
                  name="paymentDay"
                  defaultValue={
                    nadador.diaPago != null ? String(nadador.diaPago) : ""
                  }
                >
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
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
            {errorFormulario ? (
              <p className="mt-3 text-sm text-red-600">{errorFormulario}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-[var(--anasac-navy)]">
              <CreditCard className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Pagos</h2>
            </div>
            <p className="text-sm text-slate-500">
              Acá vamos a vincular el historial de pagos y cuotas de este
              nadador.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-[var(--anasac-navy)]">
              <Trophy className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Competencias y marcas</h2>
            </div>
            <p className="text-sm text-slate-500">
              Más adelante van a aparecer resultados, inscripciones y tiempos.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-[var(--anasac-navy)]">
              <Activity className="h-4 w-4" />
              <h2 className="text-sm font-semibold">Métricas de entrenamiento</h2>
            </div>
            <p className="text-sm text-slate-500">
              Pronto: peso, asistencia, cargas y seguimiento del entrenador.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
