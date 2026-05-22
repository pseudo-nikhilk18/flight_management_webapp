import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.08)]",
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 sm:p-8", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("border-b border-slate-100 px-6 py-5 sm:px-8 sm:py-6", className)}
      {...props}
    />
  );
}
