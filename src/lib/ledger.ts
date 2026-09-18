import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Feature #3: Immutable Ledger Service
 *
 * CRITICAL BUSINESS RULE: Balance is NEVER stored as authoritative.
 * Balance = SUM(transactions WHERE userId=X).
 *
 * Every money movement creates an immutable Transaction row:
 * - type: CREDIT (money in) or DEBIT (money out)
 * - amountKobo: BigInt (1 naira = 100 kobo, NO floating point)
 * - category: DEMO_CREDIT | INVESTMENT | DISTRIBUTION | WITHDRAWAL
 * - balanceKobo: Running balance AFTER this transaction
 *
 * Transaction rows are APPEND-ONLY. No UPDATE/DELETE operations.
 */

export type TransactionType = "CREDIT" | "DEBIT";
export type TransactionCategory =
  | "DEMO_CREDIT"
  | "INVESTMENT"
  | "DISTRIBUTION"
  | "WITHDRAWAL";

export type TransactionRecord = {
  id: string;
  userId: string;
  type: TransactionType;
  amountKobo: bigint;
  category: TransactionCategory;
  description: string;
  refType: string | null;
  refId: string | null;
  balanceKobo: bigint;
  createdAt: Date;
};

/**
 * Calculate user's current balance from transaction history.
 * This is the ONLY authoritative balance calculation.
 * Never trust Wallet.balanceKobo - always recalculate from ledger.
 */
export async function calculateBalance(userId: string): Promise<bigint> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { type: true, amountKobo: true },
  });

  let balance = BigInt(0);

  for (const tx of transactions) {
    if (tx.type === "CREDIT") {
      balance += tx.amountKobo;
    } else {
      balance -= tx.amountKobo;
    }
  }

  // Ensure balance never goes negative (shouldn't happen with proper validation)
  if (balance < BigInt(0)) {
    console.error(
      `⚠️ Negative balance detected for user ${userId}: ${balance} kobo. This indicates a bug in transaction logic.`
    );
    return BigInt(0);
  }

  return balance;
}

/**
 * Same ledger arithmetic as calculateBalance(), but against a Prisma
 * transaction client. The transaction-table SELECT of the running investment
 * flow must see this transaction's own uncommitted writes (repeatable-read
 * within the tx), so two sequential debits cannot both pass validation against
 * the same starting balance.
 */
export async function calculateBalanceTx(
  tx: Prisma.TransactionClient,
  userId: string
): Promise<bigint> {
  const transactions = await tx.transaction.findMany({
    where: { userId },
    select: { type: true, amountKobo: true },
  });

  let balance = BigInt(0);
  for (const t of transactions) {
    if (t.type === "CREDIT") {
      balance += t.amountKobo;
    } else {
      balance -= t.amountKobo;
    }
  }
  return balance;
}

/**
 * Transaction-scoped variants of recordCredit / recordDebit.
 * Identical contract to the global versions, but every read and write rides
 * the caller's Prisma transaction client. The caller owns commit/rollback:
 * if anything in the surrounding transaction throws, the ledger row AND the
 * wallet update vanish together — the wallet can never hold money the ledger
 * does not (Feature #3 invariant).
 */
export async function recordCreditTx(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    amountKobo: bigint;
    category: TransactionCategory;
    description: string;
    refType?: string;
    refId?: string;
  }
): Promise<{ transaction: TransactionRecord; newBalance: bigint }> {
  const { userId, amountKobo, category, description, refType, refId } = params;

  if (amountKobo <= BigInt(0)) {
    throw new Error("Credit amount must be positive");
  }

  const newBalance = (await calculateBalanceTx(tx, userId)) + amountKobo;

  const transaction = await tx.transaction.create({
    data: {
      userId,
      type: "CREDIT",
      amountKobo,
      category,
      description,
      refType: refType ?? null,
      refId: refId ?? null,
      balanceKobo: newBalance,
    },
  });

  await tx.wallet.update({
    where: { userId },
    data: { balanceKobo: newBalance },
  });

  return { transaction: transaction as TransactionRecord, newBalance };
}

export async function recordDebitTx(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    amountKobo: bigint;
    category: TransactionCategory;
    description: string;
    refType?: string;
    refId?: string;
  }
): Promise<{ transaction: TransactionRecord; newBalance: bigint }> {
  const { userId, amountKobo, category, description, refType, refId } = params;

  if (amountKobo <= BigInt(0)) {
    throw new Error("Debit amount must be positive");
  }

  const currentBalance = await calculateBalanceTx(tx, userId);

  if (currentBalance < amountKobo) {
    throw new Error(
      `Insufficient balance. Required: ${amountKobo} kobo, Available: ${currentBalance} kobo`
    );
  }

  const newBalance = currentBalance - amountKobo;

  const transaction = await tx.transaction.create({
    data: {
      userId,
      type: "DEBIT",
      amountKobo,
      category,
      description,
      refType: refType ?? null,
      refId: refId ?? null,
      balanceKobo: newBalance,
    },
  });

  await tx.wallet.update({
    where: { userId },
    data: { balanceKobo: newBalance },
  });

  return { transaction: transaction as TransactionRecord, newBalance };
}

/**
 * Record a CREDIT transaction (money coming into user's wallet).
 * Creates immutable Transaction row with running balance.
 *
 * @returns New balance after credit
 */
export async function recordCredit(params: {
  userId: string;
  amountKobo: bigint;
  category: TransactionCategory;
  description: string;
  refType?: string;
  refId?: string;
}): Promise<{ transaction: TransactionRecord; newBalance: bigint }> {
  const { userId, amountKobo, category, description, refType, refId } = params;

  // Validate amount
  if (amountKobo <= BigInt(0)) {
    throw new Error("Credit amount must be positive");
  }

  // Calculate current balance (BEFORE this transaction)
  const currentBalance = await calculateBalance(userId);

  // Calculate new balance (AFTER this transaction)
  const newBalance = currentBalance + amountKobo;

  // Create immutable transaction record
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: "CREDIT",
      amountKobo,
      category,
      description,
      refType: refType ?? null,
      refId: refId ?? null,
      balanceKobo: newBalance,
    },
  });

  // Update Wallet.balanceKobo (non-authoritative, for quick reads only)
  await prisma.wallet.update({
    where: { userId },
    data: { balanceKobo: newBalance },
  });

  return {
    transaction: transaction as TransactionRecord,
    newBalance,
  };
}

/**
 * Record a DEBIT transaction (money leaving user's wallet).
 * Creates immutable Transaction row with running balance.
 * Validates that user has sufficient balance before debiting.
 *
 * @returns New balance after debit
 */
export async function recordDebit(params: {
  userId: string;
  amountKobo: bigint;
  category: TransactionCategory;
  description: string;
  refType?: string;
  refId?: string;
}): Promise<{ transaction: TransactionRecord; newBalance: bigint }> {
  const { userId, amountKobo, category, description, refType, refId } = params;

  // Validate amount
  if (amountKobo <= BigInt(0)) {
    throw new Error("Debit amount must be positive");
  }

  // Calculate current balance (BEFORE this transaction)
  const currentBalance = await calculateBalance(userId);

  // Validate sufficient balance
  if (currentBalance < amountKobo) {
    throw new Error(
      `Insufficient balance. Required: ${amountKobo} kobo, Available: ${currentBalance} kobo`
    );
  }

  // Calculate new balance (AFTER this transaction)
  const newBalance = currentBalance - amountKobo;

  // Create immutable transaction record
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: "DEBIT",
      amountKobo,
      category,
      description,
      refType: refType ?? null,
      refId: refId ?? null,
      balanceKobo: newBalance,
    },
  });

  // Update Wallet.balanceKobo (non-authoritative, for quick reads only)
  await prisma.wallet.update({
    where: { userId },
    data: { balanceKobo: newBalance },
  });

  return {
    transaction: transaction as TransactionRecord,
    newBalance,
  };
}

/**
 * Get transaction history for a user (most recent first).
 * Returns full audit trail of all money movements.
 */
export async function getTransactionHistory(
  userId: string,
  limit: number = 50
): Promise<TransactionRecord[]> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return transactions as TransactionRecord[];
}

/**
 * Get a specific transaction by ID.
 * Used for audit/reconciliation.
 */
export async function getTransactionById(
  transactionId: string
): Promise<TransactionRecord | null> {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  return transaction as TransactionRecord | null;
}

/**
 * Validate that a user has sufficient balance for an operation.
 * Returns true if balance >= required amount.
 */
export async function hasSufficientBalance(
  userId: string,
  requiredAmountKobo: bigint
): Promise<boolean> {
  const balance = await calculateBalance(userId);
  return balance >= requiredAmountKobo;
}

/**
 * Get transaction count for a user.
 * Useful for pagination and analytics.
 */
export async function getTransactionCount(userId: string): Promise<number> {
  return await prisma.transaction.count({
    where: { userId },
  });
}

/**
 * Reconcile wallet balance with ledger.
 * This should never differ if transactions are recorded correctly.
 * If it differs, it indicates a bug in the transaction logic.
 *
 * @returns { walletBalance, ledgerBalance, matches }
 */
export async function reconcileBalance(userId: string): Promise<{
  walletBalance: bigint;
  ledgerBalance: bigint;
  matches: boolean;
}> {
  const wallet = await prisma.wallet.findUnique({
    where: { userId },
    select: { balanceKobo: true },
  });

  if (!wallet) {
    throw new Error(`Wallet not found for user ${userId}`);
  }

  const walletBalance = wallet.balanceKobo;
  const ledgerBalance = await calculateBalance(userId);

  return {
    walletBalance,
    ledgerBalance,
    matches: walletBalance === ledgerBalance,
  };
}
