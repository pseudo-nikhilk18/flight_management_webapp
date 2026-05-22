"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/cn";

const links = [
  { href: "/", label: "Home" },
  { href: "/bookings", label: "My Bookings" },
] as const;

export function NavLinks({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {links.map((link) => {
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname.startsWith(link.href);

        return (
          <li key={link.href}>
            <Link
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
