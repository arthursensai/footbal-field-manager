"use client";

import type { Booking } from "@/types/booking";
import { formatTime, minutesToTime, utcToLocal } from "@/lib/datetime";
import { formatMAD } from "@/lib/format";
import { computeGaps, gapLabel } from "@/lib/bookings";
import { CLOSING_MINUTES, OPENING_MINUTES } from "@/lib/validation/booking";

const HOUR_PX = 72;
const TOTAL_PX = ((CLOSING_MINUTES - OPENING_MINUTES) / 60) * HOUR_PX;
const y = (minutes: number) => ((minutes - OPENING_MINUTES) / 60) * HOUR_PX;
const HOURS = Array.from({ length: (CLOSING_MINUTES - OPENING_MINUTES) / 60 + 1 }, (_, i) => OPENING_MINUTES / 60 + i);

interface Props {
  date: string;
  bookings: Booking[];
  now: number | null;
  onSelect: (booking: Booking) => void;
  onCreate: (start: string, end: string) => void;
}

export function DayCalendar({ date, bookings, now, onSelect, onCreate }: Props) {
  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const gaps = computeGaps(confirmed);

  let nowTop: number | null = null;
  if (now !== null) {
    const local = utcToLocal(now);
    if (local.date === date && local.minutes >= OPENING_MINUTES && local.minutes <= CLOSING_MINUTES) {
      nowTop = y(local.minutes);
    }
  }

  return (
    <div className="space-y-2">
      {confirmed.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-600">
          Aucune réservation confirmée ce jour-là : le terrain est entièrement libre.
        </p>
      ) : null}

      <div className="relative mt-3 rounded-xl border border-slate-200 bg-white" style={{ height: TOTAL_PX }}>
        {HOURS.map((h) => (
          <div key={h} className="absolute inset-x-0 border-t border-slate-100" style={{ top: y(h * 60) }}>
            <span className="absolute -top-2.5 left-1 bg-white px-1 text-xs text-slate-500">
              {String(h).padStart(2, "0")}:00
            </span>
          </div>
        ))}

        <div className="absolute inset-y-0 left-14 right-2">
          {gaps.map((g) => (
            <button
              key={g.start}
              type="button"
              onClick={() => onCreate(minutesToTime(g.start), minutesToTime(Math.min(g.start + 60, g.end)))}
              className="absolute inset-x-0 flex items-center rounded-lg border border-dashed border-emerald-300 bg-emerald-50/40 px-3 text-xs text-emerald-700 hover:bg-emerald-50"
              style={{ top: y(g.start) + 2, height: y(g.end) - y(g.start) - 4 }}
            >
              Libre · {gapLabel(g)} · Réserver
            </button>
          ))}

          {confirmed.map((b) => {
            const s = utcToLocal(b.start_time).minutes;
            const e = utcToLocal(b.end_time).minutes;
            const past = now !== null && new Date(b.end_time).getTime() < now;
            const current = now !== null && new Date(b.start_time).getTime() <= now && now < new Date(b.end_time).getTime();
            const height = Math.max(y(e) - y(s) - 4, 28);
            const remaining = b.total_price - b.paid_amount;
            const tone = past
              ? "border-slate-300 bg-slate-200 text-slate-500"
              : current
                ? "border-emerald-800 bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "border-emerald-700 bg-emerald-500 text-white";
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelect(b)}
                title={`${b.customer_name} · ${formatTime(b.start_time)}–${formatTime(b.end_time)}`}
                className={`absolute inset-x-0 z-10 overflow-hidden rounded-lg border px-3 py-1 text-left ${tone}`}
                style={{ top: y(s) + 2, height }}
              >
                <span className="block truncate text-sm font-semibold">{b.customer_name}</span>
                <span className="block text-xs">
                  {formatTime(b.start_time)} – {formatTime(b.end_time)}
                  {past ? " · terminée" : current ? " · en cours" : ""}
                </span>
                {height >= 64 ? (
                  <span className="block text-xs opacity-90">
                    {remaining > 0 ? `Reste ${formatMAD(remaining)}` : "Payé en totalité"}
                  </span>
                ) : null}
              </button>
            );
          })}

          {nowTop !== null ? (
            <div className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-red-500" style={{ top: nowTop }} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
