/**
 * BigInt/Date-safe deep converter for JSON API responses.
 *
 * WHY THIS EXISTS (dev_gstack merge): the merged schema stores money as BigInt
 * kobo (valuationKobo, targetKobo, fundedKobo, amountKobo, balanceKobo, …).
 * `JSON.stringify` THROWS on BigInt ("Do not know how to serialize a BigInt"),
 * so any route that spreads whole Prisma rows (e.g. `...property`) 500s at
 * runtime while typechecking perfectly. Kobo values sit far below 2^53, so
 * Number(bigint) is exact — this is a display conversion only; all arithmetic
 * stays in BigInt on the server.
 *
 * Usage: `return NextResponse.json(jsonSafe(payload))` on any route whose
 * payload may embed raw Prisma rows.
 */
export function jsonSafe<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value === 'bigint') return Number(value) as unknown as T;
  if (value instanceof Date) return value.toISOString() as unknown as T;
  if (Array.isArray(value)) {
    return value.map((item) => jsonSafe(item)) as unknown as T;
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      out[key] = jsonSafe(v);
    }
    return out as T;
  }
  return value;
}