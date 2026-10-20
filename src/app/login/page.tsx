import { redirect } from "next/navigation";
import { LoginForm } from "@/components/layout/LoginForm";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Connexion · Réservations du terrain" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const { erreur } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (profile) redirect("/dashboard");
  }

  const unauthorized = !!user || erreur === "non-autorise";

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <section className="relative isolate flex min-h-[260px] flex-col overflow-hidden bg-slate-950 px-6 py-7 text-white sm:px-10 lg:min-h-dvh lg:px-14 lg:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-28 -top-32 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:24px_24px]" />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-2xl shadow-lg shadow-black/10">
            ⚽
          </div>
          <div>
            <p className="font-semibold tracking-tight">Terrain Manager</p>
            <p className="mt-0.5 text-xs text-slate-400">Gestion des réservations</p>
          </div>
        </div>

        <div className="my-auto max-w-xl py-10 lg:py-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            ESPACE DE GESTION PRIVÉ
          </p>
          <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Votre terrain.<br />
            <span className="text-emerald-400">Votre planning.</span>
            <br />Tout en un seul endroit.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Retrouvez les réservations, suivez la journée et gardez le contrôle sur le planning du terrain.
          </p>

          <div aria-hidden="true" className="mt-9 hidden max-w-md sm:block lg:mt-12">
            <div className="relative aspect-[1.8/1] overflow-hidden rounded-2xl border border-white/15 bg-emerald-950/40 p-3 shadow-2xl shadow-black/20">
              <div className="relative h-full w-full rounded-xl border border-emerald-300/35 bg-gradient-to-br from-emerald-900/70 to-emerald-950/80">
                <div className="absolute inset-y-0 left-1/2 border-l border-emerald-200/30" />
                <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-200/35" />
                <div className="absolute left-0 top-1/2 h-24 w-10 -translate-y-1/2 rounded-r border border-l-0 border-emerald-200/35 sm:w-14" />
                <div className="absolute right-0 top-1/2 h-24 w-10 -translate-y-1/2 rounded-l border border-r-0 border-emerald-200/35 sm:w-14" />
                <div className="absolute left-[22%] top-[24%] h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.9)]" />
                <div className="absolute right-[25%] bottom-[27%] h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.7)]" />
                <div className="absolute bottom-3 left-3 rounded-lg border border-white/10 bg-slate-950/65 px-3 py-2 backdrop-blur-sm">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Organisation</p>
                  <p className="mt-0.5 text-xs font-medium text-white">Simple · Claire · Efficace</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-slate-500">
          <span>Football Field Manager</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Accès sécurisé</span>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:mb-10">
            <p className="text-sm font-semibold text-emerald-700">BON RETOUR</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Connexion</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Connectez-vous avec votre compte responsable pour accéder au tableau de bord.
            </p>
          </div>

          {unauthorized ? (
            <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-lg text-amber-800">!</span>
                <div className="min-w-0">
                  <h3 className="font-semibold text-amber-950">Accès non autorisé</h3>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    {"Ce compte n'est pas autorisé à accéder à l'application. Déconnectez-vous puis utilisez un compte responsable autorisé."}
                  </p>
                </div>
              </div>
              <form action={signOut} className="mt-5">
                <Button type="submit" variant="secondary" className="w-full rounded-xl py-3">
                  Se déconnecter
                </Button>
              </form>
            </div>
          ) : (
            <LoginForm />
          )}

          <p className="mt-8 text-center text-xs leading-5 text-slate-400">
            Cet espace est réservé aux responsables du terrain.<br />
            Si vous n'avez pas de compte autorisé, contactez l'administrateur.
          </p>
        </div>
      </section>
    </main>
  );
}
