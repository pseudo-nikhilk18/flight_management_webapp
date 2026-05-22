"use client";

import { useActionState } from "react";

import {
  createBookingAction,
  type BookingActionState,
} from "@/app/actions/booking";
import { SeatPicker } from "@/components/booking/seat-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  return (
    <form action={formAction} className="space-y-6">
      <input name="flightId" type="hidden" value={flight.id} />
      <input name="passengers" type="hidden" value={passengers} />

      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950">Passenger details</h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter details exactly as they appear on the passport.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-950">Choose your seat</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select one seat for this booking. Prices include the flight base fare.
        </p>
        <div className="mt-5">
          <SeatPicker basePrice={Number(flight.base_price)} seats={seats} />
        </div>
      </Card>

      {state?.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          Base fare from{" "}
          <span className="font-semibold text-slate-900">
            {formatPrice(Number(flight.base_price))}
          </span>{" "}
          per passenger
        </p>
        <Button className="w-full sm:w-auto" disabled={isPending} size="lg" type="submit">
          {isPending ? "Confirming booking..." : "Confirm booking"}
        </Button>
      </div>
    </form>
  );
}
