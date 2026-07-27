import { db } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding NEST by Nulo Africa database...\n');

  // ─── CLEAN EXISTING DATA ───
  console.log('Cleaning existing data...');
  const deleteOrder = [
    'LearningProgress',
    'Referral',
    'AuditLog',
    'SupportTicket',
    'Notification',
    'Transaction',
    'Investment',
    'MaintenanceRequest',
    'PropertyMedia',
    'PropertyDocument',
    'Valuation',
    'RentalDistribution',
    'InvestmentOpportunity',
    'SPV',
    'Property',
    'Wallet',
    'PropertyManagerProfile',
    'DeveloperProfile',
    'InvestorProfile',
    'User',
  ];

  for (const model of deleteOrder) {
    // @ts-expect-error dynamic model name
    await db[model].deleteMany();
    console.log(`  ✓ Cleared ${model}`);
  }

  // ─── USERS ───
  console.log('\n👤 Creating users...');

  const admin = await db.user.create({
    data: {
      email: 'admin@nestnulo.com',
      phone: '+234 801 000 0001',
      firstName: 'Adebayo',
      lastName: 'Ogunlesi',
      role: 'admin',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-01-15'),
      isVerified: true,
      lastLoginAt: new Date(),
    },
  });
  console.log(`  ✓ Admin: ${admin.firstName} ${admin.lastName} (${admin.email})`);

  const investorUser = await db.user.create({
    data: {
      email: 'chioma.adewale@gmail.com',
      phone: '+234 802 345 6789',
      firstName: 'Chioma',
      lastName: 'Adewale',
      role: 'investor',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-03-10'),
      isVerified: true,
      lastLoginAt: new Date(),
    },
  });
  console.log(`  ✓ Investor: ${investorUser.firstName} ${investorUser.lastName} (${investorUser.email})`);

  const developerUser = await db.user.create({
    data: {
      email: 'info@primecrestng.com',
      phone: '+234 803 987 6543',
      firstName: 'Emeka',
      lastName: 'Nwosu',
      role: 'developer',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-02-20'),
      isVerified: true,
      lastLoginAt: new Date(),
    },
  });
  console.log(`  ✓ Developer: ${developerUser.firstName} ${developerUser.lastName} (${developerUser.email})`);

  // ─── PROFILES ───
  console.log('\n📋 Creating profiles...');

  const investorProfile = await db.investorProfile.create({
    data: {
      userId: investorUser.id,
      riskTolerance: 'moderate',
      investmentGoal: 'Long-term wealth building through rental income and capital appreciation',
      totalInvested: 15_750_000,
      totalReturns: 2_340_000,
      portfolioValue: 18_090_000,
      rentalIncomeEarned: 1_890_000,
      propertiesOwned: 4,
      preferredCurrency: 'NGN',
      annualIncomeRange: '10M-25M',
      netWorthRange: '25M-50M',
      accredited: true,
    },
  });
  console.log(`  ✓ Investor Profile: ₦${investorProfile.totalInvested.toLocaleString()} invested`);

  const developerProfile = await db.developerProfile.create({
    data: {
      userId: developerUser.id,
      companyName: 'PrimeCrest Developments Nigeria Ltd',
      registrationNo: 'RC-1234567',
      website: 'https://primecrestng.com',
      description:
        'PrimeCrest Developments is a leading Nigerian real estate development company with over 15 years of experience in residential and commercial property development across Lagos, Abuja, and Port Harcourt. We focus on quality, sustainability, and delivering exceptional returns for our investors.',
      logo: '/api/placeholder/logo/200/200',
      hqAddress: '14A Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
      foundedYear: 2009,
      totalProjects: 42,
      totalFunding: 28_500_000_000,
      isVerified: true,
      rating: 4.8,
    },
  });
  console.log(`  ✓ Developer Profile: ${developerProfile.companyName}`);

  // ─── PROPERTIES ───
  console.log('\n🏢 Creating properties...');

  const properties = [
    {
      title: 'The Lekki Residence',
      slug: 'the-lekki-residence',
      description:
        'A stunning luxury 4-bedroom detached duplex in the heart of Lekki Phase 1, featuring modern architectural design, premium finishes, and a private garden. This completed property is already generating consistent rental income from a corporate tenant on a 2-year lease. Located on a quiet, paved street with 24/7 security, the property offers an excellent combination of capital appreciation and steady rental returns.',
      shortDescription: 'Luxury 4-bedroom detached duplex in Lekki Phase 1, already generating rental income.',
      propertyType: 'completed_rental',
      status: 'published',
      address: '21A Admiralty Way, Lekki Phase 1',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4391,
      longitude: 3.4705,
      totalUnits: 1,
      totalValue: 185_000_000,
      minInvestment: 500_000,
      maxInvestment: 18_500_000,
      fundingTarget: 185_000_000,
      fundingRaised: 155_250_000,
      rentalYield: 9.5,
      expectedIRR: 18.5,
      riskRating: 'low',
      investmentTimeline: 'Already generating income',
      images: JSON.stringify([
        '/api/placeholder/property/800/600',
        '/api/placeholder/property/800/600?img=2',
        '/api/placeholder/property/800/600?img=3',
        '/api/placeholder/property/800/600?img=4',
        '/api/placeholder/property/800/600?img=5',
      ]),
      coverImage: '/api/placeholder/property/800/600',
      featured: true,
      trending: true,
      isNew: false,
      developerId: developerProfile.id,
    },
    {
      title: 'Azure Heights',
      slug: 'azure-heights',
      description:
        'Azure Heights is a premium 12-unit apartment complex on Victoria Island, Lagos. Each unit features panoramic lagoon views, contemporary interiors with high-end finishes, and access to shared amenities including a swimming pool, gym, and 24-hour concierge. The building is strategically located near major business districts, making it highly attractive to expatriates and corporate executives.',
      shortDescription: 'Premium 12-unit apartment complex on Victoria Island with lagoon views.',
      propertyType: 'completed_rental',
      status: 'published',
      address: 'Plot 5, Ozumba Mbadiwe Avenue, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4281,
      longitude: 3.4219,
      totalUnits: 12,
      totalValue: 420_000_000,
      minInvestment: 500_000,
      maxInvestment: 35_000_000,
      fundingTarget: 420_000_000,
      fundingRaised: 378_000_000,
      rentalYield: 8.2,
      expectedIRR: 16.8,
      riskRating: 'low',
      investmentTimeline: 'Already generating income',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=a1',
        '/api/placeholder/property/800/600?img=a2',
        '/api/placeholder/property/800/600?img=a3',
        '/api/placeholder/property/800/600?img=a4',
        '/api/placeholder/property/800/600?img=a5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=a1',
      featured: true,
      trending: false,
      isNew: false,
      developerId: developerProfile.id,
    },
    {
      title: 'Coral Bay Estate',
      slug: 'coral-bay-estate',
      description:
        'Coral Bay Estate is an ambitious waterfront off-plan development along the Epe expressway. This master-planned community will feature 24 modern townhouses with direct lagoon access, a private jetty, communal gardens, and a clubhouse. Epe is one of Lagos fastest-growing corridors, driven by the new international airport and free trade zone developments, offering exceptional capital growth potential.',
      shortDescription: 'Off-plan waterfront townhouses in Epe, Lagos — high growth corridor.',
      propertyType: 'off_plan',
      status: 'funding',
      address: 'Epe Expressway, Before Epe Toll Gate, Epe',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.6473,
      longitude: 3.9764,
      totalUnits: 24,
      totalValue: 360_000_000,
      minInvestment: 500_000,
      maxInvestment: 15_000_000,
      fundingTarget: 360_000_000,
      fundingRaised: 151_200_000,
      rentalYield: 7.5,
      expectedIRR: 26.0,
      riskRating: 'high',
      investmentTimeline: '18-24 months',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=c1',
        '/api/placeholder/property/800/600?img=c2',
        '/api/placeholder/property/800/600?img=c3',
        '/api/placeholder/property/800/600?img=c4',
        '/api/placeholder/property/800/600?img=c5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=c1',
      featured: true,
      trending: true,
      isNew: true,
      developerId: developerProfile.id,
    },
    {
      title: 'Greenfield Gardens',
      slug: 'greenfield-gardens',
      description:
        'Greenfield Gardens is an affordable off-plan housing development in Ibeju-Lekki, designed to meet the growing demand for quality homes in one of Lagos most promising corridors. The development comprises 48 terrace duplexes with modern amenities including a central park, playground, and gated security. With the Lekki Free Trade Zone and Dangote Refinery nearby, this area is poised for significant property value appreciation.',
      shortDescription: 'Off-plan affordable terrace duplexes in Ibeju-Lekki — strong appreciation potential.',
      propertyType: 'off_plan',
      status: 'funding',
      address: 'Ibeju-Lekki Expressway, After Eleko Junction, Ibeju-Lekki',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4531,
      longitude: 3.9497,
      totalUnits: 48,
      totalValue: 240_000_000,
      minInvestment: 500_000,
      maxInvestment: 5_000_000,
      fundingTarget: 240_000_000,
      fundingRaised: 120_000_000,
      rentalYield: 6.8,
      expectedIRR: 22.5,
      riskRating: 'moderate',
      investmentTimeline: '12-18 months',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=g1',
        '/api/placeholder/property/800/600?img=g2',
        '/api/placeholder/property/800/600?img=g3',
        '/api/placeholder/property/800/600?img=g4',
        '/api/placeholder/property/800/600?img=g5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=g1',
      featured: false,
      trending: false,
      isNew: true,
      developerId: developerProfile.id,
    },
    {
      title: 'The Yaba Hub',
      slug: 'the-yaba-hub',
      description:
        'The Yaba Hub is a mixed-use development combining modern co-living spaces with ground-floor retail units in Lagos tech district. The property features 8 co-living units, 4 retail spaces, a rooftop lounge, and co-working areas. Located on Herbert Macaulay Way, the property sits in the heart of Yabas booming startup ecosystem, ensuring strong demand from young professionals and tech companies.',
      shortDescription: 'Mixed-use co-living and retail spaces in Yaba tech district.',
      propertyType: 'mixed_use',
      status: 'published',
      address: '45 Herbert Macaulay Way, Yaba',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.5089,
      longitude: 3.3809,
      totalUnits: 12,
      totalValue: 195_000_000,
      minInvestment: 500_000,
      maxInvestment: 16_250_000,
      fundingTarget: 195_000_000,
      fundingRaised: 166_000_000,
      rentalYield: 11.0,
      expectedIRR: 21.0,
      riskRating: 'moderate',
      investmentTimeline: 'Already generating income',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=y1',
        '/api/placeholder/property/800/600?img=y2',
        '/api/placeholder/property/800/600?img=y3',
        '/api/placeholder/property/800/600?img=y4',
        '/api/placeholder/property/800/600?img=y5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=y1',
      featured: false,
      trending: true,
      isNew: false,
      developerId: developerProfile.id,
    },
    {
      title: 'Campus Quarters',
      slug: 'campus-quarters',
      description:
        'Campus Quarters is a purpose-built student housing development located just 500 metres from the Obafemi Awolowo University main campus in Ile-Ife. The property features 32 fully furnished en-suite rooms, common areas, study rooms, high-speed internet, 24-hour security, and laundry facilities. With OAU having over 35,000 students and severe hostel shortages, this property offers reliable year-round rental income.',
      shortDescription: 'Purpose-built student housing near OAU, Ile-Ife — strong rental demand.',
      propertyType: 'student_housing',
      status: 'published',
      address: 'Campus Road, Adjacent OAU Main Gate, Ile-Ife',
      city: 'Ile-Ife',
      state: 'Osun',
      country: 'Nigeria',
      latitude: 7.5186,
      longitude: 4.5241,
      totalUnits: 32,
      totalValue: 96_000_000,
      minInvestment: 500_000,
      maxInvestment: 3_000_000,
      fundingTarget: 96_000_000,
      fundingRaised: 76_800_000,
      rentalYield: 12.0,
      expectedIRR: 19.5,
      riskRating: 'low',
      investmentTimeline: 'Already generating income',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=s1',
        '/api/placeholder/property/800/600?img=s2',
        '/api/placeholder/property/800/600?img=s3',
        '/api/placeholder/property/800/600?img=s4',
        '/api/placeholder/property/800/600?img=s5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=s1',
      featured: false,
      trending: false,
      isNew: false,
      developerId: developerProfile.id,
    },
    {
      title: 'Marina Tower',
      slug: 'marina-tower',
      description:
        'Marina Tower is a Grade A commercial office development on Victoria Island, offering 6 floors of premium office space with cutting-edge facilities. The building features fiber optic internet, backup power generation, advanced HVAC systems, and ample parking. Positioned on the Lagos Marina waterfront, it caters to multinational corporations, financial institutions, and tech companies seeking world-class office accommodation in West Africas commercial capital.',
      shortDescription: 'Grade A commercial office tower on Victoria Island, Lagos Marina.',
      propertyType: 'commercial',
      status: 'published',
      address: '1A Marina Boulevard, Victoria Island, Lagos',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4235,
      longitude: 3.4145,
      totalUnits: 6,
      totalValue: 500_000_000,
      minInvestment: 500_000,
      maxInvestment: 50_000_000,
      fundingTarget: 500_000_000,
      fundingRaised: 425_000_000,
      rentalYield: 8.8,
      expectedIRR: 15.0,
      riskRating: 'moderate',
      investmentTimeline: 'Already generating income',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=m1',
        '/api/placeholder/property/800/600?img=m2',
        '/api/placeholder/property/800/600?img=m3',
        '/api/placeholder/property/800/600?img=m4',
        '/api/placeholder/property/800/600?img=m5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=m1',
      featured: false,
      trending: false,
      isNew: true,
      developerId: developerProfile.id,
    },
    {
      title: 'Heritage Homes',
      slug: 'heritage-homes',
      description:
        'Heritage Homes is an affordable housing community in Badagry, designed to provide quality, modern homes for first-time buyers and middle-income families. The development features 36 units of 2-bedroom and 3-bedroom bungalows with shared amenities including a playground, community centre, and green spaces. Badagry is experiencing rapid growth with improved road infrastructure connecting to Lagos mainland.',
      shortDescription: 'Affordable housing community in Badagry with modern bungalows.',
      propertyType: 'affordable_housing',
      status: 'funding',
      address: 'Awhanjigben Road, Badagry, Lagos',
      city: 'Badagry',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.4177,
      longitude: 2.8827,
      totalUnits: 36,
      totalValue: 108_000_000,
      minInvestment: 500_000,
      maxInvestment: 3_000_000,
      fundingTarget: 108_000_000,
      fundingRaised: 48_600_000,
      rentalYield: 7.0,
      expectedIRR: 20.0,
      riskRating: 'moderate',
      investmentTimeline: '12-18 months',
      images: JSON.stringify([
        '/api/placeholder/property/800/600?img=h1',
        '/api/placeholder/property/800/600?img=h2',
        '/api/placeholder/property/800/600?img=h3',
        '/api/placeholder/property/800/600?img=h4',
        '/api/placeholder/property/800/600?img=h5',
      ]),
      coverImage: '/api/placeholder/property/800/600?img=h1',
      featured: false,
      trending: false,
      isNew: true,
      developerId: developerProfile.id,
    },
  ];

  const createdProperties = [];
  for (const prop of properties) {
    const created = await db.property.create({ data: prop });
    createdProperties.push(created);
    const pct = ((created.fundingRaised / created.fundingTarget) * 100).toFixed(1);
    console.log(
      `  ✓ ${created.title} — ₦${(created.totalValue / 1_000_000).toFixed(0)}M | ${pct}% funded | ${created.city}`
    );
  }

  // ─── INVESTMENT OPPORTUNITIES ───
  console.log('\n📊 Creating investment opportunities...');

  for (const property of createdProperties) {
    const startDate = new Date('2024-06-01');
    const endDate = property.status === 'funding' ? new Date('2025-06-01') : new Date('2024-12-31');

    await db.investmentOpportunity.create({
      data: {
        propertyId: property.id,
        investmentMemo: `Investment Memorandum for ${property.title}. This document outlines the investment thesis, risk factors, financial projections, and terms for fractional ownership of this property through NEST by Nulo Africa.`,
        financialSummary: JSON.stringify({
          projectedAnnualReturn: property.rentalYield,
          projectedIRR: property.expectedIRR,
          holdPeriod: property.investmentTimeline,
          exitStrategy: 'Refinancing or Sale after hold period',
          projectedCapitalGrowth: `${((property.expectedIRR || 0) - (property.rentalYield || 0)).toFixed(1)}% annually`,
        }),
        fundingStartDate: startDate,
        fundingEndDate: endDate,
        minInvestment: property.minInvestment,
        maxInvestment: property.maxInvestment,
        maxInvestors: property.totalUnits ? property.totalUnits * 5 : 50,
        currentInvestors: Math.floor(
          (property.fundingRaised / property.minInvestment) * (0.6 + Math.random() * 0.3)
        ),
        spvName: `${property.title.replace(/\s+/g, '')} SPV Ltd`,
        spvStructure: 'Limited Liability Company (LTD)',
        faq: JSON.stringify([
          { q: 'What is the minimum investment?', a: `₦${property.minInvestment.toLocaleString()}` },
          { q: 'What returns can I expect?', a: `Up to ${property.rentalYield}% rental yield and ${property.expectedIRR}% IRR` },
          { q: 'How is my investment protected?', a: 'Your investment is held in a Special Purpose Vehicle (SPV) with the property as its sole asset.' },
          { q: 'Can I exit early?', a: 'Secondary market trading will be available after the initial lock-up period.' },
        ]),
      },
    });
    console.log(`  ✓ Opportunity: ${property.title}`);
  }

  // ─── WALLET FOR INVESTOR ───
  console.log('\n💰 Creating wallets...');
  await db.wallet.create({
    data: {
      userId: investorUser.id,
      balance: 2_500_000,
      currency: 'NGN',
    },
  });
  console.log('  ✓ Investor wallet created');

  // ─── SAMPLE INVESTMENTS ───
  console.log('\n📈 Creating sample investments...');

  const investmentData = [
    { propertyIdx: 0, amount: 5_000_000, status: 'confirmed', investedAt: '2024-07-15' },
    { propertyIdx: 1, amount: 3_000_000, status: 'confirmed', investedAt: '2024-08-02' },
    { propertyIdx: 4, amount: 2_500_000, status: 'confirmed', investedAt: '2024-09-10' },
    { propertyIdx: 5, amount: 5_250_000, status: 'confirmed', investedAt: '2024-10-20' },
  ];

  for (const inv of investmentData) {
    const property = createdProperties[inv.propertyIdx];
    await db.investment.create({
      data: {
        userId: investorUser.id,
        propertyId: property.id,
        amount: inv.amount,
        units: inv.amount / 500_000,
        status: inv.status,
        paymentMethod: 'bank_transfer',
        investedAt: new Date(inv.investedAt),
        confirmedAt: new Date(inv.investedAt),
        certificateNo: `NEST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        rentalYield: property.rentalYield,
        expectedReturn: inv.amount * (property.expectedIRR / 100),
      },
    });
    console.log(`  ✓ Investment: ₦${inv.amount.toLocaleString()} in ${property.title}`);
  }

  // ─── SAMPLE TRANSACTIONS ───
  console.log('\n💳 Creating sample transactions...');

  await db.transaction.createMany({
    data: [
      {
        userId: investorUser.id,
        type: 'credit',
        amount: 5_000_000,
        status: 'completed',
        reference: 'TXN-20240715-001',
        description: 'Investment in The Lekki Residence',
        createdAt: new Date('2024-07-15'),
      },
      {
        userId: investorUser.id,
        type: 'credit',
        amount: 3_000_000,
        status: 'completed',
        reference: 'TXN-20240802-001',
        description: 'Investment in Azure Heights',
        createdAt: new Date('2024-08-02'),
      },
      {
        userId: investorUser.id,
        type: 'credit',
        amount: 2_500_000,
        status: 'completed',
        reference: 'TXN-20240910-001',
        description: 'Investment in The Yaba Hub',
        createdAt: new Date('2024-09-10'),
      },
      {
        userId: investorUser.id,
        type: 'credit',
        amount: 5_250_000,
        status: 'completed',
        reference: 'TXN-20241020-001',
        description: 'Investment in Campus Quarters',
        createdAt: new Date('2024-10-20'),
      },
      {
        userId: investorUser.id,
        type: 'dividend',
        amount: 187_500,
        status: 'completed',
        reference: 'TXN-20241201-001',
        description: 'Q4 2024 Rental Distribution — The Lekki Residence',
        createdAt: new Date('2024-12-01'),
      },
      {
        userId: investorUser.id,
        type: 'dividend',
        amount: 112_500,
        status: 'completed',
        reference: 'TXN-20241201-002',
        description: 'Q4 2024 Rental Distribution — Azure Heights',
        createdAt: new Date('2024-12-01'),
      },
    ],
  });
  console.log('  ✓ 6 transactions created');

  // ─── PROPERTY DOCUMENTS ───
  console.log('\n📄 Creating property documents...');

  const documentTypes = [
    { title: 'Title Deed', type: 'legal' },
    { title: 'Building Plan Approval', type: 'regulatory' },
    { title: 'Environmental Impact Assessment', type: 'environmental' },
    { title: 'Property Valuation Report', type: 'financial' },
  ];

  for (const property of createdProperties) {
    await db.propertyDocument.createMany({
      data: documentTypes.map((doc, idx) => ({
        propertyId: property.id,
        title: doc.title,
        type: doc.type,
        fileUrl: `/api/placeholder/document/${property.slug}-${idx}`,
        fileSize: Math.floor(Math.random() * 5_000_000) + 500_000,
        mimeType: 'application/pdf',
      })),
    });
  }
  console.log(`  ✓ ${createdProperties.length * documentTypes.length} documents created`);

  // ─── PROPERTY MEDIA ───
  console.log('\n🎬 Creating property media...');

  for (const property of createdProperties) {
    await db.propertyMedia.createMany({
      data: [
        { propertyId: property.id, type: 'image', url: `/api/placeholder/property/800/600?img=hero-${property.slug}`, caption: `${property.title} — Exterior View`, sortOrder: 0 },
        { propertyId: property.id, type: 'image', url: `/api/placeholder/property/800/600?img=int-${property.slug}`, caption: `${property.title} — Interior View`, sortOrder: 1 },
        { propertyId: property.id, type: 'image', url: `/api/placeholder/property/800/600?img=floor-${property.slug}`, caption: `${property.title} — Floor Plan`, sortOrder: 2 },
        { propertyId: property.id, type: 'image', url: `/api/placeholder/property/800/600?img=area-${property.slug}`, caption: `${property.title} — Surrounding Area`, sortOrder: 3 },
        { propertyId: property.id, type: 'video', url: 'https://example.com/video.mp4', caption: `${property.title} — Virtual Tour`, sortOrder: 4 },
      ],
    });
  }
  console.log(`  ✓ ${createdProperties.length * 5} media items created`);

  // ─── SUMMARY ───
  console.log('\n' + '='.repeat(60));
  console.log('✅ NEST by Nulo Africa — Seed Complete!');
  console.log('='.repeat(60));
  console.log(`  👤 Users:              3`);
  console.log(`  📋 Profiles:           2 (investor + developer)`);
  console.log(`  🏢 Properties:         ${createdProperties.length}`);
  console.log(`  📊 Opportunities:      ${createdProperties.length}`);
  console.log(`  📈 Investments:         ${investmentData.length}`);
  console.log(`  💳 Transactions:        6`);
  console.log(`  📄 Documents:          ${createdProperties.length * documentTypes.length}`);
  console.log(`  🎬 Media:              ${createdProperties.length * 5}`);
  console.log(`  💰 Total Property Value: ₦${(createdProperties.reduce((s, p) => s + p.totalValue, 0) / 1_000_000_000).toFixed(2)}B`);
  console.log(`  💰 Total Funding Raised: ₦${(createdProperties.reduce((s, p) => s + p.fundingRaised, 0) / 1_000_000_000).toFixed(2)}B`);
  console.log('='.repeat(60));
}

seed()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
