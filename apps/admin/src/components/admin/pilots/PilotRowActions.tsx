"use client";

import type { AxiosInstance } from "axios";
import { KeyRoundIcon, MoreHorizontalIcon, ShieldCheckIcon, ShieldOffIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import type { ApiResponse } from "@repo/types";

import {
  Button, DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui";
import { ResetPilotPasswordDialog } from "./ResetPilotPasswordDialog";
import type { Pilot } from "./pilot.types";

interface PilotRowActionsProps {
  pilot: Pilot;
  apiClient: AxiosInstance;
  onStatusToggled: (updatedPilot: Pilot) => void;
}

interface ToggleStatusResponse {
  id: string;
  name: string | null;
  email: string;
  role: "PILOT";
  isActive: boolean;
}

export function PilotRowActions({ pilot, apiClient, onStatusToggled }: PilotRowActionsProps) {
  const [resetDialogOpen, setResetDialogOpen] = React.useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = React.useState(false);

  const handleToggleStatus = async () => {
    const newStatus = !pilot.isActive;
    setIsTogglingStatus(true);

    try {
      const response = await apiClient.patch<ApiResponse<ToggleStatusResponse>>(
        "/api/auth/pilots/status",
        { pilotId: pilot.id, isActive: newStatus }
      );

      if (response.data.success && response.data.data) {
        const updated = response.data.data;
        onStatusToggled({
          ...pilot,
          isActive: updated.isActive,
        });

        toast.success(
          updated.isActive
            ? `Pilot "${updated.name ?? updated.email}" has been activated.`
            : `Pilot "${updated.name ?? updated.email}" has been deactivated.`
        );
      }
    } catch (error: unknown) {
      const message = extractApiError(error, "Failed to update pilot status.");
      toast.error(message);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 data-[state=open]:bg-gray-100 hover:bg-gray-100 text-primary"
            disabled={isTogglingStatus}
            aria-label="Open actions menu"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48 font-medium">
          <DropdownMenuLabel className="text-primary font-bold">Pilot Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setResetDialogOpen(true)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <KeyRoundIcon className="size-4 mr-2" />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {pilot.isActive ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={handleToggleStatus}
              className="cursor-pointer font-bold"
              disabled={isTogglingStatus}
            >
              <ShieldOffIcon className="size-4 mr-2" />
              Deactivate
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onSelect={handleToggleStatus}
              className="cursor-pointer text-chart-1 focus:text-chart-1 focus:bg-chart-1/10 font-bold"
              disabled={isTogglingStatus}
            >
              <ShieldCheckIcon className="size-4 mr-2" />
              Activate
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ResetPilotPasswordDialog
        pilot={pilot}
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        apiClient={apiClient}
      />
    </>
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
