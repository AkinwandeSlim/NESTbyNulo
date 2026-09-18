# NEST by Nulo Africa — Instructions for Coding Agents

This is the canonical instruction file for AI coding agents and contributors. The singular [`AGENT.md`](AGENT.md) is retained only as a compatibility pointer.

## 1. Mandatory reading order

1. [`doc2/ARCHITECTURE_ESSENTIALS.md`](doc2/ARCHITECTURE_ESSENTIALS.md)
2. [`doc2/PRD.md`](doc2/PRD.md)
3. [`doc2/ARCHITECTURE.md`](doc2/ARCHITECTURE.md)
4. [`doc2/IMPLEMENTATION_PLAN.md`](doc2/IMPLEMENTATION_PLAN.md)
5. The approved file in [`doc2/specs/`](doc2/specs/)

## 2. Spec-driven rule

Implement **one approved specification at a time**. Do not start a new feature, dependency, refactor, or integration until the project owner approves its exact `SPEC-XX` file.

For an approved spec: inspect → add/adjust tests → implement smallest vertical slice → run checks → report against acceptance criteria → request approval for the next spec.

## 3. Current and required commands

Run commands from the project root:

```powershell
npm install
npx prisma generate
npx next dev -p 3000
npm run lint
npx tsc --noEmit
```

SPEC-00 must standardize these package scripts before later work: `dev`, `build`, `start`, `typecheck`, `test`, and `test:e2e`. After it is complete, use:

```powershell
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Do not use the current Unix-specific `npm run dev`, `build`, or `start` scripts until SPEC-00 replaces them with Windows-safe scripts.

## 4. Engineering conventions

- TypeScript strictness stays enabled. Do not re-enable `ignoreBuildErrors` or silence types to ship.
- Use Zod for all mutation input. Return stable API error codes.
- Route handlers authenticate, authorize, parse, call a service, and return a response—nothing more.
- Business logic belongs in `src/server/services/`; components contain presentation and form state only.
- Use the existing Prisma singleton (`src/lib/db.ts`) only.
- Zustand is UI/navigation state only; database/API is the source of server data.
- Keep diffs narrow, preserve uncommitted user work, and do not reformat unrelated files.

## 5. Money, security, and privacy rules

- Persist money as integer `BigInt` kobo; never floats.
- Only the ledger service changes a wallet, inside a database transaction.
- Every wallet movement is immutable, idempotent, referenced, and audit logged.
- Server checks roles, verification, balance, remaining funding, and consent; browser state is never authoritative.
- Use only test Paystack keys and demo data. Never request/store/log live personal, bank, identity, payment, or secret data.
- Clerk authenticates identity; NEST Postgres owns roles and demo verification state.
- NEST is a test-mode MVP. Do not describe it as a live or regulated investment service.

## 6. Mobile-first rule

Build investor surfaces at 360 px first; verify 390 px, 768 px, and 1280 px. No hover-only actions, no horizontal page scrolling, minimum 44 px touch targets, safe-area-aware checkout action, and text alternatives for charts/progress.

## 7. Completion report

Use the reporting template in `doc2/IMPLEMENTATION_PLAN.md` §7. Include changed files, tests/commands and results, acceptance evidence, known gap, and exactly one proposed next spec.

## 8. gstack

This project uses gstack skills when appropriate. For web browsing and browser-based research, prefer the gstack `/browse` skill. Do not use Claude-specific `mcp__claude-in-chrome__*` tools.

Available gstack skills:

```text
/office-hours
/plan-ceo-review
/plan-eng-review
/plan-design-review
/design-consultation
/design-shotgun
/design-html
/review
/ship
/land-and-deploy
/canary
/benchmark
/browse
/connect-chrome
/qa
/qa-only
/design-review
/scrape
/setup-browser-cookies
/setup-deploy
/setup-gbrain
/retro
/investigate
/document-release
/document-generate
/codex
/cso
/autoplan
/plan-devex-review
/devex-review
/careful
/freeze
/guard
/unfreeze
/gstack-upgrade
/learn
```
