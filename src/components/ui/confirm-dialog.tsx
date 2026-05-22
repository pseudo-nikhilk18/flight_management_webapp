"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Keep booking",
  tone = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      className={cn(
        "fixed inset-0 z-50 m-0 h-full w-full max-h-none max-w-none",
        "bg-transparent p-4 backdrop:bg-slate-900/50",
        open ? "flex items-center justify-center" : "hidden",
      )}
      onCancel={onCancel}
      ref={dialogRef}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.2)] sm:p-8"
        role="document"
      >
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            {cancelLabel}
          </Button>
          <Button
            className={cn(
              "w-full sm:w-auto",
              tone === "danger" && "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30",
            )}
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
            variant="primary"
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
