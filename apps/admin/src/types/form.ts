// apps/admin/src/types/form.ts
// ============================================================
// TRUE DATA CONTRACT — mirrors packages/db/prisma/schema.prisma
// `model PilotForm` + `CraftUsage` relation, field-for-field.
// The API at GET /api/forms/[id] returns this exact shape via
// AdminFormService.getFormById(), which uses Prisma's include
// to attach `pilot` and `craftsUsed`.
// ============================================================

export interface CraftUsageRecord {
  craftType?: "PILOT_BOAT" | "TUG" | "MOORING_BOAT" | "ESCORTING_TUG";
  craftName?: string;
  fromLocation?: string;
  toLocation?: string;
}

export interface PilotFormRecord {
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

  // 9. Rejection
  rejectionReason?: string | null;

  // 10. Pilot relation (included by AdminFormService)
  pilot?: { name?: string | null; email?: string };

  createdAt: string;
  updatedAt: string;
}

export interface FormApiResponse {
  success: boolean;
  data: PilotFormRecord;
  message?: string;
}
