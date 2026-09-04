-- Fechas de ingreso y pago del nadador

alter table public.swimmers
  add column if not exists join_date date;

alter table public.swimmers
  add column if not exists payment_date date;
