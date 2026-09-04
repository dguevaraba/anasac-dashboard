-- Solo administrador y contador pueden crear/editar nadadores y fotos

drop policy if exists "swimmers_write_staff" on public.swimmers;
create policy "swimmers_write_staff" on public.swimmers for all to authenticated
  using (public.current_role_code() in ('administrador', 'contador'))
  with check (public.current_role_code() in ('administrador', 'contador'));

drop policy if exists "swimmer_photos_insert_staff" on storage.objects;
drop policy if exists "swimmer_photos_update_staff" on storage.objects;
drop policy if exists "swimmer_photos_delete_staff" on storage.objects;

create policy "swimmer_photos_insert_staff"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'contador')
  );

create policy "swimmer_photos_update_staff"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'contador')
  )
  with check (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'contador')
  );

create policy "swimmer_photos_delete_staff"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'swimmer-photos'
    and public.current_role_code() in ('administrador', 'contador')
  );
