import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        type="submit"
      >
        <LogOut aria-hidden="true" size={16} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
