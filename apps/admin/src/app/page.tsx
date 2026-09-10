"use client";
import { useAuth } from "@repo/ui";

import { useState } from "react";
import Link from "next/link";
import { AuthCard, LoginForm } from "@repo/ui";
import { } from "@/contexts";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const { login, clearError } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: { email: string; password: string }) => {
    clearError?.();
    setIsSubmitting(true);
    try {
      await login(credentials.email, credentials.password, "admin");
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
          title="Admin Control Center"
          description="Enter administrative credentials to manage operations"
          badge="Admin Tier"
        >
          <LoginForm
            portalName="Admin Console"
            onSubmit={handleLogin}
            isLoading={isSubmitting}
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

