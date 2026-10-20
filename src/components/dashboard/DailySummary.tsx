import { formatDuration } from "@/lib/format";
import type { DailySummaryData } from "@/types/booking";

function Stat({ label, value, detail, tone }: { label: string; value: string; detail: string; tone: "green" | "slate" | "blue" }) {
  const tones = {
    green: { icon: "bg-emerald-100 text-emerald-800", bar: "bg-emerald-500", glyph: "✓" },
    slate: { icon: "bg-slate-100 text-slate-600", bar: "bg-slate-400", glyph: "↗" },
    blue: { icon: "bg-sky-100 text-sky-800", bar: "bg-sky-500", glyph: "◷" },
  }[tone];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <span className={`absolute inset-y-0 left-0 w-1 ${tones.bar}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <dt className="text-sm font-medium leading-5 text-slate-500">{label}</dt>
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-base font-bold ${tones.icon}`} aria-hidden="true">{tones.glyph}</span>
      </div>
      <dd className="mt-4 text-3xl font-bold tracking-tight text-slate-950 tabular-nums">{value}</dd>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export function DailySummary({ summary }: { summary: DailySummaryData }) {
  return (
    <section aria-labelledby="resume-titre" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">Vue d’ensemble</p>
          <h2 id="resume-titre" className="mt-1 text-lg font-bold tracking-tight text-slate-950">Résumé de la journée</h2>
        </div>
        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500">Mis à jour à l’ouverture</span>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <Stat label="Réservations confirmées" value={String(summary.confirmed_count)} detail="Créneaux confirmés aujourd’hui" tone="green" />
        <Stat label="Réservations annulées" value={String(summary.cancelled_count)} detail="Exclues du temps réservé" tone="slate" />
        <Stat label="Durée totale réservée" value={formatDuration(summary.total_minutes)} detail="Temps confirmé sur le terrain" tone="blue" />
      </dl>
      <details className="rounded-xl border border-slate-200/80 bg-white/70 px-4 py-3 text-xs text-slate-500">
        <summary className="cursor-pointer font-semibold text-slate-600">Comment lire ces indicateurs ?</summary>
        <ul className="mt-2 list-disc space-y-1 pl-4 leading-relaxed">
          <li>Les réservations annulées sont comptées à part et exclues de la durée.</li>
          <li>Les réservations sont rattachées au jour local (Africa/Casablanca) de leur heure de début.</li>
        </ul>
      </details>
    </section>
  );
}
