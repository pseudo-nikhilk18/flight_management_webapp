"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Ticket } from "lucide-react";

import {
  BookingCard,
  type BookingCardData,
} from "@/components/bookings/booking-card";
import { Card, CardBody } from "@/components/ui/card";
import { toCachedBooking } from "@/store/mappers";
import { useUserStore } from "@/store/use-user-store";
import type { CachedBooking } from "@/store/types";

type BookingsListProps = {
  bookings: BookingCardData[];
};

function cachedToCard(booking: CachedBooking): BookingCardData {
  return {
    id: booking.id,
    flightId: "",
    pnrCode: booking.pnrCode,
    status: booking.status as BookingCardData["status"],
    bookedAt: "",
    totalPrice: booking.totalPrice,
    flightNo: "—",
    origin: booking.origin,
    destination: booking.destination,
    departsAt: booking.departsAt,
  };
}

export function BookingsList({ bookings }: BookingsListProps) {
  const setCachedBookings = useUserStore((state) => state.setCachedBookings);
  const cachedBookings = useUserStore((state) => state.cachedBookings);
  const [isOnline, setIsOnline] = useState(
    () => typeof window !== "undefined" && window.navigator.onLine,
  );

  useEffect(() => {
    setCachedBookings(bookings.map(toCachedBooking));
  }, [bookings, setCachedBookings]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const visibleBookings = useMemo(() => {
    if (isOnline) {
      return bookings;
    }

    return cachedBookings.map(cachedToCard);
  }, [bookings, cachedBookings, isOnline]);

  if (visibleBookings.length === 0) {
    return (
      <Card>
        <CardBody className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Ticket aria-hidden="true" size={28} />
          </span>
          <h2 className="mt-6 text-xl font-bold text-slate-950">
            {isOnline ? "No bookings yet" : "No cached bookings available"}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-slate-600">
            {isOnline
              ? "When you book a flight, your confirmations and PNR details will appear here."
              : "Visit My Bookings once while online so your latest itineraries are saved on this device."}
          </p>
          {isOnline ? (
            <Link
              className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              href="/"
            >
              Find flights
            </Link>
          ) : null}
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      {!isOnline ? (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
          Offline mode: showing the last cached bookings saved on this device.
        </p>
      ) : null}
      <ul className="space-y-6">
        {visibleBookings.map((booking) => (
          <li key={booking.id}>
            <BookingCard booking={booking} />
          </li>
        ))}
      </ul>
    </>
  );
}
