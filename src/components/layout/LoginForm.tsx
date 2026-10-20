"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { signIn } from "@/lib/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, null);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Adresse e-mail" htmlFor="email">
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
              <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
              <path d="m4.5 7 7.5 5.5L19.5 7" />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            placeholder="nom@exemple.com"
            className={`${inputClass} rounded-xl py-3 pl-11 pr-4 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10`}
          />
        </div>
      </Field>

      <Field label="Mot de passe" htmlFor="password">
        <div className="relative">
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7">
              <rect x="4.5" y="10" width="15" height="10" rx="2.5" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              <path d="M12 14v2" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className={`${inputClass} rounded-xl py-3 pl-11 pr-4 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10`}
          />
        </div>
      </Field>

      {state?.error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-5 text-red-700">
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0">
            <path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16ZM9 5.75a1 1 0 1 1 2 0v4a1 1 0 0 1-2 0v-4Zm1 8.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
          </svg>
          <span>{state.error}</span>
        </p>
      ) : null}

      <Button type="submit" className="w-full rounded-xl py-3 text-sm font-semibold shadow-lg shadow-emerald-700/15 transition hover:-translate-y-0.5" disabled={pending}>
        {pending ? (
          <>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="mr-2 h-4 w-4 animate-spin" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Connexion en cours…
          </>
        ) : (
          <>
            Se connecter
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="ml-2 h-4 w-4" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </Button>
      <p className="text-center text-xs text-slate-400">Connexion protégée · Vos accès restent privés</p>
    </form>
  );
}
