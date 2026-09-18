/**
 * Feature #2 admin bootstrap: promote (or demote) an account to role=ADMIN.
 *
 *   npm run make-admin you@demo.nest.com
 *   npm run make-admin you@demo.nest.com INVESTOR   # demote again
 *
 * The same effect can be achieved without this script by listing the email in
 * ADMIN_EMAILS in .env - the account is promoted on its next admin request.
 * Run after the dev server is stopped to avoid locking the SQLite file.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [email, roleArg] = process.argv.slice(2);
  const role = (roleArg ?? "ADMIN").toUpperCase();

  if (!email) {
    console.error("Usage: npm run make-admin <email> [ADMIN|INVESTOR]");
    process.exitCode = 1;
    return;
  }
  if (role !== "ADMIN" && role !== "INVESTOR") {
    console.error(`Role must be ADMIN or INVESTOR, received "${role}".`);
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!existing) {
    console.error(
      `No account found for ${email}. Register it through the app first, then re-run this script.`
    );
    process.exitCode = 1;
    return;
  }

  const updated = await prisma.user.update({
    where: { id: existing.id },
    data: { role },
  });

  await prisma.auditLog.create({
    data: {
      userId: updated.id,
      action: role === "ADMIN" ? "USER_PROMOTED_TO_ADMIN" : "USER_DEMOTED_TO_INVESTOR",
      entity: "User",
      entityId: updated.id,
      details: `Role set to ${role} via make-admin script (${updated.email})`,
    },
  });

  console.log("");
  console.log(`  ${updated.email} -> role=${updated.role} status=${updated.status}`);
  console.log("  Audit log written.");
  console.log("");
}

main()
  .catch((err) => {
    console.error("make-admin failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
