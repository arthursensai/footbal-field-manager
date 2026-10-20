"use client";

import { useRouter } from "next/navigation";
import type { Booking } from "@/types/booking";
import { addDays, todayLocal, utcToLocal } from "@/lib/datetime";

interface Props {
  date: string;
  bookings: Booking[];
}

const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function monthLabel(date: string) {
  const [year, month] = date.split("-").map(Number);
  const label = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function moveMonth(date: string, delta: number) {
  const [year, month] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1 + delta, 1)).toISOString().slice(0, 10);
}

function eventTone() {
  return "border-emerald-200 bg-emerald-100 text-emerald-900";
}

export function MonthCalendar({ date, bookings }: Props) {
  const router = useRouter();
  const [year, month] = date.split("-").map(Number);
  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
  const weekdayOffset = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const gridStart = addDays(monthStart, -weekdayOffset);
  const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  const today = todayLocal();

  const byDate = new Map<string, Booking[]>();
  for (const booking of bookings) {
    if (booking.status !== "confirmed") continue;

    const localDate = utcToLocal(booking.start_time).date;
    const list = byDate.get(localDate) ?? [];
    list.push(booking);
    byDate.set(localDate, list);
  }

  const goToDate = (nextDate: string) => router.push(`/dashboard?date=${nextDate}`);

  return (
    <section aria-label="Calendrier mensuel" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-3 bg-emerald-700 px-3 py-3 text-white sm:px-5">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{monthLabel(date)}</h2>
          <p className="text-xs text-emerald-100">Calendrier des réservations</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={() => goToDate(moveMonth(date, -1))} aria-label="Mois précédent" className="rounded-lg px-3 py-2 text-lg hover:bg-emerald-600">‹</button>
          <button type="button" onClick={() => goToDate(today)} className="rounded-lg px-2 py-2 text-sm font-medium hover:bg-emerald-600">Aujourd’hui</button>
          <button type="button" onClick={() => goToDate(moveMonth(date, 1))} aria-label="Mois suivant" className="rounded-lg px-3 py-2 text-lg hover:bg-emerald-600">›</button>
        </div>
      </header>

      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekdays.map((day) => <div key={day} className="px-1 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">{day}</div>)}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const inMonth = day.slice(0, 7) === monthStart.slice(0, 7);
          const selected = day === date;
          const isToday = day === today;
          const dayBookings = byDate.get(day) ?? [];
          const dayNumber = Number(day.slice(-2));

          return (
            <button
              key={day}
              type="button"
              onClick={() => goToDate(day)}
              aria-label={`${day}, ${dayBookings.length} réservation(s)`}
              aria-pressed={selected}
              className={[
                "min-h-24 min-w-0 border-b border-r border-slate-100 p-1 text-left transition-colors sm:min-h-32 sm:p-2",
                inMonth ? "bg-white hover:bg-emerald-50/60" : "bg-slate-50/70 text-slate-400 hover:bg-slate-100",
                selected ? "relative z-10 ring-2 ring-inset ring-emerald-600" : "",
              ].join(" ")}
            >
              <span className="mb-1 flex items-center justify-center">
                <span className={[
                  "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold sm:h-7 sm:w-7 sm:text-sm",
                  isToday ? "bg-emerald-700 text-white" : selected ? "bg-emerald-100 text-emerald-900" : inMonth ? "text-slate-700" : "text-slate-400",
                ].join(" ")}>{dayNumber}</span>
              </span>
              <span className="block space-y-1">
                {dayBookings.map((booking) => (
                  <span key={booking.id} className={`block truncate rounded border px-1 py-0.5 text-[9px] leading-3 sm:px-1.5 sm:py-1 sm:text-[11px] sm:leading-4 ${eventTone()}`}>
                    <span className="font-semibold">{booking.customer_name}</span>
                    <span className="hidden sm:inline"> · {utcToLocal(booking.start_time).time}</span>
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <footer className="flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-200 px-3 py-3 text-[11px] text-slate-600 sm:px-4 sm:text-xs">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Réservations confirmées</span>
      </footer>
    </section>
  );
}
