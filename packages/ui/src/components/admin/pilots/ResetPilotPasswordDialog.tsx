"use client";

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
} from "../../ui/";
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
  const form = useForm<AdminResetPilotPasswordInput>({
    resolver: zodResolver(adminResetPilotPasswordSchema),
    defaultValues: {
      pilotId: pilot.id,
      newPassword: "",
    },
  });

  // Keep pilotId in sync if the dialog is reused for different pilots
  React.useEffect(() => {
    form.setValue("pilotId", pilot.id);
  }, [pilot.id, form]);

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: AdminResetPilotPasswordInput) => {
    try {
      const response = await apiClient.post<ApiResponse<ResetPasswordResponse>>(
        "/api/auth/pilots/reset-password",
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
        if (!next) form.reset({ pilotId: pilot.id, newPassword: "" });
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new password for{" "}
            <span className="font-medium text-foreground">
              {pilot.name ?? pilot.email}
            </span>
            . All active sessions for this pilot will be revoked.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Hidden field — value is bound via form state, not visible to user */}
            <input type="hidden" {...form.register("pilotId")} />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Min. 6 characters"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset Password"}
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
