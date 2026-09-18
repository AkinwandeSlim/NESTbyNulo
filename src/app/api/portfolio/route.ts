import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateBalance } from '@/lib/ledger';

/**
 * GET /api/portfolio
 *
 * MERGE NOTE (dev_gstack Feature #5 / FR-005): this route returned a hard-coded
 * mock portfolio (an invented ₦15.75M holding and invented monthly returns).
 * Every figure is now derived from the database:
 *
 *   totalInvested      SUM(Investment.amountKobo) for the signed-in investor
 *   rentalIncomeEarned SUM(DISTRIBUTION credits on the immutable ledger)
 *   recentTransactions the ledger itself (append-only = the audit trail)
 *   propertyAllocation GROUP BY property, share of total invested
 *   portfolioGrowth    cumulative invested capital, month by month
 *
 * Deliberately NOT invented: capital appreciation and pending returns. There is
 * no valuation model or distribution scheduler in this build, so both are 0 and
 * explained in `valuationNote` instead of being fabricated. The response SHAPE
 * is unchanged, so PortfolioView needs no rewrite.
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

    const investments = await prisma.investment.findMany({
      where: { userId: user.id },
      include: {
        property: { select: { id: true, title: true, propertyType: true } },
      },
      orderBy: { investedAt: 'asc' },
    });

    const ledger = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    const toNaira = (kobo: bigint | number) => Number(kobo) / 100;
    const monthLabel = (key: string) =>
      new Date(`${key}-01T00:00:00Z`).toLocaleDateString('en-NG', {
        month: 'short',
        year: 'numeric',
      });

    const totalInvestedKobo = investments.reduce(
      (sum, inv) => sum + Number(inv.amountKobo),
      0
    );

    // Rental income = exact SUM of DISTRIBUTION credits in the ledger.
    const rentalIncomeKobo = ledger
      .filter((t) => t.category === 'DISTRIBUTION')
      .reduce((sum, t) => sum + Number(t.amountKobo), 0);

    // Allocation by property (cost basis — the only real figure we hold).
    const byProperty = new Map<
      string,
      { name: string; value: number; type: string }
    >();
    for (const inv of investments) {
      const entry = byProperty.get(inv.propertyId) ?? {
        name: inv.property?.title ?? 'Property',
        value: 0,
        type: inv.property?.propertyType ?? 'residential',
      };
      entry.value += Number(inv.amountKobo);
      byProperty.set(inv.propertyId, entry);
    }
    const propertyAllocation = [...byProperty.values()].map((p) => ({
      name: p.name,
      value: toNaira(p.value),
      percent: totalInvestedKobo > 0 ? (p.value / totalInvestedKobo) * 100 : 0,
      type: p.type,
    }));

    // Distributions by month — ledger rows, no smoothing or invented history.
    const monthlyMap = new Map<string, number>();
    for (const row of ledger.filter((t) => t.category === 'DISTRIBUTION')) {
      const key = row.createdAt.toISOString().slice(0, 7);
      monthlyMap.set(key, (monthlyMap.get(key) ?? 0) + Number(row.amountKobo));
    }
    const monthlyReturns = [...monthlyMap.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, kobo]) => {
        const naira = toNaira(kobo);
        return {
          month: monthLabel(key),
          rentalIncome: naira,
          dividends: naira,
          total: naira,
        };
      });

    // Cumulative invested capital, month by month.
    const growthMap = new Map<string, number>();
    let running = 0;
    for (const inv of investments) {
      running += Number(inv.amountKobo);
      growthMap.set(inv.investedAt.toISOString().slice(0, 7), running);
    }
    const portfolioGrowth = [...growthMap.entries()]
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([key, kobo]) => ({ month: monthLabel(key), value: toNaira(kobo) }));

    // Category -> UI vocabulary, so the existing badges keep working.
    const typeForCategory = (category: string) =>
      category === 'DISTRIBUTION'
        ? 'dividend'
        : category === 'INVESTMENT'
          ? 'investment'
          : 'credit';

    const recentTransactions = ledger.slice(0, 10).map((t) => ({
      id: t.id,
      type: typeForCategory(t.category),
      amount: toNaira(t.amountKobo),
      status: 'completed',
      description: t.description,
      date: t.createdAt.toISOString(),
    }));

    const walletBalanceKobo = await calculateBalance(user.id);

    return NextResponse.json({
      totalValue: toNaira(totalInvestedKobo),
      totalInvested: toNaira(totalInvestedKobo),
      currentValue: toNaira(totalInvestedKobo),
      // Deliberately NOT invented: this build has no valuation model, so these
      // are reported as 0 and explained in valuationNote below.
      capitalAppreciation: 0,
      capitalAppreciationPercent: 0,
      rentalIncomeEarned: toNaira(rentalIncomeKobo),
      totalReturns: toNaira(rentalIncomeKobo),
      overallReturnPercent:
        totalInvestedKobo > 0 ? (rentalIncomeKobo / totalInvestedKobo) * 100 : 0,
      propertiesOwned: byProperty.size,
      pendingReturns: 0,
      propertyAllocation,
      monthlyReturns,
      recentTransactions,
      portfolioGrowth,
      // Extra fields (the UI ignores unknowns) — real ledger context for the demo.
      walletBalance: toNaira(walletBalanceKobo),
      ledgerEntries: ledger.length,
      verificationStatus: user.status,
      valuationNote:
        'Holdings are shown at cost. No valuation model exists in this build, so capital appreciation and pending returns are 0 rather than estimated. Rental income is the exact SUM of DISTRIBUTION credits in the immutable ledger.',
    });

    



  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
