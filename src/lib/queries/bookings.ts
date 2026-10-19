import type { SupabaseClient } from "@supabase/supabase-js";
import { dayRangeUtc, localToUtc } from "@/lib/datetime";
import type { AuditLog, Booking, DailySummaryData } from "@/types/booking";

function normalize(row: Booking): Booking {
  return { ...row, total_price: Number(row.total_price), paid_amount: Number(row.paid_amount) };
}

export async function getBookingsForDay(supabase: SupabaseClient, date: string): Promise<Booking[]> {
  const { start, end } = dayRangeUtc(date);
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .lt("start_time", end.toISOString())
    .gt("end_time", start.toISOString())
    .order("start_time", { ascending: true });
  if (error) {
    console.error("getBookingsForDay", error);
    throw new Error("Échec du chargement des réservations.");
  }
  return ((data ?? []) as Booking[]).map(normalize);
}

/** Charge les réservations qui chevauchent le mois affiché, en heure locale du Maroc. */
export async function getBookingsForMonth(supabase: SupabaseClient, date: string): Promise<Booking[]> {
  const [year, month] = date.split("-").map(Number);
  const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);
  const start = localToUtc(firstDay, "00:00");
  const end = localToUtc(nextMonth, "00:00");

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .lt("start_time", end.toISOString())
    .gt("end_time", start.toISOString())
    .order("start_time", { ascending: true });
  if (error) {
    console.error("getBookingsForMonth", error);
    throw new Error("Échec du chargement du calendrier mensuel.");
  }
  return ((data ?? []) as Booking[]).map(normalize);
}

export async function getDailySummary(supabase: SupabaseClient, date: string): Promise<DailySummaryData> {
  const { data, error } = await supabase.rpc("daily_summary", { p_day: date });
  if (error) {
    console.error("getDailySummary", error);
    throw new Error("Échec du chargement du résumé journalier.");
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error("Résumé journalier indisponible.");
  return {
    confirmed_count: Number(row.confirmed_count),
    cancelled_count: Number(row.cancelled_count),
    total_minutes: Number(row.total_minutes),
    expected_revenue: Number(row.expected_revenue),
    collected_amount: Number(row.collected_amount),
    remaining_amount: Number(row.remaining_amount),
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string | undefined): v is string => !!v && UUID_RE.test(v);

export async function getAuditLogs(
  supabase: SupabaseClient,
  filters: { date?: string; bookingId?: string },
): Promise<AuditLog[]> {
  let query = supabase
    .from("booking_audit_logs")
    .select(
      "id, booking_id, action, actor_id, old_data, new_data, created_at, actor:profiles(full_name), booking:bookings(customer_name)",
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (filters.date) {
    const { start, end } = dayRangeUtc(filters.date);
    query = query.gte("created_at", start.toISOString()).lt("created_at", end.toISOString());
  }
  if (filters.bookingId) query = query.eq("booking_id", filters.bookingId);

  const { data, error } = await query;
  if (error) {
    console.error("getAuditLogs", error);
    throw new Error("Échec du chargement de l'historique.");
  }
  return (data ?? []) as unknown as AuditLog[];
}
