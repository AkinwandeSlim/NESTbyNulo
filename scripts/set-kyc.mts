/**
 * DEV UTILITY (manual testing only — not product UI):
 * Sets a user's KYC status to simulate Feature #2 (Admin Manual Verification).
 *
 *   node scripts/set-kyc.mts <email> [VERIFIED|PENDING|REJECTED]
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const [email, statusArg] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: node scripts/set-kyc.mts <email> [VERIFIED|PENDING|REJECTED]");
    process.exit(1);
  }
  const status = (statusArg ?? "VERIFIED").toUpperCase();
  if (!["VERIFIED", "PENDING", "REJECTED"].includes(status)) {
    console.error(`Invalid status "${status}" — use VERIFIED, PENDING or REJECTED.`);
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  // `status` is a plain string column in the Prisma schema, so no literal-type
  // cast is needed — a plain string assigns cleanly to UserUpdateInput.status.
  await prisma.user.update({
    where: { id: user.id },
    data: {
      status,
      verifiedAt: status === "VERIFIED" ? new Date() : null,
      verifiedBy: status === "VERIFIED" ? "dev-script" : null,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "KYC_STATUS_OVERRIDE",
      entity: "User",
      entityId: user.id,
      details: `Status set to ${status} by dev utility (simulates Feature #2)`,
    },
  });

  console.log(`OK ${email} -> ${status}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());