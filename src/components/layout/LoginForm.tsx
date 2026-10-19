"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { signIn } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null);
  return (
    <form action={formAction} className="space-y-3">
      <Field label="Adresse e-mail" htmlFor="email">
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClass} />
      </Field>
      <Field label="Mot de passe" htmlFor="password">
        <input id="password" name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </Field>
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
