import { NextResponse } from "next/server";
import { requireAdmin, adminStats } from "@/lib/admin";
import { adminDenied } from "@/lib/admin-http";

export const runtime = "nodejs";

/**
 * Admin overview metrics. Real database aggregates only - no invented
 * property/revenue figures (those models arrive with Features #4-#6).
 */
export async function GET() {
  const access = await requireAdmin();
  if (!access.ok) return adminDenied(access);

  const stats = await adminStats();
  return NextResponse.json({ stats });
}