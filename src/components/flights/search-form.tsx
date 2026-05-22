import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, fieldControlClassName } from "@/components/ui/field";
import { airports } from "@/lib/flights/constants";

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
  const origin = defaults?.origin ?? "DEL";
  const destination = defaults?.destination ?? "BOM";
  const date = defaults?.date ?? todayIso();
  const passengers = defaults?.passengers ?? 1;

  return (
    <form
      action="/results"
      className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5"
      method="get"
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
