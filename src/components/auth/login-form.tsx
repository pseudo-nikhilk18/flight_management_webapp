"use client";

import Link from "next/link";
import { useActionState } from "react";

import { loginAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, fieldControlClassName } from "@/components/ui/field";

type LoginFormProps = {
  redirectTo?: string;
};

const initialState: AuthActionState | null = null;

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      {redirectTo ? (
        <input name="redirect" type="hidden" value={redirectTo} />
      ) : null}

      <Field htmlFor="email" label="Email">
        <input
          autoComplete="email"
          className={fieldControlClassName}
          id="email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </Field>

      <Field htmlFor="password" label="Password">
        <input
          autoComplete="current-password"
          className={fieldControlClassName}
          id="password"
          name="password"
          required
          type="password"
        />
      </Field>

      {state?.error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>

      <p className="text-center text-sm leading-relaxed text-slate-600">
        No account?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" href="/register">
          Create one
        </Link>
      </p>
    </form>
  );
}
