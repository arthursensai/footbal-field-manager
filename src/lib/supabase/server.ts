import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/env";

/** Client serveur lié à la session de l'utilisateur (cookies). Toutes les requêtes passent par RLS. */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Appel depuis un Server Component : l'écriture de cookies y est impossible.
          // Le middleware (src/middleware.ts) rafraîchit la session, ce cas est donc attendu.
        }
      },
    },
  });
}
