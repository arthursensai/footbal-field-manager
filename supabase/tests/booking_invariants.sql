-- Read-only smoke checks. Run in the Supabase SQL Editor after migrations.
do $$
begin
  if not exists (select 1 from public.field_settings where id=true and opening_time=time '08:00' and closing_time=time '00:00' and timezone='Africa/Casablanca') then
    raise exception 'Expected field settings 08:00–00:00 Africa/Casablanca.';
  end if;
  if exists (select 1 from public.bookings where end_time-start_time <> interval '1 hour') then
    raise exception 'Found a booking whose duration is not exactly one hour.';
  end if;
  if not (
    (select relrowsecurity from pg_class where oid='public.bookings'::regclass)
    and (select relrowsecurity from pg_class where oid='public.booking_audit_logs'::regclass)
    and (select relrowsecurity from pg_class where oid='public.field_settings'::regclass)
    and (select relrowsecurity from pg_class where oid='public.profiles'::regclass)
  ) then raise exception 'RLS is not enabled on all application tables.'; end if;
  if has_table_privilege('anon','public.bookings','select') or has_table_privilege('anon','public.booking_audit_logs','select') then
    raise exception 'The anon role unexpectedly has SELECT access.';
  end if;
end $$;
select (select count(*) from public.bookings) as booking_count,
       (select count(*) from public.booking_audit_logs) as audit_log_count,
       (select count(*) from public.profiles) as profile_count;
