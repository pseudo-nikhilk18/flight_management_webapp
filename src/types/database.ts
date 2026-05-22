export type FlightStatus = "scheduled" | "delayed" | "cancelled";
export type SeatClass = "economy" | "business" | "first";
export type BookingStatus = "confirmed" | "rescheduled" | "cancelled";

export type Flight = {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
  created_at: string;
};

export type Seat = {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string | null;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  created_at: string;
};

export type Passenger = {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
  created_at: string;
};

export type Reschedule = {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  fee_charged: number;
  requested_at: string;
};
