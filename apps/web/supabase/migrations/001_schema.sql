-- ANASAC Dashboard — esquema PostgreSQL (preparado para Supabase)
-- Fase actual: la app usa datos mock. Ejecutar estas migraciones cuando se active Supabase.

create extension if not exists "pgcrypto";

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  phone text,
  role_id uuid not null references public.roles (id),
  is_active boolean not null default true,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  min_age integer not null,
  max_age integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (min_age >= 0 and max_age >= min_age)
);

create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  specialty text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_teams (
  coach_id uuid not null references public.coaches (id) on delete cascade,
  team_id uuid not null references public.teams (id) on delete cascade,
  primary key (coach_id, team_id)
);

create table if not exists public.swimmers (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  document_id text,
  birth_date date not null,
  gender text not null check (gender in ('masculino', 'femenino', 'otro')),
  category_id uuid references public.categories (id),
  team_id uuid references public.teams (id),
  coach_id uuid references public.coaches (id),
  email text,
  phone text,
  status text not null default 'activo'
    check (status in ('activo', 'inactivo', 'lesionado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'programada'
    check (status in ('programada', 'en_curso', 'finalizada', 'cancelada')),
  description text,
  pool_length text not null check (pool_length in ('25m', '50m')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.competition_events (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  name text not null,
  stroke text not null
    check (stroke in ('libre', 'espalda', 'pecho', 'mariposa', 'combinado')),
  distance integer not null check (distance > 0),
  gender text not null check (gender in ('masculino', 'femenino', 'mixto')),
  category_id uuid references public.categories (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  swimmer_id uuid not null references public.swimmers (id) on delete cascade,
  event_id uuid references public.competition_events (id) on delete set null,
  status text not null default 'inscrito'
    check (status in ('inscrito', 'confirmado', 'retirado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (competition_id, swimmer_id, event_id)
);

create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  event_id uuid not null references public.competition_events (id) on delete cascade,
  swimmer_id uuid not null references public.swimmers (id) on delete cascade,
  time_ms integer not null check (time_ms > 0),
  place integer check (place is null or place > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  type text not null
    check (type in ('competencia', 'entrenamiento', 'reunion', 'otro')),
  competition_id uuid references public.competitions (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_at >= start_at)
);

create index if not exists idx_swimmers_team on public.swimmers (team_id);
create index if not exists idx_swimmers_coach on public.swimmers (coach_id);
create index if not exists idx_results_competition on public.results (competition_id);
create index if not exists idx_calendar_start on public.calendar_events (start_at);

insert into public.roles (code, name, description)
values
  ('administrador', 'Administrador', 'Acceso total. Único rol que invita usuarios.'),
  ('entrenador', 'Entrenador', 'Gestión de nadadores y competencias asignadas'),
  ('nadador', 'Nadador', 'Consulta de su información deportiva'),
  ('asociado', 'Asociado', 'Miembro de la asociación, principalmente lectura'),
  ('contador', 'Contador', 'Gestión de cobros y pagos')
on conflict (code) do nothing;
