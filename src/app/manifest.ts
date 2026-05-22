import type { MetadataRoute } from "next";

import { appDescription, appName } from "@/lib/app-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: appName,
    short_name: "Flights",
    description: appDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
