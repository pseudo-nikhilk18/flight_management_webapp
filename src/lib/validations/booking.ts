import { z } from "zod";

export const passengerSchema = z.object({
  fullName: z.string().min(2, "Enter the passenger full name"),
  passportNo: z
    .string()
    .min(6, "Passport number must be at least 6 characters")
    .max(20, "Passport number is too long"),
  nationality: z.string().min(2, "Enter nationality"),
  dob: z.string().min(1, "Select date of birth"),
  seatId: z.string().uuid("Select a seat"),
});

export type PassengerInput = z.infer<typeof passengerSchema>;
