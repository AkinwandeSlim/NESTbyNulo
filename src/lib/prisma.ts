import { db } from "@/lib/db";

/**
 * Compatibility alias for the dev_gstack backend that was merged into this
 * project (Features #1-#5).
 *
 * The dev_gstack codebase referenced its Prisma client as `prisma`
 * (`src/lib/prisma.ts`), while this project's convention is `db`
 * (`src/lib/db.ts`). Re-exporting the SAME singleton under the dev_gstack name
 * keeps every ported lib/route byte-for-byte faithful to the tested source
 * instead of rewriting ~12 files' import statements.
 *
 * IMPORTANT: this is an alias, not a second client — there is exactly one
 * PrismaClient instance per process (guarded by the globalThis cache in db.ts),
 * so dev HMR cannot spawn duplicate connection pools.
 */
export const prisma = db;
