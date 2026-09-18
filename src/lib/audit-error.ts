import { prisma } from "@/lib/prisma";

/**
 * Prisma error classification helper (shared by Feature #5+ API routes).
 *
 * Uses structural detection instead of importing Prisma runtime classes so it
 * stays decoupled from client-generator version churn: every
 * PrismaClientKnownRequestError carries a stable string `code` (e.g. "P2002"
 * for a unique-constraint violation).
 *
 * When `audit` metadata is supplied and the error matches, the classified
 * failure is written to the AuditLog trail. The audit write is fail-safe: a
 * broken audit path must never mask the original error handling.
 */

export type AuditMeta = {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
};

export function isPrismaRequestError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string" &&
    (error as { code: string }).code === code
  );
}

/**
 * Returns true when `error` is a Prisma request error with the given code,
 * optionally recording the classified failure in the audit trail.
 */
export async function auditError(
  error: unknown,
  code: string,
  audit?: AuditMeta
): Promise<boolean> {
  const matches = isPrismaRequestError(error, code);

  if (matches && audit) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: audit.userId ?? null,
          action: audit.action,
          entity: audit.entity,
          entityId: audit.entityId ?? null,
          details: audit.details ?? `Prisma error ${code}`,
        },
      });
    } catch (auditFailure) {
      // Never let audit bookkeeping mask the caller's original error path.
      console.error("auditError: failed to persist audit log", auditFailure);
    }
  }

  return matches;
}
