"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  useAuth,
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
} from "@repo/ui";

interface AdminFormResponse {
  id: string;
  serialNo: string;
  vesselName: string;
  activityType: string;
  status: string;
  createdAt: string;
  pilot: {
    email: string;
    name: string | null;
  };
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "APPROVED") return "default";
  if (status === "SUBMITTED") return "secondary";
  if (status === "REJECTED") return "destructive";
  return "outline";
}

export default function AdminDashboard() {
  const { user, apiClient } = useAuth();
  const [forms, setForms] = useState<AdminFormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllForms = async () => {
      try {
        const response = await apiClient.get("/api/forms");
        if (response.data.success) {
          setForms(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch forms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllForms();
  }, [apiClient]);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Command Center</h1>
          <p className="text-muted-foreground">System-wide Pilot Form Submissions</p>
        </div>

        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b bg-muted/50 py-4">
            <CardTitle className="text-lg">Review Queue</CardTitle>
          </CardHeader>

          <CardContent className="px-0 py-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 text-sm text-muted-foreground">
                  <TableHead className="p-4">Serial No.</TableHead>
                  <TableHead className="p-4">Pilot</TableHead>
                  <TableHead className="p-4">Vessel Name</TableHead>
                  <TableHead className="p-4">Submitted</TableHead>
                  <TableHead className="p-4">Status</TableHead>
                  <TableHead className="p-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">Loading forms...</TableCell>
                  </TableRow>
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center text-muted-foreground">No forms in the system.</TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell className="p-4 font-medium">{form.serialNo}</TableCell>
                      <TableCell className="p-4">{form.pilot.name || form.pilot.email}</TableCell>
                      <TableCell className="p-4">{form.vesselName}</TableCell>
                      <TableCell className="p-4">{new Date(form.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="p-4">
                        <Badge variant={getStatusVariant(form.status)}>{form.status}</Badge>
                      </TableCell>
                      <TableCell className="p-4 text-right">
                        <Button variant="link" size="sm" className="h-auto p-0" asChild>
                          <Link href={`/dashboard/forms/${form.id}`}>Review</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}