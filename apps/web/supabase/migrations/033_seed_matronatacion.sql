-- Seed grupo Matronatación (Excel MATRONATACION · sábados 9am · ago 2026)
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

-- 1) Nadadores
with seed (
  sort_order, id, first_name, last_name, gender, status, join_date
) as (
  values
    (1,  'a9000001-0001-4000-8000-000000000001'::uuid, 'Felipe', 'Salazar Vargas', 'masculino', 'activo', date '2025-12-05'),
    (2,  'a9000001-0001-4000-8000-000000000002'::uuid, 'Aura', 'Arauz', 'femenino', 'activo', null::date),
    (3,  'a9000001-0001-4000-8000-000000000003'::uuid, 'Freddy', 'Ruiz', 'masculino', 'activo', date '2026-01-03'),
    (4,  'a9000001-0001-4000-8000-000000000004'::uuid, 'Emma', 'Ou', 'femenino', 'activo', date '2026-01-17'),
    (5,  'a9000001-0001-4000-8000-000000000005'::uuid, 'Zara Lucia', 'Cascante Mendez', 'femenino', 'activo', date '2026-02-14'),
    (6,  'a9000001-0001-4000-8000-000000000006'::uuid, 'Gabriel', 'Padilla', 'masculino', 'activo', date '2023-10-07'),
    (7,  'a9000001-0001-4000-8000-000000000007'::uuid, 'Mariana', 'Vargas', 'femenino', 'activo', date '2026-04-01'),
    (8,  'a9000001-0001-4000-8000-000000000008'::uuid, 'Zoe', 'Nunez', 'femenino', 'activo', date '2026-03-06'),
    (9,  'a9000001-0001-4000-8000-000000000009'::uuid, 'Nicolas', 'Rodriguez', 'masculino', 'activo', date '2026-02-07'),
    (10, 'a9000001-0001-4000-8000-000000000010'::uuid, 'Johan', '—', 'masculino', 'activo', date '2026-05-09'),
    (11, 'a9000001-0001-4000-8000-000000000011'::uuid, 'Hela', 'Espinoza', 'femenino', 'inactivo', null::date),
    (12, 'a9000001-0001-4000-8000-000000000012'::uuid, 'Isaac', 'Arrieta', 'masculino', 'activo', date '2026-05-02'),
    (13, 'a9000001-0001-4000-8000-000000000013'::uuid, 'Julian', 'Marchena Morales', 'masculino', 'activo', date '2026-08-08'),
    (14, 'a9000001-0001-4000-8000-000000000014'::uuid, 'Gabriel', 'Jimenez Gomez', 'masculino', 'activo', date '2026-08-07'),
    (15, 'a9000001-0001-4000-8000-000000000015'::uuid, 'Ryan', 'Salazar', 'masculino', 'activo', date '2026-08-07'),
    (16, 'a9000001-0001-4000-8000-000000000016'::uuid, 'Ethan', 'Hernandez', 'masculino', 'activo', date '2026-05-09'),
    (17, 'a9000001-0001-4000-8000-000000000017'::uuid, 'Luis', 'Briceno', 'masculino', 'activo', date '2026-01-22')
)
insert into public.swimmers (
  id, first_name, last_name, birth_date, gender, status,
  join_date, training_group, organization_id, created_at, updated_at
)
select
  s.id, s.first_name, s.last_name, null::date, s.gender, s.status,
  s.join_date, 'Matronatación',
  'a0000001-0000-4000-8000-000000000001'::uuid, now(), now()
from seed s
where not exists (
  select 1 from public.swimmers existing
  where existing.id = s.id
     or (
       existing.first_name = s.first_name
       and existing.last_name = s.last_name
       and existing.training_group = 'Matronatación'
     )
);

-- 2) Pagos
with seed (
  id, first_name, last_name, period,
  amount_crc, tax_crc, receipt_number, payment_method, bank, paid_at, notes
) as (
  values
    ('a9000001-0001-4000-8000-000000000001'::uuid, 'Felipe', 'Salazar Vargas', '2026-08',
      20000, 2600, '67725653', 'SINPE', 'BCR', date '2026-08-16', null::text),
    ('a9000001-0001-4000-8000-000000000002'::uuid, 'Aura', 'Arauz', '2026-08',
      20000, 2600, '90751407', 'SINPE', 'BCR', date '2026-08-31', null),
    ('a9000001-0001-4000-8000-000000000003'::uuid, 'Freddy', 'Ruiz', '2026-08',
      20000, 2600, '3780082', 'SINPE', 'BNCR', date '2026-09-01', null),
    ('a9000001-0001-4000-8000-000000000004'::uuid, 'Emma', 'Ou', '2026-08',
      20000, 2600, '9534894', 'SINPE', 'BNCR', date '2026-08-16', null),
    ('a9000001-0001-4000-8000-000000000005'::uuid, 'Zara Lucia', 'Cascante Mendez', '2026-08',
      20000, 2600, '72110705', 'SINPE', 'BAC', date '2026-08-05', null),
    ('a9000001-0001-4000-8000-000000000006'::uuid, 'Gabriel', 'Padilla', '2026-08',
      20000, 2600, '77511401', 'SINPE', 'BNCR', date '2026-08-31', null),
    ('a9000001-0001-4000-8000-000000000007'::uuid, 'Mariana', 'Vargas', '2026-08',
      20000, 2600, '91130081', 'SINPE', 'BCR', date '2026-08-31', null),
    ('a9000001-0001-4000-8000-000000000008'::uuid, 'Zoe', 'Nunez', '2026-08',
      40000, 5200, '91666901', 'SINPE', 'BCR', date '2026-08-31', null),
    ('a9000001-0001-4000-8000-000000000009'::uuid, 'Nicolas', 'Rodriguez', '2026-08',
      20000, 2600, '54479231', 'SINPE', 'BCR', date '2026-08-08', null),
    ('a9000001-0001-4000-8000-000000000012'::uuid, 'Isaac', 'Arrieta', '2026-08',
      20000, 2600, '92670842', 'SINPE', 'BCR', date '2026-09-01', null),
    ('a9000001-0001-4000-8000-000000000013'::uuid, 'Julian', 'Marchena Morales', '2026-08',
      30000, 3900, '48063107', 'SINPE', 'BCR', date '2026-08-04', 'AGOSTO Y MATRICULA'),
    ('a9000001-0001-4000-8000-000000000014'::uuid, 'Gabriel', 'Jimenez Gomez', '2026-08',
      30000, 3900, 'FT26219GWTS4', 'SINPE', 'POPULAR', date '2026-08-07', null),
    ('a9000001-0001-4000-8000-000000000015'::uuid, 'Ryan', 'Salazar', '2026-08',
      30000, 3900, '619164', 'SINPE', 'BNCR', date '2026-08-07', null),
    ('a9000001-0001-4000-8000-000000000016'::uuid, 'Ethan', 'Hernandez', '2026-08',
      20000, 2600, '3604737', 'SINPE', 'BNCR', date '2026-09-03', null),
    ('a9000001-0001-4000-8000-000000000017'::uuid, 'Luis', 'Briceno', '2026-08',
      20000, 2600, 'FT262151LMF8', 'SINPE', 'POPULAR', date '2026-05-03', null)
)
insert into public.payments (
  swimmer_id, concept, amount_crc, tax_crc, due_date, paid_at, status, period,
  receipt_number, payment_method, bank, notes, organization_id
)
select
  coalesce(
    (select w.id from public.swimmers w where w.id = s.id),
    (
      select w.id from public.swimmers w
      where w.first_name = s.first_name and w.last_name = s.last_name
      order by case when w.training_group = 'Matronatación' then 0 else 1 end
      limit 1
    )
  ),
  'Mensualidad ' || s.period,
  s.amount_crc,
  s.tax_crc,
  (s.period || '-01')::date,
  s.paid_at,
  'pagado',
  s.period,
  s.receipt_number,
  s.payment_method,
  s.bank,
  coalesce(
    'Seed Matronatación · Excel agosto 2026' ||
      case when s.notes is not null then ' · ' || s.notes else '' end,
    'Seed Matronatación · Excel agosto 2026'
  ),
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id from public.swimmers w
    where w.first_name = s.first_name and w.last_name = s.last_name
    order by case when w.training_group = 'Matronatación' then 0 else 1 end
    limit 1
  )
) is not null
on conflict (swimmer_id, period) do update set
  amount_crc = excluded.amount_crc,
  tax_crc = excluded.tax_crc,
  paid_at = excluded.paid_at,
  status = excluded.status,
  receipt_number = excluded.receipt_number,
  payment_method = excluded.payment_method,
  bank = excluded.bank,
  notes = excluded.notes,
  updated_at = now();
