-- Grupo de entrenamiento (hojas del Excel de atletas)

alter table public.swimmers
  add column if not exists training_group text;

alter table public.swimmers
  drop constraint if exists swimmers_training_group_check;

alter table public.swimmers
  add constraint swimmers_training_group_check
  check (
    training_group is null
    or training_group in (
      'Pre y equipo',
      'Escuelita I Adri',
      'Matronatación',
      'Materno Sofi 8am',
      'Katleen martes y jueves',
      'Katleen L-M-V',
      'Anthony M y J',
      'Anthony sábados',
      'Yuli'
    )
  );

create index if not exists idx_swimmers_training_group
  on public.swimmers (training_group);
