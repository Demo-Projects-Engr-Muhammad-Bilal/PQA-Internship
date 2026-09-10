"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthCard, ResetPasswordForm } from "@repo/ui";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5001";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPassword = async (password: string) => {
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }

      setIsSuccess(true);
      
      // Auto-redirect to login after success
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthCard title="Password Reset Complete" description="Your security credentials have been updated." badge="Admin Tier">
        <div className="text-center space-y-4 py-4">
          <p className="text-sm font-medium text-green-600">Redirecting you to the secure login gateway...</p>
          <Link href="/" className="inline-block mt-4 text-sm font-bold text-primary hover:underline">
            Click here if you are not redirected
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Create New Password" description="Please secure your account with a new password" badge="Admin Tier">
      {!token ? (
        <div className="text-sm text-destructive text-center mb-4 p-3 bg-destructive/10 rounded-md border border-destructive/20">
          Missing reset token. Please use the exact link sent to your email.
        </div>
      ) : (
        <ResetPasswordForm onSubmit={handleResetPassword} isLoading={isLoading} errorMessage={error} />
      )}
      
      {/* Navigation Links */}
      <div className="mt-6 text-center text-sm text-muted-foreground">
        Return to{" "}
        <Link href="/" className="font-bold text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <Suspense fallback={<div className="flex w-full items-center justify-center p-8 font-medium">Loading security gateway...</div>}>
          <ResetPasswordContent />
        </Suspense>
      </div>
    </main>
  );
}
