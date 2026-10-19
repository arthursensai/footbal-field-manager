"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookingForm } from "@/components/bookings/BookingForm";
import { cancelBooking } from "@/lib/actions/bookings";
import type { Booking } from "@/types/booking";

export type DialogState =
  | { mode: "create"; start?: string; end?: string }
  | { mode: "edit"; booking: Booking };

interface Props {
  state: DialogState;
  loadedDate: string;
  loadedBookings: Booking[];
  onClose: () => void;
  onSaved: (message: string) => void;
}

export function BookingDialog({ state, loadedDate, loadedBookings, onClose, onSaved }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !cancelling) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, cancelling]);

  const booking = state.mode === "edit" ? state.booking : undefined;

  async function handleCancel() {
    if (!booking) return;
    setCancelling(true);
    setError(null);
    try {
      const result = await cancelBooking(booking.id);
      if (result.ok) onSaved("Réservation annulée.");
      else setError(result.message);
    } catch (e) {
      console.error("cancelBooking", e);
      setError("Connexion indisponible. Vérifiez votre réseau puis réessayez.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div role="dialog" aria-modal="true" aria-labelledby="dialog-titre" className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl sm:rounded-2xl">
        <h2 id="dialog-titre" className="mb-3 text-lg font-semibold">
          {booking ? "Modifier la réservation" : "Nouvelle réservation"}
        </h2>

        <BookingForm
          loadedDate={loadedDate}
          loadedBookings={loadedBookings}
          booking={booking}
          defaultStart={state.mode === "create" ? state.start : undefined}
          onSaved={onSaved}
          onClose={onClose}
        />

        {booking ? (
          <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
            <Link href={`/history?booking=${booking.id}`} className="text-sm text-emerald-700 underline">
              Voir l'historique de cette réservation
            </Link>
            {error ? (
              <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            {confirming ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="mb-2 text-sm text-red-800">
                  Annuler cette réservation ? Le créneau sera libéré, l'historique restera conservé.
                </p>
                <div className="flex gap-2">
                  <Button variant="danger" onClick={handleCancel} disabled={cancelling}>
                    {cancelling ? "Annulation…" : "Oui, annuler la réservation"}
                  </Button>
                  <Button variant="secondary" onClick={() => setConfirming(false)} disabled={cancelling}>
                    Retour
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirming(true)}>
                Annuler la réservation
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
