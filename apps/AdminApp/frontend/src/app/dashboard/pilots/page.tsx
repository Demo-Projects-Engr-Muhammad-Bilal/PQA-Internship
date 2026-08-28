"use client";

import { useEffect, useState, useCallback } from "react";
import {
  useAuth,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  PilotManagementTable,
  CreatePilotDialog,
  type Pilot,
} from "@repo/ui";
import type { ApiResponse } from "@repo/types";

export default function PilotsPage() {
  const { apiClient } = useAuth();
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchPilots = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await apiClient.get<ApiResponse<Pilot[]>>("/api/auth/pilots");

      if (response.data.success && response.data.data) {
        setPilots(response.data.data);
      } else {
        setFetchError("Received an unexpected response from the server.");
      }
    } catch (error: unknown) {
      const message = extractApiError(error, "Failed to load pilots. Please try again.");
      setFetchError(message);
    } finally {
      setIsLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    fetchPilots();
  }, [fetchPilots]);

  /** Prepend a newly created pilot to the top of the list. */
  const handlePilotCreated = (newPilot: Pilot) => {
    setPilots((prev) => [newPilot, ...prev]);
  };

  /** Replace the mutated pilot in-place so the table updates without a full refetch. */
  const handlePilotUpdated = (updatedPilot: Pilot) => {
    setPilots((prev) =>
      prev.map((p) => (p.id === updatedPilot.id ? updatedPilot : p))
    );
  };

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pilot Management</h1>
            <p className="text-muted-foreground mt-1">
              Provision accounts, manage access, and reset credentials.
            </p>
          </div>

          {/* Create Pilot Button + Dialog — only visible when data has loaded */}
          {!isLoading && !fetchError && (
            <CreatePilotDialog
              apiClient={apiClient}
              onPilotCreated={handlePilotCreated}
            />
          )}
        </div>

        {/* Main Content Card */}
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b bg-muted/50 py-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                Pilot Roster
                {!isLoading && !fetchError && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({pilots.length})
                  </span>
                )}
              </CardTitle>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : fetchError ? (
              <ErrorState message={fetchError} onRetry={fetchPilots} />
            ) : (
              <PilotManagementTable
                pilots={pilots}
                apiClient={apiClient}
                onPilotUpdated={handlePilotUpdated}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading pilots…">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded-md bg-muted"
        />
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <p className="text-sm text-destructive">{message}</p>
      <button
        onClick={onRetry}
        className="text-sm font-medium underline underline-offset-4 hover:no-underline"
      >
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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
