// One-time script to fully sync Google Sheets with Supabase
// Run this locally after cleaning up your Supabase data
// Usage: npx tsx lib/sync-sheets-from-supabase.ts

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

import { createServerClient } from "./supabase";
import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const REALTIME_TAB = "Realtime_Signups";

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !key) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY");
  }

  const auth = new google.auth.JWT({
    email,
    key: key.replace(/\\n/g, "\n"),
    scopes: SCOPES,
  });

  return auth;
}

function getSheetsClient(): sheets_v4.Sheets {
  return google.sheets({ version: "v4", auth: getAuth() });
}

async function clearRealtimeTab() {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.clear({
    spreadsheetId: SPREADSHEET_ID,
    range: `${REALTIME_TAB}!A:J`,
  });

  // Re-add headers
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${REALTIME_TAB}!A:J`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [
        [
          "timestamp",
          "full_name",
          "email",
          "phone",
          "city",
          "investor_type",
          "referred_by",
          "referral_code",
          "waitlist_position",
          "source",
        ],
      ],
    },
  });
}

async function syncAllSignupsFromSupabase() {
  const supabase = createServerClient();
  const { data: signups, error } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  if (!signups) return;

  const sheets = getSheetsClient();
  const values = signups.map((signup) => [
    signup.created_at,
    signup.full_name,
    signup.email,
    signup.phone,
    signup.city,
    signup.investor_type,
    signup.referred_by || "",
    signup.referral_code,
    String(signup.waitlist_position),
    "sync-from-supabase",
  ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${REALTIME_TAB}!A:J`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values },
  });

  console.log(`Synced ${signups.length} signups from Supabase to Google Sheets`);
}

async function main() {
  if (!SPREADSHEET_ID) {
    console.error("GOOGLE_SHEETS_ID not set");
    process.exit(1);
  }

  console.log("Clearing existing Realtime_Signups tab...");
  await clearRealtimeTab();

  console.log("Syncing all signups from Supabase...");
  await syncAllSignupsFromSupabase();

  console.log("✅ Sync complete! (Daily_Sync left untouched for historical data)");
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
