import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "USER_CREATED"
  | "USER_ROLE_CHANGED"
  | "USER_DELETED"
  | "STUDENT_PROGRESS_RESET";

export async function logAdminAction(
  actorId: string,
  action: AuditAction,
  targetId?: string,
  details?: string
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        targetId: targetId ?? null,
        details: details ?? null,
      },
    });
  } catch (error) {
    console.error("[audit-log]", action, error);
  }
}