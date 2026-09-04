-- Seed grupo Anthony M y J (Excel ANTHONY M Y J · agosto 2026)
-- Martes y jueves 4pm · todos marcados SALIO · sin cuotas/pagos
-- Requiere 023 (organization_id)

with seed (
  sort_order, id, first_name, last_name, gender
) as (
  values
    (1, 'a4000001-0001-4000-8000-000000000001'::uuid, 'Emma', 'Alfaro Somarribas', 'femenino'),
    (2, 'a4000001-0001-4000-8000-000000000002'::uuid, 'Camila', 'Somarribas', 'femenino'),
    (3, 'a4000001-0001-4000-8000-000000000003'::uuid, 'Santhiago', 'Rodriguez', 'masculino'),
    (4, 'a4000001-0001-4000-8000-000000000004'::uuid, 'Catalina', 'Rojas', 'femenino'),
    (5, 'a4000001-0001-4000-8000-000000000005'::uuid, 'Mathias', 'Lopez Gomez', 'masculino')
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
  'inactivo',
  null::date,
  'Anthony M y J',
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
       and existing.training_group = 'Anthony M y J'
     )
);
