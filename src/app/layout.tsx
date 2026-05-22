import type { Metadata } from "next";

import { StoreBootstrap } from "@/components/providers/store-bootstrap";
import { appDescription, appName } from "@/lib/app-config";
import "./globals.css";

export const metadata: Metadata = {
  title: appName,
  description: appDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-[var(--background)] text-[var(--foreground)]">
        <StoreBootstrap />
        {children}
      </body>
    </html>
  );
}
