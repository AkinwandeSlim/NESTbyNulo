import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, rejectUser } from "@/lib/admin";
import { adminDenied } from "@/lib/admin-http";

export const runtime = "nodejs";

/** Screen 7: "Reject ... (Add reason)" - the reason is mandatory. */
const bodySchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Rejection reason must be at least 10 characters.")
    .max(500, "Rejection reason must be 500 characters or fewer."),
});

/** POST /api/admin/users/:id/reject - PENDING/VERIFIED -> REJECTED. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireAdmin();
  if (!access.ok) return adminDenied(access);

  const { id } = await params;

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "INVALID_REASON",
        message:
          parsed.error.issues[0]?.message ?? "A rejection reason is required.",
      },
      { status: 400 }
    );
  }

  const outcome = await rejectUser(
    id,
    access.user.id,
    access.user.email,
    parsed.data.reason
  );

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
          message: "You cannot reject your own account.",
        },
        { status: 409 }
      );
    case "REJECTED":
      return NextResponse.json({
        status: "REJECTED",
        rejectionReason: parsed.data.reason,
        message: "User rejected.",
      });
  }
}
