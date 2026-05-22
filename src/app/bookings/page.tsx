import Link from "next/link";
import { CalendarDays, Plane, Ticket } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
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
      <main className="flex-1 py-10 sm:py-12">
        <PageContainer width="lg">
          <SectionHeader
            description="View and manage your upcoming and past itineraries."
            title="My Bookings"
          />

          {rows.length === 0 ? (
            <Card>
              <CardBody className="text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Ticket aria-hidden="true" size={28} />
                </span>
                <h2 className="mt-6 text-xl font-bold text-slate-950">No bookings yet</h2>
                <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-600">
                  When you book a flight, your confirmations and PNR details will
                  appear here.
                </p>
                <Link
                  className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                  href="/"
                >
                  Find flights
                </Link>
              </CardBody>
            </Card>
          ) : (
            <ul className="space-y-6">
              {rows.map((booking) => {
                const flight = resolveFlight(booking.flights);

                return (
                  <li key={booking.id}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                      <CardBody>
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                              PNR {booking.pnr_code}
                            </p>
                            <h2 className="text-xl font-bold text-slate-950">
                              {flight
                                ? `${flight.origin} → ${flight.destination}`
                                : "Flight details unavailable"}
                            </h2>
                          </div>
                          <Badge variant={statusVariant(booking.status)}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-3">
                          <div className="flex items-center gap-3">
                            <Plane aria-hidden="true" className="text-blue-600" size={18} />
                            <span className="font-medium text-slate-700">
                              {flight?.flight_no ?? "—"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CalendarDays
                              aria-hidden="true"
                              className="text-blue-600"
                              size={18}
                            />
                            <span className="font-medium text-slate-700">
                              {flight ? formatDate(flight.departs_at) : "—"}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-slate-950">
                            {formatPrice(booking.total_price)}
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </PageContainer>
      </main>
    </>
  );
}
