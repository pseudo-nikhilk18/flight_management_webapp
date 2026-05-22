import Link from "next/link";
import { Menu, Plane } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { NavLinks } from "@/components/layout/nav-links";
import { appName } from "@/lib/app-config";
import { getSessionUser } from "@/lib/auth/session";

export async function AppHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-sm">
            <Plane aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 sm:text-base">
              {appName}
            </p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Book, manage, and fly
            </p>
          </div>
        </Link>

        <NavLinks className="hidden md:flex" />

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[11rem] truncate rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 lg:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 sm:inline-flex"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
                href="/register"
              >
                Register
              </Link>
            </>
          )}

          <details className="relative md:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" size={18} />
              <span className="sr-only">Open menu</span>
            </summary>
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              <nav aria-label="Mobile navigation">
                <NavLinks className="flex-col items-stretch" />
              </nav>
              {!user ? (
                <Link
                  className="mt-2 block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href="/login"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
