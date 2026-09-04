-- Seed grupo Materno Sofi 8am (Excel MATERNO SOFI 8AM · ago 2026)
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

-- 1) Nadadores
with seed (
  sort_order, id, first_name, last_name, gender, status, join_date
) as (
  values
    (1,  'a7000001-0001-4000-8000-000000000001'::uuid, 'Maria Celeste', 'Araya', 'femenino', 'activo', date '2023-02-03'),
    (2,  'a7000001-0001-4000-8000-000000000002'::uuid, 'Denzel Andre', 'Pina Morales', 'masculino', 'activo', date '2023-02-04'),
    (3,  'a7000001-0001-4000-8000-000000000003'::uuid, 'Jose Gabriel', 'Villareal', 'masculino', 'activo', date '2024-04-13'),
    (4,  'a7000001-0001-4000-8000-000000000004'::uuid, 'Mario', 'Andres', 'masculino', 'activo', date '2024-12-06'),
    (5,  'a7000001-0001-4000-8000-000000000005'::uuid, 'Liam Andres', 'Matarrita Briceno', 'masculino', 'activo', date '2025-01-04'),
    (6,  'a7000001-0001-4000-8000-000000000006'::uuid, 'Maria Belen', 'Rodriguez', 'femenino', 'pendiente', date '2025-03-03'),
    (7,  'a7000001-0001-4000-8000-000000000007'::uuid, 'Marissa', 'Gonzalez', 'femenino', 'activo', date '2024-02-17'),
    (8,  'a7000001-0001-4000-8000-000000000008'::uuid, 'Gianne Margaret', 'Gomez', 'femenino', 'activo', date '2026-03-21'),
    (9,  'a7000001-0001-4000-8000-000000000009'::uuid, 'Daisa', 'Angulo', 'femenino', 'activo', date '2026-04-04'),
    (10, 'a7000001-0001-4000-8000-000000000010'::uuid, 'Haydanna', 'Sanchez', 'femenino', 'activo', date '2023-04-14'),
    (11, 'a7000001-0001-4000-8000-000000000011'::uuid, 'Aranxa', 'Gutierrez', 'femenino', 'activo', date '2026-05-20'),
    (12, 'a7000001-0001-4000-8000-000000000012'::uuid, 'Isabel', 'Araya', 'femenino', 'inactivo', date '2026-06-06'),
    (13, 'a7000001-0001-4000-8000-000000000013'::uuid, 'Andres', 'Castillo', 'masculino', 'activo', date '2024-06-02'),
    (14, 'a7000001-0001-4000-8000-000000000014'::uuid, 'Leandro', 'Gutierrez', 'masculino', 'activo', date '2022-08-24'),
    (15, 'a7000001-0001-4000-8000-000000000015'::uuid, 'Lucia', 'Santana Jimenez', 'femenino', 'activo', date '2025-07-01'),
    (16, 'a7000001-0001-4000-8000-000000000016'::uuid, 'Daniela', 'Guerrero', 'femenino', 'activo', date '2025-08-09'),
    (17, 'a7000001-0001-4000-8000-000000000017'::uuid, 'Eliza', 'Martinez', 'femenino', 'activo', date '2025-02-15')
)
insert into public.swimmers (
  id, first_name, last_name, birth_date, gender, status,
  join_date, training_group, organization_id, created_at, updated_at
)
select
  s.id, s.first_name, s.last_name, null::date, s.gender, s.status,
  s.join_date, 'Materno Sofi 8am',
  'a0000001-0000-4000-8000-000000000001'::uuid, now(), now()
from seed s
where not exists (
  select 1 from public.swimmers existing
  where existing.id = s.id
     or (
       existing.first_name = s.first_name
       and existing.last_name = s.last_name
       and existing.training_group = 'Materno Sofi 8am'
     )
);

-- 2) Pagos (cuotas con comprobante)
with seed (
  id, first_name, last_name, period,
  amount_crc, tax_crc, receipt_number, payment_method, bank, paid_at, notes
) as (
  values
    ('a7000001-0001-4000-8000-000000000001'::uuid, 'Maria Celeste', 'Araya', '2026-08',
      20000, 2600, 'FT26240F6P72', 'SINPE', 'POPULAR', date '2026-08-28', null::text),
    ('a7000001-0001-4000-8000-000000000003'::uuid, 'Jose Gabriel', 'Villareal', '2026-08',
      40000, 5200, '7996108', 'SINPE', 'BNCR', date '2026-08-07', 'JULIO Y AGOSTO'),
    ('a7000001-0001-4000-8000-000000000004'::uuid, 'Mario', 'Andres', '2026-08',
      20000, 2600, '60961603', 'SINPE', 'BCR', date '2026-08-27', null),
    ('a7000001-0001-4000-8000-000000000005'::uuid, 'Liam Andres', 'Matarrita Briceno', '2026-08',
      20000, 2600, 'FT26237793PX', 'SINPE', 'POPULAR', date '2026-08-25', null),
    -- Julio pagado; debe agosto
    ('a7000001-0001-4000-8000-000000000006'::uuid, 'Maria Belen', 'Rodriguez', '2026-07',
      20000, 2600, '66946216', 'SINPE', 'BAC', date '2026-09-01', 'JULIO (DEBE AGOSTO)'),
    ('a7000001-0001-4000-8000-000000000007'::uuid, 'Marissa', 'Gonzalez', '2026-08',
      20000, 2600, '43343529', 'SINPE', 'BCR', date '2026-08-01', null),
    ('a7000001-0001-4000-8000-000000000008'::uuid, 'Gianne Margaret', 'Gomez', '2026-08',
      20000, 2600, 'FT26243XBGVL', 'SINPE', 'POPULAR', date '2026-08-31', null),
    ('a7000001-0001-4000-8000-000000000009'::uuid, 'Daisa', 'Angulo', '2026-08',
      20000, 2600, '5317262', 'SINPE', 'BNCR', date '2026-07-28', null),
    ('a7000001-0001-4000-8000-000000000010'::uuid, 'Haydanna', 'Sanchez', '2026-08',
      20000, 2600, '91726104', 'SINPE', 'BCR', date '2026-08-31', null),
    ('a7000001-0001-4000-8000-000000000011'::uuid, 'Aranxa', 'Gutierrez', '2026-08',
      20000, 2600, '8579399', 'SINPE', 'BNCR', date '2026-09-01', null),
    ('a7000001-0001-4000-8000-000000000013'::uuid, 'Andres', 'Castillo', '2026-08',
      10000, 1300, 'FT26244JD573', 'SINPE', 'POPULAR', date '2026-09-01', null),
    ('a7000001-0001-4000-8000-000000000014'::uuid, 'Leandro', 'Gutierrez', '2026-08',
      20000, 2600, '7783601', 'SINPE', 'BAC', date '2026-08-28', null),
    ('a7000001-0001-4000-8000-000000000015'::uuid, 'Lucia', 'Santana Jimenez', '2026-08',
      20000, 2600, '8358040', 'SINPE', 'BNCR', date '2026-08-04', null),
    ('a7000001-0001-4000-8000-000000000016'::uuid, 'Daniela', 'Guerrero', '2026-08',
      20000, 2600, '42948667', 'SINPE', 'BCR', date '2026-08-01', null),
    ('a7000001-0001-4000-8000-000000000017'::uuid, 'Eliza', 'Martinez', '2026-08',
      20000, 2600, '10110434721', 'SINPE', 'BNCR', date '2026-08-14', null)
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
      order by case when w.training_group = 'Materno Sofi 8am' then 0 else 1 end
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
    'Seed Materno Sofi 8am · Excel agosto 2026' ||
      case when s.notes is not null then ' · ' || s.notes else '' end,
    'Seed Materno Sofi 8am · Excel agosto 2026'
  ),
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id from public.swimmers w
    where w.first_name = s.first_name and w.last_name = s.last_name
    order by case when w.training_group = 'Materno Sofi 8am' then 0 else 1 end
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
