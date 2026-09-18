// Generate SQL INSERT statements for Supabase SQL Editor
const bcrypt = require('bcryptjs');

// Hash passwords
const hash1 = bcrypt.hashSync('Investor@12345', 12);
const hash2 = bcrypt.hashSync('Admin@12345', 12);
const hash3 = bcrypt.hashSync('Investor@12345', 12);

console.log(`-- NEST by Nulo Africa - Seed Data SQL
-- Run this in Supabase SQL Editor

-- 1. Create Users
INSERT INTO "User" (id, email, "firstName", "lastName", role, "kycStatus", "isVerified", "isActive", "authSource", "passwordHash", status, "createdAt", "updatedAt")
VALUES
  ('cm1abc001', 'chioma.adewale@gmail.com', 'Chioma', 'Adewale', 'investor', 'verified', true, true, 'DEV_FALLBACK', '${hash1}', 'VERIFIED', NOW(), NOW()),
  ('cm1abc002', 'admin@nestnulo.com', 'Admin', 'User', 'admin', 'verified', true, true, 'DEV_FALLBACK', '${hash2}', 'VERIFIED', NOW(), NOW()),
  ('cm1abc003', 'kemi.lagos@example.com', 'Kemi', 'Okonkwo', 'investor', 'pending', false, true, 'DEV_FALLBACK', '${hash3}', 'PENDING', NOW(), NOW());

-- 2. Create Investor Profiles
INSERT INTO "InvestorProfile" (id, "userId", "riskTolerance", "investmentGoal", "totalInvested", "propertiesOwned", "createdAt", "updatedAt")
VALUES
  ('prof001', 'cm1abc001', 'moderate', 'income', 15750000, 4, NOW(), NOW()),
  ('prof003', 'cm1abc003', 'moderate', 'growth', 0, 0, NOW(), NOW());

-- 3. Create Developer Profile
INSERT INTO "DeveloperProfile" (id, "userId", "companyName", "registrationNo", website, description, logo, "isVerified", rating, "totalProjects", "totalFunding", "createdAt", "updatedAt")
VALUES
  ('dev001', 'cm1abc002', 'Prestige Developers Ltd', 'RC1234567', 'https://prestigedev.ng', 'Leading real estate developer in Nigeria', 'https://placehold.co/200x200/0EA5E9/white?text=PD', true, 4.5, 12, 500000000, NOW(), NOW());

-- 4. Create Property Manager Profile  
INSERT INTO "PropertyManagerProfile" (id, "userId", "companyName", "licenseNo", description, "isVerified", rating, "managedCount", "createdAt", "updatedAt")
VALUES
  ('pm001', 'cm1abc002', 'Elite Property Management', 'PM-2023-001', 'Professional property management services', true, 4.8, 25, NOW(), NOW());

-- 5. Create SPV
INSERT INTO "SPV" (id, name, "regNumber", description, structure, "createdAt", "updatedAt")
VALUES
  ('spv001', 'Lekki Residence SPV', 'SPV-2024-001', 'Special Purpose Vehicle for The Lekki Residence', 'Limited Liability Company', NOW(), NOW());

-- 6. Create Properties
INSERT INTO "Property" (
  id, slug, title, description, "shortDescription", "propertyType", status,
  address, city, state, country, "totalValue", "minInvestment", "maxInvestment",
  "fundingTarget", "fundingRaised", "rentalYield", "expectedIRR", "riskRating",
  images, "coverImage", featured, trending, "developerId", "propertyManagerId", "spvId",
  "valuationKobo", "targetKobo", "fundedKobo", "minInvestmentKobo",
  "createdAt", "updatedAt"
)
VALUES
  (
    'prop001', 'the-lekki-residence', 'The Lekki Residence', 
    'Premium residential complex in Lekki Phase 1', 'Modern 3BR apartments in prime Lekki location',
    'residential', 'published',
    'Plot 45, Admiralty Way, Lekki Phase 1', 'Lagos', 'Lagos', 'Nigeria',
    108000000, 500000, 10000000, 108000000, 15525000, 8.5, 12.0, 'low',
    '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"]',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', true, true,
    'dev001', 'pm001', 'spv001',
    10800000000, 10800000000, 1552500000, 50000000,
    NOW(), NOW()
  );

-- 7. Create Investment Opportunity
INSERT INTO "InvestmentOpportunity" (
  id, "propertyId", "investmentMemo", "fundingStartDate", "fundingEndDate",
  "minInvestment", "maxInvestment", "maxInvestors", "currentInvestors",
  "createdAt", "updatedAt"
)
VALUES
  (
    'opp001', 'prop001',
    'High-yield residential investment in Lagos premium location',
    NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days',
    500000, 10000000, 100, 1,
    NOW(), NOW()
  );

-- 8. Create Wallet
INSERT INTO "Wallet" (id, "userId", balance, "balanceKobo", currency, "isLocked", "createdAt", "updatedAt")
VALUES
  ('wallet001', 'cm1abc001', 34550000, 3455000000, 'NGN', false, NOW(), NOW()),
  ('wallet003', 'cm1abc003', 0, 0, 'NGN', false, NOW(), NOW());

-- 9. Create Transactions (Ledger)
INSERT INTO "Transaction" (id, "userId", type, "amountKobo", category, description, "balanceKobo", "createdAt")
VALUES
  ('tx001', 'cm1abc001', 'credit', 5000000000, 'deposit', 'DEMO CREDIT — NOT A PAYMENT', 5000000000, NOW() - INTERVAL '10 days'),
  ('tx002', 'cm1abc001', 'debit', 500000000, 'investment', 'Investment in The Lekki Residence', 4500000000, NOW() - INTERVAL '9 days'),
  ('tx003', 'cm1abc001', 'dividend', 18750000, 'rental_income', 'Q4 2024 Rental Distribution — The Lekki Residence', 4518750000, NOW() - INTERVAL '2 days');

-- 10. Create Investment
INSERT INTO "Investment" (
  id, "userId", "propertyId", "amountKobo", units, status,
  "ownershipPct", "investedAt", "confirmedAt", "idempotencyKey",
  "createdAt", "updatedAt"
)
VALUES
  (
    'inv001', 'cm1abc001', 'prop001',
    500000000, 4.63, 'confirmed',
    4.63, NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days',
    'idem-' || gen_random_uuid()::text,
    NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
  );

-- 11. Create Audit Logs
INSERT INTO "AuditLog" (id, "userId", action, entity, "entityId", details, "ipAddress", "createdAt")
VALUES
  ('audit001', 'cm1abc002', 'USER_VERIFIED', 'User', 'cm1abc001', '{"verifiedBy":"cm1abc002"}', '127.0.0.1', NOW() - INTERVAL '10 days'),
  ('audit002', 'cm1abc001', 'INVESTMENT_CREATED', 'Investment', 'inv001', '{"propertyId":"prop001","amount":500000000}', '127.0.0.1', NOW() - INTERVAL '9 days');

-- Verify seed data
SELECT 'Users' as table_name, COUNT(*) as count FROM "User"
UNION ALL
SELECT 'Properties', COUNT(*) FROM "Property"
UNION ALL
SELECT 'Investments', COUNT(*) FROM "Investment"
UNION ALL
SELECT 'Wallets', COUNT(*) FROM "Wallet"
UNION ALL
SELECT 'Transactions', COUNT(*) FROM "Transaction";
