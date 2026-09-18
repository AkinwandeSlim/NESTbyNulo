-- NEST by Nulo Africa - Seed Data SQL
-- Run this in Supabase SQL Editor
-- This will populate your database with demo data

-- Step 1: Create demo users
INSERT INTO "User" (id, email, "firstName", "lastName", role, "kycStatus", "isVerified", "isActive", "authSource", "passwordHash", status, "createdAt", "updatedAt") VALUES
('cm1abc001', 'chioma.adewale@gmail.com', 'Chioma', 'Adewale', 'investor', 'verified', true, true, 'DEV_FALLBACK', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEY6Maa', 'VERIFIED', NOW(), NOW()),
('cm1abc002', 'admin@nestnulo.com', 'Admin', 'User', 'admin', 'verified', true, true, 'DEV_FALLBACK', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEY6Maa', 'VERIFIED', NOW(), NOW()),
('cm1abc003', 'kemi.lagos@example.com', 'Kemi', 'Okonkwo', 'investor', 'pending', false, true, 'DEV_FALLBACK', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWEY6Maa', 'PENDING', NOW(), NOW());

-- Step 2: Create wallets
INSERT INTO "Wallet" (id, "userId", balance, "balanceKobo", currency, "isLocked", "createdAt", "updatedAt") VALUES
('wallet001', 'cm1abc001', 50000000, 5000000000, 'NGN', false, NOW(), NOW()),
('wallet002', 'cm1abc002', 0, 0, 'NGN', false, NOW(), NOW()),
('wallet003', 'cm1abc003', 0, 0, 'NGN', false, NOW(), NOW());

-- Step 3: Create transactions
INSERT INTO "Transaction" (id, "userId", type, "amountKobo", category, description, "balanceKobo", "createdAt") VALUES
('tx001', 'cm1abc001', 'credit', 5000000000, 'deposit', 'DEMO CREDIT — NOT A PAYMENT', 5000000000, NOW());

-- Step 4: Create property
INSERT INTO "Property" (id, slug, title, description, "shortDescription", "propertyType", status, address, city, state, country, "totalValue", "minInvestment", "maxInvestment", "fundingTarget", "fundingRaised", "rentalYield", "expectedIRR", "riskRating", images, "coverImage", featured, trending, "valuationKobo", "targetKobo", "fundedKobo", "minInvestmentKobo", "createdAt", "updatedAt") VALUES
('prop001', 'the-lekki-residence', 'The Lekki Residence', 'Premium residential complex in Lekki Phase 1', 'Modern 3BR apartments in prime Lekki', 'residential', 'published', 'Plot 45, Admiralty Way', 'Lagos', 'Lagos', 'Nigeria', 108000000, 500000, 10000000, 108000000, 0, 8.5, 12.0, 'low', '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9"]', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9', true, true, 10800000000, 10800000000, 0, 50000000, NOW(), NOW());

-- Verification
SELECT 'Users' as table_name, COUNT(*) FROM "User"
UNION ALL SELECT 'Wallets', COUNT(*) FROM "Wallet"
UNION ALL SELECT 'Properties', COUNT(*) FROM "Property"
UNION ALL SELECT 'Transactions', COUNT(*) FROM "Transaction";
