"use client";

export type MarketingPlanDuration =
  | "1 month"
  | "3 months"
  | "6 months"
  | "1 year"
  | "Weekly"
  | "Custom Dates";

export interface MarketingScheduleItem {
  sl: number;
  date: string;
  done: boolean;
  remarks: string;
  type?: "poster" | "video";
}

export interface MarketingPerformanceReport {
  startDate?: string;
  endDate?: string;
  postsDelivered?: string;
  videosDelivered?: string;
  leadsGenerated?: number | string;
  reach?: number | string;
  followersGained?: number | string;
}

export interface DigitalMarketingPackage {
  enabled: boolean;
  formNumber?: string;
  planName: string;
  packageDuration: MarketingPlanDuration | string;
  startDate: string;
  expireDate: string;
  category?: string;
  specialNote?: string;

  // Deliverables
  postersCount: number;
  bannersCount?: number;
  leafletsCount?: number;
  videosCount: number;
  storyCount?: number;
  hasRealModelShoot?: boolean;
  modelShootDate?: string;
  modelShootNotes?: string;
  hasTotoAds?: boolean;
  totoAdsNotes?: string;
  targetLocations?: string;

  // Offer & Multi-month Pricing
  durationMonths?: number;
  baseMonthlyPrice?: number;
  discountPercent?: number;
  freeOfferText?: string;

  // Display badges
  expectedViews?: string;
  expectedLeads?: string;
  bestFor?: string;
  features?: string[];

  // Platforms
  platforms?: string[];

  // Schedules
  posterSchedule?: MarketingScheduleItem[];
  videoSchedule?: MarketingScheduleItem[];

  // Performance
  performance?: MarketingPerformanceReport;

  // Financials
  packagePrice: number;
  adSpendBudget?: number;
  agencyFee?: number;
}

// 9 Packages from Saampark Consultancy Service Flyer
export const SAAMPARK_9_PACKAGES: any[] = [];

export const PRESET_MARKETING_PLANS = SAAMPARK_9_PACKAGES;

export const DURATION_OFFERS: Array<{ label: string; value: string; months: number; discountPct: number; badge?: string; description?: string }> = [];

export function calculatePackageTotal(
  baseMonthlyPrice: number,
  duration: string,
  customMonths?: number,
  customDiscountPct?: number,
  customOffer?: string,
  masterRules?: Array<{
    months: number;
    discountPct: number;
    offerText?: string;
    isActive?: boolean;
  }>,
) {
  const rate = Math.max(0, Number(baseMonthlyPrice) || 0);

  if (duration === "custom") {
    const m = Math.max(1, Number(customMonths) || 1);
    const disc = Math.max(0, Math.min(100, Number(customDiscountPct) || 0));
    const gross = rate * m;
    const discountAmount = Math.round(gross * (disc / 100));
    return {
      months: m,
      discountPct: disc,
      discountAmount,
      netPrice: gross - discountAmount,
      offer: customOffer || (disc > 0 ? `${disc}% OFF` : ""),
    };
  }

  const fallbackOpt =
    DURATION_OFFERS.find((d) => d.value === duration) || { label: "1 Month", value: "1 month", months: 1, discountPct: 0 };
  const months = fallbackOpt.months;
  const masterMatch = Array.isArray(masterRules)
    ? masterRules.find(
        (r) => r.isActive !== false && Number(r.months) === months,
      )
    : undefined;

  const discountPct = masterMatch
    ? Math.max(0, Math.min(100, Number(masterMatch.discountPct) || 0))
    : fallbackOpt.discountPct;
  const offer = masterMatch
    ? (masterMatch.offerText ?? (discountPct > 0 ? `${discountPct}% OFF` : ""))
    : fallbackOpt.offer;
  const gross = rate * months;
  const discountAmount = Math.round(gross * (discountPct / 100));

  return {
    months,
    discountPct,
    discountAmount,
    netPrice: gross - discountAmount,
    offer,
  };
}

export function createDefaultMarketingPackage(
  planName = "Package 02 - Grow",
): DigitalMarketingPackage {
  const today = new Date();
  const exp = new Date(today.getTime() + 30 * 86400000);

  const fmt = (d: Date) => {
    const day = String(d.getDate()).padStart(2, "0");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${day}/${months[d.getMonth()]}/${d.getFullYear()}`;
  };

  const selectedPkg =
    SAAMPARK_9_PACKAGES.find((p) => p.name?.includes(planName)) || { id: "default", name: planName || "Standard", price: 0, postersCount: 0, videosCount: 0, storyCount: 0, hasRealModelShoot: false, features: [], expectedViews: "", expectedLeads: "", bestFor: "", specialNote: "" };

  return {
    enabled: true,
    formNumber: "FORM NO - 9",
    planName: selectedPkg.name,
    packageDuration: "1 month",
    startDate: fmt(today),
    expireDate: fmt(exp),
    category: "Digital Marketing",
    specialNote: selectedPkg.description,
    postersCount: selectedPkg.postersCount,
    videosCount: selectedPkg.videosCount,
    storyCount: selectedPkg.storyCount,
    hasRealModelShoot: selectedPkg.hasRealModelShoot,
    hasTotoAds: false,
    platforms: ["Facebook", "Instagram", "Meta Ads", "WhatsApp"],
    packagePrice: selectedPkg.price,
    baseMonthlyPrice: selectedPkg.price,
    durationMonths: 1,
    discountPercent: 0,
    expectedViews: selectedPkg.expectedViews,
    expectedLeads: selectedPkg.expectedLeads,
    bestFor: selectedPkg.bestFor,
    features: selectedPkg.features,
  };
}
