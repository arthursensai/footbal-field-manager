"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4">
      <h2 className="font-semibold text-red-800">Une erreur est survenue</h2>
      <p className="text-sm text-red-700">
        Le chargement a échoué. Vérifiez votre connexion ou reconnectez-vous si votre session a expiré.
      </p>
      <Button onClick={reset}>Réessayer</Button>
    </div>
  );
}
