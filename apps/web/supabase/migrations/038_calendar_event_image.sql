-- Imagen opcional en eventos de calendario + bucket de storage

alter table public.calendar_events
  add column if not exists image_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'calendar-event-images',
  'calendar-event-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "calendar_event_images_select" on storage.objects;
drop policy if exists "calendar_event_images_insert" on storage.objects;
drop policy if exists "calendar_event_images_update" on storage.objects;
drop policy if exists "calendar_event_images_delete" on storage.objects;

create policy "calendar_event_images_select"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'calendar-event-images');

create policy "calendar_event_images_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'calendar-event-images'
    and public.current_role_code() in ('administrador', 'entrenador', 'asociado')
  );

create policy "calendar_event_images_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'calendar-event-images'
    and public.current_role_code() in ('administrador', 'entrenador', 'asociado')
  )
  with check (
    bucket_id = 'calendar-event-images'
    and public.current_role_code() in ('administrador', 'entrenador', 'asociado')
  );

create policy "calendar_event_images_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'calendar-event-images'
    and public.current_role_code() in ('administrador', 'entrenador', 'asociado')
  );
