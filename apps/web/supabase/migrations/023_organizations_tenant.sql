-- Multi-tenant (fase DB): organizaciones + organization_id en tablas de negocio.
-- ANASAC queda como org inicial; sin cambios de branding en la app.

-- ---------------------------------------------------------------------------
-- 1. Organizaciones + membresía
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  legal_name text,
  email text,
  phone text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organizations_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint organizations_slug_unique unique (slug)
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (organization_id, profile_id)
);

create index if not exists idx_org_members_profile
  on public.organization_members (profile_id);

alter table public.profiles
  add column if not exists active_organization_id uuid
    references public.organizations (id) on delete set null;

-- Org fija ANASAC (idempotente)
insert into public.organizations (id, slug, name, legal_name, email, is_active)
values (
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'anasac',
  'ANASAC',
  'Asociación de Natación ANASAC',
  'secretaria@anasac.com',
  true
)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  legal_name = excluded.legal_name,
  updated_at = now();

-- ---------------------------------------------------------------------------
-- 2. organization_id en tablas de negocio
-- ---------------------------------------------------------------------------

alter table public.teams
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.categories
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.coaches
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.swimmers
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.competitions
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.calendar_events
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.payments
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

alter table public.invitations
  add column if not exists organization_id uuid
    references public.organizations (id) on delete cascade;

-- Backfill → ANASAC
update public.teams
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.categories
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.coaches
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.swimmers
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.competitions
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.calendar_events
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.payments
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

update public.invitations
set organization_id = 'a0000001-0000-4000-8000-000000000001'
where organization_id is null;

-- Perfiles actuales → miembros de ANASAC + org activa
insert into public.organization_members (organization_id, profile_id)
select
  'a0000001-0000-4000-8000-000000000001'::uuid,
  p.id
from public.profiles p
on conflict do nothing;

update public.profiles
set active_organization_id = 'a0000001-0000-4000-8000-000000000001'
where active_organization_id is null;

-- NOT NULL tras backfill
alter table public.teams
  alter column organization_id set not null;

alter table public.categories
  alter column organization_id set not null;

alter table public.coaches
  alter column organization_id set not null;

alter table public.swimmers
  alter column organization_id set not null;

alter table public.competitions
  alter column organization_id set not null;

alter table public.calendar_events
  alter column organization_id set not null;

alter table public.payments
  alter column organization_id set not null;

alter table public.invitations
  alter column organization_id set not null;

-- Uniques por organización (reemplazan globales)
alter table public.teams drop constraint if exists teams_code_key;
alter table public.teams
  drop constraint if exists teams_organization_code_unique;
alter table public.teams
  add constraint teams_organization_code_unique unique (organization_id, code);

alter table public.categories drop constraint if exists categories_name_key;
alter table public.categories
  drop constraint if exists categories_organization_name_unique;
alter table public.categories
  add constraint categories_organization_name_unique unique (organization_id, name);

create index if not exists idx_teams_organization on public.teams (organization_id);
create index if not exists idx_categories_organization on public.categories (organization_id);
create index if not exists idx_coaches_organization on public.coaches (organization_id);
create index if not exists idx_swimmers_organization on public.swimmers (organization_id);
create index if not exists idx_competitions_organization on public.competitions (organization_id);
create index if not exists idx_calendar_organization on public.calendar_events (organization_id);
create index if not exists idx_payments_organization on public.payments (organization_id);
create index if not exists idx_invitations_organization on public.invitations (organization_id);
create index if not exists idx_profiles_active_org on public.profiles (active_organization_id);

-- ---------------------------------------------------------------------------
-- 3. Helpers (para filtrar / RLS en fases siguientes)
-- ---------------------------------------------------------------------------

create or replace function public.current_organization_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.active_organization_id
      from public.profiles p
      where p.id = auth.uid()
    ),
    (
      select m.organization_id
      from public.organization_members m
      where m.profile_id = auth.uid()
      order by m.joined_at
      limit 1
    )
  )
$$;

create or replace function public.is_organization_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.profile_id = auth.uid()
      and m.organization_id = org_id
  )
$$;

-- ---------------------------------------------------------------------------
-- 4. Invitaciones: al aceptar, unir a la org de la invitación
-- ---------------------------------------------------------------------------

create or replace function public.accept_invitation(invite_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
  uid uuid := auth.uid();
  meta_name text;
  user_email text;
  org_id uuid;
begin
  if uid is null then
    raise exception 'No autenticado';
  end if;

  select * into inv
  from public.invitations
  where token = invite_token
  for update;

  if not found then
    raise exception 'Invitación no válida';
  end if;

  if inv.accepted_at is not null then
    raise exception 'Invitación ya utilizada';
  end if;

  if inv.expires_at < now() then
    raise exception 'Invitación vencida';
  end if;

  select u.email, u.raw_user_meta_data->>'full_name'
    into user_email, meta_name
  from auth.users u
  where u.id = uid;

  org_id := coalesce(
    inv.organization_id,
    'a0000001-0000-4000-8000-000000000001'::uuid
  );

  insert into public.profiles (
    id, email, full_name, role_id, is_active, active_organization_id
  )
  values (
    uid,
    user_email,
    coalesce(nullif(inv.full_name, ''), nullif(meta_name, ''), split_part(user_email, '@', 1)),
    inv.role_id,
    true,
    org_id
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role_id = excluded.role_id,
    is_active = true,
    active_organization_id = coalesce(
      public.profiles.active_organization_id,
      excluded.active_organization_id
    ),
    updated_at = now();

  insert into public.organization_members (organization_id, profile_id)
  values (org_id, uid)
  on conflict do nothing;

  update public.invitations
  set
    accepted_at = now(),
    accepted_by = uid,
    updated_at = now()
  where id = inv.id;

  return jsonb_build_object(
    'ok', true,
    'role_id', inv.role_id,
    'organization_id', org_id
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- 5. RLS lectura básica de orgs / miembros (sin endurecer tablas de negocio aún)
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (public.is_organization_member(id) or public.is_admin());

drop policy if exists "organizations_manage_admin" on public.organizations;
create policy "organizations_manage_admin"
  on public.organizations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "organization_members_select" on public.organization_members;
create policy "organization_members_select"
  on public.organization_members for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin()
    or public.is_organization_member(organization_id)
  );

drop policy if exists "organization_members_manage_admin" on public.organization_members;
create policy "organization_members_manage_admin"
  on public.organization_members for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
