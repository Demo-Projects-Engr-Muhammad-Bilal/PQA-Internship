import { db } from "@repo/db";

// Use Prisma's generated enum for the status types
import { FormStatus } from "@prisma/client";

export class AdminFormService {
  
  // 1. Get all forms (System-wide view for Admin)
  public static async getAllForms() {
    return db.pilotForm.findMany({
      include: {
        pilot: { select: { name: true, email: true } },
        craftsUsed: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Update form status (Approve / Reject) — stamps HM/DM fields on approval
  public static async updateFormStatus(
    formId: string,
    newStatus: FormStatus,
    adminUserId?: string,
    rejectionReason?: string
  ) {
    const existingForm = await db.pilotForm.findUnique({
      where: { id: formId },
    });

    if (!existingForm) {
      throw new Error("Form not found");
    }

    // Build dynamic update payload
    const updateData: Parameters<typeof db.pilotForm.update>[0]["data"] = {
      status: newStatus,
    };

    if (newStatus === "APPROVED" && adminUserId) {
      updateData.hmDmUserId    = adminUserId;
      updateData.hmDmSignedAt  = new Date();
    }

    if (newStatus === "REJECTED") {
      updateData.rejectionReason = rejectionReason ?? null;
    }

    // Update strictly the status + approval fields, leaving pilot data untouched
    return db.pilotForm.update({
      where: { id: formId },
      data: updateData,
      include: {
        pilot: { select: { name: true, email: true } },
      },
    });
  }

  // 3. Get single form details for Admin Review
  public static async getFormById(formId: string) {
    const form = await db.pilotForm.findUnique({
      where: { id: formId },
      include: {
        pilot: { select: { name: true, email: true } },
        craftsUsed: true,
      },
    });

    if (!form) {
      throw new Error("Form not found");
    }

    return form;
  }
}
