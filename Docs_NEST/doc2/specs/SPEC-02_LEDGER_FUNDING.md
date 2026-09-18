# SPEC-02 — Immutable Ledger and Test Wallet Funding

**Status:** Proposed · **Depends on:** SPEC-00, SPEC-01 · **Effort:** Medium

## Outcome

Verified demo users can receive a labelled test credit, and every wallet balance movement is immutable, auditable, and replay-safe.

## Inputs → outputs

- Inputs: user/wallet, `amountNaira`, unique reference or provider event.
- Outputs: posted `LedgerEntry`, updated wallet read balance, notification/audit record, wallet history API.

## Acceptance criteria

- Credit and debit services run only in the caller transaction and reject non-positive values/insufficient balance.
- Posting a duplicate reference makes no second movement.
- Admin demo credit requires admin plus `DEMO_MODE=true` and returns a visibly demo-labelled result.
- Optional Paystack test webhook verifies HMAC before posting and treats a duplicate event as a no-op.

## Tests and edge cases

- Credit/debit balance equals signed ledger sum.
- Debit rollback leaves no partial entry/balance change.
- Invalid signature, unknown reference, failed provider event, currency/amount mismatch do not credit.
- A retry after successful commit returns the original result where applicable.

## Out of scope

Live funds, direct investment payment, withdrawal, refund, or stored payment method.

