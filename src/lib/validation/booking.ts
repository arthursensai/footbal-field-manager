import { z } from "zod";

export const OPENING_MINUTES = 8 * 60;
export const CLOSING_MINUTES = 21 * 60;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

const money = (label: string) =>
  z
    .number({ invalid_type_error: `${label} : saisissez un montant valide.`, required_error: `${label} est obligatoire.` })
    .min(0, `${label} ne peut pas être négatif.`)
    .max(1_000_000, `${label} est trop élevé.`);

export const bookingFormSchema = z
  .object({
    customerName: z.string().trim().min(2, "Le nom du client est obligatoire (2 caractères minimum).").max(120, "Le nom est trop long."),
    phone: z.string().trim().regex(/^[+0-9 ().-]{6,20}$/, "Numéro de téléphone invalide."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
    startTime: z.string().regex(TIME_RE, "Heure de début invalide."),
    endTime: z.string().regex(TIME_RE, "Heure de fin invalide."),
    totalPrice: money("Le prix total"),
    paidAmount: money("Le montant payé"),
    notes: z.string().max(1000, "Les notes sont trop longues (1000 caractères maximum)."),
  })
  .superRefine((v, ctx) => {
    if (TIME_RE.test(v.startTime) && TIME_RE.test(v.endTime)) {
      const s = toMinutes(v.startTime);
      const e = toMinutes(v.endTime);
      if (s >= e) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "L'heure de fin doit être postérieure à l'heure de début." });
      }
      if (s < OPENING_MINUTES) {
        ctx.addIssue({ code: "custom", path: ["startTime"], message: "La réservation doit commencer à 08:00 ou après." });
      }
      if (e > CLOSING_MINUTES) {
        ctx.addIssue({ code: "custom", path: ["endTime"], message: "La réservation doit se terminer à 21:00 au plus tard." });
      }
    }
    if (v.paidAmount > v.totalPrice) {
      ctx.addIssue({ code: "custom", path: ["paidAmount"], message: "Le montant payé ne peut pas dépasser le prix total." });
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
