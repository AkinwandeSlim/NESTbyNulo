# NEST by Nulo Africa

Fractional real estate landing page + waitlist built with Next.js 14, Tailwind CSS, Supabase, and Brevo.

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env template and fill in your keys:

   ```bash
   cp .env.local.example .env.local
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open http://localhost:3000

## Supabase setup

1. Create a new project at https://supabase.com
2. Open the SQL Editor
3. Paste the contents of `supabase/schema.sql` and run it
4. Copy the project URL, anon key, and service role key into `.env.local`

## Brevo setup (optional, for confirmation emails)

1. Create an account at https://www.brevo.com
2. Add and verify your sending domain
3. Create an API key (Settings → SMTP & API → API Keys) and paste it into `BREVO_API_KEY`

If `BREVO_API_KEY` is unset, signup still works — confirmation emails are silently skipped.

## Referral links

Visitors can join via `https://yourdomain.com/?ref=ABCD1234`. The form reads the `ref` query param and passes it to the API, which records it as `referred_by` and increments the referrer's `referral_count`.

## Project structure

```
app/
  api/waitlist/join/route.ts   POST endpoint
  globals.css                  Tailwind base + theme
  layout.tsx                   Root layout + fonts
  page.tsx                     Home page composition
components/                    All UI components
lib/supabase.ts                Supabase client factories
supabase/schema.sql            DB schema + triggers
tailwind.config.ts             Custom theme (nulo colors)
```
