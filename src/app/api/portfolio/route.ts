import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const portfolio = {
      // Summary metrics
      totalValue: 15_750_000,
      totalInvested: 15_750_000,
      currentValue: 18_090_000,
      capitalAppreciation: 2_340_000,
      capitalAppreciationPercent: 14.86,
      rentalIncomeEarned: 1_890_000,
      totalReturns: 4_230_000,
      overallReturnPercent: 26.86,
      propertiesOwned: 4,
      pendingReturns: 312_500,

      // Property allocation breakdown
      propertyAllocation: [
        { name: 'The Lekki Residence', value: 5_000_000, percent: 31.7, type: 'completed_rental' },
        { name: 'Azure Heights', value: 3_000_000, percent: 19.0, type: 'completed_rental' },
        { name: 'The Yaba Hub', value: 2_500_000, percent: 15.9, type: 'mixed_use' },
        { name: 'Campus Quarters', value: 5_250_000, percent: 33.3, type: 'student_housing' },
      ],

      // Monthly rental income data (last 12 months)
      monthlyReturns: [
        { month: 'Jan 2024', rentalIncome: 125_000, dividends: 125_000, total: 125_000 },
        { month: 'Feb 2024', rentalIncome: 125_000, dividends: 125_000, total: 125_000 },
        { month: 'Mar 2024', rentalIncome: 137_500, dividends: 137_500, total: 137_500 },
        { month: 'Apr 2024', rentalIncome: 137_500, dividends: 137_500, total: 137_500 },
        { month: 'May 2024', rentalIncome: 150_000, dividends: 150_000, total: 150_000 },
        { month: 'Jun 2024', rentalIncome: 150_000, dividends: 150_000, total: 150_000 },
        { month: 'Jul 2024', rentalIncome: 175_000, dividends: 175_000, total: 175_000 },
        { month: 'Aug 2024', rentalIncome: 187_500, dividends: 187_500, total: 187_500 },
        { month: 'Sep 2024', rentalIncome: 187_500, dividends: 187_500, total: 187_500 },
        { month: 'Oct 2024', rentalIncome: 200_000, dividends: 200_000, total: 200_000 },
        { month: 'Nov 2024', rentalIncome: 200_000, dividends: 200_000, total: 200_000 },
        { month: 'Dec 2024', rentalIncome: 312_500, dividends: 312_500, total: 312_500 },
      ],

      // Recent transactions
      recentTransactions: [
        {
          id: 'TXN-20241201-002',
          type: 'dividend',
          amount: 112_500,
          status: 'completed',
          description: 'Q4 2024 Rental Distribution — Azure Heights',
          date: '2024-12-01',
        },
        {
          id: 'TXN-20241201-001',
          type: 'dividend',
          amount: 187_500,
          status: 'completed',
          description: 'Q4 2024 Rental Distribution — The Lekki Residence',
          date: '2024-12-01',
        },
        {
          id: 'TXN-20241020-001',
          type: 'credit',
          amount: 5_250_000,
          status: 'completed',
          description: 'Investment in Campus Quarters',
          date: '2024-10-20',
        },
        {
          id: 'TXN-20240910-001',
          type: 'credit',
          amount: 2_500_000,
          status: 'completed',
          description: 'Investment in The Yaba Hub',
          date: '2024-09-10',
        },
        {
          id: 'TXN-20240802-001',
          type: 'credit',
          amount: 3_000_000,
          status: 'completed',
          description: 'Investment in Azure Heights',
          date: '2024-08-02',
        },
      ],

      // Portfolio performance over time
      portfolioGrowth: [
        { month: 'Jul 2024', value: 5_000_000 },
        { month: 'Aug 2024', value: 8_000_000 },
        { month: 'Sep 2024', value: 10_500_000 },
        { month: 'Oct 2024', value: 15_750_000 },
        { month: 'Nov 2024', value: 16_800_000 },
        { month: 'Dec 2024', value: 18_090_000 },
      ],
    };

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
