"use client";

import { FormCheckbox } from "@/components/FormCheckbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState } from "react";

/* ============================================================
   TRUE DATA CONTRACT — mirrors packages/db/prisma/schema.prisma
   `model PilotForm` + `CraftUsage` field-for-field. Do NOT import
   the stale `@/types/form` PilotForm type here — it uses renamed
   fields (pic, cargoForPortQasim, unmooredTime, ...) that the API
   never actually returns. Update apps/pilot/src/types/form.ts to
   match this shape.
   ============================================================ */

interface CraftUsageRecord {
  craftType?: "PILOT_BOAT" | "TUG" | "MOORING_BOAT" | "ESCORTING_TUG";
  craftName?: string;
  fromLocation?: string;
  toLocation?: string;
}

interface PilotFormRecord {
  id: string;
  serialNo: string;
  pilotId?: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

  // 1. General Info
  activityType: "ARRIVAL" | "DEPARTURE" | "SHIFTING" | "SWINGING" | "CANCELLATION";
  activityDateTime?: string;
  cancellationDateTime?: string | null;

  // 2. Vessel Details
  vesselType?: "LNGC" | "LPG" | "TANKER" | "CONTAINER" | "BULK_CARRIER" | "OTHERS";
  vesselName?: string;
  registrationNo?: string;
  pcNo?: string | null;
  localAgency?: string;

  // 3. Pilotage & Berthing
  boardingDate?: string;
  disembarkationDate?: string;
  berthSide?: string | null;
  unmooredDate?: string | null;
  unmooredPlace?: string | null;
  mooredDate?: string | null;
  mooredPlace?: string | null;

  // 4. Extra Pilotage
  isExtraPilotageNight?: boolean;
  isExtraPilotageHoliday?: boolean;
  dispensation?: string | null;

  // 5. Vessel Dimensions
  loa?: number;
  beam?: number;
  gt?: number;
  nt?: number;
  dwt?: number;
  draftFwd?: number;
  draftAft?: number;

  // 6. Cargo Details
  cargoPQ?: number;
  deckCargo?: number;
  dgCargo?: number;
  totalCargo?: number;

  // 7. Safety Declarations
  abnormalTempRiseDG?: boolean;
  leakageLiquidDG?: boolean;
  stowagePlanDGAttached?: boolean;

  // 8. Relations & Metadata
  craftsUsed?: CraftUsageRecord[];
  additionalRemarks?: string | null;
  isDeclared?: boolean;
  pilotSignedAt?: string | null;
  pilotSignatureIp?: string | null;
  isMasterSigned?: boolean;
  masterSignature?: string | null;
  masterSignedAt?: string | null;
  masterName?: string | null;
  shipStampImage?: string | null;
  hmDmUserId?: string | null;
  hmDmUser?: { name?: string | null; signatureImage?: string | null } | null;
  hmDmSignature?: string | null;
  hmDmSignedAt?: string | null;

  createdAt: string;
  updatedAt: string;
}

interface FormResponse {
  success: boolean;
  data: PilotFormRecord;
  message?: string;
}

export default function PilotFormDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;
  const { apiClient } = useAuth();

  const [formData, setFormData] = useState<PilotFormRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiClient.get<FormResponse>(
          `/api/forms/${formId}`
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error || "Form not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusStyles: Record<PilotFormRecord["status"], string> = {
    DRAFT: "bg-gray-200 text-gray-700",
    SUBMITTED: "bg-amber-100 text-amber-800",
    APPROVED: "bg-emerald-100 text-emerald-800",
    REJECTED: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-4">
        {/* Action Bar - Hidden on Print */}
        <div className="no-print flex items-center gap-2 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            🖨️ Print Form
          </Button>
          <span
            className={`ml-auto text-[11px] font-semibold px-2 py-1 rounded ${statusStyles[formData.status]}`}
          >
            {formData.status}
          </span>
        </div>

        {/* Form Container — the ONLY thing visible when printing */}
        <div className="print-only-form form-page bg-white text-black">
          <FormContent form={formData} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOCAL DATA-DISPLAY PRIMITIVES
   All dynamic DB values render through DataField / DataText so
   every piece of live data is GUARANTEED `text-cyan-600 font-bold
   text-[12px]` — the isCyan convention, kept intact.
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

/* ========================================================== */

function FormContent({ form }: { form: PilotFormRecord }) {
  const parseDateTime = (dateTimeStr?: string | null) => {
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
      <div className="border-x border-t border-black">
        <div className="flex items-start justify-between px-2 pt-2 pb-1 gap-2">
          {/* Left: Actual logo image — no CSS-drawn box */}
          <div className="w-[92px] h-[64px] flex-shrink-0 flex items-start justify-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pq-logo.png"
              alt="Port Qasim Authority"
              className="h-full w-auto object-contain object-left"
              style={{ WebkitPrintColorAdjust: "exact" }}
            />
          </div>

          {/* Center: Title block — no red "Pilot Form" heading */}
          <div className="flex-1 flex flex-col items-center justify-center px-2">
            <div className="text-[32px] font-bold tracking-wide text-center">
              PORT QASIM AUTHORITY
            </div>
            <div className="text-[10.5px] font-bold tracking-wide text-center mt-[1px]">
              PILOTAGE AND DANGEROUS GOODS DECLARATION
            </div>
          </div>

          {/* Right: Serial Number — now dynamic */}
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
              className={`flex flex-col items-center justify-center gap-1 py-2 ${idx < ACTIVITY_TYPES.length - 1 ? "border-r border-black" : ""
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
      <div className="grid grid-cols-2 gap-0 border-x border-black">
        {/* LEFT: Vessel Type + Name */}
        <div className="border-r border-black">
          {/* Fixed-width label column + weighted type columns — fixes the
              TANKER/CONTAINER/BULK CARRIER cramping from aa.pdf */}
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
                  className={`px-1.5 py-2 flex items-center justify-center text-center text-[8.5px] leading-[1.15] whitespace-pre-line min-h-[38px] ${idx < VESSEL_TYPES.length - 1 ? "border-r border-black" : ""
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

        {/* RIGHT: Registration No / P/C on one line, Local Agency below —
            matches the physical form's single-line layout exactly */}
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
      {/* THICK DIVIDER — below Vessel's Name / Local Agency row */}
      <div className="border-x border-black border-b-[3px] border-black" />

      {/* ============ ROW 3: PILOT OPS + BERTH/MOORED ============ */}
      <div className="grid grid-cols-2 gap-0 border-x border-black border-b border-black">
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

      {/* ============ ROW 4: EXTRA PILOTAGE / CRAFTS HEADER (thick bottom) ============ */}
      <div className="grid grid-cols-2 gap-0 border-x border-black">
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
      {/* THICK DIVIDER — below Dispensation / Crafts Used header row */}
      <div className="border-x border-black border-b-[3px] border-black" />

      {/* ============ ROW 5: CARGO (left) / CRAFTS TABLE (right) ============ */}
      <div className="grid grid-cols-2 gap-0 border-x border-black">
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

          <div className="grid grid-cols-3 gap-0 border-b border-black">
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

          {/* Cargo table — value + "MTS" unit, exactly like the paper form */}
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

          {/* DG Declarations — Yes/No perfectly aligned via fixed-width columns */}
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

        {/* RIGHT SECTION: Crafts Used Table — exactly 10 rows */}
        <div>
          <div className="grid grid-cols-3 gap-0 border-b border-black">
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
                className="grid grid-cols-3 gap-0 border-b border-black"
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
      <div className="grid grid-cols-2 gap-0 border border-black min-h-[220px]">
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

          <div className="flex-1 flex flex-col border-t border-black pt-2 px-2 pb-2 min-h-[80px]">
            {/* Label (Top Left) */}
            <div className="text-[10px] font-bold text-black mb-1">
              Master&apos;s Signature
            </div>
            
            {/* Signature Image (Centered) */}
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
            
            {/* Printed Name & Line (Bottom) */}
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

            <div className="flex-1 border-t border-black pt-2 min-h-[50px] flex flex-col">
              {/* Label (Top Left) */}
              <div className="text-[10px] font-bold text-black">
                Pilot&apos;s Signature
              </div>

              {/* Electronic Signature (Centered) */}
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

            <div className="flex-1 flex items-end relative min-h-[40px]">
              <div className="absolute top-1 right-1 text-center">
                <span className="text-[9px] font-bold block mb-1">Countersigned by HM / DM</span>
              </div>
              <div className="w-full border-t border-black pt-1 flex justify-center text-center items-end gap-2">
                {(form.status === "APPROVED") && (form.hmDmSignature || form.hmDmUser?.signatureImage) ? (
                  <img
                    src={form.hmDmSignature || form.hmDmUser?.signatureImage || ""}
                    alt="Admin Signature"
                    className="max-h-[30px] object-contain print:max-h-[30px]"
                  />
                ) : null}
                {(form.status === "APPROVED") && form.hmDmSignedAt && (
                  <div className="text-[9px] text-cyan-600 font-bold flex flex-col justify-end">
                    <span>{form.hmDmUser?.name || "HM / DM"}</span>
                    <span className="text-[8px] font-normal">{new Date(form.hmDmSignedAt).toLocaleDateString("en-US")}</span>
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
