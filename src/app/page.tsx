import Link from "next/link";
import { ArrowRight, Calendar, Luggage, ShieldCheck } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { getSessionUser } from "@/lib/auth/session";

const highlights = [
  {
    icon: Calendar,
    title: "Flexible scheduling",
    description: "Compare departures across routes and pick the timing that fits your plan.",
  },
  {
    icon: Luggage,
    title: "Seat-first booking",
    description: "Review cabin classes and choose your seat before confirming your itinerary.",
  },
  {
    icon: ShieldCheck,
    title: "Secure reservations",
    description: "Bookings are tied to your account with protected access to passenger details.",
  },
];

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 text-white">
          <div className="absolute -right-16 top-8 size-56 rounded-full bg-teal-400/20 blur-3xl" />
          <div className="absolute -left-10 bottom-0 size-44 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-200">
              Flight Management
            </p>
            <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Plan your trip, choose your seat, and manage bookings in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
              Search available routes, complete passenger details, and keep your
              itinerary organized from any device.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm transition-transform hover:-translate-y-0.5"
                href={user ? "/bookings" : "/login"}
              >
                {user ? "View my bookings" : "Sign in to book"}
                <ArrowRight aria-hidden="true" size={16} />
              </Link>
              {!user ? (
                <Link
                  className="inline-flex h-11 items-center rounded-lg border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10"
                  href="/register"
                >
                  Create account
                </Link>
              ) : null}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-semibold text-slate-950">Search flights</h2>
            <p className="mt-1 text-sm text-slate-600">
              Enter your route and travel details to browse available departures.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600">From</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  disabled
                  placeholder="Origin"
                  type="text"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600">To</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  disabled
                  placeholder="Destination"
                  type="text"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600">Date</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  disabled
                  type="date"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-slate-600">Passengers</span>
                <input
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  disabled
                  placeholder="1"
                  type="number"
                />
              </label>
            </div>

            <button
              className="mt-5 inline-flex h-11 cursor-not-allowed items-center rounded-lg bg-slate-200 px-5 text-sm font-semibold text-slate-500"
              disabled
              type="button"
            >
              Search flights
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                key={item.title}
              >
                <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <item.icon aria-hidden="true" size={18} />
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
