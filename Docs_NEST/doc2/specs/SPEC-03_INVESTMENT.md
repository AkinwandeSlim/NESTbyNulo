# SPEC-03 — Atomic Wallet Investment

**Status:** Proposed · **Depends on:** SPEC-01, SPEC-02 · **Effort:** Large

## Outcome

A verified investor can accept current Terms/Risk, invest from their wallet, and receive a persisted confirmed holding without overfunding the offer.

## Inputs → outputs

- Inputs: authenticated investor, `propertyId`, `amountNaira`, `Idempotency-Key`, terms/risk version.
- Outputs: confirmed investment receipt/certificate reference, debit ledger entry, funding progress, notification, audit record.

## Acceptance criteria

- Server validates verified state, active funding window, property status, min/max ticket, balance, and remaining funding.
- A success atomically writes investment, ledger debit, funding update, consent, notification, and audit record.
- Same idempotency key returns the original receipt; no duplicate holding/debit.
- Final-slot concurrency cannot make funding exceed target; no losing request is debited.

## Tests and edge cases

- Below minimum, above user max, insufficient wallet, paused/funded/expired offer, and missing consent fail with no side effects.
- Client timeout after commit can safely retry.
- Funding target closes property exactly at target.
- Missing/stale valuation never changes investment amount or confirmation.

## Out of scope

Direct Paystack investment, cancellation/refund, PDF certificates, real ownership/legal documents.

