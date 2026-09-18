# NEST by Nulo Africa — Product Requirements Document

**Version:** 2.0
**Date:** September 16, 2026
**Status:** Active — Canonical Source of Truth
**Owner:** NEST Team / NuloAfrica

---

## Source of Truth Declaration

This document is the **single source of truth** for the NEST platform. All other documents in `docs_gstack/` must align with this document. Where any other document contradicts this one, this document governs. Any change to product scope, financial figures, fees, investor protections, or legal framing must be recorded here first, dated, and attributed to a named decision-maker before it is propagated to other documents.

**Backup of previous version:** `requirements_backup_20260915_134622.md` — preserved as archive; do not modify.

---

## 1. Problem Statement

Financially capable middle-income professionals in Nigeria — earning ₦500,000–₦1,000,000 monthly with ₦1,000,000–₦5,000,000 in liquid savings — cannot access specific, professionally managed, income-producing real estate investments. Entry prices for quality Abuja residential property are ₦50,000,000–₦150,000,000. Their savings lose real purchasing power at an estimated 10–15% per year in fixed deposits while nominal inflation runs at 25–30%. Informal pooling (ajo/esusu) works at the scale of trusted friend groups but breaks down for ₦50,000,000+ property deals: trust does not scale, legal structure is absent, professional management does not exist, and there is no orderly exit mechanism.

NEST addresses a specific, controlled version of this problem: a **single named income-producing property in Abuja**, offered to a **defined, pre-screened group of investors**, with **complete fee disclosure, risk disclosure, and documented investor protections**. This is not a public marketplace, a mass-market financial-inclusion product, or a general investment platform. It is a controlled pilot designed to prove one complete, transparent, professionally managed property investment cycle.

---

## 2. Pilot Boundaries

| Dimension | Pilot Constraint |
|---|---|
| Geography | One property in Abuja, Nigeria only |
| Number of properties | One (1) for this pilot |
| Investor pool | Pre-screened, identified investors; no open public solicitation |
| Capital target | ₦100,000,000 |
| Existing commitments | 7 investors; ₦15,000,000 already received (real funds — not demo data) |
| Platform type | Closed, invitation-only — NOT a public marketplace |
| Demo mode | Test-mode demo only; all demo data labelled; no real investor records used as demo data |
| Regulation | **Requires Nigerian securities and property counsel confirmation before any live capital activity. See Section 8.** |

---

## 3. Target User

### Illustrative Demo Persona ("Adaeze")

> This is a composite illustrative persona for design and demo purposes only. Real investor data must not appear in repository documents.

- **Age:** 32–42, professional (civil servant, NGO officer, corporate manager)
- **Location:** Abuja (FCT)
- **Income:** ₦600,000–₦1,200,000/month
- **Savings:** ₦1,000,000–₦5,000,000 in fixed deposit or money market

**Pain Points:** Cannot access income-generating property; savings losing real value to inflation; ajo/esusu does not scale to ₦50M+ deals; does not trust unregulated fractional platforms; REITs are illiquid and opaque.

**Goals:** Earn projected 7–9% net annual yield from rent on a specific named property; invest ₦500,000–₦10,000,000; receive quarterly income; full transparency on property performance and costs; understand lock-up period and exit paths.

**What This User Is NOT:** A financial-inclusion beneficiary, a youth banking customer, a user seeking a public marketplace, or a user who has been promised guaranteed returns.

---

## 4. Functional Requirements

> **Solo-builder constraint:** Must-have features are capped at 5. The demo is built by a single developer in 3 days. Any Must-have a single developer cannot complete in 3 days is automatically deferred.

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| **FR-001** | Single Property Data Room | Illustrative test property display: name, city, illustrative valuation basis, ₦100M funding target, current funding progress, risk disclosures, fee structure (2% platform fee + up to 8% of rent management fee), lock-up terms, projected yield (7–9%, labelled projection only). Status: FUNDING → FUNDED → ACTIVE. All values from DB seed only — no hardcoded UI values. | **Must** |
| **FR-002** | Seeded Demo Roles and Server-Side Authorization | Pre-created demo accounts: ADMIN, VERIFIED investor, PENDING investor. Server enforces: PENDING → 403 on investment API; non-ADMIN → 403 on /api/admin/*; anonymous → 401 on wallet/investment/portfolio APIs. Authorization is server-side only. | **Must** |
| **FR-003** | Immutable Demo Ledger and Labelled Admin Demo Credit | Append-only ledger (BigInt kobo). Balance = SUM(POSTED ledger entries). Admin-only demo credit endpoint; credit labelled "DEMO CREDIT — NOT A PAYMENT" in ledger and UI. Idempotent: same reference cannot post twice. No self-service credit for investors. | **Must** |
| **FR-004** | Atomic Demo Investment | Two-step: (1) Summary with fee line items, ownership %, mandatory risk consent checkboxes (all required before Confirm enabled); (2) Atomic transaction: verify VERIFIED status, validate ₦500K min / ₦10M max / balance / funding capacity, debit via ledger, create investment, update fundingRaisedKobo, write AuditLog, COMMIT. Hard stop at ₦100M. Idempotent idempotencyKey. SELECT FOR UPDATE for concurrency. | **Must** |
| **FR-005** | Persisted Portfolio and Audit Trail | Wallet balance from ledger SUM. Holdings: property, amount, ownership %, status. Recent transactions (last 5–10 ledger entries). All DB-derived — zero hardcoded. Persists after reload. Admin can view all investment records and AuditLog. | **Must** |
| FR-006 | Admin Verification UI | Admin verifies pending demo user; server-side status update with AuditLog entry and notification. | Should |
| FR-007 | Admin Distribution Panel | Admin selects property+period, enters rent collected, system calculates management fee and net amount, previews pro-rata allocation, admin confirms, system credits all investor wallets via ledger entries, creates distribution record (idempotent: property+period cannot post twice). | Should |
| FR-008 | Investment Receipt / Confirmation Screen | After successful investment: receipt number, property, amount, platform fee, ownership %, date. | Should |
| FR-009 | Full Transaction History View | Paginated investor wallet transaction history, filterable by type. | Should |
| FR-010 | Document Repository (Seeded Links) | Verified-only page; seeded links to illustrative property documents (valuation summary, SPV structure diagram, illustrative title confirmation). Labelled as illustrative demo documents. | Should |
| FR-011 | Multi-Property Architecture | DB and API designed for multiple properties; single property in demo. | Could |
| FR-012 | Real Payment Gateway Integration | Paystack/Flutterwave live integration. Requires compliance review. | Won't (demo) |
| FR-013 | Real KYC | BVN/NIN, liveness checks, identity-document upload. | Won't (demo) |
| FR-014 | Secondary Market | Not offered in pilot. Must not be promised. | Won't |
| FR-015 | Wallet Withdrawal | Requires payment rails and compliance review. | Won't (demo) |
| FR-016 | Public Marketplace / Open Solicitation | Contradicts pilot boundaries. | Won't |
| FR-017 | SMS / Email Notifications | In-app notifications only for demo. | Won't (demo) |
| FR-018 | Native Mobile Apps | Web-responsive only for demo. | Won't |

---

## 5. Financial Model and Disclosures

> **IMPORTANT:** All figures are planning assumptions only. Not confirmed by independent valuer, legal counsel, or auditor. Final disclosed figures must be reviewed by Nigerian securities/property counsel before use with real investors.

### Investment Terms (Planning Defaults — Require Counsel Confirmation)

| Term | Planning Default | Status |
|---|---|---|
| Minimum ticket | ₦500,000 | **Confirmed founder decision** |
| Maximum ticket | ₦10,000,000 (or 10% of ₦100M target) | Planning default — **requires founder/counsel confirmation** |
| Funding target | ₦100,000,000 | **Confirmed founder decision** |
| Lock-up | 24 months from property acquisition completion | **Planning default — requires founder/counsel confirmation** |
| Distribution frequency | Quarterly, from actual rent collected after approved expenses and reserves | **Confirmed founder decision** |
| Projected annual yield | 7–9% net of management fee, before investor tax | **Projection only — not guaranteed — must be modelled** |

### Fee Structure (Planning Defaults — Require Counsel Confirmation)

> **Removed and prohibited:** 8% fee on AUM. On ₦100M, this = ₦8,000,000/year and can consume most rental income. Must not appear in any investor-facing document.

| Fee | Planning Default |
|---|---|
| Platform / arrangement fee | 2% of investment amount, one-time at investment, transparently disclosed |
| Property management fee | Up to 8% of rent actually collected (not % of asset value) |
| Legal / SPV costs | Actual documented costs with a disclosed pre-agreed cap — not a flat percentage |

### Return Illustration (Illustrative Only — Not a Promise)

| Investment Principal | Platform Fee (2%) | Total Wallet Debit | Ownership % | Projected Annual Dist. (7–9% of Principal) |
|---|---|---|---|---|
| ₦500,000 | ₦10,000 | ₦510,000 | 0.5% | ₦35,000–₦45,000 |
| ₦2,000,000 | ₦40,000 | ₦2,040,000 | 2.0% | ₦140,000–₦180,000 |
| ₦5,000,000 | ₦100,000 | ₦5,100,000 | 5.0% | ₦350,000–₦450,000 |
| ₦10,000,000 | ₦200,000 | ₦10,200,000 | 10.0% | ₦700,000–₦900,000 |

> Ownership % = principal ÷ ₦100,000,000. Yield projection is on the investment principal, not the post-fee amount (the platform fee goes to the platform and does not generate returns). Actual distributions depend on rent collected, vacancy, maintenance and reserve costs, management fees, legal costs, and applicable tax. **These are projections, not guaranteed returns.**

---

## 6. Investor Protections and Funds Governance

> All items below represent founder's intended protections. Precise legal form and enforceability require Nigerian securities/property counsel confirmation.

### 6.1 Funds Governance Gate

No real investor funds may be deployed toward property acquisition until ALL of the following are met:

1. SEC counsel opinion received (written, from Nigerian securities counsel)
2. SPV properly established (dedicated, ring-fenced legal entity separate from NuloAfrica operating business)
3. Investor funds transferred to dedicated SPV account (as of this document, this transfer is not confirmed — do not state it has occurred without written evidence)
4. Subscription agreements for each participating investor reviewed by counsel and containing the agreed fallback/refund terms (UI-05 — currently unconfirmed)
5. Independent property valuation completed (current, from independent valuer)
6. Full deal memo distributed and acknowledged by each investor

### 6.2 Deal Memo Requirements

Before any investor confirms or reconfirms, they must receive a full deal memo including: property address and legal description; independent valuation basis and date; full fee schedule (all as line items); SPV legal structure; projected yield range and assumptions; all material risk factors; lock-up period and exact terms; available exit paths after lock-up; fallback process if target is not reached; refund terms and timeline; subscription agreement reference.

### 6.3 Liquidity and Exit Policy

**There is no secondary market.** NEST does not offer, imply, or promise the ability to sell, transfer, or trade investment stakes.

After the 24-month lock-up, available exit paths: sale of the property (mechanism defined in SPV agreement, confirmed by counsel); refinancing/buyback if available and agreed; permitted transfer to a qualified replacement investor subject to NEST approval and legal compliance.

**"Secondary market" must not appear as a promised or planned feature in any investor communication or product document.**

### 6.4 Fallback: Funding Shortfall and Consent Process

If the ₦100,000,000 target is not raised within the agreed window, each affected investor must individually choose:
1. **Replacement property** — only after receiving its full new deal memo and providing individual written consent; OR
2. **Full refund**

**A majority investor vote or unilateral NuloAfrica/admin decision is not sufficient to substitute one property for another.** Each investor must consent individually in writing.

**Proposed refund timing:** Within 10 business days of investor's written decision, subject to executed agreement terms and counsel review.

### 6.5 Existing Investor Status (Aggregate — No Personal Data)

- 7 investors have signed EOIs and subscription agreements
- Total received: ₦15,000,000
- Funds location: NuloAfrica business account (SPV transfer required before any deployment)
- Wait time as of this document: approximately 2 months
- **These 7 investors and their funds must never be represented as demo seed data**

---

## 7. Regulatory Context

> **MANDATORY DISCLAIMER:** The following is informational context only. Nothing here constitutes legal advice, a legal opinion, a claim of SEC approval, or a claim that any exemption applies to NEST. Every item marked ⚠️ COUNSEL REQUIRED must be confirmed by a qualified Nigerian securities and property law practitioner before any live capital activity.

### Applicable Framework

Nigeria's primary capital markets law is the **Investment and Securities Act (ISA) 2025**, which replaced the ISA 2007 in March 2025. Administered by **SEC Nigeria**. Primary source: [https://www.sec.gov.ng](https://www.sec.gov.ng)

### Key Regulatory Considerations

| Issue | Context | Status |
|---|---|---|
| Collective Investment Schemes (CIS) | Schemes pooling investor funds for real estate are regulated as CIS under ISA 2025. Registration may be required. | ⚠️ COUNSEL REQUIRED |
| Real Estate Investment Schemes (REIS) | SEC has specific rules for REIS. No blanket private-placement exemption for pooled real estate schemes. | ⚠️ COUNSEL REQUIRED |
| SPV structure | A properly structured SPV does not by itself resolve SEC registration requirements. | ⚠️ COUNSEL REQUIRED |
| ISA 2025 expanded definitions | Fractional property interests may constitute "securities" or "investment contracts" under the expanded ISA 2025 definitions. | ⚠️ COUNSEL REQUIRED |
| Crowdfunding Rules 2021 | If NEST facilitates securities offerings via platform, it may require SEC registration as a crowdfunding intermediary. | ⚠️ COUNSEL REQUIRED |
| No SEC approval claimed | NEST does not claim SEC registration or approval. Demo is test-mode only. | Non-negotiable |

### Pre-Live Requirements

1. Retain Nigerian securities/property counsel
2. Obtain written legal opinion on CIS classification, registration pathway, and required investor protections under ISA 2025
3. Counsel sign-off on subscription agreement and deal memo templates
4. Confirm SPV formation, KYC/AML compliance plan, funds governance structure
5. Engage real KYC provider
6. Establish dedicated SPV bank account
7. Confirm regulatory status of any planned exit mechanism

---

## 8. Founder Decisions Log

**Date:** September 16, 2026 — supersedes all prior drafts.

| # | Decision | Value | Applies To |
|---|---|---|---|
| 1 | Minimum ticket | ₦500,000 | FR-004, all financial illustrations |
| 2 | Maximum ticket | ₦10,000,000 (or 10% of target) — planning default; requires founder/counsel confirmation | FR-004, all financial illustrations |
| 3 | Funding target | ₦100,000,000 | FR-001, all financial models |
| 4 | Platform/arrangement fee | 2% one-time at investment | FR-003, FR-004, Section 5 |
| 5 | Management fee | Up to 8% of rent collected (not AUM) | Section 5 |
| 6 | 8% AUM fee | REMOVED — must not appear anywhere | All documents |
| 7 | Lock-up period | 24 months from acquisition completion — planning default; requires founder/counsel confirmation | FR-001, Section 6.3 |
| 8 | Distribution frequency | Quarterly from actual rent collected | FR-007, Section 5 |
| 9 | Secondary market | Not offered — must not be promised | Section 6.3, FR-014 |
| 10 | Real investor data as demo seed | Forbidden | COMPETITION_DEMO_DATA.md |
| 11 | Yield projection | 7–9%/year, projection only, not guaranteed | Section 5 |
| 12 | Demo wallet credit method | Admin-only; labelled DEMO CREDIT — NOT A PAYMENT | FR-003 |
| 13 | Oversubscription | Hard stop at ₦100M; SELECT FOR UPDATE for concurrency | FR-004 |
| 14 | Investment confirmation | Two-step: risk/fee summary with mandatory consent checkboxes → Confirm | FR-004 |
| 15 | Refund timing | Within 10 business days of investor decision (planning default — requires counsel confirmation of executability) | Section 6.4 |
| 16 | Fallback process | Each investor chooses individually — no majority vote | Section 6.4 |
| 17 | Funds governance gate | SPV transfer required before any deployment | Section 6.1 |

---

## 9. Unclear or Missing Information (Open Items — Do Not Assume)

| # | Item | Blocking What | Owner |
|---|---|---|---|
| UI-01 | What exactly was promised to the 7 investors (return %, timeline, specific property)? | Investor communication; retention test | Founder |
| UI-02 | Has ₦15M been transferred to a dedicated SPV account? | Section 6.1 gate | Founder |
| UI-03 | SEC counsel opinion — retained? Received? | All live capital activity | Founder / Counsel |
| UI-04 | Independent property valuation — commissioned? Received? | Deal memo, FR-001 data | Founder |
| UI-05 | Subscription agreements: have signed agreements been reviewed by counsel and do they include the agreed fallback and refund terms? | Investor protections; fallback process enforceability | Founder / Counsel |
| UI-06 | What is the fundraising window deadline before fallback triggers? | Section 6.4 process | Founder |
| UI-07 | PropFlow integration scope and timeline (currently 6-month estimate, unconfirmed) | Post-acquisition management | Founder / Technical |
| UI-08 | Real KYC vendor — selected? Integrated? | Live investor onboarding | Founder / Technical |
| UI-09 | Is 7–9% yield projection supported by a detailed model after all costs, reserves, vacancy, tax, and fees? | Financial disclosures | Founder / Advisor |
| UI-10 | Why would target investors choose NEST's 7–9% over 18–20% T-bill yield? | Investor pitch credibility | Founder |

---

## 10. Out of Scope for Demo Build

| Item | Reason |
|---|---|
| Live payments | Requires compliance review and production credentials |
| Real KYC / BVN / NIN | Requires licensed KYC provider |
| Wallet withdrawal | Requires payment rails and compliance |
| Secondary market | Not offered in pilot; must not be promised |
| Public marketplace / open solicitation | Contradicts pilot boundaries |
| SMS / email notifications | Not a demo blocker |
| Native mobile apps | Web-responsive sufficient |
| Cryptocurrency | Contradicts naira pilot |
| Live PropFlow integration | 6-month post-pilot project |
| PDF certificate generation | Post-demo |
| Automated rent collection and distribution | Post-acquisition |

---

## 11. Non-Functional Requirements

- **Mobile-first:** 360px viewport primary; 44px minimum touch targets; no horizontal scroll
- **Performance:** < 3s page load on 3G; < 2s investment transaction; < 100ms DB queries
- **Security:** Server-side auth/authorization; idempotency keys; AuditLog; no PII in logs
- **Reliability:** Atomic transactions; ledger invariant enforced; oversubscription impossible
- **Test-mode labels:** "TEST MODE — NOT A LIVE OFFERING OR PAYMENT" visible on all money screens

---

**Document Status:** Active — Canonical Source of Truth
**Next Action Required:** Founder to resolve UI-01 through UI-10 before investor communication or live capital activity
**Last Updated:** September 16, 2026

