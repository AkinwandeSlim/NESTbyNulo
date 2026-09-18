# NEST by Nulo Africa — Spec-Driven Implementation Plan

**Status:** Build control document · **Sprint:** five working days  
**Canonical rules:** [`../../AGENTS.md`](../../AGENTS.md) · [PRD](PRD.md) · [Architecture](ARCHITECTURE.md)

## 1. Spec-driven development protocol

No feature begins as an informal coding request. Every change follows this lifecycle:

```text
Select one approved spec
  → verify Definition of Ready
  → write/adjust tests for the spec
  → implement the smallest vertical slice
  → run required checks
  → demonstrate acceptance criteria
  → record result and request next-spec approval
```

An agent may inspect, diagnose, or propose the next spec without approval. It must not implement a new spec until the project owner approves that named spec. A spec is complete only when its acceptance tests pass; “the UI looks right” is not completion.

## 2. Spec index and dependency order

| ID | Vertical slice | Depends on | Effort | Day target | Demo proof |
|---|---|---|---:|---:|---|
| SPEC-00 | Foundation, schema reset, seed, test harness | — | M | 1 | Clean app + DB seed + quality commands run. |
| SPEC-01 | Clerk identity, local profile mirror, RBAC | 00 | M | 1 | Pending investor blocked; admin protected. |
| SPEC-02 | Immutable wallet ledger and controlled demo credit | 00, 01 | M | 2 | Wallet can credit/debit once with invariant proof. |
| SPEC-03 | Atomic wallet investment | 01, 02 | L | 3 | Investment survives reload; no oversubscription. |
| SPEC-04 | Wallet and portfolio read models | 03 | M | 4 | No mock balance/portfolio numbers. |
| SPEC-05 | Admin verification and demo distribution | 01, 02, 03 | M | 4 | Admin verifies and pays a 60/40 test distribution. |
| SPEC-06 | Mobile-first polish, E2E, preview readiness | 00–05 | M | 5 | Golden path twice green at mobile/desktop breakpoints. |

`Paystack test-mode funding` is an optional extension of SPEC-02. It starts only when the ledger and demo-credit path are already passing. It is never allowed to block SPEC-03.

## 3. Definitions

### Definition of Ready (before starting a spec)

- The spec has a stable ID, owner approval, inputs/outputs, non-goals, acceptance criteria, and test cases.
- Dependencies show as complete with passing evidence.
- Any required environment/provider account is available, or an approved fallback is documented.
- The agent has inspected affected existing files and working-tree state.

### Definition of Done (before closing a spec)

- All acceptance criteria and specified tests pass.
- Existing checks still pass: lint, typecheck, relevant test suite, and build when applicable.
- Loading, error, empty, permission-denied, and mobile behavior were considered for any UI.
- No real secrets or personal/payment data were introduced.
- The diff is limited to the approved spec; documentation is updated only for approved decisions.
- Handoff includes changed files, commands/results, limitation, and next recommended spec.

## 4. Day-by-day control plan

| Day | Approved target | Must be demonstrable by end of day | Do not start unless target is green |
|---:|---|---|---|
| 1 | SPEC-00, then SPEC-01 | Fresh seed, role/KYC API matrix, protected admin route. | Ledger work. |
| 2 | SPEC-02 | Credit/debit invariant, replay-safe demo credit, wallet API. | Investment checkout. |
| 3 | SPEC-03 | Verified investor can invest from wallet; final-slot race safe. | Portfolio rewrite. |
| 4 | SPEC-04, then SPEC-05 | Persisted portfolio and admin 60/40 distribution. | New feature scope. |
| 5 | SPEC-06 | E2E twice green, mobile pass, preview release checklist. | Any new capability. |

## 5. Scope and decision gates

| Gate | Rule |
|---|---|
| Money | No live payment, withdrawal, or payout work. Paystack is test mode only. |
| Identity | No KYC/BVN/NIN/bank/identity collection. `verified` is an explicit demo state. |
| Data | Use a fresh Postgres demo seed. Do not migrate production-like SQLite records in this sprint. |
| UX | Investor flow is mobile-first at 360 px; a desktop-only implementation fails the spec. |
| Integration | Cloudinary, Resend, Inngest, and direct-pay investment are not blockers. |
| Change control | Any new idea becomes a backlog item until the active spec is done and the owner approves reprioritization. |

## 6. Test and release checkpoints

| Checkpoint | Minimum command/evidence |
|---|---|
| Foundation | `npm run lint`, `npm run typecheck`, migration/seed run, `npm run test`. |
| Money feature | Targeted Vitest tests plus duplicate/retry and rollback proof. |
| UI feature | Relevant component/API tests, manual 360/390/768/1280 px pass. |
| Release | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, golden E2E twice from clean seed. |

SPEC-00 must add any missing `typecheck`, `test`, and `test:e2e` scripts before later specs rely on them.

## 7. Reporting template

Use this exact short status at the end of each agent task:

```markdown
Spec: SPEC-XX — <name>
Status: proposed | in progress | blocked | complete
Changed: <files>
Verified: <commands and results>
Acceptance: <criteria proven / not proven>
Risks or decisions: <only material items>
Next: <one recommended spec; wait for owner approval>
```

