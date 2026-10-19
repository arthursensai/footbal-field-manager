import Link from "next/link";
import { requireManager } from "@/lib/auth";
import { formatDateTime, isValidDate } from "@/lib/datetime";
import { getAuditLogs, isUuid } from "@/lib/queries/bookings";
import type { AuditAction, AuditLog } from "@/types/booking";

export const metadata = { title: "Historique · Réservations du terrain" };

const ACTION_LABELS: Record<AuditAction, { label: string; tone: string }> = {
  create: { label: "Création", tone: "bg-emerald-100 text-emerald-800" },
  update: { label: "Modification", tone: "bg-blue-100 text-blue-800" },
  cancel: { label: "Annulation", tone: "bg-red-100 text-red-800" },
};

const FIELDS: { key: string; label: string; kind?: "datetime" }[] = [
  { key: "customer_name", label: "Client" },
  { key: "phone", label: "Téléphone" },
  { key: "start_time", label: "Début", kind: "datetime" },
  { key: "end_time", label: "Fin", kind: "datetime" },
  { key: "status", label: "Statut" },
];

function display(value: unknown, kind?: "datetime"): string {
  if (value === null || value === undefined || value === "") return "—";
  if (kind === "datetime") return formatDateTime(String(value));
  if (value === "confirmed") return "Confirmée";
  if (value === "cancelled") return "Annulée";
  return String(value);
}

function changes(log: AuditLog) {
  if (log.action === "create") {
    return FIELDS.filter((f) => f.key !== "status").map((f) => ({
      label: f.label,
      from: null as string | null,
      to: display(log.new_data?.[f.key], f.kind),
    }));
  }
  return FIELDS.filter((f) => JSON.stringify(log.old_data?.[f.key]) !== JSON.stringify(log.new_data?.[f.key])).map((f) => ({
    label: f.label,
    from: display(log.old_data?.[f.key], f.kind),
    to: display(log.new_data?.[f.key], f.kind),
  }));
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; booking?: string }>;
}) {
  const { supabase } = await requireManager();
  const sp = await searchParams;
  const date = isValidDate(sp.date) ? sp.date : undefined;
  const bookingId = isUuid(sp.booking) ? sp.booking : undefined;
  const logs = await getAuditLogs(supabase, { date, bookingId });

  return (
    <>
      <h1 className="text-xl font-bold">Historique des modifications</h1>

      <form method="get" className="flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <div>
          <label htmlFor="date" className="block text-xs text-slate-600">
            Date de l'événement
          </label>
          <input id="date" name="date" type="date" defaultValue={date ?? ""} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        </div>
        {bookingId ? <input type="hidden" name="booking" value={bookingId} /> : null}
        <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
          Filtrer
        </button>
        <Link href="/history" className="px-2 py-2 text-sm text-slate-600 underline">
          Réinitialiser
        </Link>
        {bookingId ? <p className="w-full text-xs text-slate-600">Filtré sur une seule réservation.</p> : null}
      </form>

      {logs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600">
          Aucun événement pour ces critères.
        </p>
      ) : (
        <ul className="space-y-2">
          {logs.map((log) => {
            const { label, tone } = ACTION_LABELS[log.action];
            const diff = changes(log);
            return (
              <li key={log.id} className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{label}</span>
                  <strong>{log.booking?.customer_name ?? "Réservation"}</strong>
                  <span className="text-slate-500">
                    · {formatDateTime(log.created_at)} · par {log.actor?.full_name ?? "responsable inconnu"}
                  </span>
                </div>
                {diff.length > 0 ? (
                  <ul className="space-y-0.5 text-xs text-slate-700">
                    {diff.map((d) => (
                      <li key={d.label}>
                        <span className="text-slate-500">{d.label} :</span>{" "}
                        {d.from !== null ? (
                          <>
                            <span className="line-through">{d.from}</span> → <strong>{d.to}</strong>
                          </>
                        ) : (
                          <strong>{d.to}</strong>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
