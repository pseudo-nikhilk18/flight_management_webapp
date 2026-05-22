"use client";

import { useActionState } from "react";

import {
  createBookingAction,
  type BookingActionState,
} from "@/app/actions/booking";
import { CabinSeatMap } from "@/components/booking/cabin-seat-map";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Field, fieldControlClassName } from "@/components/ui/field";
import { formatPrice } from "@/lib/flights/format";
import type { Flight, Seat } from "@/types/database";

type BookingFormProps = {
  flight: Flight;
  seats: Seat[];
  passengers: number;
};

const initialState: BookingActionState | null = null;

export function BookingForm({ flight, seats, passengers }: BookingFormProps) {
  const [state, formAction, isPending] = useActionState(
    createBookingAction,
    initialState,
  );

  const hasAvailableSeat = seats.some((seat) => seat.is_available);

  return (
    <form action={formAction} className="space-y-8">
      <input name="flightId" type="hidden" value={flight.id} />
      <input name="passengers" type="hidden" value={passengers} />

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-950">Passenger details</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Enter information exactly as printed on the passport.
          </p>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid gap-6 sm:grid-cols-2">
            <Field className="sm:col-span-2" htmlFor="fullName" label="Full name">
              <input
                className={fieldControlClassName}
                id="fullName"
                name="fullName"
                placeholder="Alex Johnson"
                required
                type="text"
              />
            </Field>

            <Field htmlFor="passportNo" label="Passport number">
              <input
                className={fieldControlClassName}
                id="passportNo"
                name="passportNo"
                placeholder="P1234567"
                required
                type="text"
              />
            </Field>

            <Field htmlFor="nationality" label="Nationality">
              <input
                className={fieldControlClassName}
                id="nationality"
                name="nationality"
                placeholder="Indian"
                required
                type="text"
              />
            </Field>

            <Field className="sm:col-span-2" htmlFor="dob" label="Date of birth">
              <input
                className={fieldControlClassName}
                id="dob"
                name="dob"
                required
                type="date"
              />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-slate-950">Select your seat</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Cabin map updates live when other travellers book seats.
          </p>
        </CardHeader>
        <CardBody className="pt-0">
          {hasAvailableSeat ? (
            <CabinSeatMap
              basePrice={Number(flight.base_price)}
              flightId={flight.id}
              initialSeats={seats}
            />
          ) : (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
              All seats on this flight are currently taken.
            </p>
          )}
        </CardBody>
      </Card>

      {state?.error ? (
        <p
          className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-relaxed text-red-700"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <Card>
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">Base fare</p>
            <p className="text-2xl font-bold text-slate-950">
              {formatPrice(Number(flight.base_price))}
              <span className="ml-2 text-sm font-medium text-slate-500">
                per passenger
              </span>
            </p>
          </div>
          <Button
            className="w-full sm:min-w-[220px]"
            disabled={isPending || !hasAvailableSeat}
            size="lg"
            type="submit"
          >
            {isPending ? "Confirming booking..." : "Confirm booking"}
          </Button>
        </CardBody>
      </Card>
    </form>
  );
}
