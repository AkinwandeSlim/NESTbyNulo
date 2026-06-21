import { NextResponse } from "next/server";
import { google } from "googleapis";

export const dynamic = "force-dynamic";

export async function GET() {
  const results: any = {
    step1_env_check: {},
    step2_auth_check: {},
    step3_sheets_check: {},
  };

  try {
    results.step1_env_check = {
      SHEETS_ID: process.env.GOOGLE_SHEETS_ID ? "✓ LOADED: " + process.env.GOOGLE_SHEETS_ID : "✗ MISSING",
      EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "✓ LOADED: " + process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL : "✗ MISSING",
      KEY_LENGTH: process.env.GOOGLE_PRIVATE_KEY ? "✓ LOADED: " + process.env.GOOGLE_PRIVATE_KEY.length + " chars" : "✗ MISSING",
      KEY_STARTS_WITH: process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30) || "N/A",
    };

    if (!process.env.GOOGLE_SHEETS_ID || !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: "Missing one or more Google Sheets env vars",
        details: results,
      }, { status: 400 });
    }

    try {
      const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });

      const test = await sheets.spreadsheets.values.get({
        spreadsheetId: process.env.GOOGLE_SHEETS_ID,
        range: "Realtime_Signups!A1:J1",
      });

      results.step2_auth_check = "✓ Auth successful!";
      results.step3_sheets_check = {
        success: true,
        headers: test.data.values?.[0] || [],
        message: "✓ Successfully read headers from Realtime_Signups tab",
      };

      try {
        await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.GOOGLE_SHEETS_ID,
          range: "Realtime_Signups!A:J",
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: [[
              new Date().toISOString(),
              "TEST_USER",
              `test-${Date.now()}@example.com`,
              "+234000000000",
              "Lagos",
              "first_time",
              "",
              "TESTCODE",
              "999",
              "debug_test",
            ]],
          },
        });

        results.step3_sheets_check.write_test = "✓ Test write successful!";
      } catch (writeErr) {
        results.step3_sheets_check.write_test = "✗ Test write FAILED: " + (writeErr instanceof Error ? writeErr.message : String(writeErr));
      }

      return NextResponse.json({
        success: true,
        message: "🎉 Google Sheets integration is working!",
        details: results,
      });
    } catch (authErr) {
      results.step2_auth_check = "✗ Auth FAILED: " + (authErr instanceof Error ? authErr.message : String(authErr));
      return NextResponse.json({
        success: false,
        error: "Authentication or Sheets access failed",
        details: results,
      }, { status: 500 });
    }
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: "Unexpected error",
      message: err instanceof Error ? err.message : String(err),
      details: results,
    }, { status: 500 });
  }
}