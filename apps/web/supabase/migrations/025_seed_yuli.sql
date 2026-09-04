-- Seed grupo Yuli (Excel agosto 2026) + cuota ago 2026 con IVA/comprobante/banco
-- Requiere 023 (organization_id) y 024 (tax/receipt/bank)

with seed (
  sort_order, id, first_name, last_name, gender,
  amount_crc, tax_crc, receipt_number, payment_method, bank,
  paid_at, join_date
) as (
  values
    (1, 'a2000001-0001-4000-8000-000000000001'::uuid, 'Emiliano', 'Li', 'masculino',
      25000, 3250, '39078581', 'SINPE', 'BCR',
      date '2026-07-30', date '2026-08-03'),
    (2, 'a2000001-0001-4000-8000-000000000002'::uuid, 'Emiliy Mariana', 'Salazar', 'femenino',
      25000, 3250, '47414067', 'SINPE', 'BCR',
      date '2026-08-03', date '2026-08-03'),
    (3, 'a2000001-0001-4000-8000-000000000003'::uuid, 'Ignacio', 'Monge', 'masculino',
      25000, 3250, '903215655', 'SINPE', 'BAC',
      date '2026-07-28', date '2026-08-03'),
    (4, 'a2000001-0001-4000-8000-000000000004'::uuid, 'Mathias', 'Rodriguez', 'masculino',
      25000, 3250, '41411517', 'SINPE', 'BCR',
      date '2026-07-31', date '2026-08-03'),
    (5, 'a2000001-0001-4000-8000-000000000005'::uuid, 'Charlotte', 'Ramirez', 'femenino',
      25000, 3250, '63278150', 'SINPE', 'BCR',
      date '2026-08-14', date '2026-08-14'),
    (6, 'a2000001-0001-4000-8000-000000000006'::uuid, 'Helena', 'Jerez', 'femenino',
      25000, 3250, '22125790', 'SINPE', 'ANDE',
      date '2026-08-03', date '2026-08-03'),
    (7, 'a2000001-0001-4000-8000-000000000007'::uuid, 'Adriela', 'Camila', 'femenino',
      25000, 3250, '69594326', 'SINPE', 'BCR',
      date '2026-08-11', date '2026-08-11'),
    (8, 'a2000001-0001-4000-8000-000000000008'::uuid, 'Byron', 'Dariel', 'masculino',
      25000, 3250, '8108601', 'SINPE', 'BNCR',
      date '2026-07-31', date '2026-08-03')
),
ins_swimmers as (
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
    'activo',
    s.join_date,
    'Yuli',
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
         and existing.training_group = 'Yuli'
       )
  )
  returning id
)
insert into public.payments (
  swimmer_id, concept, amount_crc, tax_crc, due_date, paid_at, status, period,
  receipt_number, payment_method, bank, notes, organization_id
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
      order by case when w.training_group = 'Yuli' then 0 else 1 end
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
  'Seed Yuli · Excel agosto 2026',
  'a0000001-0000-4000-8000-000000000001'::uuid
from seed s
where coalesce(
  (select i.id from ins_swimmers i where i.id = s.id),
  (select w.id from public.swimmers w where w.id = s.id),
  (
    select w.id
    from public.swimmers w
    where w.first_name = s.first_name
      and w.last_name = s.last_name
    order by case when w.training_group = 'Yuli' then 0 else 1 end
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
