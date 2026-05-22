import Link from "next/link";
import { CalendarCheck, Shield, Sparkles, Timer } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { SearchForm } from "@/components/flights/search-form";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

const highlights = [
  {
    icon: Timer,
    title: "Fast route discovery",
    description: "Compare departures across major Indian routes with clear timings and fares.",
  },
  {
    icon: CalendarCheck,
    title: "Seat-first checkout",
    description: "Pick your cabin and seat before confirming passenger details.",
  },
  {
    icon: Shield,
    title: "Account-backed trips",
    description: "Your bookings stay linked to your profile for easy itinerary access.",
  },
];

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to))] pb-28 pt-14 text-white sm:pb-32 sm:pt-20">
          <div className="absolute -left-20 top-0 size-72 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 size-80 rounded-full bg-indigo-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100 ring-1 ring-white/20">
              <Sparkles aria-hidden="true" size={14} />
              Premium flight booking
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Fly smarter with a clean, modern booking experience.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100 sm:text-base">
              Search scheduled flights, compare cabin fares, choose your seat, and
              confirm your itinerary in minutes.
            </p>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-20 max-w-6xl px-4 sm:px-6 lg:px-8">
          <Card className="border-0 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-7">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Find your flight</h2>
                <p className="text-sm text-slate-600">
                  Search by route, date, and number of passengers.
                </p>
              </div>
              {user ? (
                <Link
                  className="text-sm font-semibold text-blue-600 hover:underline"
                  href="/bookings"
                >
                  My bookings
                </Link>
              ) : null}
            </div>
            <SearchForm />
          </Card>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <Card className="p-5" key={item.title}>
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <item.icon aria-hidden="true" size={18} />
                </span>
                <h3 className="mt-3 text-base font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
