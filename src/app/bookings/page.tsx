import Link from "next/link";
import { CalendarDays, Plane, Ticket } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { BookingStatus } from "@/types/database";

export const dynamic = "force-dynamic";

type FlightSummary = {
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
};

type BookingRow = {
  id: string;
  pnr_code: string;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  flights: FlightSummary | FlightSummary[] | null;
};

function resolveFlight(flights: BookingRow["flights"]): FlightSummary | null {
  if (!flights) return null;
  return Array.isArray(flights) ? (flights[0] ?? null) : flights;
}

function statusVariant(status: BookingStatus) {
  if (status === "confirmed") return "confirmed";
  if (status === "rescheduled") return "rescheduled";
  return "cancelled";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function BookingsPage() {
  const user = await requireUser("/bookings");
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, pnr_code, status, booked_at, total_price, flights (flight_no, origin, destination, departs_at)",
    )
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (bookings ?? []) as unknown as BookingRow[];

  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My Bookings
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              View and manage your upcoming and past itineraries.
            </p>
          </div>

          {rows.length === 0 ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-12">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Ticket aria-hidden="true" size={28} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                No bookings yet
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                When you book a flight, your confirmations and PNR details will
                appear here.
              </p>
              <Link
                className="mt-6 inline-flex h-11 items-center rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
                href="/"
              >
                Find flights
              </Link>
            </section>
          ) : (
            <ul className="space-y-4">
              {rows.map((booking) => {
                const flight = resolveFlight(booking.flights);

                return (
                  <li
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)] sm:p-6"
                    key={booking.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          PNR {booking.pnr_code}
                        </p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-950">
                          {flight
                            ? `${flight.origin} → ${flight.destination}`
                            : "Flight details unavailable"}
                        </h2>
                      </div>
                      <Badge variant={statusVariant(booking.status)}>
                        {booking.status}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                      <div className="flex items-center gap-2">
                        <Plane aria-hidden="true" className="text-blue-600" size={16} />
                        <span>{flight?.flight_no ?? "—"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          aria-hidden="true"
                          className="text-blue-600"
                          size={16}
                        />
                        <span>
                          {flight ? formatDate(flight.departs_at) : "—"}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-900">
                        {formatPrice(booking.total_price)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
