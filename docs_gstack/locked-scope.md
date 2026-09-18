# NEST by Nulo Africa — Locked Scope (Demo Build)

**Date:** September 17, 2026
**Status:** LOCKED for Solo-Builder Demo Build
**Builder:** One solo developer
**Build window:** 3 working days (approx. 24 effective development hours)
**Demo date target:** September 19, 2026

> **Locked scope for demo: no additions after Day 1 without removing something of equal size.**
> This document locks Must-have features only. Should-have and Could-have features are optional and attempted only if all 5 Must-haves are complete and passing before end of Day 2.

---

## Must-Have Features for 3-Day Solo Demo Build

Without all 5, the demo cannot show the core investment cycle end-to-end.

| Feature | Description | FR Ref | Estimated Hours |
|---|---|---|---|
| **Single Property Data Room** | Illustrative test property display: ₦100M funding target, current funding progress, risk disclosures, fee line items (2% of principal as platform fee, added on top + up to 8% of rent collected as management fee), projected yield (7–9%, labelled as projection only), lock-up terms, property status (FUNDING/FUNDED/ACTIVE). All values from DB seed. No hardcoded UI values. "TEST MODE — NOT A LIVE OFFERING OR PAYMENT" label visible. | FR-001 | 6–8 hours |
| **Seeded Demo Roles + Server-Side Authorization** | Pre-created demo accounts seeded: ADMIN, VERIFIED investor, PENDING investor. Server enforces: PENDING → 403 on /api/investments; non-ADMIN → 403 on /api/admin/*; anonymous → 401 on wallet/portfolio. Authorization checked server-side only. | FR-002 | 4–5 hours |
| **Immutable Demo Ledger + Admin Demo Credit** | Append-only ledger table (BigInt kobo). Wallet balance = SUM(POSTED entries). Admin-only endpoint: POST /api/admin/wallet/credit — labels credit "DEMO CREDIT — NOT A PAYMENT" in both ledger and UI. Idempotent: same reference cannot post twice. | FR-003 | 5–6 hours |
| **Atomic Demo Investment** | Two-step flow: (1) Investment summary with fee line items and mandatory risk consent checkboxes — Confirm disabled until all checked; (2) Atomic transaction: SELECT wallet FOR UPDATE, validate verified/min/max/balance/capacity, INSERT ledger debit + fee entries, INSERT investment record, UPDATE property fundingRaisedKobo, INSERT AuditLog, COMMIT. Hard stop at ₦100M. Idempotent idempotencyKey. | FR-004 | 8–10 hours |
| **Persisted Portfolio + Audit Trail** | Portfolio screen: wallet balance from ledger SUM, confirmed holdings (property, amount, ownership %, status), last 5–10 transactions. All values DB-derived. Persists after page reload. Admin panel: view all investments and AuditLog entries. | FR-005 | 5–6 hours |
| **TOTAL** | | | **22–28 hours** (backend services + 5 Must-have screens) |

---

## Money Integrity Rules (Non-Negotiable)

These rules apply to every line of code written during this demo build:

1. **All currency in BigInt kobo** — never float or `number` for persisted money
2. **Wallet balance never stored independently** — always calculated as `SUM(POSTED ledger entries)`
3. **Transactional read model permitted** — `availableBalanceKobo` on the Wallet row may be updated within the same transaction as ledger posting for read performance, but it must always equal the ledger SUM
4. **All money moves through ledger service** — no component or route handler writes the wallet directly
5. **Investment transaction is atomic** — all-or-nothing, no partial failures
6. **Idempotency on all mutations** — same reference/idempotencyKey cannot post twice
7. **Hard stop at ₦100M** — no oversubscription under any concurrent request pattern

---

## Authorization Matrix (Non-Negotiable)

| Endpoint | Anonymous | PENDING Investor | VERIFIED Investor | Admin |
|---|---|---|---|---|
| GET /api/properties/* | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |
| GET /api/wallet | ❌ 401 | ✅ 200 | ✅ 200 | ✅ 200 |
| POST /api/investments | ❌ 401 | ❌ 403 | ✅ 201 | ✅ 201 |
| GET /api/portfolio | ❌ 401 | ✅ 200 | ✅ 200 | ✅ 200 |
| POST /api/admin/* | ❌ 401 | ❌ 403 | ❌ 403 | ✅ 200/201 |

---

## Day-by-Day Breakdown (Solo Builder)

### Day 1 — Foundation
1. Database schema: migrate to Postgres (Neon), BigInt kobo fields, deterministic seed script
2. Seed script: create ADMIN, VERIFIED, and PENDING demo accounts + wallets; create illustrative test property (₦100M target, ₦0 raised initially)
3. Ledger service: `credit()`, `debit()`, balance calculation, duplicate reference test
4. Authorization middleware: requireAuth, requireVerified, requireAdmin
5. Admin demo credit endpoint: POST /api/admin/wallet/credit with idempotency and demo label

**End-of-Day-1 Check:** Anonymous cannot hit /api/investments. PENDING investor gets 403. Admin gets 200 on /api/admin/*. Seed runs twice without errors.

### Day 2 — Investment + Portfolio + Wallet Screens (Target: 8 h)

1. **Investment API** — `POST /api/investments`: atomic transaction with all validation (fee model: principal + 2% fee added on top = total wallet debit; ownership = principal ÷ target)
2. **Screen 3: Investment** — Combined amount + review + consent on one page; live fee/ownership calculation; 6 mandatory checkboxes; Confirm disabled until all checked; redirects to Portfolio with toast on success
3. **Portfolio API** — `GET /api/portfolio`: wallet balance from ledger SUM + confirmed holdings + last 10 transactions (all DB-derived)
4. **Screen 4: Portfolio** — Render holdings, wallet balance, recent transactions
5. **Screen 2: Wallet + Verification Status** — Available balance from ledger SUM; inline verification state; transaction history (last 10); DEMO CREDIT labelling

**End-of-Day-2 Checks:**
- Verified investor can invest from demo wallet ✓
- Investment survives page reload ✓
- Concurrent requests do not oversubscribe ₦100M ✓
- Ledger SUM = wallet balance after every operation ✓
- PENDING investor gets 403 on investment API ✓
- Wallet balance on portfolio matches wallet screen ✓
- TEST MODE labels visible on investment flow, wallet, and portfolio ✓

### Day 3 — Admin Panel + Should-Haves + Demo Prep (Target: 8 h)

**Only begin Should-have Screen 6 if all Day 2 checks pass.**

1. **Screen 5: Admin Panel** — Combined user management (verify/reject), demo credit issuing, investment registry view. If time is critically short, skip the verify UI and use direct API calls for the demo.
2. **Screen 6: Admin Distribution** (Should-have; only if Screens 1–5 are passing) — Preview + execute via single `POST /api/admin/distributions` endpoint
3. **Demo polish:**
   - TEST MODE labels verified on all 5–6 screens
   - Risk consent checkboxes block Confirm until all 6 are checked
   - Loading, error, and empty states on all async operations
   - Fee line items visible before investment confirmation
4. **Mobile check** — 360px viewport: no horizontal scroll, 44px touch targets, sticky Confirm button
5. **Golden path E2E** — twice from clean seed
6. **Deploy** to Vercel preview; test with fresh preview URL

**End-of-Day-3 Checks:**
- Golden path E2E passes twice from clean seed ✓
- Authorization matrix: 401/403 correct for all roles ✓
- Ledger integrity: SUM = wallet balance after all operations ✓
- No oversubscription under concurrent requests ✓
- All money screens show TEST MODE label ✓
- Yield figures labelled PROJECTION ONLY ✓
- Risk disclosures shown; 6 checkboxes required ✓
- Fee line items visible before investment ✓
- Mobile screens functional at 360px ✓
- No real investor data in seed ✓
- Vercel preview deployed and accessible ✓

---

## Stop Conditions (If Behind Schedule)

If the Day 2 end-of-day check is not passing by end of Day 2:
- Do NOT start Should-have features
- Spend Day 3 exclusively on getting all 5 Must-haves working and tested
- Accept a simpler demo (no distribution) rather than a broken one

If any Must-have has a critical bug at end of Day 3:
- Do NOT add new features
- Fix the bug; do not ship broken core functionality

---

## What is Explicitly Locked OUT

These items must not be started during the 3-day build:

- Live payment integration (Paystack production)
- Real KYC / BVN / NIN collection
- Wallet withdrawal
- Secondary market or share transfers
- Public onboarding or open solicitation
- SMS / email notifications
- Native mobile apps
- Real investor data in seed scripts
- Any use of the real ₦15,000,000 or real 7 investors as demo data
- Any claim of SEC registration or approval
- Any guarantee of investment returns

---

## Demo Safety Requirements

Before sharing the Vercel preview link:

- [ ] "TEST MODE — NOT A LIVE OFFERING OR PAYMENT" visible on: Property Data Room, Investment flow, Wallet screen, Portfolio screen
- [ ] All yield figures labelled "Projected — not guaranteed"
- [ ] Risk disclosures visible before investment confirmation, with checkboxes required
- [ ] All fee line items (platform fee, management fee) shown before investment confirmation
- [ ] No real investor data in seed (fictional names, illustrative amounts only)
- [ ] Admin demo credit labelled "DEMO CREDIT — NOT A PAYMENT" in UI and ledger
- [ ] AuditLog records exist for all admin actions and investments

---

**Changes Allowed:** None to Must-have scope until post-demo (September 20, 2026)
**Source of Truth:** Requirements.md v2.0
**Last Updated:** September 16, 2026

