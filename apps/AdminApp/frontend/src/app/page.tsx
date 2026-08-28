"use client";

import Link from "next/link";
import { AuthCard, LoginForm, useAuth } from "@repo/ui";

export default function AdminLoginPage() {
  const { login, isLoading, error, clearError } = useAuth();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    clearError();
    try {
      await login(credentials.email, credentials.password, "admin");
      window.location.href = "/dashboard";
    } catch {
      // error state is already surfaced by the auth context
    }
  };

  return (
    <AuthCard
      title="Admin Control Center"
      description="Enter administrative credentials to manage operations"
      badge="Admin Tier"
    >
      <LoginForm
        portalName="Admin Console"
        onSubmit={handleLogin}
        isLoading={isLoading}
        errorMessage={error}
      />

      {/* Navigation Links */}
      <div className="mt-6 flex flex-col space-y-3 text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="font-medium text-primary hover:underline hover:text-primary/80">
          Forgot your password?
        </Link>
      </div>
    </AuthCard>
  );
}
