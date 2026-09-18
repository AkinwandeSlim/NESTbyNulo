const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  PageOrientation, SectionType, TableOfContents, LevelFormat, TabStopType, TabStopPosition,
  TableLayoutType,
} = require("docx");
const fs = require("fs");

// ═══════════════════════════════════════════════════════════
// PALETTE: GO-1 (Graphite Orange) — for PRD / proposal documents
// ═══════════════════════════════════════════════════════════
const coverPalettes = {
  "GO-1": {
    bg: "1A2330", primary: "FFFFFF", accent: "D4875A",
    cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
    table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
  },
};
const PAL = coverPalettes["GO-1"];
const T = PAL.table;
const c = (hex) => hex.replace("#", "");

// ═══════════════════════════════════════════════════════════
// BORDERS
// ═══════════════════════════════════════════════════════════
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

const accentLine = { style: BorderStyle.SINGLE, size: 2, color: T.accentLine };
const innerLine = { style: BorderStyle.SINGLE, size: 1, color: T.innerLine };

function headerCellBorders() {
  return {
    top: accentLine, bottom: accentLine, left: NB, right: NB,
    insideHorizontal: NB, insideVertical: NB,
  };
}

function bodyCellBorders() {
  return {
    top: NB, bottom: NB, left: NB, right: NB,
    insideHorizontal: innerLine, insideVertical: NB,
  };
}

// ═══════════════════════════════════════════════════════════
// COVER: Recipe R4 (Top Color Block) for PRD/Proposal
// ═══════════════════════════════════════════════════════════
function calcTitleLayout(title, maxWidthTwips, preferredPt = 40, minPt = 24) {
  const charWidth = (pt) => pt * 11; // English chars ~11 twips each
  const charsPerLine = (pt) => Math.floor(maxWidthTwips / charWidth(pt));
  let titlePt = preferredPt;
  let lines;
  while (titlePt >= minPt) {
    const cpl = charsPerLine(titlePt);
    if (cpl < 2) { titlePt -= 2; continue; }
    lines = splitTitleLines(title, cpl);
    if (lines.length <= 3) break;
    titlePt -= 2;
  }
  if (!lines || lines.length > 3) {
    const cpl = charsPerLine(minPt);
    lines = splitTitleLines(title, cpl);
    titlePt = minPt;
  }
  return { titlePt, titleLines: lines };
}

function splitTitleLines(title, charsPerLine) {
  if (title.length <= charsPerLine) return [title];
  const breakAfter = new Set([' ', '-', '/', '(', ')', ',']);
  const lines = [];
  let remaining = title;
  while (remaining.length > charsPerLine) {
    let breakAt = -1;
    for (let i = charsPerLine; i >= Math.floor(charsPerLine * 0.6); i--) {
      if (i < remaining.length && breakAfter.has(remaining[i - 1])) {
        breakAt = i;
        break;
      }
    }
    if (breakAt === -1) breakAt = charsPerLine;
    lines.push(remaining.slice(0, breakAt).trim());
    remaining = remaining.slice(breakAt).trim();
  }
  if (remaining) lines.push(remaining);
  if (lines.length > 1 && lines[lines.length - 1].length <= 3) {
    const last = lines.pop();
    lines[lines.length - 1] += " " + last;
  }
  return lines;
}

function buildCoverR4(config) {
  const P = config.palette;
  const padL = 1200, padR = 800;
  const availableWidth = 11906 - padL - padR;
  const { titlePt, titleLines } = calcTitleLayout(config.title, availableWidth, 40, 26);
  const titleSize = titlePt * 2;

  const titleBlockHeight = titleLines.length * (titlePt * 23 + 200);
  const englishLabelH = config.englishLabel ? (9 * 23 + 500) : 0;
  const subtitleH = config.subtitle ? (12 * 23 + 200) : 0;
  const upperContentH = englishLabelH + titleBlockHeight + subtitleH;
  const UPPER_MIN = 7500;
  const UPPER_H = Math.max(UPPER_MIN, upperContentH + 1500 + 800);
  const DIVIDER_H = 60;

  const contentEstimate = englishLabelH + titleBlockHeight + subtitleH;
  const spacerIntrinsic = 280;
  const topSpacing = Math.max(UPPER_H - contentEstimate - spacerIntrinsic - 800, 400);

  const upperBlock = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: UPPER_H, rule: "exact" },
      children: [new TableCell({
        shading: { fill: P.bg }, borders: noBorders, verticalAlign: "top",
        margins: { left: padL, right: padR },
        children: [
          new Paragraph({ spacing: { before: topSpacing } }),
          config.englishLabel ? new Paragraph({
            spacing: { after: 500 },
            children: [new TextRun({ text: config.englishLabel.split("").join(" "),
              size: 18, color: P.accent, font: { ascii: "Calibri" }, characterSpacing: 60 })],
          }) : null,
          ...titleLines.map((line, i) => new Paragraph({
            spacing: { after: i < titleLines.length - 1 ? 100 : 200 },
            children: [new TextRun({ text: line, size: titleSize, bold: true,
              color: P.titleColor, font: { ascii: "Arial" } })],
          })),
          config.subtitle ? new Paragraph({
            spacing: { after: 100 },
            children: [new TextRun({ text: config.subtitle, size: 24, color: P.subtitleColor,
              font: { ascii: "Calibri" } })],
          }) : null,
        ].filter(Boolean),
      })],
    })],
  });

  const divider = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: DIVIDER_H, rule: "exact" },
      children: [new TableCell({ borders: noBorders,
        shading: { fill: P.accent }, children: [new Paragraph({ children: [] })] })],
    })],
  });

  const lowerContent = [
    new Paragraph({ spacing: { before: 800 } }),
    ...(config.metaLines || []).map(line => new Paragraph({
      indent: { left: padL }, spacing: { after: 100 },
      children: [new TextRun({ text: line, size: 28, color: P.metaColor,
        font: { ascii: "Calibri" } })],
    })),
    new Paragraph({ spacing: { before: 2000 } }),
    new Paragraph({
      indent: { left: padL },
      children: [
        new TextRun({ text: config.footerLeft || "", size: 22, color: "909090", font: { ascii: "Calibri" } }),
        new TextRun({ text: "                    " }),
        new TextRun({ text: config.footerRight || "", size: 22, color: "909090", font: { ascii: "Calibri" } }),
      ],
    }),
  ];

  return [new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: allNoBorders,
    rows: [new TableRow({
      height: { value: 16838, rule: "exact" },
      children: [new TableCell({
        shading: { fill: "FFFFFF" }, borders: noBorders, verticalAlign: "top",
        children: [upperBlock, divider, ...lowerContent],
      })],
    })],
  })];
}

// ═══════════════════════════════════════════════════════════
// HELPER BUILDERS
// ═══════════════════════════════════════════════════════════

// Body paragraph (left-aligned for English)
function bodyPara(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 160, line: 312 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: "1A1A1A", font: { ascii: "Times New Roman" } })],
  });
}

function bodyParaBold(text, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 160, line: 312 },
    ...opts,
    children: [new TextRun({ text, size: 24, color: "1A1A1A", font: { ascii: "Times New Roman" }, bold: true })],
  });
}

function bodyParaMulti(runs, opts = {}) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 160, line: 312 },
    ...opts,
    children: runs.map(r => new TextRun({ size: 24, color: "1A1A1A", font: { ascii: "Times New Roman" }, ...r })),
  });
}

function emptyLine() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

// Horizontal-only business table
function bizTable(headers, rows, colWidths) {
  const totalPct = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: accentLine, bottom: accentLine, left: NB, right: NB,
      insideHorizontal: innerLine, insideVertical: NB,
    },
    rows: [
      new TableRow({
        tableHeader: true, cantSplit: true,
        children: headers.map((h, i) => new TableCell({
          width: { size: colWidths[i], type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.CLEAR, fill: T.headerBg },
          borders: headerCellBorders(),
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: h, bold: true, size: 21, color: T.headerText, font: { ascii: "Calibri" } })],
          })],
        })),
      }),
      ...rows.map((row, rowIdx) => new TableRow({
        cantSplit: true,
        children: row.map((cell, i) => new TableCell({
          width: { size: colWidths[i], type: WidthType.PERCENTAGE },
          shading: rowIdx % 2 === 0
            ? { type: ShadingType.CLEAR, fill: T.surface }
            : { type: ShadingType.CLEAR, fill: "FFFFFF" },
          borders: bodyCellBorders(),
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          children: [new Paragraph({
            children: [new TextRun({ text: cell, size: 21, color: "1A1A1A", font: { ascii: "Times New Roman" } })],
          })],
        })),
      })),
    ],
  });
}

// Table caption
function tableCaption(text) {
  return new Paragraph({
    spacing: { before: 80, after: 200, line: 312 },
    children: [new TextRun({ text, size: 21, color: "505050", font: { ascii: "Times New Roman" }, italics: true })],
  });
}

// ═══════════════════════════════════════════════════════════
// COVER CONFIG
// ═══════════════════════════════════════════════════════════
const coverConfig = {
  title: "NEST by Nulo Africa",
  subtitle: "Product Requirement Document — MVP Specification",
  englishLabel: "FRACTIONAL REAL ESTATE INVESTMENT PLATFORM",
  metaLines: [
    "Prepared by: Nulo Africa Product & Engineering Team",
    "Document Version: 1.0  |  Classification: Confidential",
    "Date: August 2026",
  ],
  footerLeft: "Nulo Africa Ltd.",
  footerRight: "Confidential",
  palette: PAL,
};

// ═══════════════════════════════════════════════════════════
// DOCUMENT ASSEMBLY
// ═══════════════════════════════════════════════════════════

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, color: "1A1A1A" },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 32, bold: true, color: "1A1A1A" },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 28, bold: true, color: "1A1A1A" },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Times New Roman", eastAsia: "SimHei" }, size: 24, bold: true, color: "1A1A1A" },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  numbering: {
    config: [
      { reference: "list-main", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "list-sub", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "list-risks", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "list-test", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [
    // ─── SECTION 1: COVER ───
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: buildCoverR4(coverConfig),
    },
    // ─── SECTION 2: TOC (Roman numerals) ───
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "NEST by Nulo Africa — PRD", size: 18, color: "909090", font: { ascii: "Calibri" } })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "PAGE \\* ROMAN \\* MERGEFORMAT", size: 18, color: "909090", font: { ascii: "Calibri" } })],
          })],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 300 },
          children: [new TextRun({ text: "Table of Contents", size: 36, bold: true, color: "1A1A1A", font: { ascii: "Times New Roman" } })],
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [new TextRun({ text: "(Right-click the TOC above and select \"Update Field\" to refresh page numbers after opening in Word.)", size: 18, color: "909090", font: { ascii: "Calibri" }, italics: true })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ─── SECTION 3: BODY (Arabic, starts at 1) ───
    {
      properties: {
        type: SectionType.NEXT_PAGE,
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "NEST by Nulo Africa — PRD v1.0", size: 18, color: "909090", font: { ascii: "Calibri" } })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "PAGE \\* arabic \\* MERGEFORMAT", size: 18, color: "909090", font: { ascii: "Calibri" } })],
          })],
        }),
      },
      children: [
        // ═══════════════════════════════════════════════════
        // 1. EXECUTIVE SUMMARY
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Executive Summary")] }),

        bodyPara("NEST by Nulo Africa is a fractional real estate investment platform designed to democratize property investment across Africa, with an initial focus on Nigeria. The platform enables individuals to co-invest in professionally managed real estate assets starting from as low as NGN 500,000 (approximately USD 330), significantly lowering the barrier to entry for an asset class that has historically been accessible only to high-net-worth individuals and institutional investors. NEST operates under the umbrella of Nulo Africa, a brand already established in the African investment landscape."),

        bodyPara("This Product Requirement Document defines the comprehensive specification for transforming the current prototype into a venture-capital-grade Minimum Viable Product (MVP). The existing prototype comprises a polished front-end built with Next.js 16, React 19, Tailwind CSS 4, and shadcn/ui, featuring 9 investor-facing views and an admin operations dashboard. The front-end is already production-quality in terms of visual design and user interaction, with Nulo Africa brand-aligned orange/amber color system, dark mode support, and Framer Motion animations. A Prisma schema with 16 data models and a SQLite seed database with 8 realistic Nigerian properties demonstrate the intended data architecture."),

        bodyPara("However, the current prototype has critical gaps that must be addressed to reach MVP status: there is no authentication system, no payment processing integration, no real backend API for core investment flows, and several views rely on hardcoded mock data. This PRD provides a detailed, actionable blueprint covering every feature, technical requirement, cost estimate, implementation timeline, testing strategy, and risk mitigation plan needed to build a fundable, launchable product. The total estimated development cost for the full MVP is approximately USD 87,000 to USD 125,000 over a 14-18 week timeline with a team of 5-7 engineers."),

        // ═══════════════════════════════════════════════════
        // 2. PRODUCT VISION & STRATEGIC CONTEXT
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Product Vision & Strategic Context")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Problem Statement")] }),

        bodyPara("Nigeria's real estate market is valued at over USD 50 billion, yet participation is heavily concentrated among the top 5% of income earners. The average Nigerian requires between NGN 20 million and NGN 100 million (USD 13,000 to USD 66,000) to purchase a direct property investment in desirable locations such as Lekki, Victoria Island, or Ikoyi in Lagos. This excludes the vast majority of the estimated 40 million working professionals in Nigeria who have disposable income and savings but cannot afford whole-property investments. Furthermore, existing real estate investment options are limited to REITs (Real Estate Investment Trusts), which are thinly traded on the Nigerian Exchange and offer limited transparency, or informal cooperative schemes (esusu/ajo) that lack legal structure and regulatory protection."),

        bodyPara("The consequences of this exclusion are significant. Millions of Nigerians miss out on the wealth-building potential of real estate, which has historically delivered 15-25% annual returns in prime Nigerian markets. Inflation, which has averaged 22% year-over-year in Nigeria, erodes the purchasing power of savings held in traditional bank accounts. Without accessible real estate investment vehicles, middle-class Nigerians are forced into volatile speculative assets, low-yield savings accounts, or simply watch their wealth depreciate. NEST addresses this market failure by creating a regulated, transparent, and technology-driven platform that makes real estate investment accessible to everyone."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Vision Statement")] }),

        bodyPara("To become Africa's most trusted and accessible fractional real estate investment platform, enabling every African to build generational wealth through professionally managed property investments, starting from as little as NGN 500,000. NEST envisions a future where property investment is no longer a privilege reserved for the wealthy, but a fundamental financial tool available to every working professional on the continent. The platform aims to serve 100,000 investors and deploy NGN 50 billion in assets under management within its first five years of operation."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 Target Market & Addressable Opportunity")] }),

        bodyPara("The primary target market is Nigerian working professionals aged 25-55 with monthly incomes between NGN 300,000 and NGN 5,000,000 who have NGN 500,000 or more in available savings or disposable income for investment. This demographic represents approximately 8-12 million individuals in Nigeria. The secondary market includes the Nigerian diaspora community, estimated at 15-20 million people globally, who regularly send remittances home and seek investment opportunities in their country of origin. The total addressable market (TAM) for fractional real estate investment in Nigeria is estimated at USD 2.5 billion annually, with a serviceable addressable market (SAM) of approximately USD 500 million within the first three years."),

        bodyPara("Competitive landscape analysis reveals that while platforms like RealtyShares, Fundrise, and CrowdStreet exist in Western markets, no dominant player has emerged in Africa. Local competitors such as Reliance HMO (focused on healthcare real estate) and a few informal cooperative investment platforms have limited technology infrastructure and regulatory compliance. NEST's first-mover advantage in combining fractional ownership with SPV (Special Purpose Vehicle) legal structures, SEC-regulated investment frameworks, and a polished digital experience positions it uniquely in this underserved market."),

        // ═══════════════════════════════════════════════════
        // 3. CURRENT STATE ASSESSMENT
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Current State Assessment")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 What Has Been Built (Prototype)")] }),

        bodyPara("The current prototype represents approximately 35-40% of the total MVP scope. It demonstrates strong product-market fit in terms of user experience design and visual identity. The front-end comprises 9 distinct investor-facing views and a comprehensive admin operations dashboard, all built with a modern technology stack. The UI is fully responsive, supports dark and light themes, and is aligned with the Nulo Africa parent brand through a carefully implemented orange/amber color system with ivory and warm stone tones."),

        bodyPara("The prototype includes the following functional components: a property browsing and discovery interface with category filters, featured property carousel, trending listings, search, sort, and pagination; a detailed property view with image gallery, financial projections, legal documents tab, developer information, SPV details, FAQ accordion, and similar property recommendations; a polished 3-step investment checkout flow with amount selection, payment method choice, review and confirmation, and an animated success state with digital certificate generation; a portfolio dashboard with KPI cards and growth charts; a wallet management interface with deposit/withdraw/transfer capabilities; an investor education academy with categorized content; and an admin dashboard with KPI metrics, growth charts, and property management tables."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Critical Gaps Requiring Resolution")] }),

        bodyPara("Despite the impressive front-end, several critical gaps prevent the prototype from functioning as a real product. The following table summarizes the key gaps, their severity, and the required resolution:", { spacing: { after: 120, line: 312 } }),

        bizTable(
          ["Gap Area", "Current State", "Severity", "MVP Requirement"],
          [
            ["Authentication", "next-auth installed but unused; user hardcoded", "Critical", "Full auth with email/password, OAuth, KYC"],
            ["Payment Processing", "UI mentions Flutterwave; no integration", "Critical", "Flutterwave + Paystack integration for card/bank"],
            ["Investment API", "No POST endpoints; checkout is UI-only", "Critical", "Full investment creation, confirmation, settlement"],
            ["Portfolio API", "100% hardcoded mock data", "High", "Real DB queries against Investment/Transaction models"],
            ["Wallet API", "All balances and transactions hardcoded", "High", "Real wallet with deposit/withdraw/transfer"],
            ["Database", "SQLite with 16 models; no migrations", "Medium", "PostgreSQL with proper migrations for production"],
            ["Admin CRUD", "Placeholder tabs; no create/edit endpoints", "High", "Full admin property, investor, and finance management"],
            ["Email/Notifications", "No email service or notification system", "Medium", "Transactional emails, in-app notifications"],
            ["Image Upload", "sharp installed but unused; all URLs are Unsplash", "Medium", "Cloudinary/S3 upload for property media"],
            ["Testing", "No test infrastructure exists", "High", "Unit, integration, E2E test suites"],
            ["Secondary Market", "Mentioned in FAQ but not built", "Low", "Post-MVP: investor-to-investor transfers"],
          ],
          [22, 30, 12, 36],
        ),
        tableCaption("Table 1: Gap Analysis — Current Prototype vs. MVP Requirements"),

        // ═══════════════════════════════════════════════════
        // 4. MVP FEATURE SPECIFICATION
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. MVP Feature Specification")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 User Authentication & Onboarding")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.1 Registration & Login")] }),

        bodyPara("The MVP must implement a complete authentication system using NextAuth.js (already installed in the project). The system shall support three authentication methods: email/password registration with confirmation email, Google OAuth (the most popular sign-in method among Nigerian professionals), and phone number OTP verification (critical for the Nigerian market where phone-based authentication is preferred for financial transactions). All authentication flows must include rate limiting (maximum 5 attempts per minute per IP), account lockout after 10 failed attempts with 30-minute cooldown, and session management with configurable token expiry (default 7 days for web, 30 days for mobile app).", { spacing: { after: 160, line: 312 } }),

        bodyPara("Registration must collect the following information: full legal name (as appears on government-issued ID), email address, phone number (Nigerian format validated), date of birth (must be 18+), and accepted terms of service and privacy policy. After registration, users must complete a mandatory Know Your Customer (KYC) verification before being allowed to make any investments. The KYC flow shall collect: government-issued ID (NIN slip, voter's card, international passport, or driver's license), proof of address (utility bill or bank statement not older than 3 months), and a selfie for liveness verification. Integration with a KYC verification provider such as YouVerify, Smile Identity, or IdentityPass is required."),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("4.1.2 User Roles & Authorization")] }),

        bodyPara("The system must enforce role-based access control (RBAC) with three primary roles defined in the existing Prisma schema: Admin (full platform management), Investor (standard investment capabilities), and Developer (property listing management). Each role has distinct permissions governing which API endpoints they can access, which views they can see, and what actions they can perform. Middleware must protect all API routes, redirecting unauthenticated users to the login page and unauthorized users to a permissions denied page. The admin role should have granular permissions for property management, investor management, financial operations, and platform configuration."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Property Browsing & Discovery (Enhance Existing)")] }),

        bodyPara("The existing BrowseView component provides a solid foundation with category filters, featured carousel, trending grid, and full listing with search and sort. MVP enhancements must include: real-time funding progress updates via server-sent events or polling (every 30 seconds), property comparison functionality (select up to 3 properties for side-by-side comparison), saved searches and favorites with user authentication, location-based filtering using Nigerian state and LGA (Local Government Area) hierarchies, and investment range filters to show only properties within the user's budget. The property listing API must be optimized with database indexing on status, city, type, and funding progress columns to support sub-200ms response times."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 Property Detail & Due Diligence")] }),

        bodyPara("The existing PropertyDetailView is comprehensive with image gallery, financial projections, documents tab, developer info, SPV details, and FAQ. MVP enhancements must include: interactive financial calculator allowing users to model expected returns based on their investment amount, downloadable property documents (PDF) with watermarking, real-time funding thermometer showing live investment progress, investor count, and time remaining, a notification/reminder system for users who view a property but don't invest (follow-up email after 24 hours), and integration with Google Maps API for property location visualization and neighborhood data. The financial projections tab should display historical property appreciation data, rental yield benchmarks for the property's location, and risk factor disclosures mandated by the SEC."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.4 Investment Flow (Build Backend)")] }),

        bodyPara("The existing InvestmentCheckout UI provides a polished 3-step flow. The MVP must build the complete backend to support this flow. Step 1 (Amount Selection) must validate that the investment amount meets the minimum unit price for the selected property, checks that the user's wallet has sufficient balance or that they intend to pay via card/bank transfer, and calculates the exact number of fractional units the investment will purchase. Step 2 (Payment Method) must integrate with Flutterwave and Paystack for card payments, provide bank transfer instructions with unique reference numbers for manual verification, and support wallet debit as a third option. Step 3 (Review & Confirm) must present a clear investment summary including unit count, total amount, expected annual return, SPV name, and risk rating, require explicit acceptance of the investment terms and SPV agreement, and generate a digital investment certificate upon successful payment."),

        bodyPara("The backend investment processing flow must implement the following transaction logic: upon payment confirmation, create an Investment record linked to the user and property, update the Property funding raised amount, credit the investor's portfolio, create a Transaction record, trigger email notifications (investment confirmation, SPV agreement, tax receipt), and update the admin dashboard metrics. All financial operations must be wrapped in database transactions to ensure data consistency. A reconciliation job must run daily to verify that all payments in the payment gateway match investment records in the database."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.5 Wallet System (Build Backend)")] }),

        bodyPara("The wallet system must support three core operations. Deposit: users can fund their NEST wallet via card payment (Flutterwave/Paystack), bank transfer (with manual verification by admin or automated via account reconciliation), or direct debit mandate. Withdraw: users can withdraw wallet balance to their verified bank account, subject to a 48-hour processing window, minimum withdrawal of NGN 50,000, and a processing fee of NGN 100 per withdrawal. Transfer: users can transfer wallet balance to another verified NEST user's wallet (useful for joint investment arrangements). The wallet must maintain a running balance with complete audit trail, support multiple currencies (initially NGN, with USD support planned), and implement balance locking during active investment transactions to prevent double-spending."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.6 Portfolio Management (Connect to Real Data)")] }),

        bodyPara("The existing PortfolioView UI must be connected to real data from the Investment and Transaction models. The portfolio dashboard must display: total portfolio value (sum of all active investments at current valuation), total returns (realized dividends plus unrealized appreciation), portfolio growth chart (monthly time series), property allocation breakdown (pie chart by property), monthly income history (bar chart of rental distributions), and recent transactions list with filtering by type (investment, dividend, withdrawal, deposit). The API must calculate portfolio metrics in real-time by joining Investment records with Property valuations and RentalDistribution records."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.7 Admin Operations Dashboard (Complete All Tabs)")] }),

        bodyPara("The existing AdminDashboard currently has a functional overview tab but 5 placeholder tabs (Properties, Investors CRM, Finance, Analytics, Support). Each must be fully implemented. The Properties tab must provide CRUD operations for creating, editing, publishing, and unpublishing property listings, with image upload, document management, and financial configuration. The Investors CRM must display a searchable/filterable table of all registered investors with KYC status, investment history, and communication log. The Finance tab must show revenue metrics, transaction volume, payment gateway reconciliation, and commission tracking. The Analytics tab must provide cohort analysis, conversion funnels, user engagement metrics, and geographic distribution charts. The Support tab must integrate a ticket system with status tracking, priority levels, and response SLAs."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.8 Investor Academy (Connect to Database)")] }),

        bodyPara("The existing AcademyView has a polished UI with 12 hardcoded content items. The MVP must migrate this content to the LearningContent database model and build a content detail view. The academy must support four content types: articles (long-form educational content with rich text formatting), videos (embedded YouTube/Vimeo with duration and thumbnail), webinars (scheduled live sessions with registration and reminders), and reports (downloadable PDF research reports on market trends). The content management system must allow admins to create, edit, publish, and archive learning content. User progress tracking must record which content items each user has viewed and completed, enabling a \u201ccontinue learning\u201d feature on the dashboard."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.9 Notifications & Communication")] }),

        bodyPara("The notification system must support two channels: in-app notifications (stored in the Notification model, displayed as a bell icon with unread count badge) and email notifications (transactional emails via SendGrid or AWS SES). Required email templates include: welcome email, KYC verification request/status update, investment confirmation, dividend distribution notification, wallet deposit/withdrawal confirmation, new property listing alert (for subscribed users), and account activity alerts. All emails must be branded with Nulo Africa visual identity and must include clear unsubscribe options for marketing communications. The notification preference center must allow users to opt in/out of each notification category independently."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.10 Referral System (Leverage Existing Model)")] }),

        bodyPara("The Prisma schema already defines a Referral model with referrer and referee relationships and bonus fields. The MVP referral system must generate unique referral codes for each user, track referral conversions (from sign-up to first investment), award referral bonuses (e.g., NGN 10,000 credit to both referrer and referee upon the referee's first investment), display referral statistics and earnings on the user's profile page, and implement fraud prevention (limit referrals per user, detect duplicate accounts). This feature is a powerful organic growth lever, as real estate investment decisions are heavily influenced by personal recommendations and community trust."),

        // ═══════════════════════════════════════════════════
        // 5. TECHNICAL ARCHITECTURE
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Technical Architecture & Infrastructure")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Technology Stack (Finalized)")] }),

        bizTable(
          ["Layer", "Technology", "Justification"],
          [
            ["Framework", "Next.js 16 (App Router)", "Already in use; SSR, API routes, edge functions"],
            ["Frontend", "React 19 + TypeScript 5", "Latest stable; strong typing for financial logic"],
            ["Styling", "Tailwind CSS 4 + shadcn/ui", "Already in use; 40+ Radix-based components"],
            ["State Management", "Zustand 5", "Already in use for view routing; add server state"],
            ["Server State", "TanStack React Query v5", "Installed but unused; enable for all API data"],
            ["Database", "PostgreSQL 16", "Production-grade; replace SQLite"],
            ["ORM", "Prisma 6", "Already in use; 16 models defined"],
            ["Authentication", "NextAuth.js v5", "Installed; supports OAuth, credentials, JWT"],
            ["Payment", "Flutterwave + Paystack", "Leading Nigerian payment gateways"],
            ["Email", "SendGrid or AWS SES", "Transactional emails with templates"],
            ["File Storage", "Cloudinary or AWS S3", "Property images, documents, certificates"],
            ["KYC Verification", "YouVerify or Smile Identity", "Nigerian identity verification APIs"],
            ["Maps", "Google Maps JavaScript API", "Property location visualization"],
            ["Charts", "Recharts 2", "Already in use for dashboard visualizations"],
            ["Animation", "Framer Motion 12", "Already in use for page transitions"],
            ["Deployment", "Vercel (frontend) + Railway/Render (backend)", "CI/CD, preview deploys, edge functions"],
            ["Monitoring", "Sentry + Vercel Analytics", "Error tracking, performance monitoring"],
            ["Testing", "Vitest + Playwright", "Unit/integration + E2E browser testing"],
          ],
          [18, 30, 52],
        ),
        tableCaption("Table 2: Technology Stack — MVP Finalized Choices"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Database Migration (SQLite to PostgreSQL)")] }),

        bodyPara("The current SQLite database must be migrated to PostgreSQL 16 for production. SQLite is suitable for prototyping but lacks the concurrency, replication, and full-text search capabilities required for a multi-user financial application. The migration involves: setting up a managed PostgreSQL instance (recommended: Supabase, Neon, or Railway PostgreSQL), updating the DATABASE_URL environment variable, running Prisma migrations to create the schema on PostgreSQL, migrating the seed data, and updating any SQLite-specific queries. The existing 16 Prisma models are well-designed and should transfer with minimal modification. JSON fields in the Prisma schema (such as property amenities, financial projections) will benefit from PostgreSQL's native JSONB support with indexing."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 API Architecture")] }),

        bodyPara("The MVP requires approximately 25-30 API endpoints organized into the following route groups. Authentication endpoints (6): signup, login, logout, session, forgot-password, reset-password. Property endpoints (5): list (with filters), detail by slug, search, featured, trending. Investment endpoints (4): create, list by user, detail, cancel (within cooling-off period). Wallet endpoints (4): balance, deposit, withdraw, transfer. Portfolio endpoints (3): summary, growth history, allocations. Admin endpoints (8+): dashboard metrics, property CRUD, investor list, finance reports, analytics, support tickets, content management, system configuration. All endpoints must implement input validation using Zod schemas, authentication checks via NextAuth middleware, role-based authorization, rate limiting, and comprehensive error handling with appropriate HTTP status codes."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.4 Security Requirements")] }),

        bodyPara("As a financial application, NEST must implement comprehensive security measures. All data in transit must use TLS 1.3 encryption. All sensitive data at rest (user PII, financial records) must be encrypted using AES-256. Passwords must be hashed using bcrypt with a minimum cost factor of 12. API authentication must use HTTP-only, Secure, SameSite cookies for session tokens. CSRF protection must be enabled on all mutation endpoints. Input sanitization must prevent SQL injection, XSS, and command injection attacks. The application must implement Content Security Policy (CSP) headers, HTTP Strict Transport Security (HSTS), and X-Frame-Options DENY. Financial operations must implement idempotency keys to prevent duplicate transactions. Regular security audits must be scheduled, and a responsible disclosure policy must be published."),

        // ═══════════════════════════════════════════════════
        // 6. IMPLEMENTATION ROADMAP
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Implementation Roadmap")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Phase Overview")] }),

        bodyPara("The MVP development is organized into 4 phases spanning 14-18 weeks. Each phase has clear deliverables, acceptance criteria, and a go/no-go checkpoint before proceeding to the next phase. This phased approach allows for early user testing and course correction, reducing the risk of building features that don't meet market needs. The phases are designed so that each one produces a potentially deployable increment of the product, even if subsequent phases are delayed.", { spacing: { after: 120, line: 312 } }),

        bizTable(
          ["Phase", "Duration", "Focus", "Key Deliverables"],
          [
            ["Phase 1: Foundation", "Weeks 1-4", "Auth, database, core APIs", "User auth, KYC, PostgreSQL, property APIs"],
            ["Phase 2: Core Transactions", "Weeks 5-8", "Investment, wallet, payments", "Investment flow, Flutterwave/Paystack, wallet"],
            ["Phase 3: Portfolio & Admin", "Weeks 9-12", "Real data, admin CRUD, notifications", "Portfolio API, admin dashboard, email system"],
            ["Phase 4: Polish & Launch", "Weeks 13-16", "Testing, optimization, deployment", "E2E tests, performance, security audit, launch"],
          ],
          [15, 14, 28, 43],
        ),
        tableCaption("Table 3: Implementation Phases Overview"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 Phase 1: Foundation (Weeks 1-4)")] }),

        bodyParaBold("Sprint 1 (Weeks 1-2): Authentication & Database", { spacing: { after: 100, line: 312 } }),

        bodyPara("Set up PostgreSQL database (managed instance on Supabase or Neon), run Prisma migrations to create all 16 models on PostgreSQL, migrate seed data, and verify all existing queries work. Implement NextAuth.js v5 with email/password credentials provider and Google OAuth provider. Build registration page with form validation (React Hook Form + Zod), login page with remember-me option, and forgot/reset password flow. Implement JWT-based session management with HTTP-only cookies. Build the KYC verification flow with document upload (temporary local storage, Cloudinary integration deferred to Sprint 3). Create user profile page showing KYC status, personal information, and investment summary. Set up middleware to protect all authenticated routes and redirect unauthenticated users to login.", { spacing: { after: 160, line: 312 } }),

        bodyParaBold("Sprint 2 (Weeks 3-4): Property API & Dashboard", { spacing: { after: 100, line: 312 } }),

        bodyPara("Build RESTful API endpoints for property listing (GET /api/properties with query parameters for type, city, status, featured, trending, riskRating, pagination, and sorting). Enhance the property detail endpoint (GET /api/properties/[slug]) to include all related data (developer, manager, opportunity, documents, media, valuations, similar properties). Implement server-side caching with Next.js ISR (Incremental Static Regeneration) for property pages. Connect TanStack React Query to all property data fetching in BrowseView and PropertyDetailView, replacing any direct fetch calls. Build admin property listing API with search, filter, and pagination. Implement the property CRUD endpoints (POST/PUT/DELETE /api/admin/properties) with image upload to Cloudinary, document management, and financial configuration. Ensure all endpoints include proper input validation, error handling, and authentication checks.", { spacing: { after: 160, line: 312 } }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 Phase 2: Core Transactions (Weeks 5-8)")] }),

        bodyParaBold("Sprint 3 (Weeks 5-6): Wallet & Payment Gateway", { spacing: { after: 100, line: 312 } }),

        bodyPara("Integrate Flutterwave and Paystack payment gateways with webhook handlers for real-time payment confirmation. Build the wallet system: GET /api/wallet/balance, POST /api/wallet/deposit (initiate payment), POST /api/wallet/deposit/verify (webhook), POST /api/wallet/withdraw, POST /api/wallet/transfer. Implement balance locking during active transactions to prevent double-spending. Build the deposit UI with card payment option (inline Flutterwave checkout) and bank transfer option (display account details with unique reference). Build the withdrawal UI with bank account selection (from verified KYC data), amount input with minimum/maximum validation, and confirmation flow. Connect the WalletView component to real wallet API using TanStack React Query. Implement transaction history API (GET /api/wallet/transactions) with filtering by type, date range, and pagination.", { spacing: { after: 160, line: 312 } }),

        bodyParaBold("Sprint 4 (Weeks 7-8): Investment Processing", { spacing: { after: 100, line: 312 } }),

        bodyPara("Build the investment processing backend: POST /api/investments (create investment with payment), POST /api/investments/verify (webhook confirmation), GET /api/investments (list user's investments), GET /api/investments/[id] (investment detail with certificate). Implement the full investment transaction flow: validate amount against property minimum, lock wallet balance or initiate card payment, create Investment record on payment confirmation, update Property funding progress, generate digital investment certificate (PDF), send confirmation emails. Connect InvestmentCheckout component to real API. Build the investment cancellation endpoint (POST /api/investments/[id]/cancel) with a 48-hour cooling-off window. Implement rental distribution processing: admin-triggered batch job that creates RentalDistribution records and Transaction entries for each investor in a property. Build the dividend notification email template and in-app notification."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.4 Phase 3: Portfolio & Admin (Weeks 9-12)")] }),

        bodyParaBold("Sprint 5 (Weeks 9-10): Portfolio & Academy", { spacing: { after: 100, line: 312 } }),

        bodyPara("Replace the hardcoded /api/portfolio endpoint with real database queries: total invested amount, current portfolio value (based on latest property valuations), total returns (realized + unrealized), monthly growth time series, property allocation percentages, and recent transactions. Connect PortfolioView to the real API using TanStack React Query with automatic background refetching. Migrate the 12 hardcoded academy content items to the LearningContent database model. Build the admin content management API (CRUD for articles, videos, webinars, reports). Build the content detail view page with reading progress tracking. Implement the user learning progress API (GET/POST /api/academy/progress). Connect AcademyView to real database content with search and category filtering."),

        bodyParaBold("Sprint 6 (Weeks 11-12): Admin Dashboard & Notifications", { spacing: { after: 100, line: 312 } }),

        bodyPara("Complete all 5 remaining admin dashboard tabs. Properties tab: searchable table with status filters, quick actions (publish/unpublish/archive), and bulk operations. Investors CRM: investor list with KYC status badges, investment summary, communication history, and export to CSV. Finance tab: revenue dashboard with transaction volume charts, payment gateway reconciliation table, commission tracking, and payout management. Analytics tab: user acquisition funnel (sign-up to first investment), cohort retention analysis, geographic distribution, property performance comparison. Support tab: ticket list with status/priority filters, ticket detail view with response thread, and SLA tracking. Implement the email notification system using SendGrid: create templates for all 8 required email types, build the notification preference center, and implement the in-app notification bell with real-time unread count."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.5 Phase 4: Polish & Launch (Weeks 13-16)")] }),

        bodyParaBold("Sprint 7 (Weeks 13-14): Testing & QA", { spacing: { after: 100, line: 312 } }),

        bodyPara("Implement comprehensive test coverage: unit tests (Vitest) for all utility functions, form validations, and data transformation logic (target: 80% coverage for lib/ files). Integration tests for all API endpoints covering success cases, validation errors, authentication failures, and edge cases (target: 90% coverage for API routes). End-to-end tests (Playwright) for critical user flows: registration and login, property browsing and search, investment checkout (card and wallet payment), wallet deposit and withdrawal, portfolio viewing, and admin property management. Performance testing: ensure all API endpoints respond within 500ms at 95th percentile, page load time under 3 seconds on 3G connections, and the application supports at least 500 concurrent users without degradation.", { spacing: { after: 160, line: 312 } }),

        bodyParaBold("Sprint 8 (Weeks 15-16): Security, Optimization & Launch", { spacing: { after: 100, line: 312 } }),

        bodyPara("Conduct a comprehensive security audit: penetration testing of authentication flows, payment processing, and API endpoints. Implement all security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options). Set up error tracking with Sentry and performance monitoring with Vercel Analytics. Configure production environment variables, database connection pooling, and CDN for static assets. Optimize database queries with proper indexing, implement connection pooling via PgBouncer or Prisma's built-in pool. Set up automated CI/CD pipeline with GitHub Actions: lint, type-check, test, build, and deploy on merge to main branch. Prepare launch checklist: legal compliance review (SEC notification, data protection), terms of service and privacy policy finalization, production domain configuration (nest.nuloafrica.com), SSL certificate, and DNS configuration. Conduct beta testing with 50-100 invited users over 2 weeks before public launch."),

        // ═══════════════════════════════════════════════════
        // 7. COST ESTIMATION
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Cost Estimation & Budget")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 Development Team & Personnel Costs")] }),

        bodyPara("The following cost estimates are based on prevailing market rates for software engineers in Nigeria and remote African talent. Costs are presented in both Nigerian Naira (NGN) and US Dollars (USD) for clarity. The estimates assume a team of 5-7 engineers working over 14-18 weeks, with a 15% contingency buffer for scope changes and unforeseen technical challenges. The personnel cost breakdown assumes a mix of senior and mid-level engineers, with the lead engineer/architect commanding a premium rate.", { spacing: { after: 120, line: 312 } }),

        bizTable(
          ["Role", "Count", "Duration", "Monthly Rate (USD)", "Total (USD)"],
          [
            ["Senior Full-Stack Engineer (Lead)", "1", "16 weeks", "$5,500", "$22,000"],
            ["Mid-Level Full-Stack Engineer", "2", "14 weeks", "$3,500", "$24,500"],
            ["Backend Engineer (Payments/Fintech)", "1", "8 weeks", "$4,500", "$9,000"],
            ["UI/UX Designer", "1", "4 weeks", "$3,000", "$3,000"],
            ["QA Engineer", "1", "6 weeks", "$2,500", "$3,750"],
            ["DevOps/Infrastructure Engineer", "0.5", "4 weeks", "$4,000", "$2,000"],
            ["Product Manager (Part-time)", "0.5", "16 weeks", "$3,000", "$6,000"],
          ],
          [30, 8, 14, 22, 26],
        ),
        tableCaption("Table 4: Personnel Cost Breakdown"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 Infrastructure & Third-Party Service Costs (Annual)")] }),

        bizTable(
          ["Service", "Provider", "Monthly (USD)", "Annual (USD)", "Notes"],
          [
            ["Hosting (Frontend)", "Vercel Pro", "$20", "$240", "CI/CD, preview deploys, analytics"],
            ["Database (PostgreSQL)", "Supabase/Neon", "$25", "$300", "Managed PostgreSQL with backups"],
            ["File Storage", "Cloudinary", "$30", "$360", "Image optimization, CDN delivery"],
            ["Email Service", "SendGrid", "$15", "$180", "Up to 40,000 emails/month"],
            ["Payment Gateway", "Flutterwave", "$0", "$0", "1.5% per transaction fee"],
            ["Payment Gateway", "Paystack", "$0", "$0", "1.5% per transaction fee"],
            ["KYC Verification", "YouVerify", "$200", "$2,400", "Approx. $1-2 per verification"],
            ["Error Monitoring", "Sentry", "$26", "$312", "Team plan with performance"],
            ["Domain & SSL", "Cloudflare", "$0", "$50", "Domain registration + SSL"],
            ["Google Maps API", "Google Cloud", "$50", "$600", "Maps embed + geocoding"],
          ],
          [20, 18, 16, 16, 30],
        ),
        tableCaption("Table 5: Infrastructure & Third-Party Service Costs"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 Total Budget Summary")] }),

        bizTable(
          ["Cost Category", "Low Estimate (USD)", "High Estimate (USD)"],
          [
            ["Personnel (Engineering Team)", "$58,250", "$70,250"],
            ["Infrastructure (First Year)", "$4,442", "$6,442"],
            ["Legal & Compliance (SEC, Data Protection)", "$5,000", "$10,000"],
            ["Security Audit (External Penetration Test)", "$3,000", "$5,000"],
            ["Contingency (15%)", "$10,704", "$13,854"],
            ["Total MVP Cost", "$81,396", "$105,546"],
          ],
          [40, 30, 30],
        ),
        tableCaption("Table 6: Total MVP Budget Summary"),

        bodyPara("The total estimated cost for the NEST MVP ranges from USD 81,396 to USD 105,546, with a midpoint estimate of approximately USD 93,000. This represents a cost-effective approach to building a financial technology platform, leveraging the existing prototype (which represents approximately USD 25,000-30,000 in already-invested development effort). The ongoing monthly operational cost post-launch is estimated at USD 400-600, covering hosting, database, email, monitoring, and payment gateway transaction fees. Revenue generation through the 1-2% platform commission on investments and potential premium listing fees for developers is expected to cover operational costs within 6-9 months of launch, assuming the platform attracts 500+ active investors managing NGN 500 million in investments."),

        // ═══════════════════════════════════════════════════
        // 8. TESTING STRATEGY
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Testing Strategy")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 Testing Pyramid & Coverage Targets")] }),

        bodyPara("The testing strategy follows the industry-standard testing pyramid, with the largest number of unit tests at the base, fewer integration tests in the middle, and a focused set of end-to-end tests at the top. This approach balances test execution speed with confidence in system behavior. Unit tests (target: 80% line coverage for lib/ and services/) validate individual functions, form validations, data transformations, and utility functions in isolation using Vitest with mocking for external dependencies. Integration tests (target: 90% endpoint coverage) validate API routes end-to-end including database interactions, authentication, authorization, input validation, and error handling using Vitest with a test database. End-to-end tests (target: all critical user flows) validate complete user journeys through the application using Playwright with Chromium, Firefox, and WebKit for cross-browser coverage."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.2 Critical Test Scenarios")] }),

        bizTable(
          ["Test Area", "Scenario", "Type", "Priority"],
          [
            ["Authentication", "User can register with email and complete KYC", "E2E", "P0"],
            ["Authentication", "Login with invalid credentials shows error", "Integration", "P0"],
            ["Authentication", "Session expires after timeout; user is redirected", "Integration", "P1"],
            ["Investment", "Complete investment flow from browse to confirmation", "E2E", "P0"],
            ["Investment", "Investment fails if wallet balance is insufficient", "Integration", "P0"],
            ["Investment", "Concurrent investments don't cause double-spending", "Integration", "P0"],
            ["Wallet", "Deposit via card is reflected in wallet balance", "E2E", "P0"],
            ["Wallet", "Withdrawal creates pending transaction", "Integration", "P0"],
            ["Wallet", "Transfer between users updates both balances", "Integration", "P1"],
            ["Portfolio", "Portfolio summary matches actual investment records", "Integration", "P0"],
            ["Admin", "Admin can create, publish, and unpublish property", "E2E", "P1"],
            ["Admin", "Non-admin users cannot access admin endpoints", "Integration", "P0"],
            ["Security", "SQL injection attempts are blocked", "Integration", "P0"],
            ["Security", "XSS payloads in property descriptions are sanitized", "Integration", "P0"],
            ["Performance", "Property listing API responds within 200ms", "Performance", "P1"],
          ],
          [16, 46, 16, 10],
        ),
        tableCaption("Table 7: Critical Test Scenarios"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.3 Performance & Load Testing")] }),

        bodyPara("Performance testing must verify that the platform meets the following benchmarks under load. API response time: 95th percentile latency under 500ms for all endpoints under normal load (100 concurrent users). Page load time: First Contentful Paint (FCP) under 1.5 seconds, Largest Contentful Paint (LCP) under 2.5 seconds, and Cumulative Layout Shift (CLS) under 0.1 on a simulated 4G connection. Concurrent users: the platform must support at least 500 concurrent users without response time degradation exceeding 2x baseline. Database query optimization: all queries must execute within 100ms, with proper indexing on frequently queried columns (property status, city, type, investment user_id, transaction created_at). Load testing should be conducted using k6 or Artillery, with scenarios simulating realistic user behavior patterns including browsing, searching, investing, and checking portfolio."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.4 Security Testing Requirements")] }),

        bodyPara("Security testing must be conducted at two levels: automated security scanning integrated into the CI/CD pipeline, and a manual penetration test conducted by an external security firm before launch. Automated scanning must include: dependency vulnerability scanning (using npm audit or Snyk) on every pull request, static application security testing (SAST) using ESLint security plugins, and dynamic application security testing (DAST) using OWASP ZAP basic scan. The external penetration test must cover: authentication bypass attempts, payment processing manipulation (amount tampering, replay attacks), authorization boundary testing (cross-tenant data access), injection attack testing (SQL, NoSQL, XSS, command injection), and business logic vulnerabilities (negative investment amounts, withdrawal exceeding balance, concurrent transaction exploitation). A re-test must be conducted after any critical or high-severity findings are remediated."),

        // ═══════════════════════════════════════════════════
        // 9. RISK ANALYSIS & MITIGATION
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Risk Analysis & Mitigation")] }),

        bizTable(
          ["Risk", "Probability", "Impact", "Mitigation Strategy"],
          [
            ["SEC regulatory non-compliance", "Medium", "Critical", "Engage SEC compliance lawyer from Day 1; structure as a registered investment platform under SEC rules"],
            ["Payment gateway downtime", "Medium", "High", "Dual gateway (Flutterwave + Paystack); automatic failover; manual payment option as backup"],
            ["Data breach / security incident", "Low", "Critical", "AES-256 encryption, HSTS, CSP headers, regular penetration tests, incident response plan, cyber insurance"],
            ["Low investor adoption", "Medium", "High", "Pre-launch waitlist building, referral program, partnership with real estate developers, content marketing"],
            ["Property valuation disputes", "Medium", "Medium", "Independent valuations from certified surveyors, quarterly revaluation, transparent methodology"],
            ["Developer delivery risk", "Medium", "High", "Rigorous developer due diligence, milestone-based fund disbursement, performance bonds"],
            ["Currency devaluation (NGN)", "High", "Medium", "USD-denominated investment options, hedging strategies, diversified property portfolio"],
            ["Team turnover / key person risk", "Medium", "Medium", "Comprehensive documentation, pair programming, knowledge sharing sessions, competitive compensation"],
          ],
          [22, 12, 10, 56],
        ),
        tableCaption("Table 8: Risk Assessment Matrix"),

        // ═══════════════════════════════════════════════════
        // 10. SUCCESS METRICS & KPIs
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("10. Success Metrics & Key Performance Indicators")] }),

        bodyPara("The following KPIs will be used to measure the success of the NEST MVP post-launch. These metrics are organized into four categories aligned with the business objectives: user acquisition, engagement, financial performance, and operational excellence. Each metric has a specific target for the first 6 months post-launch, which represents the critical period for validating product-market fit and demonstrating traction to potential investors for a Series A funding round.", { spacing: { after: 120, line: 312 } }),

        bizTable(
          ["Category", "Metric", "3-Month Target", "6-Month Target", "Measurement Method"],
          [
            ["Acquisition", "Registered Users", "1,000", "5,000", "Database count"],
            ["Acquisition", "KYC-Verified Users", "300", "1,500", "KYC status in User model"],
            ["Acquisition", "Waitlist Conversion Rate", "30%", "40%", "Waitlist signups to registered"],
            ["Engagement", "Monthly Active Users", "500", "2,500", "Last login within 30 days"],
            ["Engagement", "Avg. Session Duration", "4 min", "6 min", "Analytics tracking"],
            ["Engagement", "Properties Viewed per Session", "3", "5", "Page view analytics"],
            ["Financial", "Total Funds Raised", "NGN 50M", "NGN 500M", "Investment records sum"],
            ["Financial", "Average Investment Size", "NGN 1M", "NGN 1.5M", "Investment records average"],
            ["Financial", "Platform Revenue (Commission)", "NGN 500K", "NGN 5M", "Commission transaction records"],
            ["Operational", "API Response Time (p95)", "< 500ms", "< 300ms", "APM monitoring (Sentry)"],
            ["Operational", "System Uptime", "99.5%", "99.9%", "Vercel monitoring"],
            ["Operational", "Support Ticket Resolution", "< 48 hours", "< 24 hours", "Ticket system SLA tracking"],
          ],
          [13, 22, 18, 18, 29],
        ),
        tableCaption("Table 9: Success Metrics & KPI Targets"),

        // ═══════════════════════════════════════════════════
        // 11. POST-MVP ROADMAP
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("11. Post-MVP Roadmap (Months 5-12)")] }),

        bodyPara("Beyond the MVP launch, the product roadmap includes several high-impact features that will strengthen NEST's competitive position and expand its revenue potential. These features are prioritized based on user demand signals collected during MVP beta testing, revenue impact potential, and strategic alignment with the long-term vision of becoming Africa's leading fractional real estate platform."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("11.1 Secondary Market (Months 5-6)")] }),

        bodyPara("Enable investors to trade their fractional property shares on a secondary marketplace, providing liquidity that is currently absent in the Nigerian real estate investment landscape. This feature will allow investors who need to exit their positions before property sale to do so at market-determined prices. The secondary market will implement order matching, price discovery based on recent trades and property valuations, transaction processing with automatic commission deduction, and regulatory compliance with SEC secondary market regulations. This is the single most requested feature in comparable platforms globally and will be a significant competitive differentiator."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("11.2 Mobile Applications (Months 6-8)")] }),

        bodyPara("Develop native mobile applications for iOS and Android using React Native to extend the platform's reach beyond web users. Nigeria has over 100 million smartphone users with mobile internet, and the majority of internet activity in Africa occurs on mobile devices. The mobile app will provide push notifications for investment opportunities and dividend distributions, biometric authentication (fingerprint and face recognition) for secure access, camera-based KYC document upload, and mobile-optimized investment flow. The React Native approach allows sharing up to 70% of code with the web application, reducing development cost and time to market."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("11.3 Expansion to Additional African Markets (Months 8-12)")] }),

        bodyPara("Leverage the Nigerian MVP to expand to Ghana, Kenya, and South Africa, which represent the three most promising real estate technology markets in Africa after Nigeria. Each market expansion requires: regulatory compliance with the local securities commission (Ghana SEC, CMA Kenya, FSCA South Africa), partnerships with local payment gateways (Paystack Ghana, M-Pesa in Kenya), local property developer onboarding, and localization (currency, language, legal terminology). The modular architecture established during MVP development must support multi-tenant configuration for different markets with distinct regulatory requirements, currencies, and property types. Revenue from the Nigerian market should be sufficient to fund at least the first expansion market without additional external capital."),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("11.4 Advanced Financial Features (Months 10-12)")] }),

        bodyPara("Introduce advanced financial products that increase the platform's appeal to sophisticated investors and generate additional revenue. These include: automated portfolio rebalancing (suggesting optimal allocation across properties based on risk profile), property-backed lending (allowing investors to use their property holdings as collateral for short-term loans), real estate index funds (bundling multiple properties into diversified investment products with a single click), and ESG (Environmental, Social, Governance) scoring for properties to attract impact investors. These features position NEST not just as a fractional investment platform, but as a comprehensive real estate wealth management platform."),

        // ═══════════════════════════════════════════════════
        // 12. LEGAL & COMPLIANCE CONSIDERATIONS
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("12. Legal & Compliance Considerations")] }),

        bodyPara("Operating a fractional real estate investment platform in Nigeria requires careful attention to several regulatory frameworks. The Securities and Exchange Commission (SEC) Nigeria regulates collective investment schemes, and NEST's SPV-based structure must comply with the Investments and Securities Act 2007. The platform must register as a fund manager or work under the umbrella of a registered fund manager. Each property investment opportunity must be structured as a Special Purpose Vehicle (SPV) registered with the Corporate Affairs Commission (CAC), with NEST acting as the fund manager and trustees appointed to protect investor interests."),

        bodyPara("Data protection compliance with the Nigeria Data Protection Regulation (NDPR) 2019 and the forthcoming Data Protection Act is mandatory. This includes obtaining user consent for data collection, implementing data subject rights (access, rectification, deletion), appointing a Data Protection Officer, and conducting Data Protection Impact Assessments. The platform must also comply with Anti-Money Laundering (AML) and Combating the Financing of Terrorism (CFT) regulations, which require customer due diligence, transaction monitoring, and suspicious activity reporting to the Nigerian Financial Intelligence Unit (NFIU). Legal counsel specializing in Nigerian securities law and fintech regulation must be engaged from the earliest stages of development."),

        // ═══════════════════════════════════════════════════
        // 13. APPENDICES
        // ═══════════════════════════════════════════════════
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("13. Appendices")] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("13.1 Glossary of Terms")] }),

        bizTable(
          ["Term", "Definition"],
          [
            ["SPV", "Special Purpose Vehicle — A legal entity created for a specific investment, isolating financial risk"],
            ["KYC", "Know Your Customer — Identity verification process required by financial regulators"],
            ["AML/CFT", "Anti-Money Laundering / Combating Financing of Terrorism"],
            ["AUM", "Assets Under Management — Total market value of investments managed by the platform"],
            ["IRR", "Internal Rate of Return — Annualized rate of return on an investment"],
            ["NDPR", "Nigeria Data Protection Regulation — Governs the processing of personal data in Nigeria"],
            ["SEC", "Securities and Exchange Commission — Nigerian financial regulatory body"],
            ["NFIU", "Nigerian Financial Intelligence Unit — Agency responsible for AML/CFT enforcement"],
            ["CAC", "Corporate Affairs Commission — Nigerian government agency for company registration"],
            ["REIT", "Real Estate Investment Trust — A company that owns and manages income-producing real estate"],
          ],
          [15, 85],
        ),
        tableCaption("Table 10: Glossary of Terms"),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("13.2 Document Revision History")] }),

        bizTable(
          ["Version", "Date", "Author", "Changes"],
          [
            ["1.0", "August 11, 2026", "Nulo Africa Product Team", "Initial PRD release covering full MVP specification"],
          ],
          [15, 22, 28, 35],
        ),
        tableCaption("Table 11: Document Revision History"),

      ],
    },
  ],
});

// ═══════════════════════════════════════════════════════════
// GENERATE
// ═══════════════════════════════════════════════════════════
const OUTPUT = "/home/z/my-project/download/NEST_by_Nulo_Africa_PRD_v1.0.docx";

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(OUTPUT, buffer);
  console.log("PRD generated successfully: " + OUTPUT);
}).catch((err) => {
  console.error("Error generating PRD:", err);
  process.exit(1);
});
