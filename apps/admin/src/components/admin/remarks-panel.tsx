"use client";
import { useAuth } from "@repo/ui";

import { useEffect, useState } from "react";
import { } from "@/contexts";
import { Button } from "@repo/ui/ui/button";
import { Textarea } from "@repo/ui/ui/textarea";
import { Skeleton } from "@repo/ui/ui/skeleton";
import { toast } from "sonner";
import { User, Clock } from "lucide-react";

interface Remark {
  id: string;
  message: string;
  createdAt: string;
  author: { name: string | null; email: string };
}

export function AdminRemarksPanel({ formId, formStatus }: { formId: string, formStatus?: string }) {
  const { apiClient } = useAuth();
  const [remarks, setRemarks] = useState<Remark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRemarks();
  }, [formId]);

  const fetchRemarks = async () => {
    try {
      const res = await apiClient.get(`/forms/${formId}/remarks`);
      if (res.data.success) {
        setRemarks(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load remarks", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newMessage.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await apiClient.post(`/forms/${formId}/remarks`, {
        message: newMessage.trim(),
      });
      if (res.data.success) {
        toast.success("Remark added");
        setNewMessage("");
        fetchRemarks();
      }
    } catch (err) {
      toast.error("Failed to add remark");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full border bg-card text-card-foreground rounded-lg shadow-sm overflow-hidden no-print">
      <div className="border-b bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
          Internal Admin Remarks
        </h3>
        <p className="text-xs text-muted-foreground">Not visible to pilots. Permanent audit log.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : remarks.length === 0 ? (
          <div className="text-muted-foreground text-xs italic text-center py-8">
            No remarks yet.
          </div>
        ) : (
          remarks.map((remark) => (
            <div key={remark.id} className="bg-background p-3 rounded border">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-foreground text-xs font-bold">
                  <User className="size-3" />
                  {remark.author.name || remark.author.email}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-[10px]">
                  <Clock className="size-3" />
                  {new Date(remark.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="text-foreground text-sm whitespace-pre-wrap">{remark.message}</p>
            </div>
          ))
        )}
      </div>

      {formStatus === "SUBMITTED" && (
      <div className="p-4 border-t bg-muted/20">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Add an internal remark..."
          className="min-h-[80px] text-sm border-input bg-transparent focus-visible:ring-1"
        />
        <Button
          size="sm"
          variant="default"
          onClick={handleSubmit}
          disabled={isSubmitting || !newMessage.trim()}
          className="mt-2 w-full font-bold"
        >
          {isSubmitting ? "Adding..." : "Add Remark"}
        </Button>
      </div>
      )}
    </div>
  );
}
