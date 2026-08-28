"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface LoginFormProps {
  portalName: string;
  onSubmit: (values: { email: string; password: string }) => void | Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  portalName,
  onSubmit,
  isLoading = false,
  errorMessage,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginClick = () => {
    if (!email.trim() || !password.trim() || isLoading) return;
    onSubmit({ email: email.trim(), password: password.trim() });
  };

  // Allow pressing "Enter" to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLoginClick();
    }
  };

  return (
    <div className="space-y-4" onKeyDown={handleKeyDown}>
      {errorMessage && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 font-medium">
          {errorMessage}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="operations@system.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* type="button" absolutely prevents native HTML submission */}
      <Button
        type="button"
        onClick={handleLoginClick}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Authenticating..." : `Sign in to ${portalName}`}
      </Button>
    </div>
  );
};