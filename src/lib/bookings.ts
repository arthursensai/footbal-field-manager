import type { Booking } from "@/types/booking";
import { minutesToTime, utcToLocal } from "@/lib/datetime";
import { CLOSING_MINUTES, OPENING_MINUTES } from "@/lib/validation/booking";

/** Client-side conflict check; the database remains authoritative. */
export function findConflict(
  bookings: Booking[],
  start: Date,
  end: Date,
  excludeId?: string,
): Booking | null {
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

function endMinutes(booking: Booking): number {
  const start = utcToLocal(booking.start_time);
  const end = utcToLocal(booking.end_time);

  // Midnight on the following day is the end of this day's timeline.
  if (end.date !== start.date && end.time === "00:00") {
    return 24 * 60;
  }

  return end.minutes;
}

/** Free slots between 08:00 and midnight. */
export function computeGaps(confirmed: Booking[]): Gap[] {
  const sorted = [...confirmed].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  const gaps: Gap[] = [];
  let cursor = OPENING_MINUTES;

  for (const booking of sorted) {
    const start = utcToLocal(booking.start_time).minutes;
    const end = endMinutes(booking);

    if (start - cursor >= 30) {
      gaps.push({ start: cursor, end: start });
    }

    cursor = Math.max(cursor, end);
  }

  if (CLOSING_MINUTES - cursor >= 30) {
    gaps.push({ start: cursor, end: CLOSING_MINUTES });
  }

  return gaps;
}

export const gapLabel = (gap: Gap) =>
  `${minutesToTime(gap.start)}–${minutesToTime(gap.end)}`;
