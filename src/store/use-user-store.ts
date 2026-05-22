"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CachedBooking } from "@/store/types";

type UserStoreState = {
  sessionToken: string | null;
  userEmail: string | null;
  cachedBookings: CachedBooking[];
};

type UserStoreActions = {
  setSession: (token: string | null, email: string | null) => void;
  setCachedBookings: (bookings: CachedBooking[]) => void;
  reset: () => void;
};

export type UserStore = UserStoreState & UserStoreActions;

const initialState: UserStoreState = {
  sessionToken: null,
  userEmail: null,
  cachedBookings: [],
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      ...initialState,

      setSession: (token, email) =>
        set({
          sessionToken: token,
          userEmail: email,
        }),

      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),

      reset: () => set(initialState),
    }),
    {
      name: "flight-management-user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessionToken: state.sessionToken,
        cachedBookings: state.cachedBookings,
        userEmail: state.userEmail,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<UserStoreState>),
      }),
    },
  ),
);
