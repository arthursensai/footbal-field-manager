import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function AppHeader({ managerName }: { managerName: string }) {
  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="bg-emerald-950 text-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link
            href="/dashboard"
            className="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            aria-label="Terrain Manager - Tableau de bord"
          >
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-sm font-bold tracking-wider text-white">
              TM
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold tracking-tight">
                Terrain Manager
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-200">
                Gestion des réservations
              </span>
            </span>
          </Link>

          <div className="flex min-w-0 items-center justify-between gap-3 sm:justify-end">
            <div className="min-w-0">
              <span className="block text-[10px] font-medium uppercase tracking-wider text-emerald-200">
                Session active
              </span>
              <span className="block max-w-[180px] truncate text-sm font-semibold text-white sm:max-w-[220px]">
                {managerName}
              </span>
            </div>

            <form action={signOut} className="shrink-0">
              <Button
                type="submit"
                variant="secondary"
                className="border border-white/15 bg-white/10 px-3 py-2 text-white shadow-none hover:bg-white/20 hover:text-white"
              >
                Déconnexion
              </Button>
            </form>
          </div>
        </div>
      </div>

      <nav
        aria-label="Navigation principale"
        className="mx-auto flex max-w-5xl items-center gap-2 overflow-x-auto px-4 py-2.5 sm:gap-3 sm:px-6"
      >
        <Link
          href="/dashboard"
          className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Tableau de bord
        </Link>
        <Link
          href="/history"
          className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
        >
          Historique
        </Link>
      </nav>
    </header>
  );
}
