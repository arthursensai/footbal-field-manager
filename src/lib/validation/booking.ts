import { z } from "zod";

export const OPENING_MINUTES = 8 * 60;
export const CLOSING_MINUTES = 21 * 60;

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export const BOOKING_MINUTES = 60;

export const bookingFormSchema = z
  .object({
    customerName: z.string().trim().min(2, "Le nom du client est obligatoire (2 caractères minimum).").max(120, "Le nom est trop long."),
    phone: z
      .string()
      .trim()
      .refine((v) => v === "" || /^[+0-9 ().-]{6,20}$/.test(v), "Numéro de téléphone invalide."),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide."),
    startTime: z.string().regex(TIME_RE, "Heure de début invalide."),
  })
  .superRefine((v, ctx) => {
    if (TIME_RE.test(v.startTime)) {
      const s = toMinutes(v.startTime);
      if (s < OPENING_MINUTES) {
        ctx.addIssue({ code: "custom", path: ["startTime"], message: "La réservation doit commencer à 08:00 ou après." });
      }
      if (s + BOOKING_MINUTES > CLOSING_MINUTES) {
        ctx.addIssue({ code: "custom", path: ["startTime"], message: "La dernière réservation commence à 20:00 (durée fixe d'une heure)." });
      }
    }
  });

export type BookingFormValues = z.infer<typeof bookingFormSchema>;
