# NEST by Nulo Africa — Architecture Essentials and Agent Build Rules

**Version:** 2.0 · **Purpose:** the concise operating agreement for the five-day MVP.  
**Read order:** this file → [PRD](PRD.md) → [Architecture](ARCHITECTURE.md). If documents disagree, this file controls safety/integrity rules; the PRD controls scope; Architecture controls implementation design.

## 1. The only sprint outcome

Ship a test-mode investor-demo flow that persists and proves:

```text
verified demo investor → test wallet funding → wallet investment → portfolio holding
admin → one pro-rata demo distribution → investor wallet credit
```

Anything that does not directly improve, secure, test, or demonstrate that flow is backlog.

## 2. Scope guardrail

### Build now

- Existing marketplace/detail, auth/local user mirror, role/KYC-lite gate.
- Postgres migration, BigInt-kobo ledger, Paystack test webhook, wallet investment.
- Real wallet/portfolio data, minimal admin verification/distribution, notifications.
- Tests, error states, sandbox/risk labels, Vercel preview.

### Do not build now

- Live payments, withdrawals, identity/BVN/NIN/bank details, document uploads, legal execution.
- Secondary market, referrals, Academy, email/SMS, PDF certificates, full CMS/admin CRUD, mobile app.
- App Router migration, redesign of working screens, unrelated dependency upgrades, bulk refactors.

## 3. Agent operating rules

These rules apply to every coding agent (Codex, Claude Code, Antigravity, or human contributor).

1. **Read before changing.** Inspect the relevant existing component, route, schema, and these documents before modifying a feature.
2. **One bounded specification at a time.** State the files/API/test expected before implementation. Do not begin a dependent spec until its prerequisite test passes.
3. **Preserve user work.** Treat uncommitted changes as user-owned. Do not reset, delete, overwrite, or “clean up” unrelated files.
4. **No invented product behavior.** Ask for a decision when it changes money, compliance, a user journey, or provider choice. Use the documented fallback only where specified.
5. **No silent mocks.** A screen that presents balance, investment, funding, or portfolio data must use the database. An explicit demo fixture is allowed only when labelled as such.
6. **Server is authoritative.** Never trust a client-provided balance, role, KYC state, investment price, funding availability, or payment result.
7. **Money uses kobo BigInt.** No float/`number` persisted-money calculations. Convert only at input/output boundaries.
8. **No direct wallet writes.** Credits and debits go through `ledger.ts` within a transaction. No component or route handler may update `Wallet` directly.
9. **Every sensitive mutation is idempotent.** Provider events require unique references; user actions require idempotency keys when retryable.
10. **Verify first, act second.** Webhooks verify raw payload signature before parsing and posting. KYC/role gates are checked before services run.
11. **Use provider test modes only.** Never request, paste, log, or test with personal payment, bank, identity, or production-secret data.
12. **Tests precede wiring.** Add/adjust service and route tests before connecting a UI button to a write endpoint.
13. **Keep the diff narrow.** Do not reformat or rename unrelated code. Do not add a package without a documented need in the active spec.
14. **Finish honestly.** Report files changed, commands run, tests passed/failed, known gaps, and the next safe handoff. Never claim production readiness.
15. **Keep authority singular.** Clerk authenticates identity; NEST Postgres owns roles, demo verification, wallet and investment state. Do not introduce duplicate editable role/KYC metadata.
16. **Protect final consent.** Terms/Risk consent is recorded server-side with a version and timestamp as part of investment confirmation.

## 4. Required implementation order

| Order | Deliverable | Exit proof |
|---:|---|---|
| 0 | Baseline | App boots, schema and seed are understood, working tree reviewed. |
| 1 | Environment + schema | Neon connection, migrations, BigInt currency fields, deterministic seed. |
| 2 | Auth/RBAC/profile mirror | 401/403/KYC matrix passes. |
| 3 | Ledger service | Credit/debit invariants and duplicate reference tests pass. |
| 4 | Funding | Paystack signature/replay tests pass; demo fallback is visibly separate. |
| 5 | Investment engine | Minimum, funds, close-out, rollback, and race tests pass. |
| 6 | Read models | Wallet and portfolio API use persisted data only. |
| 7 | Admin distribution | 60/40 allocation and audit/notification tests pass. |
| 8 | UI wiring | Loading/error/empty/permission states work; no duplicate submits. |
| 9 | Demo proof | Golden E2E twice green; preview deployed. |

## 5. Domain vocabulary

| Term | Meaning in this sprint |
|---|---|
| `kobo` | Integer hundredth of one naira; sole persisted-money unit. |
| `ledger entry` | Immutable posted wallet movement; source of truth. |
| `wallet balance` | Read model equal to signed sum of posted ledger entries. |
| `demo credit` | Admin-only test balance credit; never described as payment/deposit. |
| `verified` | Admin-approved demo state only; not real KYC. |
| `confirmed investment` | Persisted demo fractional holding after successful wallet debit. |
| `funding target` | Maximum offer amount; never exceeded. |
| `distribution` | Test rental-income allocation across confirmed investments. |

## 6. Non-negotiable integrity checks

- A debit fails if it would make available balance negative.
- `availableBalanceKobo == signed sum(POSTED ledger entries)` after every mutation.
- A Paystack reference can post no more than once.
- An investment can post no more than once for its idempotency key.
- Funding never exceeds its target, including concurrent requests.
- A distribution’s allocations sum exactly to its amount.
- Every admin verification, demo credit, investment, and distribution has an `AuditLog` row.
- `POST /api/admin/*` is blocked for non-admins and all money mutations are blocked for anonymous users.

## 7. API and UI conventions

- Validate request bodies with Zod. Return stable error codes, not ad-hoc text.
- API handlers: authenticate → authorize → parse → service → map result/error. Nothing else.
- Services accept explicit actor/input/transaction dependencies where practical; no React/HTTP imports.
- Use `src/lib/db.ts` as the only Prisma client entry point.
- Format money through one helper. API responses serialize BigInt deliberately as strings/display values.
- Use `react-hook-form` + Zod resolver for new mutation forms; ensure disabled/loading submission state.
- Keep Zustand for UI navigation/selected property during the sprint. Do not use it as a source of truth for server data.
- Use the existing component library and design tokens. Do not replicate Platter’s brand assets, copy, or imagery.

## 8. Mobile-first build rules

1. Start every changed investor screen at **360 px** width. Verify at 390 px, 768 px, and 1280 px before marking it done.
2. The primary investor route is one-thumb friendly: property card → detail → invest. Important actions stay within a 44 × 44 px target and no action relies on hover.
3. Use a single-column property/card layout and filter sheet on mobile. Only add multi-column grids or persistent side filters at larger breakpoints.
4. Checkout uses a safe-area-aware sticky bottom action. It must not cover the amount, available balance, risk consent, error, or submit state.
5. Never force horizontal page scrolling. Dense tables become labeled stacked cards or an intentionally scrollable, announced region.
6. Charts never carry essential information alone; show accessible text totals, rate, dates, and status adjacent to every visual.
7. Admin may be desktop-enhanced, but must remain usable on a phone for the small sprint control set (verify, inspect, distribute).

## 9. Test matrix that must exist

| Test | Required cases |
|---|---|
| Authorization | anonymous/pending investor/verified investor/admin across public, wallet, invest and admin endpoints. |
| Ledger | credit; insufficient debit; duplicate reference; rollback; balance invariant. |
| Paystack | valid HMAC; invalid HMAC; successful event; replay event. |
| Investment | below minimum; insufficient wallet; paused/funded offering; happy path; same idempotency key; concurrent close-out. |
| Portfolio | zero-investment user; confirmed holdings; totals/transaction history calculated from data. |
| Distribution | no investors; 60/40 split; rounding; repeat property/period; audit/notifications. |
| Mobile visual | 360/390/768/1280 px: no clipping, no horizontal page scroll, usable filter/checkout/action state. |
| E2E | clean seed, verified investor, test funding fixture, investment, portfolio, admin distribution, final credit. |

## 10. Day-end checklist

At the end of each day, the active implementer must record:

- what golden-path state now works;
- tests and commands run, with result;
- migration/env/provider prerequisites remaining;
- known limitation and explicit decision needed;
- whether scope has changed (it should not without approval).

Day 5 is **bug fixes, E2E, mobile usability pass, demo script, and deployment only**. No feature additions are permitted after the Day 4 exit criteria without removing something of equal size.

## 11. Demo script

1. Open a funding property, explain the risk/disclaimer and funding information.
2. Sign in as a pre-created, verified demo investor.
3. Fund the test wallet through Paystack test mode (or state clearly that the separate demo-credit fallback is being used).
4. Invest an allowed amount from the wallet and show receipt, ledger debit, and increased funding.
5. Reload portfolio; show the persisted holding and transaction history.
6. Switch to admin; show investment visibility and run a test distribution.
7. Return to investor; show distribution credit and notification.
8. State plainly: “This is a test-mode MVP. Live investment, KYC, withdrawals, and regulated launch controls are post-sprint work.”

## 12. Before-preview release checklist

- [ ] `.env.example` present; no secrets or personal data committed.
- [ ] `ignoreBuildErrors` disabled and type/build errors fixed.
- [ ] Database migrations and seed work from a fresh environment.
- [ ] All required tests and golden E2E pass twice.
- [ ] Admin/invest APIs tested against unauthorized callers.
- [ ] Paystack endpoint verifies signature and has a replay test.
- [ ] Every money screen and preview page is labelled sandbox/test mode as appropriate.
- [ ] Risk disclaimer visible before investment confirmation.
- [ ] Investor flow verified at 360 px, 390 px, 768 px, and 1280 px; no horizontal page scrolling.
- [ ] Terms/Risk version and timestamp persisted with every confirmed investment.
- [ ] Vercel preview uses test credentials only.

## 13. Post-sprint handoff order

1. Replace demo verification with a compliant KYC process after legal/privacy review.
2. Secure property and legal documents using access-controlled storage.
3. Add withdrawals/payout controls, reconciliation jobs, and operational approvals.
4. Add durable job processing (Inngest), email/SMS notifications, and observability.
5. Migrate in-memory navigation to shareable App Router routes and improve SEO.
6. Obtain legal/regulatory, security, property-verification, and operational sign-off before live-money use.
