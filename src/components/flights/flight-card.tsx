import Link from "next/link";
import { ArrowRight, Clock, Plane } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getAirportLabel } from "@/lib/flights/constants";
import {
  formatDateTime,
  formatDuration,
  formatPrice,
  formatTime,
} from "@/lib/flights/format";
import type { FlightSearchResult } from "@/lib/flights/queries";
import { cn } from "@/lib/utils/cn";

type FlightCardProps = {
  flight: FlightSearchResult;
  passengers: number;
};

const classLabels = {
  economy: "Economy",
  business: "Business",
  first: "First",
} as const;

export function FlightCard({ flight, passengers }: FlightCardProps) {
  const bookHref = `/book/${flight.id}?passengers=${passengers}`;

  return (
    <Card className="group overflow-hidden p-0 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
      <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Plane aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {flight.flight_no}
                </p>
                <p className="text-xs text-slate-500">{flight.aircraft_type}</p>
              </div>
            </div>
            <Badge variant="neutral">{flight.status}</Badge>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div>
              <p className="text-2xl font-bold text-slate-950">
                {formatTime(flight.departs_at)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {getAirportLabel(flight.origin)}
              </p>
              <p className="text-xs text-slate-500">
                {formatDateTime(flight.departs_at)}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <p className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                <Clock aria-hidden="true" size={14} />
                {formatDuration(flight.departs_at, flight.arrives_at)}
              </p>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-300 to-transparent sm:w-32" />
            </div>

            <div className="sm:text-right">
              <p className="text-2xl font-bold text-slate-950">
                {formatTime(flight.arrives_at)}
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {getAirportLabel(flight.destination)}
              </p>
              <p className="text-xs text-slate-500">
                {formatDateTime(flight.arrives_at)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {flight.classFares.map((fare) => (
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset",
                  fare.class === "economy" && "bg-slate-50 text-slate-700 ring-slate-200",
                  fare.class === "business" &&
                    "bg-indigo-50 text-indigo-700 ring-indigo-200",
                  fare.class === "first" && "bg-amber-50 text-amber-800 ring-amber-200",
                )}
                key={fare.class}
              >
                {classLabels[fare.class]} from {formatPrice(fare.fromPrice)}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between border-t border-slate-100 bg-slate-50/70 p-5 lg:w-56 lg:border-l lg:border-t-0">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              From
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {flight.classFares[0]
                ? formatPrice(flight.classFares[0].fromPrice)
                : formatPrice(Number(flight.base_price))}
            </p>
            <p className="text-xs text-slate-500">per passenger</p>
          </div>

          <Link
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.35)] transition-all hover:bg-blue-700"
            href={bookHref}
          >
            Select flight
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        </div>
      </div>
    </Card>
  );
}
