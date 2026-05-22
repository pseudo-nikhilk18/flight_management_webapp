"use client";

import { useEffect } from "react";

import { useFlightStore } from "@/store/use-flight-store";

export function BookingProgressReset() {
  const resetBookingProgress = useFlightStore((state) => state.resetBookingProgress);

  useEffect(() => {
    resetBookingProgress();
  }, [resetBookingProgress]);

  return null;
}
