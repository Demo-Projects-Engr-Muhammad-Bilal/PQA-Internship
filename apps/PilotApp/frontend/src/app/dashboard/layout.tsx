"use client";

import { Button, useAuth } from "@repo/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4 bg-background/80 backdrop-blur">
        <div>
          <p className="text-sm font-medium">{user?.email ?? "Pilot"}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            {user?.role ?? "PILOT"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout()} disabled={isLoading}>
          {isLoading ? "Logging out..." : "Logout"}
        </Button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
