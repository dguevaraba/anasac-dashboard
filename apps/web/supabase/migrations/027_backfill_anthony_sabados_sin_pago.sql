-- Asegura nadadores Anthony sábados sin pago (si 026 ya corrió con typo / CTE)
-- Natasha Murillo, Paula Contreras, Julian Araya, Cristian Aleman

-- Corrige typo Excel Murrillo → Murillo
update public.swimmers
set
  last_name = 'Murillo',
  status = 'pendiente',
  join_date = coalesce(join_date, date '2026-03-03'),
  training_group = 'Anthony sábados',
  updated_at = now()
where id = 'a3000001-0001-4000-8000-000000000002'::uuid
   or (
     first_name = 'Natasha'
     and last_name in ('Murrillo', 'Murillo')
     and training_group = 'Anthony sábados'
   );

insert into public.swimmers (
  id, first_name, last_name, birth_date, gender, status,
  join_date, training_group, organization_id, created_at, updated_at
)
select v.id, v.first_name, v.last_name, null, v.gender, v.status,
       v.join_date, 'Anthony sábados',
       'a0000001-0000-4000-8000-000000000001'::uuid, now(), now()
from (
  values
    ('a3000001-0001-4000-8000-000000000001'::uuid, 'Paula', 'Contreras', 'femenino', 'inactivo', null::date),
    ('a3000001-0001-4000-8000-000000000002'::uuid, 'Natasha', 'Murillo', 'femenino', 'pendiente', date '2026-03-03'),
    ('a3000001-0001-4000-8000-000000000007'::uuid, 'Julian', 'Araya', 'masculino', 'activo', date '2026-06-01'),
    ('a3000001-0001-4000-8000-000000000008'::uuid, 'Cristian', 'Aleman', 'masculino', 'activo', date '2026-06-01')
) as v(id, first_name, last_name, gender, status, join_date)
where not exists (
  select 1 from public.swimmers e
  where e.id = v.id
     or (
       e.first_name = v.first_name
       and e.last_name = v.last_name
       and e.training_group = 'Anthony sábados'
     )
);
