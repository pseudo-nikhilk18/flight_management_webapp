"use client";

import { useEffect } from "react";

import { createClient } from "@/lib/supabase/client";
import { toCachedBooking } from "@/store/mappers";
import { useFlightStore } from "@/store/use-flight-store";
import { useUserStore } from "@/store/use-user-store";
import type { BookingCardData } from "@/components/bookings/booking-card";

export function StoreBootstrap() {
  const setSession = useUserStore((state) => state.setSession);
  const setCachedBookings = useUserStore((state) => state.setCachedBookings);
  const resetFlightStore = useFlightStore((state) => state.reset);
  const resetUserStore = useUserStore((state) => state.reset);

  useEffect(() => {
    const supabase = createClient();

    async function syncSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setSession(null, null);
        setCachedBookings([]);
        return;
      }

      setSession(session.access_token, session.user.email ?? null);

      const { data: bookings } = await supabase
        .from("bookings")
        .select(
          "id, pnr_code, status, total_price, flights (origin, destination, departs_at)",
        )
        .order("booked_at", { ascending: false });

      if (!bookings) {
        return;
      }

      const cached = bookings
        .map((row) => {
          const flights = Array.isArray(row.flights) ? row.flights[0] : row.flights;
          if (!flights) return null;

          const card: BookingCardData = {
            id: row.id,
            flightId: "",
            pnrCode: row.pnr_code,
            status: row.status,
            bookedAt: "",
            totalPrice: Number(row.total_price),
            flightNo: "",
            origin: flights.origin,
            destination: flights.destination,
            departsAt: flights.departs_at,
          };

          return toCachedBooking(card);
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      setCachedBookings(cached);
    }

    void syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        resetFlightStore();
        resetUserStore();
        return;
      }

      if (session) {
        setSession(session.access_token, session.user.email ?? null);
        void syncSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [
    resetFlightStore,
    resetUserStore,
    setCachedBookings,
    setSession,
  ]);

  return null;
}
