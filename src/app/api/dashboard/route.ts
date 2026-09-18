import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // ─── AGGREGATE FROM DB ───
    const properties = await db.property.findMany({
      where: { status: { in: ['published', 'funding'] } },
      include: {
        developer: {
          select: {
            companyName: true,
            isVerified: true,
          },
        },
      },
    });

    const totalProperties = properties.length;
    const totalFundingTarget = properties.reduce((sum, p) => sum + p.fundingTarget, 0);
    const totalFundingRaised = properties.reduce((sum, p) => sum + p.fundingRaised, 0);
    const avgYield = properties.reduce((sum, p) => sum + (p.rentalYield || 0), 0) / totalProperties;

    // Top properties by funding raised
    const topProperties = [...properties]
      .sort((a, b) => b.fundingRaised - a.fundingRaised)
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        propertyType: p.propertyType,
        city: p.city,
        state: p.state,
        totalValue: p.totalValue,
        fundingTarget: p.fundingTarget,
        fundingRaised: p.fundingRaised,
        fundingProgress: Math.round((p.fundingRaised / p.fundingTarget) * 100),
        rentalYield: p.rentalYield,
        expectedIRR: p.expectedIRR,
        riskRating: p.riskRating,
        status: p.status,
        developer: p.developer?.companyName,
        coverImage: p.coverImage,
      }));

    const dashboard = {
      // ─── KEY METRICS ───
      assetsUnderManagement: totalFundingTarget,
      capitalRaised: totalFundingRaised,
      fundingProgress: Math.round((totalFundingRaised / totalFundingTarget) * 100),
      revenue: 124_500_000, // Platform revenue (fees, commissions)

      // ─── GROWTH METRICS ───
      platformGrowth: 23.4, // % month over month

      // ─── INVESTOR METRICS ───
      investorCount: 1_247,
      newInvestors: 186, // This month
      activeInvestments: 3_891,
      avgInvestmentSize: 4_250_000,

      // ─── PROPERTY METRICS ───
      totalProperties,
      publishedProperties: properties.filter((p) => p.status === 'published').length,
      fundingProperties: properties.filter((p) => p.status === 'funding').length,
      occupancy: 94.2,
      vacancy: 5.8,
      avgYield: Math.round(avgYield * 10) / 10,
      avgIRR: Math.round(properties.reduce((s, p) => s + (p.expectedIRR || 0), 0) / totalProperties * 10) / 10,

      // ─── FINANCIAL HEALTH ───
      cashPosition: 458_000_000,
      pendingDisbursements: 78_500_000,
      monthlyOperatingCosts: 12_300_000,
      netIncome: 18_700_000,

      // ─── MONTHLY GROWTH DATA (12 months) ───
      monthlyGrowth: [
        {
          month: 'Jan 2024',
          investments: 42_000_000,
          investors: 680,
          properties: 3,
          revenue: 8_400_000,
        },
        {
          month: 'Feb 2024',
          investments: 56_000_000,
          investors: 745,
          properties: 4,
          revenue: 9_200_000,
        },
        {
          month: 'Mar 2024',
          investments: 78_000_000,
          investors: 820,
          properties: 4,
          revenue: 10_800_000,
        },
        {
          month: 'Apr 2024',
          investments: 95_000_000,
          investors: 890,
          properties: 5,
          revenue: 11_500_000,
        },
        {
          month: 'May 2024',
          investments: 120_000_000,
          investors: 968,
          properties: 6,
          revenue: 12_000_000,
        },
        {
          month: 'Jun 2024',
          investments: 145_000_000,
          investors: 1_020,
          properties: 6,
          revenue: 13_200_000,
        },
        {
          month: 'Jul 2024',
          investments: 180_000_000,
          investors: 1_075,
          properties: 7,
          revenue: 14_500_000,
        },
        {
          month: 'Aug 2024',
          investments: 210_000_000,
          investors: 1120,
          properties: 7,
          revenue: 15_800_000,
        },
        {
          month: 'Sep 2024',
          investments: 245_000_000,
          investors: 1156,
          properties: 8,
          revenue: 16_200_000,
        },
        {
          month: 'Oct 2024',
          investments: 280_000_000,
          investors: 1190,
          properties: 8,
          revenue: 17_400_000,
        },
        {
          month: 'Nov 2024',
          investments: 310_000_000,
          investors: 1215,
          properties: 8,
          revenue: 18_000_000,
        },
        {
          month: 'Dec 2024',
          investments: 340_000_000,
          investors: 1_247,
          properties: 8,
          revenue: 19_500_000,
        },
      ],

      // ─── TOP PROPERTIES ───
      topProperties,

      // ─── PROPERTY TYPE BREAKDOWN ───
      propertyTypeBreakdown: [
        { type: 'completed_rental', count: properties.filter((p) => p.propertyType === 'completed_rental').length, value: properties.filter((p) => p.propertyType === 'completed_rental').reduce((s, p) => s + p.totalValue, 0) },
        { type: 'off_plan', count: properties.filter((p) => p.propertyType === 'off_plan').length, value: properties.filter((p) => p.propertyType === 'off_plan').reduce((s, p) => s + p.totalValue, 0) },
        { type: 'mixed_use', count: properties.filter((p) => p.propertyType === 'mixed_use').length, value: properties.filter((p) => p.propertyType === 'mixed_use').reduce((s, p) => s + p.totalValue, 0) },
        { type: 'student_housing', count: properties.filter((p) => p.propertyType === 'student_housing').length, value: properties.filter((p) => p.propertyType === 'student_housing').reduce((s, p) => s + p.totalValue, 0) },
        { type: 'commercial', count: properties.filter((p) => p.propertyType === 'commercial').length, value: properties.filter((p) => p.propertyType === 'commercial').reduce((s, p) => s + p.totalValue, 0) },
        { type: 'affordable_housing', count: properties.filter((p) => p.propertyType === 'affordable_housing').length, value: properties.filter((p) => p.propertyType === 'affordable_housing').reduce((s, p) => s + p.totalValue, 0) },
      ],

      // ─── GEOGRAPHIC BREAKDOWN ───
      geographicBreakdown: [
        { state: 'Lagos', count: properties.filter((p) => p.state === 'Lagos').length, value: properties.filter((p) => p.state === 'Lagos').reduce((s, p) => s + p.totalValue, 0) },
        { state: 'Osun', count: properties.filter((p) => p.state === 'Osun').length, value: properties.filter((p) => p.state === 'Osun').reduce((s, p) => s + p.totalValue, 0) },
      ],
    };

    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
