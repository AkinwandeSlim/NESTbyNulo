import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { jsonSafe } from '@/lib/json-safe';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get('type');
    const city = searchParams.get('city');
    const featured = searchParams.get('featured');
    const trending = searchParams.get('trending');
    const status = searchParams.get('status');
    const riskRating = searchParams.get('riskRating');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    // Build where clause
    const where: Record<string, unknown> = {
      status: { in: ['published', 'funding'] },
    };

    if (type) where.propertyType = type;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (featured === 'true') where.featured = true;
    if (trending === 'true') where.trending = true;
    if (status) where.status = status;
    if (riskRating) where.riskRating = riskRating;

    // Build orderBy
    const orderByMap: Record<string, string> = {
      createdAt: 'createdAt',
      totalValue: 'totalValue',
      rentalYield: 'rentalYield',
      expectedIRR: 'expectedIRR',
      fundingRaised: 'fundingRaised',
    };

    const orderByField = orderByMap[sort] || 'createdAt';
    // Computed-key object: accepted by the client's PropertyOrderBy union, so
    // no @ts-expect-error is needed (the old directive had become unused and
    // made tsc fail with TS2578).
    const orderBy = { [orderByField]: order === 'asc' ? 'asc' : 'desc' };

    // Fetch with pagination
    const [properties, total] = await Promise.all([
      db.property.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          developer: {
            select: {
              id: true,
              companyName: true,
              logo: true,
              rating: true,
              isVerified: true,
              totalProjects: true,
            },
          },
          opportunity: {
            select: {
              id: true,
              fundingStartDate: true,
              fundingEndDate: true,
              minInvestment: true,
              maxInvestment: true,
              currentInvestors: true,
              maxInvestors: true,
            },
          },
        },
      }),
      db.property.count({ where }),
    ]);

    // Parse images JSON
    const formattedProperties = properties.map((property) => ({
      ...property,
      images: JSON.parse(property.images),
      fundingProgress: Math.round(
        (property.fundingRaised / property.fundingTarget) * 100
      ),
      fundingRemaining: property.fundingTarget - property.fundingRaised,
    }));

    // jsonSafe: the spread rows carry BigInt kobo columns, which
    // JSON.stringify cannot serialize (it would 500 the whole listing).
    return NextResponse.json(
      jsonSafe({
        properties: formattedProperties,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        filters: {
          type,
          city,
          featured,
          trending,
          status,
          riskRating,
        },
      })
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}
