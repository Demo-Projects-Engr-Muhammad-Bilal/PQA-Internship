"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDashboardData, type PilotFormResponse } from "@/contexts";
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "APPROVED") return "default";
  if (status === "SUBMITTED") return "secondary";
  return "outline";
}

export default function PilotDashboard() {
  const { myForms, ensureMyForms, refreshData } = useDashboardData();

  useEffect(() => {
    ensureMyForms();
  }, [ensureMyForms]);

  const forms = myForms.data ?? [];
  const isLoading = myForms.status === "loading" || myForms.status === "idle";

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
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Forms Table */}
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="flex flex-row items-center justify-between border-b bg-primary/5 py-4 space-y-0">
            <CardTitle className="text-lg">My Pilot Forms</CardTitle>
            <div className="flex items-center gap-3">
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
                onClick={() => refreshData()}
                disabled={myForms.status === "loading"}
              >
                {myForms.status === "loading" ? "Refreshing…" : "Refresh"}
              </Button>
              <Button size="sm" asChild>
                <Link href="/dashboard/new-form">+ Create New Form</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-sm text-muted-foreground">
                  <TableHead className="p-4">Serial No.</TableHead>
                  <TableHead className="p-4">Vessel Name</TableHead>
                  <TableHead className="p-4">Activity</TableHead>
                  <TableHead className="p-4">Date</TableHead>
                  <TableHead className="p-4">Status</TableHead>
                  <TableHead className="p-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center whitespace-normal text-muted-foreground">
                      Loading forms...
                    </TableCell>
                  </TableRow>
                ) : filteredForms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center whitespace-normal text-muted-foreground">
                      No forms match your filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="p-4 font-medium">{form.serialNo}</TableCell>
                      <TableCell className="p-4">{form.vesselName}</TableCell>
                      <TableCell className="p-4">
                        <Badge variant="outline">{form.activityType}</Badge>
                      </TableCell>
                      <TableCell className="p-4">{new Date(form.activityDateTime).toLocaleDateString()}</TableCell>
                      <TableCell className="p-4">
                        <Badge variant={getStatusVariant(form.status)}>{form.status}</Badge>
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        {/* Updated to link dynamically to the form's detail page */}
                        <Button variant="link" size="sm" className="h-auto p-0" asChild>
                          <Link href={`/dashboard/${form.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            
            {!isLoading && filteredForms.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
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

