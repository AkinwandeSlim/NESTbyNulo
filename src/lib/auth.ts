import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/** Shape that crosses the server→client boundary (no BigInt leaks). */
export type SessionUser = {
  id: string;
  clerkId: string | null;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string | null;
  role: string;
  status: string; // PENDING | VERIFIED | REJECTED
  authSource: string; // CLERK | DEV_FALLBACK
  createdAt: string;
  rejectionReason: string | null; // Feature #2: admin's reason when REJECTED
  wallet: { id: string; balanceKobo: number; currency: string };
};

// Use Prisma's generated type for queries with wallet included
type PrismaUserWithWallet = {
  id: string;
  clerkId: string | null;
  email: string;
  phone: string | null;
  firstName: string;
  lastName: string | null;
  role: string;
  status: string;
  authSource: string;
  createdAt: Date;
  rejectionReason: string | null;
  wallet: { id: string; balanceKobo: bigint; balance: number; currency: string; isLocked: boolean; createdAt: Date; updatedAt: Date; userId: string } | null;
};

function toSessionUser(u: PrismaUserWithWallet): SessionUser {
  return {
    id: u.id,
    clerkId: u.clerkId,
    email: u.email,
    phone: u.phone,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    status: u.status,
    authSource: u.authSource,
    createdAt: u.createdAt.toISOString(),
    rejectionReason: u.rejectionReason,
    wallet: {
      id: u.wallet?.id ?? "",
      balanceKobo: u.wallet ? Number(u.wallet.balanceKobo) : 0,
      currency: u.wallet?.currency ?? "NGN",
    },
  };
}

/**
 * Clerk is active only when BOTH keys are configured AND the Clerk SDK is
 * bundled. MERGE NOTE: @clerk/nextjs is deliberately not a dependency of the
 * merged app (no Clerk keys in .env, demo uses dev-fallback only), so this is
 * pinned to false. Add the package and flip CLERK_SDK_BUNDLED to re-enable.
 */
const CLERK_SDK_BUNDLED = false;

export function isClerkEnabled(): boolean {
  return (
    CLERK_SDK_BUNDLED &&
    Boolean(
      process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    )
  );
}

export function authMode(): "CLERK" | "DEV_FALLBACK" {
  return isClerkEnabled() ? "CLERK" : "DEV_FALLBACK";
}

/**
 * Normalized Clerk identity → database upsert.
 * Used by BOTH the svix webhook (user.created / user.updated) and the lazy
 * session sync (webhooks are not reachable on localhost without a tunnel).
 * Created accounts always start with status = PENDING (locked-scope requirement).
 */
export async function upsertClerkUser(identity: {
  clerkId: string;
  email: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  source: "WEBHOOK" | "SESSION";
}): Promise<SessionUser> {
  const existing = await prisma.user.findUnique({
    where: { clerkId: identity.clerkId },
    include: { wallet: true },
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        firstName: identity.firstName ?? existing.firstName,
        lastName: identity.lastName ?? existing.lastName,
        phone: identity.phone ?? existing.phone,
      },
      include: { wallet: true },
    });
    return toSessionUser(updated);
  }

  // Account may already exist by email (e.g. registered via dev fallback first):
  // link it to the Clerk identity instead of failing on the unique constraint.
  const byEmail = await prisma.user.findUnique({
    where: { email: identity.email },
    include: { wallet: true },
  });
  if (byEmail) {
    const linked = await prisma.user.update({
      where: { id: byEmail.id },
      data: {
        clerkId: identity.clerkId,
        firstName: identity.firstName ?? byEmail.firstName,
        lastName: identity.lastName ?? byEmail.lastName,
        phone: identity.phone ?? byEmail.phone,
        authSource: "CLERK",
      },
      include: { wallet: true },
    });
    await prisma.auditLog.create({
      data: {
        userId: linked.id,
        action: "USER_LINKED_TO_CLERK",
        entity: "User",
        entityId: linked.id,
        details: `Linked existing account to Clerk id ${identity.clerkId} (${identity.source})`,
      },
    });
    return toSessionUser(linked);
  }

  // Brand-new account: PENDING status + Wallet, created atomically.
  const created = await prisma.user.create({
    data: {
      clerkId: identity.clerkId,
      email: identity.email,
      phone: identity.phone,
      firstName: identity.firstName ?? "Investor",
      lastName: identity.lastName,
      authSource: "CLERK",
      status: "PENDING",
      wallet: { create: {} },
      auditLogs: {
        create: {
          action: "USER_REGISTERED",
          entity: "User",
          details: `Registered via Clerk (${identity.source})`,
        },
      },
    },
    include: { wallet: true },
  });
  return toSessionUser(created);
}

/**
 * Resolves the currently signed-in user from the database.
 * - Clerk mode: lazy-syncs the Clerk session user into the DB (PENDING status).
 * - Dev-fallback mode: verifies the HMAC session cookie.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // MERGE NOTE (NEST main prototype): the Clerk session branch of the
  // dev_gstack implementation is intentionally NOT ported. @clerk/nextjs is
  // not a dependency of this project and no Clerk keys exist in .env, so
  // signed sessions are issued exclusively by the HMAC dev-fallback cookie.
  // `upsertClerkUser()` above is kept intact so adding the Clerk webhook later
  // requires no change to the identity-sync logic.

  // Dev fallback
  const { cookies } = await import("next/headers");
  const { SESSION_COOKIE, parseSessionValue } = await import("@/lib/session");
  const store = await cookies();
  const userId = parseSessionValue(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { wallet: true },
  });
  if (!user || !user.isActive) return null;
  return toSessionUser(user);
}
