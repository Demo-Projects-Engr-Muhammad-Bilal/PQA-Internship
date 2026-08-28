import { z } from "zod";

// Enums matching Prisma
const ActivityTypeEnum = z.enum(["ARRIVAL", "DEPARTURE", "SHIFTING", "SWINGING", "CANCELLATION"]);
const VesselTypeEnum = z.enum(["LNGC", "LPG", "TANKER", "CONTAINER", "BULK_CARRIER", "OTHERS"]);
const CraftTypeEnum = z.enum(["PILOT_BOAT", "TUG", "MOORING_BOAT", "ESCORTING_TUG"]);

// Accepts either a real boolean (JSON body / default values) or the
// "true"/"false" string a native <RadioGroup> reports, and normalizes
// both to a boolean. Lets the frontend keep radio values as strings
// without a manual setValueAs on every field.
const booleanFromRadio = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true")
  .default(false);

// Craft Usage Schema (Array element)
export const craftUsageSchema = z.object({
  craftType: CraftTypeEnum,
  craftName: z.string().min(1, "Craft name is required"),
  fromLocation: z.string().min(1, "From location is required"),
  toLocation: z.string().min(1, "To location is required"),
});

// Main Pilot Form Schema
export const createPilotFormSchema = z
  .object({
    serialNo: z.string().min(1, "Serial number is required"),

    // General Info
    activityType: ActivityTypeEnum,
    activityDateTime: z.coerce.date(),
    cancellationDateTime: z.coerce.date().optional().nullable(),

    // Vessel Details
    vesselType: VesselTypeEnum,
    vesselName: z.string().min(1, "Vessel name is required"),
    registrationNo: z.string().min(1, "Registration No is required"),
    pcNo: z.string().optional().nullable(),
    localAgency: z.string().min(1, "Local agency is required"),

    // Pilotage & Berthing
    boardingDate: z.coerce.date(),
    disembarkationDate: z.coerce.date(),
    berthSide: z.string().optional().nullable(),
    unmooredDate: z.coerce.date().optional().nullable(),
    unmooredPlace: z.string().optional().nullable(),
    mooredDate: z.coerce.date().optional().nullable(),
    mooredPlace: z.string().optional().nullable(),

    // Extra Pilotage
    isExtraPilotageNight: z.boolean().default(false),
    isExtraPilotageHoliday: z.boolean().default(false),
    dispensation: z.string().optional().nullable(),

    // Vessel Dimensions
    loa: z.number().positive(),
    beam: z.number().positive(),
    gt: z.number().positive(),
    nt: z.number().positive(),
    dwt: z.number().positive(),
    draftFwd: z.number().positive(),
    draftAft: z.number().positive(),

    // Cargo Details
    cargoPQ: z.number().min(0),
    deckCargo: z.number().min(0),
    dgCargo: z.number().min(0),
    totalCargo: z.number().min(0),

    // Safety — stored as booleans in Prisma, but the Step 4 <RadioGroup>
    // reports "true"/"false" strings, so these coerce either shape.
    abnormalTempRiseDG: booleanFromRadio,
    leakageLiquidDG: booleanFromRadio,
    stowagePlanDGAttached: booleanFromRadio,

    additionalRemarks: z.string().optional().nullable(),

    isDeclared: z.boolean().refine((val) => val === true, {
      message: "You must confirm that the contents are correct to the best of your knowledge.",
    }),

    // Nested Relation
    craftsUsed: z.array(craftUsageSchema).optional(),
  })
  .refine((data) => data.boardingDate >= data.activityDateTime, {
    message: "Boarding date must be on or after the activity date/time",
    path: ["boardingDate"],
  })
  .refine((data) => data.disembarkationDate > data.boardingDate, {
    message: "Disembarkation date must be after the boarding date",
    path: ["disembarkationDate"],
  });

export type CreatePilotFormInput = z.infer<typeof createPilotFormSchema>;
