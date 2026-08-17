-- Una invitación no puede cambiar el rol de alguien que ya tiene cuenta.
-- Si el admin abre el enlace, deja de convertirse en contador/nadador/etc.

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
  existing_id uuid;
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

  select id into existing_id
  from public.profiles
  where id = uid;

  if existing_id is not null then
    raise exception 'Esta cuenta ya tiene acceso. Cerrá sesión y abrí el enlace con la cuenta de la persona invitada.';
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
  );

  update public.invitations
  set accepted_at = now(),
      accepted_by = uid,
      updated_at = now()
  where id = inv.id;

  return jsonb_build_object('ok', true, 'email', user_email);
end;
$$;

-- Reparar el caso: el admin abrió su propio enlace y se le pisó el rol.
update public.invitations i
set accepted_at = null,
    accepted_by = null,
    updated_at = now()
where i.accepted_by is not null
  and i.invited_by is not null
  and i.accepted_by = i.invited_by;

update public.profiles p
set role_id = (select id from public.roles where code = 'administrador'),
    updated_at = now()
where p.id in (
  select invited_by
  from public.invitations
  where invited_by is not null
);
