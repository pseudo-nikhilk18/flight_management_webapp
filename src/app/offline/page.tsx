import Link from "next/link";
import { WifiOff } from "lucide-react";

import { AppHeader } from "@/components/app-header";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardBody } from "@/components/ui/card";

export default function OfflinePage() {
  return (
    <>
      <AppHeader />
      <main className="flex flex-1 items-center py-16">
        <PageContainer width="md">
          <Card>
            <CardBody className="text-center">
              <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <WifiOff aria-hidden="true" size={28} />
              </span>
              <h1 className="mt-6 text-2xl font-bold text-slate-950">You are offline</h1>
              <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-slate-600">
                Flight search and booking need a connection. Previously visited pages,
                including My Bookings, may still be available from your device cache.
              </p>
              <Link
                className="mt-8 inline-flex min-h-12 items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                href="/bookings"
              >
                Open My Bookings
              </Link>
            </CardBody>
          </Card>
        </PageContainer>
      </main>
    </>
  );
}
