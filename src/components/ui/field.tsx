import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type FieldProps = {
  label: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  hint?: string;
};

export function Field({ label, htmlFor, children, className, hint }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="block space-y-2" htmlFor={htmlFor}>
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {label}
        </span>
        {children}
      </label>
      {hint ? <p className="text-xs leading-relaxed text-slate-500">{hint}</p> : null}
    </div>
  );
}

export const fieldControlClassName =
  "min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-normal text-slate-900 shadow-sm transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/15";
