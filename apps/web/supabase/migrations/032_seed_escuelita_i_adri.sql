-- Seed grupo Escuelita I Adri (Excel ESCUELITA I ADRI · ago 2026)
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

-- 1) Nadadores
with seed (
  sort_order, id, first_name, last_name, gender, status, join_date
) as (
  values
    (1,  'a8000001-0001-4000-8000-000000000001'::uuid, 'Noah', 'Villalobos', 'masculino', 'activo', date '2024-02-10'),
    (2,  'a8000001-0001-4000-8000-000000000002'::uuid, 'Briana Raquel', 'Chavarria Gutierrez', 'femenino', 'pendiente', date '2025-02-07'),
    (3,  'a8000001-0001-4000-8000-000000000003'::uuid, 'Sofia', 'Chavarria Gutierrez', 'femenino', 'pendiente', date '2025-02-07'),
    (4,  'a8000001-0001-4000-8000-000000000004'::uuid, 'Kiana', 'Gomez', 'femenino', 'activo', date '2025-09-06'),
    (5,  'a8000001-0001-4000-8000-000000000005'::uuid, 'Emiliano', 'Angulo', 'masculino', 'activo', date '2025-02-01'),
    (6,  'a8000001-0001-4000-8000-000000000006'::uuid, 'Mariana', 'Angulo', 'femenino', 'activo', date '2025-02-01'),
    (7,  'a8000001-0001-4000-8000-000000000007'::uuid, 'Isabella', 'Cordero Villalta', 'femenino', 'activo', date '2022-09-02'),
    (8,  'a8000001-0001-4000-8000-000000000008'::uuid, 'Abigail', 'Venegas', 'femenino', 'activo', date '2026-02-07'),
    (9,  'a8000001-0001-4000-8000-000000000009'::uuid, 'Ainara', 'Moraga', 'femenino', 'activo', date '2026-02-14'),
    (10, 'a8000001-0001-4000-8000-000000000010'::uuid, 'Lucas', 'Serrano', 'masculino', 'activo', date '2026-01-03'),
    (11, 'a8000001-0001-4000-8000-000000000011'::uuid, 'Santhiago', 'Acuna', 'masculino', 'pendiente', date '2024-02-17'),
    (12, 'a8000001-0001-4000-8000-000000000012'::uuid, 'Steven', 'Bermudez', 'masculino', 'activo', date '2025-10-01'),
    (13, 'a8000001-0001-4000-8000-000000000013'::uuid, 'Sofia', 'Arias Gonzalez', 'femenino', 'activo', date '2026-06-01'),
    (14, 'a8000001-0001-4000-8000-000000000014'::uuid, 'Esteban', 'Marchena', 'masculino', 'activo', date '2026-02-07'),
    (15, 'a8000001-0001-4000-8000-000000000015'::uuid, 'Adrian', 'Quesada Cordero', 'masculino', 'activo', date '2026-02-07'),
    (16, 'a8000001-0001-4000-8000-000000000016'::uuid, 'Luciana', 'Pizarro Cordero', 'femenino', 'activo', date '2026-06-01'),
    (17, 'a8000001-0001-4000-8000-000000000017'::uuid, 'Maria Fernanda', 'Ortiz', 'femenino', 'activo', date '2023-02-04'),
    (18, 'a8000001-0001-4000-8000-000000000018'::uuid, 'Felipe', 'Briceno', 'masculino', 'activo', date '2024-01-20')
)
insert into public.swimmers (
  id, first_name, last_name, birth_date, gender, status,
  join_date, training_group, organization_id, created_at, updated_at
)
select
  s.id, s.first_name, s.last_name, null::date, s.gender, s.status,
  s.join_date, 'Escuelita I Adri',
  'a0000001-0000-4000-8000-000000000001'::uuid, now(), now()
from seed s
where not exists (
  select 1 from public.swimmers existing
  where existing.id = s.id
     or (
       existing.first_name = s.first_name
       and existing.last_name = s.last_name
       and existing.training_group = 'Escuelita I Adri'
     )
);

-- 2) Pagos
with seed (
  id, first_name, last_name, period,
  amount_crc, tax_crc, receipt_number, payment_method, bank, paid_at, notes
) as (
  values
    ('a8000001-0001-4000-8000-000000000001'::uuid, 'Noah', 'Villalobos', '2026-08',
      20000, 2600, '946808682', 'SINPE', 'BNCR', date '2026-09-03', null::text),
    ('a8000001-0001-4000-8000-000000000004'::uuid, 'Kiana', 'Gomez', '2026-08',
      40000, 5200, '88848681', 'SINPE', 'BCR', date '2026-08-29', 'JULIO Y AGOSTO'),
    ('a8000001-0001-4000-8000-000000000005'::uuid, 'Emiliano', 'Angulo', '2026-08',
      20000, 2600, '906801079', 'SINPE', 'BNCR', date '2026-08-13', null),
    ('a8000001-0001-4000-8000-000000000006'::uuid, 'Mariana', 'Angulo', '2026-08',
      20000, 2600, '906801079', 'SINPE', 'BNCR', date '2026-08-13', null),
    ('a8000001-0001-4000-8000-000000000007'::uuid, 'Isabella', 'Cordero Villalta', '2026-08',
      20000, 2600, '91241795', 'SINPE', 'BCR', date '2026-08-31', null),
    ('a8000001-0001-4000-8000-000000000008'::uuid, 'Abigail', 'Venegas', '2026-08',
      20000, 2600, '8153873', 'SINPE', 'BNCR', date '2026-08-22', null),
    ('a8000001-0001-4000-8000-000000000010'::uuid, 'Lucas', 'Serrano', '2026-08',
      40000, 5200, '62671993', 'SINPE', 'BAC', date '2026-08-31', 'JULIO Y AGOSTO'),
    -- Junio y julio; ausente agosto
    ('a8000001-0001-4000-8000-000000000011'::uuid, 'Santhiago', 'Acuna', '2026-07',
      40000, 5200, '9471770', 'SINPE', 'COOPENADE', date '2026-08-28', 'JUNIO Y JULIO (AUSENTE AGOSTO)'),
    ('a8000001-0001-4000-8000-000000000012'::uuid, 'Steven', 'Bermudez', '2026-08',
      20000, 2600, '68221822', 'SINPE', 'BNCR', date '2026-07-31', null),
    ('a8000001-0001-4000-8000-000000000013'::uuid, 'Sofia', 'Arias Gonzalez', '2026-08',
      20000, 2600, '18284399', 'SINPE', 'BAC', date '2026-08-12', null),
    ('a8000001-0001-4000-8000-000000000015'::uuid, 'Adrian', 'Quesada Cordero', '2026-08',
      20000, 2600, '7702301', 'SINPE', 'BNCR', date '2026-07-31', null),
    ('a8000001-0001-4000-8000-000000000016'::uuid, 'Luciana', 'Pizarro Cordero', '2026-08',
      20000, 2600, '9604531', 'SINPE', 'BNCR', date '2026-08-17', null),
    ('a8000001-0001-4000-8000-000000000017'::uuid, 'Maria Fernanda', 'Ortiz', '2026-08',
      20000, 2600, '48905049', 'SINPE', 'CBCR', date '2026-08-04', null),
    ('a8000001-0001-4000-8000-000000000018'::uuid, 'Felipe', 'Briceno', '2026-08',
      20000, 2600, '69171292', 'SINPE', null, date '2026-08-17', null)
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
      order by case when w.training_group = 'Escuelita I Adri' then 0 else 1 end
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
    'Seed Escuelita I Adri · Excel agosto 2026' ||
      case when s.notes is not null then ' · ' || s.notes else '' end,
    'Seed Escuelita I Adri · Excel agosto 2026'
  ),
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id from public.swimmers w
    where w.first_name = s.first_name and w.last_name = s.last_name
    order by case when w.training_group = 'Escuelita I Adri' then 0 else 1 end
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
