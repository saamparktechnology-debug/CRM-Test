import { fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync";

export interface SubscriptionDiscountRule {
  id: string;
  months: number;
  label: string;
  discountPct: number;
  offerText: string;
  isActive: boolean;
}

export const DEFAULT_SUBSCRIPTION_DISCOUNT_RULES: SubscriptionDiscountRule[] = [
  {
    id: "sub_disc_1",
    months: 1,
    label: "1 Month (Standard)",
    discountPct: 0,
    offerText: "",
    isActive: true,
  },
  {
    id: "sub_disc_3",
    months: 3,
    label: "3 Months Plan",
    discountPct: 5,
    offerText: "5% OFF",
    isActive: true,
  },
  {
    id: "sub_disc_6",
    months: 6,
    label: "6 Months Plan",
    discountPct: 10,
    offerText: "10% OFF",
    isActive: true,
  },
  {
    id: "sub_disc_12",
    months: 12,
    label: "12 Months / 1 Year Plan",
    discountPct: 20,
    offerText: "20% OFF",
    isActive: true,
  },
];

const MASTER_KEY = "subscription_discount_master";

export async function getSubscriptionDiscountRules(
  companyId?: string,
): Promise<SubscriptionDiscountRule[]> {
  const saved = await fetchModuleDataFromDB<SubscriptionDiscountRule[]>(
    MASTER_KEY,
    [],
    companyId || "all",
  ).catch(() => []);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.sort((a, b) => a.months - b.months);
  }
  return DEFAULT_SUBSCRIPTION_DISCOUNT_RULES;
}

export async function saveSubscriptionDiscountRule(
  rule: Omit<SubscriptionDiscountRule, "id"> & { id?: string },
  companyId?: string,
): Promise<SubscriptionDiscountRule[]> {
  const existing = await getSubscriptionDiscountRules(companyId);
  const id = rule.id || `sub_disc_${rule.months}_${Date.now()}`;
  const cleanRule: SubscriptionDiscountRule = {
    id,
    months: Math.max(1, Math.round(Number(rule.months) || 1)),
    label: rule.label?.trim() || `${rule.months} Months Plan`,
    discountPct: Math.max(0, Math.min(100, Number(rule.discountPct) || 0)),
    offerText:
      rule.offerText?.trim() ||
      (Number(rule.discountPct) > 0 ? `${rule.discountPct}% OFF` : ""),
    isActive: rule.isActive !== false,
  };
  const updated = [
    ...existing.filter((r) => r.id !== id && r.months !== cleanRule.months),
    cleanRule,
  ].sort((a, b) => a.months - b.months);

  await saveModuleDataToDB(MASTER_KEY, updated, companyId || "all");
  return updated;
}

export function resolveDiscountForMonths(
  months: number,
  rules: SubscriptionDiscountRule[] = DEFAULT_SUBSCRIPTION_DISCOUNT_RULES,
): { discountPct: number; offerText: string } {
  const active = rules.filter((r) => r.isActive);
  const exact = active.find((r) => Number(r.months) === Number(months));
  if (exact)
    return { discountPct: exact.discountPct, offerText: exact.offerText };
  return { discountPct: 0, offerText: "" };
}
