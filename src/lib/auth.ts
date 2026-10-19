import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/booking";

/**
 * Garde côté serveur : exige une session valide ET un profil dans public.profiles.
 * Les politiques RLS appliquent la même règle côté base.
 */
export const requireManager = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("id", user.id)
    .maybeSingle();
  if (error) {
    console.error("requireManager", error);
    throw new Error("Impossible de vérifier votre profil.");
  }
  if (!data) redirect("/login?erreur=non-autorise");
  return { supabase, user, profile: data as Profile };
});
