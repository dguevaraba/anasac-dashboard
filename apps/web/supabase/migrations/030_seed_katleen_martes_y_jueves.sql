-- Seed grupo Katleen martes y jueves (Excel KATLEEN MARTES Y JUEVES · Nivel II · ago 2026)
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

-- 1) Nadadores
with seed (
  sort_order, id, first_name, last_name, gender, status, join_date
) as (
  values
    (1,  'a6000001-0001-4000-8000-000000000001'::uuid, 'Fatima Isabella', 'Matarrita Gutierrez', 'femenino', 'activo', date '2026-02-06'),
    (2,  'a6000001-0001-4000-8000-000000000002'::uuid, 'Amaya', 'Marchena', 'femenino', 'activo', date '2024-04-01'),
    (3,  'a6000001-0001-4000-8000-000000000003'::uuid, 'Ximena', 'Pizarro Cabalceta', 'femenino', 'activo', date '2021-05-16'),
    (4,  'a6000001-0001-4000-8000-000000000004'::uuid, 'Heidy', 'Feng Wu', 'femenino', 'activo', date '2024-08-05'),
    (5,  'a6000001-0001-4000-8000-000000000005'::uuid, 'Heimy', 'Feng Wu', 'femenino', 'activo', date '2024-08-05'),
    (6,  'a6000001-0001-4000-8000-000000000006'::uuid, 'Emma', 'Villafuerte', 'femenino', 'activo', date '2025-12-02'),
    (7,  'a6000001-0001-4000-8000-000000000007'::uuid, 'Yariel', 'Guzman', 'masculino', 'activo', date '2025-12-02'),
    (8,  'a6000001-0001-4000-8000-000000000008'::uuid, 'Isaias', 'Vanegas Villarreal', 'masculino', 'pendiente', date '2025-03-27'),
    (9,  'a6000001-0001-4000-8000-000000000009'::uuid, 'Liam Josue', 'Barrantes Lara', 'masculino', 'pendiente', date '2025-01-04'),
    (10, 'a6000001-0001-4000-8000-000000000010'::uuid, 'Fabiana', 'Lopez', 'femenino', 'pendiente', date '2025-08-05'),
    (11, 'a6000001-0001-4000-8000-000000000011'::uuid, 'Neythan', 'Gutierrez Angulo', 'masculino', 'activo', date '2024-06-23'),
    (12, 'a6000001-0001-4000-8000-000000000012'::uuid, 'Abigail', 'Alvarez', 'femenino', 'activo', date '2026-01-13'),
    (13, 'a6000001-0001-4000-8000-000000000013'::uuid, 'Julian', 'Moraga', 'masculino', 'activo', date '2026-05-28'),
    (14, 'a6000001-0001-4000-8000-000000000014'::uuid, 'Jared', 'Gutierrez de la O', 'masculino', 'inactivo', null::date),
    (15, 'a6000001-0001-4000-8000-000000000015'::uuid, 'Bismarck', 'Gutierrez de la O', 'masculino', 'inactivo', null::date),
    (16, 'a6000001-0001-4000-8000-000000000016'::uuid, 'Camilo', 'Sponza', 'masculino', 'activo', date '2026-02-12'),
    (17, 'a6000001-0001-4000-8000-000000000017'::uuid, 'Marisa', 'Briceno', 'femenino', 'activo', date '2026-04-03'),
    (18, 'a6000001-0001-4000-8000-000000000018'::uuid, 'Alba', 'Arauz', 'femenino', 'activo', null::date),
    (19, 'a6000001-0001-4000-8000-000000000019'::uuid, 'Seth', 'Chavarria', 'masculino', 'activo', date '2026-07-07'),
    (20, 'a6000001-0001-4000-8000-000000000020'::uuid, 'Theo', 'Beckles', 'masculino', 'pendiente', date '2026-06-08'),
    (21, 'a6000001-0001-4000-8000-000000000021'::uuid, 'Gael', 'Ramirez', 'masculino', 'activo', date '2024-03-02')
)
insert into public.swimmers (
  id, first_name, last_name, birth_date, gender, status,
  join_date, training_group, organization_id, created_at, updated_at
)
select
  s.id, s.first_name, s.last_name, null::date, s.gender, s.status,
  s.join_date, 'Katleen martes y jueves',
  'a0000001-0000-4000-8000-000000000001'::uuid, now(), now()
from seed s
where not exists (
  select 1 from public.swimmers existing
  where existing.id = s.id
     or (
       existing.first_name = s.first_name
       and existing.last_name = s.last_name
       and existing.training_group = 'Katleen martes y jueves'
     )
);

-- 2) Pagos (cuotas con comprobante)
with seed (
  id, first_name, last_name, period,
  amount_crc, tax_crc, receipt_number, payment_method, bank, paid_at, notes
) as (
  values
    ('a6000001-0001-4000-8000-000000000001'::uuid, 'Fatima Isabella', 'Matarrita Gutierrez', '2026-08',
      23000, 2900, '4548552', 'SINPE', 'BNCR', date '2026-09-01', null::text),
    ('a6000001-0001-4000-8000-000000000002'::uuid, 'Amaya', 'Marchena', '2026-08',
      23000, 2990, '17374916', 'SINPE', 'BCR', date '2026-08-02', null),
    ('a6000001-0001-4000-8000-000000000003'::uuid, 'Ximena', 'Pizarro Cabalceta', '2026-08',
      23000, 2990, 'FT26244PX0D8', 'SINPE', 'POPULAR', date '2026-09-01', null),
    ('a6000001-0001-4000-8000-000000000004'::uuid, 'Heidy', 'Feng Wu', '2026-08',
      20000, 2600, '48896611', 'SINPE', 'BNCR', date '2026-08-07', null),
    ('a6000001-0001-4000-8000-000000000005'::uuid, 'Heimy', 'Feng Wu', '2026-08',
      20000, 2600, '48896611', 'SINPE', 'BNCR', date '2026-08-07', null),
    ('a6000001-0001-4000-8000-000000000007'::uuid, 'Yariel', 'Guzman', '2026-08',
      23000, 2990, '87217688', 'SINPE', 'BCR', date '2026-08-29', null),
    -- Julio pagado; debe agosto
    ('a6000001-0001-4000-8000-000000000010'::uuid, 'Fabiana', 'Lopez', '2026-07',
      23000, 2990, '54180441', 'SINPE', 'BNCR', date '2026-08-08', 'JULIO (DEBE AGOSTO)'),
    ('a6000001-0001-4000-8000-000000000011'::uuid, 'Neythan', 'Gutierrez Angulo', '2026-08',
      20000, 2600, '46776821', 'SINPE', 'BNCR', date '2026-08-26', null),
    ('a6000001-0001-4000-8000-000000000012'::uuid, 'Abigail', 'Alvarez', '2026-08',
      23000, 2990, '96307221', 'SINPE', 'BNCR', date '2026-08-12', null),
    ('a6000001-0001-4000-8000-000000000013'::uuid, 'Julian', 'Moraga', '2026-08',
      20000, 2600, '18191933', 'SINPE', 'BNCR', date '2026-09-01', null),
    ('a6000001-0001-4000-8000-000000000016'::uuid, 'Camilo', 'Sponza', '2026-08',
      25000, 3250, '16839715', 'SINPE', 'BNCR', date '2026-08-31', null),
    ('a6000001-0001-4000-8000-000000000017'::uuid, 'Marisa', 'Briceno', '2026-08',
      25000, 3250, '20603627', 'SINPE', 'BNCR', date '2026-09-01', null),
    ('a6000001-0001-4000-8000-000000000018'::uuid, 'Alba', 'Arauz', '2026-08',
      20000, 2600, '90751407', 'SINPE', 'BCR', date '2026-08-31', null),
    ('a6000001-0001-4000-8000-000000000019'::uuid, 'Seth', 'Chavarria', '2026-08',
      23000, 2990, '85317235', 'SINPE', 'BCR', date '2026-08-28', null),
    ('a6000001-0001-4000-8000-000000000021'::uuid, 'Gael', 'Ramirez', '2026-08',
      23000, 2990, '92157921', 'SINPE', 'BCR', date '2026-08-31', null)
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
      order by case when w.training_group = 'Katleen martes y jueves' then 0 else 1 end
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
    'Seed Katleen martes y jueves · Excel agosto 2026' ||
      case when s.notes is not null then ' · ' || s.notes else '' end,
    'Seed Katleen martes y jueves · Excel agosto 2026'
  ),
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id from public.swimmers w
    where w.first_name = s.first_name and w.last_name = s.last_name
    order by case when w.training_group = 'Katleen martes y jueves' then 0 else 1 end
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
