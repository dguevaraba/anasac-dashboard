-- Día de pago del mes (1–31) en lugar de fecha completa

alter table public.swimmers
  add column if not exists payment_day integer
  check (payment_day is null or (payment_day >= 1 and payment_day <= 31));

update public.swimmers
set payment_day = extract(day from payment_date)::integer
where payment_date is not null
  and payment_day is null;

alter table public.swimmers
  drop column if exists payment_date;
