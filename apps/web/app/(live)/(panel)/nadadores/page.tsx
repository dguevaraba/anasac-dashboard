import { EmptyState } from "@/components/layout/empty-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  puedeVerDatosSensiblesNadador,
  rolActualNadadores,
  selectNadador,
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
  const verSensibles = puedeVerDatosSensiblesNadador(role);

  const [{ data: filasNadadores }, { data: filasCategorias }, { data: filasEntrenadores }] =
    await Promise.all([
      supabase
        .from("swimmers")
        .select(selectNadador(verSensibles))
        .order("last_name", { ascending: true }),
      supabase.from("categories").select("id, name").order("min_age", { ascending: true }),
      supabase
        .from("coaches")
        .select("id, full_name")
        .eq("is_active", true)
        .order("full_name", { ascending: true }),
    ]);

  const nadadores: NadadorItem[] = (filasNadadores ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      nombre: String(r.first_name),
      apellido: String(r.last_name),
      cedula: verSensibles ? ((r.document_id as string | null) ?? null) : null,
      fechaNacimiento: String(r.birth_date).slice(0, 10),
      genero: String(r.gender),
      correo: verSensibles ? ((r.email as string | null) ?? null) : null,
      telefono: verSensibles ? ((r.phone as string | null) ?? null) : null,
      telefonoEncargado: verSensibles
        ? ((r.guardian_phone as string | null) ?? null)
        : null,
      tipoSangre: (r.blood_type as string | null) ?? null,
      fotoUrl: (r.photo_url as string | null) ?? null,
      fechaIngreso: verSensibles && r.join_date
        ? String(r.join_date).slice(0, 10)
        : null,
      diaPago: verSensibles ? ((r.payment_day as number | null) ?? null) : null,
      estado: r.status as NadadorItem["estado"],
      categoriaId: (r.category_id as string | null) ?? null,
      entrenadorId: (r.coach_id as string | null) ?? null,
      categoriaNombre: textoRelacion(r.categories as Rel),
      entrenadorNombre: textoRelacion(r.coaches as Rel, "full_name"),
      creadoEn: String(r.created_at),
    };
  });

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
