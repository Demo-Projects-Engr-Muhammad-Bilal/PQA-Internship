"use client";
import { useAuth } from "@repo/ui";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {  type AdminFormResponse } from "@/contexts";
import {
  Button, Badge, Card, CardHeader, CardTitle, CardContent,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Skeleton,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Input, Checkbox
} from "@repo/ui";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";

function getStatusStyle(status: string) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-800 hover:bg-emerald-100/90 border-transparent";
  if (status === "SUBMITTED") return "bg-amber-100 text-amber-800 hover:bg-amber-100/90 border-transparent";
  if (status === "REJECTED") return "bg-red-100 text-red-800 border-transparent";
  return "bg-gray-200 text-gray-700 border-transparent";
}

export default function AdminDashboard() {
  const { apiClient } = useAuth();
  const [forms, setForms] = useState<AdminFormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [vesselTypeFilter, setVesselTypeFilter] = useState("ALL");
  const [activityTypeFilter, setActivityTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkActing, setIsBulkActing] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchFilteredForms = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (vesselTypeFilter !== "ALL") params.append("vesselType", vesselTypeFilter);
      if (activityTypeFilter !== "ALL") params.append("activityType", activityTypeFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);

      const res = await apiClient.get(`/forms/filter?${params.toString()}`);
      if (res.data.success) {
        setForms(res.data.data);
      } else {
        toast.error("Failed to load forms");
      }
    } catch (err) {
      toast.error("Error loading forms");
    } finally {
      setIsLoading(false);
    }
  }, [apiClient, statusFilter, vesselTypeFilter, activityTypeFilter, debouncedSearch]);

  useEffect(() => {
    fetchFilteredForms();
    setCurrentPage(1);
    setSelectedIds(new Set()); // Reset selection on filter change
  }, [fetchFilteredForms]);

  const handleBulkAction = async (actionStatus: "APPROVED" | "REJECTED") => {
    if (selectedIds.size === 0) return;
    
    let rejectionReason = undefined;
    if (actionStatus === "REJECTED") {
      const reason = window.prompt("Enter a reason for rejecting the selected forms:");
      if (!reason) {
        toast.error("Rejection reason is required for bulk rejection.");
        return;
      }
      rejectionReason = reason;
    } else {
      const confirm = window.confirm(`Are you sure you want to approve ${selectedIds.size} form(s)?`);
      if (!confirm) return;
    }

    setIsBulkActing(true);
    try {
      const res = await apiClient.patch("/forms/bulk-status", {
        formIds: Array.from(selectedIds),
        status: actionStatus,
        rejectionReason
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSelectedIds(new Set());
        fetchFilteredForms();
      } else {
        toast.error(res.data.message || "Bulk action failed");
      }
    } catch (err) {
      toast.error("Bulk action encountered an error");
    } finally {
      setIsBulkActing(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentForms.length && currentForms.length > 0) {
      setSelectedIds(new Set());
    } else {
      const next = new Set<string>();
      currentForms.forEach(f => next.add(f.id));
      setSelectedIds(next);
    }
  };

  const totalPages = Math.ceil(forms.length / itemsPerPage);
  const currentForms = forms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="mx-auto max-w-7xl space-y-4">
        
        {/* Filters Toolbar */}
        <Card className="bg-white border shadow-sm">
          <CardContent className="p-4 flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search serial, vessel, pilot..." 
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={vesselTypeFilter} onValueChange={setVesselTypeFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Vessel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Vessels</SelectItem>
                <SelectItem value="LNGC">LNGC</SelectItem>
                <SelectItem value="LPG">LPG</SelectItem>
                <SelectItem value="TANKER">Tanker</SelectItem>
                <SelectItem value="CONTAINER">Container</SelectItem>
                <SelectItem value="BULK_CARRIER">Bulk Carrier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Activity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Activities</SelectItem>
                <SelectItem value="ARRIVAL">Arrival</SelectItem>
                <SelectItem value="DEPARTURE">Departure</SelectItem>
                <SelectItem value="SHIFTING">Shifting</SelectItem>
                <SelectItem value="SWINGING">Swinging</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={fetchFilteredForms} disabled={isLoading} className="h-9">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
            </Button>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar (Sticky if items selected) */}
        {selectedIds.size > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between shadow-sm sticky top-4 z-10 animate-in slide-in-from-top-2">
            <span className="text-emerald-900 font-semibold text-sm">
              {selectedIds.size} form(s) selected
            </span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8"
                onClick={() => handleBulkAction("APPROVED")}
                disabled={isBulkActing}
              >
                Approve Selected
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-red-200 text-red-600 hover:bg-red-50 h-8"
                onClick={() => handleBulkAction("REJECTED")}
                disabled={isBulkActing}
              >
                Reject Selected
              </Button>
            </div>
          </div>
        )}

        {/* Forms Table */}
        <Card className="gap-0 overflow-hidden py-0 shadow-sm border bg-white rounded-xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100/80 border-b border-gray-200">
                  <TableHead className="w-[40px] p-4">
                    <Checkbox 
                      checked={currentForms.length > 0 && selectedIds.size === currentForms.length}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Serial No.</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Pilot</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Vessel Name</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Activity</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Submitted</TableHead>
                  <TableHead className="p-4 text-xs font-bold uppercase tracking-wider text-primary">Status</TableHead>
                  <TableHead className="p-4 text-right text-xs font-bold uppercase tracking-wider text-primary">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {isLoading ? (
                  Array.from({length: 4}).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({length: 8}).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-8 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="p-8 text-center text-muted-foreground italic font-medium">No forms match your filters.</TableCell>
                  </TableRow>
                ) : (
                  currentForms.map((form) => {
                    const isPending = form.status === "SUBMITTED";
                    return (
                      <TableRow key={form.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                        <TableCell className="p-4">
                          {isPending ? (
                            <Checkbox 
                              checked={selectedIds.has(form.id)} 
                              onCheckedChange={() => toggleSelection(form.id)}
                            />
                          ) : (
                            <div className="w-4 h-4 rounded border bg-gray-100 opacity-50 cursor-not-allowed" title="Only pending forms can be bulk updated" />
                          )}
                        </TableCell>
                        <TableCell className="p-4 font-bold text-primary">{form.serialNo}</TableCell>
                        <TableCell className="p-4 font-medium">{form.pilot.name || form.pilot.email}</TableCell>
                        <TableCell className="p-4 font-medium text-gray-700">{form.vesselName}</TableCell>
                        <TableCell className="p-4 text-gray-600 font-medium">{form.activityType}</TableCell>
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
                    );
                  })
                )}
              </TableBody>
            </Table>

            {!isLoading && forms.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50/50">
                <div className="text-sm text-muted-foreground font-medium">
                  Showing {Math.min((currentPage - 1) * itemsPerPage + 1, forms.length)} to {Math.min(currentPage * itemsPerPage, forms.length)} of {forms.length} entries
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
