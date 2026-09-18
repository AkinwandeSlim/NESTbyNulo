import { prisma } from "@/lib/prisma";
import { calculateBalance } from "@/lib/ledger";

/**
 * Feature #5 / FR-004: Investment idempotency.
 *
 * The Investment row is created inside the same atomic transaction as the
 * wallet debit, keyed by a unique `idempotencyKey`. A client that retries
 * after a timeout/network failure replays the SAME key and receives the
 * ORIGINAL 200 answer (plus `idempotencyReplay: true`) instead of a second
 * wallet debit.
 *
 * Contract:
 * - Key is scoped per investor: user A can never replay user B's key (the
 *   lookup filters on ownership and treats foreign keys as absent).
 * - Key reuse with a DIFFERENT payload can never reach this lookup (the
 *   unique index forces a P2002 inside the create transaction) — the route
 *   maps that to 409 IDEMPOTENCY_CONFLICT.
 * - The replayed balance is reconstructed from the immutable ledger
 *   (Feature #3: balance = SUM(credits) - SUM(debits)) as it stood right
 *   after the original debit, so replays always match the original response.
 */

export const IDEMPOTENCY_KEY_MAX_LEN = 255;

/** Mirrors the POST /api/investments 200 body exactly (plus replay flag). */
export type IdempotencyReplay = {
  success: true;
  investment: {
    id: string;
    propertyId: string;
    amountKobo: number;
    amountNaira: number;
    ownershipPct: number;
    status: string;
    investedAt: string;
  };
  property: {
    id: string;
    title: string;
    fundedKobo: number;
    fundedNaira: number;
    targetKobo: number;
    targetNaira: number;
    fundedPct: number;
    status: string;
  };
  newBalance: number;
  newBalanceNaira: number;
};

export type IdempotencyLookup =
  | { kind: "replay"; response: IdempotencyReplay }
  | { kind: "conflict" }
  | null;

/**
 * Resolves this investor's dedup key into one of three outcomes:
 *  - null .................. key unknown (or owned by someone else): proceed
 *                            with a fresh investment
 *  - { kind: "replay" } .... same key AND same payload (propertyId +
 *                            amountKobo): the caller must return the ORIGINAL
 *                            response, never re-charge the wallet
 *  - { kind: "conflict" } .. same key with a DIFFERENT payload: a client bug,
 *                            the caller answers 409 IDEMPOTENCY_CONFLICT
 */
export async function getExistingInvestmentByKey(
  idempotencyKey: string,
  userId: string,
  expected: { propertyId: string; amountKobo: number }
): Promise<IdempotencyLookup> {
  const investment = await prisma.investment.findUnique({
    where: { idempotencyKey },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          fundedKobo: true,
          targetKobo: true,
          status: true,
        },
      },
    },
  });

  // Replay is strictly per-owner — never leak another user's investment.
  if (!investment || investment.userId !== userId) {
    return null;
  }

  const samePayload =
    investment.propertyId === expected.propertyId &&
    investment.amountKobo === BigInt(expected.amountKobo);

  if (!samePayload) {
    return { kind: "conflict" };
  }

  // Feature #3 rule: authoritative balance comes from the ledger SUM.
  // The original request's balance-after-debit = current ledger balance
  // (which still includes that debit) + the debited amount.
  const currentBalance = await calculateBalance(investment.userId);
  const balanceAfterOriginalDebit = currentBalance + investment.amountKobo;

  return {
    kind: "replay",
    response: {
      success: true,
    investment: {
      id: investment.id,
      propertyId: investment.propertyId,
      amountKobo: Number(investment.amountKobo),
      amountNaira: Number(investment.amountKobo) / 100,
      ownershipPct: investment.ownershipPct,
      status: investment.status,
      investedAt: investment.investedAt.toISOString(),
    },
    property: {
      id: investment.property.id,
      title: investment.property.title,
      fundedKobo: Number(investment.property.fundedKobo),
      fundedNaira: Number(investment.property.fundedKobo) / 100,
      targetKobo: Number(investment.property.targetKobo),
      targetNaira: Number(investment.property.targetKobo) / 100,
      fundedPct:
        (Number(investment.property.fundedKobo) /
          Number(investment.property.targetKobo)) *
        100,
      status: investment.property.status,
    },
    newBalance: Number(balanceAfterOriginalDebit),
    newBalanceNaira: Number(balanceAfterOriginalDebit) / 100,
    },
  };
}
