-- Roles de producción + invitaciones (solo admin invita)

insert into public.roles (code, name, description)
values
  ('nadador', 'Nadador', 'Consulta de su información deportiva'),
  ('asociado', 'Asociado', 'Miembro de la asociación, principalmente lectura'),
  ('contador', 'Contador', 'Gestión de cobros y pagos')
on conflict (code) do nothing;

update public.roles
set name = 'Administrador',
    description = 'Acceso total. Único rol que invita usuarios.'
where code = 'administrador';

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  role_id uuid not null references public.roles (id),
  invited_email text,
  full_name text,
  invited_by uuid references public.profiles (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  accepted_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_invitations_token on public.invitations (token);
create index if not exists idx_invitations_pending on public.invitations (accepted_at);

alter table public.invitations enable row level security;

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

  insert into public.profiles (id, email, full_name, role_id, is_active)
  values (
    uid,
    user_email,
    coalesce(nullif(inv.full_name, ''), nullif(meta_name, ''), split_part(user_email, '@', 1)),
    inv.role_id,
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        role_id = excluded.role_id,
        is_active = true,
        updated_at = now();

  update public.invitations
  set accepted_at = now(),
      accepted_by = uid,
      updated_at = now()
  where id = inv.id;

  return jsonb_build_object('ok', true, 'email', user_email);
end;
$$;

revoke all on function public.accept_invitation(text) from public;
grant execute on function public.accept_invitation(text) to authenticated;

create or replace function public.preview_invitation(invite_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  inv public.invitations%rowtype;
  role_code text;
  role_name text;
begin
  select * into inv
  from public.invitations
  where token = invite_token;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Invitación no válida');
  end if;

  select r.code, r.name into role_code, role_name
  from public.roles r
  where r.id = inv.role_id;

  return jsonb_build_object(
    'ok', true,
    'full_name', inv.full_name,
    'invited_email', inv.invited_email,
    'role_code', role_code,
    'role_name', role_name,
    'expires_at', inv.expires_at,
    'accepted', inv.accepted_at is not null,
    'expired', inv.expires_at < now()
  );
end;
$$;

revoke all on function public.preview_invitation(text) from public;
grant execute on function public.preview_invitation(text) to anon, authenticated;

drop policy if exists "invitations_admin_all" on public.invitations;
create policy "invitations_admin_all"
  on public.invitations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
