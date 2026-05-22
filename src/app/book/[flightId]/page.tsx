import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BookingForm } from "@/components/booking/booking-form";
import { AppHeader } from "@/components/app-header";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getAirportLabel } from "@/lib/flights/constants";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/flights/format";
import { getAvailableSeats, getFlightById } from "@/lib/flights/queries";

type BookPageProps = {
  params: Promise<{ flightId: string }>;
  searchParams: Promise<{ passengers?: string }>;
};

export default async function BookPage({ params, searchParams }: BookPageProps) {
  const { flightId } = await params;
  const query = await searchParams;
  const passengers = Math.min(
    6,
    Math.max(1, Number.parseInt(query.passengers ?? "1", 10) || 1),
  );

  await requireUser(`/book/${flightId}?passengers=${passengers}`);

  const flight = await getFlightById(flightId);
  if (!flight) {
    notFound();
  }

  const seats = await getAvailableSeats(flightId);
  if (!seats.length) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Card className="p-8 text-center">
            <h1 className="text-xl font-semibold text-slate-950">
              No seats available
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              This flight has no open seats right now. Choose another departure.
            </p>
            <Link
              className="mt-5 inline-flex text-sm font-semibold text-blue-600 hover:underline"
              href="/"
            >
              Back to search
            </Link>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-16">
        <section className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
            <Link
              className="mb-4 inline-flex items-center gap-1 text-sm text-blue-100 hover:text-white"
              href="/results"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Back to results
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
              Complete booking
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {flight.flight_no} · {getAirportLabel(flight.origin)} to{" "}
              {getAirportLabel(flight.destination)}
            </h1>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
              <span>{formatDateTime(flight.departs_at)}</span>
              <span>
                {formatTime(flight.departs_at)} – {formatTime(flight.arrives_at)} (
                {formatDuration(flight.departs_at, flight.arrives_at)})
              </span>
              <span>From {formatPrice(Number(flight.base_price))}</span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <BookingForm flight={flight} passengers={passengers} seats={seats} />
        </section>
      </main>
    </>
  );
}
