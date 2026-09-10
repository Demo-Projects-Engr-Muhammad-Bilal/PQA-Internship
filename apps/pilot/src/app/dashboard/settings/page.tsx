"use client";
import { useAuth } from "@repo/ui";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { } from "@/contexts";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@repo/ui";
import { SignaturePad, type SignaturePadHandle } from "@repo/ui";

export default function SettingsPage() {
  const { user, apiClient, refreshUser } = useAuth(); // refreshUser: re-fetches /auth/me into context
  const sigPadRef = useRef<SignaturePadHandle>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const signatureImage = sigPadRef.current?.getDataURL();
    if (!signatureImage) {
      toast.error("Please draw your signature before saving.");
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.patch("/auth/me", { signatureImage });
      await refreshUser?.();
      toast.success("Signature saved. It will auto-fill on future forms.");
    } catch {
      toast.error("Failed to save signature. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-primary/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-widest text-accent uppercase">
            My Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {user?.signatureImage && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Currently saved:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.signatureImage} alt="Saved signature" className="h-16 object-contain" />
            </div>
          )}
          <SignaturePad ref={sigPadRef} label="Draw new signature to replace it" />
          <Button onClick={handleSave} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-white">
            {isSaving ? "Saving..." : "Save Signature"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
