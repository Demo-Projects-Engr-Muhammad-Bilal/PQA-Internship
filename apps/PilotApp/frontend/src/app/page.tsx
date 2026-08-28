"use client";

import { AuthCard, LoginForm, useAuth } from "@repo/ui";

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
    <AuthCard
      title="Pilot Portal"
      description="Enter your flight operations credentials to access system"
      badge="Flight Deck"
    >
      <LoginForm
        portalName="Pilot Operations"
        onSubmit={handleLogin}
        isLoading={isLoading}
        errorMessage={error}
      />
    </AuthCard>
  );
}
