// MERGE NOTE: explicit .ts extensions keep `node prisma/seed.ts` (Node 24
// native type-stripping, ESM) working without a bundler/ts-node. Node resolves
// extensionless specifiers only for CommonJS; TS files run as ESM here.
import { db } from '../src/lib/db.ts';
import { hashPassword } from '../src/lib/password.ts';

/**
 * MERGE NOTE (dev_gstack backend merge, Features #1-#5):
 * This seed now provisions a demo-ready dataset for the merged app:
 *  - users carry the authorization columns (role INVESTOR/ADMIN uppercase,
 *    status VERIFIED/PENDING, passwordHash) that requireInvestor/requireAdmin
 *    check, so the seeded accounts can actually sign in via /api/auth/login;
 *  - every money figure exists twice: the legacy Float columns the existing UI
 *    reads, and the BigInt kobo columns the ledger/investment engine uses
 *    (amountKobo / balanceKobo / fundedKobo / targetKobo / valuationKobo);
 *  - the investor's wallet history is written as a real append-only ledger
 *    (CREDIT/DEBIT rows), so SUM(credits) - SUM(debits) === Wallet.balanceKobo.
 */

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
      // Uppercase + status are what requireAdmin()/requireInvestor() compare.
      role: 'ADMIN',
      status: 'VERIFIED',
      authSource: 'DEV_FALLBACK',
      passwordHash: hashPassword('Admin@12345'),
      verifiedAt: new Date('2024-01-15'),
      verifiedBy: 'seed',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-01-15'),
      isVerified: true,
      lastLoginAt: new Date(),
    },
  });
  console.log(`  ✓ Admin: ${admin.firstName} ${admin.lastName} (${admin.email}) [Admin@12345]`);

  const investorUser = await db.user.create({
    data: {
      email: 'chioma.adewale@gmail.com',
      phone: '+234 802 345 6789',
      firstName: 'Chioma',
      lastName: 'Adewale',
      role: 'INVESTOR',
      status: 'VERIFIED',
      authSource: 'DEV_FALLBACK',
      // VERIFIED is required before /api/investments will accept a debit.
      passwordHash: hashPassword('Investor@12345'),
      verifiedAt: new Date('2024-03-10'),
      verifiedBy: 'seed',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-03-10'),
      isVerified: true,
      lastLoginAt: new Date(),
    },
  });
  console.log(`  ✓ Investor: ${investorUser.firstName} ${investorUser.lastName} (${investorUser.email}) [Investor@12345]`);

  // A PENDING investor, so the admin verification queue (Feature #2) has a
  // realistic row to verify during the demo instead of only VERIFIED users.
  const pendingInvestor = await db.user.create({
    data: {
      email: 'tunde.bakare@example.com',
      phone: '+234 805 111 2233',
      firstName: 'Tunde',
      lastName: 'Bakare',
      role: 'INVESTOR',
      status: 'PENDING',
      authSource: 'DEV_FALLBACK',
      passwordHash: hashPassword('Investor@12345'),
      kycStatus: 'pending',
      wallet: { create: { balance: 0, balanceKobo: 0 } },
      auditLogs: {
        create: {
          action: 'USER_REGISTERED',
          entity: 'User',
          details: 'Registered via DEV_FALLBACK auth (seed)',
        },
      },
    },
  });
  console.log(`  ✓ Pending investor: ${pendingInvestor.firstName} ${pendingInvestor.lastName} (${pendingInvestor.email})`);

  const developerUser = await db.user.create({
    data: {
      email: 'info@primecrestng.com',
      phone: '+234 803 987 6543',
      firstName: 'Emeka',
      lastName: 'Nwosu',
      role: 'DEVELOPER',
      kycStatus: 'verified',
      kycVerifiedAt: new Date('2024-02-20'),
      isVerified: true,
      lastLoginAt: new Date(),
    },
  });
  console.log(`  ✓ Developer: ${developerUser.firstName} ${developerUser.lastName} (${developerUser.email})`);

  // Create additional developer users for the marquee
  const developerUsers = await Promise.all([
    db.user.create({
      data: {
        email: 'contact@juliusberger.ng',
        phone: '+234 804 111 2222',
        firstName: 'Julius',
        lastName: 'Berger',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-01-01'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@costainwestafrica.com',
        phone: '+234 804 222 3333',
        firstName: 'Costain',
        lastName: 'West Africa',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-01-15'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@armpensions.com',
        phone: '+234 804 333 4444',
        firstName: 'ARM',
        lastName: 'Pensions',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-02-01'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@updcplc.com',
        phone: '+234 804 444 5555',
        firstName: 'UPDC',
        lastName: 'PLC',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-02-15'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@glomobile.com',
        phone: '+234 804 555 6666',
        firstName: 'Glo',
        lastName: 'Mobile',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-03-01'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@buacement.com',
        phone: '+234 804 666 7777',
        firstName: 'BUA',
        lastName: 'Cement',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-03-15'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@dangotegroup.com',
        phone: '+234 804 777 8888',
        firstName: 'Dangote',
        lastName: 'Group',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-04-01'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@nigerianlng.com',
        phone: '+234 804 888 9999',
        firstName: 'Nigeria',
        lastName: 'LNG',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-04-15'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@shelterafrique.com',
        phone: '+234 804 999 0000',
        firstName: 'Shelter',
        lastName: 'Afrique',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-05-01'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
    db.user.create({
      data: {
        email: 'info@fourpoints.com',
        phone: '+234 804 000 1111',
        firstName: 'Four',
        lastName: 'Points',
        role: 'DEVELOPER',
        kycStatus: 'verified',
        kycVerifiedAt: new Date('2024-05-15'),
        isVerified: true,
        lastLoginAt: new Date(),
      },
    }),
  ]);
  console.log(`  ✓ Created ${developerUsers.length} additional developer users`);

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

  // Create developer profiles for the additional developers
  const developerProfiles = await Promise.all([
    db.developerProfile.create({
      data: {
        userId: developerUsers[0].id,
        companyName: 'JULIUS BERGER NIGERIA PLC',
        registrationNo: 'RC-89123',
        website: 'https://juliusberger.ng',
        description: 'Infrastructure & Construction - Building Nigeria since 1950',
        hqAddress: 'Plot 765, Idu Industrial Area, Abuja, Nigeria',
        foundedYear: 1950,
        totalProjects: 500,
        totalFunding: 500_000_000_000,
        isVerified: true,
        rating: 4.9,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[1].id,
        companyName: 'COSTAIN WEST AFRICA',
        registrationNo: 'RC-234567',
        website: 'https://costainwestafrica.com',
        description: 'Building Excellence Since 1948 - Civil Engineering & Construction',
        hqAddress: 'Costain House, 22 Awolowo Road, Ikoyi, Lagos',
        foundedYear: 1948,
        totalProjects: 350,
        totalFunding: 200_000_000_000,
        isVerified: true,
        rating: 4.7,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[2].id,
        companyName: 'ARM PENSIONS',
        registrationNo: 'RC-345678',
        website: 'https://armpensions.com',
        description: 'Real Estate Investment - Pension Fund Management',
        hqAddress: 'ARM Plaza, 14 Akin Adesola Street, Victoria Island, Lagos',
        foundedYear: 1994,
        totalProjects: 80,
        totalFunding: 150_000_000_000,
        isVerified: true,
        rating: 4.6,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[3].id,
        companyName: 'UPDC PLC',
        registrationNo: 'RC-456789',
        website: 'https://updcplc.com',
        description: 'Premium Real Estate Development - UAC Property Development Company',
        hqAddress: 'UPDC Place, 14 Mobolaji Bank Anthony Way, Ikeja, Lagos',
        foundedYear: 1997,
        totalProjects: 120,
        totalFunding: 180_000_000_000,
        isVerified: true,
        rating: 4.8,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[4].id,
        companyName: 'GLOMOBILE',
        registrationNo: 'RC-567890',
        website: 'https://glomobile.com',
        description: 'Commercial Property Development - Telecommunications Infrastructure',
        hqAddress: 'Globacom House, 1, Mike Adenuga Close, Victoria Island, Lagos',
        foundedYear: 2003,
        totalProjects: 200,
        totalFunding: 300_000_000_000,
        isVerified: true,
        rating: 4.5,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[5].id,
        companyName: 'BUA CEMENT',
        registrationNo: 'RC-678901',
        website: 'https://buacement.com',
        description: 'Industrial & Residential Projects - Cement Manufacturing & Construction',
        hqAddress: 'BUA House, 1, Danmole Street, Off Admiralty Way, Lekki Phase 1, Lagos',
        foundedYear: 1992,
        totalProjects: 150,
        totalFunding: 250_000_000_000,
        isVerified: true,
        rating: 4.7,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[6].id,
        companyName: 'DANGOTE GROUP',
        registrationNo: 'RC-789012',
        website: 'https://dangotegroup.com',
        description: 'Mixed-Use Developments - Conglomerate with Real Estate Division',
        hqAddress: 'Dangote House, 1, Alfred Rewane Road, Ikoyi, Lagos',
        foundedYear: 1981,
        totalProjects: 300,
        totalFunding: 400_000_000_000,
        isVerified: true,
        rating: 4.9,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[7].id,
        companyName: 'NIGERIA LNG',
        registrationNo: 'RC-890123',
        website: 'https://nigerianlng.com',
        description: 'Housing & Infrastructure - Energy Company with Housing Projects',
        hqAddress: 'NLNG Complex, Bonny Island, Rivers State',
        foundedYear: 1989,
        totalProjects: 100,
        totalFunding: 350_000_000_000,
        isVerified: true,
        rating: 4.8,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[8].id,
        companyName: 'SHELTER AFRIQUE',
        registrationNo: 'RC-901234',
        website: 'https://shelterafrique.com',
        description: 'Affordable Housing Solutions - Pan-African Real Estate Developer',
        hqAddress: 'Shelter Afrique House, Mombasa Road, Nairobi, Kenya (Nigeria Office: Abuja)',
        foundedYear: 1982,
        totalProjects: 250,
        totalFunding: 120_000_000_000,
        isVerified: true,
        rating: 4.4,
      },
    }),
    db.developerProfile.create({
      data: {
        userId: developerUsers[9].id,
        companyName: 'FOUR POINTS',
        registrationNo: 'RC-012345',
        website: 'https://fourpoints.com',
        description: 'Hospitality & Commercial - Hotel & Commercial Property Development',
        hqAddress: 'Four Points by Sheraton, Plot 123, Cadastral Zone B, Abuja',
        foundedYear: 1995,
        totalProjects: 60,
        totalFunding: 80_000_000_000,
        isVerified: true,
        rating: 4.6,
      },
    }),
  ]);
  console.log(`  ✓ Created ${developerProfiles.length} additional developer profiles`);

  // ─── PROPERTIES ───
  console.log('\n🏢 Creating properties...');

  const properties = [
    {
      title: 'The Maitama Residence',
      slug: 'the-maitama-residence',
      description:
        'A stunning luxury 4-bedroom detached duplex in the heart of Maitama, featuring modern architectural design, premium finishes, and a private garden. This completed property is already generating consistent rental income from a corporate tenant on a 2-year lease. Located on a quiet, paved street with 24/7 security, the property offers an excellent combination of capital appreciation and steady rental returns.',
      shortDescription: 'Luxury 4-bedroom detached duplex in Maitama, already generating rental income.',
      propertyType: 'completed_rental',
      status: 'published',
      address: '21A Ademola Adetokunbo Crescent, Maitama',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      featured: true,
      trending: true,
      isNew: false,
      developerId: developerProfiles[0].id, // Julius Berger
    },
    {
      title: 'Azure Heights',
      slug: 'azure-heights',
      description:
        'Azure Heights is a premium 12-unit apartment complex in Wuse 2, Abuja. Each unit features panoramic city views, contemporary interiors with high-end finishes, and access to shared amenities including a swimming pool, gym, and 24-hour concierge. The building is strategically located near major business districts, making it highly attractive to diplomats and corporate executives.',
      shortDescription: 'Premium 12-unit apartment complex in Wuse 2 with city views.',
      propertyType: 'completed_rental',
      status: 'published',
      address: 'Plot 5, Ibrahim Babangida Boulevard, Wuse 2',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
      featured: true,
      trending: false,
      isNew: false,
      developerId: developerProfiles[1].id, // Costain West Africa
    },
    {
      title: 'Coral Bay Estate',
      slug: 'coral-bay-estate',
      description:
        'Coral Bay Estate is an ambitious waterfront off-plan development along the Kubwa expressway. This master-planned community will feature 24 modern townhouses with direct lake access, a private jetty, communal gardens, and a clubhouse. Kubwa is one of Abuja fastest-growing corridors, driven by the new airport expansion and infrastructure developments, offering exceptional capital growth potential.',
      shortDescription: 'Off-plan waterfront townhouses in Kubwa, Abuja — high growth corridor.',
      propertyType: 'off_plan',
      status: 'funding',
      address: 'Kubwa Expressway, Before Kubwa Junction, Abuja',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        '/HOMES/PIX (2).jpg',
        '/HOMES/PIX (7).jpg',
        '/HOMES/PIX (13).jpg',
        '/HOMES/PIX (14).jpg',
        '/HOMES/modern-villa-bedroom.png',
      ]),
      coverImage: '/HOMES/PIX (2).jpg',
      featured: true,
      trending: true,
      isNew: true,
      developerId: developerProfiles[2].id, // ARM Pensions
    },
    {
      title: 'Greenfield Gardens',
      slug: 'greenfield-gardens',
      description:
        'Greenfield Gardens is an affordable off-plan housing development in Apo, Abuja, designed to meet the growing demand for quality homes in one of Abuja most promising corridors. The development comprises 48 terrace duplexes with modern amenities including a central park, playground, and gated security. With the new airport expansion and infrastructure developments nearby, this area is poised for significant property value appreciation.',
      shortDescription: 'Off-plan affordable terrace duplexes in Apo, Abuja — strong appreciation potential.',
      propertyType: 'off_plan',
      status: 'funding',
      address: 'Apo Mechanic Village Road, Apo, Abuja',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        '/HOMES/PIX (7).jpg',
        '/HOMES/PIX (13).jpg',
        '/HOMES/PIX (14).jpg',
        '/HOMES/modern-villa-bedroom.png',
        '/HOMES/modern-villa-nairobi.jpg',
      ]),
      coverImage: '/HOMES/PIX (7).jpg',
      featured: false,
      trending: false,
      isNew: true,
      developerId: developerProfiles[3].id, // UPDC PLC
    },
    {
      title: 'The Gwarinpa Hub',
      slug: 'the-gwarinpa-hub',
      description:
        'The Gwarinpa Hub is a mixed-use development combining modern co-living spaces with ground-floor retail units in Abuja tech district. The property features 8 co-living units, 4 retail spaces, a rooftop lounge, and co-working areas. Located on Ahmadu Bello Way, the property sits in the heart of Gwarinpas booming startup ecosystem, ensuring strong demand from young professionals and tech companies.',
      shortDescription: 'Mixed-use co-living and retail spaces in Gwarinpa tech district.',
      propertyType: 'mixed_use',
      status: 'published',
      address: '45 Ahmadu Bello Way, Gwarinpa',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
      featured: false,
      trending: true,
      isNew: false,
      developerId: developerProfiles[4].id, // Glomobile
    },
    {
      title: 'Campus Quarters',
      slug: 'campus-quarters',
      description:
        'Campus Quarters is a purpose-built student housing development located just 500 metres from the University of Abuja main campus. The property features 32 fully furnished en-suite rooms, common areas, study rooms, high-speed internet, 24-hour security, and laundry facilities. With UniAbuja having over 35,000 students and severe hostel shortages, this property offers reliable year-round rental income.',
      shortDescription: 'Purpose-built student housing near UniAbuja — strong rental demand.',
      propertyType: 'student_housing',
      status: 'published',
      address: 'Airport Road, Adjacent UniAbuja Main Gate, Abuja',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
      featured: false,
      trending: false,
      isNew: false,
      developerId: developerProfiles[5].id, // BUA Cement
    },
    {
      title: 'Marina Tower',
      slug: 'marina-tower',
      description:
        'Marina Tower is a Grade A commercial office development in the Central Business District, Abuja, offering 6 floors of premium office space with cutting-edge facilities. The building features fiber optic internet, backup power generation, advanced HVAC systems, and ample parking. Positioned in the heart of Abuja business district, it caters to multinational corporations, financial institutions, and tech companies seeking world-class office accommodation in Nigerias capital.',
      shortDescription: 'Grade A commercial office tower in Abuja Central Business District.',
      propertyType: 'commercial',
      status: 'published',
      address: '1A Shehu Shagari Way, Central Business District, Abuja',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1448630360428-65456659e235?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1554435493-93422e8220c8?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1548195973-034f6e3e512e?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1557022820-465846a241eb?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop',
      featured: false,
      trending: false,
      isNew: true,
      developerId: developerProfiles[6].id, // Dangote Group
    },
    {
      title: 'Heritage Homes',
      slug: 'heritage-homes',
      description:
        'Heritage Homes is an affordable housing community in Lugbe, Abuja, designed to provide quality, modern homes for first-time buyers and middle-income families. The development features 36 units of 2-bedroom and 3-bedroom bungalows with shared amenities including a playground, community centre, and green spaces. Lugbe is experiencing rapid growth with improved road infrastructure connecting to the city centre.',
      shortDescription: 'Affordable housing community in Lugbe, Abuja with modern bungalows.',
      propertyType: 'affordable_housing',
      status: 'funding',
      address: 'Lugbe Estate Road, Lugbe, Abuja',
      city: 'Abuja',
      state: 'Federal Capital Territory',
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
        'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
      ]),
      coverImage: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop',
      featured: false,
      trending: false,
      isNew: true,
      developerId: developerProfiles[7].id, // Nigeria LNG
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

  // ─── PROPERTY KOBO MIRROR (Features #4/#5) ───
  // The atomic investment route reads/writes BigInt kobo columns only, while the
  // existing BrowseView / PropertyCard UI reads the legacy Float columns.
  // Backfill kobo from the Float data so both representations agree.
  console.log('\n🔁 Backfilling property kobo fields...');
  for (const property of createdProperties) {
    await db.property.update({
      where: { id: property.id },
      data: {
        valuationKobo: BigInt(Math.round(property.totalValue * 100)),
        targetKobo: BigInt(Math.round(property.fundingTarget * 100)),
        fundedKobo: BigInt(Math.round(property.fundingRaised * 100)),
        minInvestmentKobo: BigInt(Math.round(property.minInvestment * 100)),
      },
    });
  }
  console.log(`  ✓ ${createdProperties.length} properties mirrored to kobo`);

  // ─── WALLET FOR INVESTOR ───
  // Starts at zero: the ledger written below is the ONLY source of truth
  // (Feature #3 — Wallet.balanceKobo is a cache of SUM(credits) − SUM(debits)).
  console.log('\n💰 Creating wallets...');
  await db.wallet.create({
    data: {
      userId: investorUser.id,
      balance: 0,
      balanceKobo: 0,
      currency: 'NGN',
    },
  });
  console.log('  ✓ Investor wallet created (zeroed — ledger is authoritative)');

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
        // Legacy Float mirror (still read by the existing portfolio UI shape)
        amount: inv.amount,
        units: inv.amount / 500_000,
        status: inv.status,
        paymentMethod: 'bank_transfer',
        investedAt: new Date(inv.investedAt),
        // Feature #3/#4/#5 columns required by the merged schema.
        // idempotencyKey is NOT NULL + UNIQUE — unlike a live request, a seed
        // row needs no dedup semantics, so a deterministic key is derived.
        amountKobo: BigInt(Math.round(inv.amount * 100)),
        ownershipPct: (inv.amount / (property.totalValue || 1)) * 100,
        idempotencyKey: `seed-inv-${inv.propertyIdx}-${investorUser.id}`,
        confirmedAt: new Date(inv.investedAt),
        certificateNo: `NEST-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        rentalYield: property.rentalYield,
        expectedReturn: inv.amount * (property.expectedIRR / 100),
      },
    });
    console.log(`  ✓ Investment: ₦${inv.amount.toLocaleString()} in ${property.title}`);
  }

  // ─── INVESTOR LEDGER (Feature #3 — append-only, immutable) ───
  // Every money movement is a row; balance is derived, never authoritative in
  // Wallet. Written in chronological order so each row's `balanceKobo` is the
  // true running balance after that movement.
  console.log('\n💳 Writing investor ledger...');

  async function writeLedgerEntry(entry: {
    type: 'CREDIT' | 'DEBIT';
    category: 'DEMO_CREDIT' | 'INVESTMENT' | 'DISTRIBUTION';
    amountNaira: number;
    description: string;
    refType: string;
    refId: string;
    createdAt: Date;
  }) {
    const amountKobo = BigInt(Math.round(entry.amountNaira * 100));

    // Derive the balance from the immutable rows themselves.
    const prior = await db.transaction.findMany({
      where: { userId: investorUser.id },
      select: { type: true, amountKobo: true },
    });
    let balance = BigInt(0);
    for (const row of prior) {
      balance += row.type === 'CREDIT' ? row.amountKobo : -row.amountKobo;
    }
    const newBalance =
      entry.type === 'CREDIT' ? balance + amountKobo : balance - amountKobo;

    if (newBalance < BigInt(0)) {
      throw new Error(
        `Seed ledger would overdraw the wallet on "${entry.description}" (${newBalance} kobo).`
      );
    }

    await db.transaction.create({
      data: {
        userId: investorUser.id,
        type: entry.type,
        amountKobo,
        category: entry.category,
        description: entry.description,
        refType: entry.refType,
        refId: entry.refId,
        balanceKobo: newBalance,
        createdAt: entry.createdAt,
      },
    });

    return newBalance;
  }

  // Opening DEMO CREDIT — this is the only money "granted" in the seeded data.
  let runningBalance = await writeLedgerEntry({
    type: 'CREDIT',
    category: 'DEMO_CREDIT',
    amountNaira: 50_000_000,
    description:
      'DEMO CREDIT — opening demo funding (seed). Not real customer money.',
    refType: 'SEED',
    refId: 'seed-opening-credit',
    createdAt: new Date('2024-07-01'),
  });

  // The four historical investments, as DEBITs against that balance.
  for (const inv of investmentData) {
    const property = createdProperties[inv.propertyIdx];
    runningBalance = await writeLedgerEntry({
      type: 'DEBIT',
      category: 'INVESTMENT',
      amountNaira: inv.amount,
      description: `Investment in ${property.title}`,
      refType: 'Property',
      refId: property.id,
      createdAt: new Date(inv.investedAt),
    });
  }

  // Rental distributions, as CREDITs.
  for (const dist of [
    { propertyIdx: 0, amount: 187_500 },
    { propertyIdx: 1, amount: 112_500 },
  ]) {
    const property = createdProperties[dist.propertyIdx];
    runningBalance = await writeLedgerEntry({
      type: 'CREDIT',
      category: 'DISTRIBUTION',
      amountNaira: dist.amount,
      description: `Q4 2024 Rental Distribution — ${property.title}`,
      refType: 'Property',
      refId: property.id,
      createdAt: new Date('2024-12-01'),
    });
  }

  // Sync the wallet cache to the ledger SUM (Feature #3 invariant).
  await db.wallet.update({
    where: { userId: investorUser.id },
    data: {
      balanceKobo: runningBalance,
      // Legacy Float mirror so any not-yet-migrated UI keeps reading a sane number.
      balance: Number(runningBalance) / 100,
    },
  });
  console.log(
    `  ✓ Ledger written: 7 entries · wallet cache synced to ₦${(Number(runningBalance) / 100).toLocaleString()}`
  );

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
    const propImages: string[] = JSON.parse(property.images);
    await db.propertyMedia.createMany({
      data: [
        { propertyId: property.id, type: 'image', url: propImages[0], caption: `${property.title} — Exterior View`, sortOrder: 0 },
        { propertyId: property.id, type: 'image', url: propImages[1] || propImages[0], caption: `${property.title} — Interior View`, sortOrder: 1 },
        { propertyId: property.id, type: 'image', url: propImages[2] || propImages[0], caption: `${property.title} — Floor Plan`, sortOrder: 2 },
        { propertyId: property.id, type: 'image', url: propImages[3] || propImages[0], caption: `${property.title} — Surrounding Area`, sortOrder: 3 },
        { propertyId: property.id, type: 'video', url: 'https://example.com/video.mp4', caption: `${property.title} — Virtual Tour`, sortOrder: 4 },
      ],
    });
  }
  console.log(`  ✓ ${createdProperties.length * 5} media items created`);

  // ─── SUMMARY ───
  console.log('\n' + '='.repeat(60));
  console.log('✅ NEST by Nulo Africa — Seed Complete!');
  console.log('='.repeat(60));
  console.log(`  👤 Users:              4 (1 admin, 2 verified/pending investors, 1 developer)`);
  console.log(`  📋 Profiles:           2 (investor + developer)`);
  console.log(`  🏢 Properties:         ${createdProperties.length}`);
  console.log(`  📊 Opportunities:      ${createdProperties.length}`);
  console.log(`  📈 Investments:         ${investmentData.length}`);
  console.log(`  💳 Ledger entries:      7 (1 DEMO_CREDIT, 4 INVESTMENT, 2 DISTRIBUTION)`);
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
