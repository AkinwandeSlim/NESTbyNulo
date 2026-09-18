# NEST by Nulo Africa — Screen Specification

**Version:** 2.1
**Date:** September 17, 2026
**Status:** Updated — Reduced to 6 core demo screens (achievable 24-hour scope)
**Source of Truth:** `docs_gstack/requirements.md` v2.0

---

## Scope Reduction Note

Version 2.0 specified 12 screens. For a single developer with ~24 effective hours, 12 screens is not achievable without sacrificing code quality on the core features. This version reduces to **6 core screens** by:

- Combining Admin verification + demo credit + investment viewer into one Admin Panel screen
- Merging amount input and review/consent into one Investment screen (two logical steps, one page)
- Removing the separate Success and Transaction History screens (redirect to Portfolio with receipt shown inline)
- Removing the separate Verification Status screen (inline state on Portfolio/Wallet)
- Removing the separate Sign In / Sign Up screen (Clerk hosted — no NEST spec needed)

All other requirements (authorization, TEST MODE labels, mandatory checkboxes, mobile constraints) remain exactly as specified.

---

## Screen Map (6 Core Screens)

| # | Screen | Route | Auth | FR |
|---|---|---|---|---|
| 1 | Property Data Room | `/properties/[id]` | None (public) | FR-001 |
| 2 | Wallet + Verification Status | `/wallet` | Authenticated (any) | FR-002, FR-003 |
| 3 | Investment (Amount + Review + Consent) | `/properties/[id]/invest` | VERIFIED only | FR-004 |
| 4 | Portfolio | `/portfolio` | Authenticated (any) | FR-005 |
| 5 | Admin Panel | `/admin` | ADMIN only | FR-002, FR-003, FR-005, FR-006 |
| 6 | Admin Distribution | `/admin/distributions` | ADMIN only | FR-007 (Should-have) |

**Clerk sign-in/sign-up:** Clerk-hosted — no NEST-owned screen required.

---

## Screen 1: Property Data Room

**Route:** `/properties/[id]`
**Auth:** None (public)
**FR:** FR-001

### Required Content

**Page Header (always visible):**
- Banner (red, prominent): **"⚠ TEST MODE — NOT A LIVE OFFERING OR PAYMENT"**
- Property name (from DB)
- City and property type (from DB)
- Status badge: FUNDING / FUNDED / ACTIVE (from DB enum)

**Funding Progress:**
- Total target: ₦100,000,000 (from `fundingTargetKobo`)
- Raised: ₦X,XXX,XXX (from `fundingRaisedKobo`)
- Remaining: calculated
- Progress bar (%)

**Investment Terms (all from DB — no hardcoded values):**
- Minimum: ₦500,000 | Maximum: ₦10,000,000
- Platform fee: 2% of investment principal (added on top; shown as a line item at investment)
- Management fee: up to 8% of rent collected (not % of AUM)
- Legal/SPV costs: actual costs with pre-agreed cap (disclosed in deal memo)
- Lock-up: 24 months from acquisition (planning default — counsel confirmation required)
- Distributions: quarterly from actual rent collected

**Return Projection (DB-derived, mandatory labels):**
- Projected annual yield: 7–9% of investment principal
- **"PROJECTION ONLY — NOT GUARANTEED"** label — always visible
- **"Past performance does not predict future results"** label — always visible
- **"Depends on actual rent, vacancies, maintenance, and costs"** label — always visible

**Risk Disclosure (always visible — not behind a click):**
- Risk rating: MEDIUM (from DB)
- Risks listed: Vacancy, Tenant Default, Property Depreciation, Maintenance Costs, Regulatory Risk, Illiquidity (24-month lock-up, no secondary market), Capital Loss, Platform Risk

**Liquidity Policy (mandatory, prominent):**
- "There is no secondary market for this investment."
- "After the 24-month lock-up: exit through property sale, refinancing/buyback (if available), or permitted replacement investor transfer only."

**Call to Action:**
- Status FUNDING + VERIFIED user → "Invest Now" button (active)
- Status FUNDING + PENDING user → "Account pending verification — contact admin" (disabled button with message)
- Status FUNDING + anonymous user → "Sign In to Invest" → triggers Clerk sign-in, returns to this page
- Status FUNDED → "Fully Funded — No New Investments" (disabled)
- Status ACTIVE → "Currently Active — Property Acquired"

**Error/Loading States:**
- Loading: skeleton card
- Property not found: "This property is unavailable."
- Missing DB values: show intentional unavailable state — never fabricate a value

---

## Screen 2: Wallet + Verification Status

**Route:** `/wallet`
**Auth:** Authenticated (any — pending or verified)
**FR:** FR-002, FR-003

### Required Content

**Page Header:**
- Banner: **"TEST MODE — NOT A LIVE OFFERING OR PAYMENT"**
- **"Balances shown are illustrative demo credits — NOT real money"** (always visible)

**Verification Status (inline — replaces separate /verify screen):**
- PENDING: "⏳ Account Verification Pending — A NEST administrator will review your account. Once verified, you can invest. In a live pilot, this would involve identity verification by a licensed KYC provider."
- VERIFIED: "✅ Account Verified (Demo State Only — not real KYC)"
- REJECTED: "❌ Account Rejected — contact admin"

**Wallet Balance:**
- "Available Balance: ₦X,XXX,XXX" (from ledger SUM — never hardcoded)

**Transaction History (last 10, newest first):**
- Each row: date | type label | description | ± amount
- DEMO_CREDIT entries show: **"DEMO CREDIT — NOT A PAYMENT"** label
- "No transactions yet" empty state

**Fund Wallet Note:**
- "Your demo wallet is funded by a NEST administrator. This is not a real payment or deposit."

---

## Screen 3: Investment — Amount, Review, and Consent (Single Screen, Two Logical Steps)

**Route:** `/properties/[id]/invest`
**Auth:** VERIFIED investor only (server enforces 403 for PENDING, 401 for anonymous)
**FR:** FR-004

> **Single-screen, two-step implementation.** Step 1 (amount entry) and Step 2 (review + consent) are rendered on the same page. When the user enters a valid amount, the review panel updates live below. Confirm is blocked until all checkboxes are checked.

**Page Header:**
- Banner: **"INVEST — TEST MODE"**
- Property name

### Step 1: Amount Entry (top of screen)

**Investment Amount Field:**
- Label: "Investment Principal (₦)"
- Input placeholder text: "min ₦500,000 / max ₦10,000,000"
- Client-side validation on blur:
  - Below ₦500,000: "Minimum investment is ₦500,000"
  - Above ₦10,000,000: "Maximum investment is ₦10,000,000"
  - Exceeds wallet balance (after adding fee): "Your wallet balance of ₦X,XXX,XXX is insufficient (need ₦Y,YYY,YYY including the 2% fee)"
  - Exceeds remaining capacity: "Only ₦X,XXX,XXX of capacity remains"

### Step 2: Review Panel (updates live as amount changes)

**Investment Summary (shown when a valid amount is entered):**
- Investment principal: ₦X,XXX,XXX
- Platform fee (2% — added on top): ₦X,XXX
- **Total debited from wallet: ₦X,XXX,XXX**
- Your ownership stake: X.XX% of illustrative property
- Projected annual distribution: ₦XXX,XXX – ₦XXX,XXX
  - **(7–9% of your investment principal — PROJECTION ONLY, NOT GUARANTEED)**
- Lock-up: 24 months from acquisition
- Exit: no secondary market — see property page

**Mandatory Risk Consent Checkboxes (all 6 required; Confirm is DISABLED until all checked):**
- ☐ I understand this is TEST MODE — no real money is involved in this demo
- ☐ I understand the 24-month lock-up period from property acquisition completion
- ☐ I understand there is no secondary market — I cannot sell or transfer during lock-up
- ☐ I understand projected returns (7–9% of principal) are estimates only, not guaranteed
- ☐ I understand I could lose some or all of my invested capital in a live investment
- ☐ I have read and understood the risk factors on the property page

**Terms Acknowledgement Note:**
- "By confirming, you acknowledge these disclosures. The system will record your consent version and timestamp server-side."

**Confirm Investment Button:**
- Disabled (greyed) until all 6 checkboxes are checked AND a valid amount is entered
- Active state: "Confirm Investment — ₦X,XXX,XXX total debit"
- Loading after click: "Processing…" (disabled; spinner; no double-submit)

**On Success:**
- Redirect to `/portfolio` with a success toast: "Investment confirmed ✅ — Receipt: INV-YYYYMMDD-XXX — ₦X,XXX,XXX (₦Y,YYY,YYY principal + ₦Z,ZZZ fee)"
- *No separate success screen needed — portfolio shows the confirmed holding immediately*

**On Error:**
- Error shown below the Confirm button: "Investment failed: [server error message]"
- Checkboxes remain checked; user can adjust amount and retry

---

## Screen 4: Portfolio

**Route:** `/portfolio`
**Auth:** Authenticated (any)
**FR:** FR-005

### Required Content

**Page Header:**
- Banner: **"TEST MODE — NOT A REAL BALANCE OR PORTFOLIO"**

**Wallet Balance Card:**
- "Available Balance: ₦X,XXX,XXX" (from ledger SUM — never hardcoded)
- Link to `/wallet` for full transaction history + verification status

**Holdings Section:**
- For each CONFIRMED investment:
  - Property name + (DEMO) label
  - Principal invested: ₦X,XXX,XXX
  - Platform fee paid: ₦X,XXX
  - Ownership stake: X.XX%
  - Status: CONFIRMED
  - Projected annual dist: ₦XXX,XXX – ₦XXX,XXX (PROJECTION ONLY)
  - Date confirmed
- **Empty state:** "No investments yet. Browse available properties." + link

**Recent Transactions (last 5, all DB-derived):**
- Date | Type | Description | Amount
- DEMO_CREDIT: "Demo Credit — NOT A PAYMENT: +₦5,000,000"
- INVESTMENT_DEBIT: "Investment principal — [property]: -₦5,000,000"
- PLATFORM_FEE: "Platform fee (2%) — [property]: -₦100,000"
- DISTRIBUTION_CREDIT: "Rental Distribution Q4 2026 Demo: +₦55,200"
- **Empty state:** "No transactions yet"

---

## Screen 5: Admin Panel

**Route:** `/admin`
**Auth:** ADMIN only (403 for non-admin, 401 for anonymous)
**FR:** FR-002, FR-003, FR-005, FR-006

> **Combined single admin screen** covering user management, demo credits, and investment viewer. No separate sub-pages needed for the 3-day demo.

**Page Header:**
- "Admin Panel — TEST MODE"

### Section A: User Management

| Column | Value |
|---|---|
| Name | Fictional name (from DB) |
| Email | Demo email |
| KYC Status | PENDING / VERIFIED / REJECTED badge |
| Wallet Balance | From ledger SUM |
| Actions | Verify / Reject (with confirm dialog) |

- Each Verify/Reject action: writes AuditLog entry + creates Notification
- Filter by: ALL / PENDING only

### Section B: Issue Demo Credit

- Select Investor: dropdown of INVESTOR accounts
- Amount (₦): input field
- Reference: auto-generated (idempotent)
- Preview: "Credit ₦X,XXX,XXX to [name] — DEMO CREDIT — NOT A PAYMENT"
- "Issue Demo Credit" button
- Success: reference shown; balance updated in Section A table

### Section C: Investment Registry

- Table of all CONFIRMED investments
- Columns: Receipt No | Investor | Principal | Fee | Total Debit | Ownership % | Date
- All values from DB — no hardcoded numbers
- AuditLog: last 10 entries with action, actor, entity, timestamp

---

## Screen 6: Admin Distribution Panel (Should-Have)

**Route:** `/admin/distributions`
**Auth:** ADMIN only
**FR:** FR-007

> *Only build this if all 5 Must-have screens are complete and passing before end of Day 2.*

**Page Header:**
- "Admin Distribution — TEST MODE"

**Configuration:**
- Select Property: dropdown of FUNDING/ACTIVE demo properties
- Distribution Period: text input (e.g., "Q4-2026-DEMO")
- Total Rent Collected (₦): number input
- Auto-calculated:
  - Management fee (8% of rent): ₦X,XXX
  - Net to distribute: ₦X,XXX,XXX

**Preview (after "Calculate" button):**
- Table: Investor | Principal | Ownership % | Allocation | Wallet Balance After
- Unfunded reserve: shown as "Unfunded X.X% — ₦X,XXX,XXX held in reserve (not credited)"
- Accounting check: sum of all investor allocations + unfunded reserve = net to distribute ✓

**Idempotency Guard:**
- "Executing the same period twice is blocked (409 error). Check before executing."

**"Execute Distribution — TEST MODE" button:**
- Requires preview first
- Confirmation modal: "Credit ₦X,XXX,XXX to [N] investor wallets — TEST MODE. Cannot be undone."
- On success: summary table with all credits + reserve amount

**API Contract:**
- `POST /api/admin/distributions` — single endpoint. Request body includes `action: "preview"` or `action: "execute"`. This unifies the contract with the architecture specification.

---

## Mobile Requirements (All 6 Screens)

- Primary build viewport: **360px**
- Verify at: 390px, 768px, 1280px
- No horizontal scrolling on any screen
- Minimum **44px × 44px** touch targets for all interactive elements
- Investment Confirm button: **sticky bottom, safe-area-inset-aware**, does not cover the amount, balance, or checkboxes
- Dense data tables → labeled stacked cards at ≤ 768px
- Loading: centered spinner with accessible text
- Error messages: appear below the triggering element (not in a toast alone)

---

## Hour Estimate (6 Screens, Solo Builder)

| Screen | Estimated Hours |
|---|---|
| Screen 1: Property Data Room | 5–6 h |
| Screen 2: Wallet + Verification Status | 3–4 h |
| Screen 3: Investment (combined) | 6–7 h |
| Screen 4: Portfolio | 4–5 h |
| Screen 5: Admin Panel | 5–6 h |
| **Must-have total (Screens 1–5)** | **23–28 h** |
| Screen 6: Admin Distribution (Should) | 4–5 h |

> This is still a stretch for 24 hours. Screen 5 (Admin) can be simplified to API-call-only verification (no UI) during the demo if necessary, saving 3–4 hours.

---

**Document Status:** Approved for Solo-Builder Demo Scope (6 screens)
**Source of Truth:** requirements.md v2.0
**Last Updated:** September 17, 2026
