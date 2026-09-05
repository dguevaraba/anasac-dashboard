import { notFound } from "next/navigation";
import { EmptyState } from "@/components/layout/empty-state";
import { hasPermission } from "@/lib/auth/permissions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  puedeVerDatosSensiblesNadador,
  rolActualNadadores,
  SELECT_NADADOR,
} from "./acceso";
import {
  GestorNadadores,
  type OpcionItem,
  type NadadorItem,
} from "./gestor-nadadores";

export const dynamic = "force-dynamic";

type Rel = { name?: string; full_name?: string } | { name?: string; full_name?: string }[] | null;

function textoRelacion(rel: Rel, key: "name" | "full_name" = "name") {
  if (!rel) return null;
  const row = Array.isArray(rel) ? rel[0] : rel;
  return row?.[key] || null;
}

export default async function PaginaNadadores() {
  if (!isSupabaseConfigured()) {
    return (
      <EmptyState
        title="Sin conexión"
        description="Configurá Supabase para ver nadadores reales."
      />
    );
  }

  const { supabase, role } = await rolActualNadadores();
  if (!role || !hasPermission(role, "swimmers:view")) {
    notFound();
  }

  const verSensibles = puedeVerDatosSensiblesNadador(role);

  const [{ data: filasNadadores }, { data: filasCategorias }, { data: filasEntrenadores }] =
    await Promise.all([
      supabase
        .from("swimmers")
        .select(SELECT_NADADOR)
        .order("last_name", { ascending: true }),
      supabase.from("categories").select("id, name").order("min_age", { ascending: true }),
      supabase
        .from("coaches")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name", { ascending: true }),
    ]);

  const nadadores: NadadorItem[] = (filasNadadores ?? []).map((row) => ({
    id: row.id,
    nombre: row.first_name,
    apellido: row.last_name,
    cedula: verSensibles ? row.document_id : null,
    fechaNacimiento: row.birth_date
      ? String(row.birth_date).slice(0, 10)
      : null,
    genero: row.gender,
    correo: verSensibles ? row.email : null,
    telefono: verSensibles ? row.phone : null,
    telefonoEncargado: verSensibles ? row.guardian_phone : null,
    tipoSangre: row.blood_type,
    fotoUrl: row.photo_url,
    fechaIngreso:
      verSensibles && row.join_date ? String(row.join_date).slice(0, 10) : null,
    diaPago: verSensibles ? (row.payment_day ?? null) : null,
    estado: row.status as NadadorItem["estado"],
    categoriaId: row.category_id,
    entrenadorId: row.coach_id,
    grupo: row.training_group,
    categoriaNombre: textoRelacion(row.categories as Rel),
    entrenadorNombre: textoRelacion(row.coaches as Rel, "full_name"),
    creadoEn: row.created_at,
  }));

  const categorias: OpcionItem[] = (filasCategorias ?? []).map((c) => ({
    id: c.id,
    etiqueta: c.name,
  }));
  const entrenadores: OpcionItem[] = (filasEntrenadores ?? []).map((c) => ({
    id: c.id,
    etiqueta: c.full_name,
  }));

  return (
    <GestorNadadores
      nadadores={nadadores}
      categorias={categorias}
      entrenadores={entrenadores}
    />
  );
}
