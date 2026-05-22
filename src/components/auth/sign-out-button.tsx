import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        type="submit"
      >
        <LogOut aria-hidden="true" size={16} />
        <span className="hidden sm:inline">Sign out</span>
      </button>
    </form>
  );
}
