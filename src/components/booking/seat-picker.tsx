"use client";

import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/flights/format";
import type { Seat, SeatClass } from "@/types/database";

type SeatPickerProps = {
  seats: Seat[];
  basePrice: number;
  name?: string;
  defaultSeatId?: string;
};

const classMeta: Record<
  SeatClass,
  { label: string; chip: string; panel: string }
> = {
  economy: {
    label: "Economy",
    chip: "bg-slate-100 text-slate-700",
    panel: "border-slate-200",
  },
  business: {
    label: "Business",
    chip: "bg-indigo-50 text-indigo-700",
    panel: "border-indigo-200",
  },
  first: {
    label: "First",
    chip: "bg-amber-50 text-amber-800",
    panel: "border-amber-200",
  },
};

const classOrder: SeatClass[] = ["economy", "business", "first"];

export function SeatPicker({
  seats,
  basePrice,
  name = "seatId",
  defaultSeatId,
}: SeatPickerProps) {
  const grouped = classOrder
    .map((seatClass) => ({
      seatClass,
      seats: seats.filter((seat) => seat.class === seatClass),
    }))
    .filter((group) => group.seats.length > 0);

  return (
    <div className="space-y-4">
      {grouped.map((group) => (
        <section
          className={cn(
            "rounded-2xl border bg-white p-4",
            classMeta[group.seatClass].panel,
          )}
          key={group.seatClass}
        >
          <div className="mb-3 flex items-center justify-between">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                classMeta[group.seatClass].chip,
              )}
            >
              {classMeta[group.seatClass].label}
            </span>
            <span className="text-xs text-slate-500">
              {group.seats.length} seats available
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {group.seats.map((seat) => {
              const total = basePrice + Number(seat.extra_fee);

              return (
                <label
                  className="group relative cursor-pointer"
                  key={seat.id}
                >
                  <input
                    className="peer sr-only"
                    defaultChecked={defaultSeatId === seat.id}
                    name={name}
                    required
                    type="radio"
                    value={seat.id}
                  />
                  <span
                    className={cn(
                      "flex flex-col items-center rounded-xl border border-slate-200 bg-slate-50 px-2 py-3 text-center transition-all",
                      "peer-focus-visible:ring-4 peer-focus-visible:ring-blue-500/20",
                      "peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-sm",
                      "group-hover:border-slate-300",
                    )}
                  >
                    <span className="text-sm font-bold text-slate-900">
                      {seat.seat_number}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-slate-600">
                      {formatPrice(total)}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
