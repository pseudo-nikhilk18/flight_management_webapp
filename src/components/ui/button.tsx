import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.32)] hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-300",
  secondary:
    "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 disabled:bg-slate-100",
  ghost: "text-slate-700 hover:bg-slate-100",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-10 gap-1.5 px-4 py-2 text-sm",
  md: "min-h-11 gap-2 px-5 py-2.5 text-sm",
  lg: "min-h-12 gap-2 px-6 py-3 text-base",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold leading-none transition-all disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
