# NEST by Nulo Africa — Competition Demo Data

**Version:** 2.1
**Date:** September 17, 2026
**Status:** Updated — P0 accounting corrections applied

---

## ⚠️ TEST MODE — NOT A LIVE OFFERING OR PAYMENT ⚠️

All data in this document is **illustrative test/demo data only**. It does not represent a live investment offering, a real property transaction, or real investor funds.

**Critically:**
- The real ₦15,000,000 received from real investors must **never** appear as demo seed data.
- Real investor names, emails, payment records, or account details must **never** appear in this document or any repository file.
- Demo data uses fictional names and illustrative amounts clearly separated from any live pilot records.

---

## Fee Model (Single Canonical Rule)

> This rule governs every financial calculation in every document.

**"Fee added on top" model:**

| Term | Rule |
|---|---|
| Investment principal | Amount the investor specifies; this is what they "own" |
| Platform fee | 2% of investment principal, charged in addition |
| Total wallet debit | Principal + platform fee |
| Ownership % | Principal ÷ ₦100,000,000 × 100 |
| Projected annual yield | 7–9% of investment principal (not of post-fee amount; fee goes to platform and does not generate returns) |

**Example:** Investor enters ₦2,000,000.
- Platform fee: ₦40,000 (2% of ₦2M)
- Total wallet debit: ₦2,040,000
- Ownership: 2.0% (₦2M ÷ ₦100M)
- Projected annual distribution: ₦140,000–₦180,000 (7–9% of ₦2M principal)

---

## Illustrative Test Property

> Fictional illustrative values for demo seed only. No specific real property represented.

```
Demo Property Name: Illustrative Abuja Residential Apartment (DEMO)
Demo Property ID:   prop-demo-001
City: Abuja, FCT, Nigeria
Property Type: Residential Apartment (illustrative)
Status: FUNDING

Funding Details (seeded):
  Total Funding Target:    ₦100,000,000   kobo: 10000000000n
  Pre-seeded Funding Raised: ₦5,000,000   kobo: 500000000n
    (Fatima's pre-seeded investment only; Adaeze has not yet invested at seed time)
  Funding Remaining:       ₦95,000,000    kobo: 9500000000n
  Percent Funded:          5.0%
  Number of Pre-seeded Investors: 1 (Fatima only)

Investment Terms (illustrative):
  Minimum Investment:  ₦500,000   (minInvestmentKobo: 50000000n)
  Maximum Investment:  ₦10,000,000 (maxInvestmentKobo: 1000000000n)
  Platform Fee:        2% of investment principal, added on top at investment
  Management Fee:      Up to 8% of rent actually collected (not % of AUM)
  Legal/SPV Costs:     Actual costs with pre-agreed cap (illustrative: shared pro-rata)
  Lock-up:             24 months from acquisition completion (planning default — requires counsel confirmation)
  Projected Yield:     7–9% of investment principal per year
    (PROJECTION ONLY — NOT GUARANTEED; requires counsel confirmation before disclosure to real investors)
  Distribution:        Quarterly, from actual rent collected after approved expenses

TEST MODE — NOT A LIVE OFFERING OR PAYMENT
```

---

## Demo Seed Accounts

> All names and emails are fictional. No real investor data is represented.

### Admin Account
```
Name:  NEST Demo Admin
Email: admin@demo.nest.test
Role:  ADMIN
KYC:   VERIFIED (admin)
```

### Demo Investor 1 — Adaeze (Verified, unfunded at seed time)
> Adaeze's wallet is funded live during the demo via admin demo credit. No pre-seeded investment.

```
Name:   Adaeze Obi (DEMO)
Email:  adaeze@demo.nest.test
Role:   INVESTOR
Status: VERIFIED
Demo Wallet at Seed: ₦5,000,000 demo credit (NOT a payment)
  Ledger entry label: "DEMO CREDIT — NOT A PAYMENT"
  Reference: DEMO-CREDIT-ADAEZE-001
Pre-seeded Investments: none (she invests live during the demo)
```

### Demo Investor 2 — Emeka (Pending — demonstrates authorization block)
```
Name:   Chukwuemeka Okafor (DEMO)
Email:  emeka@demo.nest.test
Role:   INVESTOR
Status: PENDING
Demo Wallet at Seed: ₦0
```

### Demo Investor 3 — Fatima (Verified, pre-seeded investment)
> Fatima's pre-seeded investment gives the portfolio screen something to show before the demo starts.

```
Name:   Fatima Garba (DEMO)
Email:  fatima@demo.nest.test
Role:   INVESTOR
Status: VERIFIED

Demo Credit at Seed: ₦7,000,000 (NOT a payment)
  Reference: DEMO-CREDIT-FATIMA-001

Pre-seeded Investment:
  Principal: ₦5,000,000
  Platform Fee (2% of principal): ₦100,000
  Total Wallet Debit: ₦5,100,000
  Ownership: 5.0%   (₦5,000,000 ÷ ₦100,000,000)
  Reference: DEMO-INV-FATIMA-001

Wallet Balance After Seed:
  ₦7,000,000 − ₦5,000,000 − ₦100,000 = ₦1,900,000
```

---

## Demo Ledger Seed (Canonical Kobo Values)

> All amounts in BigInt kobo. ₦1 = 100 kobo.

```
=== Adaeze wallet (wallet-adaeze) ===

Entry 1: +500000000n  (₦5,000,000)
  type:      DEMO_CREDIT
  reference: DEMO-CREDIT-ADAEZE-001
  label:     "DEMO CREDIT — NOT A PAYMENT"

Wallet balance: 500000000n (₦5,000,000)


=== Fatima wallet (wallet-fatima) ===

Entry 1: +700000000n  (₦7,000,000)
  type:      DEMO_CREDIT
  reference: DEMO-CREDIT-FATIMA-001
  label:     "DEMO CREDIT — NOT A PAYMENT"

Entry 2: -500000000n  (₦5,000,000 — investment principal)
  type:      INVESTMENT_DEBIT
  reference: DEMO-INV-FATIMA-001

Entry 3: -10000000n   (₦100,000 — 2% platform fee on ₦5M principal)
  type:      PLATFORM_FEE
  reference: DEMO-FEE-FATIMA-001

Wallet balance: 700000000n − 500000000n − 10000000n = 190000000n  (₦1,900,000) ✓

Ledger SUM check: +700000000 − 500000000 − 10000000 = +190000000 ✓


=== Emeka wallet (wallet-emeka) ===
No entries. Balance: 0n


=== Property prop-demo-001 ===
fundingRaisedKobo: 500000000n (₦5,000,000 — Fatima's principal only)
```

---

## Investment Scenarios (Fee-Model-Consistent)

> All scenarios use: ownership = principal ÷ ₦100M; yield on principal; fee added on top.

### Scenario A: ₦500,000 (Minimum Investment)
```
Principal:             ₦500,000    kobo: 50000000n
Platform fee (2%):     ₦10,000     kobo: 1000000n
Total wallet debit:    ₦510,000    kobo: 51000000n
Ownership:             0.5%        (₦500K ÷ ₦100M)
Projected annual dist: ₦35,000 – ₦45,000  (7–9% of ₦500K principal)
  PROJECTION ONLY — NOT GUARANTEED
```

### Scenario B: ₦2,000,000
```
Principal:             ₦2,000,000  kobo: 200000000n
Platform fee (2%):     ₦40,000     kobo: 4000000n
Total wallet debit:    ₦2,040,000  kobo: 204000000n
Ownership:             2.0%        (₦2M ÷ ₦100M)
Projected annual dist: ₦140,000 – ₦180,000  (7–9% of ₦2M principal)
  PROJECTION ONLY — NOT GUARANTEED
```

### Scenario C: ₦5,000,000 (Fatima — pre-seeded)
```
Principal:             ₦5,000,000  kobo: 500000000n
Platform fee (2%):     ₦100,000    kobo: 10000000n
Total wallet debit:    ₦5,100,000  kobo: 510000000n
Ownership:             5.0%        (₦5M ÷ ₦100M)
Projected annual dist: ₦350,000 – ₦450,000  (7–9% of ₦5M principal)
  PROJECTION ONLY — NOT GUARANTEED
```

### Scenario D: ₦10,000,000 (Maximum)
```
Principal:             ₦10,000,000 kobo: 1000000000n
Platform fee (2%):     ₦200,000    kobo: 20000000n
Total wallet debit:    ₦10,200,000 kobo: 1020000000n
Ownership:             10.0%       (₦10M ÷ ₦100M)
Projected annual dist: ₦700,000 – ₦900,000  (7–9% of ₦10M principal)
  PROJECTION ONLY — NOT GUARANTEED
```

---

## Demo Distribution Event (Admin Flow — Illustrative)

> Illustrative quarterly distribution for demo. All amounts are fictional.

### Setup
```
Property:  Illustrative Abuja Residential Apartment (DEMO)
Period:    Q4-2026-DEMO
Total Illustrative Rent Collected: ₦1,200,000   kobo: 120000000n
Management Fee (8% of rent collected): ₦96,000  kobo: 9600000n
Net Distributable:  ₦1,104,000   kobo: 110400000n
```

### Distribution Rule
Only confirmed, funded investment positions receive distributions. Unfunded capacity (property not yet fully subscribed) does not distribute — it is held in reserve.

In this demo seed, only 5% of the property (₦5M / ₦100M) is funded.

### Allocation Table (Demo — 1 pre-seeded investor)

| Investor | Principal | Ownership % | Allocation |
|---|---|---|---|
| Fatima (DEMO) | ₦5,000,000 | 5.0% | ₦55,200 |
| Unfunded 95.0% | — | — | ₦1,048,800 held in reserve |
| **Total net** | | | **₦1,104,000 ✓** |

```
Fatima's allocation:
  ₦1,104,000 × (500000000n ÷ 10000000000n) = ₦1,104,000 × 0.05 = ₦55,200
  kobo: 110400000n × 500000000n ÷ 10000000000n = 5520000n ✓

Unfunded portion (95%):
  ₦1,104,000 × 0.95 = ₦1,048,800 — held in reserve, NOT distributed
  kobo: 110400000n × 9500000000n ÷ 10000000000n = 104880000n

Accounting check:
  5520000n + 104880000n = 110400000n (netDistributedKobo) ✓
  Sum of all investor credits: 5520000n (Fatima only)
  Undistributed reserve: 104880000n

Note: In the demo, the "reserve" amount (₦1,048,800) is documented in the
Distribution record but not credited to any wallet. This is correct behaviour:
only positions with confirmed investments receive rent allocations.
After Adaeze invests ₦2M during the demo (adding 2.0% ownership), a
second distribution would allocate:
  Fatima (5.0%): ₦55,200
  Adaeze (2.0%): ₦22,080
  Unfunded 93.0%: ₦1,026,720 held in reserve
  Total: ₦1,104,000 ✓
```

---

## Risk Disclosures (Mandatory Before Investment Confirmation)

All six checkboxes must be checked before Confirm is enabled:

```
☐ I understand this is TEST MODE — no real money is involved in this demo.
☐ I understand there is a 24-month lock-up from property acquisition completion.
☐ I understand there is no secondary market — I cannot sell or transfer during lock-up.
☐ I understand projected returns (7–9% of principal) are estimates only, not guaranteed.
☐ I understand I could lose some or all of my invested capital in a live investment.
☐ I have read and understood the risk factors shown on the property page.
```

---

## Fee Disclosure (Shown Before Investment Confirmation)

Illustrative for a ₦2,000,000 investment:

```
  Investment principal:              ₦2,000,000
  Platform / arrangement fee (2%):     ₦40,000  [one-time, charged at investment]
  Total debited from wallet:         ₦2,040,000
  Your ownership stake:                    2.0%  (₦2M ÷ ₦100M target)
  Projected annual distribution:  ₦140,000 – ₦180,000  (7–9% of ₦2M principal)
    PROJECTION ONLY — NOT GUARANTEED

Ongoing fees:
  Property management: up to 8% of rent collected (deducted before distributions)
  Legal / SPV costs:   actual costs with pre-agreed cap (disclosed in deal memo)
```

---

## Competition Demo Script (3 Minutes)

**Accounts used:** Emeka (PENDING), Adaeze (VERIFIED, ₦5M wallet), Fatima (pre-seeded portfolio), Admin.

### Step 1 — Property Data Room (30 s)
- Open demo property page.
- Point out: ₦100M target, 5% funded (Fatima's pre-seeded ₦5M), all fees as line items, yield labelled PROJECTION ONLY, TEST MODE banner.

### Step 2 — Authorization Block (20 s)
- Sign in as Emeka (PENDING). Click Invest. Server returns 403.
- "Control is server-side — not just UI."

### Step 3 — Admin Demo Credit (30 s)
- Switch to Admin. Credit Adaeze ₦3,000,000 more (or show she already has ₦5M from seed).
- Label: "DEMO CREDIT — NOT A PAYMENT" appears in ledger.

### Step 4 — Investment Flow (45 s)
- Sign in as Adaeze (VERIFIED, ₦5M wallet).
- Enter ₦2,000,000. System shows: fee ₦40,000, total ₦2,040,000, ownership 2.0%, yield ₦140K–₦180K/yr (PROJECTION ONLY).
- Check all 6 consent boxes → Confirm unlocks. Invest.
- Show receipt.

### Step 5 — Portfolio Persistence (30 s)
- Reload the page. Portfolio still shows ₦2M investment, 2.0% ownership.
- Wallet balance: ₦5M − ₦2.04M = ₦2,960,000 (from ledger SUM — not hardcoded).
- Transaction list: demo credit, investment debit, fee debit.

### Step 6 — Admin Distribution (30 s, if FR-007 built)
- Admin enters Q4-2026-DEMO, ₦1,200,000 rent collected.
- System calculates: management fee ₦96,000, net ₦1,104,000.
- Fatima (5.0%) receives ₦55,200; Adaeze (2.0%) receives ₦22,080; remainder held in reserve. Total = ₦1,104,000 ✓.

### Step 7 — Investor Income (20 s, if FR-007 built)
- Adaeze's wallet: +₦22,080 distribution credit shown.

### Step 8 — Closing (15 s)
- "Server-side authorization + immutable ledger + atomic investment + auditable admin control."
- "Live launch requires SEC counsel opinion, real KYC, dedicated SPV account, and compliance review."

**Total: ~3 minutes**

---

## Database Seed Order

```
1. Create property prop-demo-001 (FUNDING, target ₦100M, raised ₦0 initially)
2. Create ADMIN demo account + wallet
3. Create Adaeze (VERIFIED) + wallet
4. Create Emeka (PENDING) + wallet (balance ₦0)
5. Create Fatima (VERIFIED) + wallet
6. Credit Adaeze wallet: +500000000n (₦5M DEMO CREDIT)
7. Credit Fatima wallet: +700000000n (₦7M DEMO CREDIT)
8. Create Fatima investment: principal 500000000n, fee 10000000n (Investment CONFIRMED)
9. Debit Fatima wallet: -500000000n (INVESTMENT_DEBIT) + -10000000n (PLATFORM_FEE)
10. Update Fatima wallet balance: 700000000n - 510000000n = 190000000n (₦1,900,000)
11. Update property fundingRaisedKobo: +500000000n = 500000000n (₦5M)
12. Create AuditLog entries for steps 6-11
```

---

## Kobo Reference

```
₦1 = 100 kobo (BigInt)

₦100,000,000 (target)  = 10000000000n
₦10,000,000  (max)     = 1000000000n
₦7,000,000             = 700000000n
₦5,100,000             = 510000000n
₦5,000,000             = 500000000n
₦2,040,000             = 204000000n
₦2,000,000             = 200000000n
₦1,900,000             = 190000000n
₦1,200,000             = 120000000n
₦1,104,000             = 110400000n
₦500,000   (min)       = 50000000n
₦200,000               = 20000000n
₦100,000               = 10000000n
₦96,000                = 9600000n
₦55,200                = 5520000n
₦40,000                = 4000000n
₦22,080                = 2208000n
₦10,000                = 1000000n
```

---

**TEST MODE — NOT A LIVE OFFERING OR PAYMENT**
**All values are illustrative. No real investor data is included.**
**Last Updated:** September 17, 2026
