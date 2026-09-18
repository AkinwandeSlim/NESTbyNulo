# SPEC-00 — Foundation, Database Reset, and Test Harness

**Status:** Proposed · **Depends on:** none · **Effort:** Medium

## Outcome

The project can boot from a clean checkout with Windows-safe scripts, a fresh Neon Postgres demo schema/seed, and repeatable lint/type/test commands.

## Inputs → outputs

- Inputs: existing SQLite prototype schema, existing package scripts, Neon connection variables.
- Outputs: Postgres Prisma schema/migration, deterministic demo seed, `.env.example`, Windows-safe scripts, Vitest setup.

## Acceptance criteria

- `npm run dev`, `build`, `start`, `typecheck`, `test`, and `test:e2e` exist and are Windows-safe.
- A fresh database migration and seed creates one admin, one verified investor, one pending investor, one funding property, and one near-close property fixture.
- No real personal/payment data or secrets appear in seed, logs, or `.env.example`.
- `npm run lint`, `npm run typecheck`, and `npm run test` pass.

## Tests and edge cases

- Seed runs twice without duplicate unique records.
- Missing required database environment variable fails early with a clear local error.
- BigInt API serialization helper is tested.

## Out of scope

SQLite data import, production data migration, Clerk/Paystack integration, and UI work.

