import { NextResponse } from "next/server";
import * as brevo from "@getbrevo/brevo";
import { appendRealtimeSignup } from "@/lib/google-sheets";
import { createServerClient } from "@/lib/supabase";
import { apiError } from "@/lib/errors";

export async function GET() {
  // Debug test endpoint for Google Sheets integration
  const results: any = {
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleSheetsId: !!process.env.GOOGLE_SHEETS_ID,
      hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
      hasSpreadsheetId: !!process.env.GOOGLE_SPREADSHEET_ID,
      hasAppUrl: !!process.env.NEXT_PUBLIC_BASE_URL,
    },
  };

  if (!process.env.GOOGLE_SHEETS_ID) {
    results.error = "GOOGLE_SHEETS_ID not set in environment";
    return NextResponse.json(results, { status: 400 });
  }

  try {
    const testReferralCode = `TEST-${Date.now()}`;
    await appendRealtimeSignup({
      timestamp: new Date().toISOString(),
      full_name: "Debug Test User",
      email: `test-${Date.now()}@debug.local`,
      phone: "+10000000000",
      city: "Debug City",
      investor_type: "debug",
      referred_by: null,
      referral_code: testReferralCode,
      waitlist_position: 0,
      source: "test-endpoint",
    });
    results.success = true;
    results.message = "Test signup successfully logged to Google Sheets";
    results.testReferralCode = testReferralCode;
    return NextResponse.json(results);
  } catch (e: any) {
    results.success = false;
    results.error = e?.message || String(e);
    results.stack = e?.stack;
    return NextResponse.json(results, { status: 500 });
  }
}

export async function POST(request: Request) {
  // ---- 1. Parse body ---------------------------------------------------
  let body: any;
  try {
    body = await request.json();
  } catch {
    return apiError("validation", { message: "Invalid request body — expected JSON." });
  }

  const { full_name, email, phone, city, investor_type, referred_by } = body || {};

  // ---- 2. Field-level validation --------------------------------------
  const missing: string[] = [];
  if (!full_name || typeof full_name !== "string") missing.push("full_name");
  if (!email || typeof email !== "string") missing.push("email");
  if (!phone || typeof phone !== "string") missing.push("phone");
  if (!city || typeof city !== "string") missing.push("city");
  if (!investor_type || typeof investor_type !== "string") missing.push("investor_type");

  if (missing.length) {
    return apiError("validation", {
      message: `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}.`,
      field: missing[0],
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return apiError("validation", { message: "Please enter a valid email address.", field: "email" });
  }
  const phoneRegex = /^(\+234|0)[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return apiError("validation", {
      message: "Please enter a valid Nigerian phone number (e.g. 08012345678 or +2348012345678).",
      field: "phone",
    });
  }
  const allowedInvestorTypes = ["first_time", "existing_landlord", "diaspora"];
  if (!allowedInvestorTypes.includes(investor_type)) {
    return apiError("validation", { field: "investor_type" });
  }

  // ---- 3. Public-mode short-circuit -----------------------------------
  if (String(process.env.WAITLIST_LIVE ?? "").toLowerCase() === "false") {
    const fakeCode = Math.random().toString(36).slice(2, 10);
    return Response.json({
      success: true,
      position: Math.floor(Math.random() * 400) + 50,
      referral_code: fakeCode,
    });
  }

  // ---- 4. Supabase operations -----------------------------------------
  let supabase;
  try {
    supabase = createServerClient();
  } catch (e) {
    console.error("[waitlist/join] Failed to create Supabase client:", e);
    return apiError("server", { message: "Our database is temporarily unavailable. Please try again shortly." });
  }

  // Resolve referred_by: if the code doesn't exist, silently drop it
  // instead of letting the FK constraint blow up the insert. This means
  // a stale or mistyped ?ref= link is harmless rather than fatal.
  let validReferredBy: string | null = null;
  if (referred_by && typeof referred_by === "string" && referred_by.trim()) {
    const cleanedRef = referred_by.trim().slice(0, 16);
    try {
      const { data: refRow, error: refErr } = await supabase
        .from("waitlist")
        .select("referral_code")
        .eq("referral_code", cleanedRef)
        .maybeSingle();
      if (refErr) {
        console.warn("[waitlist/join] referred_by lookup failed (non-fatal):", refErr);
      } else if (refRow) {
        validReferredBy = refRow.referral_code;
      } else {
        console.log(`[waitlist/join] referred_by '${cleanedRef}' not found — joining without referral credit`);
      }
    } catch (e) {
      console.warn("[waitlist/join] referred_by lookup threw (non-fatal):", e);
    }
  }

  let existing;
  try {
    const result = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single();
    existing = result.data;
    if (result.error && result.error.code !== "PGRST116") {
      throw result.error;
    }
  } catch (e: any) {
    console.error("[waitlist/join] Duplicate check failed:", e);
    return apiError("server", {
      message: "We couldn't verify your email right now. Please try again in a moment.",
      details: e?.message,
    });
  }

  if (existing) {
    return apiError("conflict", {
      message: "This email is already on the waitlist. Thanks for your enthusiasm!",
      field: "email",
    });
  }

  let data;
  try {
    const result = await supabase
      .from("waitlist")
      .insert({
        full_name,
        email,
        phone,
        city,
        investor_type,
        referred_by: validReferredBy,
      })
      .select("waitlist_position, referral_code")
      .single();

    if (result.error) throw result.error;
    data = result.data;
  } catch (e: any) {
    console.error("[waitlist/join] Insert failed:", e);
    return apiError("server", {
      message: "We couldn't save your spot just now. Please try again shortly.",
      details: e?.message,
    });
  }

  // ---- 5. Google Sheets (non-fatal) -----------------------------------
  if (process.env.GOOGLE_SHEETS_ID) {
    try {
      await appendRealtimeSignup({
        timestamp: new Date().toISOString(),
        full_name,
        email,
        phone,
        city,
        investor_type,
        referred_by: validReferredBy,
        referral_code: data.referral_code,
        waitlist_position: data.waitlist_position,
        source: "web",
      });
    } catch (e) {
      console.error("[google-sheets] Failed to log signup (non-fatal):", e);
    }
  }

  // ---- 6. Confirmation email via Brevo (best-effort) ------------------
  if (process.env.BREVO_API_KEY) {
    try {
      const apiInstance = new brevo.TransactionalEmailsApi();
      apiInstance.setApiKey(
        brevo.TransactionalEmailsApiApiKeys.apiKey,
        process.env.BREVO_API_KEY
      );

      const origin = request.headers.get("origin");
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin || "http://localhost:3000";
      const referralLink = `${baseUrl}?ref=${data.referral_code}`;

      await apiInstance.sendTransacEmail({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "NEST by Nulo",
          email: process.env.BREVO_SENDER_EMAIL || "noreply@example.com",
        },
        to: [{ email, name: full_name }],
        subject: `You're #${data.waitlist_position} on the NEST waitlist 🎉`,
        htmlContent: `
          <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #FF6600; font-size: 28px; margin-bottom: 8px;">Welcome to NEST, ${full_name.split(" ")[0]}!</h1>
            <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">
              You're officially on the list. Here's your spot:
            </p>
            <div style="background: #FFF7ED; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #475569; margin: 0 0 4px 0; font-size: 14px;">Your waitlist position</p>
              <p style="color: #FF6600; font-size: 48px; font-weight: 900; margin: 0;">#${data.waitlist_position}</p>
            </div>
            <p style="color: #334155; font-size: 15px; margin-bottom: 8px;"><strong>Your referral link:</strong></p>
            <p style="background: #fff; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; font-family: monospace; font-size: 13px; color: #FF6600; word-break: break-all; margin-bottom: 24px;">${referralLink}</p>
            <p style="color: #475569; font-size: 14px;">Refer <strong>5 friends</strong> to get priority access before public launch. 🚀</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
            <p style="color: #94A3B8; font-size: 12px;">NEST by Nulo Africa · Building trust in the rental economy</p>
          </div>
        `,
      });
    } catch (e) {
      console.error("Brevo email failed (non-fatal):", e);
    }
  }

  return Response.json({
    success: true,
    position: data.waitlist_position,
    referral_code: data.referral_code,
  });
}
