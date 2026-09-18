import { prisma } from "@/lib/prisma";
import { getCurrentUser, type SessionUser } from "@/lib/auth";

/**
 * Feature #2 - Admin Manual Verification (server-side authorization).
 *
 * Every admin page AND every admin API route calls requireAdmin() itself.
 * Authorization is never inferred from the URL, a component, or client state,
 * so an admin resource can never be reached by relying on a shared matcher.
 */

export type AdminDenialReason = "UNAUTHENTICATED" | "FORBIDDEN";
export type InvestorDenialReason = "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_VERIFIED";

export type AdminAccess =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: AdminDenialReason; user: SessionUser | null };

export type InvestorAccess =
  | { ok: true; user: SessionUser }
  | { ok: false; reason: InvestorDenialReason; user: SessionUser | null };

/** Comma-separated allowlist. Bootstraps the first admin without DB surgery. */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Resolves an admin session, or a typed denial.
 * An email on ADMIN_EMAILS is promoted to role=ADMIN on first use, and the
 * promotion is written to the audit log so the privilege change is traceable.
 */
export async function requireAdmin(): Promise<AdminAccess> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "UNAUTHENTICATED", user: null };
  if (user.role === "ADMIN") return { ok: true, user };

  if (adminEmails().includes(user.email.toLowerCase())) {
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_PROMOTED_TO_ADMIN",
        entity: "User",
        entityId: user.id,
        details: `Promoted to ADMIN via ADMIN_EMAILS allowlist (${user.email})`,
      },
    });
    return { ok: true, user: { ...user, role: "ADMIN" } };
  }

  return { ok: false, reason: "FORBIDDEN", user };
}

/**
 * Resolves an investor session (VERIFIED investors only).
 * Admins are FORBIDDEN from accessing investor-only features like investments.
 * PENDING/REJECTED investors get NOT_VERIFIED.
 */
export async function requireInvestor(): Promise<InvestorAccess> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "UNAUTHENTICATED", user: null };

  // Admins cannot act as investors (role segregation)
  if (user.role === "ADMIN") {
    return { ok: false, reason: "FORBIDDEN", user };
  }

  // Only VERIFIED investors can access investment features
  if (user.role === "INVESTOR" && user.status !== "VERIFIED") {
    return { ok: false, reason: "NOT_VERIFIED", user };
  }

  if (user.role === "INVESTOR" && user.status === "VERIFIED") {
    return { ok: true, user };
  }

  return { ok: false, reason: "FORBIDDEN", user };
}

/**
 * Screen 7: "Unverify button (only if no investments)".
 * The Investment model ships with Feature #5; until then this is vacuously
 * false, and it begins enforcing automatically once that model exists.
 */
export async function userHasInvestments(userId: string): Promise<boolean> {
  const delegate = (
    prisma as unknown as {
      investment?: { count: (args: unknown) => Promise<number> };
    }
  ).investment;
  if (!delegate) return false;
  return (await delegate.count({ where: { userId } })) > 0;
}

export type AdminUserRow = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string | null;
  role: string;
  status: string;
  authSource: string;
  rejectionReason: string | null;
  verifiedAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  balanceKobo: number;
};

type AdminUserRecord = {
  id: string;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string | null;
  role: string;
  status: string;
  authSource: string;
  rejectionReason: string | null;
  verifiedAt: Date | null;
  rejectedAt: Date | null;
  createdAt: Date;
  wallet: { balanceKobo: bigint } | null;
};

function toAdminRow(u: AdminUserRecord): AdminUserRow {
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    status: u.status,
    authSource: u.authSource,
    rejectionReason: u.rejectionReason,
    verifiedAt: u.verifiedAt ? u.verifiedAt.toISOString() : null,
    rejectedAt: u.rejectedAt ? u.rejectedAt.toISOString() : null,
    createdAt: u.createdAt.toISOString(),
    balanceKobo: u.wallet ? Number(u.wallet.balanceKobo) : 0,
  };
}

/** Investors only - admin accounts are never part of the verification queue. */
export async function listUsers(status?: string): Promise<AdminUserRow[]> {
  const users = await prisma.user.findMany({
    where: {
      role: "INVESTOR",
      ...(status ? { status } : {}),
    },
    include: { wallet: true },
    orderBy: [{ createdAt: "asc" }],
  });
  return users.map(toAdminRow);
}

export type AdminStats = {
  totalInvestors: number;
  pending: number;
  verified: number;
  rejected: number;
  admins: number;
  registeredToday: number;
};

export async function adminStats(): Promise<AdminStats> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalInvestors, pending, verified, rejected, admins, registeredToday] =
    await Promise.all([
      prisma.user.count({ where: { role: "INVESTOR" } }),
      prisma.user.count({ where: { role: "INVESTOR", status: "PENDING" } }),
      prisma.user.count({ where: { role: "INVESTOR", status: "VERIFIED" } }),
      prisma.user.count({ where: { role: "INVESTOR", status: "REJECTED" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({
        where: { role: "INVESTOR", createdAt: { gte: startOfDay } },
      }),
    ]);

  return {
    totalInvestors,
    pending,
    verified,
    rejected,
    admins,
    registeredToday,
  };
}

export type AdminAuditEntry = {
  id: string;
  action: string;
  details: string | null;
  createdAt: string;
  actorEmail: string | null;
};

export async function recentAuditLog(limit = 8): Promise<AdminAuditEntry[]> {
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { email: true } } },
  });
  return logs.map((l) => ({
    id: l.id,
    action: l.action,
    details: l.details,
    createdAt: l.createdAt.toISOString(),
    actorEmail: l.user?.email ?? null,
  }));
}

export type VerifyOutcome =
  | "VERIFIED"
  | "ALREADY_VERIFIED"
  | "NOT_FOUND"
  | "TARGET_IS_ADMIN";

/**
 * PENDING/REJECTED -> VERIFIED.
 * Idempotent: a repeat call returns ALREADY_VERIFIED and writes no second
 * audit entry, so double-clicking Verify cannot duplicate history.
 */
export async function verifyUser(
  targetId: string,
  adminId: string,
  adminEmail: string
): Promise<VerifyOutcome> {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return "NOT_FOUND";
  if (target.role === "ADMIN") return "TARGET_IS_ADMIN";
  if (target.status === "VERIFIED") return "ALREADY_VERIFIED";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetId },
      data: {
        status: "VERIFIED",
        verifiedAt: new Date(),
        verifiedBy: adminEmail,
        rejectionReason: null,
        rejectedAt: null,
        rejectedBy: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: targetId,
        action: "USER_VERIFIED",
        entity: "User",
        entityId: targetId,
        details: `Account verified by ${adminEmail} (admin ${adminId})`,
      },
    }),
  ]);

  return "VERIFIED";
}

export type RejectOutcome = "REJECTED" | "NOT_FOUND" | "TARGET_IS_ADMIN" | "SELF";

/** PENDING/VERIFIED -> REJECTED, storing the reason for the investor to see. */
export async function rejectUser(
  targetId: string,
  adminId: string,
  adminEmail: string,
  reason: string
): Promise<RejectOutcome> {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return "NOT_FOUND";
  if (target.role === "ADMIN") return "TARGET_IS_ADMIN";
  if (target.id === adminId) return "SELF";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetId },
      data: {
        status: "REJECTED",
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: adminEmail,
        verifiedAt: null,
        verifiedBy: null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: targetId,
        action: "USER_REJECTED",
        entity: "User",
        entityId: targetId,
        details: `Account rejected by ${adminEmail}: ${reason}`,
      },
    }),
  ]);

  return "REJECTED";
}

export type UnverifyOutcome =
  | "UNVERIFIED"
  | "HAS_INVESTMENTS"
  | "NOT_FOUND"
  | "TARGET_IS_ADMIN"
  | "SELF";

/** VERIFIED -> PENDING, refused when the investor already holds investments. */
export async function unverifyUser(
  targetId: string,
  adminId: string,
  adminEmail: string
): Promise<UnverifyOutcome> {
  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return "NOT_FOUND";
  if (target.role === "ADMIN") return "TARGET_IS_ADMIN";
  if (target.id === adminId) return "SELF";
  if (await userHasInvestments(targetId)) return "HAS_INVESTMENTS";

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetId },
      data: { status: "PENDING", verifiedAt: null, verifiedBy: null },
    }),
    prisma.auditLog.create({
      data: {
        userId: targetId,
        action: "USER_UNVERIFIED",
        entity: "User",
        entityId: targetId,
        details: `Verification revoked by ${adminEmail}`,
      },
    }),
  ]);

  return "UNVERIFIED";
}