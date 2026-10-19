# Réservations du terrain de football

Application web **privée** (Next.js App Router, TypeScript strict, Supabase Auth/PostgreSQL/Realtime, Tailwind CSS 3) pour deux responsables qui gèrent les réservations d'un seul terrain. Toute l'interface est en français. Fuseau : `Africa/Casablanca`, horaires : 08:00–21:00, chaque réservation dure une heure.

## 1. Configuration Supabase

1. Créez un projet sur <https://supabase.com>.
2. Dans **SQL Editor**, exécutez dans l'ordre :
   - `supabase/migrations/0001_schema.sql`
   - `supabase/migrations/0002_rls_audit_realtime.sql`
3. Dans **Authentication > Users**, créez manuellement les deux comptes (e-mail + mot de passe). Désactivez les inscriptions publiques : **Authentication > Sign In / Providers > désactiver « Allow new users to sign up »**.
4. Enregistrez les profils (copiez les UUID des deux utilisateurs) en vous inspirant de `supabase/seed-profiles.example.sql`. Sans ligne dans `public.profiles`, un compte est refusé par l'application **et** par les politiques RLS.
5. Récupérez dans **Project Settings > API** l'URL du projet et la clé **anon** (publique).

> Le dépôt fourni était vide : aucune migration existante n'a été trouvée, elles ont donc été écrites ici. Si vous en avez déjà de votre côté, comparez-les avant d'exécuter celles-ci (ne les exécutez pas en double).

## 2. Variables d'environnement

```bash
cp .env.example .env.local
nano .env.local
```

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon publique (protégée par RLS) |

La clé `service_role` n'est **jamais** utilisée ni nécessaire. Ne la placez dans aucun fichier du projet.

## 3. Installation et lancement dans Termux (Android)

```bash
pkg update && pkg upgrade -y
pkg install -y nodejs-lts git unzip nano
cd ~/storage/downloads        # après "termux-setup-storage" si besoin
unzip football-booking.zip -d ~/
cd ~/football-booking
cp .env.example .env.local && nano .env.local
npm install
npm run dev
```

Ouvrez ensuite <http://localhost:3000> dans le navigateur du téléphone.

Conseils Termux :
- Tailwind est volontairement en **v3** (pur JavaScript) : la v4 dépend de binaires natifs souvent indisponibles sur Android.
- Next.js n'a pas toujours de binaire SWC natif pour Android. En cas d'erreur « SWC » ou « Failed to load SWC binary », installez la version WASM correspondant à votre Next : `npm install --no-save @next/swc-wasm-nodejs@$(node -p "require('next/package.json').version")`.
- Si la mémoire manque : `NODE_OPTIONS=--max-old-space-size=1024 npm run dev`.
- Si `npm install` échoue sur le stockage partagé, copiez le projet dans `~/` (stockage interne de Termux), comme ci-dessus.

## 4. Commandes

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run typecheck` | Contrôle TypeScript |
| `npm run lint` | ESLint |
| `npm run build` puis `npm start` | Build et exécution de production |

## 5. Déploiement

Sur Vercel (ou équivalent Node) : importez le dépôt, renseignez les deux variables d'environnement, déployez. Ajoutez l'URL de production dans **Authentication > URL Configuration** de Supabase.

## 6. Architecture

```
src/app/login                 Page de connexion (pas d'inscription)
src/app/(private)/            Zone protégée (layout + garde serveur)
  dashboard/                  Calendrier, résumé, formulaire
  history/                    Journal d'audit (lecture seule, filtres date / réservation)
src/components/{ui,layout,dashboard,bookings}
src/lib/supabase              Clients navigateur et serveur
src/lib/queries               Lectures (réservations, résumé, audit)
src/lib/actions               Mutations (Server Actions, session authentifiée)
src/lib/validation            Schéma Zod partagé client/serveur
src/lib/datetime.ts           Conversions heure locale Maroc ⇄ UTC (gère le changement horaire du Ramadan)
src/middleware.ts             Rafraîchissement de session + redirection vers /login
supabase/migrations           Schéma, RLS, triggers, fonction de résumé, Realtime
```

Sécurité : `src/middleware.ts` redirige les visiteurs sans session ; `requireManager()` revérifie la session **et** le profil côté serveur dans le layout et chaque page ; les mutations passent par des Server Actions qui utilisent la session de l'utilisateur ; `created_by` / `updated_by` sont fixés par un trigger SQL via `auth.uid()` (jamais fournis par le client) ; l'historique n'a aucune politique d'écriture et est alimenté uniquement par trigger.

Règles d'intégrité en base (la validation du formulaire n'est qu'un confort) : début < fin, 08:00–21:00 en heure locale, pas de passage de minuit, exclusion de chevauchement (`EXCLUDE USING gist`, intervalle `[début, fin[` → réservations consécutives autorisées) limitée aux réservations `confirmed`. `end_time` est calculé par un trigger (début + 1 h). Les conflits simultanés renvoient le code `23P01`, traduit en message français.

## 7. Indicateurs du résumé journalier

Calculés par la fonction SQL `daily_summary(date)` sur le jour local, pour les réservations **confirmées** uniquement :

- **Durée totale** : somme des durées confirmées. Les annulées sont seulement comptées à part.

## 8. Vérifications réellement exécutées

Lors de la génération de cette archive (Node 22, Linux) : `npm install`, `npx tsc --noEmit`, `next lint` et `next build` ont réussi, avec de fausses variables d'environnement. Un test manuel des conversions de fuseau a confirmé 08:00 local = 07:00 UTC hors Ramadan.

**Non exécuté** (aucun projet Supabase ni appareil Android disponible ici) : connexion réelle, politiques RLS, conflits simultanés entre deux comptes, Realtime, exécution des migrations SQL, lancement sous Termux. Testez ces scénarios après configuration (créez deux réservations qui se chevauchent depuis deux navigateurs pour vérifier le message de conflit). Les types TypeScript sont écrits à la main ; vous pouvez générer ceux de Supabase avec `npx supabase gen types typescript --project-id <id>`.
