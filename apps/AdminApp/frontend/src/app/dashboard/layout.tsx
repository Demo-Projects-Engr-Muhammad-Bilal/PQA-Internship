"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, useAuth } from "@repo/ui";
import { cn } from "@repo/ui";

const NAV_LINKS = [
  { href: "/dashboard", label: "Forms" },
  { href: "/dashboard/pilots", label: "Pilots" },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-8">
          {/* Identity */}
          <div>
            <p className="text-sm font-medium">{user?.email ?? "Admin"}</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {user?.role ?? "ADMIN"}
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted",
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <Button variant="outline" size="sm" onClick={() => logout()} disabled={isLoading}>
          {isLoading ? "Logging out…" : "Logout"}
        </Button>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
