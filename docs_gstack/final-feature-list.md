# NEST by Nulo Africa — Final Feature List (MoSCoW)

**Version:** 2.1
**Date:** September 17, 2026
**Status:** Updated — Solo-Builder Demo Scope
**Supersedes:** final-feature-list.md v1.0 (September 15, 2026)
**Source of Truth:** This document aligns with `docs_gstack/requirements.md` v2.0.

> **IMPORTANT: This document is not labelled "Final and Approved."** The Must-have list is approved for a solo-builder, 3-day, test-mode demo only. Feature scope must be reviewed and re-approved before any live pilot build begins.

---

## Demo Context

- **Build scope:** Test-mode competition demo only
- **Builder:** Solo developer (one person)
- **Timeline:** 3 working days (~24 hours of development time)
- **Goal:** Prove the core investment cycle end-to-end on seeded demo data
- **NOT:** A live investment platform, a regulated offering, or a production system

---

## Must-Have Features (5 — Capped for Solo Builder)

> Without all 5, the demo is broken or the core investment story cannot be shown.

| Feature | Description | MoSCoW | Reason | FR Ref |
|---|---|---|---|---|
| **Single Property Data Room (Demo)** | Display illustrative test property with ₦100M target, funding progress, risk disclosures, all fees (2% platform + up to 8% of rent management), projected yield (7–9%, labelled projection only), and lock-up terms. All values from DB seed — no hardcoded UI values. Status: FUNDING/FUNDED/ACTIVE. | **Must** | Without this, there is nothing to invest in. The property display is the core trust proposition. | FR-001 |
| **Seeded Demo Roles + Server-Side Authorization** | Pre-created ADMIN, VERIFIED, and PENDING demo accounts. Server enforces: PENDING → 403 on /api/investments; non-ADMIN → 403 on /api/admin/*; anonymous → 401 on wallet/portfolio. Authorization is server-side only — never trust client-provided role or KYC state. | **Must** | Without proper authorization, the demo cannot prove that controls are real and non-bypassable. | FR-002 |
| **Immutable Demo Ledger + Admin Demo Credit** | Append-only ledger in BigInt kobo. Wallet balance = SUM(POSTED entries). Admin-only endpoint to credit a demo wallet, labelled "DEMO CREDIT — NOT A PAYMENT" in both the ledger record and the UI. Idempotent: same reference cannot post twice. | **Must** | Without a working ledger, the investment flow has no money integrity. Demo credit is the only way to fund the demo wallet in the absence of live payment rails. | FR-003 |
| **Atomic Demo Investment** | Two-step: (1) Fee/ownership summary + risk consent checkboxes (all mandatory before Confirm enabled); (2) Atomic transaction: verify status, validate ₦500K min/₦10M max/balance/capacity, debit via ledger, create investment record, update property fundingRaisedKobo, write AuditLog, COMMIT. Hard stop at ₦100M; SELECT FOR UPDATE for concurrency; idempotent idempotencyKey. | **Must** | Without this, the demo cannot show an investor actually acquiring a fractional stake. This is the product's core value action. | FR-004 |
| **Persisted Portfolio + Audit Trail** | Portfolio: wallet balance (from ledger SUM), confirmed holdings (property, amount, ownership %, status), recent transactions (5–10 entries). All DB-derived — zero hardcoded values. Survives page reload. Admin can view investment records and AuditLog. | **Must** | Without portfolio persistence, the demo cannot prove data integrity. A judge reloading the page must see the same numbers. | FR-005 |

**Must-Have Count: 5** — within the solo-builder cap.

---

## Should-Have Features (Implement If Core Is Complete)

These are important to a compelling demo but the core story works without them. Implement in this priority order only after all 5 Must-haves are passing and tested.

| Feature | Description | MoSCoW | Priority | Estimated Time | FR Ref |
|---|---|---|---|---|---|
| **Admin Distribution Panel** | Admin enters rent collected for a period; system calculates management fee (up to 8% of rent), previews pro-rata allocation per investor (unfunded portion held in reserve); admin confirms; system credits all investor wallets atomically; idempotent (property+period cannot post twice). | **Should** | 1st (shows full income cycle — highest demo value) | 4–5 hours | FR-007 |
| **Full Transaction History View** | Paginated full transaction history for investor wallet, filterable by type and with pagination. | **Should** | 2nd (portfolio recent-transactions view covers the core use case; this adds pagination) | 3–4 hours | FR-009 |

---

## Could-Have Features (Only If Significantly Ahead of Schedule)

| Feature | Description | MoSCoW | Reason |
|---|---|---|---|
| Document Repository (Seeded Links) | Verified-only page with seeded links to illustrative documents (valuation summary, SPV structure diagram). Labelled illustrative. | **Could** | Adds trust credibility in demo but is not testable functionality. |
| Multi-Property Architecture | DB/API supports multiple properties; single property shown. | **Could** | Forward-compatibility; not demo-visible. |

---

## Won't-Have (This Demo Build — Explicitly Out of Scope)

| Feature | MoSCoW | Reason |
|---|---|---|
| Real Payment Gateway (Paystack/Flutterwave live mode) | **Won't** | Requires compliance review, real KYC, production credentials. |
| Real KYC (BVN/NIN, liveness, identity documents) | **Won't** | Requires licensed KYC provider. Demo uses admin-controlled verification state. |
| Secondary Market / Share Trading | **Won't** | Not offered in pilot. Must not be promised. See requirements.md Section 6.3. |
| Wallet Withdrawal | **Won't** | Requires payment rails and compliance review. |
| Public Marketplace / Open Solicitation | **Won't** | Contradicts closed pilot boundaries. |
| SMS / Email Notifications | **Won't** | Not a demo blocker. In-app notifications only if time allows. |
| Native Mobile Apps | **Won't** | Web-responsive sufficient for demo. |
| Cryptocurrency Integration | **Won't** | Contradicts naira-based pilot. |
| Live PropFlow Integration | **Won't** | 6-month post-pilot project. |
| Automated Rent Collection and Distribution | **Won't** | Post-acquisition; PropFlow integration. |
| PDF Certificates | **Won't** | Post-demo. |
| Property CRUD / Developer CRUD | **Won't** | Seeded data only for demo. |
| Referral Program | **Won't** | Growth feature; no open acquisition in pilot. |
| Advanced Analytics / Charts | **Won't** | Insufficient data for meaningful charts in demo. |

---

## Cut Order (If Behind Schedule)

If development is running late, cut in this exact order (cut from the bottom up):

1. **Cut first:** Full Transaction History View (FR-009) — portfolio recent-transactions covers the core
2. **Cut second:** Investment Confirmation Screen (FR-008) — redirect to portfolio with toast is acceptable
3. **Cut third:** Admin Verification UI (FR-006) — admin can verify via API call or DB update for demo
4. **Cut last:** Admin Distribution Panel (FR-007) — significant demo value; only cut if Must-haves are at risk

**Never cut any of the 5 Must-have features.** Without all 5, the demo is broken.

---

## Solo-Builder Estimated Hours (6-Screen Scope)

Hour estimates are grouped by backend service (shared across screens) and screen UI.

### Backend Services (Shared)

| Service | Estimated Hours | Notes |
|---|---|---|
| Postgres migration + BigInt fields + seed script | 3–4 h | Foundation for everything; reuses existing schema |
| Authorization middleware (requireAuth, requireVerified, requireAdmin) | 2–3 h | Includes Clerk integration |
| Ledger service (credit, debit, balance, idempotency) | 3–4 h | Core money integrity |
| Investment service (atomic transaction) | 4–5 h | Most complex; includes concurrency/idempotency |
| **Backend total** | **12–16 h** | |

### Screen UI (6 Screens)

| Screen | Estimated Hours | Notes |
|---|---|---|
| Screen 1: Property Data Room | 3–4 h | DB-backed display; no write operations |
| Screen 2: Wallet + Verification Status | 2–3 h | Read-only; inline verification state |
| Screen 3: Investment (combined amount + review + consent) | 4–5 h | Highest complexity — live calculation + checkboxes + POST |
| Screen 4: Portfolio | 3–4 h | Read-only; DB-derived |
| Screen 5: Admin Panel (combined) | 3–4 h | User mgmt + demo credit + investment viewer in one page |
| Screen 6: Admin Distribution (Should-have) | 4–5 h | Only if Screens 1–5 are complete before end of Day 2 |
| **Screen total (Must-have: 1–5)** | **15–20 h** | |
| **Screen total (Should-have: 6)** | **4–5 h** | |

### Combined Estimate

| Scope | Total Hours | Fits 24h? |
|---|---|---|
| Backend + Screens 1–5 (Must-have) | ~22–28 h | Tight but achievable with minimal CSS polish |
| + Screen 6 (Should-have) | ~26–33 h | Only if Must-haves are done by end of Day 2 |

**Solo-builder capacity (3 days × 8 hours/day):** ~24 effective development hours

> The scope is now achievable for a single developer if: (a) the backend services are built first (Day 1) and screens are wired to them quickly (Day 2), (b) CSS polish is deferred until the golden path works, and (c) Admin Panel (Screen 5) is simplified to API-call verification if time is short (saves 2–3 h).

---

**Document Status:** Approved for Solo-Builder Demo Scope
**Source of Truth:** Requirements.md v2.0
**Last Updated:** September 16, 2026

