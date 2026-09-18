# NEST MVP — 3-Day Competition Sprint Plan
**Created:** 2026-09-15  
**Competition Deadline:** Friday 2026-09-19  
**Days Remaining:** 3 (Tuesday, Wednesday, Thursday)

---

## Strategic Context (From Advisor Feedback)

### ❌ DO NOT BUILD (Competition Scope Cuts)
- Public fractional marketplace with open investor acquisition
- Wallet marketed as "investment-ready" with live money
- Multiple property listings
- Return projections that read as promises
- "Verified developer" badges without documented standards
- Live Paystack integration (use demo credit path only)
- Withdrawals, refunds, or live payout rails
- Real KYC/BVN/NIN collection
- PDF certificates or legal execution

### ✅ BUILD THIS (Validated 5-Day MVP Scope)
1. **Investor onboarding** with demo verification (admin-controlled)
2. **Single named-property data room** with full disclosure
3. **Clear risk/fee/lock-up disclosures** (not promises)
4. **Payment reconciliation** + immutable internal ledger
5. **Admin allocation** + investor reporting
6. **Manual legal review gate** before money moves

### 🎯 Demo Success Metric
**The retention test:** Send full investment memo (title, valuation, fees, yield, lock-up, loss scenarios, legal structure) to your 7 existing payers with 72-hour reconfirm/withdraw window. 

**Your real validation = how many of the 7 stay after full disclosure.**

---

## Current State Assessment

### ✅ What You Have
- Next.js 16 + React 19 setup
- Prisma schema (SQLite, needs Postgres migration per spec)
- Basic API routes: `/api/dashboard`, `/api/portfolio`, `/api/properties`
- shadcn/ui component library
- Basic lib utilities (`db.ts`, `nest-store.ts`, `nest-utils.ts`)
- Comprehensive spec documents (SPEC-00 through SPEC-06)

### ❌ What's Missing (Critical for Demo)
- **Postgres migration** (currently SQLite)
- **Clerk authentication** integration
- **Ledger service** (kobo BigInt)
- **Investment engine** (wallet-based)
- **Admin controls** (verification, distribution)
- **Real data persistence** (everything DB-backed)
- **Mobile-first UI** (360px primary target)
- **Test/demo mode labels** everywhere

---

## 3-Day Execution Plan

### **DAY 1 — TUESDAY (Foundation + Auth)**
**Goal:** Database + authentication + basic investor flow working

#### Morning (4 hours)
- [ ] **SPEC-00: Foundation**
  - Switch from SQLite to Postgres (Neon free tier)
  - Update `prisma/schema.prisma` to use Postgres with BigInt kobo fields
  - Create deterministic seed (1 admin, 1 verified investor, 1 pending, 1 funding property)
  - Add missing npm scripts: `typecheck`, `test`, `test:e2e`
  - Create `.env.example` with all required vars

#### Afternoon (4 hours)
- [ ] **SPEC-01: Auth + RBAC**
  - Integrate Clerk (free plan, hosted UI)
  - Create local user/wallet mirror on first auth
  - Build authorization helpers: `requireUser`, `requireAdmin`, `requireVerified`
  - Protect API routes with proper 401/403
  - Admin verification flow (demo state only)
  
**Exit Criteria:** Fresh seed works, pending investor gets 403 on invest, admin can access admin routes

---

### **DAY 2 — WEDNESDAY (Money + Investment)**
**Goal:** Ledger + demo credit + investment engine working

#### Morning (4 hours)
- [ ] **SPEC-02: Ledger + Demo Credit**
  - Build immutable ledger service (credit/debit in kobo BigInt)
  - Balance = signed sum of ledger entries
  - Admin-only demo credit endpoint (clearly labeled "DEMO CREDIT — NOT A PAYMENT")
  - Replay protection (unique reference check)
  - Basic wallet API: balance + transaction history

#### Afternoon (4 hours)
- [ ] **SPEC-03: Investment Engine**
  - Investment validation (verified, active, min/max, balance, funding remaining)
  - Atomic transaction: wallet debit → create investment → update funding → audit log
  - Idempotency key support
  - Concurrency protection (no oversubscription)
  - Investment receipt/certificate reference

**Exit Criteria:** Duplicate demo credit safe, investment survives reload, concurrent close-out test passes

---

### **DAY 3 — THURSDAY (UI + Polish + Demo Prep)**
**Goal:** Complete investor journey + admin flow + mobile-ready

#### Morning (3 hours)
- [ ] **SPEC-04: Portfolio Views**
  - Real wallet balance/history UI (from ledger entries)
  - Real portfolio holdings UI (from confirmed investments)
  - Remove ALL hardcoded money values
  - Empty states for zero-investment users

#### Mid-day (3 hours)
- [ ] **SPEC-05: Admin Distribution**
  - Admin verification UI
  - Admin investment inspection
  - Demo distribution runner (property + period + amount)
  - Pro-rata allocation with exact rounding
  - Distribution credits wallets + creates notifications

#### Afternoon (2 hours)
- [ ] **SPEC-06: Mobile Pass + Labels**
  - Test all investor flows at 360px, 390px, 768px, 1280px
  - Add "TEST MODE" / "SANDBOX" labels to every money screen
  - Risk disclaimer before investment confirmation
  - Fix any horizontal scrolling issues
  - Loading/error/empty states everywhere

#### Evening (2 hours)
- [ ] **Demo Prep**
  - Golden path E2E test twice from clean seed
  - Deploy to Vercel preview (test credentials only)
  - Create demo script (see below)
  - Record 3-minute walkthrough video

**Exit Criteria:** E2E passes twice, mobile works, preview deployed with clear test-mode labels

---

## Friday Demo Script (3 minutes)

**Scenario:** Show the validated pilot flow for the 7 Abuja payers

1. **[30s] Open single-property data room**
   - "This is the pilot property for our 7 confirmed investors"
   - Show: Title, location, valuation basis, funding target, risk label
   - Point out: "This is TEST MODE — no live money"

2. **[30s] Sign in as verified demo investor**
   - "Our admin team manually verified this demo investor"
   - Show verification status badge

3. **[45s] Demo credit + investment**
   - Click "Fund Test Wallet" → admin demo credit flow
   - Label clearly: "DEMO CREDIT — NOT A PAYMENT"
   - Invest ₦500,000 from wallet
   - Show: Risk disclosure → confirm → receipt

4. **[30s] Portfolio persistence**
   - Reload page
   - Show: Confirmed holding in portfolio
   - Show: Wallet debit in transaction history

5. **[30s] Admin distribution**
   - Switch to admin view
   - Show: Investment record
   - Run test distribution (e.g., ₦10,000 rental income)
   - Show: Pro-rata allocation calculation

6. **[15s] Investor sees distribution**
   - Back to investor view
   - Show: Distribution credit in wallet
   - Show: Notification received

7. **[30s] Closing statement**
   - "This demo proves the core flow: verified investor → transparent deal → immutable ledger → admin control"
   - "Live investment requires: legal structure (SEC counsel), real KYC, property verification, and operational controls"
   - "Our retention test with 7 existing payers happens after this competition"

---

## Competition Positioning (Based on Advisor Feedback)

### What You're Solving
> "How can a financially capable Nigerian get transparent, professionally managed exposure to a specific income-producing property without buying, managing, or trusting an entire property deal alone?"

### What You're NOT Building (Yet)
- Broad marketplace with ₦500K floor and yield marketing
- Open investor acquisition
- Unregulated securities offering

### Evidence You Have
- 55 waitlist records
- 28 in Abuja
- **7 people who paid ₦15M (~₦2.14M average)**
- This justifies a **controlled pilot**, not a public platform

### Three Blockers to Address Post-Competition
1. **C5 (Legal):** Get Nigerian securities counsel opinion on lawful structure
2. **C6 (Returns):** Rebuild financial model vs. T-bills (16.6% vs. property 4-7%)
3. **C4 (Supply):** Get 2 signed developer LOIs with property-level economics

---

## Technology Decisions (Locked for 3 Days)

| Choice | Reason |
|---|---|
| Postgres (Neon) | BigInt kobo support, free tier, Prisma native |
| Clerk | Free auth, hosted UI, fast integration |
| No Paystack | Demo credit path only (no payment provider delays) |
| SQLite → Postgres | Specs require Postgres for BigInt + transaction isolation |
| Next.js Pages Router | Keep existing structure, don't migrate to App Router mid-sprint |
| shadcn/ui | Already installed, mobile-friendly components |
| Vitest | Fast, TypeScript-native testing |

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| Database migration takes too long | Use Neon serverless Postgres (5min setup) + Prisma migrate |
| Clerk integration blocked | Auth is Day 1 morning — if stuck by noon, escalate immediately |
| Investment atomicity bugs | SPEC-03 has explicit concurrent close-out test — must pass |
| Mobile layout breaks | Start every screen at 360px, test at 4 breakpoints before moving on |
| E2E test fails Friday morning | Thursday evening dry run catches issues with 12hr buffer |

---

## Non-Negotiable Rules (From ARCHITECTURE_ESSENTIALS.md)

1. **Money uses kobo BigInt** — no `number` types for currency
2. **Server is authoritative** — never trust client for balance/role/kyc
3. **No direct wallet writes** — all money moves through ledger service
4. **Idempotent sensitive mutations** — unique references, idempotency keys
5. **Mobile-first** — 360px is primary viewport, not desktop
6. **Test mode labels** — every money screen says "TEST" or "SANDBOX"
7. **Real data only** — no hardcoded balances or mock portfolio numbers
8. **Verify first, act second** — check role/kyc before service runs

---

## Daily Checkpoint Questions

### End of Day 1
- Can a pending investor access the invest endpoint? (Should be 403)
- Does seed run twice without errors?
- Can admin access admin routes? (Should be 200)

### End of Day 2
- Can you credit demo wallet twice with same reference? (Should be no-op)
- Does investment survive page reload? (Should show in portfolio)
- Can concurrent requests oversubscribe? (Should fail safe)

### End of Day 3
- Does E2E pass twice from clean seed? (Must be yes)
- Do investor screens work at 360px? (Must be yes)
- Are all money screens labeled TEST MODE? (Must be yes)

---

## Cut Priority If Behind Schedule

**Cut in this order (least → most important):**

1. ~~Paystack integration~~ (Already cut — demo credit only)
2. Distribution UI polish (keep tested API/service)
3. Fancy animations/charts
4. Admin bulk actions
5. Notification UI (keep notification records)

**NEVER CUT:**
- Authorization/RBAC
- Ledger invariants
- Investment atomicity
- Mobile checkout usability
- E2E proof
- Test-mode labels

---

## Success Metrics for Friday

| Metric | Target | How to Prove |
|---|---:|---|
| Golden path completion | 100% | E2E test runs twice green |
| Permission correctness | 100% | 401/403 matrix test passes |
| Money integrity | 0 mismatches | Ledger unit tests pass |
| Funding correctness | 0 oversubscription | Concurrent API test passes |
| Mobile usability | Works at 360px | Manual visual test |
| Demo clarity | Under 3min | Timed practice run |

---

## Post-Competition Next Steps

### Before Taking Real Money
1. Get Nigerian securities legal opinion (C5)
2. Implement real KYC (not demo verification)
3. Secure property documents (access-controlled storage)
4. Get 2 signed developer LOIs (C4)
5. Rebuild yield model vs T-bills (C6)
6. Add withdrawal controls
7. Security audit
8. Production monitoring + incident runbook

### The Retention Test (Week After Competition)
1. Draft full investment memo:
   - Property title evidence
   - Independent valuation basis
   - All fees (management, platform, legal)
   - Expected net cash yield vs T-bills/MMFs
   - Lock-up period
   - Loss scenarios (property depreciation, vacancy, developer default)
   - Refund terms
   - Legal structure (SPV, REIS, or approved alternative)

2. Send to 7 existing payers with 72-hour window to reconfirm or withdraw

3. **Actual validation metric:** How many of the 7 stay after full disclosure

---

## Emergency Contacts & Resources

- **Neon Postgres:** https://neon.tech (free tier, instant setup)
- **Clerk:** https://clerk.com (free tier, 10k MAU)
- **Prisma Docs:** https://prisma.io/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Advisor Feedback:** See original instruction at top of this file

---

## Execution Discipline

- **One spec at a time** — finish before starting next
- **Definition of Done** — tests pass, not "looks right"
- **Mobile-first** — start at 360px, enhance up
- **No scope creep** — anything not in 6 specs is backlog
- **Test before push** — E2E twice green before deploy
- **Ask for decisions** — don't invent product behavior

---

**Your competitive advantage is NOT fractionalization (everyone can do that).**

**Your advantage is: verifiable deal quality + operational trust + transparent disclosure.**

**This demo proves you can execute that thesis with traceable, auditable infrastructure.**

**Good luck! 🚀**
