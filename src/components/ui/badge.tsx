import { cn } from "@/lib/utils/cn";

type BadgeVariant = "confirmed" | "rescheduled" | "cancelled" | "neutral";

type BadgeProps = {
  children: React.ReactNode;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rescheduled: "bg-amber-50 text-amber-700 ring-amber-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  neutral: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        variantClasses[variant],
      )}
    >
      {children}
    </span>
  );
}
