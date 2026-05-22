"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem("pwa-install-dismissed") === "true",
  );

  useEffect(() => {
    function handleBeforeInstall(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);

      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const dismissedBefore =
        window.localStorage.getItem("pwa-install-dismissed") === "true";
      if (isMobile && !dismissedBefore) {
        setVisible(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (!visible || !deferredPrompt || dismissed) {
    return null;
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setVisible(false);
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    window.localStorage.setItem("pwa-install-dismissed", "true");
    setDismissed(true);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg">
      <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Download aria-hidden="true" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950">Install Flight Management</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">
            Add the app to your home screen for faster access and offline booking history.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button className="gap-2" onClick={() => void handleInstall()} size="sm" type="button">
              Install
            </Button>
            <Button onClick={handleDismiss} size="sm" type="button" variant="secondary">
              Not now
            </Button>
          </div>
        </div>
        <button
          aria-label="Dismiss install prompt"
          className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
          onClick={handleDismiss}
          type="button"
        >
          <X aria-hidden="true" size={18} />
        </button>
      </div>
    </div>
  );
}
