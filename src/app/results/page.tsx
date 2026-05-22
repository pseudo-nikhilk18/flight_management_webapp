import Link from "next/link";
import { ArrowLeft, PlaneTakeoff } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { FlightCard } from "@/components/flights/flight-card";
import { SearchForm } from "@/components/flights/search-form";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Card, CardBody } from "@/components/ui/card";
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
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-white py-8 sm:py-10">
          <PageContainer>
            <Link
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
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
          </PageContainer>
        </section>

        <section className="py-10 sm:py-12">
          <PageContainer>
            {!parsed.success ? (
              <Card>
                <CardBody className="text-center">
                  <p className="text-sm text-red-600">
                    {parsed.error.issues[0]?.message ?? "Invalid search parameters"}
                  </p>
                </CardBody>
              </Card>
            ) : (
              <ResultsList query={parsed.data} />
            )}
          </PageContainer>
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
      <SectionHeader
        action={
          <span className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700">
            {flights.length} {flights.length === 1 ? "flight" : "flights"}
          </span>
        }
        description={`${query.date} · ${query.passengers} ${query.passengers === 1 ? "passenger" : "passengers"}`}
        eyebrow="Search results"
        title={`${getAirportLabel(query.origin)} to ${getAirportLabel(query.destination)}`}
      />

      {flights.length === 0 ? (
        <Card>
          <CardBody className="text-center">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <PlaneTakeoff aria-hidden="true" size={28} />
            </span>
            <h2 className="mt-6 text-xl font-bold text-slate-950">
              No flights for this route and date
            </h2>
            <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-600">
              Try another date or route. Sample routes include DEL ↔ BOM, DEL ↔
              BLR, and BLR ↔ HYD.
            </p>
            <Link
              className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              href="/"
            >
              Modify search
            </Link>
          </CardBody>
        </Card>
      ) : (
        <ul className="space-y-6">
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
