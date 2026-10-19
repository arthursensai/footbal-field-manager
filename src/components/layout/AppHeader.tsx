import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function AppHeader({ managerName }: { managerName: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <span className="text-base font-bold text-emerald-700">⚽ Réservations du terrain</span>
          <nav className="flex gap-3 text-sm">
            <Link href="/dashboard" className="text-slate-700 hover:text-emerald-700">
              Tableau de bord
            </Link>
            <Link href="/history" className="text-slate-700 hover:text-emerald-700">
              Historique
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600">
            Connecté : <strong>{managerName}</strong>
          </span>
          <form action={signOut}>
            <Button type="submit" variant="secondary" className="px-3 py-1.5">
              Déconnexion
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
