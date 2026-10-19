-- Schéma de base : profils, réservations, contraintes d'intégrité.
create extension if not exists btree_gist;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (length(trim(full_name)) > 0),
  created_at timestamptz not null default now()
);

create or replace function public.is_manager()
returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.profiles where id = auth.uid()); $$;

revoke all on function public.is_manager() from public, anon;
grant execute on function public.is_manager() to authenticated;

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (length(trim(customer_name)) between 2 and 120),
  phone text not null check (length(trim(phone)) between 6 and 20),
  start_time timestamptz not null,
  end_time timestamptz not null,
  total_price numeric(10, 2) not null check (total_price >= 0),
  paid_amount numeric(10, 2) not null default 0 check (paid_amount >= 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  notes text check (notes is null or length(notes) <= 1000),
  created_by uuid not null references public.profiles (id),
  updated_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint bookings_paid_lte_total check (paid_amount <= total_price),
  constraint bookings_start_before_end check (start_time < end_time),
  constraint bookings_opening_hours check (
    (start_time at time zone 'Africa/Casablanca')::time >= time '08:00'
    and (end_time at time zone 'Africa/Casablanca')::time <= time '21:00'
  ),
  constraint bookings_same_local_day check (
    (start_time at time zone 'Africa/Casablanca')::date = (end_time at time zone 'Africa/Casablanca')::date
  ),
  -- Deux réservations confirmées ne peuvent jamais se chevaucher (intervalle [début, fin[ :
  -- deux réservations consécutives sont donc autorisées).
  constraint bookings_no_overlap exclude using gist (
    tstzrange(start_time, end_time, '[)') with &&
  ) where (status = 'confirmed')
);

create index bookings_start_time_idx on public.bookings (start_time);

-- created_by / updated_by / dates sont gérés par la base, jamais par le client.
create or replace function public.set_booking_actor()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié' using errcode = '42501';
  end if;
  if tg_op = 'INSERT' then
    new.created_by := auth.uid();
    new.created_at := now();
  else
    new.created_by := old.created_by;
    new.created_at := old.created_at;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end;
$$;

create trigger bookings_set_actor
before insert or update on public.bookings
for each row execute function public.set_booking_actor();
