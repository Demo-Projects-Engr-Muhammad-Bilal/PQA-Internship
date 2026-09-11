"use client";
import { useAuth } from "@repo/ui";

import { FormCheckbox } from "@repo/ui";
import { AdminRemarksPanel } from "@/components/admin/remarks-panel";
import { Alert, AlertDescription } from "@repo/ui/ui/alert";
import { Button } from "@repo/ui/ui/button";
import { Skeleton } from "@repo/ui/ui/skeleton";
import {  useDashboardData } from "@/contexts";
import { AlertTriangle, ArrowLeft, Printer, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import type { PilotFormWithRelations, ApiResponse } from "@repo/types";

/* ============================================================
   ADMIN-SPECIFIC STATE
   ============================================================ */

type ActionState = "idle" | "approving" | "rejecting";

/* ============================================================
   STATUS BADGE HELPERS
   ============================================================ */

const STATUS_STYLES: Record<PilotFormWithRelations["status"], string> = {
  DRAFT: "bg-gray-200 text-gray-700",
  SUBMITTED: "bg-amber-100 text-amber-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-red-100 text-red-800",
};

/* ============================================================
   PAGE COMPONENT
   ============================================================ */

export default function AdminFormReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const { apiClient } = useAuth();
  const { invalidateAllForms } = useDashboardData();

  const [formData, setFormData] = useState<PilotFormWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionInput, setShowRejectionInput] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<ApiResponse<PilotFormWithRelations>>(
          `/forms/${formId}`
        );

        if (response.data.success && response.data.data) {
          setFormData(response.data.data);
        } else {
          setError(response.data.message || "Failed to load form");
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to fetch form";
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [apiClient, formId]);

  const handleApprove = async () => {
    if (!formData) return;
    setActionState("approving");
    try {
      const response = await apiClient.patch(`/forms/${formId}/status`, {
        status: "APPROVED",
      });
      if (response.data.success) {
        toast.success("Form approved and countersigned.");
        setFormData((prev) =>
          prev ? { ...prev, status: "APPROVED" } : null
        );
        invalidateAllForms();
      } else {
        toast.error(response.data.message || "Approval failed.");
      }
    } catch {
      toast.error("Network error â€” approval failed.");
    } finally {
      setActionState("idle");
    }
  };

  const handleReject = async () => {
    if (!formData) return;
    if (!rejectionReason.trim()) {
      toast.error("A rejection reason is required.");
      return;
    }
    setActionState("rejecting");
    try {
      const response = await apiClient.patch(`/forms/${formId}/status`, {
        status: "REJECTED",
        rejectionReason: rejectionReason.trim(),
      });
      if (response.data.success) {
        toast.success("Form rejected.");
        setFormData((prev) =>
          prev ? { ...prev, status: "REJECTED", rejectionReason: rejectionReason.trim() } : null
        );
        setShowRejectionInput(false);
        setRejectionReason("");
        invalidateAllForms();
      } else {
        toast.error(response.data.message || "Rejection failed.");
      }
    } catch {
      toast.error("Network error â€” rejection failed.");
    } finally {
      setActionState("idle");
    }
  };

  /* ---- Loading / Error states ---- */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-[900px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Form not found"}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Queue
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSubmitted = formData.status === "SUBMITTED";
  const pilotLabel =
    formData.pilot?.name || formData.pilot?.email || "Unknown Pilot";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full space-y-4">

        {/* =====================================================
            ADMIN ACTION BAR â€” hidden on print via .no-print
            ===================================================== */}
        <div className="no-print flex flex-col gap-3">
          {/* Top row: navigation + status */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Queue
              </Link>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="hidden md:inline-flex items-center gap-1"
            >
              <Printer className="h-4 w-4" />
              Print Form
            </Button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground font-medium">
                Submitted by:{" "}
                <span className="text-foreground font-semibold">
                  {pilotLabel}
                </span>
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-1 rounded ${
                  STATUS_STYLES[formData.status]
                }`}
              >
                {formData.status}
              </span>
            </div>
          </div>

          {/* Admin decision row â€” only shown for SUBMITTED forms */}
          {isSubmitted && (
            <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1"
                  disabled={actionState !== "idle"}
                  onClick={handleApprove}
                >
                  <CheckCircle className="h-4 w-4" />
                  {actionState === "approving" ? "Approvingâ€¦" : "Approve"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-400 text-red-600 hover:bg-red-50 font-semibold flex items-center gap-1"
                  disabled={actionState !== "idle"}
                  onClick={() => setShowRejectionInput((v) => !v)}
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>

                {formData.rejectionReason && (
                  <span className="text-[11px] text-red-600 font-medium ml-2">
                    Previous reason: {formData.rejectionReason}
                  </span>
                )}
              </div>

              {showRejectionInput && (
                <div className="flex gap-2 items-start mt-1">
                  <textarea
                    className="flex-1 rounded border border-gray-300 text-[12px] p-2 resize-none focus:outline-none focus:ring-1 focus:ring-red-400"
                    rows={2}
                    placeholder="State the reason for rejection (required)â€¦"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold self-end"
                    disabled={actionState !== "idle" || !rejectionReason.trim()}
                    onClick={handleReject}
                  >
                    {actionState === "rejecting" ? "Rejectingâ€¦" : "Confirm Reject"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Read-only notice for already-decided forms */}
          {!isSubmitted && (
            <div className="text-[11px] text-muted-foreground bg-white border border-gray-200 rounded px-3 py-2">
              This form has been <strong>{formData.status.toLowerCase()}</strong> and is read-only.
              {formData.rejectionReason && (
                <span className="ml-1 text-red-600">
                  Rejection reason: {formData.rejectionReason}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="no-print mb-8">
          <AdminRemarksPanel formId={formId} formStatus={formData.status} />
        </div>

        {/* =====================================================
            FORM CONTAINER â€” the ONLY element visible when printing.
            The .print-only-form + .form-page classes are the
            two-layer print isolation defined in globals.css.
            ===================================================== */}
        <div className="overflow-x-auto w-full pb-8">
        <div className="print-only-form form-page bg-white text-black">
          <FormContent form={formData} />
        </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOCAL DATA-DISPLAY PRIMITIVES
   All dynamic DB values render through DataField / DataText so
   every piece of live data is GUARANTEED `text-cyan-600 font-bold
   text-[12px]` â€” the isCyan convention, kept intact.
   ============================================================ */

function DataField({
  value,
  unit,
}: {
  value?: string | number | null;
  unit?: string;
}) {
  const displayValue =
    value !== undefined && value !== null && value !== ""
      ? String(value).trim()
      : "";

  return (
    <div className="flex items-end gap-1 w-full">
      <div
        className="flex-1 border-b border-black text-cyan-600 font-bold text-[12px] leading-tight"
        style={{ minHeight: "16px", WebkitPrintColorAdjust: "exact" }}
      >
        {displayValue}
      </div>
      {unit && (
        <span className="text-cyan-600 font-bold text-[12px] whitespace-nowrap">
          {unit}
        </span>
      )}
    </div>
  );
}

function DataText({ value }: { value?: string | number | null }) {
  const displayValue =
    value !== undefined && value !== null && value !== ""
      ? String(value).trim()
      : "";
  return (
    <span
      className="text-cyan-600 font-bold text-[12px]"
      style={{ WebkitPrintColorAdjust: "exact" }}
    >
      {displayValue}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] font-bold text-black mb-[3px] leading-none">
      {children}
    </div>
  );
}

/* ============================================================
   FORM CONTENT â€” pixel-perfect replica of the physical
   Pilotage & Dangerous Goods Declaration form.
   
   INVARIANTS (do not change):
   - All DB values pass through DataField or DataText â€” never
     rendered as raw JSX text.
   - CRAFT_ROWS is exactly 10 entries to match the physical form.
   - isCyan convention: text-cyan-600 font-bold text-[12px].
   - WebkitPrintColorAdjust: "exact" on every element that
     carries a non-white background or non-black foreground.
   ============================================================ */

function FormContent({ form }: { form: PilotFormWithRelations }) {
  const parseDateTime = (dateTimeStr: string | Date | null | undefined) => {
    if (!dateTimeStr) return { date: "", time: "" };
    try {
      const date = new Date(dateTimeStr);
      if (Number.isNaN(date.getTime())) return { date: "", time: "" };
      const dateStr = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      return { date: dateStr, time: timeStr };
    } catch {
      return { date: "", time: "" };
    }
  };

  const activityDT = parseDateTime(form.activityDateTime);
  const cancellationDT = parseDateTime(form.cancellationDateTime);
  const boardingDT = parseDateTime(form.boardingDate);
  const disembarkationDT = parseDateTime(form.disembarkationDate);
  const unmooredDT = parseDateTime(form.unmooredDate);
  const mooredDT = parseDateTime(form.mooredDate);

  // EXACT 10-row Crafts Used table, hardcoded per the physical form.
  const CRAFT_ROWS = [
    "Pilot Boat",
    "Tug",
    "Tug",
    "Tug",
    "Tug",
    "Mooring Boat",
    "Mooring Boat",
    "Escorting",
    "Tug 1",
    "Tug 2",
  ];

  const VESSEL_TYPES: Array<{ label: string; value: string }> = [
    { label: "LNGC", value: "LNGC" },
    { label: "LPG", value: "LPG" },
    { label: "TANKER", value: "TANKER" },
    { label: "CONTAINER", value: "CONTAINER" },
    { label: "BULK\nCARRIER", value: "BULK_CARRIER" },
    { label: "OTHERS", value: "OTHERS" },
  ];

  const ACTIVITY_TYPES: Array<{ label: string; value: string }> = [
    { label: "Arrival", value: "ARRIVAL" },
    { label: "Departure", value: "DEPARTURE" },
    { label: "Shifting", value: "SHIFTING" },
    { label: "Swinging", value: "SWINGING" },
    { label: "Cancellation", value: "CANCELLATION" },
  ];

  return (
    <div className="text-black">
      {/* ======================= HEADER ======================= */}
      <div className="form-section border-x border-t border-black">
        <div className="flex items-start justify-between px-2 pt-2 pb-1 gap-2">
          {/* Left: Actual logo image â€” no CSS-drawn box */}
          <div className="w-[92px] h-[64px] flex-shrink-0 flex items-start justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pq-logo.png"
              alt="Port Qasim Authority"
              className="h-full w-auto object-contain object-left"
              style={{ WebkitPrintColorAdjust: "exact" }}
            />
          </div>

          {/* Center: Title block */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="text-[32px] font-bold tracking-wide text-center">
              PORT QASIM AUTHORITY
            </div>
            <div className="text-[10.5px] font-bold tracking-wide text-center mt-[1px]">
              PILOTAGE AND DANGEROUS GOODS DECLARATION
            </div>
          </div>

          {/* Right: Serial Number */}
          <div className="text-right w-[130px] flex-shrink-0">
            <div className="text-[11px] font-bold leading-tight">
              S.No. <DataText value={form.serialNo} />
            </div>
            <div className="text-[9px] leading-[1.3] mt-[2px]">
              <div>PQA-PPODSBYKAM</div>
              <div>PQA-2-250-41</div>
            </div>
          </div>
        </div>

        {/* Activity Checkbox row */}
        <div className="grid grid-cols-5 gap-0 border-t border-black">
          {ACTIVITY_TYPES.map((item, idx) => (
            <div
              key={item.value}
              className={`flex flex-col items-center justify-center gap-1 py-2 ${
                idx < ACTIVITY_TYPES.length - 1 ? "border-r border-black" : ""
              }`}
            >
              <div className="text-[10px] font-bold">{item.label}</div>
              <FormCheckbox checked={form.activityType === item.value} />
            </div>
          ))}
        </div>

        {/* Date/Time row */}
        <div className="grid grid-cols-5 gap-0 border-t border-black">
          <div className="col-span-2 border-r border-black px-2 py-1">
            <Label>Date/Time:</Label>
            <DataField
              value={
                activityDT.date ? `${activityDT.date}  ${activityDT.time}` : ""
              }
            />
          </div>
          <div className="col-span-3 px-2 py-1">
            <Label>Date/Time for Cancellation:</Label>
            <DataField
              value={
                cancellationDT.date
                  ? `${cancellationDT.date}  ${cancellationDT.time}`
                  : ""
              }
            />
          </div>
        </div>
      </div>

      {/* ============ ROW 2: VESSEL TYPE / REGISTRATION (thick bottom) ============ */}
      <div className="form-section grid grid-cols-2 gap-0 border-x border-black">
        {/* LEFT: Vessel Type + Name */}
        <div className="border-r border-black">
          <div
            className="grid gap-0 border-t border-black"
            style={{
              gridTemplateColumns: "50px 0.8fr 0.7fr 0.95fr 1.15fr 1.25fr 0.9fr",
            }}
          >
            <div className="border-r border-black px-1 py-2 flex items-center justify-center text-[10px] font-bold">
              Type:
            </div>
            {VESSEL_TYPES.map((type, idx) => {
              const selected = form.vesselType === type.value;
              return (
                <div
                  key={type.value}
                  className={`px-1.5 py-2 flex items-center justify-center text-center text-[8.5px] leading-[1.15] whitespace-pre-line min-h-[38px] ${
                    idx < VESSEL_TYPES.length - 1 ? "border-r border-black" : ""
                  } ${selected ? "bg-gray-200 font-bold" : "font-normal"}`}
                  style={{ WebkitPrintColorAdjust: "exact" }}
                >
                  {type.label}
                </div>
              );
            })}
          </div>
          <div className="border-t border-black px-2 py-1">
            <Label>Vessel&apos;s Name:</Label>
            <DataField value={form.vesselName} />
          </div>
        </div>

        {/* RIGHT: Registration No / P/C + Local Agency */}
        <div className="border-t border-black px-2 py-1 flex flex-col gap-2">
          <div className="flex items-end gap-4">
            <div className="flex-[1.4]">
              <Label>Registration No.:</Label>
              <DataField value={form.registrationNo} />
            </div>
            <div className="flex-1">
              <Label>P/C:</Label>
              <DataField value={form.pcNo} />
            </div>
          </div>
          <div>
            <Label>Local Agency:</Label>
            <DataField value={form.localAgency} />
          </div>
        </div>
      </div>
      {/* THICK DIVIDER */}
      <div className="border-x border-black border-b-[3px] border-black" />

      {/* ============ ROW 3: PILOT OPS + BERTH/MOORED ============ */}
      <div className="form-section grid grid-cols-2 gap-0 border-x border-black border-b border-black">
        {/* LEFT: Pilot Boarding / Disembarkation */}
        <div className="grid grid-cols-2 gap-0 border-r border-black">
          <div className="border-r border-black px-2 py-1">
            <Label>Pilot Boarding</Label>
            <div className="mb-1">
              <div className="text-[9px] font-bold">Date:</div>
              <DataField value={boardingDT.date} />
            </div>
            <div>
              <div className="text-[9px] font-bold">Time:</div>
              <DataField value={boardingDT.time} />
            </div>
          </div>
          <div className="px-2 py-1">
            <Label>Pilot Disembarkation</Label>
            <div className="mb-1">
              <div className="text-[9px] font-bold">Date:</div>
              <DataField value={disembarkationDT.date} />
            </div>
            <div>
              <div className="text-[9px] font-bold">Time:</div>
              <DataField value={disembarkationDT.time} />
            </div>
          </div>
        </div>

        {/* RIGHT: Berth/Side + Unmoored/Moored */}
        <div className="grid grid-cols-2 gap-0">
          <div className="border-r border-black px-2 py-1">
            <Label>Berth / Side</Label>
            <DataField value={form.berthSide} />
          </div>
          <div className="grid grid-cols-2 gap-0">
            <div className="border-r border-black px-2 py-1">
              <div className="text-[9px] font-bold mb-[2px]">Unmoored</div>
              <div className="mb-1">
                <div className="text-[8px] font-bold">Time:</div>
                <DataField value={unmooredDT.time} />
              </div>
              <div>
                <div className="text-[8px] font-bold">Place:</div>
                <DataField value={form.unmooredPlace} />
              </div>
            </div>
            <div className="px-2 py-1">
              <div className="text-[9px] font-bold mb-[2px]">Moored</div>
              <div className="mb-1">
                <div className="text-[8px] font-bold">Time:</div>
                <DataField value={mooredDT.time} />
              </div>
              <div>
                <div className="text-[8px] font-bold">Place:</div>
                <DataField value={form.mooredPlace} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ ROW 4: EXTRA PILOTAGE / CRAFTS HEADER ============ */}
      <div className="form-section grid grid-cols-2 gap-0 border-x border-black">
        <div className="border-r border-black px-2 py-1">
          <div className="flex items-center gap-3 mb-1">
            <div className="text-[10px] font-bold">Extra Pilotage</div>
            <label className="flex items-center gap-1 text-[9px]">
              <FormCheckbox checked={!!form.isExtraPilotageNight} />
              <span>Night</span>
            </label>
            <label className="flex items-center gap-1 text-[9px]">
              <FormCheckbox checked={!!form.isExtraPilotageHoliday} />
              <span>Holiday</span>
            </label>
          </div>
          <div>
            <Label>Dispensation (if any):</Label>
            <DataField value={form.dispensation} />
          </div>
        </div>
        <div className="px-2 py-1 flex items-end">
          <div className="text-[10px] font-bold">Crafts Used</div>
        </div>
      </div>
      {/* THICK DIVIDER */}
      <div className="border-x border-black border-b-[3px] border-black" />

      {/* ============ ROW 5: CARGO (left) / CRAFTS TABLE (right) ============ */}
      <div className="form-section grid grid-cols-2 gap-0 border-x border-black">
        {/* LEFT SECTION: Cargo & Measurements */}
        <div className="border-r border-black">
          <div className="grid grid-cols-2 gap-0 border-b border-black">
            <div className="border-r border-black px-2 py-1">
              <Label>L.O.A.:</Label>
              <DataField value={form.loa} unit="m" />
            </div>
            <div className="px-2 py-1">
              <Label>Beam:</Label>
              <DataField value={form.beam} unit="m" />
            </div>
          </div>

          <div className="form-section grid grid-cols-3 gap-0 border-b border-black">
            <div className="border-r border-black px-2 py-1">
              <Label>GT:</Label>
              <DataField value={form.gt} />
            </div>
            <div className="border-r border-black px-2 py-1">
              <Label>NT:</Label>
              <DataField value={form.nt} />
            </div>
            <div className="px-2 py-1">
              <Label>DWT:</Label>
              <DataField value={form.dwt} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0 border-b border-black">
            <div className="border-r border-black px-2 py-1">
              <Label>Draft (Fwd):</Label>
              <DataField value={form.draftFwd} unit="m" />
            </div>
            <div className="px-2 py-1">
              <Label>Draft (Aft):</Label>
              <DataField value={form.draftAft} unit="m" />
            </div>
          </div>

          {/* Cargo table */}
          <div className="border-b border-black">
            <div className="grid grid-cols-[1.5fr_1fr] gap-0 border-b border-black items-center">
              <div className="border-r border-black px-2 py-1 text-[10px] font-bold">
                Cargo for Port Qasim
              </div>
              <div className="px-2 py-1">
                <DataField value={form.cargoPQ} unit="MTS" />
              </div>
            </div>
            <div className="grid grid-cols-[1.5fr_1fr] gap-0 border-b border-black items-center">
              <div className="border-r border-black px-2 py-1 text-[10px] font-bold">
                Deck Cargo
              </div>
              <div className="px-2 py-1">
                <DataField value={form.deckCargo} unit="MTS" />
              </div>
            </div>
            <div className="grid grid-cols-[1.5fr_1fr] gap-0 border-b border-black items-center">
              <div className="border-r border-black px-2 py-1 text-[10px] font-bold">
                DG
              </div>
              <div className="px-2 py-1">
                <DataField value={form.dgCargo} unit="MTS" />
              </div>
            </div>
            <div className="grid grid-cols-[1.5fr_1fr] gap-0 items-center">
              <div className="border-r border-black px-2 py-1 text-[10px] font-bold">
                Total Cargo
              </div>
              <div className="px-2 py-1">
                <DataField value={form.totalCargo} unit="MTS" />
              </div>
            </div>
          </div>

          {/* DG Declarations */}
          <div>
            <div className="grid grid-cols-[1fr_46px_46px] gap-0 border-b border-black items-center px-2 py-[6px]">
              <div className="text-[9px] pr-1">
                Any abnormal rise in temperature of DG spaces
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <span className="text-[8px] font-bold">Yes</span>
                <FormCheckbox checked={form.abnormalTempRiseDG === true} />
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <span className="text-[8px] font-bold">No</span>
                <FormCheckbox checked={form.abnormalTempRiseDG === false} />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_46px_46px] gap-0 border-b border-black items-center px-2 py-[6px]">
              <div className="text-[9px] pr-1">
                Any leakage of liquid dangerous cargo in hold
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <span className="text-[8px] font-bold">Yes</span>
                <FormCheckbox checked={form.leakageLiquidDG === true} />
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <span className="text-[8px] font-bold">No</span>
                <FormCheckbox checked={form.leakageLiquidDG === false} />
              </div>
            </div>

            <div className="grid grid-cols-[1fr_46px_46px] gap-0 items-center px-2 py-[6px]">
              <div className="text-[9px] pr-1">Stowage plan of DG attached</div>
              <div className="flex items-center justify-center gap-[3px]">
                <span className="text-[8px] font-bold">Yes</span>
                <FormCheckbox checked={form.stowagePlanDGAttached === true} />
              </div>
              <div className="flex items-center justify-center gap-[3px]">
                <span className="text-[8px] font-bold">No</span>
                <FormCheckbox checked={form.stowagePlanDGAttached === false} />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SECTION: Crafts Used Table â€” exactly 10 rows */}
        <div>
          <div className="form-section grid grid-cols-3 gap-0 border-b border-black">
            <div className="border-r border-black px-2 py-1 text-center font-bold text-[10px]">
              Name
            </div>
            <div className="border-r border-black px-2 py-1 text-center font-bold text-[10px]">
              From
            </div>
            <div className="px-2 py-1 text-center font-bold text-[10px]">
              To
            </div>
          </div>

          {CRAFT_ROWS.map((craftName, idx) => {
            const craftData = form.craftsUsed?.[idx];
            return (
              <div
                key={idx}
                className="form-section grid grid-cols-3 gap-0 border-b border-black"
              >
                <div className="border-r border-black px-2 py-1 text-[10px] font-bold">
                  {craftData?.craftName || craftName}
                </div>
                <div className="border-r border-black px-2 py-1">
                  <DataText value={craftData?.fromLocation} />
                </div>
                <div className="px-2 py-1">
                  <DataText value={craftData?.toLocation} />
                </div>
              </div>
            );
          })}

          {/* Additional Remarks */}
          <div className="px-2 py-1 min-h-[40px]">
            <div className="text-[10px] font-bold mb-1">
              Additional Remarks:
            </div>
            <div className="text-[12px] leading-[1.3] text-cyan-600 font-bold">
              {form.additionalRemarks || ""}
            </div>
          </div>
        </div>
      </div>

      {/* ============ ROW 6: DECLARATIONS & SIGNATURES ============ */}
      <div className="form-section grid grid-cols-2 gap-0 border border-black min-h-[220px]">
        {/* LEFT: Master Declaration */}
        <div className="border-r border-black flex flex-col">
          <div className="p-2 pb-6">
            <div className="text-[9px] font-bold italic leading-[1.3] mb-4">
              I declare that the above are true and correct to the best of my
              knowledge.
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[9px] font-bold">Date:</span>
              <DataField
                value={
                  form.masterSignedAt
                    ? new Date(form.masterSignedAt).toLocaleDateString("en-US")
                    : form.createdAt
                      ? new Date(form.createdAt).toLocaleDateString("en-US")
                      : ""
                }
              />
            </div>
          </div>

          <div className="signature-block flex-1 flex flex-col border-t border-black pt-2 px-2 pb-2 min-h-[80px]">
            <div className="text-[10px] font-bold text-black mb-1">
              Master&apos;s Signature
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[50px]">
              {form.isMasterSigned && form.masterSignature ? (
                <img
                  src={form.masterSignature}
                  alt="Master Signature"
                  className="max-h-[50px] object-contain max-w-full print:max-h-[50px]"
                />
              ) : (
                <span className="text-transparent">____</span>
              )}
            </div>
            {form.masterName ? (
              <div className="text-center font-bold text-[10px] text-cyan-600 border-t border-black pt-1 px-4 mt-1 mx-4">
                {form.masterName}
              </div>
            ) : (
              <div className="border-t border-black mt-1 mx-4"></div>
            )}
          </div>
        </div>

        {/* RIGHT: Ship's Stamp + Pilot Signature */}
        <div className="flex flex-col">
          <div className="p-2 border-b border-black">
            <div className="border-2 border-black relative min-h-[90px] flex items-center justify-center overflow-hidden">
              {form.shipStampImage ? (
                <img
                  src={form.shipStampImage}
                  alt="Ship Stamp"
                  className="absolute inset-0 w-full h-full object-contain print:object-contain"
                />
              ) : (
                <span className="text-[10px] text-gray-400 italic text-center absolute inset-0 flex items-center justify-center">
                  Ship&apos;s Stamp
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col p-2 gap-2">
            <div className="text-[9px] italic leading-[1.3]">
              I/We confirm the above contents are correct to the best of our knowledge.
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-[9px] font-bold">Date:</span>
              <DataField
                value={
                  form.pilotSignedAt
                    ? new Date(form.pilotSignedAt).toLocaleDateString("en-US")
                    : form.updatedAt
                      ? new Date(form.updatedAt).toLocaleDateString("en-US")
                      : ""
                }
              />
            </div>

            <div className="signature-block flex-1 border-t border-black pt-2 min-h-[50px] flex flex-col">
              <div className="text-[10px] font-bold text-black">
                Pilot&apos;s Signature
              </div>
              <div className="flex-1 flex items-center justify-center">
                {(form.isDeclared || form.pilotSignedAt) && (
                  <span
                    className="text-cyan-600 font-bold text-[11px] italic"
                    style={{ WebkitPrintColorAdjust: "exact" }}
                  >
                    Signed Electronically via Portal
                  </span>
                )}
              </div>
            </div>

            <div className="signature-block flex-1 flex items-end relative min-h-[40px]">
              <div className="absolute top-1 right-1 text-center">
                <span className="text-[9px] font-bold block mb-1">
                  Countersigned by HM / DM
                </span>
              </div>
              <div className="w-full border-t border-black pt-1 flex justify-center text-center items-end gap-2">
                {form.status === "APPROVED" &&
                  (form.hmDmSignature || form.hmDmUser?.signatureImage) ? (
                  <img
                    src={form.hmDmSignature || form.hmDmUser?.signatureImage || ""}
                    alt="Admin Signature"
                    className="max-h-[30px] object-contain print:max-h-[30px]"
                  />
                ) : null}
                {form.status === "APPROVED" && form.hmDmSignedAt && (
                  <div className="text-[9px] text-cyan-600 font-bold flex flex-col justify-end">
                    <span>{form.hmDmUser?.name || "HM / DM"}</span>
                    <span className="text-[8px] font-normal">
                      {new Date(form.hmDmSignedAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ DISTRIBUTION LIST (Screen Only) ============ */}
      <div className="no-print text-[9px] font-bold mt-3 pt-2 border-t-2 border-black">
        <div className="mb-[6px]">Distribution:</div>
        <div className="grid grid-cols-2 gap-1 text-[8px]">
          <div>1- White : Copy for Manager (Revenue)</div>
          <div>2- Yellow : Copy for Deputy Conservator</div>
          <div>3- Green : Copy for Director (Cargo Ops)</div>
          <div>4- Blue : Copy for Harbour Master</div>
          <div>5- Pink : Copy for Pilot</div>
        </div>
      </div>
    </div>
  );
}
