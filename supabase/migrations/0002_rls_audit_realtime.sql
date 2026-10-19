-- Sécurité (RLS), historique (audit) et Realtime.

alter table public.profiles enable row level security;
alter table public.bookings enable row level security;

create policy "profiles_select_managers" on public.profiles
  for select to authenticated using (public.is_manager());

create policy "bookings_select_managers" on public.bookings
  for select to authenticated using (public.is_manager());
create policy "bookings_insert_managers" on public.bookings
  for insert to authenticated with check (public.is_manager());
create policy "bookings_update_managers" on public.bookings
  for update to authenticated using (public.is_manager()) with check (public.is_manager());
-- Aucune politique DELETE : les réservations ne sont jamais supprimées (annulation = statut).
revoke delete, truncate on public.bookings from authenticated, anon;
revoke all on public.bookings from anon;
revoke all on public.profiles from anon;

-- Historique : alimenté uniquement par trigger, en lecture seule pour les responsables.
create table public.booking_audit_logs (
  id bigint generated always as identity primary key,
  booking_id uuid not null references public.bookings (id),
  action text not null check (action in ('create', 'update', 'cancel')),
  actor_id uuid references public.profiles (id),
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);
create index booking_audit_logs_created_idx on public.booking_audit_logs (created_at desc);
create index booking_audit_logs_booking_idx on public.booking_audit_logs (booking_id);

alter table public.booking_audit_logs enable row level security;
create policy "audit_select_managers" on public.booking_audit_logs
  for select to authenticated using (public.is_manager());
revoke all on public.booking_audit_logs from anon, authenticated;
grant select on public.booking_audit_logs to authenticated;

create or replace function public.log_booking_change()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_action text;
begin
  if tg_op = 'INSERT' then
    insert into public.booking_audit_logs (booking_id, action, actor_id, old_data, new_data)
    values (new.id, 'create', new.created_by, null, to_jsonb(new));
    return new;
  end if;

  -- Ignorer les mises à jour sans changement réel.
  if (to_jsonb(old) - 'updated_at' - 'updated_by') = (to_jsonb(new) - 'updated_at' - 'updated_by') then
    return new;
  end if;

  if old.status = 'confirmed' and new.status = 'cancelled' then
    v_action := 'cancel';
  else
    v_action := 'update';
  end if;

  insert into public.booking_audit_logs (booking_id, action, actor_id, old_data, new_data)
  values (new.id, v_action, new.updated_by, to_jsonb(old), to_jsonb(new));
  return new;
end;
$$;

create trigger bookings_audit
after insert or update on public.bookings
for each row execute function public.log_booking_change();

-- Résumé journalier calculé par la base (jour local Africa/Casablanca).
create or replace function public.daily_summary(p_day date)
returns table (
  confirmed_count integer,
  cancelled_count integer,
  total_minutes integer,
  expected_revenue numeric,
  collected_amount numeric,
  remaining_amount numeric
)
language sql stable security invoker set search_path = ''
as $$
  select
    (count(*) filter (where status = 'confirmed'))::integer,
    (count(*) filter (where status = 'cancelled'))::integer,
    coalesce(sum(extract(epoch from (end_time - start_time)) / 60) filter (where status = 'confirmed'), 0)::integer,
    coalesce(sum(total_price) filter (where status = 'confirmed'), 0),
    coalesce(sum(paid_amount) filter (where status = 'confirmed'), 0),
    coalesce(sum(total_price - paid_amount) filter (where status = 'confirmed'), 0)
  from public.bookings
  where start_time >= (p_day::timestamp at time zone 'Africa/Casablanca')
    and start_time <  ((p_day + 1)::timestamp at time zone 'Africa/Casablanca');
$$;
revoke all on function public.daily_summary(date) from public, anon;
grant execute on function public.daily_summary(date) to authenticated;

-- Realtime sur la table des réservations.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'bookings'
     ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;
