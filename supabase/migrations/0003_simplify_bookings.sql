-- 0003 : simplification des réservations
--  * suppression du suivi d'argent (total_price, paid_amount)
--  * téléphone optionnel
--  * suppression des notes
--  * durée fixe d'une heure (end_time calculé automatiquement par la base)

begin;

-- 1) Résumé journalier : plus de montants.
--    (le type de retour change, donc on supprime puis on recrée)
drop function if exists public.daily_summary(date);

-- 2) Suppression des contraintes et colonnes liées à l'argent et aux notes.
alter table public.bookings drop constraint if exists bookings_paid_lte_total;
alter table public.bookings drop column if exists total_price;
alter table public.bookings drop column if exists paid_amount;
alter table public.bookings drop column if exists notes;

-- 3) Téléphone optionnel.
alter table public.bookings alter column phone drop not null;
alter table public.bookings drop constraint if exists bookings_phone_check;
alter table public.bookings add constraint bookings_phone_check
  check (phone is null or length(trim(phone)) between 6 and 20);

-- Les chaînes vides deviennent NULL.
update public.bookings set phone = null where phone is not null and trim(phone) = '';

-- 4) Durée fixe d'une heure : end_time = start_time + 1 h (INSERT ou changement d'heure de début).
--    Les anciennes réservations ne sont pas modifiées.
create or replace function public.set_booking_end_time()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.start_time is distinct from old.start_time then
    new.end_time := new.start_time + interval '1 hour';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_set_end_time on public.bookings;
create trigger bookings_set_end_time
before insert or update on public.bookings
for each row execute function public.set_booking_end_time();

-- 5) Nouveau résumé journalier (sans montants).
create or replace function public.daily_summary(p_day date)
returns table (
  confirmed_count integer,
  cancelled_count integer,
  total_minutes integer
)
language sql stable security invoker set search_path = ''
as $$
  select
    (count(*) filter (where status = 'confirmed'))::integer,
    (count(*) filter (where status = 'cancelled'))::integer,
    coalesce(sum(extract(epoch from (end_time - start_time)) / 60) filter (where status = 'confirmed'), 0)::integer
  from public.bookings
  where start_time >= (p_day::timestamp at time zone 'Africa/Casablanca')
    and start_time <  ((p_day + 1)::timestamp at time zone 'Africa/Casablanca');
$$;
revoke all on function public.daily_summary(date) from public, anon;
grant execute on function public.daily_summary(date) to authenticated;

commit;
