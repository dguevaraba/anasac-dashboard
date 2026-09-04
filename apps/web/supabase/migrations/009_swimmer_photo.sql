-- Foto de perfil de nadadores + bucket de storage

alter table public.swimmers
  add column if not exists photo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'swimmer-photos',
  'swimmer-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "swimmer_photos_select" on storage.objects;
drop policy if exists "swimmer_photos_insert_staff" on storage.objects;
drop policy if exists "swimmer_photos_update_staff" on storage.objects;
drop policy if exists "swimmer_photos_delete_staff" on storage.objects;

create policy "swimmer_photos_select"
  on storage.objects for select
  to authenticated, anon
  using (bucket_id = 'swimmer-photos');

create policy "swimmer_photos_insert_staff"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'entrenador')
  );

create policy "swimmer_photos_update_staff"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'entrenador')
  )
  with check (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'entrenador')
  );

create policy "swimmer_photos_delete_staff"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'entrenador')
  );
