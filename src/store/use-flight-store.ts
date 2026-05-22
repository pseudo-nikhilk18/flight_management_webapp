"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type {
  BookingStep,
  PassengerFormData,
  SearchQuery,
  StoredFlight,
  StoredSeat,
} from "@/store/types";

const defaultSearchQuery = (): SearchQuery => ({
  origin: "DEL",
  destination: "BOM",
  date: new Date().toISOString().slice(0, 10),
  passengers: 1,
});

const emptyPassengerForm = (): PassengerFormData => ({
  fullName: "",
  passportNo: "",
  nationality: "",
  dob: "",
});

type FlightStoreState = {
  searchQuery: SearchQuery;
  selectedFlight: StoredFlight | null;
  selectedSeat: StoredSeat | null;
  optimisticSeatSelection: boolean;
  bookingStep: BookingStep;
  passengerForm: PassengerFormData;
  passengers: number;
};

type FlightStoreActions = {
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: StoredFlight | null) => void;
  selectSeat: (seat: StoredSeat | null, optimistic?: boolean) => void;
  setPassengerField: <K extends keyof PassengerFormData>(
    field: K,
    value: PassengerFormData[K],
  ) => void;
  setBookingStep: (step: BookingStep) => void;
  setPassengers: (count: number) => void;
  clearOptimisticSeat: () => void;
  resetBookingProgress: () => void;
  reset: () => void;
};

export type FlightStore = FlightStoreState & FlightStoreActions;

const initialState: FlightStoreState = {
  searchQuery: defaultSearchQuery(),
  selectedFlight: null,
  selectedSeat: null,
  optimisticSeatSelection: false,
  bookingStep: "search",
  passengerForm: emptyPassengerForm(),
  passengers: 1,
};

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSearchQuery: (query) =>
        set({
          searchQuery: query,
          passengers: query.passengers,
        }),

      setSelectedFlight: (flight) =>
        set({
          selectedFlight: flight,
          selectedSeat: null,
          optimisticSeatSelection: false,
          bookingStep: flight ? "passenger" : "search",
        }),

      selectSeat: (seat, optimistic = false) =>
        set({
          selectedSeat: seat,
          optimisticSeatSelection: optimistic,
          bookingStep: seat ? "seat" : "passenger",
        }),

      setPassengerField: (field, value) =>
        set((state) => ({
          passengerForm: {
            ...state.passengerForm,
            [field]: value,
          },
        })),

      setBookingStep: (step) => set({ bookingStep: step }),

      setPassengers: (count) =>
        set((state) => ({
          passengers: count,
          searchQuery: {
            ...state.searchQuery,
            passengers: count,
          },
        })),

      clearOptimisticSeat: () => set({ optimisticSeatSelection: false }),

      resetBookingProgress: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          optimisticSeatSelection: false,
          bookingStep: "search",
          passengerForm: emptyPassengerForm(),
        }),

      reset: () => set({ ...initialState, searchQuery: defaultSearchQuery() }),
    }),
    {
      name: "flight-management-flight-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        passengers: state.passengers,
        passengerForm: {
          fullName: state.passengerForm.fullName,
          nationality: state.passengerForm.nationality,
          dob: state.passengerForm.dob,
        },
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<FlightStoreState> | undefined;

        if (!saved) {
          return current;
        }

        return {
          ...current,
          ...saved,
          passengerForm: {
            ...emptyPassengerForm(),
            ...saved.passengerForm,
            passportNo: "",
          },
          optimisticSeatSelection: false,
        };
      },
    },
  ),
);
