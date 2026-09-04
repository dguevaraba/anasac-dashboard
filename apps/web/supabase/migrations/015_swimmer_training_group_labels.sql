-- Renombra valores UPPERCASE del grupo si ya se aplicó 014 con mayúsculas

alter table public.swimmers
  drop constraint if exists swimmers_training_group_check;

update public.swimmers set training_group = 'Pre y equipo' where training_group = 'PRE Y EQUIPO';
update public.swimmers set training_group = 'Escuelita I Adri' where training_group = 'ESCUELITA I ADRI';
update public.swimmers set training_group = 'Matronatación' where training_group = 'MATRONATACION';
update public.swimmers set training_group = 'Materno Sofi 8am' where training_group = 'MATERNO SOFI 8AM';
update public.swimmers set training_group = 'Katleen martes y jueves' where training_group = 'KATLEEN MARTES Y JUEVES';
update public.swimmers set training_group = 'Katleen L-M-V' where training_group = 'KATLEEN L-M-V';
update public.swimmers set training_group = 'Anthony M y J' where training_group = 'ANTHONY M Y J';
update public.swimmers set training_group = 'Anthony sábados' where training_group in ('ANTHONY SABDS', 'Anthony sabados');
update public.swimmers set training_group = 'Yuli' where training_group = 'YULI';

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
