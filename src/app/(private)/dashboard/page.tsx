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
      <div className="space-y-2">
        <h1 className="text-xl font-bold">{formatDateFr(date)}</h1>
        <RealtimeSync />
      </div>
      <MonthCalendar date={date} bookings={monthBookings} />
      <DailySummary summary={summary} />
      <BookingsWorkspace date={date} bookings={bookings} />
    </>
  );
}
