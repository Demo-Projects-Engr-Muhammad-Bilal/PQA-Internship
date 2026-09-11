"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@repo/types";
import type { z } from "zod";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Eye, EyeOff } from "lucide-react";

type LoginInput = z.infer<typeof loginSchema>;

interface LoginFormProps {
  portalName: string;
  onSubmit: (values: LoginInput) => void | Promise<void>;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  portalName,
  onSubmit,
  isLoading = false,
  errorMessage,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form 
      method="POST"
      className="space-y-5" 
      onSubmit={(e) => { 
        e.preventDefault(); 
        e.stopPropagation();
        handleSubmit(onSubmit)(e); 
      }}
    >
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
          {...register("email")}
          disabled={isLoading}
          className={`h-11 focus-visible:ring-primary ${errors.email ? 'border-destructive' : 'border-gray-200'}`}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="font-semibold text-primary text-xs uppercase tracking-wider">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            {...register("password")}
            disabled={isLoading}
            className={`h-11 pr-10 focus-visible:ring-primary ${errors.password ? 'border-destructive' : 'border-gray-200'}`}
          />
          <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Authenticating..." : `Sign in to ${portalName}`}
      </Button>
    </form>
  );
};
