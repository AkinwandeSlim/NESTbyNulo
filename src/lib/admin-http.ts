import { NextResponse } from "next/server";
import type { AdminAccess } from "@/lib/admin";

/**
 * Single place that turns an admin denial into an HTTP response.
 * 401 = no session (consistent with the Feature #1 investment gate),
 * 403 = signed in but not an admin.
 */
export function adminDenied(access: Extract<AdminAccess, { ok: false }>) {
  const unauthenticated = access.reason === "UNAUTHENTICATED";
  return NextResponse.json(
    {
      error: access.reason,
      message: unauthenticated ? "Sign in required." : "Admin access required.",
    },
    { status: unauthenticated ? 401 : 403 }
  );
}