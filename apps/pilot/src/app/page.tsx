"use client";

import { AuthCard, LoginForm } from "@/components/shared";
import { useAuth } from "@/contexts";

export default function PilotLoginPage() {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    clearError();
    try {
      await login(credentials.email, credentials.password, "pilot");
      window.location.href = "/dashboard";
    } catch {
      // error state is already surfaced by the auth context
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <AuthCard
          title="Pilot Portal"
          description="Enter your official PQA credentials to access operations"
          badge="Maritime Deck"
        >
          <LoginForm
            portalName="Pilot Operations"
            onSubmit={handleLogin}
            isLoading={isLoading}
            errorMessage={error}
          />
        </AuthCard>
      </div>
    </main>
  );
}

