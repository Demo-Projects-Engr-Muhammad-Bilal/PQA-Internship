"use client";
import { useAuth } from "@repo/ui";

import { useState } from "react";
import { AuthCard, LoginForm } from "@repo/ui";
import { } from "@/contexts";
import { toast } from "sonner";

export default function PilotLoginPage() {
  const { login, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: { email: string; password: string }) => {
        clearError?.();
    setIsSubmitting(true);
    try {
      await login(credentials.email, credentials.password, "pilot");
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Invalid credentials or rate limit exceeded.");
    } finally {
      setIsSubmitting(false);
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
            isLoading={isSubmitting}
          />
        </AuthCard>
      </div>
    </main>
  );
}

