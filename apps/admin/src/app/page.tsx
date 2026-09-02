"use client";

import Link from "next/link";
import { AuthCard, LoginForm } from "@/components/shared";
import { useAuth } from "@/contexts";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
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
      </div>
    </main>
  );
}

