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

  // 2. Update form status (Approve / Reject)
  public static async updateFormStatus(formId: string, newStatus: FormStatus) {
    const existingForm = await db.pilotForm.findUnique({
      where: { id: formId }
    });

    if (!existingForm) {
      throw new Error("Form not found");
    }

    

    // Update strictly the status, leaving all pilot-submitted data untouched
    return db.pilotForm.update({
      where: { id: formId },
      data: { status: newStatus },
      include: {
        pilot: { select: { name: true, email: true } }
      }
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