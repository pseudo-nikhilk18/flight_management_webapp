import type { Metadata, Viewport } from "next";

import { StoreBootstrap } from "@/components/providers/store-bootstrap";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { appDescription, appName } from "@/lib/app-config";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: appName,
  title: {
    default: appName,
    template: `%s · ${appName}`,
  },
  description: appDescription,
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
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
        <InstallPrompt />
      </body>
    </html>
  );
}
