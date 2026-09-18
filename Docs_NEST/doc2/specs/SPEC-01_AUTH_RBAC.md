# SPEC-01 — Clerk Identity, Local Profile Mirror, and RBAC

**Status:** Proposed · **Depends on:** SPEC-00 · **Effort:** Medium

## Outcome

An authenticated Clerk identity maps to exactly one local user/wallet. Local database role and demo verification state secure all protected routes.

## Inputs → outputs

- Inputs: Clerk session identity; local `User` and `Wallet` models.
- Outputs: `requireUser`, `requireAdmin`, `requireVerified`, profile mirror service, protected route matrix.

## Acceptance criteria

- First authenticated request creates one local user and wallet; subsequent requests do not duplicate either.
- Public property endpoints remain public.
- Anonymous access to wallet/invest is `401`; pending investor invest is `403`; investor admin access is `403`; admin succeeds.
- Admin verification updates local state and creates an audit record.

## Tests and edge cases

- Missing email/identity claim fails safely.
- Clerk email change does not create a second user for the same `clerkId`.
- Locked/inactive user is denied after authentication.
- Removing local admin role takes effect on the next admin request.

## Out of scope

Real KYC, role/KYC metadata synchronization to Clerk, bank/identity onboarding UI.

