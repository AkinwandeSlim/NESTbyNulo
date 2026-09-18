// ──────────────────────────────────────────────────────────────────────
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

export const DEMO_PROPERTIES: PropertyCardData[] = [
  {
    "id": "cmu5sc3xz000n9ioc80tk5d81",
    "slug": "marina-tower",
    "title": "Marina Tower",
    "propertyType": "commercial",
    "status": "published",
    "city": "Lagos",
    "state": "Lagos",
    "shortDescription": "Grade A commercial office tower on Victoria Island, Lagos Marina.",
    "totalValue": 500000000,
    "minInvestment": 500000,
    "maxInvestment": 50000000,
    "rentalYield": 8.8,
    "expectedIRR": 15,
    "riskRating": "moderate",
    "coverImage": "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop",
    "fundingRaised": 425000000,
    "fundingTarget": 500000000,
    "fundingProgress": 85,
    "fundingRemaining": 75000000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc42300139iocbvculwwu",
      "minInvestment": 500000,
      "maxInvestment": 50000000,
      "currentInvestors": 590,
      "maxInvestors": 30
    },
    "featured": false,
    "trending": false
  },
  {
    "id": "cmu5sc3uq000d9iocn0bdzlwl",
    "slug": "azure-heights",
    "title": "Azure Heights",
    "propertyType": "completed_rental",
    "status": "published",
    "city": "Lagos",
    "state": "Lagos",
    "shortDescription": "Premium 12-unit apartment complex on Victoria Island with lagoon views.",
    "totalValue": 420000000,
    "minInvestment": 500000,
    "maxInvestment": 35000000,
    "rentalYield": 8.2,
    "expectedIRR": 16.8,
    "riskRating": "low",
    "coverImage": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
    "fundingRaised": 378000000,
    "fundingTarget": 420000000,
    "fundingProgress": 90,
    "fundingRemaining": 42000000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc3zo000t9ioc28q3jvdv",
      "minInvestment": 500000,
      "maxInvestment": 35000000,
      "currentInvestors": 673,
      "maxInvestors": 60
    },
    "featured": true,
    "trending": false
  },
  {
    "id": "cmu5sc3wj000j9iocsmrdsnbp",
    "slug": "the-yaba-hub",
    "title": "The Yaba Hub",
    "propertyType": "mixed_use",
    "status": "published",
    "city": "Lagos",
    "state": "Lagos",
    "shortDescription": "Mixed-use co-living and retail spaces in Yaba tech district.",
    "totalValue": 195000000,
    "minInvestment": 500000,
    "maxInvestment": 16250000,
    "rentalYield": 11,
    "expectedIRR": 21,
    "riskRating": "moderate",
    "coverImage": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
    "fundingRaised": 166000000,
    "fundingTarget": 195000000,
    "fundingProgress": 85,
    "fundingRemaining": 29000000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc415000z9iocq5rvd4tv",
      "minInvestment": 500000,
      "maxInvestment": 16250000,
      "currentInvestors": 219,
      "maxInvestors": 60
    },
    "featured": false,
    "trending": true
  },
  {
    "id": "cmu5sc3u1000b9ioctmlaivsp",
    "slug": "the-lekki-residence",
    "title": "The Lekki Residence",
    "propertyType": "completed_rental",
    "status": "published",
    "city": "Lagos",
    "state": "Lagos",
    "shortDescription": "Luxury 4-bedroom detached duplex in Lekki Phase 1, already generating rental income.",
    "totalValue": 185000000,
    "minInvestment": 500000,
    "maxInvestment": 18500000,
    "rentalYield": 9.5,
    "expectedIRR": 18.5,
    "riskRating": "low",
    "coverImage": "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
    "fundingRaised": 155250000,
    "fundingTarget": 185000000,
    "fundingProgress": 84,
    "fundingRemaining": 29750000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc3z7000r9ioc9afqsnj4",
      "minInvestment": 500000,
      "maxInvestment": 18500000,
      "currentInvestors": 267,
      "maxInvestors": 5
    },
    "featured": true,
    "trending": true
  },
  {
    "id": "cmu5sc3ve000f9iociyn2svqj",
    "slug": "coral-bay-estate",
    "title": "Coral Bay Estate",
    "propertyType": "off_plan",
    "status": "funding",
    "city": "Lagos",
    "state": "Lagos",
    "shortDescription": "Off-plan waterfront townhouses in Epe, Lagos — high growth corridor.",
    "totalValue": 360000000,
    "minInvestment": 500000,
    "maxInvestment": 15000000,
    "rentalYield": 7.5,
    "expectedIRR": 26,
    "riskRating": "high",
    "coverImage": "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
    "fundingRaised": 151200000,
    "fundingTarget": 360000000,
    "fundingProgress": 42,
    "fundingRemaining": 208800000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc403000v9iocrbeh5np2",
      "minInvestment": 500000,
      "maxInvestment": 15000000,
      "currentInvestors": 191,
      "maxInvestors": 120
    },
    "featured": true,
    "trending": true
  },
  {
    "id": "cmu5sc3vx000h9ioc3rmyc943",
    "slug": "greenfield-gardens",
    "title": "Greenfield Gardens",
    "propertyType": "off_plan",
    "status": "funding",
    "city": "Lagos",
    "state": "Lagos",
    "shortDescription": "Off-plan affordable terrace duplexes in Ibeju-Lekki — strong appreciation potential.",
    "totalValue": 240000000,
    "minInvestment": 500000,
    "maxInvestment": 5000000,
    "rentalYield": 6.8,
    "expectedIRR": 22.5,
    "riskRating": "moderate",
    "coverImage": "https://images.unsplash.com/photo-1631869222989-74c4e5a2a31a?w=800&h=600&fit=crop",
    "fundingRaised": 120000000,
    "fundingTarget": 240000000,
    "fundingProgress": 50,
    "fundingRemaining": 120000000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc40o000x9ioc5524gf43",
      "minInvestment": 500000,
      "maxInvestment": 5000000,
      "currentInvestors": 161,
      "maxInvestors": 240
    },
    "featured": false,
    "trending": false
  },
  {
    "id": "cmu5sc3xb000l9ioc39cwix44",
    "slug": "campus-quarters",
    "title": "Campus Quarters",
    "propertyType": "student_housing",
    "status": "published",
    "city": "Ile-Ife",
    "state": "Osun",
    "shortDescription": "Purpose-built student housing near OAU, Ile-Ife — strong rental demand.",
    "totalValue": 96000000,
    "minInvestment": 500000,
    "maxInvestment": 3000000,
    "rentalYield": 12,
    "expectedIRR": 19.5,
    "riskRating": "low",
    "coverImage": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop",
    "fundingRaised": 76800000,
    "fundingTarget": 96000000,
    "fundingProgress": 80,
    "fundingRemaining": 19200000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc41m00119iocuglmtvp1",
      "minInvestment": 500000,
      "maxInvestment": 3000000,
      "currentInvestors": 110,
      "maxInvestors": 160
    },
    "featured": false,
    "trending": false
  },
  {
    "id": "cmu5sc3yl000p9iocyqgg4cuz",
    "slug": "heritage-homes",
    "title": "Heritage Homes",
    "propertyType": "affordable_housing",
    "status": "funding",
    "city": "Badagry",
    "state": "Lagos",
    "shortDescription": "Affordable housing community in Badagry with modern bungalows.",
    "totalValue": 108000000,
    "minInvestment": 500000,
    "maxInvestment": 3000000,
    "rentalYield": 7,
    "expectedIRR": 20,
    "riskRating": "moderate",
    "coverImage": "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&h=600&fit=crop",
    "fundingRaised": 48600000,
    "fundingTarget": 108000000,
    "fundingProgress": 45,
    "fundingRemaining": 59400000,
    "developer": {
      "id": "cmu5sc3th00099iochfvdqd7l",
      "companyName": "PrimeCrest Developments Nigeria Ltd",
      "logo": "/api/placeholder/logo/200/200",
      "isVerified": true
    },
    "opportunity": {
      "id": "cmu5sc42k00159ioc68oj6ii2",
      "minInvestment": 500000,
      "maxInvestment": 3000000,
      "currentInvestors": 72,
      "maxInvestors": 180
    },
    "featured": false,
    "trending": false
  }
];
