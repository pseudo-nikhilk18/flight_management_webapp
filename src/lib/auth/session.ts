import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(redirectTo?: string) {
  const user = await getSessionUser();

  if (!user) {
    const loginPath = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(loginPath);
  }

  return user;
}
