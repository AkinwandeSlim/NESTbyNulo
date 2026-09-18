# NEST by Nulo Africa — Agent Development Contract

> **Canonical instructions:** read [`AGENTS.md`](AGENTS.md). This singular file is retained for tools that discover `AGENT.md`; it intentionally points to the canonical file so agent rules do not diverge.

This file is the mandatory operating guide for any agent or developer working on NEST. It applies to Codex, Claude Code, Antigravity, and human contributors.

## 1. Read this first

Before changing code, read these documents in order:

1. [`doc2/ARCHITECTURE_ESSENTIALS.md`](doc2/ARCHITECTURE_ESSENTIALS.md) — non-negotiable rules and delivery order.
2. [`doc2/PRD.md`](doc2/PRD.md) — product scope and acceptance criteria.
3. [`doc2/ARCHITECTURE.md`](doc2/ARCHITECTURE.md) — data model, API, security, and technical decisions.

If documents conflict:

- `AGENT.md` and `ARCHITECTURE_ESSENTIALS.md` control safety, data integrity, and working rules.
- `PRD.md` controls what is in or out of the five-day sprint.
- `ARCHITECTURE.md` controls technical design and API/data contracts.
- Ask the project owner before making a decision that changes money movement, provider choice, compliance posture, or user workflow.

## 2. Product boundary

NEST is a **test-mode fractional-property investor demo** for a five-day MVP sprint.

The required golden path is:

```text
Verified demo investor
  → test wallet funding or labelled demo credit
  → wallet investment in a funding property
  → confirmed portfolio holding and transaction history
Admin
  → verification and one pro-rata demo distribution
  → investor wallet credit and notification
```

This is not a live investment platform. Never implement or claim:

- live money collection, withdrawals, payouts, or saved payment instruments;
- real KYC, BVN/NIN, bank-account, identity-document, or biometric collection;
- regulated offering approval, legal execution, verified property title, or guaranteed returns;
- production credentials or real personal/payment data in local files, tests, seed data, logs, or screenshots.

## 3. Scope discipline

### Build in this sprint

- Existing public marketplace and property detail experience.
- Clerk authentication and a local user/wallet mirror.
- Database-backed role and demo verification gate.
- Postgres/Prisma schema baseline with integer-kobo money fields.
- Immutable wallet ledger, test funding, wallet-led investment, real portfolio.
- Minimal admin verification and pro-rata distribution.
- API/service tests, golden-path E2E, mobile-first responsive pass, sandbox/risk labels.

### Do not build in this sprint

- App Router redesign, mobile app, secondary market, referrals, Academy, email/SMS, PDF certificates, full CMS, developer onboarding, document uploads, or full analytics.
- Inngest, Cloudinary, and Resend integration before the core ledger/investment path is proven.
- Any broad dependency upgrade, component-library rewrite, or unrelated refactor.

If behind schedule, cut in this order:

1. Paystack test-mode integration; retain the clearly separate admin demo-credit fallback.
2. Distribution UI polish; retain the tested service/API.
3. Animation, chart, and visual polish.

Never cut authentication/authorization, ledger integrity, investment atomicity, mobile checkout usability, or the golden-path test.

## 4. Required technology choices

| Concern | Required choice |
|---|---|
| Framework/UI | Existing Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui. |
| Client state | Zustand only for UI/navigation state; never as server-data truth. |
| Forms | react-hook-form with Zod validation for new mutation forms. |
| Database | Neon Postgres and Prisma migrations for the MVP. Existing SQLite is prototype reference only. |
| Auth | Clerk for identity/session. NEST Postgres is the source of truth for app role, demo verification, wallet, and investment state. |
| Money | `BigInt` kobo in persistence and services; format NGN only at API/UI boundaries. |
| Payments | Paystack test mode only, signature-verified webhook. |
| Tests | Vitest for unit/service/API tests; one scripted golden-path E2E. |
| Deploy | Vercel preview with test/demo environment variables only. |

Do not introduce another auth provider, payment provider, database, state library, or queue without explicit owner approval.

## 5. Repository boundaries

```text
src/app/api/              Route handlers: parse, authorize, call service, return JSON.
src/components/nest/      Product UI and view composition only.
src/components/ui/        Stock shadcn primitives; avoid unrelated edits.
src/lib/db.ts             The single Prisma client entry point.
src/lib/nest-utils.ts     Display/format helpers.
src/server/auth/          Session and authorization helpers.
src/server/schemas/       Zod contracts.
src/server/services/      Ledger, investment, distribution, portfolio, profile mirror.
src/server/integrations/  Clerk and Paystack adapters.
prisma/                   Schema, migrations, deterministic demo seed.
tests/                    Unit, service/integration, and E2E tests.
doc2/                     Build specification; update only when an approved decision changes.
```

Route handlers must stay thin. React components must not contain ledger, authorization, webhook, or funding logic. All business rules belong in `src/server/services/`.

## 6. Financial integrity rules

1. Persist money only as integer **kobo** (`BigInt`). Never persist money as a float or use floating-point calculations for a transaction.
2. Every wallet credit/debit must create one immutable posted ledger entry with a unique reference.
3. No route handler or component updates `Wallet` directly. Only the ledger service can change balance inside a database transaction.
4. A debit that would make a balance negative fails without side effects.
5. Wallet read balance must equal the signed sum of posted ledger entries.
6. Payment credits use the verified provider amount, never the browser request amount.
7. Webhooks and retryable mutations must be idempotent. Replaying a reference/key returns a safe existing result, never a second credit/debit.
8. Investment confirmation, ledger debit, funding update, notification, and audit record commit or roll back together.
9. Funding can never exceed the target. Use a PostgreSQL transactional/conditional update or row lock; a read-then-write check is insufficient.
10. Distribution allocations must sum exactly to the requested total; resolve rounding deterministically.
11. Record the Terms/Risk version and acceptance timestamp with the final investment confirmation.
12. Every admin verification, demo credit, investment, and distribution action creates an append-only audit record.

## 7. Authorization and data rules

- Clerk proves identity. The local `User` row controls NEST `role`, verification, account lock, and audit state after the initial mirror.
- Protect every mutation server-side. Client-side hiding or disabled buttons are not security.
- Expected responses: anonymous `401`; authenticated but disallowed `403`; invalid business state `409` or `422`.
- A `pending`, `rejected`, locked, or inactive investor cannot fund or invest.
- Do not log raw payment payloads, access tokens, personal data, provider secrets, or user-provided sensitive data.
- Store only the minimum provider metadata needed for a test-mode audit/retry.
- External payment events with unknown references, invalid HMAC, failed status, wrong currency, or wrong amount must not credit a wallet.

## 8. Mobile-first experience rules

Design and test investor screens at **360 px first**, then 390 px, 768 px, and 1280 px. Desktop is progressive enhancement.

- Use a single-column property list and a filter drawer/sheet on mobile.
- All key tap targets are at least 44 × 44 px. No hover-only action is required.
- Property detail and checkout use one clear primary action. A sticky bottom action is allowed only if it respects safe-area insets and cannot obscure consent, errors, amount, or balance.
- Never require horizontal page scrolling. Dense tables become summary cards or intentionally scrollable labelled regions.
- Funding progress, return projection, balances, and charts require a visible text alternative.
- Keep amount, minimum, remaining funding, risk consent, and submit state readable without zooming.
- Admin screens may become desktop-enhanced but must remain usable on a phone for verify, inspect, and distribute actions.

## 9. Required build sequence

1. Inspect existing implementation and working tree; preserve user changes.
2. Establish environment, Postgres schema/migration, and deterministic seed.
3. Implement Clerk/local profile mirror, RBAC, and verification tests.
4. Implement and test ledger service before payment UI.
5. Implement Paystack test webhook or labelled admin demo-credit fallback.
6. Implement and test atomic investment service, including close-out race.
7. Replace mock wallet/portfolio reads with calculated database read models.
8. Implement admin verification and distribution service/API.
9. Wire UI only after the corresponding service/API tests pass.
10. Run golden E2E twice from a clean seed; complete mobile pass and preview deployment.

One agent works on one bounded specification at a time. State the intended files, API contract, and tests before starting. Do not start a dependent feature while its prerequisite is failing.

## 10. Mandatory test coverage

- Authorization matrix: anonymous, pending investor, verified investor, admin across public, wallet, invest, and admin routes.
- Ledger: credit, insufficient debit, duplicate reference, rollback, balance invariant.
- Payment: valid signature, invalid signature, successful test event, duplicate/replayed event.
- Investment: below minimum, insufficient funds, offering unavailable, idempotency retry, happy path, and concurrent close-out.
- Portfolio: no investments, confirmed holdings, calculated totals/history, missing valuation state.
- Distribution: no eligible investor, 60/40 allocation, rounding, duplicate property/period, audit/notification results.
- Mobile visual pass: 360/390/768/1280 px; no clipping or unintended horizontal page scrolling.
- Golden E2E: clean seed → verified investor → funding fixture → investment → portfolio → admin distribution → final wallet credit.

## 11. Working practices

- Read before editing. Inspect the relevant component, route, service, schema, and tests.
- Treat all uncommitted edits as user-owned. Do not reset, delete, overwrite, or reformat unrelated files.
- Keep diffs narrow. Do not add dependencies or alter package scripts without a direct, documented need.
- Use Zod for API input. Use stable API error codes; UI maps codes to friendly copy.
- Make BigInt serialization intentional; raw Prisma records with bigint values cannot be JSON-stringified.
- Use UTC for funding-window and distribution cut-off decisions; display localized values in the UI.
- A notification failure may be logged/retried after a completed money transaction; a ledger or funding failure must roll back the entire transaction.
- When data is unavailable or stale, show an explicit unavailable/date-stamped state. Never fabricate a return, valuation, document, or balance.
- Do not copy Platter branding, images, text, or source code. Use it only as product-flow research.

## 12. Completion and handoff format

At the end of each task, report:

1. Outcome achieved.
2. Files changed.
3. Tests/commands run and results.
4. Important decisions or assumptions made.
5. Known gaps, blockers, or user decision required.
6. The next safe task in the documented sequence.

Before preview release, confirm all items in `doc2/ARCHITECTURE_ESSENTIALS.md` §12 are complete. State plainly that the result is a **test-mode MVP**, not a production investment platform.
