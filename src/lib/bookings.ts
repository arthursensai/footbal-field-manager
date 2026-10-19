import type { Booking } from "@/types/booking";
import { minutesToTime, utcToLocal } from "@/lib/datetime";
import { CLOSING_MINUTES, OPENING_MINUTES } from "@/lib/validation/booking";

/** Conflit "connu" côté client, uniquement à titre d'avertissement : la base reste l'autorité. */
export function findConflict(bookings: Booking[], start: Date, end: Date, excludeId?: string): Booking | null {
  return (
    bookings.find(
      (b) =>
        b.status === "confirmed" &&
        b.id !== excludeId &&
        new Date(b.start_time) < end &&
        new Date(b.end_time) > start,
    ) ?? null
  );
}

export interface Gap {
  start: number;
  end: number;
}

/** Créneaux libres (en minutes depuis minuit) d'au moins 30 minutes entre 08:00 et 21:00. */
export function computeGaps(confirmed: Booking[]): Gap[] {
  const sorted = [...confirmed].sort((a, b) => a.start_time.localeCompare(b.start_time));
  const gaps: Gap[] = [];
  let cursor = OPENING_MINUTES;
  for (const b of sorted) {
    const s = utcToLocal(b.start_time).minutes;
    const e = utcToLocal(b.end_time).minutes;
    if (s - cursor >= 30) gaps.push({ start: cursor, end: s });
    cursor = Math.max(cursor, e);
  }
  if (CLOSING_MINUTES - cursor >= 30) gaps.push({ start: cursor, end: CLOSING_MINUTES });
  return gaps;
}

export const gapLabel = (g: Gap) => `${minutesToTime(g.start)}–${minutesToTime(g.end)}`;
