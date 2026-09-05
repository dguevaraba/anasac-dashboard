-- Asociados pueden ver eventos de tipo competencia (solo lectura)

drop policy if exists "calendar_select_by_type" on public.calendar_events;

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
