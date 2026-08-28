"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth, Button, Card, CardHeader, CardTitle, CardContent, Badge, Separator } from "@repo/ui";

interface CraftUsage {
  id: string;
  craftType: string;
  craftName: string;
  fromLocation: string;
  toLocation: string;
}

interface AdminFormDetail {
  id: string;
  serialNo: string;
  vesselName: string;
  vesselType: string;
  activityType: string;
  activityDateTime: string;
  status: string;
  isDeclared: boolean;
  pilot: {
    email: string;
    name: string | null;
  };
  craftsUsed: CraftUsage[];
}

export default function AdminFormReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const { apiClient } = useAuth();
  const router = useRouter();
  
  const [form, setForm] = useState<AdminFormDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await apiClient.get(`/api/forms/${formId}`);
        if (response.data.success) {
          setForm(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch form:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [apiClient, formId]);

  const handleStatusChange = async (newStatus: "APPROVED" | "REJECTED") => {
    setIsUpdating(true);
    try {
      const response = await apiClient.patch(`/api/forms/${formId}/status`, { status: newStatus });
      if (response.data.success) {
        toast.success(`Form successfully ${newStatus.toLowerCase()}!`);
        setForm((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      toast.error("Failed to update status.");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading review data...</div>;
  if (!form) return <div className="p-8 text-center text-red-500">Form not found.</div>;

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Review Form: {form.serialNo}</h1>
            <p className="text-sm text-muted-foreground">Submitted by: {form.pilot.name || form.pilot.email}</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/dashboard">&larr; Back to Queue</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-muted/50">
            <CardTitle className="text-lg">Form Details</CardTitle>
            <div className="flex items-center gap-4">
              <Badge variant={form.status === "APPROVED" ? "default" : form.status === "REJECTED" ? "destructive" : "secondary"}>
                {form.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Vessel Name:</span>
                <p>{form.vesselName}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Vessel Type:</span>
                <p>{form.vesselType}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Activity Type:</span>
                <p>{form.activityType}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Activity Date:</span>
                <p>{new Date(form.activityDateTime).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Pilot Declaration:</span>
                <p className={form.isDeclared ? "text-green-600 font-medium" : "text-red-600"}>
                  {form.isDeclared ? "Digitally Signed & Confirmed" : "Missing"}
                </p>
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="mb-2 font-semibold">Crafts Used</h3>
              {form.craftsUsed && form.craftsUsed.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {form.craftsUsed.map((craft: CraftUsage) => (
                    <li key={craft.id}>
                      {craft.craftType} ({craft.craftName}) — {craft.fromLocation} to {craft.toLocation}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No crafts deployed.</p>
              )}
            </div>
            
            {/* Admin Action Bar */}
            {form.status === "SUBMITTED" && (
              <>
                <Separator />
                <div className="flex justify-end gap-4 pt-2">
                  <Button 
                    variant="destructive" 
                    disabled={isUpdating}
                    onClick={() => handleStatusChange("REJECTED")}
                  >
                    Reject Form
                  </Button>
                  <Button 
                    disabled={isUpdating}
                    onClick={() => handleStatusChange("APPROVED")}
                  >
                    Approve & Lock Form
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}