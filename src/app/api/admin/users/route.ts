import { NextResponse } from "next/server";
import { requireAdmin, listUsers } from "@/lib/admin";
import { adminDenied } from "@/lib/admin-http";

export const runtime = "nodejs";

const ALLOWED_STATUSES = ["PENDING", "VERIFIED", "REJECTED"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * Feature #2 - admin-only investor list backing Screen 7 (Investors CRM).
 * Admin authority is re-checked here; the route never trusts the caller.
 */
export async function GET(request: Request) {
  const access = await requireAdmin();
  if (!access.ok) return adminDenied(access);

  const status = new URL(request.url).searchParams.get("status");
  if (status && !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
    return NextResponse.json(
      {
        error: "INVALID_STATUS",
        message: `status must be one of ${ALLOWED_STATUSES.join(", ")}, received "${status}".`,
      },
      { status: 400 }
    );
  }

  const users = await listUsers(status ?? undefined);
  return NextResponse.json({ users, count: users.length });
}
