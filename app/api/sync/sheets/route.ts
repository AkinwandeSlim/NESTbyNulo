import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { writeDailySync, DailyAggregates } from "@/lib/google-sheets";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorizeCron(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.SYNC_SECRET_KEY;

  if (process.env.NODE_ENV === "development") return true;
  if (!cronSecret) return false;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  if (!(await authorizeCron(request))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: all, error: allErr } = await supabase
      .from("waitlist")
      .select("id, full_name, email, phone, city, investor_type, referred_by, referral_code, referral_count, waitlist_position, created_at");

    if (allErr) {
      console.error("[sync] Failed to fetch waitlist:", allErr);
      return Response.json({ error: "DB fetch failed", details: allErr.message }, { status: 500 });
    }

    const rows = all || [];
    const total = rows.length;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayStr = new Date().toISOString().split("T")[0];

    const signupsToday = rows.filter((r) => new Date(r.created_at) >= todayStart).length;
    const firstTime = rows.filter((r) => r.investor_type === "first_time").length;
    const existing = rows.filter((r) => r.investor_type === "existing_landlord").length;
    const diaspora = rows.filter((r) => r.investor_type === "diaspora").length;

    const cityCounts: Record<string, number> = {};
    rows.forEach((r) => {
      if (r.city) cityCounts[r.city] = (cityCounts[r.city] || 0) + 1;
    });
    const topCity = Object.entries(cityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const totalReferrals = rows.reduce((sum, r) => sum + (r.referral_count || 0), 0);
    const avgPosition = total > 0 ? Math.round(rows.reduce((s, r) => s + (r.waitlist_position || 0), 0) / total) : 0;

    const agg: DailyAggregates = {
      sync_date: todayStr,
      total_signups: total,
      signups_today: signupsToday,
      first_time_investors: firstTime,
      existing_landlords: existing,
      diaspora,
      top_city: topCity,
      total_referrals: totalReferrals,
      avg_position: avgPosition,
    };

    await writeDailySync(agg);

    return Response.json({
      success: true,
      synced_at: new Date().toISOString(),
      aggregates: agg,
      pii_note: "Aggregate counts only — no individual user data exported to daily tab",
    });
  } catch (err) {
    console.error("[sync] Unexpected error:", err);
    return Response.json(
      { error: "Sync failed", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}