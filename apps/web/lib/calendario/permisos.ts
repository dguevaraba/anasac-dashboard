import type { Role } from "@/types";

export type TipoEventoCalendario =
  | "competencia"
  | "entrenamiento"
  | "reunion"
  | "otro";

export const TIPOS_EVENTO_CALENDARIO: TipoEventoCalendario[] = [
  "competencia",
  "entrenamiento",
  "reunion",
  "otro",
];

/** Quién puede ver cada tipo. */
export function puedeVerTipoEvento(
  role: Role | null | undefined,
  type: string,
): boolean {
  if (!role) return false;
  if (role === "administrador") return true;
  if (type === "reunion") return role === "asociado";
  if (type === "competencia") {
    return (
      role === "asociado" || role === "entrenador" || role === "nadador"
    );
  }
  if (type === "entrenamiento") {
    return role === "entrenador" || role === "nadador";
  }
  if (type === "otro") {
    return (
      role === "asociado" || role === "entrenador" || role === "nadador"
    );
  }
  return false;
}

/** Quién puede crear / editar / borrar cada tipo. */
export function puedeGestionarTipoEvento(
  role: Role | null | undefined,
  type: string,
): boolean {
  if (!role) return false;
  if (role === "administrador") return true;
  if (type === "reunion") return role === "asociado";
  if (type === "competencia" || type === "entrenamiento") {
    return role === "entrenador";
  }
  if (type === "otro") {
    return role === "asociado" || role === "entrenador";
  }
  return false;
}

export function tiposVisiblesParaRol(
  role: Role | null | undefined,
): TipoEventoCalendario[] {
  return TIPOS_EVENTO_CALENDARIO.filter((t) => puedeVerTipoEvento(role, t));
}

export function tiposCreablesParaRol(
  role: Role | null | undefined,
): TipoEventoCalendario[] {
  return TIPOS_EVENTO_CALENDARIO.filter((t) =>
    puedeGestionarTipoEvento(role, t),
  );
}

export function etiquetaTipoEvento(type: string) {
  if (type === "competencia") return "Competencia";
  if (type === "entrenamiento") return "Entrenamiento";
  if (type === "reunion") return "Reunión";
  if (type === "otro") return "Otro";
  return type;
}
