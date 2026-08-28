"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosInstance } from "axios";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ApiResponse } from "@repo/types";
import { createPilotSchema, type CreatePilotInput } from "@repo/types";

import {
  Button, Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger, Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage, Input
} from "../../ui/";
import type { Pilot } from "./pilot.types";

interface CreatePilotDialogProps {
  apiClient: AxiosInstance;
  onPilotCreated: (pilot: Pilot) => void;
}

export function CreatePilotDialog({ apiClient, onPilotCreated }: CreatePilotDialogProps) {
  const [open, setOpen] = React.useState(false);

  const form = useForm<CreatePilotInput>({
    resolver: zodResolver(createPilotSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreatePilotInput) => {
    try {
      const response = await apiClient.post<ApiResponse<Pilot>>(
        "/api/auth/pilots",
        values
      );

      if (response.data.success && response.data.data) {
        toast.success(`Pilot "${response.data.data.name ?? response.data.data.email}" created successfully.`);
        onPilotCreated(response.data.data);
        form.reset();
        setOpen(false);
      }
    } catch (error: unknown) {
      const message = extractApiError(error, "Failed to create pilot.");
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => {
      setOpen(next);
      if (!next) form.reset();
    }}>
      <DialogTrigger asChild>
        <Button size="sm">+ Add Pilot</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Pilot</DialogTitle>
          <DialogDescription>
            Provision a new pilot account. They can change their password after first login.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Capt. John Doe" disabled={isSubmitting} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="pilot@company.com"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Password</FormLabel>
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
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Pilot"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

/** Safely extracts a user-facing message from an Axios error response. */
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
