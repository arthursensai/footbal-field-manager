"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { saveBooking } from "@/lib/actions/bookings";
import { findConflict } from "@/lib/bookings";
import { formatTime, localToUtc, utcToLocal } from "@/lib/datetime";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validation/booking";
import type { Booking } from "@/types/booking";

interface Props {
  loadedDate: string;
  loadedBookings: Booking[];
  booking?: Booking;
  defaultStart?: string;
  defaultEnd?: string;
  onSaved: (message: string) => void;
  onClose: () => void;
}

const TIME_RE = /^\d{2}:\d{2}$/;

export function BookingForm({ loadedDate, loadedBookings, booking, defaultStart, defaultEnd, onSaved, onClose }: Props) {
  const [pending, setPending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const initial: BookingFormValues = booking
    ? {
        customerName: booking.customer_name,
        phone: booking.phone,
        date: utcToLocal(booking.start_time).date,
        startTime: utcToLocal(booking.start_time).time,
        endTime: utcToLocal(booking.end_time).time,
        totalPrice: booking.total_price,
        paidAmount: booking.paid_amount,
        notes: booking.notes ?? "",
      }
    : {
        customerName: "",
        phone: "",
        date: loadedDate,
        startTime: defaultStart ?? "10:00",
        endTime: defaultEnd ?? "11:00",
        totalPrice: 0,
        paidAmount: 0,
        notes: "",
      };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormValues>({ resolver: zodResolver(bookingFormSchema), defaultValues: initial });

  const date = watch("date");
  const startTime = watch("startTime");
  const endTime = watch("endTime");

  // Conflit "connu" : uniquement pour le jour affiché. La base de données reste l'autorité.
  const conflict = useMemo(() => {
    if (date !== loadedDate || !TIME_RE.test(startTime) || !TIME_RE.test(endTime)) return null;
    const start = localToUtc(date, startTime);
    const end = localToUtc(date, endTime);
    if (!(start < end)) return null;
    return findConflict(loadedBookings, start, end, booking?.id);
  }, [date, startTime, endTime, loadedDate, loadedBookings, booking?.id]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    if (conflict) {
      setServerError("Ce créneau chevauche une réservation existante. Modifiez les horaires.");
      return;
    }
    setPending(true);
    try {
      const result = await saveBooking(booking?.id ?? null, values);
      if (result.ok) onSaved(booking ? "Réservation modifiée." : "Réservation créée.");
      else setServerError(result.message);
    } catch (e) {
      console.error("saveBooking", e);
      setServerError("Connexion indisponible. Vérifiez votre réseau puis réessayez.");
    } finally {
      setPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-3">
      <Field label="Nom du client" htmlFor="customerName" error={errors.customerName?.message}>
        <input id="customerName" className={inputClass} autoComplete="off" {...register("customerName")} />
      </Field>
      <Field label="Téléphone" htmlFor="phone" error={errors.phone?.message}>
        <input id="phone" type="tel" inputMode="tel" className={inputClass} {...register("phone")} />
      </Field>
      <Field label="Date" htmlFor="date" error={errors.date?.message}>
        <input id="date" type="date" className={inputClass} {...register("date")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Heure de début" htmlFor="startTime" error={errors.startTime?.message}>
          <input id="startTime" type="time" step={300} className={inputClass} {...register("startTime")} />
        </Field>
        <Field label="Heure de fin" htmlFor="endTime" error={errors.endTime?.message}>
          <input id="endTime" type="time" step={300} className={inputClass} {...register("endTime")} />
        </Field>
      </div>
      {conflict ? (
        <p role="alert" className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">
          Conflit : {conflict.customer_name} a déjà réservé de {formatTime(conflict.start_time)} à {formatTime(conflict.end_time)}.
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Prix total (MAD)" htmlFor="totalPrice" error={errors.totalPrice?.message}>
          <input
            id="totalPrice"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className={inputClass}
            {...register("totalPrice", { valueAsNumber: true })}
          />
        </Field>
        <Field label="Montant payé (MAD)" htmlFor="paidAmount" error={errors.paidAmount?.message}>
          <input
            id="paidAmount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            className={inputClass}
            {...register("paidAmount", { valueAsNumber: true })}
          />
        </Field>
      </div>
      <Field label="Notes (facultatif)" htmlFor="notes" error={errors.notes?.message}>
        <textarea id="notes" rows={3} className={inputClass} {...register("notes")} />
      </Field>

      {serverError ? (
        <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
          {serverError}
        </p>
      ) : null}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="secondary" onClick={onClose} disabled={pending}>
          Fermer
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : booking ? "Enregistrer les modifications" : "Créer la réservation"}
        </Button>
      </div>
    </form>
  );
}
