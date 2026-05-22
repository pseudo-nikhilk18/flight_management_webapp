import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthCard
      description="Create a passenger account to start booking and managing itineraries."
      title="Create account"
    >
      <RegisterForm />
    </AuthCard>
  );
}
