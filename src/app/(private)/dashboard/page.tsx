import { BookingsWorkspace } from "@/components/dashboard/BookingsWorkspace";
import { DailySummary } from "@/components/dashboard/DailySummary";
import { MonthCalendar } from "@/components/dashboard/MonthCalendar";
import { RealtimeSync } from "@/components/dashboard/RealtimeSync";
import { requireManager } from "@/lib/auth";
import { formatDateFr, isValidDate, todayLocal } from "@/lib/datetime";
import { getBookingsForDay, getBookingsForMonth, getDailySummary } from "@/lib/queries/bookings";

export const metadata = { title: "Tableau de bord · Réservations du terrain" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { supabase } = await requireManager();
  const { date: requested } = await searchParams;
  const date = isValidDate(requested) ? requested : todayLocal();

  const [bookings, monthBookings, summary] = await Promise.all([
    getBookingsForDay(supabase, date),
    getBookingsForMonth(supabase, date),
    getDailySummary(supabase, date),
  ]);

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-5 py-6 text-white shadow-lg shadow-slate-900/10 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full border-[28px] border-emerald-400/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 right-24 size-44 rounded-full border border-white/10" aria-hidden="true" />
        <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-400" /> Espace de gestion
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Tableau de bord</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">Gardez un œil sur les réservations et organisez la journée du terrain en un seul endroit.</p>
          </div>
          <div className="relative shrink-0 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Journée sélectionnée</p>
            <p className="mt-1 text-sm font-semibold capitalize text-white">{formatDateFr(date)}</p>
          </div>
        </div>
        <RealtimeSync />
      </section>

      <DailySummary summary={summary} />

      <section aria-labelledby="calendrier-titre" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Planification</p>
            <h2 id="calendrier-titre" className="mt-1 text-lg font-bold tracking-tight text-slate-950">Calendrier des réservations</h2>
          </div>
          <p className="text-xs text-slate-500">Sélectionnez un jour pour afficher son planning</p>
        </div>
        <MonthCalendar date={date} bookings={monthBookings} />
      </section>

      <BookingsWorkspace date={date} bookings={bookings} />
    </>
  );
}
