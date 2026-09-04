-- Seed Pre y equipo + mensualidades ene 2025→ago 2026 (un solo statement)
-- join_date: 2026-08-01 · birth_date: null (sin placeholder)

with seed (
  sort_order, id, first_name, last_name, gender, status, amount_crc,
  paid_through, debt_from, debt_to, exit_period, paid_at, notes
) as (
  values
    (1,  'a1000001-0001-4000-8000-000000000001'::uuid, 'Monserrath', 'Rodriguez Pizarro', 'femenino', 'inactivo', 15000,
      null::text, '2025-01', '2026-07', '2026-08', null::date,
      'Deuda ago 2024–jul 2026 + rifas/torneo/bingo. Salió ago 2026.'),
    (2,  'a1000001-0001-4000-8000-000000000002'::uuid, 'Yamila', 'Jaen Rodriguez', 'femenino', 'pendiente', 15000,
      null, '2025-07', '2026-06', null, null,
      'Deuda jul 2025–jun 2026 + inscripción Chorotega.'),
    (3,  'a1000001-0001-4000-8000-000000000003'::uuid, 'Aurora', 'Arauz Rojas', 'femenino', 'activo', 15000,
      '2026-08', null, null, null, '2026-08-31'::date,
      'Al día hasta ago. En sept baja a escuelita.'),
    (4,  'a1000001-0001-4000-8000-000000000004'::uuid, 'Mathias', 'Padilla Alvarez', 'masculino', 'pendiente', 15000,
      '2026-08', '2025-09', '2026-06', null, '2026-08-31'::date,
      'Deuda sept 2025–jun 2026; cuota ago pagada.'),
    (5,  'a1000001-0001-4000-8000-000000000005'::uuid, 'Sofia', 'Herra Valerio', 'femenino', 'activo', 15000,
      '2026-08', null, null, null, '2026-09-01'::date,
      'Al día hasta ago. Sale en septiembre.'),
    (6,  'a1000001-0001-4000-8000-000000000006'::uuid, 'Stacy', 'Pomares Ortega', 'femenino', 'inactivo', 15000,
      null, '2025-01', '2026-06', '2026-06', null,
      'Deuda hasta jun 2026 + federación. Salió por lesión.'),
    (7,  'a1000001-0001-4000-8000-000000000007'::uuid, 'Jose Andres', 'Jimenez Hernandez', 'masculino', 'activo', 10000,
      '2026-08', null, null, null, null,
      'Al día hasta agosto.'),
    (8,  'a1000001-0001-4000-8000-000000000008'::uuid, 'Elijah', 'Hutzal', 'masculino', 'activo', 15000,
      '2026-08', null, null, null, null,
      'Al día hasta agosto.'),
    (9,  'a1000001-0001-4000-8000-000000000009'::uuid, 'Katheelin', 'Rodriguez', 'femenino', 'becado', 0,
      '2026-08', null, null, null, null,
      'Becado de cuota de socio.'),
    (10, 'a1000001-0001-4000-8000-000000000010'::uuid, 'Keylor', 'Rodriguez', 'masculino', 'becado', 0,
      '2026-08', null, null, null, null,
      'Becado de cuota; pendiente CNI 2026 (no modelado acá).'),
    (11, 'a1000001-0001-4000-8000-000000000011'::uuid, 'Tamara', 'Lopez', 'femenino', 'activo', 15000,
      '2026-08', null, null, null, '2026-08-27'::date,
      'Al día hasta agosto.'),
    (12, 'a1000001-0001-4000-8000-000000000012'::uuid, 'Luis David', 'Mora', 'masculino', 'pendiente', 15000,
      null, '2026-05', '2026-08', null, null,
      'Debe de mayo a agosto.'),
    (13, 'a1000001-0001-4000-8000-000000000013'::uuid, 'Max', 'Bonilla', 'masculino', 'inactivo', 15000,
      '2026-06', null, null, '2026-06', null,
      'Al día hasta jun. Salió por lesión grave.'),
    (14, 'a1000001-0001-4000-8000-000000000014'::uuid, 'Alexia', 'Leal', 'femenino', 'activo', 15000,
      '2026-08', null, null, null, '2026-08-28'::date,
      'Al día hasta agosto.'),
    (15, 'a1000001-0001-4000-8000-000000000015'::uuid, 'Samantha', 'Guevara', 'femenino', 'activo', 15000,
      '2026-09', null, null, null, '2026-08-07'::date,
      'Al día hasta septiembre.'),
    (16, 'a1000001-0001-4000-8000-000000000016'::uuid, 'Ian', 'Li Wong', 'masculino', 'activo', 15000,
      '2026-09', null, null, null, '2026-08-02'::date,
      'Al día hasta septiembre.'),
    (17, 'a1000001-0001-4000-8000-000000000017'::uuid, 'Samuel Antonio', 'Ruiz', 'masculino', 'pendiente', 15000,
      null, '2026-03', '2026-08', null, null,
      'Debe de marzo a agosto.'),
    (18, 'a1000001-0001-4000-8000-000000000018'::uuid, 'Elena', 'Angulo', 'femenino', 'activo', 15000,
      '2026-08', null, null, null, '2026-08-10'::date,
      'Al día hasta agosto.'),
    (19, 'a1000001-0001-4000-8000-000000000019'::uuid, 'Brisa', 'Toruño', 'femenino', 'activo', 25000,
      '2026-08', null, null, null, '2026-08-30'::date,
      'Al día hasta agosto.'),
    (20, 'a1000001-0001-4000-8000-000000000020'::uuid, 'Eimy', 'Briceño', 'femenino', 'activo', 25000,
      '2026-08', null, null, null, '2026-08-13'::date,
      'Al día hasta agosto.'),
    (21, 'a1000001-0001-4000-8000-000000000021'::uuid, 'Isabella', 'Guevara', 'femenino', 'activo', 28250,
      '2026-08', null, null, null, '2026-09-01'::date,
      'Al día hasta agosto.'),
    (22, 'a1000001-0001-4000-8000-000000000022'::uuid, 'Mariana', 'Mayorga', 'femenino', 'activo', 25000,
      '2026-08', null, null, null, '2026-08-20'::date,
      'Al día hasta agosto.'),
    (23, 'a1000001-0001-4000-8000-000000000023'::uuid, 'Fabiana', 'Chavez', 'femenino', 'activo', 25000,
      '2026-08', null, null, null, '2026-08-24'::date,
      'Al día hasta agosto.'),
    (24, 'a1000001-0001-4000-8000-000000000024'::uuid, 'Johan', 'Cordero', 'masculino', 'activo', 25000,
      '2026-08', null, null, null, '2026-08-29'::date,
      'Al día hasta agosto.'),
    (25, 'a1000001-0001-4000-8000-000000000025'::uuid, 'Carlos', 'Angulo Rodriguez', 'masculino', 'activo', 28000,
      '2026-08', null, null, null, '2026-08-29'::date,
      'Al día hasta agosto.'),
    (26, 'a1000001-0001-4000-8000-000000000026'::uuid, 'Mariana', 'Moreno', 'femenino', 'pendiente', 25000,
      null, '2026-06', '2026-08', null, null,
      'Debe junio–julio–agosto.')
),
ins_swimmers as (
  insert into public.swimmers (
    id, first_name, last_name, birth_date, gender, status,
    join_date, training_group, created_at, updated_at
  )
  select
    s.id,
    s.first_name,
    s.last_name,
    null::date,
    s.gender,
    s.status,
    date '2026-08-01',
    'Pre y equipo',
    now(),
    now()
  from seed s
  where not exists (
    select 1 from public.swimmers existing
    where existing.id = s.id
       or (
         existing.first_name = s.first_name
         and existing.last_name = s.last_name
         and existing.training_group = 'Pre y equipo'
       )
  )
  returning id
)
insert into public.payments (
  swimmer_id, concept, amount_crc, due_date, paid_at, status, period, notes
)
select
  coalesce(
    (select i.id from ins_swimmers i where i.id = s.id),
    (select w.id from public.swimmers w where w.id = s.id),
    (
      select w.id
      from public.swimmers w
      where w.first_name = s.first_name
        and w.last_name = s.last_name
      order by case when w.training_group = 'Pre y equipo' then 0 else 1 end
      limit 1
    )
  ) as swimmer_id,
  'Mensualidad ' || to_char(month_start, 'YYYY-MM'),
  s.amount_crc,
  month_start,
  case
    when s.debt_from is not null
      and to_char(month_start, 'YYYY-MM') >= s.debt_from
      and (s.debt_to is null or to_char(month_start, 'YYYY-MM') <= s.debt_to)
      then null
    when s.paid_through is not null
      and to_char(month_start, 'YYYY-MM') <= s.paid_through
      then coalesce(s.paid_at, month_start)
    when s.debt_from is not null
      and to_char(month_start, 'YYYY-MM') < s.debt_from
      then month_start
    else null
  end,
  case
    when s.debt_from is not null
      and to_char(month_start, 'YYYY-MM') >= s.debt_from
      and (s.debt_to is null or to_char(month_start, 'YYYY-MM') <= s.debt_to)
      then 'vencido'
    when s.paid_through is not null
      and to_char(month_start, 'YYYY-MM') <= s.paid_through
      then 'pagado'
    when s.debt_from is not null
      and to_char(month_start, 'YYYY-MM') < s.debt_from
      then 'pagado'
    else 'pendiente'
  end,
  to_char(month_start, 'YYYY-MM'),
  s.notes
from seed s
cross join lateral (
  select generate_series(
    date '2025-01-01',
    date '2026-08-01',
    interval '1 month'
  )::date as month_start
) months
where (s.exit_period is null or to_char(month_start, 'YYYY-MM') <= s.exit_period)
  and coalesce(
    (select i.id from ins_swimmers i where i.id = s.id),
    (select w.id from public.swimmers w where w.id = s.id),
    (
      select w.id
      from public.swimmers w
      where w.first_name = s.first_name
        and w.last_name = s.last_name
      order by case when w.training_group = 'Pre y equipo' then 0 else 1 end
      limit 1
    )
  ) is not null
on conflict (swimmer_id, period) do nothing;
