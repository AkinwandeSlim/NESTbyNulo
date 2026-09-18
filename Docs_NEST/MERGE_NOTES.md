# dev_gstack Backend → NEST Prototype: Merge Notes

**What this is:** the battle-tested backend from `dev_gstack/` (auth, admin
verification, immutable ledger, atomic investments, idempotency) merged into the
NEST prototype, keeping this project's UI.

**Direction:** dev_gstack backend INTO this app (never the reverse). This app is
what runs on `:3000` and what judges see; its 9 view components are 5–10× richer
than dev_gstack's 2 pages.

---

## 1. What runs where

| | Port | Role |
|---|---|---|
| **This app** (merged) | 3000 | UI + real backend. `npm run dev` |
| `dev_gstack/` (untouched child) | 3100 | Original backend app, kept for reference |

`dev_gstack/` lives *inside* this folder, which is why `tsconfig.json` now
excludes it (plus `dev_antigravity/`, `examples/`, …). Before that, a plain
`npx tsc --noEmit` at the root compiled the child projects and reported dozens of
irrelevant errors.

## 2. Demo accounts (seeded)

| Email | Password | Role / status |
|---|---|---|
| `admin@nestnulo.com` | `Admin@12345` | ADMIN / VERIFIED |
| `chioma.adewale@gmail.com` | `Investor@12345` | INVESTOR / VERIFIED — wallet **₦34,550,000**, 4 investments |
| `tunde.bakare@example.com` | `Investor@12345` | INVESTOR / **PENDING** — for the verification demo |

`ADMIN_EMAILS=admin@nestnulo.com` in `.env` promotes that address to ADMIN on
first authenticated request, so the admin path survives a DB wipe.

## 3. Demo flow (≈3 minutes)

1. `/` — browse properties (real DB via `/api/properties`).
2. `/sign-up` — register → account created **PENDING** with a zeroed wallet.
3. `/account` — shows *"Account under verification"*; `/api/investments` answers
   **403 ACCOUNT_PENDING**.
4. Sign in as the admin → `/admin/crm` (server-gated) → **Verify** the new
   investor → **Demo Credit** (labelled DEMO CREDIT, ledger-backed).
5. Back as the investor → property → **Invest** (checkout POSTs the real atomic
   API; 6 mandatory consents gate the button).
6. `/wallet` + `/portfolio` — balance is `SUM(credits) − SUM(debits)` from the
   append-only ledger; the investment appears immediately.
7. Persistence proof: click Confirm again with the same key → the original result
   replays, **no second debit**.

## 4. Files ported (verbatim, then adapted)

Copied unchanged from `dev_gstack/src/lib`: `session.ts`, `password.ts`,
`format.ts`, `audit-error.ts`, `ledger.ts`, `idempotency.ts`, `admin.ts`,
`admin-http.ts`, `auth.ts`.

Routes ported: `api/auth/{register,login,logout,me}`, `api/investments`,
`api/admin/{stats,users,users/[id]/{verify,reject,unverify,credit}}`.

Scripts ported to `scripts/`: `e2e-auth.ps1`, `e2e-admin.ps1`,
`e2e-investments.ps1`, `make-admin.mts`, `set-kyc.mts`.

**Not ported (deliberate):** the Clerk webhook route, `proxy.ts` middleware, and
the Clerk UI. `@clerk/nextjs` is not a dependency here and `.env` has no Clerk
keys, so signed sessions are issued by the HMAC dev-fallback cookie only —
see the MERGE NOTE in `src/lib/auth.ts` (`isClerkEnabled()` is pinned false;
`upsertClerkUser()` is kept intact for a later webhook).

## 5. Adaptations (the real work)

| Area | What changed | Why |
|---|---|---|
| Prisma client alias | New `src/lib/prisma.ts` re-exports `db` as `prisma` | Ported code imports `@/lib/prisma`; this keeps ~12 files byte-faithful instead of rewriting imports. One client instance, not two. |
| `tsconfig.json` | `include` → `src/**`; excludes child projects | Root `tsc`/build no longer compiles `dev_gstack/`, `dev_antigravity/`, `examples/`. |
| `src/lib/db.ts` | `log: ['query']` → `['warn','error']` | Query logging made the merged console unusable. |
| Schema | Added `User.authSource/clerkId/passwordHash/status/verifiedAt/verifiedBy/rejectionReason/rejectedAt/rejectedBy`; `Wallet.balanceKobo`; `Transaction` rebuilt as the append-only ledger (`type/amountKobo/category/description/refType/refId/balanceKobo`); `Investment.amountKobo/ownershipPct/idempotencyKey` (+ `investedAt` NOT NULL); `Property.valuationKobo/targetKobo/fundedKobo/minInvestmentKobo` | Legacy Float columns were kept where the existing UI reads them, so the UI keeps working while money moves through BigInt kobo. |
| Property status | Route normalizes: **ACTIVE / FUNDING / PUBLISHED** (any case) = open; close-out writes lowercase `funded`/`active` | dev_gstack spoke uppercase; this app's `getStatusColor()` renders lowercase. Normalizing avoided forcing one vocabulary on the other. |
| `register` route | Sets `role: "INVESTOR"` explicitly | This project's `User.role` defaults to lowercase `investor`, which the authorization layer (uppercase compare) would have locked out. |
| `investments` GET | Selects `city`/`state`/`rentalYield` | dev_gstack's Property had `location`/`expectedReturn`, which don't exist here. |
| `investments` 403 body | Adds `message: "Account under verification."` | Machine-readable code plus a human sentence the UI can show. |
| `api/auth/me` | Returns `mode` in the 200 **and** 401 bodies | The merged landing page is a client-rendered SPA, so the E2E suites' landing-page mode scrape could not work; they now read the API. The UI uses it too. |
| E2E suites | Default `-BaseUrl` → `localhost:3000`; investments DB probe picks the open property with the most headroom; mode detection via `/api/auth/me` | Retargeted at the merged app; the probe no longer filters `status: "ACTIVE"` only. |
| `prisma/seed.ts` | Roles/status/passwordHash, kobo mirroring, wallet history rewritten as a **real ledger** (1 DEMO_CREDIT, 4 INVESTMENT debits, 2 DISTRIBUTION credits), plus a PENDING investor for the demo | The old seed wrote `Transaction.reference/status/amount`, which no longer exist, and created a ₦2.5M balance out of nowhere. |
| Imports in `seed.ts` | `../src/lib/db.ts` (explicit `.ts`) | Node 24 ESM type-stripping needs the extension; `npm run seed` runs with plain `node`. |

## 6. New UI added (to make the backend reachable)

Real routes, gated server-side where it matters:

- `/sign-in`, `/sign-up` — `src/components/nest/DevAuthForm.tsx` (restyled to this
  app's design tokens; posts to the real auth API).
- `/account` — verification status, ledger-derived balance, profile, sign out.
- `/admin`, `/admin/{crm,support,analytics,finance,opportunities,properties}` —
  `adminPageGate()` runs on every request: anonymous → 307 `/sign-in`,
  signed-in non-admin → 403 card ("Admin access required"), admin → dashboard
  (the existing `AdminDashboard`, deep-linkable per section).

Wired to real data (mock data removed):

- `InvestorHeader` — TEST MODE label, session state, Sign in / Create account,
  sign out (was hard-coded "Adebayo Ogunlesi").
- `InvestmentCheckout` — POSTs `/api/investments` with an `Idempotency-Key`,
  **6 mandatory consents** gate Confirm; the receipt shows the real investment id,
  ownership %, property funding % and post-debit ledger balance; server errors
  (ACCOUNT_PENDING / ACCOUNT_REJECTED / INSUFFICIENT_FUNDS /
  IDEMPOTENCY_CONFLICT) surface with their machine code. Retries reuse the same
  key; changing the amount mints a new one (a reused key with a new payload is a
  409 by design).
- `WalletView` — `/api/wallet`: balance, credited/debited totals, ledger entries,
  verification badge (was ₦3,250,000 + 12 invented transactions).
- `PortfolioView` — `/api/portfolio` now derives everything from investments +
  ledger (shape unchanged, so the component needed no rewrite).

## 7. Honesty notes (deliberate, not gaps to hide)

- **TEST MODE / demo funds only** labels on the header, wallet, checkout receipt
  and account page. No live payment is processed.
- **Platform fee shows ₦0**: the ported ledger debits exactly the invested
  amount, so displaying a 2% fee would contradict the ledger. A fee model is
  post-demo work.
- **Capital appreciation and pending returns are 0** with a `valuationNote`,
  rather than invented (there is no valuation model or distribution scheduler).
  Rental income and every balance are exact ledger sums.
- Clerk is not wired (no keys, no SDK). `isClerkEnabled()` is pinned false on
  purpose instead of silently 403-ing sign-in if keys were ever added.

## 8. Commands

```powershell
npm run dev              # :3000
npm run seed             # wipe + reseed demo data (stop the server first)
npx prisma db push       # apply schema changes
npm run make-admin -- you@demo.nest.com

npm run test:e2e:auth      # 25 checks
npm run test:e2e:admin     # 53 checks
npm run test:e2e:invest    # 26 checks
npm run test:e2e           # all three
```

The E2E suites need a running dev server (they drive real HTTP and read-only DB
probes). They register their own throwaway users, so they are safe to re-run.

## 9. Verified state

- **104/104 E2E checks pass** against the merged app: auth 25, admin 53,
  investments 26.
- `npx tsc --noEmit` reports **zero errors in merged files**. Three pre-existing
  errors remain in untouched UI (`BrowseView` framer-motion `ease` typing,
  `AcademyView` content level, one unused `@ts-expect-error` in
  `api/properties`).
- Ledger invariant holds on seeded data: credited ₦50,300,000 − debited
  ₦15,750,000 = balance ₦34,550,000 = `Wallet.balanceKobo` cache.

## 10. Still open (post-demo)

- Rebuild `AdminDashboard`'s CRM views on `/api/admin/users` + `/api/admin/stats`
  (it still reads `/api/dashboard`), so verify/reject/credit are clickable in the
  UI, not only via the API.
- `PropertyDetailView`: the TEST MODE banner is global; per-page
  "PROJECTION ONLY — NOT GUARANTEED" labels on yield/IRR figures are still to add.
- Platform fee + valuation models (see §7).
- Distribution scheduler (Feature #7) — not built in either codebase.

