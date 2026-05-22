import type { SeatClass } from "@/types/database";

export type BookingStep = "search" | "results" | "passenger" | "seat" | "confirm";

export type SearchQuery = {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
};

export type StoredFlight = {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  base_price: number;
  aircraft_type: string;
};

export type StoredSeat = {
  id: string;
  seat_number: string;
  class: SeatClass;
  extra_fee: number;
};

export type PassengerFormData = {
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
};

export type CachedBooking = {
  id: string;
  pnrCode: string;
  status: string;
  totalPrice: number;
  origin: string;
  destination: string;
  departsAt: string;
};
