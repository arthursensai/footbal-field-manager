import { formatDuration } from "@/lib/format";
import type { DailySummaryData } from "@/types/booking";

function Stat({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`mt-1 text-lg font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}

export function DailySummary({ summary }: { summary: DailySummaryData }) {
  return (
    <section aria-labelledby="resume-titre" className="space-y-2">
      <h2 id="resume-titre" className="text-base font-semibold">
        Résumé de la journée
      </h2>
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Réservations confirmées" value={String(summary.confirmed_count)} />
        <Stat label="Réservations annulées" value={String(summary.cancelled_count)} tone="text-slate-500" />
        <Stat label="Durée totale réservée" value={formatDuration(summary.total_minutes)} />
      </dl>
      <details className="text-xs text-slate-600">
        <summary className="cursor-pointer">Définition des indicateurs</summary>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          <li>Les réservations annulées sont comptées à part et exclues de la durée.</li>
          <li>Les réservations sont rattachées au jour local (Africa/Casablanca) de leur heure de début.</li>
        </ul>
      </details>
    </section>
  );
}
