/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keeps Turbopack inside this app folder (prevents it from trying to use
  // the parent workspace's package-lock.json / node_modules).
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 375, 414, 640, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// DATABASE_URL guard (local dev only)
//
// A stale DATABASE_URL (pointing at the deleted Supabase project
// `db.tqmjcygeykmbdjcfdbga.supabase.co`) was inherited from the editor's
// process environment. Real environment variables take precedence over
// .env files in Next.js, so they silently broke every DB query.
//
// In development we load the repo .env and, if the inherited DATABASE_URL
// cannot possibly work (wrong project host, sqlite file, or missing),
// we override it with the value from .env. In production (Vercel) the
// dashboard-configured variable is always authoritative and untouched.
// ─────────────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  const fs = require('fs');
  const path = require('path');

  const BROKEN_HOSTS = [
    'db.tqmjcygeykmbdjcfdbga.supabase.co', // deleted Supabase project
  ];
  const current = process.env.DATABASE_URL || '';
  const isBroken =
    !current ||
    current.startsWith('file:') || // leftover SQLite URL
    BROKEN_HOSTS.some((h) => current.includes(h));

  if (isBroken) {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
      const line = fs
        .readFileSync(envPath, 'utf8')
        .split(/\r?\n/)
        .find((l) => l.startsWith('DATABASE_URL='));
      if (line) {
        const fromEnv = line.slice('DATABASE_URL='.length).trim();
        if (fromEnv) {
          process.env.DATABASE_URL = fromEnv;
          console.log(
            '[next.config] Overriding stale DATABASE_URL with value from .env'
          );
        }
      }
    }
  }
}

module.exports = nextConfig;
