# NEST by Nulo Africa — Five-Day MVP Architecture

**Version:** 2.0 · **Status:** Build baseline · **Date:** 2026-09-14  
**Scope:** Investor-demo MVP only. Read [PRD](PRD.md) before implementation.

## 1. Architecture decisions

| Decision | Sprint choice | Why |
|---|---|---|
| Application shape | Modular monolith in Next.js route handlers. | One deployable, one data boundary, quickest path to auditable behavior. |
| Runtime/UI | Existing Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, Zustand shell. | Preserve working marketplace and avoid a route-rewrite project. |
| Database | Neon Postgres + Prisma migrations. | PostgreSQL transactions and row locks are required for funding and wallet integrity. SQLite is retained only as prototype history. |
| Authentication | Clerk hosted auth; local mirrored user. | Clerk authenticates. After first mirror, NEST Postgres is authoritative for app role and demo verification state. |
| Validation | Zod at every mutation boundary. | Invalid client values never reach services. |
| Money | `BigInt` kobo in database/services; naira strings at API/UI boundary. | Prevent float errors and safely represent the seeded property values. |
| Payments | Paystack test mode, signed webhook, idempotent provider reference. | One payment rail for an evidence-backed demo. |
| Async work | Synchronous, bounded distribution service for sprint; Inngest adapter interface after core works. | Avoid an additional integration on the critical path while retaining an upgrade seam. |
| Media | Existing seeded/owned URLs only. Cloudinary is optional post-core. | Gallery is not a blocker to money correctness. |
| Deployment | Vercel preview + Neon. | A reviewer gets a repeatable deployed preview. |
| Responsive strategy | Mobile-first at 360–430 px; desktop is progressive enhancement. | Most investor interactions need one-handed, low-friction completion. |

## 2. System context

```text
Browser
  ├─ public marketplace / property detail
  ├─ Clerk sign-in and sign-up
  └─ investor/admin views
          │ HTTPS
          ▼
Next.js application (Vercel)
  ├─ route handlers: auth-protected HTTP boundary
  ├─ server services: ledger, investment, distribution, profile mirror
  ├─ Zod request validation and authorization
  └─ Prisma client
          │
          ▼
Neon Postgres
  ├─ property/offering records
  ├─ users and wallets
  ├─ immutable ledger entries and investments
  └─ audit/notification/distribution records

Clerk ── session + metadata ──► auth/profile mirror
Paystack test mode ── signed webhook ──► payment verification + ledger credit
```

No browser client may write the wallet, funding total, verification state, or portfolio total directly. The browser asks a route handler; the handler validates/authenticates and delegates to a server service.

### Authority boundary

Clerk returns an authenticated identity (`clerkId`, verified email). The local `User` row maps that identity to NEST role, verification, account-lock and audit state. Do not copy role/KYC state into Clerk metadata for the sprint: two independently editable copies create a privilege and consistency risk.

## 3. Code boundaries

```text
src/
├─ app/
│  └─ api/
│     ├─ properties/                 # public read-only existing routes
│     ├─ wallet/                     # GET wallet, POST deposit initialize
│     ├─ investments/                # POST/GET own investments
│     ├─ portfolio/                  # GET calculated portfolio
│     ├─ admin/                      # role-protected verification/distribution
│     └─ webhooks/paystack/          # raw payload signature verification
├─ components/nest/                  # views and presentation only
├─ lib/
│  ├─ db.ts                          # only Prisma singleton
│  └─ nest-utils.ts                  # display helpers only
└─ server/
   ├─ auth/                          # session, requireUser, requireAdmin, requireVerified
   ├─ schemas/                       # Zod request/response contracts
   ├─ services/                      # domain transactions; no HTTP/React imports
   │  ├─ ledger.ts
   │  ├─ profile-mirror.ts
   │  ├─ invest.ts
   │  ├─ distribution.ts
   │  └─ portfolio.ts
   └─ integrations/
      ├─ paystack.ts
      └─ clerk.ts
```

**Rule:** route handlers are controllers, not business logic. A handler may parse Zod input, establish actor context, call one service, and map known errors to HTTP. Money rules belong only in services.

## 4. Data model baseline

The prototype has a rich schema. Do not attempt to rebuild every model during the sprint. Migrate the following records first; existing property/developer/document models can remain, provided all currency fields are converted consistently.

### 4.1 Identity and access

| Model | Critical fields | Notes |
|---|---|---|
| `User` | `id`, `clerkId @unique`, `email @unique`, `role`, `kycStatus`, timestamps | Local mirror; `role` and `kycStatus` must agree with the approved source of truth during the demo. |
| `Wallet` | `id`, `userId @unique`, `currency`, `availableBalanceKobo BigInt`, `isLocked` | Balance is a read model updated in the same transaction as ledger posting. |
| `AuditLog` | `actorUserId?`, `action`, `entity`, `entityId?`, `metadataJson`, timestamp | Append-only; records admin and money-sensitive actions. |
| `Notification` | `userId`, `type`, `title`, `message`, `metadataJson`, `readAt?` | Only confirmation/distribution events are required. |

### 4.2 Property and offering

| Model | Critical fields | Notes |
|---|---|---|
| `Property` | identity/location/media/status, `totalValueKobo`, `fundingTargetKobo`, `fundingRaisedKobo`, `minInvestmentKobo`, `riskRating` | Status enum: `DRAFT`, `PUBLISHED`, `FUNDING`, `FUNDED`, `PAUSED`, `ACTIVE`, `COMPLETED`. |
| `InvestmentOpportunity` | `propertyId @unique`, memo, funding dates, `maxInvestmentKobo?`, `maxInvestors?`, `currentInvestors` | Keeps offering-specific content separate from the physical property. |
| `PropertyDocument` / `SPV` / `Valuation` | Existing entities | Seeded demonstration content only unless independently verified. |

### 4.3 Money and ownership

| Model | Critical fields | Integrity purpose |
|---|---|---|
| `LedgerEntry` | `walletId`, `userId`, `direction`, `type`, `amountKobo BigInt`, `status`, `reference @unique`, `providerReference? @unique`, `investmentId?`, `distributionId?`, timestamp | Immutable source of truth for posted wallet movement. |
| `ExternalPayment` | `userId`, `provider`, `reference @unique`, `amountKobo`, `status`, `providerPayloadJson?`, timestamps | Separates provider lifecycle from posted ledger. |
| `Investment` | `userId`, `propertyId`, `amountKobo BigInt`, `status`, `certificateNo @unique`, `confirmedAt`, `idempotencyKey @unique` | A confirmed record represents the investor’s demo fractional holding. |
| `RentalDistribution` | `propertyId`, `period`, `totalAmountKobo`, `status`, `idempotencyKey @unique`, timestamps | One execution per property and period. |
| `DistributionAllocation` | `distributionId`, `investmentId`, `userId`, `amountKobo`, `ledgerEntryId @unique` | Proves exactly how a distribution was allocated; unique `(distributionId, investmentId)`. |

### 4.4 Required constraints and indexes

- `User.clerkId`, `Wallet.userId`, `LedgerEntry.reference`, `ExternalPayment.reference`, and `Investment.idempotencyKey` are unique.
- Index `Investment(userId, status)`, `Investment(propertyId, status)`, `LedgerEntry(walletId, createdAt)`, and `Property(status, city)`.
- Use enums in Prisma for role/status/type values; no free-form role or transaction-type strings.
- `amountKobo > 0` is validated at the service boundary. Add DB checks where migration tooling permits.
- Serialise `BigInt` explicitly at API boundaries: return decimal strings or formatted display fields; never call `JSON.stringify` on raw Prisma records containing bigint values.

### 4.5 Migration approach

This is a demo data reset, not a production migration. Do **not** attempt to transform the existing SQLite seed in place while implementing money behavior.

1. Create a fresh Postgres Prisma schema/migration with the required kobo and ledger records.
2. Re-seed only the minimum properties, one admin, two investors (verified/pending), wallets, and one near-close funding fixture.
3. Treat the original SQLite database as read-only prototype reference.
4. Add importer/data-migration tooling only after the demo. It is not a five-day deliverable.

## 5. Money and state invariants

1. **Kobo only:** no float or `number` arithmetic for persisted money.
2. **Ledger first:** every wallet credit/debit has one `POSTED` `LedgerEntry` with a unique reference.
3. **No destructive edits:** posted ledger entries, confirmed investments, and audit logs are never updated/deleted by product code.
4. **Atomicity:** wallet balance read model, ledger entry, investment, funding raised, notification, and audit log commit or roll back together.
5. **Provider truth:** webhook credit amount comes from verified Paystack payload, never request body/URL.
6. **Idempotency:** replays return a safe result and make no second financial change.
7. **Conservation:** `wallet.availableBalanceKobo` equals signed sum of posted ledger entries; each distribution allocation total equals its distribution total.
8. **Authorization:** identity, KYC and role checks occur before every mutation; front-end controls are convenience only.

## 6. Critical flows

### 6.1 Funding

```text
POST /api/wallet/deposits { amountNaira }
  → require session
  → validate positive amount
  → create ExternalPayment(PENDING, DEP-uuid)
  → Paystack initialize with reference
  → return authorization URL

Paystack charge.success webhook
  → verify raw-body HMAC SHA-512
  → find ExternalPayment by reference
  → if already SUCCESS/posted: return 200 no-op
  → transaction: mark payment SUCCESS; credit ledger; update wallet; notify/audit
```

### 6.2 Investment

```text
POST /api/investments { propertyId, amountNaira, idempotencyKey }
  → require session + verified investor
  → Zod validation
  → SERIALIZABLE database transaction
      lock/update funding row only when remaining ≥ requested amount
      check wallet funds
      debit wallet + post ledger entry
      create CONFIRMED investment and demo certificate number
      update funding/current investor count
      create notification and audit record
  → return investment receipt and refreshed funding summary
```

For the close-out guard, use one parameterized conditional SQL update inside the transaction (or an equivalent row lock): update `fundingRaisedKobo` only where `fundingRaisedKobo + requestedAmountKobo <= fundingTargetKobo`. A read-then-write check outside a lock is not acceptable.

### 6.3 Distribution

```text
POST /api/admin/distributions { propertyId, period, totalAmountNaira, idempotencyKey }
  → require admin
  → transaction: reject duplicate property/period; load confirmed investments
  → calculate each allocation from confirmed amounts
  → deterministically assign rounding remainder
  → create distribution + allocations + credit ledger rows + notifications + audit log
  → return allocations and exact total
```

The sprint implementation limits seeded distributions to a bounded small set of investors. The domain service must not depend on a UI and can be moved behind Inngest batching after the sprint.

## 7. Mobile-first UI architecture

- Build components from a 360 px viewport upward. Do not add desktop markup and then use CSS to hide broken mobile controls.
- Keep data mutations in route handlers/services; the mobile UI owns only form state, rendering state and navigation state.
- On property detail and checkout, use a safe-area-aware sticky bottom action region. It must show disabled/loading/error states and retain access to risk consent.
- Use a sheet/drawer for mobile filtering and a single-column card list. At `md` and above, progressively introduce multi-column grids and persistent filters.
- Return compact API view models for cards and mobile portfolio summaries; do not send large document/media payloads to list views.
- An accessible text summary is mandatory for funding progress, return projections and charts.

## 8. HTTP contract

| Endpoint | Actor | Request | Success | Failure |
|---|---|---|---|---|
| `GET /api/properties` | public | filters/page | paginated cards | 400 bad filter |
| `GET /api/properties/[slug]` | public | — | detail | 404 |
| `GET /api/wallet` | session | — | balance + ledger page | 401 |
| `POST /api/wallet/deposits` | session | `amountNaira` | provider URL/reference | 401/422/502 |
| `POST /api/webhooks/paystack` | provider | raw signed body | `200 { received: true }` | 401 invalid signature |
| `POST /api/investments` | verified investor | property, amount, `Idempotency-Key` header, terms/risk version | 201 receipt or original receipt on retry | 401/403/409/422 |
| `GET /api/portfolio` | session | — | calculated holdings/totals | 401 |
| `GET /api/admin/users` | admin | pending filter | user list | 401/403 |
| `POST /api/admin/users/:id/verify` | admin | — | verified user | 401/403/404 |
| `POST /api/admin/distributions` | admin | property, period, amount, key | 201 allocations | 401/403/409/422 |

Use stable JSON errors: `{ "error": { "code": "INSUFFICIENT_FUNDS", "message": "..." } }`. The UI maps codes to friendly copy; it does not parse prose.

## 9. Security and operational baseline

- Secrets exist only in Vercel/`.env.local`; commit `.env.example` with names only.
- Verify Paystack against the raw request body before parsing/acting on it.
- Apply appropriate rate limiting to funding, investment, login-adjacent, and webhook routes before public preview sharing.
- Do not log raw webhook payloads containing personal/payment details; store only minimum provider metadata needed for debugging.
- Set `ignoreBuildErrors: false` before preview deployment and fix resulting errors.
- Use preview/demo environment variables and clearly distinct test Paystack keys. Production keys are out of scope.
- Retain an audit record for admin verification, demo credits, investments and distributions.
- Record Terms/Risk version and accepted timestamp at confirmation; do not record a checkbox only in browser state.
- Use request IDs and structured server logs for each money mutation. Redact contact, payment and provider payload data.

## 10. Testing strategy

| Layer | Required proof |
|---|---|
| Unit (Vitest) | kobo conversion, ledger debit/credit, signature verification, investment validation, distribution rounding. |
| Service/integration | transaction rollback, duplicate provider reference, verified/KYC/admin matrix, close-out race, portfolio totals. |
| E2E | seed → authenticated verified demo investor → funding confirmation fixture → investment → portfolio → admin distribution → investor credit. |
| Manual | Responsive pass at 360/390/768/1280 px, one-handed checkout, empty/error states, Paystack test checkout if keys are ready, risk labels on every money screen. |

## 11. Environment contract

```dotenv
DATABASE_URL=
DIRECT_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
NEXT_PUBLIC_APP_URL=
DEMO_MODE=true
```

`DEMO_MODE=true` is required for the five-day preview. Any route enabling a demo credit must additionally require an admin and reject execution when `DEMO_MODE` is false.
