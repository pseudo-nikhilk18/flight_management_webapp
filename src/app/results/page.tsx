import Link from "next/link";
import { ArrowLeft, PlaneTakeoff } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { FlightCard } from "@/components/flights/flight-card";
import { SearchForm } from "@/components/flights/search-form";
import { Card } from "@/components/ui/card";
import { getAirportLabel } from "@/lib/flights/constants";
import { searchFlights } from "@/lib/flights/queries";
import { searchSchema } from "@/lib/validations/search";

type ResultsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function ResultsPage({ searchParams }: ResultsPageProps) {
  const params = await searchParams;
  const parsed = searchSchema.safeParse({
    origin: readParam(params, "origin"),
    destination: readParam(params, "destination"),
    date: readParam(params, "date"),
    passengers: readParam(params, "passengers") ?? "1",
  });

  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-16">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            <Link
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
              href="/"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Back to search
            </Link>
            <SearchForm
              defaults={
                parsed.success
                  ? {
                      origin: parsed.data.origin,
                      destination: parsed.data.destination,
                      date: parsed.data.date,
                      passengers: parsed.data.passengers,
                    }
                  : undefined
              }
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {!parsed.success ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-red-600">
                {parsed.error.issues[0]?.message ?? "Invalid search parameters"}
              </p>
            </Card>
          ) : (
            <ResultsList query={parsed.data} />
          )}
        </section>
      </main>
    </>
  );
}

async function ResultsList({
  query,
}: {
  query: {
    origin: string;
    destination: string;
    date: string;
    passengers: number;
  };
}) {
  const flights = await searchFlights(query);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
            Search results
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {getAirportLabel(query.origin)} to {getAirportLabel(query.destination)}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {query.date} · {query.passengers}{" "}
            {query.passengers === 1 ? "passenger" : "passengers"}
          </p>
        </div>
        <p className="rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-700">
          {flights.length} {flights.length === 1 ? "flight" : "flights"} found
        </p>
      </div>

      {flights.length === 0 ? (
        <Card className="p-10 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <PlaneTakeoff aria-hidden="true" size={26} />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            No flights for this route and date
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            Try another date or route. Sample routes include DEL ↔ BOM, DEL ↔
            BLR, and BLR ↔ HYD.
          </p>
          <Link
            className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
            href="/"
          >
            Modify search
          </Link>
        </Card>
      ) : (
        <ul className="space-y-5">
          {flights.map((flight) => (
            <li key={flight.id}>
              <FlightCard flight={flight} passengers={query.passengers} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
