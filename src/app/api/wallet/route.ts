import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBalance } from '@/lib/ledger';

/**
 * GET /api/wallet
 *
 * MERGE NOTE (dev_gstack Feature #3): WalletView previously rendered a
 * hard-coded 3,250,000 balance and 12 invented transactions. Both now come
 * from the immutable ledger.
 *
 *   balance = SUM(CREDIT amountKobo) − SUM(DEBIT amountKobo)   (authoritative)
 *
 * The cached Wallet.balanceKobo column is intentionally NOT used — the ledger is
 * the single source of truth, so the UI cannot show money the ledger lacks.
 * Transaction `type` values are mapped to the vocabulary WalletView's existing
 * icon/badge maps already expect (credit | investment | dividend | withdrawal).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'UNAUTHENTICATED', message: 'Sign in required.' },
        { status: 401 }
      );
    }

    const ledger = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const balanceKobo = await calculateBalance(user.id);
    const toNaira = (kobo: bigint | number) => Number(kobo) / 100;

    let creditedKobo = 0;
    let debitedKobo = 0;
    for (const row of ledger) {
      if (row.type === 'CREDIT') creditedKobo += Number(row.amountKobo);
      else debitedKobo += Number(row.amountKobo);
    }

    const typeFor = (category: string) => {
      switch (category) {
        case 'INVESTMENT':
          return 'investment';
        case 'DISTRIBUTION':
          return 'dividend';
        case 'WITHDRAWAL':
          return 'withdrawal';
        default:
          return 'credit';
      }
    };

    const transactions = ledger.map((row) => ({
      id: row.id,
      date: row.createdAt.toISOString(),
      description: row.description,
      type: typeFor(row.category),
      amount: toNaira(row.amountKobo),
      // Ledger rows are POSTED at write time and never updated or deleted, so a
      // stored row is by definition settled.
      status: 'completed',
      method: row.category === 'DEMO_CREDIT' ? 'Demo credit (admin)' : undefined,
    }));

    return NextResponse.json({
      balanceKobo: Number(balanceKobo),
      balanceNaira: toNaira(balanceKobo),
      balance: toNaira(balanceKobo),
      verificationStatus: user.status,
      totals: {
        credited: toNaira(creditedKobo),
        debited: toNaira(debitedKobo),
        entries: ledger.length,
      },
      transactions,
      ledgerNote:
        'Balance = SUM(credits) − SUM(debits) over an append-only ledger. This build is in TEST MODE: funds are granted as DEMO CREDIT by an admin — no live payment is processed.',
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wallet data' },
      { status: 500 }
    );
  }
}