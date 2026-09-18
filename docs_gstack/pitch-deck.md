# NEST by Nulo Africa â€” Pitch Deck

**Fractional Real Estate Investment for Nigeria's Missing Middle**

---

## Slide 1: The Problem

- Middle-income professionals in Nigeria (earning â‚¦500Kâ€“â‚¦1M/month) cannot access quality income-producing real estate â€” entry prices for Abuja residential property are â‚¦50Mâ€“â‚¦150M
- Their savings lose 10â€“15% real purchasing power per year in fixed deposits while inflation runs at 25â€“30%
- Informal pooling (ajo/esusu) works for small groups but breaks down at â‚¦50M+ property deals: trust does not scale, legal structure is absent, and there is no exit mechanism

---

## Slide 2: The Solution

- **NEST** enables a defined group of pre-screened investors to co-own a single, named, income-producing Abuja property â€” starting from â‚¦500,000
- Every fee is disclosed as a line item before investment. Every risk factor is shown. Projected yield (7â€“9%) is labelled "PROJECTION ONLY â€” NOT GUARANTEED"
- The platform enforces: server-side authorization (not UI-only), atomic transactions with an immutable BigInt kobo ledger, mandatory 6-checkbox risk consent, and a hard stop at the â‚¦100M funding target

---

## Slide 3: Live Demo (What You'll See)

- **Property Data Room** â€” â‚¦100M target, funding progress bar, all fees as line items, risk disclosures, yield labelled PROJECTION ONLY, TEST MODE banner
- **Authorization block** â€” A pending (unverified) investor clicks "Invest" and gets a server-side 403 rejection: "Control is real, not cosmetic"
- **Investment flow** â€” Verified investor enters â‚¦2M â†’ system shows: â‚¦40K fee, â‚¦2.04M total debit, 2.0% ownership, â‚¦140Kâ€“â‚¦180K/yr projected yield â†’ checks 6 consent boxes â†’ Confirm unlocks â†’ investment posts atomically
- **Persistence proof** â€” Page reload: portfolio still shows the â‚¦2M investment, wallet balance matches ledger SUM (not hardcoded)
- **Admin distribution** (if time permits) â€” Admin enters â‚¦1.2M rent collected â†’ system deducts 8% management fee â†’ allocates pro-rata to funded positions â†’ investor wallet credited

---

## Slide 4: Market Size

- **Target segment:** Nigerian professionals earning â‚¦500Kâ€“â‚¦1M/month with â‚¦1Mâ€“â‚¦5M in liquid savings who cannot access â‚¦50Mâ€“â‚¦150M property entry prices
- **Pilot scope:** One named Abuja residential property, â‚¦100M funding target, invitation-only â€” this is a controlled pilot, not a public marketplace
- **âš  Unknown / not yet quantified:** Total addressable market size, serviceable market, and market growth rate are not defined in current documentation â€” these figures require independent research before investor presentation

---

## Slide 5: Business Model

- **Platform / arrangement fee:** 2% of investment principal, one-time at investment (e.g. â‚¦2M investment = â‚¦40K fee)
- **Property management fee:** Up to 8% of rent actually collected (not % of asset value) â€” deducted before quarterly distributions
- **Legal / SPV costs:** Actual documented costs with a disclosed pre-agreed cap â€” passed through, not a margin item
- Revenue scales with (a) total capital deployed across properties and (b) rent collected â€” both are real, auditable numbers

---

## Slide 6: Traction

- 7 investors have signed Expressions of Interest and subscription agreements
- â‚¦15,000,000 total received (held in NuloAfrica business account; SPV transfer required before deployment)
- Minimum confirmed ticket: â‚¦500,000 â€” validates demand at the target entry point
- **âš  No user-test-notes.md file exists in documentation.** If user testing has been conducted, results should be documented and added here before the pitch

---

## Slide 7: What's Next (Roadmap)

- **Immediate (pre-live):** SEC counsel opinion, SPV formation, dedicated SPV bank account, independent property valuation, KYC provider engagement, subscription agreement counsel review
- **Post-demo:** Real payment integration (Paystack/Flutterwave), BVN/NIN KYC verification, deal memo distribution to all investors, full audit trail and PDF receipts
- **6+ months:** PropFlow integration for automated rent collection and property management, multi-property architecture, AI-assisted KYC and investor deal-room assistant (after regulatory clearance)

---

## Slide 8: The Ask

- **Feedback:** Is the controlled-pilot approach (one property, invitation-only, full disclosure) the right entry strategy for Nigerian fractional real estate?
- **Pilot users:** Introductions to qualified Nigerian professionals who fit the â‚¦500Kâ€“â‚¦5M savings profile and want transparent, professionally managed property exposure
- **Advisory:** Connections to Nigerian securities/property counsel experienced with ISA 2025, CIS classification, and REIS rules
- **Funding:** Seed capital to cover: legal/regulatory costs, real KYC integration, dedicated SPV setup, and first property acquisition gap funding

---

## Source Files

This pitch deck was generated from the following documentation (all in `docs_gstack/`):

| File | Used For |
|---|---|
| `requirements.md` | Problem, solution, market, fees, traction, regulatory, roadmap |
| `user-flow.md` | Live demo flow description |
| `screen-specification.md` | Screen count and demo scope |
| `final-feature-list.md` | Feature prioritisation and build scope |
| `COMPETITION_DEMO_DATA.md` | Demo script and accounting examples |
| `user-test-notes.md` | **âš  FILE MISSING â€” no user test data available** |
| `business-model.md` | **âš  FILE MISSING â€” revenue model extracted from requirements.md Section 5** |
| `landing-page.md` | **âš  FILE MISSING â€” not referenced in pitch** |

**Generated:** September 17, 2026