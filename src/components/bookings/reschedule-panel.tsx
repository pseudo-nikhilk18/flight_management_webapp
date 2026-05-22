"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarClock, Plane } from "lucide-react";

import { rescheduleBookingAction } from "@/app/actions/manage-booking";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/flights/format";
import { cn } from "@/lib/utils/cn";
import type { Flight, Seat } from "@/types/database";

type ReschedulePanelProps = {
  bookingId: string;
  currentFlightId: string;
  origin: string;
  destination: string;
  currentTotal: number;
  onClose: () => void;
  onSuccess: () => void;
};

export function ReschedulePanel({
  bookingId,
  currentFlightId,
  origin,
  destination,
  currentTotal,
  onClose,
  onSuccess,
}: ReschedulePanelProps) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedFlightId, setSelectedFlightId] = useState("");
  const [selectedSeatId, setSelectedSeatId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isLoadingFlights, setIsLoadingFlights] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadFlights() {
      setIsLoadingFlights(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("flights")
        .select("*")
        .eq("origin", origin)
        .eq("destination", destination)
        .eq("status", "scheduled")
        .neq("id", currentFlightId)
        .gt("departs_at", new Date().toISOString())
        .order("departs_at", { ascending: true });

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setFlights((data ?? []) as Flight[]);
      }
      setIsLoadingFlights(false);
    }

    void loadFlights();
  }, [origin, destination, currentFlightId]);

  async function handleSelectFlight(flightId: string) {
    setSelectedFlightId(flightId);
    setSelectedSeatId("");
    setSeats([]);

    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("seats")
      .select("*")
      .eq("flight_id", flightId)
      .eq("is_available", true)
      .order("seat_number", { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setSeats((data ?? []) as Seat[]);
  }

  const selectedFlight = flights.find((flight) => flight.id === selectedFlightId);
  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId);
  const newTotal =
    selectedFlight && selectedSeat
      ? Number(selectedFlight.base_price) + Number(selectedSeat.extra_fee)
      : null;
  const feeDue =
    newTotal !== null ? Math.max(0, newTotal - currentTotal) : 0;

  function handleConfirmReschedule() {
    startTransition(async () => {
      const result = await rescheduleBookingAction(
        bookingId,
        selectedFlightId,
        selectedSeatId,
      );

      if (result.error) {
        setError(result.error);
        setConfirmOpen(false);
        return;
      }

      setConfirmOpen(false);
      onSuccess();
    });
  }

  return (
    <div className="mt-6 space-y-6 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950">Reschedule flight</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Choose another departure on {origin} → {destination}.
          </p>
        </div>
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-white/80"
          onClick={onClose}
          type="button"
        >
          Close
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {isLoadingFlights ? (
        <p className="text-sm text-slate-600">Loading alternative flights...</p>
      ) : flights.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          No alternative flights on this route right now.
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Alternative flights
          </p>
          <ul className="space-y-3">
            {flights.map((flight) => {
              const isSelected = selectedFlightId === flight.id;

              return (
                <li key={flight.id}>
                  <button
                    className={cn(
                      "w-full rounded-xl border bg-white p-4 text-left transition-all sm:p-5",
                      isSelected
                        ? "border-blue-500 ring-4 ring-blue-500/15"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                    onClick={() => void handleSelectFlight(flight.id)}
                    type="button"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Plane aria-hidden="true" size={18} />
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">{flight.flight_no}</p>
                          <p className="text-sm text-slate-600">
                            {formatDateTime(flight.departs_at)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {formatTime(flight.departs_at)} – {formatTime(flight.arrives_at)} ·{" "}
                        {formatDuration(flight.departs_at, flight.arrives_at)}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selectedFlightId ? (
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Select new seat
          </p>
          {seats.length === 0 ? (
            <p className="text-sm text-slate-600">No seats available on this flight.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {seats.map((seat) => {
                const isSelected = selectedSeatId === seat.id;
                const price =
                  Number(selectedFlight?.base_price ?? 0) + Number(seat.extra_fee);

                return (
                  <button
                    className={cn(
                      "rounded-xl border px-2 py-3 text-center text-xs font-bold transition-all",
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300",
                    )}
                    key={seat.id}
                    onClick={() => setSelectedSeatId(seat.id)}
                    title={`${seat.class} · ${formatPrice(price)}`}
                    type="button"
                  >
                    {seat.seat_number}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {selectedFlight && selectedSeat && newTotal !== null ? (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
          <CalendarClock aria-hidden="true" className="text-blue-600" size={18} />
          <p className="text-slate-700">
            New fare <span className="font-bold text-slate-900">{formatPrice(newTotal)}</span>
            {feeDue > 0 ? (
              <>
                {" "}
                · Additional fee{" "}
                <span className="font-bold text-amber-700">{formatPrice(feeDue)}</span>
              </>
            ) : (
              <span className="text-emerald-700"> · No additional fee</span>
            )}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button
          disabled={!selectedFlightId || !selectedSeatId || isPending}
          onClick={() => setConfirmOpen(true)}
          size="lg"
          type="button"
        >
          Review reschedule
        </Button>
      </div>

      <ConfirmDialog
        confirmLabel="Confirm reschedule"
        description="Your current seat will be released and the new seat will be reserved immediately."
        isLoading={isPending}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmReschedule}
        open={confirmOpen}
        title="Confirm reschedule"
      >
        {selectedFlight && selectedSeat && newTotal !== null ? (
          <ul className="space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-semibold">Flight:</span> {selectedFlight.flight_no}
            </li>
            <li>
              <span className="font-semibold">Seat:</span> {selectedSeat.seat_number} (
              {selectedSeat.class})
            </li>
            <li>
              <span className="font-semibold">New total:</span> {formatPrice(newTotal)}
            </li>
          </ul>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
