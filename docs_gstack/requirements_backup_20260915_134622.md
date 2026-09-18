# NEST - Product Requirements Document
**Version:** 1.0  
**Date:** September 15, 2026  
**Status:** Draft  
**Owner:** NEST Team / NuloAfrica

---

## 1. Problem Statement

Middle-income professionals in Nigeria (30-45 years old, earning ₦500K-₦1M monthly with ₦1M-₦5M in savings) are locked out of income-generating real estate investments due to prohibitive ₦50M+ entry costs. Their savings erode to inflation (25-30% annually) in traditional bank deposits while informal pooling mechanisms like ajo/esusu—which work for small savings groups—break down at the scale required for real estate transactions due to lack of legal structure, professional property management, and exit mechanisms. Existing alternatives (REITs are illiquid and opaque, Treasury Bills offer comparable returns without property upside, solo purchases require 30x their available capital) fail to provide accessible, transparent, professionally managed fractional ownership of specific income-producing properties that can preserve wealth and generate regular returns.

---

## 2. Target User

### Primary User Persona: Lucia Omonokhua

**Demographics:**
- **Age:** 34 years old
- **Occupation:** NGO Program Officer
- **Location:** Wuse 2, Abuja (middle-class neighborhood)
- **Income:** ₦850,000/month (~₦10.2M annually)
- **Savings:** ₦2.1M in fixed deposit (losing 10-15% real value to inflation annually)
- **Education:** University graduate, financially literate

**Behavioral Characteristics:**
- Already participates in ajo/esusu with 5-10 trusted friends for rotating savings
- Understands basic investment concepts (returns, risk, diversification)
- Comfortable with digital banking and mobile money
- Risk-aware but willing to take calculated risks for better returns
- Values transparency and professional management over DIY solutions

**Pain Points:**
- Can't access income-generating real estate (₦50M+ minimum entry)
- Savings losing real value to inflation every month (negative real returns)
- Ajo/esusu doesn't scale to ₦50M property investments (trust breakdown, no legal protection)
- Doesn't trust unregulated fractional platforms (fraud concerns)
- REITs too illiquid and opaque (can't choose specific properties)
- Doesn't want the burden of solo property management

**Goals:**
- Earn 12-18% annual returns (beat inflation + meaningful real return)
- Invest in tangible, income-producing assets (real estate)
- Start with ₦500K-₦3M (what she has available now)
- Receive regular rental income (quarterly distributions)
- Know exactly which property she owns a share of (transparency)
- Have professional property management (hands-off)
- Exit investment after lock-up period if needed (liquidity path)

**Success Criteria:**
- Can invest ₦500K-₦2M in a specific property within 30 days
- Receives first rental income within 90 days of investment
- Has full transparency on property performance (occupancy, rent collection, expenses)
- Can track her portfolio value and income in real-time
- Feels confident the investment is legally protected and professionally managed

---

## 3. Functional Requirements

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| **FR-001** | User Registration & KYC | User creates account with email/phone, completes admin-controlled verification (demo mode initially, real KYC post-MVP) | **Must** |
| **FR-002** | Single Property Data Room | Display comprehensive property details: title, location, valuation basis, funding target, current funding status, risk disclosures, fee structure, lock-up terms. Property status: FUNDING (shows progress, invest button) → ACTIVE (shows occupancy, rent collection, performance data after 100% funded). [Founder decision] | **Must** |
| **FR-003** | Demo Wallet Funding | Admin can credit user wallets with demo funds (clearly labeled "TEST MODE" / "DEMO CREDIT - NOT A PAYMENT") for testing investment flow. Admin-only credits, no self-service demo button for MVP. [Founder decision] | **Must** |
| **FR-004** | Investment Execution | User can invest from wallet balance into active property with validation checks (verified status, min ₦1.5M / max ₦10M limits, sufficient balance, funding capacity). Hard stop at 100% funding (no oversubscription). Two-step confirmation flow: investment summary with risk/fee disclosure → confirm button. Atomic transaction (debit wallet → create investment → update funding → audit log). [Founder decision] | **Must** |
| **FR-005** | Immutable Ledger | All money movements recorded in append-only ledger using kobo (BigInt), balance calculated as signed sum of entries, replay protection via unique references | **Must** |
| **FR-006** | Portfolio Dashboard | User views confirmed holdings (property name, investment amount, ownership %, current value) and wallet balance from real database records (no hardcoded values). No withdrawal functionality in MVP. [Founder decision] | **Must** |
| **FR-007** | Transaction History | User views complete wallet transaction history (credits, debits, distributions) with timestamps, amounts, and transaction types. Withdrawal transactions not supported in MVP. [Founder decision] | **Must** |
| **FR-008** | Admin Verification | Admin can manually verify/unverify user accounts, controlling access to investment features (pending users get 403 on invest endpoints) | **Must** |
| **FR-009** | Admin Distribution | Admin initiates rental distributions (select property, quarterly period, total amount), system calculates pro-rata allocation with exact rounding, credits investor wallets, creates notifications. Distribution frequency: Quarterly. [Founder decision] | **Must** |
| **FR-010** | Investment Notifications | Users receive notifications for: wallet credits, investment confirmations, distribution receipts (stored in database, UI display optional) | **Must** |
| **FR-011** | Risk Disclosures | Clear risk warnings displayed before investment confirmation (property depreciation, vacancy, market risk, liquidity constraints) | **Must** |
| **FR-012** | Fee Transparency | Display all fees upfront: management fee (2-5%), platform fee, legal fees, with calculations shown in investment flow | **Must** |
| **FR-013** | Mobile-First UI | All investor-facing screens fully functional at 360px viewport (primary target), responsive up to desktop (1280px+) | **Must** |
| **FR-014** | Authorization & RBAC | Role-based access control (admin, verified investor, pending investor) with proper 401/403 responses, server-authoritative checks on all sensitive operations | **Must** |
| **FR-015** | Concurrency Protection | Investment endpoint prevents oversubscription (concurrent requests for last available shares handled safely with proper locking). Hard stop at 100% funding - no oversubscription allowed. [Founder decision] | **Must** |
| **FR-016** | Idempotent Mutations | Critical operations (wallet credit, investment, distribution) support idempotency keys to prevent duplicate execution on retry | **Must** |
| FR-017 | Property Performance Tracking | Track and display property-level metrics (occupancy rate, rent collection rate, maintenance costs, net yield) for admin and investors | Should |
| FR-018 | Investment Receipts | Generate investment confirmation with details (property, amount, shares, date, receipt number) viewable and downloadable | Should |
| FR-019 | Multi-Property Support | Platform architecture supports multiple active properties (single property for MVP, but designed for scale) | Should |
| FR-020 | Investor Communication | In-app messaging or notification system for property updates, maintenance notices, distribution announcements | Should |
| FR-021 | Document Repository | Secure storage for property documents (title, valuation, legal opinions, tenant agreements) accessible to verified investors only | Should |
| FR-022 | Payment Gateway Integration | Real payment processing via Paystack/Flutterwave for live wallet funding (demo credit only in MVP) | Could |
| FR-023 | Secondary Market | Investor-to-investor share trading after lock-up period with admin approval and transaction fees | Could |
| FR-024 | Automated Reports | Monthly/quarterly investor reports generated automatically (portfolio summary, income received, property performance) | Could |
| FR-025 | Property Voting | Investors vote on major property decisions (major repairs, tenant selection, sale) weighted by ownership percentage | Could |
| FR-026 | Referral System | Investors earn credits or fee discounts for referring new investors who complete investments | Could |
| FR-027 | Advanced Analytics | Investor dashboard with charts (portfolio growth over time, yield comparison, property appreciation) | Could |
| FR-028 | Mobile Apps | Native iOS/Android apps (MVP is mobile-responsive web only) | Won't |
| FR-029 | Cryptocurrency Integration | Crypto wallet funding or property tokenization on blockchain | Won't |
| FR-030 | International Properties | Properties outside Nigeria (Lagos/Abuja only for MVP) | Won't |
| FR-031 | Loan Products | Leverage/margin for investments or loans against property holdings | Won't |
| FR-032 | Public Marketplace | Open investor acquisition via public marketing (controlled pilot with existing waitlist only) | Won't |

---

## 3A. Founder Decisions Log

**Date:** September 15, 2026

The following decisions were made to resolve blocking ambiguities in Must-have functional requirements:

| # | Question | Decision | Applies to |
|---|----------|----------|------------|
| 1 | Investment amount limits | Min: ₦1,500,000 / Max: ₦10,000,000 per investor | FR-004 (Investment Execution) |
| 2 | Oversubscription when property reaches 100% funding | Hard stop at 100% - no additional investments accepted | FR-004, FR-015 (Investment Execution, Concurrency Protection) |
| 3 | Demo wallet funding method | Admin-only credits (no self-service demo button) | FR-003 (Demo Wallet Funding) |
| 4 | Rental distribution frequency | Quarterly (every 3 months) | FR-009 (Admin Distribution) |
| 5 | Wallet withdrawal functionality | Not allowed in MVP - wallet balance can only invest in properties | FR-006, FR-007 (Portfolio Dashboard, Transaction History) |
| 6 | Property status after full funding | Status changes to ACTIVE (shows occupancy, rent collection, performance) | FR-002 (Single Property Data Room) |
| 7 | Investment confirmation flow | Two-step: Summary with risk/fee disclosure → Confirm button | FR-004, FR-011 (Investment Execution, Risk Disclosures) |

---

## 4. User Stories

### Investor User Stories

**Authentication & Onboarding**
- As a **new investor**, I want to create an account with my email and phone number, so that I can start the investment process
- As a **pending investor**, I want to see my verification status, so that I understand why I can't invest yet
- As a **verified investor**, I want confirmation of my verified status, so that I know I have full access to investment features

**Property Discovery & Research**
- As a **verified investor**, I want to view detailed information about a specific property, so that I can make an informed investment decision
- As a **verified investor**, I want to see the property's location, valuation basis, and rental yield expectations, so that I can assess if it matches my investment goals
- As a **verified investor**, I want to understand all risks (depreciation, vacancy, market changes), so that I can evaluate worst-case scenarios
- As a **verified investor**, I want to see all fees upfront (management, platform, legal), so that I know my net expected returns

**Wallet & Funding**
- As a **verified investor**, I want to view my wallet balance in real-time, so that I know how much I have available to invest
- As a **verified investor** (demo mode), I want to receive demo credits from admin, so that I can test the investment flow without real money
- As a **verified investor**, I want to see my complete transaction history, so that I can audit all money movements

**Investment Execution**
- As a **verified investor**, I want to invest a specific amount (₦500K-₦3M) from my wallet into a property, so that I can own a fractional share
- As a **verified investor**, I want to see my ownership percentage calculated immediately, so that I understand my stake
- As a **verified investor**, I want to receive an investment confirmation, so that I have proof of my purchase
- As a **verified investor**, I want the investment to fail clearly if I don't have sufficient balance, so that I don't have failed transactions in an inconsistent state

**Portfolio Management**
- As a **verified investor**, I want to view all my property holdings in one place, so that I can track my full portfolio
- As a **verified investor**, I want to see each property's current value and my ownership stake, so that I can monitor my investment performance
- As a **verified investor**, I want my portfolio to reflect actual database records (not mock data), so that I trust the numbers are real

**Income & Distributions**
- As a **verified investor**, I want to receive rental income distributions automatically, so that I earn passive income without manual work
- As a **verified investor**, I want to see exactly how much income each property generated and my pro-rata share, so that I can verify the distribution is fair
- As a **verified investor**, I want distributions to credit my wallet automatically, so that I can reinvest or accumulate funds

**Transparency & Trust**
- As a **verified investor**, I want to see property performance metrics (occupancy, rent collected, expenses), so that I can verify the property is managed well
- As a **verified investor**, I want access to legal documents (title, valuation, SPV structure), so that I can verify my investment is legally protected
- As a **verified investor**, I want all money movements to be auditable, so that I can trust no funds are mishandled

### Admin User Stories

**User Management**
- As an **admin**, I want to manually verify investor accounts after reviewing KYC documents, so that only legitimate investors can invest
- As an **admin**, I want to see all pending verification requests, so that I can process them efficiently
- As an **admin**, I want to unverify a user if I discover issues, so that I can prevent fraudulent activity

**Property Management**
- As an **admin**, I want to create new property listings with full details, so that investors can discover and invest in them
- As an **admin**, I want to update property funding status in real-time, so that investors see accurate availability
- As an **admin**, I want to close a property to new investments when fully funded, so that we don't oversubscribe

**Wallet Operations**
- As an **admin**, I want to credit investor wallets with demo funds (clearly labeled), so that they can test the investment flow in demo mode
- As an **admin**, I want replay protection on wallet credits, so that duplicate requests don't create double credits
- As an **admin**, I want to see all wallet operations across all users, so that I can audit the ledger

**Distribution Management**
- As an **admin**, I want to initiate rental distributions for a specific property and period, so that investors receive their income
- As an **admin**, I want the system to calculate pro-rata allocations automatically, so that I don't make manual calculation errors
- As an **admin**, I want to see distribution history for all properties, so that I can verify all investors were paid correctly

**Monitoring & Reporting**
- As an **admin**, I want to see all active investments across all properties, so that I can monitor total capital deployed
- As an **admin**, I want to track investor activity (signups, verifications, investments), so that I can measure platform growth
- As an **admin**, I want to generate audit reports on all money movements, so that I can ensure regulatory compliance

---

## 5. Out of Scope (Won't Build in This Release)

### Explicitly NOT Included in MVP:

**Financial Operations:**
- Real payment processing (live Paystack/Flutterwave integration) - demo wallet credit only
- Withdrawal functionality or refund processing (wallet balance can only be used to invest in properties)
- Self-service demo wallet funding (admin-only credits for MVP)
- Oversubscription beyond 100% property funding (hard stop at full property value)
- Live payout rails to bank accounts
- Real KYC/BVN/NIN verification (admin manual verification only)
- Loan products, leverage, or margin investing
- Investment in anything other than real estate (stocks, bonds, crypto)

**Platform Features:**
- Multiple concurrent property listings (single property data room only)
- Secondary market for investor-to-investor share trading
- Public investor acquisition or open marketing
- Automated investor onboarding without admin approval
- PDF certificate generation or legal document execution
- Automated property performance tracking (manual admin input)
- Native mobile apps (mobile-responsive web only)

**Property Management:**
- Tenant management features (handled by existing PropFlow system separately)
- Property maintenance ticketing or work orders
- Rental collection automation for landlords
- Property listing/discovery marketplace
- Verified developer badges or ratings
- Properties outside Lagos/Abuja

**Advanced Features:**
- Investor voting on property decisions
- Automated monthly/quarterly reports
- Referral or rewards programs
- Advanced analytics dashboards with charts
- Social features or community forums
- In-app chat or messaging
- Push notifications (email/SMS notifications only)

**Technical Infrastructure:**
- Blockchain integration or tokenization
- Cryptocurrency wallet support
- International payment methods
- Multi-currency support (₦ Naira only)
- Open API for third-party integrations
- White-label or multi-tenant support

**Regulatory/Legal:**
- SEC registration (legal opinion in progress, not blocking MVP)
- Automated legal document generation
- Digital signature collection for subscription agreements
- Automated tax reporting (1099/tax documents)
- Investor accreditation verification

### Why These Are Out of Scope:

1. **MVP Timeline:** 3-day competition sprint (Sept 15-19) requires ruthless prioritization
2. **Validation First:** Prove core model works before scaling features
3. **Controlled Pilot:** Working with 7 existing investors (₦15M already collected), not open marketplace
4. **Demo Mode:** Competition demo focuses on proving technical infrastructure and operational trust, not live money handling
5. **Regulatory Safety:** Avoid unregulated securities offering by keeping it controlled and admin-gated

### Post-MVP Roadmap (Not in This Build):

**Phase 2 (Post-Competition, Pre-Live-Money):**
- Real KYC integration
- Live payment gateway
- Multiple property support
- Document repository
- Investor communication system

**Phase 3 (Live Operations):**
- Withdrawal functionality
- Automated property performance tracking
- Secondary market foundation
- Advanced investor reporting

**Phase 4 (Scale):**
- Native mobile apps
- Public marketplace
- Referral programs
- Advanced analytics

---

## 6. Success Metrics

### Technical Success (Competition Demo - Sept 19)
- ✅ E2E test passes twice from clean database seed
- ✅ Golden path (signup → verify → fund wallet → invest → receive distribution) completes successfully
- ✅ All investor screens functional at 360px viewport
- ✅ Permission matrix (401/403) works correctly (pending user can't invest, admin can access admin routes)
- ✅ Money integrity: ledger sum = wallet balances (zero mismatches)
- ✅ Concurrency test: concurrent investment requests don't oversubscribe property
- ✅ All money screens labeled "TEST MODE" or "SANDBOX"

### Business Validation (Post-Competition - Sept 23)
- **Retention Test:** Send full investment memo to 7 existing investors (₦15M already paid)
  - Property details, valuation, fees, yield, risks, lock-up, legal structure
  - 72-hour reconfirm/withdraw window
  - **Success metric:** 5+ of 7 stay after full disclosure
  - **Acceptable:** 3-4 stay
  - **Failure:** 0-2 stay (fundamental problem with offer)

### Operational Success (If Proceeding Post-Validation)
- Property closed within 45 days of investor reconfirmation
- First rental distribution within 90 days
- Zero wallet discrepancies or money integrity issues
- Zero investor complaints about transparency or access to information
- Admin can process distribution in < 30 minutes

---

## 7. Constraints & Dependencies

### Technical Constraints
- **Database:** Postgres required (not SQLite) for BigInt kobo support and transaction isolation
- **Money Representation:** All currency in kobo (BigInt), never floating point
- **Mobile-First:** 360px viewport is primary design target
- **Authorization:** Server-side only, never trust client for role/balance/verification status
- **Ledger Immutability:** No direct wallet writes, all money through ledger service

### External Dependencies
- **Neon Postgres:** Free tier database (5-minute setup, no credit card)
- **Clerk Auth:** Free tier (10K MAU, hosted UI)
- **Vercel:** Deployment platform (free tier)
- **PropFlow:** Existing NuloAfrica property management system (post-purchase operations)

### Legal/Regulatory Dependencies
- **SEC Legal Opinion:** In progress, not blocking demo but required before live money
- **SPV Structure:** Must be properly established before property purchase
- **KYC Requirements:** Real KYC needed before live money (demo verification for MVP)

### Business Dependencies
- **7 Existing Investors:** ₦15M already collected, waiting since June 2024
- **Property Sourcing:** Need identified property (₦15-25M or ₦100M depending on investor choice)
- **Property Management:** PropFlow handles tenant/rent operations post-purchase

### Timeline Constraints
- **Competition Demo:** September 19, 2026 (4 days from requirements finalization)
- **Investor Communication:** September 16-22 (present options to 7 existing investors)
- **Property Closing:** 30-45 days after investor reconfirmation (if validation passes)

---

## 8. Non-Functional Requirements

### Performance
- Page load < 3 seconds on 3G connection
- Investment transaction processing < 2 seconds
- Database queries optimized for < 100ms response time
- Support 100 concurrent users (sufficient for pilot)

### Security
- All API routes protected with authentication
- Role-based authorization on all sensitive endpoints
- Idempotency keys on financial transactions
- Audit log for all money movements
- No PII logged in plain text

### Reliability
- 99% uptime during business hours (9am-9pm WAT)
- Atomic transactions (investment either fully succeeds or fully fails)
- Database backups every 24 hours
- Graceful error handling with user-friendly messages

### Usability
- Investor can complete investment flow in < 5 minutes
- Zero horizontal scrolling on any screen size (360px-1920px)
- Clear error messages (no technical jargon)
- Loading states on all async operations
- Empty states for zero-investment users

### Compliance
- Clear test mode labels on all money screens
- Risk disclosures before investment confirmation
- Fee transparency (all costs shown upfront)
- Audit trail for regulatory review
- GDPR-style data handling (even though Nigeria-focused)

---

## 9. Assumptions

### Validated Assumptions (Evidence Exists)
✅ Middle-income professionals want real estate investment access (7 paid ₦15M)  
✅ Ajo/esusu model trusted but breaks at ₦50M scale (user research confirms)  
✅ Transparency and professional management valued over DIY (persona research)  
✅ ₦500K-₦3M entry point is affordable for target segment (7 investors averaged ₦2.14M each)

### Unvalidated Assumptions (Need Testing)
⚠️ MVP platform increases trust enough to attract ₦85M more (if pursuing ₦100M property)  
⚠️ Investors prefer 12-18% property returns over 18-20% risk-free T-bills (need competitive analysis)  
⚠️ Secondary market provides sufficient liquidity after lock-up (needs testing)  
⚠️ Word-of-mouth from 7 investors sufficient for next 20-50 investors (needs validation)

### Dependency Assumptions
- PropFlow can be adapted for fractional ownership operations (6-month build estimated)
- SEC legal opinion will approve SPV structure (counsel engaged, outcome pending)
- Property market in Lagos/Abuja remains stable (no major corrections during pilot)
- 7 existing investors will wait or accept pivot to smaller property (Sept 16-22 calls will determine)

---

## 10. Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| 7 investors demand refunds after full disclosure | High - lose ₦15M capital and social proof | Medium | Present 3 options (wait/pivot/refund) transparently, offer pivot to smaller property with faster returns |
| Can't raise remaining ₦85M for ₦100M property | High - can't execute original plan | High | Pivot to ₦15-25M property with existing capital (Option B), set December deadline for fundraising |
| SEC requires registration that delays launch | High - 3-6 month delay | Medium | Get legal opinion ASAP, prepare to operate as controlled pilot (not public offering) if registration required |
| Property market downturn reduces values | Medium - investor returns suffer | Low | Diversify across multiple properties (post-MVP), focus on rental yield not appreciation |
| Tenant defaults or vacancy | Medium - distribution delays | Medium | Screen tenants carefully, maintain reserve fund, PropFlow automation for collections |
| Technical bugs in money handling | High - investor trust destroyed | Low | Comprehensive testing, immutable ledger, atomic transactions, audit logging |
| Competitor launches similar platform first | Medium - lose first-mover advantage | Medium | Focus on operational trust + PropFlow edge, serve existing 7 investors exceptionally well for word-of-mouth |
| Investors don't trust platform security | High - won't commit funds | Medium | Clear test mode labels in demo, real KYC before live money, transparent audit trail, legal structure documentation |

---

## Appendix A: Related Documents

- **Business Model Canvas Analysis:** [raw-notes.md](./raw-notes.md) - Full discovery session
- **3-Day MVP Plan:** [3_DAY_MVP_PLAN.md](../3_DAY_MVP_PLAN.md) - Technical execution plan
- **Investor Communication:** [investor-communication-draft.md](../investor-communication-draft.md) - Script for 7 existing investors
- **Architecture Essentials:** [ARCHITECTURE_ESSENTIALS.md](../ARCHITECTURE_ESSENTIALS.md) - Technical guidelines
- **Technical Specs:** SPEC-00 through SPEC-06 - Detailed implementation specs

---

**Document Status:** Ready for Review  
**Next Action:** Share with team for feedback, then begin 3-day MVP build (Sept 15-19)  
**Owner:** NEST Product Team  
**Last Updated:** September 15, 2026
