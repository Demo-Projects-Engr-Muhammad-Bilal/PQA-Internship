"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthCard, ForgotPasswordForm } from "@repo/ui";

const API_BASE_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:5001";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (email: string) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // FIX: Check if response is actually JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Backend API route (/auth/forgot-password) is missing or returned an HTML error page.");
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to process request");
      }

      setSuccess("If this email is registered, a secure reset link has been sent to your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <AuthCard
          title="Recover Account"
          description="Enter your email to receive a password reset link"
          badge="Admin Tier"
        >
          <ForgotPasswordForm
            onSubmit={handleForgotPassword}
            isLoading={isLoading}
            errorMessage={error}
            successMessage={success}
          />

          {/* Navigation Links */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/" className="font-bold text-primary hover:underline">
              Return to Sign in
            </Link>
          </div>
        </AuthCard>
      </div>
    </main>
  );
}
