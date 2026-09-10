import { db } from "@repo/db";
import { AuditService } from "../audit/audit.service";

// Use Prisma's generated enum for the status types
import { FormStatus } from "@prisma/client";

export class AdminFormService {
  
  // 1. Get all forms (System-wide view for Admin)
  public static async getAllForms() {
    return db.pilotForm.findMany({
      select: {
        id: true, serialNo: true, status: true, activityType: true,
        activityDateTime: true, vesselName: true, vesselType: true,
        createdAt: true, updatedAt: true,
        pilot: { select: { name: true, email: true } },
        // signature/stamp fields intentionally omitted from list view
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
    const result = await db.pilotForm.update({
      where: { id: formId },
      data: updateData,
      include: {
        pilot: { select: { name: true, email: true } },
      },
    });

    // Write audit log
    if (adminUserId) {
      await AuditService.log(
        newStatus === "APPROVED" ? "FORM_APPROVED" : "FORM_REJECTED",
        adminUserId,
        "PilotForm",
        formId,
        { previousStatus: existingForm.status, newStatus, rejectionReason }
      );
    }

    return result;
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

  public static async addRemark(formId: string, authorId: string, message: string) {
    const form = await db.pilotForm.findUnique({ where: { id: formId } });
    if (!form) throw new Error("Form not found");

    return db.adminRemark.create({
      data: { formId, authorId, message },
      include: { author: { select: { name: true, email: true } } },
    });
  }

  public static async getRemarks(formId: string) {
    return db.adminRemark.findMany({
      where: { formId },
      include: { author: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  // 4. Advanced filtering (extends getAllForms)
  public static async getFilteredForms(filters: {
    status?: FormStatus;
    vesselType?: string;
    activityType?: string;
    fromDate?: Date;
    toDate?: Date;
    search?: string; // matches vesselName, serialNo, pilot name
  }) {
    return db.pilotForm.findMany({
      where: {
        status: filters.status,
        vesselType: filters.vesselType as any,
        activityType: filters.activityType as any,
        createdAt: {
          gte: filters.fromDate,
          lte: filters.toDate,
        },
        OR: filters.search
          ? [
              { vesselName: { contains: filters.search, mode: "insensitive" } },
              { serialNo: { contains: filters.search, mode: "insensitive" } },
              { pilot: { name: { contains: filters.search, mode: "insensitive" } } },
            ]
          : undefined,
      },
      select: {
        id: true, serialNo: true, status: true, activityType: true,
        activityDateTime: true, vesselName: true, vesselType: true,
        createdAt: true, updatedAt: true,
        pilot: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // 5. Bulk approval
  public static async bulkUpdateStatus(
    formIds: string[],
    newStatus: "APPROVED" | "REJECTED",
    adminUserId: string,
    rejectionReason?: string
  ) {
    const data: Parameters<typeof db.pilotForm.update>[0]["data"] = { status: newStatus };
    if (newStatus === "APPROVED") {
      data.hmDmUserId = adminUserId;
      data.hmDmSignedAt = new Date();
    }
    if (newStatus === "REJECTED") {
      data.rejectionReason = rejectionReason ?? null;
    }

    const result = await db.pilotForm.updateMany({
      where: { id: { in: formIds }, status: "SUBMITTED" }, // guard: only act on pending forms
      data,
    });

    // Write audit logs for bulk action
    for (const id of formIds) {
      await AuditService.log(
        newStatus === "APPROVED" ? "FORM_APPROVED" : "FORM_REJECTED",
        adminUserId,
        "PilotForm",
        id,
        { bulk: true, newStatus, rejectionReason }
      );
    }

    return { updatedCount: result.count };
  }
}
