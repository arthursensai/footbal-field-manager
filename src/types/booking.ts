export type BookingStatus = "confirmed" | "cancelled";

export interface Booking {
  id: string;
  customer_name: string;
  phone: string | null;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface DailySummaryData {
  confirmed_count: number;
  cancelled_count: number;
  total_minutes: number;
}

export type AuditAction = "create" | "update" | "cancel";

export interface AuditLog {
  id: number;
  booking_id: string;
  action: AuditAction;
  actor_id: string | null;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  created_at: string;
  actor: { full_name: string } | null;
  booking: { customer_name: string } | null;
}

export interface Profile {
  id: string;
  full_name: string;
}

export type ActionResult = { ok: true } | { ok: false; message: string };
