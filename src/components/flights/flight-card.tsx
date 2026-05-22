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
    <Card className="group transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
      <div className="grid lg:grid-cols-[1fr_15rem]">
        <div className="space-y-6 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Plane aria-hidden="true" size={20} />
              </span>
              <div>
                <p className="text-base font-bold text-slate-900">{flight.flight_no}</p>
                <p className="mt-0.5 text-sm text-slate-500">{flight.aircraft_type}</p>
              </div>
            </div>
            <Badge variant="neutral">{flight.status}</Badge>
          </div>

          <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
            <div className="space-y-1">
              <p className="text-3xl font-bold tracking-tight text-slate-950">
                {formatTime(flight.departs_at)}
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {getAirportLabel(flight.origin)}
              </p>
              <p className="text-xs text-slate-500">{formatDateTime(flight.departs_at)}</p>
            </div>

            <div className="flex flex-col items-center gap-2 px-2 text-center">
              <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600">
                <Clock aria-hidden="true" size={14} />
                {formatDuration(flight.departs_at, flight.arrives_at)}
              </p>
              <div className="h-px w-full max-w-[8rem] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
            </div>

            <div className="space-y-1 sm:text-right">
              <p className="text-3xl font-bold tracking-tight text-slate-950">
                {formatTime(flight.arrives_at)}
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {getAirportLabel(flight.destination)}
              </p>
              <p className="text-xs text-slate-500">{formatDateTime(flight.arrives_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {flight.classFares.map((fare) => (
              <span
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-semibold leading-none ring-1 ring-inset",
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

        <div className="flex flex-col justify-between gap-6 border-t border-slate-100 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              From
            </p>
            <p className="text-3xl font-bold text-slate-950">
              {flight.classFares[0]
                ? formatPrice(flight.classFares[0].fromPrice)
                : formatPrice(Number(flight.base_price))}
            </p>
            <p className="text-sm text-slate-500">per passenger</p>
          </div>

          <Link
            className="inline-flex min-h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold leading-none text-white shadow-[0_10px_24px_rgba(37,99,235,0.32)] transition-all hover:bg-blue-700"
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
