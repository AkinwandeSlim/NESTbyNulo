# NEST MVP — Detailed Day-by-Day Implementation Guide

**Competition:** Friday 2026-09-19  
**Today:** Tuesday 2026-09-15 at 4:00 AM  
**Time Available:** ~60 hours (Tuesday 4am → Friday 4pm)

---

## 🎯 Core Truth from Advisor

Your **7 payers who committed ₦15M** are your validation. The competition demo proves you can:
1. Show them ONE real property with full disclosure
2. Give them transparent investment tracking
3. Demonstrate admin control over their money
4. Keep everything traceable and auditable

**You're NOT building a public marketplace. You're building an operating system for ONE pilot property deal.**

---

## Day 1 (Tuesday) — Foundation Day
**Available:** 12-14 hours  
**Goal:** Database + Auth + Protected Routes working

### Phase 1A: Database Migration (2 hours)
**Time:** 4:00 AM - 6:00 AM

```bash
# 1. Sign up for Neon Postgres (free tier)
# https://neon.tech → Sign in → Create project "nest-mvp"

# 2. Copy connection string from Neon dashboard
# Format: postgresql://user:pass@host/db?sslmode=require

# 3. Update .env
DATABASE_URL="postgresql://[YOUR_NEON_URL]"

# 4. Update prisma/schema.prisma
# Change datasource from sqlite to postgresql
# Add BigInt fields for money (kobo)
```

**Files to modify:**
- `prisma/schema.prisma` — Change datasource, add BigInt kobo fields
- `.env` — Add Neon URL
- Create `.env.example` — Template for team

**Schema changes needed:**
```prisma
// Change this:
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// To this:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Add to Wallet model:
model Wallet {
  id                 String   @id @default(cuid())
  userId             String   @unique
  availableBalanceKobo BigInt @default(0)  // Add this
  // ... rest of fields
}

// Add LedgerEntry model:
model LedgerEntry {
  id            String   @id @default(cuid())
  walletId      String
  type          String   // "credit" | "debit"
  amountKobo    BigInt
  reference     String   @unique
  description   String?
  metadata      Json?
  createdAt     DateTime @default(now())
  
  wallet Wallet @relation(fields: [walletId], references: [id])
  
  @@index([walletId])
  @@index([reference])
}
```

**Commands:**
```bash
cd "C:\MyFiles\DOCUMENT-2026\Nuelo_Poc\NULO-DEV\NEST\NEST_by_NuloAfrica"

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Run seed
npm run seed
```

**Exit criteria:**
- [ ] Migration runs without errors
- [ ] Seed creates: 1 admin, 1 verified investor, 1 pending investor, 1 property
- [ ] Can run seed twice without duplicate key errors

---

### Phase 1B: Clerk Authentication (3 hours)
**Time:** 6:00 AM - 9:00 AM

```bash
# 1. Sign up for Clerk (free tier)
# https://clerk.com → Create application "NEST MVP"

# 2. Copy API keys to .env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**Files to create:**

`src/middleware.ts`:
```typescript
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

`src/lib/auth.ts`:
```typescript
import { auth } from '@clerk/nextjs/server';
import { db } from './db';

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Get or create local user
  const clerkUser = await currentUser();
  let user = await db.user.findUnique({
    where: { clerkId: userId },
    include: { wallet: true },
  });

  if (!user) {
    // First login - create local mirror
    user = await db.user.create({
      data: {
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || '',
        firstName: clerkUser?.firstName || '',
        lastName: clerkUser?.lastName,
        role: 'investor',
        kycStatus: 'pending',
        wallet: {
          create: {
            availableBalanceKobo: BigInt(0),
          },
        },
      },
      include: { wallet: true },
    });
  }

  return user;
}

export async function requireVerified() {
  const user = await requireUser();
  if (user.kycStatus !== 'verified') {
    throw new Error('Verification required');
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
}
```

**Install dependencies:**
```bash
npm install @clerk/nextjs
```

**Update `src/app/layout.tsx`:**
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

**Exit criteria:**
- [ ] Can sign in with Clerk
- [ ] Local user created on first auth
- [ ] requireUser() works in API routes
- [ ] requireAdmin() throws for non-admin

---

### Phase 1C: Authorization Matrix (2 hours)
**Time:** 9:00 AM - 11:00 AM

**Create test API routes:**

`src/app/api/test/public/route.ts`:
```typescript
export async function GET() {
  return Response.json({ message: 'Public endpoint' });
}
```

`src/app/api/test/investor/route.ts`:
```typescript
import { requireUser } from '@/lib/auth';

export async function GET() {
  const user = await requireUser();
  return Response.json({ message: 'Investor endpoint', user });
}
```

`src/app/api/test/verified/route.ts`:
```typescript
import { requireVerified } from '@/lib/auth';

export async function GET() {
  const user = await requireVerified();
  return Response.json({ message: 'Verified only', user });
}
```

`src/app/api/test/admin/route.ts`:
```typescript
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const user = await requireAdmin();
  return Response.json({ message: 'Admin endpoint', user });
}
```

**Manual testing:**
```bash
# Anonymous (should work)
curl http://localhost:3000/api/test/public

# Sign in as pending investor (should 403)
curl http://localhost:3000/api/test/verified

# Sign in as admin (should work)
curl http://localhost:3000/api/test/admin
```

**Exit criteria:**
- [ ] Anonymous can access public routes
- [ ] Authenticated user can access investor routes
- [ ] Pending investor gets 403 on verified routes
- [ ] Non-admin gets 403 on admin routes

---

### Phase 1D: Admin Verification UI (3 hours)
**Time:** 11:00 AM - 2:00 PM

`src/app/api/admin/verify-user/route.ts`:
```typescript
import { requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  userId: z.string(),
  action: z.enum(['approve', 'reject']),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    
    const body = await req.json();
    const { userId, action } = schema.parse(body);
    
    const user = await db.user.update({
      where: { id: userId },
      data: {
        kycStatus: action === 'approve' ? 'verified' : 'rejected',
        kycVerifiedAt: action === 'approve' ? new Date() : null,
      },
    });
    
    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: `KYC_${action.toUpperCase()}`,
        metadata: { verifiedAt: new Date() },
      },
    });
    
    return Response.json({ success: true, user });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: error.message === 'Admin access required' ? 403 : 400 }
    );
  }
}
```

`src/app/admin/verify/page.tsx`:
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function AdminVerifyPage() {
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    fetch('/api/admin/pending-users')
      .then(res => res.json())
      .then(data => setPendingUsers(data));
  }, []);

  const handleVerify = async (userId: string, action: 'approve' | 'reject') => {
    await fetch('/api/admin/verify-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action }),
    });
    
    // Refresh list
    setPendingUsers(prev => prev.filter(u => u.id !== userId));
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Pending Verifications</h1>
      
      <div className="space-y-4">
        {pendingUsers.map(user => (
          <div key={user.id} className="border p-4 rounded">
            <p className="font-medium">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-gray-600">{user.email}</p>
            
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleVerify(user.id, 'approve')}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleVerify(user.id, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Exit criteria:**
- [ ] Admin can see pending users
- [ ] Approval changes kycStatus to 'verified'
- [ ] Audit log created for each action
- [ ] Non-admin gets 403

---

### Day 1 Evening Checkpoint (5:00 PM)

**Must be working:**
- ✅ Postgres migration + seed
- ✅ Clerk authentication
- ✅ Local user mirror created on first auth
- ✅ Authorization helpers (requireUser, requireVerified, requireAdmin)
- ✅ Admin can verify demo users

**Tests to run:**
```bash
# 1. Fresh seed
npm run db:reset
npm run seed

# 2. Auth matrix
# - Sign in as pending → try verified endpoint → should get 403
# - Sign in as admin → try admin endpoint → should work

# 3. Admin verification
# - Admin approves pending user
# - Pending user can now invest
```

**If behind schedule:** Skip admin verification UI, keep the API — you can test via Postman/curl for demo

---

## Day 2 (Wednesday) — Money Day
**Available:** 12-14 hours  
**Goal:** Ledger + Demo Credit + Investment Engine

### Phase 2A: Ledger Service (3 hours)
**Time:** 8:00 AM - 11:00 AM

`src/lib/ledger.ts`:
```typescript
import { db } from './db';
import { Prisma } from '@prisma/client';

export async function creditWallet(
  walletId: string,
  amountKobo: bigint,
  reference: string,
  description: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx || db;
  
  if (amountKobo <= 0) {
    throw new Error('Amount must be positive');
  }
  
  // Check duplicate reference
  const existing = await client.ledgerEntry.findUnique({
    where: { reference },
  });
  
  if (existing) {
    // Idempotent - return existing
    return existing;
  }
  
  // Create entry
  const entry = await client.ledgerEntry.create({
    data: {
      walletId,
      type: 'credit',
      amountKobo,
      reference,
      description,
    },
  });
  
  // Update wallet balance
  await client.wallet.update({
    where: { id: walletId },
    data: {
      availableBalanceKobo: {
        increment: amountKobo,
      },
    },
  });
  
  return entry;
}

export async function debitWallet(
  walletId: string,
  amountKobo: bigint,
  reference: string,
  description: string,
  tx?: Prisma.TransactionClient
) {
  const client = tx || db;
  
  if (amountKobo <= 0) {
    throw new Error('Amount must be positive');
  }
  
  // Check duplicate
  const existing = await client.ledgerEntry.findUnique({
    where: { reference },
  });
  
  if (existing) {
    return existing;
  }
  
  // Check sufficient balance
  const wallet = await client.wallet.findUnique({
    where: { id: walletId },
  });
  
  if (!wallet || wallet.availableBalanceKobo < amountKobo) {
    throw new Error('Insufficient balance');
  }
  
  // Create entry
  const entry = await client.ledgerEntry.create({
    data: {
      walletId,
      type: 'debit',
      amountKobo,
      reference,
      description,
    },
  });
  
  // Update balance
  await client.wallet.update({
    where: { id: walletId },
    data: {
      availableBalanceKobo: {
        decrement: amountKobo,
      },
    },
  });
  
  return entry;
}

export function nairaToKobo(naira: number): bigint {
  return BigInt(Math.round(naira * 100));
}

export function koboToNaira(kobo: bigint): number {
  return Number(kobo) / 100;
}
```

**Unit tests** `src/lib/ledger.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { creditWallet, debitWallet } from './ledger';

describe('Ledger Service', () => {
  it('should credit wallet', async () => {
    // Test credit
  });
  
  it('should prevent duplicate credit', async () => {
    // Test idempotency
  });
  
  it('should prevent insufficient debit', async () => {
    // Test overdraft protection
  });
  
  it('should maintain balance invariant', async () => {
    // Sum of entries === wallet balance
  });
});
```

**Exit criteria:**
- [ ] Credit increases balance
- [ ] Duplicate reference is no-op
- [ ] Debit checks sufficient funds
- [ ] Balance equals signed sum of entries

---

### Phase 2B: Demo Credit API (2 hours)
**Time:** 11:00 AM - 1:00 PM

`src/app/api/admin/demo-credit/route.ts`:
```typescript
import { requireAdmin } from '@/lib/auth';
import { creditWallet, nairaToKobo } from '@/lib/ledger';
import { db } from '@/lib/db';
import { z } from 'zod';

const schema = z.object({
  userId: z.string(),
  amountNaira: z.number().positive(),
  note: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
    
    if (process.env.NODE_ENV === 'production' && process.env.DEMO_MODE !== 'true') {
      return Response.json(
        { error: 'Demo credit only available in test mode' },
        { status: 403 }
      );
    }
    
    const body = await req.json();
    const { userId, amountNaira, note } = schema.parse(body);
    
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    const reference = `demo_credit_${Date.now()}_${userId}`;
    const amountKobo = nairaToKobo(amountNaira);
    
    const entry = await creditWallet(
      user.wallet.id,
      amountKobo,
      reference,
      `DEMO CREDIT: ${note || 'Test wallet funding'}`
    );
    
    // Audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: 'DEMO_CREDIT',
        metadata: { amountNaira, reference },
      },
    });
    
    return Response.json({
      success: true,
      message: 'DEMO CREDIT — NOT A PAYMENT',
      amountNaira,
      entry,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

**Frontend component** `src/components/demo-credit-button.tsx`:
```typescript
'use client';

import { useState } from 'react';

export function DemoCreditButton({ userId }: { userId: string }) {
  const [amount, setAmount] = useState(500000);
  const [loading, setLoading] = useState(false);
  
  const handleCredit = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/demo-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amountNaira: amount }),
    });
    
    const data = await res.json();
    alert(data.message);
    setLoading(false);
  };
  
  return (
    <div className="border-2 border-orange-500 bg-orange-50 p-4 rounded">
      <p className="font-bold text-orange-700 mb-2">
        ⚠️ DEMO CREDIT — NOT A PAYMENT
      </p>
      <p className="text-sm text-gray-600 mb-4">
        This adds test balance only. No real money is processed.
      </p>
      
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        className="border p-2 rounded mr-2"
        placeholder="Amount (₦)"
      />
      
      <button
        onClick={handleCredit}
        disabled={loading}
        className="px-4 py-2 bg-orange-600 text-white rounded"
      >
        {loading ? 'Processing...' : 'Add Demo Credit'}
      </button>
    </div>
  );
}
```

**Exit criteria:**
- [ ] Admin can credit demo balance
- [ ] Duplicate credit with same reference is safe
- [ ] UI clearly labeled "DEMO CREDIT — NOT A PAYMENT"
- [ ] Non-admin gets 403

---

### Phase 2C: Investment Engine (4 hours)
**Time:** 1:00 PM - 5:00 PM

`src/lib/investment.ts`:
```typescript
import { db } from './db';
import { debitWallet, nairaToKobo } from './ledger';
import { Prisma } from '@prisma/client';

export async function createInvestment(params: {
  userId: string;
  propertyId: string;
  amountNaira: number;
  idempotencyKey: string;
  termsVersion: string;
  riskVersion: string;
}) {
  const { userId, propertyId, amountNaira, idempotencyKey, termsVersion, riskVersion } = params;
  
  // Check idempotency
  const existing = await db.investment.findFirst({
    where: { 
      userId,
      propertyId,
      metadata: {
        path: ['idempotencyKey'],
        equals: idempotencyKey,
      },
    },
  });
  
  if (existing) {
    return {
      success: true,
      investment: existing,
      duplicate: true,
    };
  }
  
  return await db.$transaction(async (tx) => {
    // Get user + wallet
    const user = await tx.user.findUnique({
      where: { id: userId },
      include: { wallet: true },
    });
    
    if (!user) throw new Error('User not found');
    if (user.kycStatus !== 'verified') throw new Error('Verification required');
    
    // Get property
    const property = await tx.property.findUnique({
      where: { id: propertyId },
    });
    
    if (!property) throw new Error('Property not found');
    if (property.status !== 'funding') throw new Error('Property not available');
    
    // Validate amount
    const amountKobo = nairaToKobo(amountNaira);
    const minKobo = nairaToKobo(property.minimumInvestment);
    
    if (amountKobo < minKobo) {
      throw new Error(`Minimum investment is ₦${property.minimumInvestment}`);
    }
    
    // Check wallet balance
    if (user.wallet.availableBalanceKobo < amountKobo) {
      throw new Error('Insufficient wallet balance');
    }
    
    // Check remaining funding
    const currentFunding = property.currentFunding || 0;
    const remaining = property.targetFunding - currentFunding;
    
    if (amountNaira > remaining) {
      throw new Error(`Only ₦${remaining.toLocaleString()} remaining`);
    }
    
    // Debit wallet
    const reference = `investment_${propertyId}_${Date.now()}_${userId}`;
    await debitWallet(
      user.wallet.id,
      amountKobo,
      reference,
      `Investment: ${property.title}`,
      tx
    );
    
    // Create investment
    const investment = await tx.investment.create({
      data: {
        userId,
        propertyId,
        amount: amountNaira,
        status: 'confirmed',
        certificateNumber: `NEST-${Date.now()}-${userId.slice(0, 8)}`,
        metadata: {
          idempotencyKey,
          termsVersion,
          riskVersion,
          reference,
          confirmedAt: new Date(),
        },
      },
    });
    
    // Update property funding
    await tx.property.update({
      where: { id: propertyId },
      data: {
        currentFunding: {
          increment: amountNaira,
        },
        investorCount: {
          increment: 1,
        },
        status: (currentFunding + amountNaira >= property.targetFunding) 
          ? 'funded' 
          : 'funding',
      },
    });
    
    // Update investor profile
    await tx.investorProfile.update({
      where: { userId },
      data: {
        totalInvested: {
          increment: amountNaira,
        },
        propertiesOwned: {
          increment: 1,
        },
      },
    });
    
    // Audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'INVESTMENT_CREATED',
        metadata: {
          propertyId,
          amount: amountNaira,
          reference,
        },
      },
    });
    
    // Create notification
    await tx.notification.create({
      data: {
        userId,
        title: 'Investment Confirmed',
        message: `Your ₦${amountNaira.toLocaleString()} investment in ${property.title} is confirmed.`,
        type: 'investment',
      },
    });
    
    return {
      success: true,
      investment,
      duplicate: false,
    };
  });
}
```

`src/app/api/investments/create/route.ts`:
```typescript
import { requireVerified } from '@/lib/auth';
import { createInvestment } from '@/lib/investment';
import { z } from 'zod';

const schema = z.object({
  propertyId: z.string(),
  amountNaira: z.number().positive(),
  termsAccepted: z.boolean(),
  riskAccepted: z.boolean(),
});

export async function POST(req: Request) {
  try {
    const user = await requireVerified();
    
    const body = await req.json();
    const { propertyId, amountNaira, termsAccepted, riskAccepted } = schema.parse(body);
    
    if (!termsAccepted || !riskAccepted) {
      return Response.json(
        { error: 'Terms and risk acceptance required' },
        { status: 400 }
      );
    }
    
    // Idempotency key from header
    const idempotencyKey = req.headers.get('idempotency-key') || `${Date.now()}_${user.id}`;
    
    const result = await createInvestment({
      userId: user.id,
      propertyId,
      amountNaira,
      idempotencyKey,
      termsVersion: '1.0',
      riskVersion: '1.0',
    });
    
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
```

**Concurrent close-out test** `src/lib/investment.test.ts`:
```typescript
describe('Investment Concurrency', () => {
  it('should prevent oversubscription', async () => {
    // Create property with ₦1M target, ₦900K already funded
    // Fire 5 concurrent requests for ₦100K each
    // Only 1 should succeed, others should fail
    // Final funding should be exactly ₦1M
  });
});
```

**Exit criteria:**
- [ ] Investment debits wallet and creates holding
- [ ] Duplicate idempotency key returns original
- [ ] Concurrent requests cannot oversubscribe
- [ ] Final funding equals target exactly

---

### Day 2 Evening Checkpoint (8:00 PM)

**Must be working:**
- ✅ Ledger service (credit/debit with replay protection)
- ✅ Demo credit API + UI
- ✅ Investment engine (atomic, idempotent, concurrency-safe)
- ✅ Investment survives page reload

**Tests to run:**
```bash
# 1. Demo credit twice with same reference
# - Should credit once, second is no-op

# 2. Investment below minimum
# - Should fail with clear error

# 3. Investment exceeding balance
# - Should fail without partial debit

# 4. Concurrent close-out
# - Only final slot succeeds, no oversubscription
```

---

## Day 3 (Thursday) — UI + Polish + Demo Prep
**Available:** 12-14 hours  
**Goal:** Complete investor journey + admin flow + mobile-ready

### Phase 3A: Portfolio Views (3 hours)
**Time:** 8:00 AM - 11:00 AM

`src/app/api/wallet/route.ts`:
```typescript
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { koboToNaira } from '@/lib/ledger';

export async function GET() {
  const user = await requireUser();
  
  const wallet = await db.wallet.findUnique({
    where: { userId: user.id },
  });
  
  const entries = await db.ledgerEntry.findMany({
    where: { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  
  return Response.json({
    balance: koboToNaira(wallet.availableBalanceKobo),
    balanceKobo: wallet.availableBalanceKobo.toString(),
    transactions: entries.map(e => ({
      id: e.id,
      type: e.type,
      amount: koboToNaira(e.amountKobo),
      description: e.description,
      createdAt: e.createdAt,
    })),
  });
}
```

`src/app/api/portfolio/route.ts`:
```typescript
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const user = await requireUser();
  
  const investments = await db.investment.findMany({
    where: { 
      userId: user.id,
      status: 'confirmed',
    },
    include: {
      property: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  
  const profile = await db.investorProfile.findUnique({
    where: { userId: user.id },
  });
  
  return Response.json({
    totalInvested: profile?.totalInvested || 0,
    portfolioValue: profile?.portfolioValue || 0,
    rentalIncome: profile?.rentalIncomeEarned || 0,
    holdings: investments.map(inv => ({
      id: inv.id,
      property: {
        title: inv.property.title,
        location: inv.property.city,
        type: inv.property.propertyType,
      },
      amount: inv.amount,
      certificateNumber: inv.certificateNumber,
      purchasedAt: inv.createdAt,
    })),
  });
}
```

**Exit criteria:**
- [ ] Wallet balance from ledger entries
- [ ] Portfolio holdings from confirmed investments
- [ ] No hardcoded money values
- [ ] Empty state for zero investments

---

### Phase 3B: Admin Distribution (3 hours)
**Time:** 11:00 AM - 2:00 PM

`src/lib/distribution.ts`:
```typescript
import { db } from './db';
import { creditWallet, nairaToKobo } from './ledger';

export async function createDistribution(params: {
  propertyId: string;
  period: string;
  amountNaira: number;
  adminId: string;
  idempotencyKey: string;
}) {
  const { propertyId, period, amountNaira, adminId, idempotencyKey } = params;
  
  // Check duplicate
  const existing = await db.distribution.findFirst({
    where: { propertyId, period },
  });
  
  if (existing) {
    return { success: true, distribution: existing, duplicate: true };
  }
  
  return await db.$transaction(async (tx) => {
    // Get eligible investments
    const investments = await tx.investment.findMany({
      where: {
        propertyId,
        status: 'confirmed',
      },
      include: {
        user: {
          include: { wallet: true },
        },
      },
    });
    
    if (investments.length === 0) {
      throw new Error('No eligible investors');
    }
    
    // Calculate total invested
    const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Calculate pro-rata allocations
    const amountKobo = nairaToKobo(amountNaira);
    let allocations = investments.map(inv => {
      const share = inv.amount / totalInvested;
      const allocationKobo = BigInt(Math.floor(Number(amountKobo) * share));
      
      return {
        investmentId: inv.id,
        userId: inv.userId,
        walletId: inv.user.wallet.id,
        amountKobo: allocationKobo,
        share,
      };
    });
    
    // Handle rounding remainder
    const allocated = allocations.reduce((sum, a) => sum + a.amountKobo, BigInt(0));
    const remainder = amountKobo - allocated;
    
    if (remainder > 0) {
      // Give remainder to largest holder
      allocations.sort((a, b) => b.amountKobo > a.amountKobo ? 1 : -1);
      allocations[0].amountKobo += remainder;
    }
    
    // Create distribution record
    const distribution = await tx.distribution.create({
      data: {
        propertyId,
        period,
        totalAmount: amountNaira,
        investorCount: investments.length,
        metadata: { idempotencyKey },
      },
    });
    
    // Credit each wallet
    for (const alloc of allocations) {
      const reference = `distribution_${distribution.id}_${alloc.userId}`;
      
      await creditWallet(
        alloc.walletId,
        alloc.amountKobo,
        reference,
        `Rental income: ${period}`,
        tx
      );
      
      // Create notification
      await tx.notification.create({
        data: {
          userId: alloc.userId,
          title: 'Rental Income Received',
          message: `You received ₦${(Number(alloc.amountKobo) / 100).toFixed(2)} for period ${period}`,
          type: 'distribution',
        },
      });
    }
    
    // Audit log
    await tx.auditLog.create({
      data: {
        userId: adminId,
        action: 'DISTRIBUTION_CREATED',
        metadata: {
          propertyId,
          period,
          amountNaira,
          investorCount: investments.length,
        },
      },
    });
    
    return {
      success: true,
      distribution,
      allocations: allocations.map(a => ({
        userId: a.userId,
        amount: Number(a.amountKobo) / 100,
      })),
      duplicate: false,
    };
  });
}
```

**Exit criteria:**
- [ ] 60/40 fixture produces exact 60/40 allocation
- [ ] Allocations sum to requested amount exactly
- [ ] Duplicate period is safe
- [ ] All investors get notifications

---

### Phase 3C: Mobile Pass (2 hours)
**Time:** 2:00 PM - 4:00 PM

**Test checklist:**
```markdown
## 360px Mobile Test

### Browse
- [ ] Property cards stack vertically
- [ ] No horizontal scroll on card grid
- [ ] Filter button opens bottom sheet
- [ ] Tap targets ≥ 44px

### Property Detail
- [ ] Gallery images fit viewport
- [ ] Investment amount input visible
- [ ] "Invest" button in safe area
- [ ] Risk disclosure readable

### Wallet
- [ ] Balance prominent
- [ ] Transaction list scrollable
- [ ] Demo credit warning visible
- [ ] No table overflow

### Portfolio
- [ ] Holdings stack vertically
- [ ] Certificate numbers wrap
- [ ] Empty state centered

### Investment Checkout
- [ ] Amount input accessible
- [ ] Available balance visible
- [ ] Terms/Risk checkboxes tappable
- [ ] Confirm button doesn't cover content
```

**Add test mode labels:**
```typescript
// src/components/test-mode-banner.tsx
export function TestModeBanner() {
  return (
    <div className="bg-orange-500 text-white text-center py-2 px-4 text-sm font-medium">
      ⚠️ TEST MODE — No Real Money Processed
    </div>
  );
}
```

**Exit criteria:**
- [ ] All investor screens work at 360px
- [ ] No horizontal page scrolling
- [ ] Test mode banner on every money screen
- [ ] Tap targets ≥ 44px

---

### Phase 3D: E2E Test + Demo Prep (3 hours)
**Time:** 4:00 PM - 7:00 PM

**Golden path E2E script:**
```typescript
// tests/e2e/golden-path.spec.ts
import { test, expect } from '@playwright/test';

test('Golden Path: Investor Journey', async ({ page }) => {
  // 1. Fresh seed
  await resetDatabase();
  
  // 2. Browse public marketplace
  await page.goto('/');
  await expect(page.getByText('NEST')).toBeVisible();
  
  // 3. View property detail
  await page.click('[data-testid="property-card-1"]');
  await expect(page.getByText('Minimum Investment')).toBeVisible();
  
  // 4. Sign in (verified investor)
  await page.click('text=Invest');
  // ... Clerk flow ...
  
  // 5. Admin demo credit
  await adminDemoCredit(userId, 500000);
  
  // 6. Invest
  await page.goto(`/properties/${propertyId}/invest`);
  await page.fill('[name="amount"]', '500000');
  await page.check('[name="termsAccepted"]');
  await page.check('[name="riskAccepted"]');
  await page.click('text=Confirm Investment');
  
  // 7. Verify portfolio
  await page.goto('/portfolio');
  await expect(page.getByText('₦500,000')).toBeVisible();
  
  // 8. Admin distribution
  await adminDistribution(propertyId, 'Sep 2026', 10000);
  
  // 9. Verify wallet credit
  await page.goto('/wallet');
  await expect(page.getByText('Rental income')).toBeVisible();
});
```

**Demo recording script:**
```markdown
1. [0:00-0:30] "Hi, I'm showing NEST — our pilot operating system for 7 confirmed investors in Abuja."

2. [0:30-1:00] Property Detail
   - "This is their pilot property with full disclosure"
   - Point to: Title, valuation, funding target
   - "Notice: TEST MODE banner"

3. [1:00-1:30] Sign in + Verification
   - "Our admin team manually verified this demo investor"
   - Show verification badge

4. [1:30-2:00] Demo Credit + Investment
   - "Admin adds test balance — clearly labeled DEMO CREDIT"
   - Invest ₦500,000
   - Show risk disclosure
   - Confirm

5. [2:00-2:15] Portfolio
   - Reload page
   - "Investment persisted in database"
   - Show holding + certificate number

6. [2:15-2:30] Admin Distribution
   - Switch to admin view
   - Run test distribution
   - Show pro-rata calculation

7. [2:30-2:45] Investor Sees Credit
   - Back to investor wallet
   - Show rental income credit
   - Show notification

8. [2:45-3:00] Closing
   - "This proves: transparent deal → traceable ledger → admin control"
   - "Next: retention test with 7 real payers after full disclosure"
   - "Live launch requires: SEC counsel, real KYC, property verification"
```

**Exit criteria:**
- [ ] E2E passes twice from clean seed
- [ ] 3-minute demo recorded
- [ ] Vercel preview deployed
- [ ] All test-mode labels present

---

## Friday Morning — Final Checks
**Time:** 8:00 AM - 12:00 PM

### Pre-Demo Checklist
- [ ] E2E green
- [ ] Mobile 360px pass
- [ ] Test mode labels everywhere
- [ ] .env.example present, no secrets committed
- [ ] Vercel preview live
- [ ] Demo video < 3 minutes
- [ ] Seed script deterministic
- [ ] All money in kobo BigInt
- [ ] Balance = sum of ledger entries
- [ ] Risk disclosure before investment
- [ ] Terms/Risk version persisted with investment

### Emergency Fixes Only
- Fix broken E2E
- Fix mobile critical issues
- Fix security holes (exposed secrets, missing auth)
- NO NEW FEATURES

---

## What This Demo Proves

### ✅ You Built
1. **Single-property data room** with full disclosure
2. **Transparent ledger** with immutable audit trail
3. **Admin control** over verification + distributions
4. **Test-mode safeguards** (no live money path)
5. **Database-backed** (no mock values)
6. **Mobile-first** (360px primary)

### ✅ You Can Execute
- Atomic money transactions
- Concurrency-safe close-outs
- Pro-rata distributions
- Role-based access control
- Audit logging

### 📋 You Know What's Next
1. **Retention test:** 7 payers see full memo, how many stay?
2. **Legal structure:** SEC counsel opinion (C5)
3. **Yield model:** vs T-bills 16.6% (C6)
4. **Property supply:** 2 signed LOIs (C4)

---

## If You Get Stuck

### Database issues?
- Use Neon console to inspect tables
- Check `DATABASE_URL` format
- Prisma Studio: `npx prisma studio`

### Auth issues?
- Check Clerk dashboard for user records
- Verify environment variables
- Test with incognito window

### Money bugs?
- Check ledger entry sum vs wallet balance
- Verify BigInt serialization
- Check for float arithmetic

### Time running out?
- Cut distribution UI (keep API)
- Cut fancy animations
- Cut admin bells and whistles
- NEVER cut: Auth, Ledger, Investment atomicity, Mobile, E2E

---

## Resources

- **Neon:** https://neon.tech
- **Clerk:** https://clerk.com
- **Prisma:** https://prisma.io/docs
- **Next.js:** https://nextjs.org/docs
- **Playwright:** https://playwright.dev

---

**Remember:** You're not building a marketplace. You're building an **operating system for ONE pilot property deal with 7 confirmed investors.**

**Your demo proves you can execute transparent, traceable, admin-controlled fractional property investment.**

**Good luck! 🚀**
