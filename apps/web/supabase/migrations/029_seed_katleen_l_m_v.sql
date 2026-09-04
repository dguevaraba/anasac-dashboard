-- Seed grupo Katleen L-M-V (Excel KATLEEN L-M-V · Nivel III · ago 2026)
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

-- 1) Nadadores
with seed (
  sort_order, id, first_name, last_name, gender, status, join_date
) as (
  values
    (1,  'a5000001-0001-4000-8000-000000000001'::uuid, 'Santhiago', 'Angulo Flores', 'masculino', 'pendiente', date '2025-02-15'),
    (2,  'a5000001-0001-4000-8000-000000000002'::uuid, 'Fiorella', 'Guevarra', 'femenino', 'activo', date '2024-03-02'),
    (3,  'a5000001-0001-4000-8000-000000000003'::uuid, 'Dariel', 'Viales', 'masculino', 'activo', date '2025-01-07'),
    (4,  'a5000001-0001-4000-8000-000000000004'::uuid, 'Noe', 'Viales', 'masculino', 'activo', date '2025-01-07'),
    (5,  'a5000001-0001-4000-8000-000000000005'::uuid, 'Marie Valentina', 'Alvarez Bonilla', 'femenino', 'activo', date '2024-03-20'),
    (6,  'a5000001-0001-4000-8000-000000000006'::uuid, 'Luz Alethia', 'Ramirez', 'femenino', 'activo', date '2025-04-05'),
    (7,  'a5000001-0001-4000-8000-000000000007'::uuid, 'Samantha', 'Jarquin', 'femenino', 'pendiente', date '2025-02-09'),
    (8,  'a5000001-0001-4000-8000-000000000008'::uuid, 'Ariel', 'Bustos', 'masculino', 'activo', date '2025-12-04'),
    (9,  'a5000001-0001-4000-8000-000000000009'::uuid, 'Alana', 'Marchena', 'femenino', 'activo', date '2026-02-28'),
    (10, 'a5000001-0001-4000-8000-000000000010'::uuid, 'Emily', 'Serna', 'femenino', 'activo', date '2026-01-05'),
    (11, 'a5000001-0001-4000-8000-000000000011'::uuid, 'Noah', 'Solano', 'masculino', 'pendiente', date '2026-02-19'),
    (12, 'a5000001-0001-4000-8000-000000000012'::uuid, 'Emiliano', 'Ruiz', 'masculino', 'activo', date '2024-12-19'),
    (13, 'a5000001-0001-4000-8000-000000000013'::uuid, 'Julian', 'Arguedas', 'masculino', 'activo', date '2026-04-03'),
    (14, 'a5000001-0001-4000-8000-000000000014'::uuid, 'Santhiago', 'Vasquez', 'masculino', 'pendiente', null::date),
    (15, 'a5000001-0001-4000-8000-000000000015'::uuid, 'Taira', 'Hernandez', 'femenino', 'activo', date '2026-08-06'),
    (16, 'a5000001-0001-4000-8000-000000000016'::uuid, 'Isaac', 'Darcia', 'masculino', 'pendiente', date '2026-05-18'),
    (17, 'a5000001-0001-4000-8000-000000000017'::uuid, 'Aaron', 'Vallejos', 'masculino', 'pendiente', null::date)
)
insert into public.swimmers (
  id, first_name, last_name, birth_date, gender, status,
  join_date, training_group, organization_id, created_at, updated_at
)
select
  s.id,
  s.first_name,
  s.last_name,
  null::date,
  s.gender,
  s.status,
  s.join_date,
  'Katleen L-M-V',
  'a0000001-0000-4000-8000-000000000001'::uuid,
  now(),
  now()
from seed s
where not exists (
  select 1 from public.swimmers existing
  where existing.id = s.id
     or (
       existing.first_name = s.first_name
       and existing.last_name = s.last_name
       and existing.training_group = 'Katleen L-M-V'
     )
);

-- 2) Pagos agosto (filas con cuota)
with seed (
  id, first_name, last_name,
  amount_crc, tax_crc, receipt_number, payment_method, bank, paid_at, notes
) as (
  values
    ('a5000001-0001-4000-8000-000000000002'::uuid, 'Fiorella', 'Guevarra',
      25000, 3250, 'FT262448NQ4L', 'SINPE', 'POPULAR', date '2026-09-01', null::text),
    ('a5000001-0001-4000-8000-000000000003'::uuid, 'Dariel', 'Viales',
      20000, 2600, '4393152', 'SINPE', 'COOPENAE', date '2026-08-18', null),
    ('a5000001-0001-4000-8000-000000000004'::uuid, 'Noe', 'Viales',
      20000, 2600, '4393152', 'SINPE', 'COOPENAE', date '2026-08-18', null),
    ('a5000001-0001-4000-8000-000000000005'::uuid, 'Marie Valentina', 'Alvarez Bonilla',
      25000, 3250, '94141311', 'SINPE', 'BNCR', date '2026-08-03', null),
    ('a5000001-0001-4000-8000-000000000006'::uuid, 'Luz Alethia', 'Ramirez',
      25000, 3250, '50832953', 'SINPE', 'BCR', date '2026-08-05', null),
    ('a5000001-0001-4000-8000-000000000008'::uuid, 'Ariel', 'Bustos',
      50000, 6500, '64414705', 'SINPE', 'BAC', date '2026-08-31', 'JULIO Y AGOSTO'),
    ('a5000001-0001-4000-8000-000000000009'::uuid, 'Alana', 'Marchena',
      20000, 2600, '48063107', 'SINPE', 'BCR', date '2026-08-04', null),
    ('a5000001-0001-4000-8000-000000000010'::uuid, 'Emily', 'Serna',
      25000, 3250, '3389088', 'SINPE', 'BNCR', date '2026-08-18', null),
    ('a5000001-0001-4000-8000-000000000012'::uuid, 'Emiliano', 'Ruiz',
      25000, 3250, '961606173', 'SINPE', 'BAC', date '2026-08-04', null),
    ('a5000001-0001-4000-8000-000000000013'::uuid, 'Julian', 'Arguedas',
      25000, 3250, '20603627', 'SINPE', 'BNCR', date '2026-09-01', null),
    ('a5000001-0001-4000-8000-000000000015'::uuid, 'Taira', 'Hernandez',
      33000, 4290, '2758453', 'SINPE', 'MUTUAL', date '2026-08-06', null)
)
insert into public.payments (
  swimmer_id, concept, amount_crc, tax_crc, due_date, paid_at, status, period,
  receipt_number, payment_method, bank, notes, organization_id
)
select
  coalesce(
    (select w.id from public.swimmers w where w.id = s.id),
    (
      select w.id
      from public.swimmers w
      where w.first_name = s.first_name
        and w.last_name = s.last_name
      order by case when w.training_group = 'Katleen L-M-V' then 0 else 1 end
      limit 1
    )
  ),
  'Mensualidad 2026-08',
  s.amount_crc,
  s.tax_crc,
  date '2026-08-01',
  s.paid_at,
  'pagado',
  '2026-08',
  s.receipt_number,
  s.payment_method,
  s.bank,
  coalesce(
    'Seed Katleen L-M-V · Excel agosto 2026' ||
      case when s.notes is not null then ' · ' || s.notes else '' end,
    'Seed Katleen L-M-V · Excel agosto 2026'
  ),
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id
    from public.swimmers w
    where w.first_name = s.first_name
      and w.last_name = s.last_name
    order by case when w.training_group = 'Katleen L-M-V' then 0 else 1 end
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
