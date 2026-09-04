-- Día de pago por defecto: 1 para todos los nadadores

update public.swimmers
set
  payment_day = 1,
  updated_at = now()
where payment_day is distinct from 1;
