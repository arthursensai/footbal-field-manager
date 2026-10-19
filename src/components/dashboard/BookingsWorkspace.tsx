"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingDialog, type DialogState } from "@/components/bookings/BookingDialog";
import { DayCalendar } from "@/components/dashboard/DayCalendar";
import { formatTime } from "@/lib/datetime";
import type { Booking } from "@/types/booking";
import Link from "next/link";

export function BookingsWorkspace({ date, bookings }: { date: string; bookings: Booking[] }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const close = useCallback(() => setDialog(null), []);
  const saved = useCallback((message: string) => {
    setDialog(null);
    setToast(message);
  }, []);

  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <section aria-labelledby="planning-titre" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="planning-titre" className="text-base font-semibold">
          Planning (08:00 – 21:00)
        </h2>
        <Button onClick={() => setDialog({ mode: "create" })}>Nouvelle réservation</Button>
      </div>

      <div aria-live="polite" className="min-h-0">
        {toast ? <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">{toast}</p> : null}
      </div>

      <DayCalendar
        date={date}
        bookings={bookings}
        now={now}
        onSelect={(booking) => setDialog({ mode: "edit", booking })}
        onCreate={(start, end) => setDialog({ mode: "create", start, end })}
      />

      {cancelled.length > 0 ? (
        <details className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
          <summary className="cursor-pointer text-slate-700">Réservations annulées ({cancelled.length})</summary>
          <ul className="mt-2 space-y-1 text-slate-500">
            {cancelled.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-2">
                <span className="line-through">
                  {b.customer_name} · {formatTime(b.start_time)} – {formatTime(b.end_time)}
                </span>
                <Link href={`/history?booking=${b.id}`} className="text-emerald-700 underline">
                  Historique
                </Link>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {dialog ? (
        <BookingDialog
          key={dialog.mode === "edit" ? dialog.booking.id : `new-${dialog.start ?? ""}`}
          state={dialog}
          loadedDate={date}
          loadedBookings={bookings}
          onClose={close}
          onSaved={saved}
        />
      ) : null}
    </section>
  );
}
