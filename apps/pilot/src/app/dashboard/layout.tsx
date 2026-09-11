"use client";
import { useAuth } from "@repo/ui";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, LogOut, Home, FileText, PenLine } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@repo/ui/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@repo/ui/ui/sidebar";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@repo/ui/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@repo/ui/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/ui/avatar";
import { Button } from "@repo/ui/ui/button";
import {  DashboardDataProvider } from "@/contexts";
import { ModeToggle } from "@repo/ui/shared/mode-toggle";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Forms", icon: FileText },
  { href: "/dashboard/new-form", label: "New Submission", icon: PenLine },
];

function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="gap-2 px-2 mt-4">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(href);

        return (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton asChild isActive={isActive} className="text-base py-5 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!px-0">
              <Link href={href}>
                <span className="text-xl text-primary">
                  <Icon className="size-5" />
                </span>
                <span className="group-data-[collapsible=icon]:hidden">{label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

function Header() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string }> = [
      { label: "Dashboard", href: "/dashboard" },
    ];

    if (segments.includes("new-form")) {
      breadcrumbs.push({ label: "New Submission", href: "/dashboard/new-form" });
    } else if (segments.length > 1 && segments[1] !== "new-form") {
      breadcrumbs.push({ label: "Form Details", href: pathname });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const userInitials = user?.email?.substring(0, 2).toUpperCase() ?? "PI";

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
      <div className="flex items-center gap-4 flex-1">
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="border-b px-4 h-16 flex items-center justify-start">
                  <Image src="/logo-actual.png" alt="PQA Logo" width={220} height={70} className="w-auto h-14 object-contain" />
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarNav />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <SidebarTrigger className="hidden lg:flex -ml-2 mr-2" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  <BreadcrumbLink href={crumb.href} className="text-sm">
                    {crumb.label}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="size-8">
                <AvatarImage src="" alt={user?.email} />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.email ?? "Pilot"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.role ?? "PILOT"} Portal
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logout()}
              disabled={isLoading}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="size-4 mr-2" />
              {isLoading ? "Logging outâ€¦" : "Logout"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardDataProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden w-full">
        <div className="hidden lg:block">
          <Sidebar collapsible="icon">
            <SidebarHeader className="h-16 px-4 flex flex-col justify-center border-b border-border/50">
              <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
                <div className="flex items-center justify-center shrink-0">
                  {/* Expanded Logo */}
                  <Image 
                    src="/logo-actual.png" 
                    alt="PQA Logo" 
                    width={220} 
                    height={70} 
                    className="w-auto h-14 object-contain group-data-[collapsible=icon]:hidden" 
                  priority
                    />
                  {/* Collapsed Logo */}
                  <Image 
                    src="/collapse-logo.png" 
                    alt="PQA Icon" 
                    width={40} 
                    height={40} 
                    className="hidden w-auto h-8 object-contain group-data-[collapsible=icon]:block" 
                  />
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <div className="mt-4 px-5 group-data-[collapsible=icon]:hidden transition-all duration-200">
                <p className="text-sm font-medium text-muted-foreground">Welcome back, Pilot!</p>
              </div>
              <SidebarNav />
            </SidebarContent>

            <SidebarRail />
          </Sidebar>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden w-full">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:px-6">{children}</main>
        </div>
      </div>
      </SidebarProvider>
    </DashboardDataProvider>
  );
}





