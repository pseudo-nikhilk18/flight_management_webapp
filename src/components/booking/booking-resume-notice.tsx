"use client";

import { useFlightStore } from "@/store/use-flight-store";

type BookingResumeNoticeProps = {
  flightId: string;
};

export function BookingResumeNotice({ flightId }: BookingResumeNoticeProps) {
  const selectedFlight = useFlightStore((state) => state.selectedFlight);
  const passengerForm = useFlightStore((state) => state.passengerForm);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);

  const hasRestoredDraft =
    selectedFlight?.id === flightId &&
    (passengerForm.fullName || passengerForm.nationality || selectedSeat);

  if (!hasRestoredDraft) {
    return null;
  }

  return (
    <p className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm leading-relaxed text-blue-900">
      Your in-progress booking was restored from this browser. Passport number is
      not stored locally for security.
    </p>
  );
}
