import type { Flight, Seat } from "@/types/database";
import type { FlightSearchResult } from "@/lib/flights/queries";
import type { BookingCardData } from "@/components/bookings/booking-card";
import type { CachedBooking, StoredFlight, StoredSeat } from "@/store/types";

export function toStoredFlight(
  flight: Flight | FlightSearchResult,
): StoredFlight {
  return {
    id: flight.id,
    flight_no: flight.flight_no,
    origin: flight.origin,
    destination: flight.destination,
    departs_at: flight.departs_at,
    arrives_at: flight.arrives_at,
    base_price: Number(flight.base_price),
    aircraft_type: flight.aircraft_type,
  };
}

export function toStoredSeat(seat: Seat): StoredSeat {
  return {
    id: seat.id,
    seat_number: seat.seat_number,
    class: seat.class,
    extra_fee: Number(seat.extra_fee),
  };
}

export function toCachedBooking(booking: BookingCardData): CachedBooking {
  return {
    id: booking.id,
    pnrCode: booking.pnrCode,
    status: booking.status,
    totalPrice: booking.totalPrice,
    origin: booking.origin,
    destination: booking.destination,
    departsAt: booking.departsAt,
  };
}
