"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { AxiosInstance } from "axios";
import * as React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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
} from "@/components/ui";
import type { Pilot } from "./pilot.types";

interface CreatePilotDialogProps {
  apiClient: AxiosInstance;
  onPilotCreated: (pilot: Pilot) => void;
}

export function CreatePilotDialog({ apiClient, onPilotCreated }: CreatePilotDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<CreatePilotInput>({
    resolver: zodResolver(createPilotSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: CreatePilotInput) => {
    try {
      const response = await apiClient.post<ApiResponse<Pilot>>("/api/auth/pilots", data);

      if (response.data.success && response.data.data) {
        toast.success(`Pilot account for ${data.email} created successfully.`);
        onPilotCreated(response.data.data);
        form.reset();
        setOpen(false);
      }
    } catch (error: unknown) {
      if (error !== null && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Failed to create pilot.");
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred.");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm h-10 px-4">
          + Add Pilot
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-primary">Add New Pilot</DialogTitle>
          <DialogDescription className="font-medium text-muted-foreground">
            Create a new pilot account. They will use these credentials to log into the Pilot Portal.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Full Name (Optional)</FormLabel>
                  <FormControl>
                    <Input className="h-11 border-gray-200 focus-visible:ring-primary" placeholder="Capt. John Doe" disabled={isSubmitting} {...field} />
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
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Email Address</FormLabel>
                  <FormControl>
                    <Input
                      className="h-11 border-gray-200 focus-visible:ring-primary"
                      type="email"
                      placeholder="pilot@system.com"
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
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-primary">Initial Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        className="h-11 border-gray-200 focus-visible:ring-primary pr-10"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        disabled={isSubmitting}
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
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
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Pilot"}
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
