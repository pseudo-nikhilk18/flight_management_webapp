"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CalendarDays, Plane, RefreshCw, XCircle } from "lucide-react";

import { cancelBookingAction } from "@/app/actions/manage-booking";
import { ReschedulePanel } from "@/components/bookings/reschedule-panel";
import { useFlightStore } from "@/store/use-flight-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils/cn";
import type { BookingStatus } from "@/types/database";

export type BookingCardData = {
  id: string;
  flightId: string;
  pnrCode: string;
  status: BookingStatus;
  bookedAt: string;
  totalPrice: number;
  flightNo: string;
  origin: string;
  destination: string;
  departsAt: string;
};

type BookingCardProps = {
  booking: BookingCardData;
};

function statusVariant(status: BookingStatus) {
  if (status === "confirmed") return "confirmed";
  if (status === "rescheduled") return "rescheduled";
  return "cancelled";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function isWithinTwoHours(departsAt: string) {
  const departure = new Date(departsAt).getTime();
  const cutoff = Date.now() + 2 * 60 * 60 * 1000;
  return departure <= cutoff;
}

export function BookingCard({ booking }: BookingCardProps) {
  const router = useRouter();
  const resetBookingProgress = useFlightStore((state) => state.resetBookingProgress);
  const [showReschedule, setShowReschedule] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isActive =
    booking.status === "confirmed" || booking.status === "rescheduled";
  const lockedByDeparture = isWithinTwoHours(booking.departsAt);
  const canManage = isActive && !lockedByDeparture;

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelBookingAction(booking.id);
      if (result.error) {
        setError(result.error);
        setCancelOpen(false);
        return;
      }
      setMessage(result.success ?? "Booking cancelled");
      setError(null);
      setCancelOpen(false);
      setShowReschedule(false);
      resetBookingProgress();
      router.refresh();
    });
  }

  return (
    <Card
      className={cn(
        "transition-all",
        booking.status === "cancelled" && "opacity-80",
      )}
    >
      <CardBody>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              PNR {booking.pnrCode}
            </p>
            <h2 className="text-xl font-bold text-slate-950">
              {booking.origin} → {booking.destination}
            </h2>
          </div>
          <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
        </div>

        <div className="mt-6 grid gap-4 border-t border-slate-100 pt-6 text-sm sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <Plane aria-hidden="true" className="shrink-0 text-blue-600" size={18} />
            <span className="font-medium text-slate-700">{booking.flightNo}</span>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays
              aria-hidden="true"
              className="shrink-0 text-blue-600"
              size={18}
            />
            <span className="font-medium text-slate-700">
              {formatDate(booking.departsAt)}
            </span>
          </div>
          <div className="text-lg font-bold text-slate-950">
            {formatPrice(booking.totalPrice)}
          </div>
        </div>

        {message ? (
          <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {canManage ? (
          <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
            <Button
              className="gap-2"
              onClick={() => {
                setShowReschedule((value) => !value);
                setError(null);
              }}
              type="button"
              variant="secondary"
            >
              <RefreshCw aria-hidden="true" size={16} />
              Reschedule
            </Button>
            <Button
              className="gap-2 border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50"
              onClick={() => setCancelOpen(true)}
              type="button"
              variant="secondary"
            >
              <XCircle aria-hidden="true" size={16} />
              Cancel booking
            </Button>
          </div>
        ) : null}

        {isActive && lockedByDeparture ? (
          <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-amber-900">
            Changes are not allowed within 2 hours of departure.
          </p>
        ) : null}

        {showReschedule && canManage ? (
          <ReschedulePanel
            bookingId={booking.id}
            currentFlightId={booking.flightId}
            currentTotal={booking.totalPrice}
            destination={booking.destination}
            onClose={() => setShowReschedule(false)}
            onSuccess={() => {
              setShowReschedule(false);
              setMessage("Booking rescheduled successfully");
              setError(null);
              router.refresh();
            }}
            origin={booking.origin}
          />
        ) : null}
      </CardBody>

      <ConfirmDialog
        cancelLabel="Go back"
        confirmLabel="Cancel booking"
        description="This will cancel your itinerary and release your seat. This action cannot be undone."
        isLoading={isPending}
        onCancel={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        open={cancelOpen}
        title="Cancel this booking?"
        tone="danger"
      />
    </Card>
  );
}
