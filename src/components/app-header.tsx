import { Bell, Plane, UserRound } from "lucide-react";

import { appName } from "@/lib/app-config";

export function AppHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-teal-700 text-white">
            <Plane aria-hidden="true" size={20} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-slate-950">
              {appName}
            </p>
            <p className="truncate text-sm text-slate-500">Flight operations</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm font-medium text-slate-600">
            <li>
              <a className="rounded-md px-3 py-2 text-slate-950" href="#">
                Search
              </a>
            </li>
            <li>
              <a className="rounded-md px-3 py-2 hover:bg-slate-100" href="#">
                Bookings
              </a>
            </li>
            <li>
              <a className="rounded-md px-3 py-2 hover:bg-slate-100" href="#">
                Seats
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="View notifications"
            className="flex size-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            type="button"
          >
            <Bell aria-hidden="true" size={18} />
          </button>
          <button
            aria-label="Open account"
            className="flex size-10 items-center justify-center rounded-md bg-slate-950 text-white hover:bg-slate-800"
            type="button"
          >
            <UserRound aria-hidden="true" size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
