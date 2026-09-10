"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
  successMessage?: string | null;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  errorMessage,
  successMessage,
}) => {
  const [email, setEmail] = useState("");

  const handleAction = () => {
    if (!email.trim() || isLoading) return;
    onSubmit(email.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAction();
    }
  };

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      {errorMessage && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 border border-green-500/20 font-medium">
          {successMessage}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Registered Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@operations.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading || !!successMessage}
        />
      </div>
      
      <Button
        type="button"
        onClick={handleAction}
        className="w-full"
        disabled={isLoading || !!successMessage}
      >
        {isLoading ? "Sending Link..." : "Send Reset Link"}
      </Button>
    </div>
  );
};
