import { AppHeader } from "@/components/app-header";

const workspaceItems = [
  {
    label: "Flight search",
    value: "Routes and availability",
  },
  {
    label: "Bookings",
    value: "Passenger itineraries",
  },
  {
    label: "Seat map",
    value: "Cabin allocation",
  },
];

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="flex-1 bg-slate-100">
        <div className="mx-auto grid w-full max-w-5xl gap-5 px-4 py-6 sm:px-6 lg:px-8">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm font-semibold uppercase text-teal-700">
              Operations
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-950">
              Flight Management System
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Search flights, manage passenger bookings, and coordinate seat
              availability from a responsive operations workspace.
            </p>
          </section>

          <section
            aria-labelledby="workspace-title"
            className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <h2
              className="text-base font-semibold text-slate-950"
              id="workspace-title"
            >
              Workspace
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {workspaceItems.map((item) => (
                <li
                  className="list-none rounded-md border border-slate-200 px-3 py-3"
                  key={item.label}
                >
                  <p className="text-sm font-semibold text-slate-950">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{item.value}</p>
                </li>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
