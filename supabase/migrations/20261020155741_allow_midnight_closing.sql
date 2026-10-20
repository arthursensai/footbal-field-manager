-- Historical migration originally recorded as 20261020155741.
-- The guard keeps it safe when the application schema has not yet been created.
do $$
begin
  if to_regclass('public.field_settings') is not null then
    alter table public.field_settings drop constraint if exists valid_opening_hours;
    alter table public.field_settings
      add constraint valid_opening_hours
      check (opening_time < closing_time or closing_time = time '00:00');
  end if;
end $$;
