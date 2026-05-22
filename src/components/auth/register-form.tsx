"use client";

import Link from "next/link";
import { useActionState } from "react";

import { registerAction, type AuthActionState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, fieldControlClassName } from "@/components/ui/field";

const initialState: AuthActionState | null = null;

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
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
          autoComplete="new-password"
          className={fieldControlClassName}
          id="password"
          minLength={6}
          name="password"
          placeholder="At least 6 characters"
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
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm leading-relaxed text-slate-600">
        Already have an account?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
