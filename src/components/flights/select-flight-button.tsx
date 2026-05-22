"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { toStoredFlight } from "@/store/mappers";
import { useFlightStore } from "@/store/use-flight-store";
import type { FlightSearchResult } from "@/lib/flights/queries";

type SelectFlightButtonProps = {
  flight: FlightSearchResult;
  passengers: number;
};

export function SelectFlightButton({ flight, passengers }: SelectFlightButtonProps) {
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const setPassengers = useFlightStore((state) => state.setPassengers);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);

  const href = `/book/${flight.id}?passengers=${passengers}`;

  return (
    <Link
      className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold leading-none text-white shadow-[0_10px_24px_rgba(37,99,235,0.32)] transition-all hover:bg-blue-700"
      href={href}
      onClick={() => {
        setSelectedFlight(toStoredFlight(flight));
        setPassengers(passengers);
        setBookingStep("passenger");
      }}
    >
      Select flight
      <ArrowRight aria-hidden="true" size={16} />
    </Link>
  );
}
