export type Role = "administrador" | "entrenador" | "consulta";

export type Permission =
  | "dashboard:view"
  | "swimmers:view"
  | "swimmers:manage"
  | "coaches:view"
  | "coaches:manage"
  | "competitions:view"
  | "competitions:manage"
  | "calendar:view"
  | "calendar:manage"
  | "results:view"
  | "results:manage"
  | "payments:view"
  | "payments:manage"
  | "users:view"
  | "users:manage"
  | "settings:view"
  | "settings:manage";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  avatarUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
}

export interface Team {
  id: string;
  name: string;
  code: string;
}

export interface Coach {
  id: string;
  profileId: string;
  fullName: string;
  email: string;
  phone?: string;
  specialty?: string;
  teamIds: string[];
  isActive: boolean;
}

export interface Swimmer {
  id: string;
  firstName: string;
  lastName: string;
  documentId?: string;
  birthDate: string;
  gender: "masculino" | "femenino" | "otro";
  categoryId: string;
  teamId: string;
  coachId?: string;
  email?: string;
  phone?: string;
  status: "activo" | "inactivo" | "lesionado";
  createdAt: string;
  updatedAt: string;
}

export interface Competition {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  status: "programada" | "en_curso" | "finalizada" | "cancelada";
  description?: string;
  poolLength: "25m" | "50m";
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionEvent {
  id: string;
  competitionId: string;
  name: string;
  stroke: "libre" | "espalda" | "pecho" | "mariposa" | "combinado";
  distance: number;
  gender: "masculino" | "femenino" | "mixto";
  categoryId?: string;
}

export interface Result {
  id: string;
  competitionId: string;
  eventId: string;
  swimmerId: string;
  timeMs: number;
  place?: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
  type: "competencia" | "entrenamiento" | "reunion" | "otro";
  competitionId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export type PaymentStatus = "pendiente" | "pagado" | "vencido" | "parcial";

export interface Payment {
  id: string;
  swimmerId: string;
  concept: string;
  amountCrc: number;
  dueDate: string;
  paidAt?: string;
  status: PaymentStatus;
  period: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  present: number;
  absent: number;
  excused: number;
  total: number;
}
