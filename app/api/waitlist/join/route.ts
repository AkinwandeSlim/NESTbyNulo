import { createClient } from "@supabase/supabase-js";
import * as brevo from "@getbrevo/brevo";

export async function POST(request: Request) {
  const body = await request.json();
  const { full_name, email, phone, city, investor_type, referred_by } = body;

  if (!full_name || !email || !phone || !city || !investor_type) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (String(process.env.WAITLIST_LIVE ?? "").toLowerCase() === "false") {
    const fakeCode = Math.random().toString(36).slice(2, 10);
    return Response.json({
      success: true,
      position: Math.floor(Math.random() * 400) + 50,
      referral_code: fakeCode,
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Duplicate check
  const { data: existing } = await supabase
    .from("waitlist")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return Response.json({ error: "Email already registered" }, { status: 409 });
  }

  // Insert
  const { data, error } = await supabase
    .from("waitlist")
    .insert({
      full_name,
      email,
      phone,
      city,
      investor_type,
      referred_by: referred_by || null,
    })
    .select("waitlist_position, referral_code")
    .single();

  if (error) {
    console.error(error);
    return Response.json({ error: "Failed to join waitlist" }, { status: 500 });
  }

  // Confirmation email via Brevo (best-effort)
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
      console.error("Brevo email failed:", e);
    }
  }

  return Response.json({
    success: true,
    position: data.waitlist_position,
    referral_code: data.referral_code,
  });
}
