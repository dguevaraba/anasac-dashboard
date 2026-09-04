-- Teléfono del encargado / tutor

alter table public.swimmers
  add column if not exists guardian_phone text;
