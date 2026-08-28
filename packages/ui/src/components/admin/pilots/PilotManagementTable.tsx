"use client";

import type { AxiosInstance } from "axios";
import { SearchIcon } from "lucide-react";
import * as React from "react";

import {
  Badge, Input, Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../ui/";
import { PilotRowActions } from "./PilotRowActions";
import type { Pilot } from "./pilot.types";

interface PilotManagementTableProps {
  pilots: Pilot[];
  apiClient: AxiosInstance;
  onPilotUpdated: (updatedPilot: Pilot) => void;
}

type SortKey = "name" | "email" | "isActive" | "lastLoginAt" | "createdAt";
type SortDirection = "asc" | "desc";

interface SortState {
  key: SortKey;
  direction: SortDirection;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PilotManagementTable({
  pilots,
  apiClient,
  onPilotUpdated,
}: PilotManagementTableProps) {
  const [filter, setFilter] = React.useState("");
  const [sort, setSort] = React.useState<SortState>({ key: "createdAt", direction: "desc" });

  const handleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "asc" }
    );
  };

  const filtered = React.useMemo(() => {
    const query = filter.trim().toLowerCase();
    return pilots.filter(
      (p) =>
        p.email.toLowerCase().includes(query) ||
        (p.name?.toLowerCase() ?? "").includes(query)
    );
  }, [pilots, filter]);

  const sorted = React.useMemo(() => {
    return [...filtered].sort((a, b) => {
      const dir = sort.direction === "asc" ? 1 : -1;

      switch (sort.key) {
        case "name": {
          const nameA = (a.name ?? a.email).toLowerCase();
          const nameB = (b.name ?? b.email).toLowerCase();
          return nameA.localeCompare(nameB) * dir;
        }
        case "email":
          return a.email.localeCompare(b.email) * dir;
        case "isActive":
          return (Number(a.isActive) - Number(b.isActive)) * dir;
        case "lastLoginAt": {
          const tA = a.lastLoginAt ? new Date(a.lastLoginAt).getTime() : 0;
          const tB = b.lastLoginAt ? new Date(b.lastLoginAt).getTime() : 0;
          return (tA - tB) * dir;
        }
        case "createdAt":
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
        default:
          return 0;
      }
    });
  }, [filtered, sort]);

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sort.key !== columnKey) return <span className="ml-1 opacity-30">↕</span>;
    return (
      <span className="ml-1 text-foreground">
        {sort.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Search / Filter */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead
                className="cursor-pointer select-none px-4 py-3 hover:bg-muted"
                onClick={() => handleSort("name")}
              >
                Name <SortIndicator columnKey="name" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-4 py-3 hover:bg-muted"
                onClick={() => handleSort("email")}
              >
                Email <SortIndicator columnKey="email" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-4 py-3 hover:bg-muted"
                onClick={() => handleSort("isActive")}
              >
                Status <SortIndicator columnKey="isActive" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-4 py-3 hover:bg-muted"
                onClick={() => handleSort("lastLoginAt")}
              >
                Last Login <SortIndicator columnKey="lastLoginAt" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-4 py-3 hover:bg-muted"
                onClick={() => handleSort("createdAt")}
              >
                Created <SortIndicator columnKey="createdAt" />
              </TableHead>

              <TableHead className="px-4 py-3 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  {filter ? "No pilots match your search." : "No pilots in the system yet."}
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((pilot) => (
                <TableRow key={pilot.id}>
                  <TableCell className="px-4 py-3 font-medium">
                    {pilot.name ?? <span className="text-muted-foreground italic">—</span>}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {pilot.email}
                  </TableCell>

                  <TableCell className="px-4 py-3">
                    {pilot.isActive ? (
                      <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-600/90">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(pilot.lastLoginAt)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(pilot.createdAt)}
                  </TableCell>

                  <TableCell className="px-4 py-3 text-right">
                    <PilotRowActions
                      pilot={pilot}
                      apiClient={apiClient}
                      onStatusToggled={onPilotUpdated}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {sorted.length} of {pilots.length} pilot{pilots.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
