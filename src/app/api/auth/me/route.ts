import { NextResponse } from "next/server";
import { getCurrentUser, authMode } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/auth/me
 *
 * 200 { user, mode } when signed in · 401 { error, message, mode } when not.
 *
 * MERGE NOTE: `mode` ("DEV_FALLBACK" | "CLERK") is returned in BOTH bodies so
 * (a) the UI can label which auth path the demo is running, and (b) the E2E
 * suites can detect the mode from the API. The suites' original landing-page
 * text scrape cannot work here: the merged app's landing page is a
 * client-rendered SPA, so the mode text never appears in its server HTML.
 */
export async function GET() {
  const mode = authMode();
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "UNAUTHENTICATED", message: "Sign in required.", mode },
      { status: 401 }
    );
  }
  return NextResponse.json({ user, mode });
}
