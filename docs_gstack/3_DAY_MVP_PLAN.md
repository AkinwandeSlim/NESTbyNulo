# NEST by Nulo Africa — 3-Day MVP Build Plan

**Version:** 2.1
**Date:** September 17, 2026
**Status:** Updated — Solo Builder Realistic Plan
**Source of Truth:** `docs_gstack/requirements.md` v2.0 and `docs_gstack/locked-scope.md` v2.0

---

## ⚠️ Scope Reminder

This is a **test-mode competition demo only**. The following are explicitly outside the scope of this 3-day build:

| Outside Demo Scope | Reason |
|---|---|
| Legal review, SPV formation, property verification | Requires counsel — not a development task |
| SPV custody and real fund transfers | Requires banking and legal action |
| Live KYC / BVN / NIN / liveness checks | Requires licensed KYC provider |
| Real payment processing (Paystack live mode) | Requires compliance review and production credentials |
| Public solicitation or open investor acquisition | Contradicts pilot boundaries |
| Live distributions or real payout rails | Post-acquisition, requires PropFlow integration |
| Wallet withdrawals | Requires payment rails and compliance |
| Secondary market / share transfers | Not offered in pilot |
| SMS / email notifications | Deferred |
| Native mobile apps | Web-responsive only |
| Real investor data in seed scripts | Forbidden — use illustrative fictional data only |

---

## Builder Profile

**Builder:** One solo developer
**Effective build time:** ~24 hours over 3 days (~8 hours/day)
**Reality check:** 24 hours is tight for 5 Must-haves. The builder must work in the smallest possible slices, skip all CSS polish until the golden path works, and accept a functional-but-minimal UI over a polished incomplete one.

---

## Non-Negotiable Engineering Rules

These apply to every line of code written during this build. Source: `doc2/ARCHITECTURE_ESSENTIALS.md`.

1. **Money in BigInt kobo** — never float or `number` for persisted monetary values
2. **Server is authoritative** — never trust client-provided balance, role, KYC state, or funding capacity
3. **No direct wallet writes** — all money moves through the ledger service inside a database transaction
4. **Every sensitive mutation is idempotent** — unique references; duplicate cannot post twice
5. **Verify first, act second** — role and KYC checks run before any service call
6. **Atomic investment transaction** — all-or-nothing; no partial state
7. **No mock data in investor screens** — all displayed values come from the database
8. **Test mode labels** — every money screen shows "TEST MODE — NOT A LIVE OFFERING OR PAYMENT"
9. **Real data forbidden** — no real investor names, emails, payment records, or account details in seed

---

## Technology Stack (Locked for Demo)

| Choice | Reason |
|---|---|
| Postgres / Neon | BigInt support, transaction isolation, SELECT FOR UPDATE for concurrency |
| Clerk | Free auth, hosted UI, fast integration — Clerk owns credentials; NEST owns roles |
| No Paystack live mode | Admin demo credit path only — no live payment delays |
| Next.js (existing structure) | Preserve working codebase; no App Router migration during sprint |
| shadcn/ui (already installed) | Mobile-friendly components; do not add new UI libraries |
| Prisma (existing) | Single DB client entry point: `src/lib/db.ts` |
| Vitest | Fast, TypeScript-native testing |

---

## Day 1 — Backend Services + Property Data Room (Target: 8 hours)

> Priority: All backend services must be working before any screen UI is wired.

### Morning (4 hours) — Infrastructure
- [ ] **Postgres migration** — Update `prisma/schema.prisma` to Neon Postgres; BigInt kobo fields on all money columns; `npx prisma migrate dev --name v2-postgres-bigint`
- [ ] **Seed script** — Deterministic seed: ADMIN + VERIFIED (Adaeze, ₦5M demo credit) + PENDING (Emeka, ₦0) + VERIFIED with pre-seeded investment (Fatima, ₦7M credit → ₦5M principal + ₦100K fee invested → ₦1,900,000 balance); Illustrative property (₦100M target, ₦5M raised); all demo credits labelled "DEMO CREDIT — NOT A PAYMENT"
- [ ] **Verify seed runs twice** — `npx prisma db seed` × 2 with no errors

### Afternoon (4 hours) — Core Services + Screen 1
- [ ] **Ledger service** (`src/server/services/ledger.ts`) — `credit()`, `debit()`, `getBalance()`, duplicate reference rejection; wallet `availableBalanceKobo` updated in same transaction as ledger posting
- [ ] **Authorization middleware** — `requireAuth()`, `requireVerified()`, `requireAdmin()` — server-side only; 401 for anonymous, 403 for wrong role/status
- [ ] **Admin demo credit endpoint** — `POST /api/admin/wallet/credit` — requireAdmin, idempotency, labels "DEMO CREDIT — NOT A PAYMENT"
- [ ] **Screen 1: Property Data Room** — `GET /api/properties/:id` → display with DB-backed values, fee line items, yield labelled PROJECTION ONLY, TEST MODE banner

**End-of-Day-1 Checks:**
- `npx prisma db seed` runs twice without errors ✓
- PENDING investor gets 403 on `POST /api/investments` ✓
- Admin gets 200 on `POST /api/admin/wallet/credit` ✓
- Anonymous gets 401 on `/api/wallet` ✓
- Ledger unit tests: credit/debit/duplicate reference pass ✓
- Property Data Room renders with DB-backed values and TEST MODE label ✓
- Fatima's seeded balance = ₦1,900,000 (ledger SUM matches) ✓

---

## Day 2 — Investment + Portfolio + Wallet Screens (Target: 8 hours)

### Morning (4 hours) — Investment Engine
- [ ] **Investment API** (`POST /api/investments`) — Zod validation; requireVerified; atomic transaction: SELECT wallet FOR UPDATE → validate min(₦500K)/max(₦10M)/balance/capacity → debit via ledger (principal + 2% fee, both as separate ledger entries) → INSERT investment (ownership = principal ÷ target) → UPDATE property.fundingRaisedKobo → INSERT AuditLog → COMMIT; hard stop at ₦100M; idempotent idempotencyKey
- [ ] **Screen 3: Investment** — Combined single page with amount input (live calculation: fee, total debit, ownership %, projected yield on principal) + 6 mandatory risk consent checkboxes (Confirm disabled until all checked); POST to investment API; redirect to Portfolio with success toast + receipt number

### Afternoon (4 hours) — Portfolio + Wallet
- [ ] **Portfolio API** (`GET /api/portfolio`) — wallet balance from ledger SUM; confirmed holdings; last 10 transactions; all DB-derived
- [ ] **Screen 4: Portfolio** — Wallet balance card, holdings list (principal, fee, ownership %, status), recent transactions, empty states
- [ ] **Screen 2: Wallet + Verification Status** — Available balance from ledger SUM; inline verification state (PENDING/VERIFIED/REJECTED message); transaction history (last 10); DEMO CREDIT entries labelled prominently

**End-of-Day-2 Checks:**
- Verified investor can invest ₦500K minimum from demo wallet ✓
- Investment persists after page reload ✓
- Concurrent investment requests do not oversubscribe ₦100M ✓
- Insufficient balance returns 400 with clear error message ✓
- PENDING investor gets 403 on investment API (not just UI) ✓
- Ledger SUM = wallet balance after every operation ✓
- Fee model: ₦2M principal → ₦40K fee → ₦2.04M total debit → 2.0% ownership ✓
- Portfolio shows Fatima's pre-seeded ₦5M / 5.0% ownership ✓
- TEST MODE labels on investment flow, wallet, and portfolio ✓

---

## Day 3 — Admin Panel + Should-Haves + Demo Prep (Target: 8 hours)

**Only begin Screen 6 (Admin Distribution) if all Day 2 checks pass.**

### Morning (4 hours) — Admin Panel + Optional Distribution
- [ ] **Screen 5: Admin Panel** — Combined page: user management table (Verify/Reject with AuditLog + Notification), demo credit issuing (with idempotency + label), investment registry view. If critically short on time, skip verification UI and use direct API calls during the demo (saves 2–3 h).
- [ ] **Screen 6: Admin Distribution** (Should-have; only if Screen 5 is done) — Single `POST /api/admin/distributions` endpoint (action: preview / execute); admin enters rent, system calculates management fee (8% of rent) and net; previews pro-rata (unfunded portion = reserve, not credited); admin confirms; atomic: credit investor wallets via ledger; idempotent (property+period unique constraint)

### Afternoon (4 hours) — Demo Prep and Verification
- [ ] TEST MODE labels verified on all 5–6 screens
- [ ] Risk consent: all 6 checkboxes required; Confirm blocked until all checked
- [ ] Fee line items visible before investment confirmation
- [ ] Loading, error, and empty states on all async operations
- [ ] Mobile check at 360px: no horizontal scroll, 44px touch targets, sticky Confirm
- [ ] **Golden path E2E — twice from clean seed**
- [ ] Deploy to Vercel preview — test with fresh preview URL
- [ ] Rehearse 3-minute demo script

**End-of-Day-3 Checks:**
- Golden path E2E passes twice from clean seed ✓
- Authorization matrix (401/403) correct for all roles ✓
- Ledger: SUM(entries) = wallet balance after all operations ✓
- No oversubscription under concurrent requests ✓
- Fee model consistent: principal + 2% fee = total debit; ownership on principal ✓
- All money screens show TEST MODE label ✓
- All yield figures show PROJECTION ONLY label ✓
- Risk disclosures shown; 6 checkboxes required ✓
- Mobile screens functional at 360px ✓
- No real investor data in seed ✓
- Vercel preview deployed and accessible ✓

---

## Demo Script Timing (Friday — 3 Minutes)

Refer to `COMPETITION_DEMO_DATA.md` for the full 8-step demo script with exact time allocations.

**Minimum viable demo (if only Must-haves complete):**
1. Property Data Room (30s)
2. Authorization check — PENDING gets 403 (20s)
3. Admin demo credit (30s)
4. Investment flow with risk checkboxes (45s)
5. Portfolio persistence after reload (30s)
6. Closing statement (25s)

**Full demo (if Should-haves FR-007 complete):**
Add Steps 6–7: Admin distribution and investor wallet credit.

---

## Cut Order (Strict)

If behind schedule, cut in this exact order:

| Order | What to Cut | Fallback |
|---|---|---|
| Cut 1st | Full Transaction History (FR-009) | Recent transactions on portfolio screen covers this |
| Cut 2nd | Investment Confirmation Screen (FR-008) | Redirect to portfolio with success toast |
| Cut 3rd | Admin Verification UI (FR-006) | Admin verifies via direct API call for demo |
| Cut 4th | Admin Distribution Panel (FR-007) | Explain distribution concept without live demo; show only if fully working |
| **NEVER CUT** | Any of 5 Must-haves (FR-001–FR-005) | Without all 5, the demo is broken — fix them first |

---

## Stop Conditions

**If any of these are true at the end of Day 2, do not start Should-haves on Day 3:**
- Investment API has an untested edge case (concurrent close-out, insufficient balance, PENDING block)
- Portfolio data contains any hardcoded values
- Ledger SUM ≠ wallet balance in any test scenario
- TEST MODE label is absent from any money screen
- Any real investor data is present in the seed script

**If any of these are true at the end of Day 3, do not deploy:**
- Golden path E2E has not passed twice from clean seed
- Any Must-have feature is broken or untested
- Any money screen lacks the TEST MODE label
- Any claim of SEC approval or guaranteed returns exists in any UI string

---

## Three Critical Post-Demo Blockers

Before any live capital activity (after demo), the founder must resolve:

1. **C5 — Legal:** Get written opinion from Nigerian securities counsel on: SEC registration requirements; SPV structure compliance; investor protection requirements under ISA 2025. Source: [https://www.sec.gov.ng](https://www.sec.gov.ng)
2. **C6 — Returns model:** Build a detailed financial model showing 7–9% projected yield after all costs (vacancy, maintenance, reserves, management fee, legal costs, tax). Compare honestly with T-bill yield (~18–20%) and document why the property investment case is compelling for target investors.
3. **C4 — Property supply:** Get at least 2 signed letters of intent (LOIs) from property developers or vendors with property-specific economics, so there is a credible pipeline beyond the current target property.

---

## Emergency Resources

- **Neon Postgres:** https://neon.tech (free tier, instant setup)
- **Clerk:** https://clerk.com (free tier, 10K MAU)
- **Prisma Docs:** https://prisma.io/docs
- **SEC Nigeria:** https://www.sec.gov.ng
- **Architecture rules:** `doc2/ARCHITECTURE_ESSENTIALS.md`
- **Spec index:** `doc2/IMPLEMENTATION_PLAN.md`

---

**Your competitive advantage is NOT fractionalization alone — many platforms offer that.**
**Your advantage is: verifiable deal quality + operational trust (PropFlow) + transparent disclosure.**
**This demo proves you can execute that thesis with traceable, auditable infrastructure.**

---

**Document Status:** Approved for Solo-Builder Demo
**Source of Truth:** requirements.md v2.0 and locked-scope.md v2.0
**Last Updated:** September 16, 2026

