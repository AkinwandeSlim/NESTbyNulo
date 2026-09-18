# SPEC-05 — Admin Verification and Demo Distribution

**Status:** Proposed · **Depends on:** SPEC-01, SPEC-02, SPEC-03 · **Effort:** Medium

## Outcome

An admin can verify a demo investor and post one exactly allocated test distribution for an eligible property.

## Inputs → outputs

- Inputs: admin session; user ID for verification; property ID, UTC period, amount, idempotency key for distribution.
- Outputs: updated demo verification state or a distribution with allocations, wallet credits, notifications, and audit record.

## Acceptance criteria

- Non-admin receives `403` for every admin route.
- Distribution includes only confirmed investments at the defined period cut-off.
- Allocation total equals requested amount exactly; each allocation posts once.
- Duplicate property/period or idempotency key returns a safe existing result/rejection and does not double pay.

## Tests and edge cases

- No eligible investor, zero amount, inactive property, duplicate period, and rounding remainder are tested.
- 60/40 fixture produces exact 60/40 kobo allocation and both investor notifications.
- Notification failure is recorded for retry without reversing a completed ledger transaction.

## Out of scope

Live rental collection, payout, withdrawal approval, bulk distribution jobs, support/CRM administration.

