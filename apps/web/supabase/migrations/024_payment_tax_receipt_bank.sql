-- Campos de comprobante / banco / IVA en pagos

alter table public.payments
  add column if not exists tax_crc integer not null default 0
    check (tax_crc >= 0);

alter table public.payments
  add column if not exists receipt_number text;

alter table public.payments
  add column if not exists payment_method text;

alter table public.payments
  add column if not exists bank text;

comment on column public.payments.tax_crc is 'IVA en colones (típicamente 13% de la cuota)';
comment on column public.payments.amount_crc is 'Cuota base en colones (sin IVA)';
comment on column public.payments.receipt_number is 'Número de comprobante SINPE u otro';
comment on column public.payments.payment_method is 'Método de pago (SINPE, efectivo, etc.)';
comment on column public.payments.bank is 'Banco emisor del comprobante';
