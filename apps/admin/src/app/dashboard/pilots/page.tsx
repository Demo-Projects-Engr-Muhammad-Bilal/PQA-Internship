"use client";

import { useEffect, useState } from "react";
import { useAuth, useDashboardData } from "@/contexts";
import { Card, CardContent, CardHeader, CardTitle, Skeleton, Alert, AlertTitle, AlertDescription, Button } from "@/components/ui";
import { AlertTriangle } from "lucide-react";
import { PilotManagementTable, CreatePilotDialog, type Pilot } from "@/components/admin/pilots";
import type { ApiResponse } from "@repo/types";

export default function PilotsPage() {
  const { apiClient } = useAuth();
  const { pilots: pilotsCache, ensurePilots, refreshPilots, invalidatePilots } = useDashboardData();

  useEffect(() => {
    ensurePilots();
  }, [ensurePilots]);

  const pilots = (pilotsCache.data as unknown as Pilot[]) ?? [];
  const isLoading = pilotsCache.status === "loading" || pilotsCache.status === "idle";
  const fetchError = pilotsCache.status === "error" ? pilotsCache.error : null;

  const handleRetry = () => {
    refreshPilots();
  };

  const handlePilotCreated = () => {
    invalidatePilots();
  };

  const handlePilotUpdated = () => {
    invalidatePilots();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="gap-0 overflow-hidden py-0 shadow-sm border bg-white rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5 py-4 space-y-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg font-bold text-primary">
                Pilot Management
                {!isLoading && !fetchError && (
                  <span className="ml-3 text-sm font-bold text-muted-foreground">
                    ({pilots.length} Total)
                  </span>
                )}
              </CardTitle>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Provision accounts, manage access, and reset credentials.
              </p>
            </div>
            {!isLoading && !fetchError && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => refreshPilots()}
                  disabled={pilotsCache.status === "loading"}
                  className="h-9"
                >
                  {pilotsCache.status === "loading" ? "Refreshing…" : "Refresh"}
                </Button>
                <CreatePilotDialog
                  apiClient={apiClient}
                  onPilotCreated={handlePilotCreated}
                />
              </div>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8"><LoadingSkeletons /></div>
            ) : fetchError ? (
              <div className="p-8"><ErrorAlert message={fetchError} onRetry={handleRetry} /></div>
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

function LoadingSkeletons() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}

function ErrorAlert({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Alert variant="destructive" className="mx-4 my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Loading Pilots</AlertTitle>
      <AlertDescription className="mt-2 flex items-center justify-between">
        <span>{message}</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function extractApiError(error: unknown, fallback: string): string {
  if (error !== null && typeof error === "object" && "response" in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    return axiosError.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
