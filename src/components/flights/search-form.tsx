"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, fieldControlClassName } from "@/components/ui/field";
import { airports } from "@/lib/flights/constants";
import { useFlightStore } from "@/store/use-flight-store";

type SearchFormProps = {
  defaults?: {
    origin?: string;
    destination?: string;
    date?: string;
    passengers?: number;
  };
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function SearchForm({ defaults }: SearchFormProps) {
  const router = useRouter();
  const searchQuery = useFlightStore((state) => state.searchQuery);
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);

  const origin = defaults?.origin ?? searchQuery.origin;
  const destination = defaults?.destination ?? searchQuery.destination;
  const date = defaults?.date ?? searchQuery.date;
  const passengers = defaults?.passengers ?? searchQuery.passengers;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const query = {
      origin: formData.get("origin")?.toString() ?? origin,
      destination: formData.get("destination")?.toString() ?? destination,
      date: formData.get("date")?.toString() ?? date,
      passengers: Number(formData.get("passengers") ?? passengers),
    };

    setSearchQuery(query);
    setBookingStep("results");

    const params = new URLSearchParams({
      origin: query.origin,
      destination: query.destination,
      date: query.date,
      passengers: String(query.passengers),
    });

    router.push(`/results?${params.toString()}`);
  }

  return (
    <form
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5"
      onSubmit={handleSubmit}
    >
      <Field label="From" htmlFor="origin">
        <select
          className={fieldControlClassName}
          defaultValue={origin}
          id="origin"
          name="origin"
          required
        >
          {airports.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city} ({airport.code})
            </option>
          ))}
        </select>
      </Field>

      <Field label="To" htmlFor="destination">
        <select
          className={fieldControlClassName}
          defaultValue={destination}
          id="destination"
          name="destination"
          required
        >
          {airports.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city} ({airport.code})
            </option>
          ))}
        </select>
      </Field>

      <Field label="Departure" htmlFor="date">
        <input
          className={fieldControlClassName}
          defaultValue={date}
          id="date"
          min={todayIso()}
          name="date"
          required
          type="date"
        />
      </Field>

      <Field label="Passengers" htmlFor="passengers">
        <input
          className={fieldControlClassName}
          defaultValue={passengers}
          id="passengers"
          max={6}
          min={1}
          name="passengers"
          required
          type="number"
        />
      </Field>

      <div className="flex items-end sm:col-span-2 xl:col-span-1">
        <Button className="w-full gap-2.5" size="lg" type="submit">
          <Search aria-hidden="true" size={18} />
          Search flights
        </Button>
      </div>
    </form>
  );
}
