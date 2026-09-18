import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { isClerkEnabled } from "@/lib/auth";
import {
  SESSION_COOKIE,
  createSessionValue,
  sessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().max(50).optional().or(z.literal("")),
  email: z.email().max(254),
  phone: z.string().trim().min(7).max(20).optional().or(z.literal("")),
  password: z.string().min(8).max(72),
});

export async function POST(req: Request) {
  // When Clerk is active, registration belongs to Clerk — never dual-write.
  if (isClerkEnabled()) {
    return NextResponse.json(
      { message: "Registration is handled by Clerk in this mode." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message ?? "Invalid registration data.",
      },
      { status: 400 }
    );
  }

  const { firstName, lastName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 409 }
    );
  }

  // Locked scope: account is created with PENDING status, wallet atomically.
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      phone: phone || null,
      firstName,
      lastName: lastName || null,
      // MERGE NOTE: this project's User.role defaults to lowercase "investor",
      // while the merged authorization layer (requireInvestor/requireAdmin)
      // compares against uppercase INVESTOR/ADMIN. Set it explicitly here so a
      // freshly registered account is never silently locked out.
      role: "INVESTOR",
      passwordHash: hashPassword(password),
      authSource: "DEV_FALLBACK",
      status: "PENDING",
      wallet: { create: {} },
      auditLogs: {
        create: {
          action: "USER_REGISTERED",
          entity: "User",
          details: "Registered via DEV_FALLBACK auth",
        },
      },
    },
    include: { wallet: true },
  });

  const res = NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        status: user.status,
      },
    },
    { status: 201 }
  );
  res.cookies.set(SESSION_COOKIE, createSessionValue(user.id), sessionCookieOptions());
  return res;
}
