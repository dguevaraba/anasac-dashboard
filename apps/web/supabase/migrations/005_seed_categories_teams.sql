-- Categorías y equipo base ANASAC (para alta de nadadores)

insert into public.categories (name, min_age, max_age)
values
  ('Infantil A', 6, 8),
  ('Infantil B', 9, 10),
  ('Juvenil A', 11, 13),
  ('Juvenil B', 14, 17),
  ('Master', 18, 99)
on conflict (name) do nothing;

insert into public.teams (name, code)
values ('ANASAC Santa Cruz', 'anasac')
on conflict (code) do nothing;
