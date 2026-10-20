-- Link an existing Supabase Auth user to a manager profile.
-- Replace the email and name before running in the Supabase SQL Editor.
-- This does not create an Auth user or set a password.
insert into public.profiles (id, full_name)
select id, 'Responsable 1'
from auth.users
where email = 'responsable@example.com'
on conflict (id) do update set full_name = excluded.full_name;
