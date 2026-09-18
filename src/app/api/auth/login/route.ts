import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { isClerkEnabled } from "@/lib/auth";
import {
  SESSION_COOKIE,
  createSessionValue,
  sessionCookieOptions,
} from "@/lib/session";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(72),
});

export async function POST(req: Request) {
  if (isClerkEnabled()) {
    return NextResponse.json(
      { message: "Sign-in is handled by Clerk in this mode." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Enter a valid email and password." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { wallet: true },
  });

  // Generic error — never reveal whether the email exists.
  if (!user || !user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json(
      { message: "Invalid email or password." },
      { status: 401 }
    );
  }

  if (!user.isActive) {
    return NextResponse.json(
      { message: "This account has been deactivated." },
      { status: 403 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const res = NextResponse.json({
    user: { id: user.id, email: user.email, status: user.status },
  });
  res.cookies.set(SESSION_COOKIE, createSessionValue(user.id), sessionCookieOptions());
  return res;
}
