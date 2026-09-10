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

export function AdminRemarksPanel({ formId }: { formId: string }) {
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
    <div className="flex flex-col h-full bg-amber-50 border border-amber-200 rounded-lg shadow-sm overflow-hidden no-print">
      <div className="bg-amber-100 border-b border-amber-200 p-3">
        <h3 className="text-amber-900 font-bold text-sm uppercase tracking-wide">
          Internal Admin Remarks
        </h3>
        <p className="text-amber-700 text-xs">Not visible to pilots. Permanent audit log.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full bg-amber-200/50" />
            <Skeleton className="h-16 w-full bg-amber-200/50" />
          </div>
        ) : remarks.length === 0 ? (
          <div className="text-amber-700/60 text-xs italic text-center py-8">
            No remarks yet.
          </div>
        ) : (
          remarks.map((remark) => (
            <div key={remark.id} className="bg-white/80 p-3 rounded border border-amber-200/60">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                  <User className="size-3" />
                  {remark.author.name || remark.author.email}
                </div>
                <div className="flex items-center gap-1 text-amber-600 text-[10px]">
                  <Clock className="size-3" />
                  {new Date(remark.createdAt).toLocaleString()}
                </div>
              </div>
              <p className="text-amber-950 text-sm whitespace-pre-wrap">{remark.message}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-amber-100/50 border-t border-amber-200">
        <Textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Add an internal remark..."
          className="min-h-[80px] text-sm bg-white border-amber-300 focus-visible:ring-amber-500 placeholder:text-amber-400"
        />
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isSubmitting || !newMessage.trim()}
          className="mt-2 w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
        >
          {isSubmitting ? "Adding..." : "Add Remark"}
        </Button>
      </div>
    </div>
  );
}
