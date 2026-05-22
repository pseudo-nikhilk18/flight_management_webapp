import { dayBoundsIso } from "@/lib/flights/format";
import { createClient } from "@/lib/supabase/server";
import type { Flight, Seat, SeatClass } from "@/types/database";

export type ClassFare = {
  class: SeatClass;
  fromPrice: number;
  availableCount: number;
};

export type FlightSearchResult = Flight & {
  classFares: ClassFare[];
};

export async function searchFlights(params: {
  origin: string;
  destination: string;
  date: string;
}) {
  const supabase = await createClient();
  const { start, end } = dayBoundsIso(params.date);

  const { data: flights, error } = await supabase
    .from("flights")
    .select("*")
    .eq("origin", params.origin)
    .eq("destination", params.destination)
    .eq("status", "scheduled")
    .gte("departs_at", start)
    .lte("departs_at", end)
    .order("departs_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!flights?.length) {
    return [];
  }

  const flightIds = flights.map((flight) => flight.id);
  const { data: seats, error: seatsError } = await supabase
    .from("seats")
    .select("flight_id, class, extra_fee, is_available")
    .in("flight_id", flightIds)
    .eq("is_available", true);

  if (seatsError) {
    throw new Error(seatsError.message);
  }

  return flights.map((flight) => {
    const flightSeats = (seats ?? []).filter((seat) => seat.flight_id === flight.id);
    const classes: SeatClass[] = ["economy", "business", "first"];

    const classFares = classes
      .map((seatClass) => {
        const classSeats = flightSeats.filter((seat) => seat.class === seatClass);
        if (!classSeats.length) return null;

        const minExtra = Math.min(...classSeats.map((seat) => Number(seat.extra_fee)));

        return {
          class: seatClass,
          fromPrice: Number(flight.base_price) + minExtra,
          availableCount: classSeats.length,
        };
      })
      .filter((fare): fare is ClassFare => fare !== null);

    return {
      ...(flight as Flight),
      classFares,
    };
  });
}

export async function getFlightById(flightId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("id", flightId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as Flight | null;
}

export async function getAvailableSeats(flightId: string) {
  const seats = await getFlightSeats(flightId);
  return seats.filter((seat) => seat.is_available);
}

export async function getFlightSeats(flightId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("seats")
    .select("*")
    .eq("flight_id", flightId)
    .order("seat_number", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Seat[];
}
