-- Entrenamientos Equipo: lunes a viernes, 5:00–7:30 p.m. (America/Costa_Rica)
-- Septiembre–diciembre 2026

insert into public.calendar_events (
  title,
  description,
  start_at,
  end_at,
  location,
  type,
  organization_id
)
select
  'Entrenamiento Equipo',
  'Entrenamiento de lunes a viernes, 5:00–7:30 p.m.',
  ((d::date + time '17:00') at time zone 'America/Costa_Rica'),
  ((d::date + time '19:30') at time zone 'America/Costa_Rica'),
  'Piscina ANASAC',
  'entrenamiento',
  'a0000001-0000-4000-8000-000000000001'
from generate_series(
  date '2026-09-01',
  date '2026-12-31',
  interval '1 day'
) as d
where extract(isodow from d) between 1 and 5
  and not exists (
    select 1
    from public.calendar_events e
    where e.title = 'Entrenamiento Equipo'
      and e.type = 'entrenamiento'
      and e.organization_id = 'a0000001-0000-4000-8000-000000000001'
      and e.start_at = ((d::date + time '17:00') at time zone 'America/Costa_Rica')
  );
