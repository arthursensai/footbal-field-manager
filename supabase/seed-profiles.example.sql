-- À exécuter manuellement dans l'éditeur SQL Supabase APRÈS avoir créé les deux comptes
-- dans Authentication > Users. Remplacez les UUID et les noms. Ne contient aucune donnée de production.
insert into public.profiles (id, full_name) values
  ('00000000-0000-0000-0000-000000000001', 'Responsable 1'),
  ('00000000-0000-0000-0000-000000000002', 'Responsable 2');
