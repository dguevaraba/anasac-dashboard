-- Pagos mensuales asociados a nadador (no a entrenador)

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  swimmer_id uuid not null references public.swimmers (id) on delete cascade,
  concept text not null,
  amount_crc integer not null check (amount_crc >= 0),
  due_date date not null,
  paid_at date,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'pagado', 'vencido', 'parcial')),
  period text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint payments_period_format check (period ~ '^\d{4}-\d{2}$'),
  constraint payments_swimmer_period_unique unique (swimmer_id, period)
);

create index if not exists idx_payments_swimmer on public.payments (swimmer_id);
create index if not exists idx_payments_period on public.payments (period);
create index if not exists idx_payments_status on public.payments (status);

alter table public.payments enable row level security;

drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments
  for select to authenticated
  using (true);

drop policy if exists "payments_write_staff" on public.payments;
create policy "payments_write_staff" on public.payments
  for all to authenticated
  using (public.current_role_code() in ('administrador', 'contador'))
  with check (public.current_role_code() in ('administrador', 'contador'));
