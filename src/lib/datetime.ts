export const TIME_ZONE = "Africa/Casablanca";

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function getParts(ms: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of partsFormatter.formatToParts(new Date(ms))) {
    if (p.type !== "literal") out[p.type] = Number(p.value);
  }
  return out;
}

/** Décalage (ms) entre l'heure locale du Maroc et UTC à l'instant donné (gère le changement du Ramadan). */
function offsetMs(ms: number): number {
  const p = getParts(ms);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ms / 1000) * 1000;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Convertit une date locale "YYYY-MM-DD" et une heure locale "HH:MM" (Maroc) en instant UTC. */
export function localToUtc(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  const first = guess - offsetMs(guess);
  return new Date(guess - offsetMs(first));
}

export function utcToLocal(value: Date | string | number) {
  const p = getParts(new Date(value).getTime());
  return {
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
    time: `${pad(p.hour)}:${pad(p.minute)}`,
    minutes: p.hour * 60 + p.minute,
  };
}

export function minutesToTime(minutes: number): string {
	  if (minutes === 24 * 60) return "00:00";

	    return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function isValidDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && addDays(value, 0) === value;
}

export function todayLocal(): string {
  return utcToLocal(new Date()).date;
}

/** Intervalle UTC [début, fin[ d'un jour local. */
export function dayRangeUtc(date: string) {
  return { start: localToUtc(date, "00:00"), end: localToUtc(addDays(date, 1), "00:00") };
}

export function formatDateFr(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const text = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}
