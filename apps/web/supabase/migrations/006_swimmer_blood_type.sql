-- Tipo de sangre en nadadores

alter table public.swimmers
  add column if not exists blood_type text
  check (
    blood_type is null
    or blood_type in ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
  );
