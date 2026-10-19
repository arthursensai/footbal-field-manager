import { BookingsWorkspace } from "@/components/dashboard/BookingsWorkspace";
import { DailySummary } from "@/components/dashboard/DailySummary";
import { DateNavigator } from "@/components/dashboard/DateNavigator";
import { RealtimeSync } from "@/components/dashboard/RealtimeSync";
import { requireManager } from "@/lib/auth";
import { formatDateFr, isValidDate, todayLocal } from "@/lib/datetime";
import { getBookingsForDay, getDailySummary } from "@/lib/queries/bookings";

export const metadata = { title: "Tableau de bord · Réservations du terrain" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { supabase } = await requireManager();
  const { date: requested } = await searchParams;
  const date = isValidDate(requested) ? requested : todayLocal();

  const [bookings, summary] = await Promise.all([getBookingsForDay(supabase, date), getDailySummary(supabase, date)]);

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-xl font-bold">{formatDateFr(date)}</h1>
        <DateNavigator date={date} />
        <RealtimeSync />
      </div>
      <DailySummary summary={summary} />
      <BookingsWorkspace date={date} bookings={bookings} />
    </>
  );
}
