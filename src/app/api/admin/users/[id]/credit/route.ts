import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { recordCreditTx, calculateBalance } from "@/lib/ledger";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/users/:id/credit
 *
 * Admin-only endpoint to credit demo money to an investor's wallet.
 * Creates an immutable DEMO_CREDIT transaction.
 *
 * Request body:
 * - amountKobo: number (amount in kobo, 1 naira = 100 kobo)
 * - description?: string (optional custom description)
 *
 * Response:
 * - 200: { success: true, transaction, newBalance }
 * - 400: Invalid amount or validation error
 * - 403: Not authorized (admin only)
 * - 404: User not found
 * - 409: Cannot credit admin accounts
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Admin authorization check
  const access = await requireAdmin();
  if (!access.ok) {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const admin = access.user;
  const { id: targetId } = await params;

  try {
    // Parse request body
    const body = await request.json();
    const { amountKobo, description } = body;

    // Validate amount
    if (!amountKobo || typeof amountKobo !== "number" || amountKobo <= 0) {
      return NextResponse.json(
        { error: "Invalid amount. Must be a positive number." },
        { status: 400 }
      );
    }

    // Convert to BigInt (validate it's an integer)
    if (!Number.isInteger(amountKobo)) {
      return NextResponse.json(
        { error: "Amount must be an integer (kobo has no decimals)." },
        { status: 400 }
      );
    }

    const amountKoboBigInt = BigInt(amountKobo);

    // Maximum demo credit: ₦10,000,000 (1 billion kobo) - sanity check
    const MAX_DEMO_CREDIT = BigInt(1_000_000_000); // 10M naira
    if (amountKoboBigInt > MAX_DEMO_CREDIT) {
      return NextResponse.json(
        { error: "Amount exceeds maximum demo credit limit (₦10,000,000)." },
        { status: 400 }
      );
    }

    // Feature #5 — DEMO_CREDIT dedup key (optional). When supplied, a retry
    // with the same key returns the ORIGINAL 200 result instead of granting
    // the grant twice. Scoped per-admin via owner scoping in the lookup.
    const idempotencyKey =
      request.headers.get("Idempotency-Key")?.trim() ??
      request.headers.get("x-idempotency-key")?.trim() ??
      "";

    if (idempotencyKey.length > 255) {
      return NextResponse.json(
        {
          error: "Idempotency-Key must be at most 255 characters.",
          code: "IDEMPOTENCY_KEY_INVALID",
        },
        { status: 400 }
      );
    }

    if (idempotencyKey) {
      const replay = await prisma.transaction.findFirst({
        where: {
          category: "DEMO_CREDIT",
          refId: admin.id,
          description: { startsWith: `[idem:${idempotencyKey}]` },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, amountKobo: true, userId: true, createdAt: true },
      });

      if (replay) {
        const replayBalance = await calculateBalance(replay.userId);
        return NextResponse.json({
          success: true,
          idempotentReplay: true,
          transaction: {
            id: replay.id,
            type: "CREDIT",
            amountKobo: Number(replay.amountKobo),
            category: "DEMO_CREDIT",
            description: "Demo credit (replayed idempotent result)",
            balanceKobo: Number(replayBalance),
            createdAt: replay.createdAt.toISOString(),
          },
          newBalance: Number(replayBalance),
          newBalanceNaira: Number(replayBalance) / 100,
          user: { id: replay.userId },
        });
      }
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Prevent crediting admin accounts
    if (targetUser.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot credit admin accounts. Admins cannot be investors." },
        { status: 409 }
      );
    }

    // Ensure user has a wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: targetId },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: "User does not have a wallet." },
        { status: 404 }
      );
    }

    // Feature #5 — create the ledger row and the wallet update inside ONE
    // atomic transaction. Previously a crash between the two writes left the
    // wallet balance and the immutable ledger permanently out of sync.
    const creditDescription = idempotencyKey
      ? `[idem:${idempotencyKey}] ` +
        (description ||
          `Demo credit by ${admin.email} (${admin.role}) - ₦${(amountKobo / 100).toLocaleString()}`)
      : description ||
        `Demo credit by ${admin.email} (${admin.role}) - ₦${(amountKobo / 100).toLocaleString()}`;

    const { transaction, newBalance } = await prisma.$transaction(async (tx) => {
      const result = await recordCreditTx(tx, {
        userId: targetId,
        amountKobo: amountKoboBigInt,
        category: "DEMO_CREDIT",
        description: creditDescription,
        refType: "ADMIN_CREDIT",
        refId: admin.id,
      });

      await tx.auditLog.create({
        data: {
          userId: targetId,
          action: "DEMO_CREDIT_GRANTED",
          entity: "Transaction",
          entityId: result.transaction.id,
          details: `₦${(amountKobo / 100).toLocaleString()} credited by ${admin.email}. New balance: ₦${(Number(result.newBalance) / 100).toLocaleString()}`,
        },
      });

      return result;
    });

    // Return success response
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        amountKobo: Number(transaction.amountKobo),
        category: transaction.category,
        description: transaction.description,
        balanceKobo: Number(transaction.balanceKobo),
        createdAt: transaction.createdAt.toISOString(),
      },
      newBalance: Number(newBalance),
      newBalanceNaira: Number(newBalance) / 100,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        status: targetUser.status,
      },
    });
  } catch (error) {
    console.error("Demo credit error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to process demo credit." },
      { status: 500 }
    );
  }
}
