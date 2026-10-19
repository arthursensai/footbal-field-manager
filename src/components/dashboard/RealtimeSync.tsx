"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = "connecting" | "live" | "offline";

const LABELS: Record<Status, { text: string; dot: string }> = {
  connecting: { text: "Connexion en cours…", dot: "bg-amber-400" },
  live: { text: "Synchronisé en temps réel", dot: "bg-emerald-500" },
  offline: { text: "Synchronisation interrompue — reconnexion…", dot: "bg-red-500" },
};

/**
 * S'abonne aux changements de public.bookings (soumis à RLS). Un événement ne sert que de signal :
 * les données sont toujours rechargées depuis la base via router.refresh().
 */
export function RealtimeSync() {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("connecting");

  useEffect(() => {
    const supabase = createClient();
    let wasDown = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 250);
    };

    const channel = supabase
      .channel("bookings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, refresh)
      .subscribe((state, err) => {
        if (state === "SUBSCRIBED") {
          setStatus("live");
          if (wasDown) {
            wasDown = false;
            router.refresh(); // rattrapage après une reconnexion
          }
        } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
          wasDown = true;
          setStatus("offline");
          if (err) console.error("Erreur Realtime", err.message);
        }
      });

    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const onOnline = () => router.refresh();
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onOnline);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onOnline);
      void supabase.removeChannel(channel);
    };
  }, [router]);

  const { text, dot } = LABELS[status];
  return (
    <p role="status" className="flex items-center gap-2 text-xs text-slate-600">
      <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {text}
    </p>
  );
}
