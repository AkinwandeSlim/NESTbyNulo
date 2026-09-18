/**
 * Cross-platform replacement for the Unix `cp -r` steps that used to run after
 * `next build` (cmd.exe has no `cp`, so `npm run build` failed on Windows).
 * Copies static assets and the public folder into the standalone output so
 * `npm run start` (node .next/standalone/server.js) can serve everything.
 */
import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standaloneDir = join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  console.error("No .next/standalone found — run `next build` first.");
  process.exit(1);
}

cpSync(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), {
  recursive: true,
});

if (existsSync(join(root, "public"))) {
  cpSync(join(root, "public"), join(standaloneDir, "public"), {
    recursive: true,
  });
}

console.log("✓ Copied .next/static and public/ into .next/standalone");
