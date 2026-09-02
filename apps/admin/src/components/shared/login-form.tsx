"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginClick = () => {
    if (!email.trim() || !password.trim() || isLoading) return;
    onSubmit({ email: email.trim(), password: password.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLoginClick();
    }
  };

  return (
    <div className="space-y-5" onKeyDown={handleKeyDown}>
      {errorMessage && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20 font-medium text-center">
          {errorMessage}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="font-semibold text-primary text-xs uppercase tracking-wider">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="operations@system.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          className="h-11 border-gray-200 focus-visible:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="font-semibold text-primary text-xs uppercase tracking-wider">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="h-11 border-gray-200 focus-visible:ring-primary pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        onClick={handleLoginClick}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Authenticating..." : `Sign in to ${portalName}`}
      </Button>
    </div>
  );
};

