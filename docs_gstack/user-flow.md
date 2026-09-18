# NEST by Nulo Africa — User Flow

**Version:** 2.0
**Date:** September 17, 2026
**Status:** Updated — Demo Scope Only
**Source of Truth:** `docs_gstack/requirements.md` v2.0

---

## Scope Note

This user flow covers the **solo-builder, test-mode demo** only. The following are explicitly out of scope for this flow:
- Live payment processing (Paystack live mode)
- Real KYC / BVN / NIN collection
- Wallet withdrawal
- Secondary market or share transfers
- SMS / email notifications
- Open public onboarding / investor acquisition
- Automatic real rental distributions
- Anything requiring the real ₦15,000,000 or real 7 investor identities

The real ₦15,000,000 and real investors have a **separate, non-platform onboarding process** that requires deal memo, counsel-reviewed subscription agreements, and individual consent per requirements.md Section 6.4. This platform flow is for demo purposes.

---

## Primary User Flow — Demo Investor

### PHASE 1: Property Discovery (Unauthenticated)

**Goal:** Visitor evaluates the demo property and decides to invest.

**1. User opens the demo platform**
- Lands on the demo property listing or property detail page directly
- Sees "TEST MODE — NOT A LIVE OFFERING OR PAYMENT" banner

**2. User views the Property Data Room**
- Property name: "Illustrative Abuja Residential Apartment (DEMO)"
- City: Abuja, FCT
- Status badge: FUNDING
- Funding progress: ₦5,000,000 / ₦100,000,000 (5.0% — Fatima's pre-seeded investment only)
- Projected annual yield: 7–9% (labelled PROJECTION ONLY — NOT GUARANTEED)
- Lock-up: 24 months from acquisition completion
- Fee structure (visible as line items):
  - Platform / arrangement fee: 2% of investment amount (one-time)
  - Property management fee: up to 8% of rent collected (not AUM)
- Risk rating: MEDIUM
- Risk factors: vacancy, depreciation, market risk, illiquidity, platform risk, capital loss
- Invest button: "Invest Now" → triggers sign-in flow if unauthenticated

**3. Unauthenticated user clicks "Invest Now"**
- System redirects to Clerk sign-in page
- After sign-in/sign-up, system returns user to the property page

---

### PHASE 2: Authentication and Verification State

**Goal:** User creates an account and understands verification requirement.

**4. New user registers via Clerk**
- Clerk handles email/password or OAuth (no BVN/NIN/liveness in demo)
- NEST creates local User record with role=INVESTOR, kycStatus=PENDING
- NEST creates Wallet with availableBalanceKobo=0

**5. Pending user tries to invest**
- User clicks "Invest Now" on the property page
- System shows: "Your account is pending verification. A NEST admin will review your demo account. Once verified, you can invest."
- Invest button is disabled in the UI
- If pending user hits POST /api/investments directly: server returns 403 (not just a UI block)

**6. Admin verifies the pending user (admin flow — background)**
- Admin logs into admin panel
- Admin sees list of pending users (fictional names only in demo)
- Admin clicks "Verify" for the user
- Server updates kycStatus: PENDING → VERIFIED
- Server inserts AuditLog entry: action=USER_VERIFIED
- Server inserts Notification for user: "Your account has been verified. You can now invest."

**7. Verified user returns to property page**
- Status badge: VERIFIED
- "Invest Now" button is now active

---

### PHASE 3: Demo Wallet Funding

**Goal:** Admin credits a demo wallet so the investor can test the investment flow.

**8. Admin credits demo wallet (admin panel)**
- Admin selects demo investor from dropdown
- Admin enters credit amount (e.g., ₦5,000,000)
- Admin clicks "Credit Demo Wallet"
- Server validates: requireAdmin; unique reference check (idempotency)
- Server inserts LedgerEntry:
  - amountKobo: +500000000n (₦5M)
  - type: DEMO_CREDIT
  - reference: "DEMO-CREDIT-[USER]-[DATE]-001"
  - label: "DEMO CREDIT — NOT A PAYMENT"
- Server updates Wallet.availableBalanceKobo within same transaction
- UI shows success: "Demo credit issued: ₦5,000,000 (TEST MODE)"

**9. Investor checks wallet**
- Wallet balance: ₦5,000,000
- Transaction history shows: "DEMO CREDIT — NOT A PAYMENT: +₦5,000,000"
- Test mode label prominent on wallet screen

---

### PHASE 4: Investment Execution

**Goal:** Verified investor invests in the demo property.

**10. User clicks "Invest Now" on property page**
- System shows Investment Amount input
- Min: ₦500,000 | Max: ₦10,000,000 (or remaining capacity, whichever is lower)
- Client-side validation shows errors as user types

**11. User enters investment amount: ₦2,000,000**
- System calculates and displays immediately (no API call yet):
  - Platform fee (2% of principal, added on top): ₦40,000
  - Total debited from wallet: ₦2,040,000
  - Ownership stake: 2.0% (principal ₦2M ÷ ₦100M target)
  - Projected annual distribution: ₦140,000 – ₦180,000 (7–9% of ₦2M principal — PROJECTION ONLY)
  - Available wallet balance: ₦5,000,000
  - Remaining after investment: ₦2,960,000

**12. User clicks "Continue to Review"**
- System shows Investment Confirmation screen with:
  - Property: Illustrative Abuja Residential Apartment (DEMO)
  - Investment amount: ₦2,000,000
  - Platform fee (2% of principal, added on top): ₦40,000
  - Total debited from wallet: ₦2,040,000
  - Ownership stake: 2.0% (principal ÷ target)
  - Projected yield: 7–9% of ₦2M principal / year (PROJECTION ONLY — NOT GUARANTEED)
  - Lock-up: 24 months from acquisition
  - No secondary market (exit paths explained)
  - TEST MODE banner

**13. User reviews mandatory risk consent checkboxes**
  All boxes must be checked before Confirm button is enabled:
  - ☐ I understand this is TEST MODE — no real money involved
  - ☐ I understand the 24-month lock-up from acquisition completion
  - ☐ I understand there is no secondary market or guaranteed liquidity
  - ☐ I understand projected returns (7–9%) are estimates only, not guaranteed
  - ☐ I understand I could lose some or all of my invested capital in a live investment

**14. User checks all boxes → Confirm button becomes active**

**15. User clicks "Confirm Investment"**
- Client generates idempotencyKey (UUID)
- Client sends POST /api/investments: { propertyId, amountKobo: 200000000n, idempotencyKey }
- Server processes atomic transaction (see data-structure.md Section 6 for full transaction detail)
- Server returns 201 Created: { investmentId, receiptNumber, ownershipPercent, status: CONFIRMED }

**16. System shows Investment Success**
- Receipt number: "INV-20260916-001"
- Property: Illustrative Abuja Residential Apartment (DEMO)
- Amount invested: ₦2,000,000
- Platform fee: ₦40,000
- Ownership stake: 2.0% (principal ÷ target)
- Projected distribution: ₦140,000–₦180,000/year (7–9% of ₦2M principal — PROJECTION ONLY)
- "TEST MODE — NOT A LIVE INVESTMENT"
- Button: "View My Portfolio"

---

### PHASE 5: Portfolio Management

**Goal:** User views and verifies their confirmed investment.

**17. User navigates to Portfolio**
- System fetches GET /api/portfolio (requireAuth)
- Portfolio shows (all DB-derived, zero hardcoded):
  - Wallet balance: ₦2,960,000 (from ledger SUM: 5M − 2M − 40K = ₦2.96M)
  - Holdings section:
    - Illustrative Abuja Residential Apartment (DEMO)
    - Investment amount: ₦2,000,000
    - Ownership stake: 2.0%
    - Status: CONFIRMED
    - Projected annual income: ₦140,000–₦180,000 (7–9% of principal — PROJECTION ONLY)
  - Recent transactions (last 5):
    - "DEMO CREDIT — NOT A PAYMENT": +₦5,000,000
    - "Investment principal — Illustrative Property (DEMO)": -₦2,000,000
    - "Platform fee (2%) — Illustrative Property (DEMO)": -₦40,000

**18. User reloads the page**
- System re-fetches from database
- Same data appears (proves persistence)
- No hardcoded values — all from DB

---

### PHASE 6: Demo Distribution (If FR-007 built)

**Goal:** Admin executes a demo quarterly distribution; investor sees income credited.

**19. Admin opens distribution panel**
- Admin selects demo property
- Admin selects period: "Q4 2026 Demo"
- Admin enters total rent collected: ₦1,200,000 (illustrative)
- System calculates:
  - Management fee (8% of rent): ₦96,000
  - Net to distribute: ₦1,104,000
- Admin clicks "Calculate Pro-rata"

**20. System shows distribution preview**
- Table of all investors with CONFIRMED investments
- Fatima: 5.0% ownership → ₦55,200 (₦1,104,000 × 5.0%)
- Adaeze: 2.0% ownership → ₦22,080 (₦1,104,000 × 2.0%) — only if she has invested by this point
- Unfunded 93.0%: ₦1,026,720 held in reserve (not credited)
- Total: ₦55,200 + ₦22,080 + ₦1,026,720 = ₦1,104,000 ✓

**21. Admin clicks "Execute Distribution"**
- System shows confirmation modal: "Credit ₦1,104,000 to [N] investor wallets — TEST MODE?"
- Admin confirms
- Server processes atomic transaction:
  - For each investor: INSERT LedgerEntry (DISTRIBUTION_CREDIT), UPDATE Wallet balance
  - INSERT Distribution record (idempotent: Q4-2026-DEMO cannot be re-executed for same property)
  - INSERT Notification for each investor
  - INSERT AuditLog
- Server returns 200 OK

**22. Investor checks wallet**
- Wallet balance increased by ₦22,080 (Adaeze's share — only if she invested before this distribution)
- Transaction history shows: "Rental Distribution — Q4 2026 Demo: +₦22,080 (TEST MODE)"

---

## Secondary Flow — Admin Operations

### Admin Daily Operations (Demo)

**A1. Admin logs in**
- Navigates to admin panel (/admin)
- Only accessible to users with role=ADMIN (403 for others)

**A2. Admin views pending users**
- Table of PENDING investor accounts (fictional names and emails)
- Actions: "Verify" or "Reject" per user
- Each action writes AuditLog entry

**A3. Admin credits demo wallets**
- Selects investor from dropdown
- Enters amount
- Clicks "Credit Demo Wallet"
- Label "DEMO CREDIT — NOT A PAYMENT" applied automatically
- Reference auto-generated (idempotent)

**A4. Admin monitors investments**
- Views all CONFIRMED investment records
- Sees property funding progress
- All amounts from DB — no hardcoded values

**A5. Admin executes demo distribution** (if FR-007 built)
- Steps 19–21 above

---

## Edge Cases and Error Flows

### E1. Investment Exceeds Wallet Balance
- User enters: ₦4,000,000
- Wallet balance: ₦2,960,000
- Server returns 400: "Insufficient wallet balance. Available: ₦2,960,000"
- Wallet not modified; no ledger entries created

### E2. Investment Below Minimum
- User enters: ₦400,000
- Client-side validation shows error immediately: "Minimum investment is ₦500,000"
- Server validates independently and returns 400 if client is bypassed

### E3. Investment Above Maximum
- User enters: ₦12,000,000
- Client-side validation: "Maximum investment is ₦10,000,000"
- Server validates and returns 400 if client is bypassed

### E4. Property Fully Funded During Investment
- User confirms ₦3,000,000 investment
- Concurrent request fills last ₦2,000,000 of capacity just before this request commits
- Server returns 400: "Insufficient funding capacity. Remaining: ₦2,000,000"
- Wallet not modified

### E5. PENDING Investor Attempts Investment
- PENDING user hits "Invest Now"
- UI shows: "Account pending verification. You cannot invest yet."
- If they bypass UI and hit POST /api/investments: server returns 403
  - Message: "Account not verified. Contact admin to request verification."

### E6. Duplicate Investment (Same idempotencyKey)
- Network failure causes client to retry with same idempotencyKey
- Server detects existing investment with that key
- Returns 200 (or 201) with the existing investment record — no duplicate created

### E7. Admin Attempts Duplicate Distribution
- Admin tries to execute Q4-2026-DEMO distribution again for same property
- Server returns 409: "Distribution for Q4-2026-DEMO already executed for this property"
- No ledger entries created; no wallets modified

---

## Summary Timeline (Demo Flow)

| Phase | Duration | Key Milestone |
|---|---|---|
| Property Discovery | 2–5 minutes | User reads property details |
| Registration + Verification Wait | 5–60 minutes | Admin verifies demo account |
| Demo Wallet Funding | 2 minutes | Admin credits demo wallet |
| Investment Execution | 3–5 minutes | Investment confirmed and receipted |
| Portfolio Check | 1 minute | Holdings visible; persists after reload |
| Demo Distribution | 3–5 minutes (admin) | Distribution credited to wallet |

**Total demo time (all phases):** ~20–30 minutes end-to-end for a single user
**Competition demo (scripted):** 3 minutes (pre-seeded accounts, scripted path)

---

**Document Status:** Complete — Demo Scope
**Source of Truth:** requirements.md v2.0
**Last Updated:** September 16, 2026

