# Football Booking

Private football-field booking manager built with Next.js, TypeScript, Supabase Auth/PostgreSQL/Realtime and Tailwind CSS. The application timezone is `Africa/Casablanca`.

## Booking rules

- Opening: **08:00**
- Closing: **00:00 (midnight)**
- Fixed booking duration: **1 hour**
- Last allowed start: **23:00**
- Confirmed bookings cannot overlap; back-to-back bookings are allowed.
- Financial fields are not required by the application. The database's existing `currency` setting is retained to avoid deleting existing data unnecessarily.

Both server-side validation and PostgreSQL constraints are required. The database remains authoritative.

## Supabase setup

1. Create a Supabase project.
2. Apply files in `supabase/migrations` in filename order. The second migration is designed to be safe to re-run against the current application schema and preserves existing bookings, profiles and audit logs.
3. Create manager accounts manually under **Authentication → Users**.
4. Edit `supabase/seed-profiles.example.sql` to use the actual manager email/name, then run it in the Supabase SQL Editor. It links an existing Auth user to a manager profile; it does not create an Auth user or set a password.
5. Set the production site URL and required callback URLs in **Authentication → URL Configuration**, including the password-reset redirect URL.
6. In **Authentication → Providers / Password Security**, enable leaked-password protection.
7. Copy the Project URL and publishable/anon key from **Project Settings → API** into `.env.local`. Never expose `service_role` or secret keys in `NEXT_PUBLIC_*` variables.

## Environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Install / run (including Termux)

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use `npm run build` to check a production build. If the repository's package scripts differ, `package.json` is authoritative.

## Key paths

- `src/app/login`: manager login.
- `src/app/reset-password`: set a new password after the reset callback.
- `src/lib/actions`: authenticated server actions.
- `src/lib/validation/booking.ts`: booking input rules.
- `src/lib/datetime.ts`: Morocco local time / UTC conversions.
- `supabase/migrations`: database schema and security migrations.
- `supabase/seed-profiles.example.sql`: link existing Auth users to manager profiles.
- `supabase/tests/booking_invariants.sql`: read-only post-migration smoke checks.

## Security notes

- RLS is enabled on `bookings`, `booking_audit_logs`, `field_settings` and `profiles`.
- The `anon` role must not have SELECT access to these tables.
- Authenticated access is limited by grants and RLS policies.
- Audit logs are written by a trigger; there is no client policy for inserting/updating audit rows.
- The `private` schema is used for the RLS moderator helper; do not add it to the exposed API schemas.
- Disable public sign-ups if only pre-created managers should use the application.
- Leaked-password protection is a Supabase Auth dashboard setting and is not enabled by SQL migrations.

## Smoke checks

Run `supabase/tests/booking_invariants.sql` in the SQL Editor after migrations. It checks settings, duration integrity, RLS and anonymous read permissions without creating, updating or deleting bookings.
