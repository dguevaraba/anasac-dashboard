-- Factura adjunta a pagos (imagen o PDF) + bucket de storage

alter table public.payments
  add column if not exists invoice_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-invoices',
  'payment-invoices',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "payment_invoices_select" on storage.objects;
drop policy if exists "payment_invoices_insert_staff" on storage.objects;
drop policy if exists "payment_invoices_update_staff" on storage.objects;
drop policy if exists "payment_invoices_delete_staff" on storage.objects;

create policy "payment_invoices_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'payment-invoices');

create policy "payment_invoices_insert_staff"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'payment-invoices'
    and public.current_role_code() in ('administrador', 'contador')
  );

create policy "payment_invoices_update_staff"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'payment-invoices'
    and public.current_role_code() in ('administrador', 'contador')
  )
  with check (
    bucket_id = 'payment-invoices'
    and public.current_role_code() in ('administrador', 'contador')
  );

create policy "payment_invoices_delete_staff"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'payment-invoices'
    and public.current_role_code() in ('administrador', 'contador')
  );
