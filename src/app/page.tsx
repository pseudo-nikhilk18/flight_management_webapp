import Link from "next/link";
import { CalendarCheck, Shield, Sparkles, Timer } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { SearchForm } from "@/components/flights/search-form";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardBody } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth/session";

const highlights = [
  {
    icon: Timer,
    title: "Fast route discovery",
    description:
      "Compare departures across major routes with clear timings, cabin fares, and aircraft details.",
  },
  {
    icon: CalendarCheck,
    title: "Live seat maps",
    description:
      "Choose your seat from an interactive cabin layout that updates as availability changes.",
  },
  {
    icon: Shield,
    title: "Secure itineraries",
    description:
      "Bookings stay tied to your account with protected passenger and payment details.",
  },
];

export default async function HomePage() {
  const user = await getSessionUser();

  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--hero-from),var(--hero-to))] pb-32 pt-16 text-white sm:pb-36 sm:pt-24">
          <div className="absolute -left-20 top-0 size-80 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="absolute -right-10 bottom-0 size-72 rounded-full bg-indigo-400/20 blur-3xl" />

          <PageContainer>
            <p className="inline-flex items-center gap-2.5 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-100 ring-1 ring-white/20">
              <Sparkles aria-hidden="true" size={14} />
              Premium flight booking
            </p>
            <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              A modern way to search, select seats, and fly.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-blue-100/95 sm:text-lg">
              Built for clarity on every screen — generous spacing, live availability,
              and a booking flow that feels like leading travel apps.
            </p>
          </PageContainer>
        </section>

        <section className="relative z-10 -mt-24 pb-20 sm:-mt-28">
          <PageContainer>
            <Card className="border-0 shadow-[0_28px_70px_rgba(15,23,42,0.2)]">
              <CardBody>
                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-950">Find your flight</h2>
                    <p className="text-base leading-relaxed text-slate-600">
                      Search by route, date, and passengers.
                    </p>
                  </div>
                  {user ? (
                    <Link
                      className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-slate-50"
                      href="/bookings"
                    >
                      My bookings
                    </Link>
                  ) : null}
                </div>
                <SearchForm />
              </CardBody>
            </Card>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {highlights.map((item) => (
                <Card key={item.title}>
                  <CardBody>
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <item.icon aria-hidden="true" size={20} />
                    </span>
                    <h3 className="mt-5 text-lg font-bold text-slate-950">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  );
}
