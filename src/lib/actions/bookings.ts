"use server";

import { revalidatePath } from "next/cache";
import { localToUtc } from "@/lib/datetime";
import { createClient } from "@/lib/supabase/server";
import { bookingFormSchema } from "@/lib/validation/booking";
import type { ActionResult } from "@/types/booking";

interface DbError {
  code?: string;
  message?: string;
}

/** Traduit une erreur PostgreSQL/PostgREST en message français sans exposer de détails internes. */
function mapDbError(error: DbError, fallback: string): string {
  console.error("Erreur base de données", error.code, error.message);
  if (error.code === "23P01") return "Ce créneau est déjà réservé par une autre réservation confirmée. Choisissez un autre horaire.";
  if (error.code === "23514") return "Les données ne respectent pas les règles de réservation (horaires, montants).";
  if (error.code === "42501") return "Action non autorisée avec ce compte.";
  if (error.code === "PGRST301" || error.code === "PGRST303" || /jwt/i.test(error.message ?? "")) {
    return "Votre session a expiré. Reconnectez-vous.";
  }
  return fallback;
}

async function getAuthenticatedClient() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return supabase;
}

/** Crée (id = null) ou modifie une réservation. created_by/updated_by sont posés par la base. */
export async function saveBooking(id: string | null, input: unknown): Promise<ActionResult> {
  const parsed = bookingFormSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Données invalides." };

  const supabase = await getAuthenticatedClient();
  if (!supabase) return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };

  const v = parsed.data;
  const payload = {
    customer_name: v.customerName,
    phone: v.phone,
    start_time: localToUtc(v.date, v.startTime).toISOString(),
    end_time: localToUtc(v.date, v.endTime).toISOString(),
    total_price: v.totalPrice,
    paid_amount: v.paidAmount,
    notes: v.notes.trim() === "" ? null : v.notes.trim(),
  };

  if (id === null) {
    const { error } = await supabase.from("bookings").insert(payload);
    if (error) return { ok: false, message: mapDbError(error, "Échec de l'enregistrement. Réessayez.") };
  } else {
    const { data, error } = await supabase
      .from("bookings")
      .update(payload)
      .eq("id", id)
      .eq("status", "confirmed")
      .select("id");
    if (error) return { ok: false, message: mapDbError(error, "Échec de l'enregistrement. Réessayez.") };
    if (!data || data.length === 0) return { ok: false, message: "Réservation introuvable ou déjà annulée." };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Annulation logique : le statut passe à "cancelled", l'enregistrement et l'historique sont conservés. */
export async function cancelBooking(id: string): Promise<ActionResult> {
  const supabase = await getAuthenticatedClient();
  if (!supabase) return { ok: false, message: "Votre session a expiré. Reconnectez-vous." };

  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("status", "confirmed")
    .select("id");
  if (error) return { ok: false, message: mapDbError(error, "Échec de l'annulation. Réessayez.") };
  if (!data || data.length === 0) return { ok: false, message: "Réservation introuvable ou déjà annulée." };

  revalidatePath("/dashboard");
  return { ok: true };
}
