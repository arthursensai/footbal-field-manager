import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400" aria-label="Terrain Manager — Tableau de bord">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-950/30">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-6">
          <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="m12 8 3 2.2-1.1 3.5h-3.8L9 10.2 12 8Z" fill="currentColor" />
          <path d="m12 8 0-4.5M9 10.2 4.2 8M13.9 13.7l4.9 2.2M10.1 13.7l-2.5 3.5M15 10.2 20 8" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block text-base font-bold tracking-tight text-white">Terrain Manager</span>
        <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Gestion du terrain</span>
      </span>
    </Link>
  );
}

function Navigation({ mobile = false }: { mobile?: boolean }) {
  const base = "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400";
  return (
    <nav aria-label="Navigation principale" className={mobile ? "flex gap-2 overflow-x-auto" : "space-y-1"}>
      <Link href="/dashboard" className={`${base} ${mobile ? "shrink-0" : "w-full"} bg-emerald-400 text-slate-950 hover:bg-emerald-300`}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.7"/></svg>
        Tableau de bord
      </Link>
      <Link href="/history" className={`${base} ${mobile ? "shrink-0" : "w-full"} text-slate-300 hover:bg-white/10 hover:text-white`}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5 shrink-0"><path d="M4 7.5h16M4 12h16M4 16.5h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="18" cy="17" r="3" stroke="currentColor" strokeWidth="1.6"/><path d="M18 15.5V17l1 0.7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        Historique
      </Link>
    </nav>
  );
}

export function AppHeader({ managerName }: { managerName: string }) {
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col border-r border-white/10 bg-slate-950 px-5 py-6 text-white lg:flex">
        <Brand />
        <div className="mt-10">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Espace de travail</p>
          <Navigation />
        </div>
        <div className="mt-auto space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300"><span className="size-2 rounded-full bg-emerald-400" /> Session active</div>
            <p className="mt-2 truncate text-sm font-semibold text-white">{managerName}</p>
            <p className="mt-1 text-xs text-slate-500">Accès responsable</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="ghost" className="w-full justify-start border border-white/10 text-slate-300 hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mr-2 size-4"><path d="M10 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H10M14 8l4 4-4 4M8 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Déconnexion
            </Button>
          </form>
          <p className="px-1 text-[10px] text-slate-600">FOOTBALL BOOKING · v1.0</p>
        </div>
      </aside>

      <header className="border-b border-slate-800 bg-slate-950 px-4 py-4 text-white lg:hidden">
        <div className="flex items-center justify-between gap-3"><Brand /><form action={signOut}><Button type="submit" variant="ghost" className="px-3 text-slate-300 hover:bg-white/10 hover:text-white">Sortir</Button></form></div>
        <div className="mt-4"><Navigation mobile /></div>
        <p className="mt-3 truncate text-xs text-slate-400">Connecté : <span className="font-semibold text-slate-200">{managerName}</span></p>
      </header>
    </>
  );
}
