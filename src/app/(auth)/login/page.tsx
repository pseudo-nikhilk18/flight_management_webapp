import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <AuthCard
      description="Sign in to book flights, manage bookings, and reserve seats."
      title="Sign in"
    >
      {params.error === "auth_callback_failed" ? (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Authentication failed. Please try again.
        </p>
      ) : null}
      <LoginForm redirectTo={params.redirect} />
    </AuthCard>
  );
}
