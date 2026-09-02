"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboardData, type AdminFormResponse } from "@/contexts";
import {
  Button, Badge, Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui";

function getStatusStyle(status: string) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90 border-transparent";
  if (status === "SUBMITTED") return "bg-amber-100 text-amber-800 hover:bg-amber-100/90 border-transparent";
  if (status === "REJECTED") return "bg-red-100 text-red-800 border-transparent";
  return "bg-gray-200 text-gray-700 border-transparent";
}

export default function AdminDashboard() {
  const { allForms, ensureAllForms, refreshForms } = useDashboardData();

  useEffect(() => {
    ensureAllForms();
  }, [ensureAllForms]);

  const forms = allForms.data ?? [];
  const isLoading = allForms.status === "loading" || allForms.status === "idle";

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const filteredForms = forms.filter(form => statusFilter === "ALL" || form.status === statusFilter);
  const totalPages = Math.ceil(filteredForms.length / itemsPerPage);
  const currentForms = filteredForms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="gap-0 overflow-hidden py-0 shadow-sm border bg-white rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5 py-4 space-y-0">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-lg font-bold text-primary">Admin Command Center</CardTitle>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System-wide Pilot Form Submissions</p>
            </div>
            
            <div className="flex items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white h-9">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SUBMITTED">Submitted</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refreshForms()}
                disabled={allForms.status === "loading"}
                className="ml-3 h-9"
              >
                {allForms.status === "loading" ? "Refreshing…" : "Refresh"}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100/80 border-b border-gray-200">
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Serial No.</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Pilot</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Vessel Name</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Submitted</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Status</TableHead>
                  <TableHead className="p-4 text-right text-xs font-bold uppercase tracking-wider text-primary">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {isLoading ? (
                  Array.from({length: 3}).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({length: 6}).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-muted-foreground italic font-medium">No forms match your filter.</TableCell>
                  </TableRow>
                ) : (
                  currentForms.map((form) => (
                    <TableRow key={form.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                      <TableCell className="p-4 font-bold text-primary">{form.serialNo}</TableCell>
                      <TableCell className="p-4 font-medium">{form.pilot.name || form.pilot.email}</TableCell>
                      <TableCell className="p-4 font-medium text-gray-700">{form.vesselName}</TableCell>
                      <TableCell className="p-4 text-gray-500">{new Date(form.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="p-4">
                        <Badge className={getStatusStyle(form.status)}>{form.status}</Badge>
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm" asChild>
                          <Link href={`/dashboard/forms/${form.id}`}>Review</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!isLoading && filteredForms.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                <div className="text-sm text-muted-foreground font-medium">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredForms.length)} to {Math.min(currentPage * itemsPerPage, filteredForms.length)} of {filteredForms.length} entries
                </div>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
