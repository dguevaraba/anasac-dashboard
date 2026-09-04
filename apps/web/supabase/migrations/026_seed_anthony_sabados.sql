-- Seed grupo Anthony sábados (Excel ANTHONY SABDS · agosto 2026)
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

-- 1) Nadadores (incluye sin pago: salió / debe / no asistió)
with seed (
  sort_order, id, first_name, last_name, gender, status, join_date
) as (
  values
    (1, 'a3000001-0001-4000-8000-000000000001'::uuid, 'Paula', 'Contreras', 'femenino', 'inactivo', null::date),
    (2, 'a3000001-0001-4000-8000-000000000002'::uuid, 'Natasha', 'Murillo', 'femenino', 'pendiente', date '2026-03-03'),
    (3, 'a3000001-0001-4000-8000-000000000003'::uuid, 'Lucia', 'Padilla', 'femenino', 'activo', date '2026-03-21'),
    (4, 'a3000001-0001-4000-8000-000000000004'::uuid, 'Kiam', 'Lara', 'masculino', 'activo', date '2026-08-13'),
    (5, 'a3000001-0001-4000-8000-000000000005'::uuid, 'Kalany', 'Ramirez Sanchez', 'femenino', 'activo', date '2026-07-02'),
    (6, 'a3000001-0001-4000-8000-000000000006'::uuid, 'Matteo', 'Fonseca Mora', 'masculino', 'activo', date '2026-08-24'),
    (7, 'a3000001-0001-4000-8000-000000000007'::uuid, 'Julian', 'Araya', 'masculino', 'activo', date '2026-06-01'),
    (8, 'a3000001-0001-4000-8000-000000000008'::uuid, 'Cristian', 'Aleman', 'masculino', 'activo', date '2026-06-01')
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
  'Anthony sábados',
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
       and existing.training_group = 'Anthony sábados'
     )
);

-- 2) Pagos agosto (solo filas con cuota en Excel)
with seed (
  id, first_name, last_name,
  amount_crc, tax_crc, receipt_number, payment_method, bank, paid_at
) as (
  values
    ('a3000001-0001-4000-8000-000000000003'::uuid, 'Lucia', 'Padilla',
      20000, 2600, '5414789', 'SINPE', 'BNCR', date '2026-08-04'),
    ('a3000001-0001-4000-8000-000000000004'::uuid, 'Kiam', 'Lara',
      33000, 4290, '62054551', 'SINPE', 'BCR', date '2026-08-13'),
    ('a3000001-0001-4000-8000-000000000005'::uuid, 'Kalany', 'Ramirez Sanchez',
      56000, 7280, '57018097', 'SINPE', 'BCR', date '2026-08-10'),
    ('a3000001-0001-4000-8000-000000000006'::uuid, 'Matteo', 'Fonseca Mora',
      23000, 2990, '9336296', 'SINPE', 'BNCR', date '2026-08-24')
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
      order by case when w.training_group = 'Anthony sábados' then 0 else 1 end
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
  'Seed Anthony sábados · Excel agosto 2026',
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id
    from public.swimmers w
    where w.first_name = s.first_name
      and w.last_name = s.last_name
    order by case when w.training_group = 'Anthony sábados' then 0 else 1 end
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
