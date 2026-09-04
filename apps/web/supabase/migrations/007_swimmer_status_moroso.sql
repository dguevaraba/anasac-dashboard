-- Estados de nadador: activo | inactivo | moroso | becado

update public.swimmers
set status = 'inactivo'
where status = 'lesionado';

alter table public.swimmers
  drop constraint if exists swimmers_status_check;

alter table public.swimmers
  add constraint swimmers_status_check
  check (status in ('activo', 'inactivo', 'moroso', 'becado'));
