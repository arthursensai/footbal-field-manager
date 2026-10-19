const mad = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "MAD" });

export function formatMAD(value: number): string {
  return mad.format(value);
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
