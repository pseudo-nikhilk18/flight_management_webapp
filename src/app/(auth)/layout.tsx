import { AppHeader } from "@/components/app-header";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-teal-50" />
        <div className="relative w-full max-w-md">{children}</div>
      </main>
    </>
  );
}
