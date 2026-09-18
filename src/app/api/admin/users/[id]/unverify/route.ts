import { NextResponse } from "next/server";
import { requireAdmin, unverifyUser } from "@/lib/admin";
import { adminDenied } from "@/lib/admin-http";

export const runtime = "nodejs";

/**
 * POST /api/admin/users/:id/unverify - VERIFIED -> PENDING.
 * Screen 7: only allowed "if no investments" (enforced in unverifyUser).
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin();
  if (!access.ok) return adminDenied(access);

  const { id } = await params;
  const outcome = await unverifyUser(id, access.user.id, access.user.email);

  switch (outcome) {
    case "NOT_FOUND":
      return NextResponse.json(
        { error: "NOT_FOUND", message: "User not found." },
        { status: 404 }
      );
    case "TARGET_IS_ADMIN":
      return NextResponse.json(
        {
          error: "TARGET_IS_ADMIN",
          message: "Admin accounts are not part of the verification queue.",
        },
        { status: 409 }
      );
    case "SELF":
      return NextResponse.json(
        {
          error: "SELF_ACTION",
          message: "You cannot unverify your own account.",
        },
        { status: 409 }
      );
    case "HAS_INVESTMENTS":
      return NextResponse.json(
        {
          error: "HAS_INVESTMENTS",
          message:
            "This investor already holds investments, so verification cannot be revoked.",
        },
        { status: 409 }
      );
    case "UNVERIFIED":
      return NextResponse.json({
        status: "PENDING",
        message: "Verification revoked - account is PENDING again.",
      });
  }
}