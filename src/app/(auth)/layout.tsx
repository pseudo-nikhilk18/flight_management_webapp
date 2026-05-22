import { AppHeader } from "@/components/app-header";
import { PageContainer } from "@/components/layout/page-container";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AppHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 bg-linear-to-br from-slate-100 via-white to-blue-50" />
        <PageContainer className="relative flex justify-center" width="md">
          {children}
        </PageContainer>
      </main>
    </>
  );
}
