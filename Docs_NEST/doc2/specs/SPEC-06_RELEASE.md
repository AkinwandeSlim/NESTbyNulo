# SPEC-06 — Mobile-First Release Proof

**Status:** Proposed · **Depends on:** SPEC-00 through SPEC-05 · **Effort:** Medium

## Outcome

The entire demo path is repeatable from clean seed, usable on mobile, and safe to share as a test-mode Vercel preview.

## Inputs → outputs

- Inputs: completed vertical slices and test environment variables.
- Outputs: golden-path E2E script, release checklist, mobile visual evidence, preview deployment.

## Acceptance criteria

- Golden E2E passes twice from clean seed: verified user → funding fixture → investment → portfolio → admin distribution → final credit.
- Lint, typecheck, full test suite, and production build pass.
- Investor path works at 360, 390, 768, and 1280 px with no unintended horizontal scrolling or obscured checkout action.
- Preview labels test/sandbox status and displays risk disclosure before investment confirmation.

## Tests and edge cases

- E2E includes duplicate/retry fixture where feasible.
- Mobile filter, amount validation, error state, loading state, and consent remain usable with keyboard/touch.
- Missing test credentials cause a clear setup failure or use the approved demo-credit path; never a silent fake payment.

## Out of scope

Production release, real-money certification, performance tuning beyond sprint needs, nonessential visual redesign.

