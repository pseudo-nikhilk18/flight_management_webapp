"use server";

import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";
import { passengerSchema } from "@/lib/validations/booking";
import { createClient } from "@/lib/supabase/server";

export type BookingActionState = {
  error?: string;
};

export async function createBookingAction(
  _prevState: BookingActionState | null,
  formData: FormData,
): Promise<BookingActionState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Please sign in to complete your booking" };
  }

  const parsed = passengerSchema.safeParse({
    fullName: formData.get("fullName"),
    passportNo: formData.get("passportNo"),
    nationality: formData.get("nationality"),
    dob: formData.get("dob"),
    seatId: formData.get("seatId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid booking details" };
  }

  const flightId = formData.get("flightId")?.toString();
  if (!flightId) {
    return { error: "Flight not found" };
  }

  const supabase = await createClient();

  const { data: flight, error: flightError } = await supabase
    .from("flights")
    .select("id, base_price, status")
    .eq("id", flightId)
    .maybeSingle();

  if (flightError || !flight) {
    return { error: "Unable to load selected flight" };
  }

  if (flight.status !== "scheduled") {
    return { error: "This flight is not available for booking" };
  }

  const { data: seat, error: seatError } = await supabase
    .from("seats")
    .select("id, flight_id, extra_fee, is_available")
    .eq("id", parsed.data.seatId)
    .maybeSingle();

  if (seatError || !seat) {
    return { error: "Selected seat was not found" };
  }

  if (seat.flight_id !== flightId) {
    return { error: "Selected seat does not belong to this flight" };
  }

  if (!seat.is_available) {
    return { error: "Selected seat is no longer available" };
  }

  const totalPrice = Number(flight.base_price) + Number(seat.extra_fee);

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      flight_id: flightId,
      total_price: totalPrice,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (bookingError || !booking) {
    return { error: bookingError?.message ?? "Could not create booking" };
  }

  const { error: passengerError } = await supabase.from("passengers").insert({
    booking_id: booking.id,
    full_name: parsed.data.fullName,
    passport_no: parsed.data.passportNo,
    nationality: parsed.data.nationality,
    dob: parsed.data.dob,
  });

  if (passengerError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { error: passengerError.message };
  }

  const { error: reserveError } = await supabase.rpc("reserve_seat", {
    p_seat_id: parsed.data.seatId,
    p_booking_id: booking.id,
  });

  if (reserveError) {
    await supabase.from("passengers").delete().eq("booking_id", booking.id);
    await supabase.from("bookings").delete().eq("id", booking.id);
    return { error: reserveError.message };
  }

  redirect(`/confirmation/${booking.id}`);
}
