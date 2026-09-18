# NEST by Nulo Africa — Five-Day Investor-Demo MVP PRD

**Version:** 2.0 · **Status:** Build baseline · **Date:** 2026-09-14  
**Audience:** Nulo Africa founders, ACE Startup Academy reviewers, product/design/build agents  
**Companion documents:** [Architecture](ARCHITECTURE.md) · [Architecture essentials](ARCHITECTURE_ESSENTIALS.md)

## 1. Product decision

NEST is a Nigerian fractional-property investment experience. It helps a prospective investor discover a curated property, understand its economics and risk, create an account, fund a test wallet, purchase a fractional holding, and see that holding in a portfolio.

The five-day deliverable is an **investor-demo MVP**, not a public financial product. It demonstrates a real, database-backed transaction flow using Paystack **test mode** (or an explicitly labelled admin demo-credit fallback). It must never accept live money, promise returns, claim regulatory approval, or present test data as a live investment opportunity.

### Product promise for the demo

> “NEST makes the path from discovering a credible Nigerian property opportunity to owning a transparent fractional position understandable and traceable.”

### What Platter research changes

The public Platter experience validated several useful interaction patterns, adapted here without copying its branding, text, media, or source:

- a public marketplace before sign-up;
- property cards with minimum entry amount, status, location, and funding signal;
- a long-form property detail page that explains the opportunity before the purchase prompt;
- a transparent cost/return calculator; and
- an account-completion sequence separating profile, withdrawal account, and wallet/KYC status.

NEST retains its own Graphite Orange visual language and will use its own property content and assets.

## 2. Outcome and definition of done

### Sprint objective

On a deployed preview, a reviewer can complete this golden path with seeded demo accounts and data:

```text
Browse a live offering
  → inspect economics, documents and risk disclaimer
  → sign in / sign up
  → receive admin-approved demo verification
  → fund wallet in Paystack test mode (or labelled demo credit)
  → invest from wallet
  → see an immutable transaction and updated funding progress
  → see the confirmed holding in portfolio
  → admin records a demo rental distribution
  → investor sees a proportional wallet credit and notification
```

### Minimum evidence required at demo time

1. A new unauthenticated visitor cannot make an investment.
2. An unverified investor is blocked from the investment API, not only the UI.
3. A confirmed investment debits the wallet once, creates one holding, increases funding once, and is visible after a reload.
4. A duplicate payment webhook/reference cannot credit the wallet twice.
5. An offering cannot be funded beyond its target under concurrent requests.
6. Admin-only actions return `403` for an investor.
7. The golden-path test passes twice consecutively against a clean seed.

## 3. Users and jobs to be done

| User | Job | MVP need |
|---|---|---|
| Prospective investor | Decide whether a property opportunity is understandable and credible. | Browse, filter, read property and risk information without logging in. |
| Verified demo investor | Buy a fractional holding and track it. | Wallet funding, investment confirmation, portfolio, transaction history. |
| Unverified investor | Understand what prevents an investment. | Clear verification state and a non-bypassable server rejection. |
| Platform operator | Safely run the demo and explain operational control. | Verify demo users, inspect investments, issue one distribution, audit actions. |
| Academy reviewer | Assess product focus and technical credibility. | A coherent story, real persisted state, explicit test-mode safeguards, deployed preview. |

### MVP user stories

| ID | User story | Acceptance summary |
|---|---|---|
| US-01 | As a visitor, I want to browse funding properties without creating an account, so I can judge whether NEST is credible. | Public cards/detail show DB-backed property facts, status, funding and risk. |
| US-02 | As a pending investor, I want to understand why I cannot invest yet, so I know the next step. | Investment API rejects pending status; UI gives a clear non-bypassable verification explanation. |
| US-03 | As a verified demo investor, I want to fund a test wallet safely, so I can make a demo investment. | One valid reference posts one credit; visible demo credit is never represented as payment. |
| US-04 | As a verified investor, I want to invest a valid amount from my wallet, so I can receive a fractional holding. | Consent, wallet debit, holding, funding update, receipt, audit and notification succeed atomically. |
| US-05 | As an investor, I want to see holdings and transactions after reload, so I can trust the result persisted. | Portfolio/wallet derive from confirmed investments and posted ledger entries, including empty states. |
| US-06 | As an admin, I want to verify a demo user and distribute test rent proportionally, so I can demonstrate operating control. | Admin-only action is audited; distribution totals and allocations balance exactly. |

## 4. Scope boundary

### In scope — P0

| Capability | User-visible result | Notes |
|---|---|---|
| Public marketplace | Filterable cards and property detail pages. | Reuse the existing DB-backed marketplace. |
| Trust-first property detail | Gallery, property facts, funding status, economics, documents/links, risk disclaimer. | Documents may be seeded links in this sprint; do not claim legal verification. |
| Authentication and roles | Sign in/up, investor/admin roles, local user/wallet mirror. | Clerk hosted screens; server-side authorization. |
| KYC-lite | `pending` or `verified` investor state. | Admin-controlled demo state only; no BVN/NIN collection. |
| Test wallet funding | Paystack test checkout followed by signed webhook credit. | A labelled admin demo-credit is the non-blocking sprint fallback. Paystack must not delay the investment engine. |
| Wallet-led investment | Minimum/remaining-funding validation, atomic wallet debit, confirmed holding and certificate reference. | No direct-pay checkout in sprint. |
| Portfolio and history | Persisted holdings, wallet balance and ledger history. | No hardcoded money metrics. |
| Minimal admin controls | Verify user, view investments, run one distribution. | Every command is audit logged. |
| Demo safety/legal | Risk-disclaimer page and clear sandbox labels. | Required before preview sharing. |

### Explicitly out of scope

- Live money, withdrawals, bank-account collection, payout rails, or payment cards stored by NEST.
- Real KYC, BVN/NIN collection, liveness checks, identity-document upload, or wallet activation.
- Legal execution, actual SPV formation, title validation, regulated fundraising, or claims of SEC approval.
- Secondary trading, investor-to-investor transfers, referrals, Academy buildout, email/SMS, CSV export, PDF certificates, mobile apps, multi-country support, and property/developer CRUD.
- A new App Router information architecture. The existing Zustand view shell remains for this sprint; a URL-routing migration is post-sprint work.

## 5. Information architecture and screens

### Public

| Surface | Required content | Primary action |
|---|---|---|
| Browse | Search/filter controls; property card grid; status, city, risk and progress. | Open property. |
| Property detail | Gallery; facts; financial snapshot; funding progress; developer/SPV metadata; documents; risk explanation. | Sign in to invest / Invest. |
| Risk disclaimer | Test/sandbox notice and investment-risk disclosure. | Return to marketplace. |
| Auth | Clerk sign-in and sign-up. | Continue to the intended view. |

### Authenticated investor

| Surface | Required content | Primary action |
|---|---|---|
| Verification status | `Pending` or `Verified` state and why investment may be unavailable. | Request demo approval only through operator workflow. |
| Wallet | Available balance, `Fund test wallet`, transaction list, clear test-mode label. | Start Paystack test funding. |
| Investment checkout | Property summary, amount field, min/remaining validation, balance, risk consent. | Confirm wallet investment. |
| Portfolio | Total invested, holdings, status, most recent valuation (if seeded), dividends and empty state. | Open holding/property. |
| Notifications | Investment confirmation and distribution events. | Mark read (optional). |

### Admin

| Surface | Required control |
|---|---|
| Pending users | Mark a demo user verified; write audit record. |
| Investments | Inspect confirmed holding records and funding status. |
| Distribution runner | Choose a funded/active seeded property, period and amount; calculate and post a pro-rata demo distribution exactly once. |

## 6. Functional requirements

### FR-01 — Marketplace and property due diligence

- Only properties with `published` or `funding` status are public.
- Cards display title, city, property type, minimum investment, risk label, funding progress, and cover media.
- Detail pages display values from the database only. A property whose data is absent displays an intentional unavailable state; it never substitutes a fabricated value.
- Investment CTA is public but transitions unauthenticated users to sign-in and returns them to the selected property.

**Acceptance:** a reviewer can find a seeded funding property, open it from a card, and see data consistent with its funding record.

### FR-02 — Account, authorization and verification state

- Clerk owns credentials. NEST does not store passwords.
- First authenticated request creates or updates a local `User` and exactly one `Wallet`.
- Roles: `investor`, `admin`. KYC status: `pending`, `verified`, `rejected`.
- `POST /api/investments`, wallet endpoints and portfolio require a session. Admin endpoints require `admin` server-side.
- An investor must be `verified` to invest. The operator changes only seeded/demo verification through the admin flow.

**Acceptance:** auth/role/KYC tests cover anonymous, pending investor, verified investor, and admin cases.

### FR-03 — Wallet funding and ledger

- All monetary values are stored in integer **kobo**; formatted naira is a display-only conversion.
- Paystack initialization creates a pending external-payment record/reference. The browser never supplies the final credited amount.
- A valid `charge.success` webhook verifies its HMAC signature and credits the wallet from the provider payload once.
- If Paystack test-mode setup is blocked, an admin-only endpoint may post a `demo_credit`; its UI must say **Demo credit — not a payment**.
- Every posted change creates an immutable ledger entry with a unique reference.

**Acceptance:** a replayed webhook/reference returns safely without changing the balance; attempted over-debit has no partial writes.

### FR-04 — Wallet investment

- Input is `{ propertyId, amountNaira }`; the server converts/validates to kobo.
- The server checks session, verified status, property status, minimum ticket, wallet funds, and remaining funding inside the same database transaction.
- A successful request atomically posts an investment debit, creates a `confirmed` investment, increments funding, updates investor aggregates/read models, creates notification/audit records, and produces a non-legal demo certificate number.
- When target is met exactly, property status moves to `funded`. Any request exceeding remaining funding fails with no debit.
- The client disables duplicate submit and renders the server result, but server idempotency/transaction checks are authoritative.

**Acceptance:** a concurrent close-out test leaves funding equal to target, one successful final investment, and no negative wallet.

### FR-05 — Portfolio and distribution

- Portfolio totals derive from confirmed investments and latest seeded valuations; no mock totals remain.
- Wallet history derives from posted ledger entries, ordered newest first.
- Admin may create one uniquely identified distribution per property/period. Allocation uses each investor’s confirmed investment amount divided by all confirmed investment amounts for that property.
- Rounding remainder is assigned deterministically to the largest fractional remainder; all allocations must sum to the requested total.

**Acceptance:** a 60/40 fixture produces allocation totals exactly equal to the distribution amount and credits both wallets once.

## 7. Experience and content requirements

- Use plain, non-promissory language: “projected”, “illustrative”, and “test mode” where relevant. Never write “guaranteed return.”
- Show a concise risk disclaimer before the final investment confirmation.
- Treat a property as an opportunity card, not a guaranteed asset. Show status (`Funding`, `Funded`, `Paused`) and risk consistently.
- All screens must have loading, empty, error, and permission-denied states.
- Preserve responsive behavior at 375 px and desktop width; keyboard-reachable controls and associated input labels are required.

### Mobile-first delivery rules

Mobile is the primary product surface, not a desktop layout made smaller. Design and verify the investor journey at **360–430 px first**, then enhance at tablet/desktop widths.

- Public cards are single-column with a tappable target of at least 44 × 44 px; important facts appear before secondary metadata.
- Filtering uses a bottom sheet/drawer on mobile; never a permanently compressed desktop sidebar.
- The property detail and checkout have one visible primary action at a time. A sticky bottom action bar may contain `Invest` / `Continue`, while preserving a safe-area inset and never obscuring content.
- Investment amount, available balance, minimum ticket, remaining funding, risk consent, and submit state must be readable without horizontal scrolling.
- Tables and dense admin data must become stacked summary cards or horizontally scrollable regions with labels; do not shrink text below readable size.
- Charts are supplementary. A numerical summary must remain available when a chart is hidden or too small.
- Test key flows on 360 px, 390 px, 768 px, and 1280 px widths before preview release.

## 8. Measurements for the sprint

| Signal | Target | Evidence |
|---|---:|---|
| Golden-path completion | 100% on seeded environment | Automated test run twice. |
| Money integrity | 0 balance/ledger mismatches | Ledger unit and integration tests. |
| Funding correctness | 0 oversubscription in race test | Concurrent API test. |
| Permission correctness | 100% expected 401/403 matrix | API integration test. |
| Demo clarity | Reviewer can explain the flow in under 3 minutes | Scripted demo checklist. |

## 9. Five-day delivery plan

| Day | Outcome | Non-negotiable exit check |
|---|---|---|
| 1 | Environment, Postgres schema baseline, Clerk auth/local mirror, RBAC, seed. | Pending investor cannot access admin/invest routes. |
| 2 | Ledger service and Paystack test funding; labelled admin demo-credit fallback. | Duplicate reference cannot double-credit. |
| 3 | Atomic investment service and checkout wiring. | Race test cannot oversubscribe or overdraw. |
| 4 | Real wallet/portfolio views and admin verification/distribution. | 60/40 distribution balances exactly. |
| 5 | Golden-path E2E, preview deploy, risk/demo labels, bug fixes only. | E2E twice green from a clean seed. |

**Cut order if behind:** Paystack integration (retain labelled demo-credit flow) → distribution UI (retain tested service/API) → nonessential animation/chart polish. Do not cut authorization, ledger invariants, investment atomicity, mobile checkout usability, or the E2E proof.

## 10. Risks and launch gate

| Risk | Sprint treatment |
|---|---|
| Financial/regulatory misunderstanding | Preview and every funding/investment surface labelled test/demo. No live processing. |
| Payment integration delay | Keep the server ledger and test webhook fixture; use a visibly separate admin demo-credit flow only for presentation. |
| Scope expansion | Anything not listed in §4 is backlog until the golden path is green. |
| Property claims cannot be verified in five days | Use clearly designated demo data; legal/property validation remains a post-sprint business process. |
| Data leakage | Do not seed real identity, bank, BVN/NIN, or payment information. |

### Post-sprint gate before real-money use

Legal counsel, regulated-market structure, real KYC vendor selection and DPIA/privacy review, property/SPV verification, payment/withdrawal controls, secured documents, production monitoring, incident runbook, backups, independent security review, and an operations team are all required before any live investment offering.

## 11. Decisions and edge cases to resolve before build

| Topic | Required decision / behavior |
|---|---|
| Sprint payment rail | `demo_credit` is the guaranteed demo path. Paystack test mode is integrated only while it does not endanger Day 3 investment completion. The UI must never make one look like the other. |
| Source of truth | Clerk authenticates; the local NEST database is authoritative for app role and verification state after the local profile is created. Do not maintain conflicting role/KYC copies in both systems. |
| Terms and risk consent | The final investment request records the current Terms/Risk version and accepted timestamp. A user cannot confirm without it. |
| Time-bound offers | Reject investment if an offering is paused, funded, or outside its funding window. Use UTC at the server; display local dates in the UI. |
| Retry after timeout | The same idempotency key returns the original receipt if the original investment committed but its response was lost. |
| Provider event order | Ignore/record failed, abandoned, duplicate, wrong-currency, wrong-amount, and unknown payment references. A provider event cannot create a payment record from nothing. |
| Distribution eligibility | Pay only confirmed investments at an explicit period cut-off. Reject no-investor, duplicate property/period, cancelled, or non-active property distributions. |
| Data quality | A missing/stale valuation shows “unavailable” / date-stamped value; it must not be represented as a current return. |
| Account changes | A locked, rejected, or deactivated account cannot fund/invest. Role removal takes effect on the next protected request. |
| Recovery | Notification failure cannot roll back a completed ledger action; capture it for retry/logging. Ledger/funding failures always roll back together. |
