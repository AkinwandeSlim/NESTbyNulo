import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";
import { requireInvestor } from "@/lib/admin";
import { recordDebitTx, calculateBalanceTx, calculateBalance } from "@/lib/ledger";
import { getExistingInvestmentByKey, IDEMPOTENCY_KEY_MAX_LEN, type IdempotencyReplay } from "@/lib/idempotency";
import { auditError } from "@/lib/audit-error";
import { prisma } from "@/lib/prisma";

/**
 * Business-rule violation carrying its intended HTTP status. Thrown inside
 * the transaction and mapped in the catch block so the API contract keeps
 * 409 for business rules while unexpected failures stay 4xx/5xx generic.
 */
class BusinessRuleError extends Error {
  status: number;
  constructor(message: string, status = 409) {
    super(message);
    this.status = status;
  }
}

/**
 * MERGE NOTE (property lifecycle vocabulary): dev_gstack's seeded properties
 * carried the uppercase lifecycle ACTIVE/FUNDED, while this project's
 * BrowseView / PropertyCard / PropertyDetailView render the lowercase values
 * ('funding' | 'published' | 'funded' | 'active') that nest-utils
 * getStatusColor() maps to badges. Rather than forcing one vocabulary onto the
 * other, status checks are normalized here:
 *   open for investment  -> ACTIVE | FUNDING | PUBLISHED  (any casing)
 *   closed               -> FUNDED | PAUSED | COMPLETED | DRAFT
 */
const OPEN_PROPERTY_STATUSES = ["ACTIVE", "FUNDING", "PUBLISHED"];

function isPropertyOpen(status: string | null | undefined): boolean {
  return OPEN_PROPERTY_STATUSES.includes((status ?? "").toUpperCase());
}

/**
 * POST /api/investments
 *
 * Execute an investment atomically:
 * 1. Validate investor status and balance
 * 2. Debit wallet (creates immutable transaction)
 * 3. Create investment record
 * 4. Update property funding
 * 5. Create audit log
 *
 * All in a single Prisma transaction (rollback on error).
 *
 * Request body:
 * - propertyId: string (property to invest in)
 * - amountKobo: number (investment amount in kobo)
 * - Idempotency-Key header: optional client-generated dedup key (<= 255 chars).
 *   A retry after a network failure returns the ORIGINAL 200 result (with
 *   idempotentReplay: true) instead of double-charging the wallet.
 *
 * Response:
 * - 200: { success: true, investment, property, newBalance }
 * - 400: Validation error
 * - 403: Not authorized (investor only)
 * - 404: Property not found
 * - 409: Business rule violation (min investment, already funded, etc.)
 * - 409: { code: "IDEMPOTENCY_CONFLICT" } — key reuse with a different payload
 */
export async function POST(request: NextRequest) {
  // Investor authorization check
  const access = await requireInvestor();
  if (!access.ok) {
    // Machine-readable denial code: a PENDING and a REJECTED account are both
    // gated, but the investor must learn WHICH (and why). The rejection reason
    // is stored on the user row by Feature #2's admin reject action.
    const code =
      access.reason === "NOT_VERIFIED"
        ? access.user?.status === "REJECTED"
          ? "ACCOUNT_REJECTED"
          : "ACCOUNT_PENDING"
        : access.reason;
    return NextResponse.json(
      {
        error: "Investor access required",
        code,
        // Human-readable message the UI surfaces directly (Feature #2 wording).
        ...(code === "ACCOUNT_PENDING"
          ? { message: "Account under verification." }
          : {}),
        ...(code === "ACCOUNT_REJECTED"
          ? { message: "Account rejected by an administrator." }
          : {}),
        ...(code === "ACCOUNT_REJECTED" && access.user?.rejectionReason
          ? { reason: access.user.rejectionReason }
          : {}),
      },
      { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const investor = access.user;

  try {
    const body = await request.json();
    const { propertyId, amountKobo } = body;

    // Feature #5 — resolve the client dedup key: header first (the standard
    // retry-replay placement), then an in-body key (used by this repo's own
    // harness and simple clients). Trimmed and length-capped either way.
    const headerKey =
      request.headers.get("Idempotency-Key")?.trim() ||
      request.headers.get("x-idempotency-key")?.trim() ||
      "";
    const bodyKey =
      typeof body?.idempotencyKey === "string" ? body.idempotencyKey.trim() : "";
    const idempotencyKey = headerKey || bodyKey;

    if (idempotencyKey.length > IDEMPOTENCY_KEY_MAX_LEN) {
      return NextResponse.json(
        {
          error: `Idempotency-Key must be at most ${IDEMPOTENCY_KEY_MAX_LEN} characters.`,
          code: "IDEMPOTENCY_KEY_INVALID",
        },
        { status: 400 }
      );
    }

    // Feature #5 — replay / conflict lookup. A retry with the SAME key and
    // payload returns the ORIGINAL 200 (idempotentReplay: true) instead of
    // double-charging the wallet; the same key with a different payload is a
    // client bug and answers 409. Both are audit-trailed.
    if (idempotencyKey && amountKobo && typeof amountKobo === "number") {
      const lookup = await getExistingInvestmentByKey(
        idempotencyKey,
        investor.id,
        {
          propertyId: typeof propertyId === "string" ? propertyId : "",
          amountKobo,
        }
      );

      if (lookup?.kind === "replay") {
        await prisma.auditLog.create({
          data: {
            userId: investor.id,
            action: "INVESTMENT_IDEMPOTENT_REPLAY",
            entity: "Investment",
            entityId: lookup.response.investment.id,
            details: `Original result replayed for key ${idempotencyKey} (${investor.email}) — no second debit`,
          },
        });
        return NextResponse.json({
          ...lookup.response,
          idempotentReplay: true,
        });
      }

      if (lookup?.kind === "conflict") {
        await prisma.auditLog.create({
          data: {
            userId: investor.id,
            action: "INVESTMENT_IDEMPOTENCY_CONFLICT",
            entity: "Investment",
            details: `Idempotency key reused with a different payload (${investor.email})`,
          },
        });
        return NextResponse.json(
          {
            error:
              "This Idempotency-Key was already used for a different request. Generate a new key and retry.",
            code: "IDEMPOTENCY_CONFLICT",
          },
          { status: 409 }
        );
      }
    }

    // The column is NOT NULL + UNIQUE. Headerless requests opt out of dedup
    // by construction, so mint a server-unique key to satisfy the schema.
    const dedupeKey = idempotencyKey || randomUUID();

    // Validate propertyId
    if (!propertyId || typeof propertyId !== "string") {
      return NextResponse.json(
        { error: "Property ID is required." },
        { status: 400 }
      );
    }

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

    // Find property
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json({ error: "Property not found." }, { status: 404 });
    }

    // Validate property status (normalized — see isPropertyOpen note above)
    if (!isPropertyOpen(property.status)) {
      return NextResponse.json(
        { error: "Property is not open for investment." },
        { status: 409 }
      );
    }

    // Validate minimum investment
    if (amountKoboBigInt < property.minInvestmentKobo) {
      return NextResponse.json(
        {
          error: `Minimum investment is ₦${Number(property.minInvestmentKobo) / 100}.`,
        },
        { status: 400 }
      );
    }

    // Validate property not fully funded
    const remainingFunding = property.targetKobo - property.fundedKobo;
    if (remainingFunding <= BigInt(0)) {
      return NextResponse.json(
        { error: "Property is fully funded." },
        { status: 409 }
      );
    }

    // Validate investment doesn't exceed remaining funding
    if (amountKoboBigInt > remainingFunding) {
      return NextResponse.json(
        {
          error: `Maximum investment allowed is ₦${Number(remainingFunding) / 100}.`,
        },
        { status: 400 }
      );
    }

    // Check investor balance
    const currentBalance = await calculateBalance(investor.id);
    if (currentBalance < amountKoboBigInt) {
      return NextResponse.json(
        {
          error: `Insufficient balance. Required: ₦${Number(amountKoboBigInt) / 100}, Available: ₦${Number(currentBalance) / 100}`,
          code: "INSUFFICIENT_FUNDS",
        },
        { status: 400 }
      );
    }

    // Feature #6 / FR-002 — wallet debit, investment row, funding update and
    // audit row share ONE Prisma transaction. Funding and balance are
    // re-validated INSIDE the transaction so two concurrent requests can
    // never both pass against the same stale balance / remaining funding.
    const result = await prisma.$transaction(async (tx) => {
      // Re-read funding inside the tx: another investor's committed
      // investment is visible here, closing the double-funding race.
      const propertyNow = await tx.property.findUnique({
        where: { id: property.id },
        select: { fundedKobo: true, targetKobo: true, status: true },
      });
      if (!propertyNow || !isPropertyOpen(propertyNow.status)) {
        throw new BusinessRuleError("Property is fully funded.", 409);
      }

      const remaining = propertyNow.targetKobo - propertyNow.fundedKobo;
      if (remaining <= BigInt(0)) {
        throw new BusinessRuleError("Property is fully funded.", 409);
      }
      if (amountKoboBigInt > remaining) {
        // Clean close-out semantics: the loser of a tail race gets the exact
        // remaining amount and can retry — instead of corrupting the property.
        throw new BusinessRuleError(
          `Maximum investment allowed is ₦${Number(remaining) / 100}.`,
          409
        );
      }

      // 1. Debit the wallet (tx-scoped: validates against the balance as of
      // THIS transaction, including any debit already made inside it).
      const debitResult = await recordDebitTx(tx, {
        userId: investor.id,
        amountKobo: amountKoboBigInt,
        category: "INVESTMENT",
        description: `Investment in ${property.title}`,
        refType: "Property",
        refId: property.id,
      });

      // 2. Create investment record (uniquely keyed for Feature #5 replay)
      const investment = await tx.investment.create({
        data: {
          userId: investor.id,
          propertyId: property.id,
          amountKobo: amountKoboBigInt,
          ownershipPct:
            (Number(amountKoboBigInt) / Number(property.valuationKobo)) * 100,
          status: "ACTIVE",
          idempotencyKey: dedupeKey,
        },
      });

      // 3. Update property funding (auto-close at 100%)
      const newFunded = propertyNow.fundedKobo + amountKoboBigInt;
      const updatedProperty = await tx.property.update({
        where: { id: property.id },
        data: {
          fundedKobo: newFunded,
          // Lowercase values are what nest-utils getStatusColor() maps to
          // badges: 'funded' -> blue, 'active' -> green.
          status: newFunded >= propertyNow.targetKobo ? "funded" : "active",
        },
      });

      // 4. Create audit log
      await tx.auditLog.create({
        data: {
          userId: investor.id,
          action: "INVESTMENT_MADE",
          entity: "Investment",
          entityId: investment.id,
          details: `₦${Number(amountKoboBigInt) / 100} invested in ${property.title}. Ownership: ${investment.ownershipPct.toFixed(4)}%. New balance: ₦${Number(debitResult.newBalance) / 100}`,
        },
      });

      return { investment, property: updatedProperty, newBalance: debitResult.newBalance };
    });

    // Return success response
    return NextResponse.json({
      success: true,
      investment: {
        id: result.investment.id,
        propertyId: result.investment.propertyId,
        amountKobo: Number(result.investment.amountKobo),
        amountNaira: Number(result.investment.amountKobo) / 100,
        ownershipPct: result.investment.ownershipPct,
        status: result.investment.status,
        investedAt: result.investment.investedAt.toISOString(),
      },
      property: {
        id: result.property.id,
        title: result.property.title,
        fundedKobo: Number(result.property.fundedKobo),
        fundedNaira: Number(result.property.fundedKobo) / 100,
        targetKobo: Number(result.property.targetKobo),
        targetNaira: Number(result.property.targetKobo) / 100,
        fundedPct:
          (Number(result.property.fundedKobo) / Number(result.property.targetKobo)) *
          100,
        status: result.property.status,
      },
      newBalance: Number(result.newBalance),
      newBalanceNaira: Number(result.newBalance) / 100,
    });
  } catch (error) {
    console.error("Investment error:", error);

    // Business-rule rejections thrown inside the transaction (fully funded,
    // over-remaining) keep their original HTTP status.
    if (error instanceof BusinessRuleError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    // Feature #5 — two writers lost the race on the same dedup key.
    // This is a client bug (reusing a key across different requests),
    // not a server fault, so answer 409 and leave an audit trail.
    if (await auditError(error, "P2002", {
      action: "INVESTMENT_IDEMPOTENCY_CONFLICT",
      entity: "Investment",
      userId: investor.id,
      details: `Idempotency key race on POST /api/investments (${investor.email})`,
    })) {
      return NextResponse.json(
        {
          error:
            "This Idempotency-Key was already used for a different request. Generate a new key and retry.",
          code: "IDEMPOTENCY_CONFLICT",
        },
        { status: 409 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to process investment." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/investments
 *
 * Get all investments for the current investor.
 * Returns investment history with property details.
 */
export async function GET(request: NextRequest) {
  // Investor authorization check
  const access = await requireInvestor();
  if (!access.ok) {
    // Same machine-readable denial contract as POST (see comment there).
    const code =
      access.reason === "NOT_VERIFIED"
        ? access.user?.status === "REJECTED"
          ? "ACCOUNT_REJECTED"
          : "ACCOUNT_PENDING"
        : access.reason;
    return NextResponse.json(
      {
        error: "Investor access required",
        code,
        // Same message contract as POST (see note there).
        ...(code === "ACCOUNT_PENDING"
          ? { message: "Account under verification." }
          : {}),
        ...(code === "ACCOUNT_REJECTED"
          ? { message: "Account rejected by an administrator." }
          : {}),
        ...(code === "ACCOUNT_REJECTED" && access.user?.rejectionReason
          ? { reason: access.user.rejectionReason }
          : {}),
      },
      { status: access.reason === "UNAUTHENTICATED" ? 401 : 403 }
    );
  }

  const investor = access.user;

  try {
    const investments = await prisma.investment.findMany({
      where: { userId: investor.id },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            // MERGE NOTE: dev_gstack's Property had `location` + `expectedReturn`;
            // this project's Property models the same facts as city/state and
            // rentalYield. Select those instead of inventing duplicate columns.
            city: true,
            state: true,
            status: true,
            rentalYield: true,
          },
        },
      },
      orderBy: { investedAt: "desc" },
    });

    const formattedInvestments = investments.map((inv) => ({
      id: inv.id,
      propertyId: inv.propertyId,
      property: inv.property,
      amountKobo: Number(inv.amountKobo),
      amountNaira: Number(inv.amountKobo) / 100,
      ownershipPct: inv.ownershipPct,
      status: inv.status,
      investedAt: inv.investedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      investments: formattedInvestments,
      count: formattedInvestments.length,
    });
  } catch (error) {
    console.error("Get investments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch investments." },
      { status: 500 }
    );
  }
}
