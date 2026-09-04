/** Grupos alineados a las hojas del Excel de atletas ANASAC. */
export const GRUPOS_NADADOR = [
  "Pre y equipo",
  "Escuelita I Adri",
  "Matronatación",
  "Materno Sofi 8am",
  "Katleen martes y jueves",
  "Katleen L-M-V",
  "Anthony M y J",
  "Anthony sábados",
  "Yuli",
] as const;

export type GrupoNadador = (typeof GRUPOS_NADADOR)[number];

export const GRUPO_DEFAULT: GrupoNadador = "Pre y equipo";

export const GRUPOS_NADADOR_SET = new Set<string>(GRUPOS_NADADOR);
