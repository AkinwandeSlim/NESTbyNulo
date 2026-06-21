import { google, sheets_v4 } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];

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

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID;
const REALTIME_TAB = "Realtime_Signups";
const DAILY_TAB = "Daily_Sync";

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLast = i === attempts - 1;
      if (isLast) break;
      const delay = Math.pow(2, i) * 500;
      console.warn(`[google-sheets] attempt ${i + 1} failed, retrying in ${delay}ms`);
      await sleep(delay);
    }
  }
  throw lastError;
}

export interface WaitlistRow {
  timestamp: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  investor_type: string;
  referred_by: string | null;
  referral_code: string;
  waitlist_position: number;
  source?: string;
}

async function findEmailRow(email: string): Promise<number | null> {
  const sheets = getSheetsClient();
  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${REALTIME_TAB}!C:C`,
    })
  );

  const rows = res.data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0]?.toLowerCase() === email.toLowerCase()) {
      return i + 1;
    }
  }
  return null;
}

export async function appendRealtimeSignup(row: WaitlistRow): Promise<{ action: "appended" | "skipped" | "updated"; row?: number }> {
  if (!SPREADSHEET_ID) {
    console.warn("[google-sheets] GOOGLE_SHEETS_ID not set, skipping");
    return { action: "skipped" };
  }

  try {
    const existingRow = await findEmailRow(row.email);

    if (existingRow) {
      console.log(`[google-sheets] Email ${row.email} already exists at row ${existingRow}, skipping`);
      return { action: "skipped", row: existingRow };
    }

    const sheets = getSheetsClient();
    const values = [
      [
        row.timestamp,
        row.full_name,
        row.email,
        row.phone,
        row.city,
        row.investor_type,
        row.referred_by || "",
        row.referral_code,
        String(row.waitlist_position),
        row.source || "web",
      ],
    ];

    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${REALTIME_TAB}!A:J`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      })
    );

    console.log(`[google-sheets] Appended new signup: ${row.email}`);
    return { action: "appended" };
  } catch (err) {
    console.error("[google-sheets] appendRealtimeSignup failed:", err);
    throw err;
  }
}

export interface DailyAggregates {
  sync_date: string;
  total_signups: number;
  signups_today: number;
  first_time_investors: number;
  existing_landlords: number;
  diaspora: number;
  top_city: string;
  total_referrals: number;
  avg_position: number;
}

export async function writeDailySync(agg: DailyAggregates): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.warn("[google-sheets] GOOGLE_SHEETS_ID not set, skipping");
    return;
  }

  const sheets = getSheetsClient();
  const today = new Date().toISOString().split("T")[0];

  const res = await withRetry(() =>
    sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${DAILY_TAB}!A:A`,
    })
  );

  const rows = res.data.values || [];
  let targetRow: number | null = null;

  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === today) {
      targetRow = i + 1;
      break;
    }
  }

  const values = [
    [
      agg.sync_date,
      String(agg.total_signups),
      String(agg.signups_today),
      String(agg.first_time_investors),
      String(agg.existing_landlords),
      String(agg.diaspora),
      agg.top_city,
      String(agg.total_referrals),
      String(agg.avg_position),
    ],
  ];

  if (targetRow) {
    await withRetry(() =>
      sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${DAILY_TAB}!A${targetRow}:I${targetRow}`,
        valueInputOption: "RAW",
        requestBody: { values },
      })
    );
    console.log(`[google-sheets] Updated daily row ${targetRow} for ${today}`);
  } else {
    await withRetry(() =>
      sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${DAILY_TAB}!A:I`,
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: { values },
      })
    );
    console.log(`[google-sheets] Appended new daily row for ${today}`);
  }
}