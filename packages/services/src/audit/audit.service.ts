import { db } from "@repo/db";
import { AuditAction, Prisma } from "@prisma/client";

export class AuditService {
  /**
   * Logs an action to the immutable audit_logs table.
   */
  public static async log(
    action: AuditAction,
    userId?: string,
    entityType?: string,
    entityId?: string,
    metadata?: Record<string, any>
  ) {
    try {
      await db.auditLog.create({
        data: {
          action,
          userId,
          entityType,
          entityId,
          metadata: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch (error) {
      console.error("[AuditService] Failed to write audit log:", error);
      // In high-security systems, you might want to throw here to fail the parent transaction
    }
  }

  /**
   * Fetch logs for the admin dashboard
   */
  public static async getLogs(limit = 100) {
    return db.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
      },
    });
  }
}
