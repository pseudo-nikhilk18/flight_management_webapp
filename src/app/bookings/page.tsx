import { BookingsList } from "@/components/bookings/bookings-list";
import type { BookingCardData } from "@/components/bookings/booking-card";
import { AppHeader } from "@/components/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type BookingRow = {
  id: string;
  flight_id: string;
  pnr_code: string;
  status: BookingCardData["status"];
  booked_at: string;
  total_price: number;
  flights: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
  } | Array<{
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
  }> | null;
};

function resolveFlight(flights: BookingRow["flights"]) {
  if (!flights) return null;
  return Array.isArray(flights) ? (flights[0] ?? null) : flights;
}

export default async function BookingsPage() {
  const user = await requireUser("/bookings");
  const supabase = await createClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, flight_id, pnr_code, status, booked_at, total_price, flights (flight_no, origin, destination, departs_at)",
    )
    .eq("user_id", user.id)
    .order("booked_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (bookings ?? []) as unknown as BookingRow[];

  const cards: BookingCardData[] = rows
    .map((booking) => {
      const flight = resolveFlight(booking.flights);
      if (!flight) return null;

      return {
        id: booking.id,
        flightId: booking.flight_id,
        pnrCode: booking.pnr_code,
        status: booking.status,
        bookedAt: booking.booked_at,
        totalPrice: Number(booking.total_price),
        flightNo: flight.flight_no,
        origin: flight.origin,
        destination: flight.destination,
        departsAt: flight.departs_at,
      };
    })
    .filter((booking): booking is BookingCardData => booking !== null);

  return (
    <>
      <AppHeader />
      <main className="flex-1 py-10 sm:py-12">
        <PageContainer width="lg">
          <SectionHeader
            description="View, reschedule, or cancel your itineraries."
            title="My Bookings"
          />

          <BookingsList bookings={cards} />
        </PageContainer>
      </main>
    </>
  );
}
