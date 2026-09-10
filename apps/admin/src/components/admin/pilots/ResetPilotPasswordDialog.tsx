"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosInstance } from "axios";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ApiResponse } from "@repo/types";
import { adminResetPilotPasswordSchema, type AdminResetPilotPasswordInput } from "@repo/types";

import {
  Button, Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle, Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, Input
} from "@repo/ui";
import type { Pilot } from "./pilot.types";

interface ResetPilotPasswordDialogProps {
  pilot: Pilot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  apiClient: AxiosInstance;
}

interface ResetPasswordResponse {
  message: string;
}

export function ResetPilotPasswordDialog({
  pilot,
  open,
  onOpenChange,
  apiClient,
}: ResetPilotPasswordDialogProps) {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<AdminResetPilotPasswordInput>({
    resolver: zodResolver(adminResetPilotPasswordSchema),
    defaultValues: {
      pilotId: pilot.id,
      newPassword: "",
    },
  });

  React.useEffect(() => {
    form.setValue("pilotId", pilot.id);
  }, [pilot.id, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: AdminResetPilotPasswordInput) => {
    try {
      const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
        "/auth/pilots/reset-password",
        values
      );

      if (response.data.success) {
        toast.success(
          response.data.data?.message ?? "Password reset successfully. Pilot's sessions revoked."
        );
        form.reset({ pilotId: pilot.id, newPassword: "" });
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const message = extractApiError(error, "Failed to reset pilot password.");
      toast.error(message);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          form.reset({ pilotId: pilot.id, newPassword: "" });
          setShowPassword(false);
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-white border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-primary">Reset Password</DialogTitle>
          <DialogDescription className="font-medium">
            Set a new password for{" "}
            <span className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-2">
              {pilot.name ?? pilot.email}
            </span>
            . All active sessions for this pilot will be revoked immediately.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-4">
            <input type="hidden" {...form.register("pilotId")} />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="h-11 border-gray-200 focus-visible:ring-destructive pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        disabled={isSubmitting}
                        {...field}
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
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                className="font-bold border-gray-300 text-primary hover:bg-gray-50"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" className="font-bold shadow-md" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Force Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function extractApiError(error: unknown, fallback: string): string {
  if (
    error !== null &&
    typeof error === "object" &&
    "response" in error
  ) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
