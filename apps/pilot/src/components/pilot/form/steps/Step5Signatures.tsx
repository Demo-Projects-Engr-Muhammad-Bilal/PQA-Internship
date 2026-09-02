"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts";
import {
  Button, Card, CardContent, CardHeader, CardTitle,
  Input, Label,
} from "@/components/ui";
import SignaturePad, { type SignaturePadHandle } from "../SignaturePad";
import StampCapture from "../StampCapture";

interface Step5SignaturesProps {
  /** ID of the already-saved DRAFT form to be submitted. */
  formId: string;
  /** Called when the user wants to go back to Step 4. */
  onBack: () => void;
}

const DRAFT_KEY = "pilot_form_draft";

/**
 * Step 5 — Signatures & Final Submission.
 *
 * - Collects isDeclared checkbox, master name text input,
 *   master signature pad, and ship stamp capture.
 * - Calls POST /api/forms/[id]/submit.
 * - Independent of react-hook-form (signatures are ref/state-based).
 */
export default function Step5Signatures({ formId, onBack }: Step5SignaturesProps) {
  const { apiClient } = useAuth();
  const router = useRouter();

  // Local controlled state for this step
  const [isDeclared, setIsDeclared] = useState(false);
  const [masterName, setMasterName] = useState("");
  const [shipStampImage, setShipStampImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref to the signature pad — reads Base64 on submit
  const sigPadRef = useRef<SignaturePadHandle>(null);

  // The submit button is only enabled when ALL four fields are satisfied
  const isReady =
    isDeclared &&
    masterName.trim().length > 0 &&
    shipStampImage.length > 0 &&
    !(sigPadRef.current?.isEmpty() ?? true);

  const handleSubmit = useCallback(async () => {
    const masterSignature = sigPadRef.current?.getDataURL() ?? "";

    if (!masterSignature) {
      toast.error("Please draw the master\u2019s signature before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/forms/${formId}/submit`, {
        isDeclared: true,
        masterSignature,
        masterName: masterName.trim(),
        shipStampImage,
      });

      toast.success("Form submitted for approval!");
      localStorage.removeItem(DRAFT_KEY);
      router.push("/dashboard");
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Submission failed. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [apiClient, formId, masterName, shipStampImage, router]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Section header */}
      <div className="border-b border-gray-100 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Signatures &amp; Declaration
        </h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Obtain the Master\u2019s signature and ship stamp to complete the form.
        </p>
      </div>

      {/* Legal Declaration checkbox */}
      <Card className="border-accent/20 bg-accent/5 shadow-sm">
        <CardContent className="flex items-start gap-4 pt-6">
          <input
            id="isDeclared"
            type="checkbox"
            className="mt-1 size-5 cursor-pointer accent-accent"
            checked={isDeclared}
            onChange={(e) => setIsDeclared(e.target.checked)}
          />
          <div className="space-y-1 leading-none">
            <Label
              htmlFor="isDeclared"
              className="cursor-pointer text-base font-bold text-primary"
            >
              Legal Declaration
            </Label>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              I declare that the above contents are true and correct to the best
              of my knowledge. I understand this forms an official maritime record.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Master Name */}
      <Card className="border-primary/10 shadow-md">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-sm font-bold tracking-widest text-accent uppercase">
            Master Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label
              htmlFor="masterName"
              className="text-xs font-bold uppercase tracking-wider text-primary"
            >
              Master\u2019s Name
            </Label>
            <Input
              id="masterName"
              placeholder="Full name of the Master"
              value={masterName}
              onChange={(e) => setMasterName(e.target.value)}
              className="focus-visible:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      {/* Master Signature Pad */}
      <Card className="border-primary/10 shadow-md">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-sm font-bold tracking-widest text-accent uppercase">
            Master\u2019s Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <SignaturePad ref={sigPadRef} label="Draw signature in the box below" />
        </CardContent>
      </Card>

      {/* Ship Stamp Capture */}
      <Card className="border-primary/10 shadow-md">
        <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
          <CardTitle className="text-sm font-bold tracking-widest text-accent uppercase">
            Ship\u2019s Stamp
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <StampCapture
            label="Capture or upload ship\u2019s stamp"
            value={shipStampImage}
            onChange={setShipStampImage}
          />
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="h-11 px-8 font-semibold text-primary border-gray-300 hover:bg-gray-50"
          onClick={onBack}
          disabled={isSubmitting}
        >
          &larr; Previous
        </Button>

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady || isSubmitting}
          className="h-11 px-10 font-bold bg-accent hover:bg-accent/90 text-white shadow-md transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <ShieldCheck className="mr-2 size-4" />
              Submit for Approval
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
