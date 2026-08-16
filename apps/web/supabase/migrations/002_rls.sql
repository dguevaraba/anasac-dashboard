-- Políticas RLS básicas (activar cuando Supabase Auth esté conectado)

alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.teams enable row level security;
alter table public.categories enable row level security;
alter table public.coaches enable row level security;
alter table public.coach_teams enable row level security;
alter table public.swimmers enable row level security;
alter table public.competitions enable row level security;
alter table public.competition_events enable row level security;
alter table public.registrations enable row level security;
alter table public.results enable row level security;
alter table public.calendar_events enable row level security;

create or replace function public.current_role_code()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.code
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_role_code() = 'administrador', false)
$$;

-- Roles: lectura autenticada
create policy "roles_select_authenticated"
  on public.roles for select
  to authenticated
  using (true);

-- Profiles
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_self_or_admin"
  on public.profiles for update
  to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

create policy "profiles_insert_admin"
  on public.profiles for insert
  to authenticated
  with check (public.is_admin());

-- Catálogos de lectura
create policy "teams_select" on public.teams for select to authenticated using (true);
create policy "categories_select" on public.categories for select to authenticated using (true);
create policy "coaches_select" on public.coaches for select to authenticated using (true);
create policy "coach_teams_select" on public.coach_teams for select to authenticated using (true);

create policy "teams_manage_admin" on public.teams for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "categories_manage_admin" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
create policy "coaches_manage_admin" on public.coaches for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Nadadores / competencias / resultados / calendario
create policy "swimmers_select" on public.swimmers for select to authenticated using (true);
create policy "swimmers_write_staff" on public.swimmers for all to authenticated
  using (public.current_role_code() in ('administrador', 'entrenador'))
  with check (public.current_role_code() in ('administrador', 'entrenador'));

create policy "competitions_select" on public.competitions for select to authenticated using (true);
create policy "competitions_write_staff" on public.competitions for all to authenticated
  using (public.current_role_code() in ('administrador', 'entrenador'))
  with check (public.current_role_code() in ('administrador', 'entrenador'));

create policy "events_select" on public.competition_events for select to authenticated using (true);
create policy "events_write_staff" on public.competition_events for all to authenticated
  using (public.current_role_code() in ('administrador', 'entrenador'))
  with check (public.current_role_code() in ('administrador', 'entrenador'));

create policy "registrations_select" on public.registrations for select to authenticated using (true);
create policy "registrations_write_staff" on public.registrations for all to authenticated
  using (public.current_role_code() in ('administrador', 'entrenador'))
  with check (public.current_role_code() in ('administrador', 'entrenador'));

create policy "results_select" on public.results for select to authenticated using (true);
create policy "results_write_staff" on public.results for all to authenticated
  using (public.current_role_code() in ('administrador', 'entrenador'))
  with check (public.current_role_code() in ('administrador', 'entrenador'));

create policy "calendar_select" on public.calendar_events for select to authenticated using (true);
create policy "calendar_write_staff" on public.calendar_events for all to authenticated
  using (public.current_role_code() in ('administrador', 'entrenador'))
  with check (public.current_role_code() in ('administrador', 'entrenador'));
