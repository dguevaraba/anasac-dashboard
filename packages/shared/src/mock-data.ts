import type {
  CalendarEvent,
  Category,
  Coach,
  Competition,
  CompetitionEvent,
  NotificationItem,
  Result,
  Swimmer,
  Team,
  UserProfile,
} from "./types";

/** Datos de demostración — no son datos de producción */
export const DEMO_PASSWORD = "anasac2026";

export const categories: Category[] = [
  { id: "cat-1", name: "Infantil A", minAge: 8, maxAge: 10 },
  { id: "cat-2", name: "Infantil B", minAge: 11, maxAge: 12 },
  { id: "cat-3", name: "Juvenil A", minAge: 13, maxAge: 14 },
  { id: "cat-4", name: "Juvenil B", minAge: 15, maxAge: 16 },
  { id: "cat-5", name: "Mayor", minAge: 17, maxAge: 99 },
];

export const teams: Team[] = [
  { id: "team-1", name: "ANASAC Santa Cruz", code: "ASC" },
  { id: "team-2", name: "Escuela de Natación", code: "ESC" },
];

export const demoUsers: UserProfile[] = [
  {
    id: "user-admin",
    email: "admin@anasaccr.com",
    fullName: "María Fernández",
    role: "administrador",
    phone: "+506 8370 6170",
    createdAt: "2025-01-10T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
    isActive: true,
  },
  {
    id: "user-coach-1",
    email: "entrenador@anasaccr.com",
    fullName: "Carlos Ramírez",
    role: "entrenador",
    phone: "+506 8888 1001",
    createdAt: "2025-02-15T10:00:00.000Z",
    updatedAt: "2026-07-20T10:00:00.000Z",
    isActive: true,
  },
  {
    id: "user-coach-2",
    email: "sofia.mora@anasaccr.com",
    fullName: "Sofía Mora",
    role: "entrenador",
    phone: "+506 8888 1002",
    createdAt: "2025-03-01T10:00:00.000Z",
    updatedAt: "2026-07-18T10:00:00.000Z",
    isActive: true,
  },
  {
    id: "user-consulta",
    email: "consulta@anasaccr.com",
    fullName: "Luis Vargas",
    role: "consulta",
    phone: "+506 8888 2001",
    createdAt: "2025-04-12T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    isActive: true,
  },
];

export const coaches: Coach[] = [
  {
    id: "coach-1",
    profileId: "user-coach-1",
    fullName: "Carlos Ramírez",
    email: "entrenador@anasaccr.com",
    phone: "+506 8888 1001",
    specialty: "Estilos libres y mariposa",
    teamIds: ["team-1"],
    isActive: true,
  },
  {
    id: "coach-2",
    profileId: "user-coach-2",
    fullName: "Sofía Mora",
    email: "sofia.mora@anasaccr.com",
    phone: "+506 8888 1002",
    specialty: "Formación infantil",
    teamIds: ["team-1", "team-2"],
    isActive: true,
  },
];

export const swimmers: Swimmer[] = [
  {
    id: "sw-1",
    firstName: "Ana",
    lastName: "Gutiérrez",
    documentId: "1-2345-6789",
    birthDate: "2012-05-14",
    gender: "femenino",
    categoryId: "cat-2",
    teamId: "team-1",
    coachId: "coach-2",
    email: "ana.gutierrez@demo.anasac.local",
    status: "activo",
    createdAt: "2025-06-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
  },
  {
    id: "sw-2",
    firstName: "Diego",
    lastName: "Castro",
    documentId: "1-2345-6790",
    birthDate: "2009-11-02",
    gender: "masculino",
    categoryId: "cat-4",
    teamId: "team-1",
    coachId: "coach-1",
    status: "activo",
    createdAt: "2025-06-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
  },
  {
    id: "sw-3",
    firstName: "Valeria",
    lastName: "Jiménez",
    birthDate: "2014-03-22",
    gender: "femenino",
    categoryId: "cat-1",
    teamId: "team-2",
    coachId: "coach-2",
    status: "activo",
    createdAt: "2025-07-10T12:00:00.000Z",
    updatedAt: "2026-07-15T12:00:00.000Z",
  },
  {
    id: "sw-4",
    firstName: "Mateo",
    lastName: "Solís",
    birthDate: "2007-08-09",
    gender: "masculino",
    categoryId: "cat-5",
    teamId: "team-1",
    coachId: "coach-1",
    status: "lesionado",
    createdAt: "2025-05-20T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "sw-5",
    firstName: "Camila",
    lastName: "Rojas",
    birthDate: "2011-01-30",
    gender: "femenino",
    categoryId: "cat-3",
    teamId: "team-1",
    coachId: "coach-1",
    status: "activo",
    createdAt: "2025-08-01T12:00:00.000Z",
    updatedAt: "2026-08-01T12:00:00.000Z",
  },
  {
    id: "sw-6",
    firstName: "Andrés",
    lastName: "Porras",
    birthDate: "2013-09-17",
    gender: "masculino",
    categoryId: "cat-2",
    teamId: "team-2",
    coachId: "coach-2",
    status: "inactivo",
    createdAt: "2025-09-01T12:00:00.000Z",
    updatedAt: "2026-05-01T12:00:00.000Z",
  },
];

export const competitions: Competition[] = [
  {
    id: "comp-1",
    name: "Copa Guanacaste 2026",
    location: "Piscina Municipal, Santa Cruz",
    startDate: "2026-09-12",
    endDate: "2026-09-14",
    status: "programada",
    description: "Competencia interclubes de Guanacaste.",
    poolLength: "25m",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "comp-2",
    name: "Torneo ANASAC Invitacional",
    location: "Complejo Deportivo Nicoya",
    startDate: "2026-10-03",
    endDate: "2026-10-04",
    status: "programada",
    poolLength: "50m",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-08-01T10:00:00.000Z",
  },
  {
    id: "comp-3",
    name: "Campeonato Regional Juvenil",
    location: "Liberia, Guanacaste",
    startDate: "2026-07-18",
    endDate: "2026-07-20",
    status: "finalizada",
    poolLength: "25m",
    createdAt: "2026-04-01T10:00:00.000Z",
    updatedAt: "2026-07-21T10:00:00.000Z",
  },
  {
    id: "comp-4",
    name: "Festival Infantil de Natación",
    location: "Piscina ANASAC",
    startDate: "2026-08-22",
    endDate: "2026-08-22",
    status: "en_curso",
    poolLength: "25m",
    createdAt: "2026-05-15T10:00:00.000Z",
    updatedAt: "2026-08-16T10:00:00.000Z",
  },
];

export const competitionEvents: CompetitionEvent[] = [
  {
    id: "ev-1",
    competitionId: "comp-3",
    name: "100m Libre Femenino",
    stroke: "libre",
    distance: 100,
    gender: "femenino",
    categoryId: "cat-3",
  },
  {
    id: "ev-2",
    competitionId: "comp-3",
    name: "50m Mariposa Masculino",
    stroke: "mariposa",
    distance: 50,
    gender: "masculino",
    categoryId: "cat-4",
  },
  {
    id: "ev-3",
    competitionId: "comp-3",
    name: "200m Combinado Femenino",
    stroke: "combinado",
    distance: 200,
    gender: "femenino",
    categoryId: "cat-3",
  },
];

export const results: Result[] = [
  {
    id: "res-1",
    competitionId: "comp-3",
    eventId: "ev-1",
    swimmerId: "sw-5",
    timeMs: 68240,
    place: 1,
    createdAt: "2026-07-19T15:00:00.000Z",
  },
  {
    id: "res-2",
    competitionId: "comp-3",
    eventId: "ev-2",
    swimmerId: "sw-2",
    timeMs: 28410,
    place: 2,
    createdAt: "2026-07-19T16:00:00.000Z",
  },
  {
    id: "res-3",
    competitionId: "comp-3",
    eventId: "ev-3",
    swimmerId: "sw-5",
    timeMs: 158320,
    place: 3,
    createdAt: "2026-07-20T11:00:00.000Z",
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    id: "cal-1",
    title: "Copa Guanacaste 2026",
    description: "Competencia interclubes",
    startAt: "2026-09-12T08:00:00.000Z",
    endAt: "2026-09-14T18:00:00.000Z",
    location: "Piscina Municipal, Santa Cruz",
    type: "competencia",
    competitionId: "comp-1",
  },
  {
    id: "cal-2",
    title: "Entrenamiento matutino",
    startAt: "2026-08-18T06:00:00.000Z",
    endAt: "2026-08-18T08:00:00.000Z",
    location: "Piscina ANASAC",
    type: "entrenamiento",
  },
  {
    id: "cal-3",
    title: "Reunión de entrenadores",
    startAt: "2026-08-20T18:30:00.000Z",
    endAt: "2026-08-20T19:30:00.000Z",
    location: "Oficina ANASAC",
    type: "reunion",
  },
  {
    id: "cal-4",
    title: "Torneo ANASAC Invitacional",
    startAt: "2026-10-03T07:00:00.000Z",
    endAt: "2026-10-04T17:00:00.000Z",
    location: "Complejo Deportivo Nicoya",
    type: "competencia",
    competitionId: "comp-2",
  },
  {
    id: "cal-5",
    title: "Festival Infantil de Natación",
    startAt: "2026-08-22T08:00:00.000Z",
    endAt: "2026-08-22T16:00:00.000Z",
    location: "Piscina ANASAC",
    type: "competencia",
    competitionId: "comp-4",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Nueva competencia publicada",
    body: "Se programó Copa Guanacaste 2026 para septiembre.",
    createdAt: "2026-08-14T09:00:00.000Z",
    read: false,
  },
  {
    id: "n-2",
    title: "Resultados cargados",
    body: "Se publicaron resultados del Campeonato Regional Juvenil.",
    createdAt: "2026-08-12T14:20:00.000Z",
    read: false,
  },
  {
    id: "n-3",
    title: "Recordatorio de reunión",
    body: "Reunión de entrenadores el 20 de agosto a las 18:30.",
    createdAt: "2026-08-10T08:00:00.000Z",
    read: true,
  },
];

export function findCategory(id: string) {
  return categories.find((c) => c.id === id);
}

export function findTeam(id: string) {
  return teams.find((t) => t.id === id);
}

export function findCoach(id?: string) {
  return coaches.find((c) => c.id === id);
}

export function findSwimmer(id: string) {
  return swimmers.find((s) => s.id === id);
}

export function findCompetition(id: string) {
  return competitions.find((c) => c.id === id);
}

export function findEvent(id: string) {
  return competitionEvents.find((e) => e.id === id);
}
