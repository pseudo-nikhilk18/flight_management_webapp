import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  width?: "md" | "lg" | "xl";
};

const widthClasses = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
};

export function PageContainer({
  children,
  className,
  width = "xl",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-[var(--page-x)]",
        widthClasses[width],
        className,
      )}
    >
      {children}
    </div>
  );
}
