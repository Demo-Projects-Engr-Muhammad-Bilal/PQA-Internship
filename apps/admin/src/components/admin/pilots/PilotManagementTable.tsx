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
  TableRow,
  Button
} from "@/components/ui";
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
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 6;

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

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

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const SortIndicator = ({ columnKey }: { columnKey: SortKey }) => {
    if (sort.key !== columnKey) return <span className="ml-1 text-gray-300">↕</span>;
    return (
      <span className="ml-1 text-primary">
        {sort.direction === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-end px-6 py-4">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 h-10 border-gray-200 focus-visible:ring-primary shadow-sm"
          />
        </div>
      </div>

      <div className="border-t border-gray-100">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100/80 border-b border-gray-200">
              <TableHead
                className="cursor-pointer select-none px-6 py-4 hover:bg-gray-200/50 text-xs font-bold uppercase tracking-wider text-primary"
                onClick={() => handleSort("name")}
              >
                Name <SortIndicator columnKey="name" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-6 py-4 hover:bg-gray-200/50 text-xs font-bold uppercase tracking-wider text-primary"
                onClick={() => handleSort("email")}
              >
                Email <SortIndicator columnKey="email" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-6 py-4 hover:bg-gray-200/50 text-xs font-bold uppercase tracking-wider text-primary"
                onClick={() => handleSort("isActive")}
              >
                Status <SortIndicator columnKey="isActive" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-6 py-4 hover:bg-gray-200/50 text-xs font-bold uppercase tracking-wider text-primary"
                onClick={() => handleSort("lastLoginAt")}
              >
                Last Login <SortIndicator columnKey="lastLoginAt" />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none px-6 py-4 hover:bg-gray-200/50 text-xs font-bold uppercase tracking-wider text-primary"
                onClick={() => handleSort("createdAt")}
              >
                Created <SortIndicator columnKey="createdAt" />
              </TableHead>

              <TableHead className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-10 text-center text-sm font-medium text-muted-foreground italic"
                >
                  {filter ? "No pilots match your search." : "No pilots in the system yet."}
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((pilot) => (
                <TableRow key={pilot.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  <TableCell className="px-6 py-4 font-bold text-primary">
                    {pilot.name ?? <span className="text-muted-foreground italic font-normal">—</span>}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm font-medium text-gray-700">
                    {pilot.email}
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    {pilot.isActive ? (
                      <Badge className="bg-chart-1 text-white hover:bg-chart-1/90 border-transparent">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm font-medium text-gray-500">
                    {formatDate(pilot.lastLoginAt)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-sm font-medium text-gray-500">
                    {formatDate(pilot.createdAt)}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
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

      <div className="flex items-center justify-between px-6 pb-6 pt-2">
        <p className="text-sm font-medium text-muted-foreground">
          Showing {sorted.length > 0 ? Math.min((currentPage - 1) * itemsPerPage + 1, sorted.length) : 0} to {Math.min(currentPage * itemsPerPage, sorted.length)} of {sorted.length} entries
        </p>
        
        {sorted.length > 0 && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm font-medium px-2">Page {currentPage} of {totalPages}</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
