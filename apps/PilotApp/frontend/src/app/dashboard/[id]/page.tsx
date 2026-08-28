"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useAuth, Button, Card, CardHeader, CardTitle, CardContent, Badge, Separator } from "@repo/ui";

// 1. Define strict types to replace 'any'
interface CraftUsage {
  id: string;
  craftType: string;
  craftName: string;
  fromLocation: string;
  toLocation: string;
}

interface FormDetail {
  id: string;
  serialNo: string;
  vesselName: string;
  vesselType: string;
  localAgency: string;
  activityType: string;
  activityDateTime: string;
  status: string;
  craftsUsed: CraftUsage[];
}

export default function PilotFormViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const { apiClient } = useAuth();
  
  // 2. Apply the strict type to state
  const [form, setForm] = useState<FormDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <div className="p-8 text-center">Loading form details...</div>;
  if (!form) return <div className="p-8 text-center text-red-500">Form not found.</div>;

  return (
    <div className="min-h-screen bg-muted/30 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Form {form.serialNo}</h1>
            <p className="text-sm text-muted-foreground">Vessel: {form.vesselName}</p>
          </div>
          <div className="flex gap-4">
            {/* 3. Use Link for the back button to fix the unused variable error */}
            <Button variant="outline" asChild>
              <Link href="/dashboard">&larr; Back</Link>
            </Button>
            {form.status !== "APPROVED" && (
              <Button onClick={() => alert("Edit mode coming soon!")}>
                Edit Form
              </Button>
            )}
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between bg-muted/50">
            <CardTitle className="text-lg">Submission Details</CardTitle>
            <Badge variant={form.status === "APPROVED" ? "default" : "secondary"}>
              {form.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-muted-foreground">Activity Type:</span>
                <p>{form.activityType}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Activity Date:</span>
                <p>{new Date(form.activityDateTime).toLocaleString()}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Local Agency:</span>
                <p>{form.localAgency}</p>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Vessel Type:</span>
                <p>{form.vesselType}</p>
              </div>
            </div>

            <Separator />
            
            <div>
              <h3 className="mb-2 font-semibold">Crafts Used</h3>
              {form.craftsUsed && form.craftsUsed.length > 0 ? (
                <ul className="list-disc pl-5 text-sm">
                  {/* 4. Apply strict type to the map callback */}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}