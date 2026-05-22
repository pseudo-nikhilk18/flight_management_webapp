import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BookingForm } from "@/components/booking/booking-form";
import { BookingResumeNotice } from "@/components/booking/booking-resume-notice";
import { BookingStoreSync } from "@/components/booking/booking-store-sync";
import { AppHeader } from "@/components/app-header";
import { Card, CardBody } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getAirportLabel } from "@/lib/flights/constants";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/flights/format";
import { PageContainer } from "@/components/layout/page-container";
import { getFlightById, getFlightSeats } from "@/lib/flights/queries";

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

  const seats = await getFlightSeats(flightId);
  const availableSeats = seats.filter((seat) => seat.is_available);
  if (!availableSeats.length) {
    return (
      <>
        <AppHeader />
        <main className="py-12">
          <PageContainer width="md">
          <Card>
          <CardBody className="text-center">
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
          </CardBody>
          </Card>
          </PageContainer>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-gradient-to-r from-slate-900 to-blue-950 text-white">
          <PageContainer className="py-10 sm:py-12">
            <Link
              className="mb-6 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-blue-100 transition-colors hover:bg-white/10 hover:text-white"
              href="/results"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Back to results
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-200">
              Complete booking
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {flight.flight_no} · {getAirportLabel(flight.origin)} to{" "}
              {getAirportLabel(flight.destination)}
            </h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-blue-50 ring-1 ring-white/15">
                {formatDateTime(flight.departs_at)}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-blue-50 ring-1 ring-white/15">
                {formatTime(flight.departs_at)} – {formatTime(flight.arrives_at)} ·{" "}
                {formatDuration(flight.departs_at, flight.arrives_at)}
              </span>
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-blue-50 ring-1 ring-white/15">
                From {formatPrice(Number(flight.base_price))}
              </span>
            </div>
          </PageContainer>
        </section>

        <section className="py-10 sm:py-12">
          <PageContainer>
            <BookingStoreSync flight={flight} passengers={passengers} />
            <BookingResumeNotice flightId={flight.id} />
            <BookingForm flight={flight} passengers={passengers} seats={seats} />
          </PageContainer>
        </section>
      </main>
    </>
  );
}
