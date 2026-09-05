-- Reincorpora tipo "otro" si 034 se aplicó sin él
alter table public.calendar_events
  drop constraint if exists calendar_events_type_check;

alter table public.calendar_events
  add constraint calendar_events_type_check
  check (type in ('competencia', 'entrenamiento', 'reunion', 'otro'));

drop policy if exists "calendar_select_by_type" on public.calendar_events;
drop policy if exists "calendar_insert_by_type" on public.calendar_events;
drop policy if exists "calendar_update_by_type" on public.calendar_events;
drop policy if exists "calendar_delete_by_type" on public.calendar_events;

create policy "calendar_select_by_type" on public.calendar_events
  for select to authenticated
  using (
    public.current_role_code() = 'administrador'
    or (
      type = 'reunion'
      and public.current_role_code() = 'asociado'
    )
    or (
      type = 'competencia'
      and public.current_role_code() in ('asociado', 'entrenador', 'nadador')
    )
    or (
      type = 'entrenamiento'
      and public.current_role_code() in ('entrenador', 'nadador')
    )
    or (
      type = 'otro'
      and public.current_role_code() in ('asociado', 'entrenador', 'nadador')
    )
  );

create policy "calendar_insert_by_type" on public.calendar_events
  for insert to authenticated
  with check (
    public.current_role_code() = 'administrador'
    or (
      type = 'reunion'
      and public.current_role_code() = 'asociado'
    )
    or (
      type in ('competencia', 'entrenamiento')
      and public.current_role_code() = 'entrenador'
    )
    or (
      type = 'otro'
      and public.current_role_code() in ('asociado', 'entrenador')
    )
  );

create policy "calendar_update_by_type" on public.calendar_events
  for update to authenticated
  using (
    public.current_role_code() = 'administrador'
    or (
      type = 'reunion'
      and public.current_role_code() = 'asociado'
    )
    or (
      type in ('competencia', 'entrenamiento')
      and public.current_role_code() = 'entrenador'
    )
    or (
      type = 'otro'
      and public.current_role_code() in ('asociado', 'entrenador')
    )
  )
  with check (
    public.current_role_code() = 'administrador'
    or (
      type = 'reunion'
      and public.current_role_code() = 'asociado'
    )
    or (
      type in ('competencia', 'entrenamiento')
      and public.current_role_code() = 'entrenador'
    )
    or (
      type = 'otro'
      and public.current_role_code() in ('asociado', 'entrenador')
    )
  );

create policy "calendar_delete_by_type" on public.calendar_events
  for delete to authenticated
  using (
    public.current_role_code() = 'administrador'
    or (
      type = 'reunion'
      and public.current_role_code() = 'asociado'
    )
    or (
      type in ('competencia', 'entrenamiento')
      and public.current_role_code() = 'entrenador'
    )
    or (
      type = 'otro'
      and public.current_role_code() in ('asociado', 'entrenador')
    )
  );
