import { z } from "zod";
import { Prisma } from "@prisma/client";

export type PilotFormWithRelations = Prisma.PilotFormGetPayload<{
  include: { 
    craftsUsed: true; 
    pilot: { select: { name: true; email: true } };
    hmDmUser: { select: { name: true; signatureImage: true } };
  }
}>;

// Enums matching Prisma
const ActivityTypeEnum = z.enum(["ARRIVAL", "DEPARTURE", "SHIFTING", "SWINGING", "CANCELLATION"]);
const VesselTypeEnum = z.enum(["LNGC", "LPG", "TANKER", "CONTAINER", "BULK_CARRIER", "OTHERS"]);
const CraftTypeEnum = z.enum(["PILOT_BOAT", "TUG", "MOORING_BOAT", "ESCORTING_TUG"]);

// Accepts either a real boolean (JSON body / default values) or the
// "true"/"false" string a native <RadioGroup> reports, and normalizes
// both to a boolean. Lets the frontend keep radio values as strings
// without a manual setValueAs on every field.

const requiredDate = (errorMsg: string) => z.preprocess(
  (arg) => {
    if (arg === "" || arg === null || arg === undefined) return arg;
    return new Date(arg as string | number | Date);
  },
  z.custom<Date>((val) => val instanceof Date && !isNaN(val.getTime()), errorMsg)
);

// z.coerce.number() runs Number(arg) under the hood (so it still accepts a
// stray numeric string from an old localStorage draft or a raw form value),
// but — unlike the old z.preprocess + z.custom<number> combo — it's a real
// Zod number type: NaN, "", null and undefined are all rejected up front by
// the base type check, and .positive()/.nonnegative() reject bad magnitudes.
// The same errorMsg is used for both the type check and the range check so
// "missing" and "invalid" collapse into one clear message.
const requiredPositiveNumber = (errorMsg: string) =>
  z.coerce.number({ error: errorMsg }).positive({ error: errorMsg });

const requiredNonNegativeNumber = (errorMsg: string) =>
  z.coerce.number({ error: errorMsg }).nonnegative({ error: errorMsg });

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
    serialNo: z.string().optional(),

    // General Info
    activityType: ActivityTypeEnum,
    activityDateTime: requiredDate("Please select an activity date and time"),
    cancellationDateTime: z.coerce.date().optional().nullable(),

    // Vessel Details
    vesselType: VesselTypeEnum,
    vesselName: z.string().min(1, "Vessel name is required"),
    registrationNo: z.string().min(1, "Registration No is required"),
    pcNo: z.string().optional().nullable(),
    localAgency: z.string().min(1, "Local agency is required"),

    // Pilotage & Berthing
    boardingDate: requiredDate("Please select the boarding date and time"),
    disembarkationDate: requiredDate("Please select the disembarkation date and time"),
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
    loa: requiredPositiveNumber("LOA must be a positive number"),
    beam: requiredPositiveNumber("Beam must be a positive number"),
    gt: requiredPositiveNumber("GT must be a positive number"),
    nt: requiredPositiveNumber("NT must be a positive number"),
    dwt: requiredPositiveNumber("DWT must be a positive number"),
    draftFwd: requiredPositiveNumber("Forward Draft must be a positive number"),
    draftAft: requiredPositiveNumber("Aft Draft must be a positive number"),

    // Cargo Details
    cargoPQ: requiredNonNegativeNumber("Cargo cannot be negative"),
    deckCargo: requiredNonNegativeNumber("Deck Cargo cannot be negative"),
    dgCargo: requiredNonNegativeNumber("DG Cargo cannot be negative"),
    totalCargo: requiredNonNegativeNumber("Total Cargo cannot be negative"),

    // Safety — stored as booleans in Prisma, but the Step 4 <RadioGroup>
    // reports "true"/"false" strings, so these coerce either shape.
    abnormalTempRiseDG: booleanFromRadio,
    leakageLiquidDG: booleanFromRadio,
    stowagePlanDGAttached: booleanFromRadio,

    additionalRemarks: z.string().optional().nullable(),

    isDeclared: z.boolean().default(false).optional(),

    // Nested Relation
    craftsUsed: z.array(craftUsageSchema).optional(),
  });

export type CreatePilotFormInput = z.infer<typeof createPilotFormSchema>;

// Schema for the Pilot's final submission (declaration + pilot + master signatures)
export const submitFormSchema = z
  .object({
    isDeclared: z.literal(true, "You must declare the form contents are correct."),
    pilotSignatureImage: z.string().min(1, "Your signature is required"), // Pilot's own signature snapshot
    masterSignature: z.string().min(1, "Master signature is required"),
    masterName: z.string().min(1, "Master name is required"),
    shipStampImage: z.string().min(1, "Ship stamp image is required"),
  })
  .strict();

export type SubmitFormInput = z.infer<typeof submitFormSchema>;
