import Link from "next/link";
import { Menu, Plane } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { NavLinks } from "@/components/layout/nav-links";
import { PageContainer } from "@/components/layout/page-container";
import { appName } from "@/lib/app-config";
import { getSessionUser } from "@/lib/auth/session";

export async function AppHeader() {
  const user = await getSessionUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <PageContainer className="flex min-h-[4.25rem] items-center justify-between gap-4 py-3">
        <Link className="flex min-w-0 items-center gap-3.5" href="/">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-600/25">
            <Plane aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-bold text-slate-950">{appName}</p>
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              Search · Book · Manage
            </p>
          </div>
        </Link>

        <NavLinks className="hidden md:flex" />

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[12rem] truncate rounded-full bg-slate-100 px-4 py-2 text-xs font-medium text-slate-700 lg:inline">
                {user.email}
              </span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                className="hidden min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:inline-flex"
                href="/login"
              >
                Sign in
              </Link>
              <Link
                className="inline-flex min-h-11 items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                href="/register"
              >
                Register
              </Link>
            </>
          )}

          <details className="relative md:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden">
              <Menu aria-hidden="true" size={18} />
              <span className="sr-only">Open menu</span>
            </summary>
            <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <nav aria-label="Mobile navigation">
                <NavLinks className="flex-col items-stretch" />
              </nav>
              {!user ? (
                <Link
                  className="mt-2 flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  href="/login"
                >
                  Sign in
                </Link>
              ) : null}
            </div>
          </details>
        </div>
      </PageContainer>
    </header>
  );
}
