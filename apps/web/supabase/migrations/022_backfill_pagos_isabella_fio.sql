-- Backfill de pagos para nadadoras que ya existían antes del seed 017
-- (el insert de payments solo usaba el UUID del seed, no el id real por nombre).
-- Incluye Isabella Guevara (Pre y equipo) y Fio/Fiorella Guevara(Guevarra).

with seed (
  first_name, last_name, amount_crc,
  paid_through, debt_from, debt_to, exit_period, paid_at, notes
) as (
  values
    ('Isabella', 'Guevara', 28250,
      '2026-08'::text, null::text, null::text, null::text, '2026-09-01'::date,
      'Al día hasta agosto.'),
    ('Fio', 'Guevara', 25000,
      '2026-08', null, null, null, '2026-09-01'::date,
      'Backfill Fio Guevara (existía antes del seed).'),
    ('Fiorella', 'Guevara', 25000,
      '2026-08', null, null, null, '2026-09-01'::date,
      'Backfill Fiorella Guevara.'),
    ('Fiorella', 'Guevarra', 25000,
      '2026-08', null, null, null, '2026-09-01'::date,
      'Backfill Fiorella Guevarra (hoja Katleen).')
),
resolved as (
  select distinct on (w.id)
    w.id as swimmer_id,
    s.amount_crc,
    s.paid_through,
    s.debt_from,
    s.debt_to,
    s.exit_period,
    s.paid_at,
    s.notes
  from seed s
  join public.swimmers w
    on lower(trim(w.first_name)) = lower(s.first_name)
   and lower(trim(w.last_name)) = lower(s.last_name)
  order by w.id, s.first_name
)
insert into public.payments (
  swimmer_id, concept, amount_crc, due_date, paid_at, status, period, notes
)
select
  r.swimmer_id,
  'Mensualidad ' || to_char(month_start, 'YYYY-MM'),
  r.amount_crc,
  month_start,
  case
    when r.debt_from is not null
      and to_char(month_start, 'YYYY-MM') >= r.debt_from
      and (r.debt_to is null or to_char(month_start, 'YYYY-MM') <= r.debt_to)
      then null
    when r.paid_through is not null
      and to_char(month_start, 'YYYY-MM') <= r.paid_through
      then coalesce(r.paid_at, month_start)
    when r.debt_from is not null
      and to_char(month_start, 'YYYY-MM') < r.debt_from
      then month_start
    else null
  end,
  case
    when r.debt_from is not null
      and to_char(month_start, 'YYYY-MM') >= r.debt_from
      and (r.debt_to is null or to_char(month_start, 'YYYY-MM') <= r.debt_to)
      then 'vencido'
    when r.paid_through is not null
      and to_char(month_start, 'YYYY-MM') <= r.paid_through
      then 'pagado'
    when r.debt_from is not null
      and to_char(month_start, 'YYYY-MM') < r.debt_from
      then 'pagado'
    else 'pendiente'
  end,
  to_char(month_start, 'YYYY-MM'),
  r.notes
from resolved r
cross join lateral (
  select generate_series(
    date '2025-01-01',
    date '2026-08-01',
    interval '1 month'
  )::date as month_start
) months
where (r.exit_period is null or to_char(month_start, 'YYYY-MM') <= r.exit_period)
on conflict (swimmer_id, period) do nothing;
