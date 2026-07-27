import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const property = await db.property.findUnique({
      where: { slug },
      include: {
        developer: {
          select: {
            id: true,
            companyName: true,
            registrationNo: true,
            website: true,
            description: true,
            logo: true,
            hqAddress: true,
            foundedYear: true,
            totalProjects: true,
            totalFunding: true,
            isVerified: true,
            rating: true,
          },
        },
        propertyManager: {
          select: {
            id: true,
            companyName: true,
            licenseNo: true,
            description: true,
            logo: true,
            phone: true,
            email: true,
            managedCount: true,
            rating: true,
            isVerified: true,
          },
        },
        opportunity: true,
        documents: {
          orderBy: { createdAt: 'asc' },
        },
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        valuations: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Parse JSON fields
    const formattedProperty = {
      ...property,
      images: JSON.parse(property.images),
      fundingProgress: Math.round(
        (property.fundingRaised / property.fundingTarget) * 100
      ),
      fundingRemaining: property.fundingTarget - property.fundingRaised,
      opportunity: property.opportunity
        ? {
            ...property.opportunity,
            financialSummary: property.opportunity.financialSummary
              ? JSON.parse(property.opportunity.financialSummary)
              : null,
            faq: property.opportunity.faq
              ? JSON.parse(property.opportunity.faq)
              : null,
          }
        : null,
    };

    // Fetch similar properties (same type, different id)
    const similarProperties = await db.property.findMany({
      where: {
        id: { not: property.id },
        propertyType: property.propertyType,
        status: { in: ['published', 'funding'] },
      },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        propertyType: true,
        status: true,
        city: true,
        state: true,
        totalValue: true,
        minInvestment: true,
        rentalYield: true,
        expectedIRR: true,
        riskRating: true,
        coverImage: true,
        fundingRaised: true,
        fundingTarget: true,
      },
    });

    return NextResponse.json({
      property: formattedProperty,
      similarProperties: similarProperties.map((p) => ({
        ...p,
        fundingProgress: Math.round((p.fundingRaised / p.fundingTarget) * 100),
      })),
    });
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
}
