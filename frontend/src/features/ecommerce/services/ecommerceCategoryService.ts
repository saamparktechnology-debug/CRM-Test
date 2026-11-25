import { api } from "@/lib/api";
import { EcommerceCategoryItem, EcommerceCompany } from "../types/ecommerce.types";

export const DEFAULT_ECOMMERCE_CATEGORIES: EcommerceCategoryItem[] = [
  // Technology
  { id: "web-services", name: "Web Development & Portals", companyId: "tech", icon: "Globe", isDefault: true },
  { id: "application-services", name: "Mobile Apps (Android & iOS)", companyId: "tech", icon: "Smartphone", isDefault: true },
  { id: "software-services", name: "Custom Software & ERP/CRM", companyId: "tech", icon: "Cpu", isDefault: true },
  { id: "ai-services", name: "AI Integration & Automation", companyId: "tech", icon: "Bot", isDefault: true },
  { id: "maintenance-services", name: "Maintenance & AMC Support", companyId: "tech", icon: "Wrench", isDefault: true },
  { id: "hosting-services", name: "Cloud Hosting & Managed DNS", companyId: "tech", icon: "Server", isDefault: true },

  // Consultancy
  { id: "graphic-design", name: "Graphic Design & Brand Identity", companyId: "consultancy", icon: "Palette", isDefault: true },
  { id: "ai-video", name: "AI Video & Motion Graphics", companyId: "consultancy", icon: "Video", isDefault: true },
  { id: "digital-marketing", name: "Digital Marketing & Ads", companyId: "consultancy", icon: "Megaphone", isDefault: true },
  { id: "legal", name: "Company Legal & Compliance", companyId: "consultancy", icon: "Scale", isDefault: true },
  { id: "loan", name: "Business Loan & Finance Advisory", companyId: "consultancy", icon: "Coins", isDefault: true },
  { id: "insurance", name: "Insurance Consultancy", companyId: "consultancy", icon: "ShieldCheck", isDefault: true },
  { id: "education", name: "Education & Training", companyId: "consultancy", icon: "GraduationCap", isDefault: true },
];

export function slugifyCategoryId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mergeWithDefaults(customList: EcommerceCategoryItem[]): EcommerceCategoryItem[] {
  const byId = new Map<string, EcommerceCategoryItem>();
  DEFAULT_ECOMMERCE_CATEGORIES.forEach((cat) => byId.set(cat.id, cat));
  (Array.isArray(customList) ? customList : []).forEach((cat) => {
    if (cat && cat.id && cat.name) {
      const existing = byId.get(cat.id);
      byId.set(cat.id, {
        ...cat,
        isDefault: existing?.isDefault || cat.isDefault,
      });
    }
  });
  return Array.from(byId.values());
}

export async function getEcommerceCategories(): Promise<EcommerceCategoryItem[]> {
  try {
    const res = await api.get("/store/ecommerce_categories");
    const raw = res?.data;
    const list: EcommerceCategoryItem[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : [];
    return mergeWithDefaults(list);
  } catch {
    return DEFAULT_ECOMMERCE_CATEGORIES;
  }
}

export async function saveEcommerceCategory(category: {
  id?: string;
  name: string;
  companyId: EcommerceCompany;
  icon?: string;
  description?: string;
}): Promise<EcommerceCategoryItem[]> {
  const cleanId = slugifyCategoryId(category.id || category.name);
  if (!cleanId || !category.name.trim()) {
    throw new Error("Category name is required");
  }

  const all = await getEcommerceCategories();
  const existingCustom = all.filter((c) => !c.isDefault || c.id === cleanId);
  const newItem: EcommerceCategoryItem = {
    id: cleanId,
    name: category.name.trim(),
    companyId: category.companyId,
    icon: category.icon || (category.companyId === "tech" ? "Layers" : "Briefcase"),
    description: category.description?.trim() || "",
    isDefault: DEFAULT_ECOMMERCE_CATEGORIES.some((d) => d.id === cleanId),
    createdAt: new Date().toISOString(),
  };

  const customOnly = all
    .filter((c) => !c.isDefault && c.id !== cleanId)
    .concat(newItem.isDefault ? [] : [newItem]);

  // If overriding default metadata, also save inside list
  const payloadList = newItem.isDefault
    ? [...existingCustom.filter((c) => c.id !== cleanId && !c.isDefault), newItem]
    : customOnly;

  await api.post("/store/ecommerce_categories", {
    data: payloadList,
    mode: "replace",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_categories_updated"));
  }

  return mergeWithDefaults(payloadList);
}

export async function deleteEcommerceCategory(categoryId: string): Promise<EcommerceCategoryItem[]> {
  const all = await getEcommerceCategories();
  const customOnly = all.filter((c) => !c.isDefault && c.id !== categoryId);

  await api.post("/store/ecommerce_categories", {
    data: customOnly,
    mode: "replace",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_categories_updated"));
  }

  return mergeWithDefaults(customOnly);
}
