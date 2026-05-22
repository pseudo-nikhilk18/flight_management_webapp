import type { Seat, SeatClass } from "@/types/database";

const cabinColumns: Record<SeatClass, string[]> = {
  economy: ["A", "B", "C", "D", "E", "F"],
  business: ["A", "B", "C", "D"],
  first: ["A", "B"],
};

const cabinOrder: SeatClass[] = ["first", "business", "economy"];

export function parseSeatNumber(seatNumber: string) {
  const match = seatNumber.match(/^(\d+)([A-Z])$/);
  if (!match) {
    return { row: 0, column: "A" };
  }

  return {
    row: Number.parseInt(match[1], 10),
    column: match[2],
  };
}

export type SeatRow = {
  rowNumber: number;
  seats: Array<Seat | null>;
};

export type CabinZone = {
  class: SeatClass;
  label: string;
  columns: string[];
  aisleAfterIndex: number | null;
  rows: SeatRow[];
};

export function buildCabinZones(seats: Seat[]): CabinZone[] {
  const zoneLabels: Record<SeatClass, string> = {
    economy: "Economy cabin",
    business: "Business cabin",
    first: "First class",
  };

  return cabinOrder
    .map((seatClass) => {
      const zoneSeats = seats.filter((seat) => seat.class === seatClass);
      if (!zoneSeats.length) return null;

      const columns = cabinColumns[seatClass];
      const rowNumbers = Array.from(
        new Set(zoneSeats.map((seat) => parseSeatNumber(seat.seat_number).row)),
      ).sort((a, b) => a - b);

      const aisleAfterIndex =
        seatClass === "economy" ? columns.indexOf("C") : null;

      const rows: SeatRow[] = rowNumbers.map((rowNumber) => ({
        rowNumber,
        seats: columns.map((column) => {
          const seatNumber = `${rowNumber}${column}`;
          return zoneSeats.find((seat) => seat.seat_number === seatNumber) ?? null;
        }),
      }));

      return {
        class: seatClass,
        label: zoneLabels[seatClass],
        columns,
        aisleAfterIndex,
        rows,
      };
    })
    .filter((zone): zone is CabinZone => zone !== null);
}
