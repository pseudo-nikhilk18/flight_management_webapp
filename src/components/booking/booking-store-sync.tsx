"use client";

import { useEffect } from "react";

import { toStoredFlight } from "@/store/mappers";
import { useFlightStore } from "@/store/use-flight-store";
import type { Flight } from "@/types/database";

type BookingStoreSyncProps = {
  flight: Flight;
  passengers: number;
};

export function BookingStoreSync({ flight, passengers }: BookingStoreSyncProps) {
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const setPassengers = useFlightStore((state) => state.setPassengers);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);

  useEffect(() => {
    setSelectedFlight(toStoredFlight(flight));
    setPassengers(passengers);
    setBookingStep("passenger");
  }, [flight, passengers, setBookingStep, setPassengers, setSelectedFlight]);

  return null;
}
