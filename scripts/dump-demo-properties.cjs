const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const p = new PrismaClient();
const json = (v) => JSON.stringify(v, (_k, x) => (typeof x === "bigint" ? Number(x) : x), 2);
(async () => {
  const props = await p.property.findMany({
    where: { status: { in: ["published", "funding"] } },
    orderBy: { fundingRaised: "desc" },
    include: {
      developer: { select: { id: true, companyName: true, logo: true, isVerified: true } },
      opportunity: { select: { id: true, minInvestment: true, maxInvestment: true, currentInvestors: true, maxInvestors: true } },
    },
  });
  const mapped = props.map((x) => ({
    id: x.id,
    slug: x.slug,
    title: x.title,
    propertyType: x.propertyType,
    status: x.status,
    city: x.city,
    state: x.state,
    shortDescription: x.shortDescription ?? undefined,
    totalValue: x.totalValue,
    minInvestment: x.minInvestment,
    maxInvestment: x.maxInvestment,
    rentalYield: x.rentalYield,
    expectedIRR: x.expectedIRR,
    riskRating: x.riskRating,
    coverImage: x.coverImage ?? undefined,
    fundingRaised: x.fundingRaised,
    fundingTarget: x.fundingTarget,
    fundingProgress: Math.round((x.fundingRaised / x.fundingTarget) * 100),
    fundingRemaining: x.fundingTarget - x.fundingRaised,
    developer: x.developer ? { id: x.developer.id, companyName: x.developer.companyName, logo: x.developer.logo ?? undefined, isVerified: x.developer.isVerified } : null,
    opportunity: x.opportunity ? { id: x.opportunity.id, minInvestment: x.opportunity.minInvestment, maxInvestment: x.opportunity.maxInvestment ?? undefined, currentInvestors: x.opportunity.currentInvestors, maxInvestors: x.opportunity.maxInvestors ?? undefined } : null,
    featured: x.featured,
    trending: x.trending,
  }));
  const header = `// ──────────────────────────────────────────────────────────────────────
// DEMO PROPERTY DATA (plug-and-play) — generated from the seeded database.
//
// WHAT: a static mirror of the seeded properties, in the exact shape
// (PropertyCardData) the landing page renders.
//
// WHY: the landing page must always have properties to demo, even when the
// database is empty, wiped, or /api/properties fails (e.g. DB file locked).
//
// HOW TO PLUG IN REAL DATA LATER:
//   1. Open src/components/nest/BrowseView.tsx.
//   2. Set DEMO_PROPERTIES_FALLBACK to false (single flag below), or delete
//      the fallback wiring entirely — the real API takes over automatically.
//   3. Optionally delete this file.
//
// REGENERATE from the current DB any time:
//   node scripts/dump-demo-properties.cjs
// ──────────────────────────────────────────────────────────────────────

import type { PropertyCardData } from "@/components/nest/PropertyCard";

export const DEMO_PROPERTIES_FALLBACK = true;

export const DEMO_PROPERTIES: PropertyCardData[] = `;
  fs.writeFileSync("src/lib/nest-demo-properties.ts", header + json(mapped) + ";\n");
  console.log("wrote src/lib/nest-demo-properties.ts with " + mapped.length + " properties");
  await p.$disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
