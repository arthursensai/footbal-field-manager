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
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-4 px-4">
      <div className="text-center">
        <p className="text-3xl">⚽</p>
        <h1 className="text-xl font-bold">Réservations du terrain</h1>
        <p className="text-sm text-slate-600">Accès réservé aux responsables.</p>
      </div>

      {unauthorized ? (
        <div role="alert" className="space-y-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          <p>{"Ce compte n'est pas autorisé à accéder à l'application."}</p>
          <form action={signOut}>
            <Button type="submit" variant="secondary">
              Se déconnecter
            </Button>
          </form>
        </div>
      ) : (
        <LoginForm />
      )}
    </main>
  );
}
