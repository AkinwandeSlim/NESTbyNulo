# SPEC-04 — Wallet and Portfolio Read Models

**Status:** Proposed · **Depends on:** SPEC-03 · **Effort:** Medium

## Outcome

Wallet and portfolio screens use persisted records only and work for investors with zero or multiple holdings.

## Inputs → outputs

- Inputs: current local user, posted ledger entries, confirmed investments, latest valuation.
- Outputs: wallet balance/history and portfolio totals/holding cards.

## Acceptance criteria

- `GET /api/wallet` returns balance and paginated ledger history for current user only.
- `GET /api/portfolio` returns confirmed holdings, invested amount, optional dated valuation, and distribution income.
- Existing hardcoded wallet/portfolio totals are removed from investor-facing views.
- Empty user receives an intentional zero/empty state, not a server error.

## Tests and edge cases

- Investor cannot request another investor’s wallet/history.
- Missing valuation displays unavailable/date-stamped status.
- BigInt values serialize correctly and formatted amounts match expected kobo conversion.
- Mobile cards do not require horizontal page scroll.

## Out of scope

CSV export, advanced performance analytics, secondary-market valuation, Academy data.

