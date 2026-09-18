import { NextResponse } from "next/server";
import { requireAdmin, verifyUser } from "@/lib/admin";
import { adminDenied } from "@/lib/admin-http";

export const runtime = "nodejs";

/** POST /api/admin/users/:id/verify - PENDING/REJECTED -> VERIFIED. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin();
  if (!access.ok) return adminDenied(access);

  const { id } = await params;
  const outcome = await verifyUser(id, access.user.id, access.user.email);

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
    case "ALREADY_VERIFIED":
      // Idempotent: no second audit entry and no duplicate notification.
      return NextResponse.json({
        status: "VERIFIED",
        alreadyVerified: true,
        message: "Account was already verified.",
      });
    case "VERIFIED":
      return NextResponse.json({
        status: "VERIFIED",
        alreadyVerified: false,
        message: "User verified successfully.",
      });
  }
}
