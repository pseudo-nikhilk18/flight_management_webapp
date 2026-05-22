"use client";

import { useEffect, useMemo, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { buildCabinZones } from "@/lib/flights/seat-layout";
import { formatPrice } from "@/lib/flights/format";
import { toStoredSeat } from "@/store/mappers";
import { useFlightStore } from "@/store/use-flight-store";
import { cn } from "@/lib/utils/cn";
import type { Seat } from "@/types/database";

type CabinSeatMapProps = {
  flightId: string;
  initialSeats: Seat[];
  basePrice: number;
  name?: string;
};

const zoneAccent: Record<string, string> = {
  first: "from-amber-500/10 to-amber-500/5 border-amber-200",
  business: "from-indigo-500/10 to-indigo-500/5 border-indigo-200",
  economy: "from-slate-500/5 to-slate-500/0 border-slate-200",
};

export function CabinSeatMap({
  flightId,
  initialSeats,
  basePrice,
  name = "seatId",
}: CabinSeatMapProps) {
  const [seats, setSeats] = useState(initialSeats);
  const selectedSeat = useFlightStore((state) => state.selectedSeat);
  const optimisticSeatSelection = useFlightStore(
    (state) => state.optimisticSeatSelection,
  );
  const selectSeat = useFlightStore((state) => state.selectSeat);

  const selectedSeatId = selectedSeat?.id ?? "";
  const zones = useMemo(() => buildCabinZones(seats), [seats]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`seats-flight-${flightId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flightId}`,
        },
        (payload) => {
          const updated = payload.new as Seat;
          setSeats((current) =>
            current.map((seat) =>
              seat.id === updated.id ? { ...seat, ...updated } : seat,
            ),
          );

          if (
            !updated.is_available &&
            selectedSeatId === updated.id &&
            !optimisticSeatSelection
          ) {
            selectSeat(null);
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [
    flightId,
    optimisticSeatSelection,
    selectSeat,
    selectedSeatId,
  ]);

  return (
    <div className="space-y-6">
      <input name={name} required type="hidden" value={selectedSeatId} />
      {!selectedSeatId ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Tap an available seat to continue.
        </p>
      ) : optimisticSeatSelection ? (
        <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Seat {selectedSeat?.seat_number} selected. Confirm booking to reserve it.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm">
        <LegendDot className="border-slate-300 bg-white" label="Available" />
        <LegendDot className="border-blue-500 bg-blue-600" label="Selected" />
        <LegendDot className="border-slate-200 bg-slate-200" label="Occupied" />
        <span className="text-slate-500">Hover occupied seats for class and fee</span>
      </div>

      <div className="max-h-[min(70vh,640px)] overflow-auto rounded-2xl border border-slate-200 bg-slate-100/80 p-4 sm:p-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 pb-2">
          <div className="rounded-full bg-slate-300 px-6 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-600">
            Front · Cockpit
          </div>
        </div>

        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          {zones.map((zone) => (
            <section
              className={cn(
                "rounded-2xl border bg-gradient-to-b p-5 sm:p-6",
                zoneAccent[zone.class],
              )}
              key={zone.class}
            >
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-base font-bold text-slate-900">{zone.label}</h3>
                <span className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                  {zone.rows.length} rows
                </span>
              </div>

              <div className="space-y-3">
                {zone.rows.map((row) => (
                  <div
                    className="flex items-center justify-center gap-3"
                    key={`${zone.class}-${row.rowNumber}`}
                  >
                    <span className="w-8 shrink-0 text-right text-xs font-semibold text-slate-500">
                      {row.rowNumber}
                    </span>
                    <div className="flex items-center gap-3">
                      {row.seats.map((seat, index) => (
                        <div
                          className="flex items-center gap-3"
                          key={`${row.rowNumber}-${index}`}
                        >
                          {seat ? (
                            <SeatButton
                              basePrice={basePrice}
                              isOptimistic={
                                optimisticSeatSelection &&
                                selectedSeatId === seat.id
                              }
                              isSelected={selectedSeatId === seat.id}
                              onSelect={() => {
                                selectSeat(toStoredSeat(seat), true);
                              }}
                              seat={seat}
                            />
                          ) : (
                            <span className="size-11" />
                          )}
                          {zone.aisleAfterIndex === index ? (
                            <span className="w-6 text-center text-xs text-slate-300 sm:w-8">
                              ||
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendDot({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <span className="inline-flex items-center gap-2.5 text-slate-700">
      <span className={cn("size-4 rounded-md border", className)} />
      {label}
    </span>
  );
}

function SeatButton({
  seat,
  basePrice,
  isSelected,
  isOptimistic,
  onSelect,
}: {
  seat: Seat;
  basePrice: number;
  isSelected: boolean;
  isOptimistic: boolean;
  onSelect: () => void;
}) {
  const isAvailable = seat.is_available || isOptimistic;
  const totalPrice = basePrice + Number(seat.extra_fee);
  const tooltip = `${seat.class} · ${seat.seat_number} · ${formatPrice(totalPrice)}`;

  if (!isAvailable) {
    return (
      <button
        aria-label={`${seat.seat_number} occupied`}
        className="flex size-11 cursor-not-allowed flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-200 text-[10px] font-bold text-slate-500"
        disabled
        title={tooltip}
        type="button"
      >
        {seat.seat_number}
      </button>
    );
  }

  return (
    <button
      aria-label={`Select seat ${seat.seat_number}`}
      aria-pressed={isSelected}
      className={cn(
        "flex size-11 flex-col items-center justify-center rounded-xl border text-[10px] font-bold transition-all",
        isSelected
          ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30"
          : "border-emerald-300 bg-white text-emerald-800 hover:border-emerald-400 hover:bg-emerald-50",
      )}
      onClick={onSelect}
      title={tooltip}
      type="button"
    >
      {seat.seat_number}
    </button>
  );
}
