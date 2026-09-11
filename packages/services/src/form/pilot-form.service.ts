import { db } from "@repo/db";
import { Prisma } from "@prisma/client";
import { CreatePilotFormInput, SubmitFormInput } from "@repo/types";

export class PilotFormService {
  
  // 1. Create a new Form
  public static async createForm(pilotId: string, input: CreatePilotFormInput) {
    // craftsUsed ko alag nikal lein taake Prisma query theek se banay
    const { craftsUsed, ...formData } = input;
  try {
      // Auto-generate serialNo
      let newSerialNo = "55000";
      const lastForm = await db.pilotForm.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { serialNo: true }
      });
      if (lastForm && lastForm.serialNo) {
        const parsed = parseInt(lastForm.serialNo, 10);
        if (!isNaN(parsed)) {
          newSerialNo = (parsed + 1).toString();
        }
      }

      const form = await db.pilotForm.create({
        data: {
            ...formData,
            serialNo: newSerialNo,
          pilotId,
          status: "DRAFT",
          craftsUsed: craftsUsed ? {
            create: craftsUsed
          } : undefined,
        },
        include: {
          craftsUsed: true
        }
      });

      return form;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new Error(`Serial number '${input.serialNo}' already exists.`);
      }
      throw error;
    }
  }

  // 2. Get All Forms for Logged In Pilot
  public static async getMyForms(pilotId: string) {
    return db.pilotForm.findMany({
      where: { pilotId },
      include: { craftsUsed: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // 3. Get Single Form Details (Ensure pilot owns it)
  public static async getFormById(formId: string, pilotId: string) {
    const form = await db.pilotForm.findUnique({
      where: { id: formId },
      include: {
        pilot: { select: { name: true, email: true } },
        craftsUsed: true,
      },
    });

    if (!form || form.pilotId !== pilotId) {
      throw new Error("Form not found or access denied");
    }

    return form;
  }

  // 4. Update an Existing Form (Pilot)
  public static async updateForm(pilotId: string, formId: string, input: CreatePilotFormInput) {
    const { craftsUsed, ...formData } = input;

    // Fetch existing form to verify ownership and check its status
    const existingForm = await db.pilotForm.findUnique({
      where: { id: formId }
    });

    if (!existingForm || existingForm.pilotId !== pilotId) {
      throw new Error("Form not found or access denied");
    }

    // STRICT LOCKING BOUNDARY: Prevent modifications if already approved
    if (existingForm.status === "APPROVED") {
      throw new Error("Cannot update an approved form. This record is locked.");
    }

    // Use a transaction to safely update the form and replace its nested crafts
    return db.$transaction(async (tx) => {
      // Clear out the old crafts grid
      await tx.craftUsage.deleteMany({
        where: { formId }
      });

      // Update the main form data and insert the newly provided crafts
      return tx.pilotForm.update({
        where: { id: formId },
        data: {
          ...formData,
          craftsUsed: craftsUsed ? {
            create: craftsUsed
          } : undefined,
        },
        include: {
          craftsUsed: true
        }
      });
    });
  }

  // 5. Submit Form — Pilot's final declaration with Master signatures
  public static async submitForm(
    formId: string,
    pilotId: string,
    payload: SubmitFormInput,
    ip: string
  ) {
    // Verify ownership and eligible status
    const existingForm = await db.pilotForm.findUnique({
      where: { id: formId },
    });

    if (!existingForm || existingForm.pilotId !== pilotId) {
      throw new Error("Form not found or access denied");
    }

    if (existingForm.status !== "DRAFT" && existingForm.status !== "REJECTED") {
      throw new Error(
        `Form cannot be submitted from its current status: ${existingForm.status}`
      );
    }

    // Stamp all signature + submission fields
    return db.pilotForm.update({
      where: { id: formId },
      data: {
        isDeclared: true,
        pilotSignedAt: new Date(),
        pilotSignatureIp: ip,
        pilotSignatureImage: payload.pilotSignatureImage, // NEW
        isMasterSigned: true,
        masterSignature: payload.masterSignature,
        masterSignedAt: new Date(),
        masterName: payload.masterName,
        shipStampImage: payload.shipStampImage,
        status: "SUBMITTED",
      },
      include: {
        craftsUsed: true,
        pilot: { select: { name: true, email: true } },
      },
    });
  }

}
