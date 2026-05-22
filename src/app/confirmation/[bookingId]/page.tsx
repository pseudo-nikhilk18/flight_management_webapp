import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, Ticket } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <AppHeader />
      <main className="flex-1 pb-16">
        <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-12 text-white">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <CheckCircle2 aria-hidden="true" size={34} />
            </span>
            <h1 className="mt-5 text-3xl font-bold tracking-tight">
              Booking confirmed
            </h1>
            <p className="mt-2 text-blue-100">
              Your itinerary is reserved. Save your PNR for check-in.
            </p>
            <p className="mt-6 text-4xl font-black tracking-widest">{booking.pnr_code}</p>
            <p className="mt-1 text-sm uppercase tracking-[0.2em] text-blue-100">
              PNR code
            </p>
          </div>
        </section>

        <section className="mx-auto -mt-8 max-w-4xl space-y-4 px-4 sm:px-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Flight
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  {flight
                    ? `${getAirportLabel(flight.origin)} → ${getAirportLabel(flight.destination)}`
                    : "—"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {flight?.flight_no} · {flight?.aircraft_type}
                </p>
              </div>
              <Badge variant="confirmed">{booking.status}</Badge>
            </div>

            {flight ? (
              <div className="mt-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-slate-500">Departure</p>
                  <p className="font-semibold text-slate-900">
                    {formatTime(flight.departs_at)}
                  </p>
                  <p className="text-slate-600">{formatDateTime(flight.departs_at)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Duration</p>
                  <p className="font-semibold text-slate-900">
                    {formatDuration(flight.departs_at, flight.arrives_at)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Arrival</p>
                  <p className="font-semibold text-slate-900">
                    {formatTime(flight.arrives_at)}
                  </p>
                  <p className="text-slate-600">{formatDateTime(flight.arrives_at)}</p>
                </div>
              </div>
            ) : null}
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="flex items-center gap-2 text-slate-900">
                <Ticket aria-hidden="true" className="text-blue-600" size={18} />
                <h3 className="font-semibold">Seat assignment</h3>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {seat?.seat_number ?? "—"}
              </p>
              <p className="mt-1 text-sm capitalize text-slate-600">
                {seat?.class ?? "Not assigned"}
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">Fare paid</h3>
              <p className="mt-3 text-2xl font-bold text-slate-950">
                {formatPrice(booking.total_price)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Booked {formatDateTime(booking.booked_at)}
              </p>
            </Card>
          </div>

          {passenger ? (
            <Card className="p-5">
              <h3 className="font-semibold text-slate-900">Passenger</h3>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-slate-500">Name</dt>
                  <dd className="font-medium text-slate-900">{passenger.full_name}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Passport</dt>
                  <dd className="font-medium text-slate-900">
                    {passenger.passport_no}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Nationality</dt>
                  <dd className="font-medium text-slate-900">
                    {passenger.nationality}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Date of birth</dt>
                  <dd className="font-medium text-slate-900">{passenger.dob}</dd>
                </div>
              </dl>
            </Card>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700"
              href="/bookings"
            >
              <Download aria-hidden="true" size={16} />
              View my bookings
            </Link>
            <Link
              className="inline-flex h-11 items-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              href="/"
            >
              Book another flight
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
