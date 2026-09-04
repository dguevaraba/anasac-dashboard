-- Renombra estado de nadador: moroso → pendiente

alter table public.swimmers
  drop constraint if exists swimmers_status_check;

update public.swimmers
set status = 'pendiente', updated_at = now()
where status = 'moroso';

alter table public.swimmers
  add constraint swimmers_status_check
  check (status in ('activo', 'inactivo', 'pendiente', 'becado'));
