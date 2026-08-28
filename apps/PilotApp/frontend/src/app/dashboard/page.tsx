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

// Define strict type for Pilot Form instead of 'any'
interface PilotFormResponse {
  id: string;
  serialNo: string;
  vesselName: string;
  activityType: string;
  activityDateTime: string;
  status: string;
}

function getStatusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "APPROVED") return "default";
  if (status === "SUBMITTED") return "secondary";
  return "outline";
}

export default function PilotDashboard() {
  const { user, apiClient } = useAuth();
  const [forms, setForms] = useState<PilotFormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyForms = async () => {
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

    fetchMyForms();
  }, [apiClient]);

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pilot Dashboard</h1>
            {/* Safely fallback to email since JWTPayload doesn't carry 'name' by default */}
            <p className="text-muted-foreground">Welcome back, {user?.email || "Pilot"}</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/new-form">+ Create New Form</Link>
          </Button>
        </div>

        {/* Forms Table */}
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="border-b bg-muted/50 py-4">
            <CardTitle className="text-lg">My Pilot Forms</CardTitle>
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
                ) : forms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="p-8 text-center whitespace-normal text-muted-foreground">
                      No forms found. Create one to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  forms.map((form) => (
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}