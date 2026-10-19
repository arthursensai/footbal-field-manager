"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addDays, isValidDate, todayLocal } from "@/lib/datetime";

export function DateNavigator({ date }: { date: string }) {
  const router = useRouter();
  const go = (d: string) => router.push(`/dashboard?date=${d}`);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="secondary" onClick={() => go(addDays(date, -1))} aria-label="Jour précédent">
        ← Précédent
      </Button>
      <input
        type="date"
        value={date}
        aria-label="Choisir une date"
        onChange={(e) => {
          if (isValidDate(e.target.value)) go(e.target.value);
        }}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      />
      <Button variant="secondary" onClick={() => go(addDays(date, 1))} aria-label="Jour suivant">
        Suivant →
      </Button>
      <Button variant="ghost" onClick={() => go(todayLocal())}>
        {"Aujourd'hui"}
      </Button>
    </div>
  );
}
