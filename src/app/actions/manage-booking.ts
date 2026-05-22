"use server";

import { revalidatePath } from "next/cache";

import { getSessionUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export type ManageBookingState = {
  error?: string;
  success?: string;
};

export async function cancelBookingAction(
  bookingId: string,
): Promise<ManageBookingState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Please sign in to manage bookings" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/bookings");
  return { success: "Booking cancelled successfully" };
}

export async function rescheduleBookingAction(
  bookingId: string,
  newFlightId: string,
  newSeatId: string,
): Promise<ManageBookingState> {
  const user = await getSessionUser();
  if (!user) {
    return { error: "Please sign in to manage bookings" };
  }

  if (!newFlightId || !newSeatId) {
    return { error: "Select a flight and seat to reschedule" };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/bookings");
  return { success: "Booking rescheduled successfully" };
}
