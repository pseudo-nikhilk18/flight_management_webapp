export const airports = [
  { code: "DEL", city: "Delhi", name: "Indira Gandhi International" },
  { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International" },
  { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International" },
] as const;

export type AirportCode = (typeof airports)[number]["code"];

export const airportCodes = airports.map((airport) => airport.code);

export function getAirportLabel(code: string) {
  const airport = airports.find((item) => item.code === code);
  return airport ? `${airport.city} (${airport.code})` : code;
}
