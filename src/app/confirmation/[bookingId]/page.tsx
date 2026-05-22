import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Ticket } from "lucide-react";

import { BookingProgressReset } from "@/components/booking/booking-progress-reset";
import { AppHeader } from "@/components/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { requireUser } from "@/lib/auth/session";
import { getAirportLabel } from "@/lib/flights/constants";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/flights/format";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus, SeatClass } from "@/types/database";

type ConfirmationPageProps = {
  params: Promise<{ bookingId: string }>;
};

type BookingDetails = {
  id: string;
  pnr_code: string;
  status: BookingStatus;
  total_price: number;
  booked_at: string;
  flights: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
    arrives_at: string;
    aircraft_type: string;
  } | null;
  seats: {
    seat_number: string;
    class: SeatClass;
  } | null;
  passengers: Array<{
    full_name: string;
    passport_no: string;
    nationality: string;
    dob: string;
  }>;
};

function resolveRelation<T>(value: T | T[] | null): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingId } = await params;
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      pnr_code,
      status,
      total_price,
      booked_at,
      flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type),
      seats (seat_number, class),
      passengers (full_name, passport_no, nationality, dob)
    `,
    )
    .eq("id", bookingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const booking = {
    ...data,
    flights: resolveRelation(data.flights),
    seats: resolveRelation(data.seats),
    passengers: Array.isArray(data.passengers) ? data.passengers : [],
  } as BookingDetails;

  const flight = booking.flights;
  const seat = booking.seats;
  const passenger = booking.passengers[0];

  return (
    <>
      <BookingProgressReset />
      <AppHeader />
      <main className="flex-1 pb-20">
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-14 text-white sm:py-16">
          <PageContainer width="md" className="text-center">
            <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-white/15 backdrop-blur">
              <CheckCircle2 aria-hidden="true" size={40} />
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Booking confirmed
            </h1>
            <p className="mt-3 text-base leading-relaxed text-blue-100">
              Your itinerary is reserved. Save your PNR for check-in.
            </p>
            <p className="mt-8 text-5xl font-black tracking-[0.2em]">{booking.pnr_code}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.25em] text-blue-200">
              PNR code
            </p>
          </PageContainer>
        </section>

        <section className="py-10 sm:py-12">
          <PageContainer width="md" className="space-y-6">
            <Card>
              <CardBody>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Flight
                    </p>
                    <h2 className="text-2xl font-bold text-slate-950">
                      {flight
                        ? `${getAirportLabel(flight.origin)} → ${getAirportLabel(flight.destination)}`
                        : "—"}
                    </h2>
                    <p className="text-sm text-slate-600">
                      {flight?.flight_no} · {flight?.aircraft_type}
                    </p>
                  </div>
                  <Badge variant="confirmed">{booking.status}</Badge>
                </div>

                {flight ? (
                  <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 text-sm sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-slate-500">Departure</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatTime(flight.departs_at)}
                      </p>
                      <p className="text-slate-600">{formatDateTime(flight.departs_at)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Duration</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatDuration(flight.departs_at, flight.arrives_at)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-500">Arrival</p>
                      <p className="text-lg font-bold text-slate-900">
                        {formatTime(flight.arrives_at)}
                      </p>
                      <p className="text-slate-600">{formatDateTime(flight.arrives_at)}</p>
                    </div>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3">
                    <Ticket aria-hidden="true" className="text-blue-600" size={20} />
                    <h3 className="text-lg font-bold text-slate-900">Seat assignment</h3>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-950">
                    {seat?.seat_number ?? "—"}
                  </p>
                  <p className="mt-2 text-sm capitalize text-slate-600">
                    {seat?.class ?? "Not assigned"}
                  </p>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <h3 className="text-lg font-bold text-slate-900">Fare paid</h3>
                  <p className="mt-4 text-3xl font-bold text-slate-950">
                    {formatPrice(booking.total_price)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Booked {formatDateTime(booking.booked_at)}
                  </p>
                </CardBody>
              </Card>
            </div>

            {passenger ? (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-bold text-slate-900">Passenger</h3>
                  <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                    <div className="space-y-1">
                      <dt className="text-slate-500">Name</dt>
                      <dd className="font-semibold text-slate-900">{passenger.full_name}</dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-slate-500">Passport</dt>
                      <dd className="font-semibold text-slate-900">
                        {passenger.passport_no}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-slate-500">Nationality</dt>
                      <dd className="font-semibold text-slate-900">
                        {passenger.nationality}
                      </dd>
                    </div>
                    <div className="space-y-1">
                      <dt className="text-slate-500">Date of birth</dt>
                      <dd className="font-semibold text-slate-900">{passenger.dob}</dd>
                    </div>
                  </dl>
                </CardBody>
              </Card>
            ) : null}

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                className="inline-flex min-h-12 min-w-[200px] items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(37,99,235,0.32)] hover:bg-blue-700"
                href="/bookings"
              >
                View my bookings
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
                href="/"
              >
                Book another flight
              </Link>
            </div>
          </PageContainer>
        </section>
      </main>
    </>
  );
}
