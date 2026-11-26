import { api } from "@/lib/api";
import { EcommerceCategoryItem, EcommerceCompany } from "../types/ecommerce.types";

export const DELETED_CATEGORIES_META_ID = "__deleted_ids__";

export const DEFAULT_ECOMMERCE_CATEGORIES: EcommerceCategoryItem[] = [
  // Technology
  { id: "web-services", name: "Web Services", companyId: "tech", icon: "Globe", isDefault: true },
  { id: "application-services", name: "Application Services", companyId: "tech", icon: "Smartphone", isDefault: true },
  { id: "software-services", name: "Software Services", companyId: "tech", icon: "Cpu", isDefault: true },
  { id: "ai-services", name: "AI Services", companyId: "tech", icon: "Bot", isDefault: true },
  { id: "maintenance-services", name: "Maintenance Services", companyId: "tech", icon: "Wrench", isDefault: true },
  { id: "hosting-services", name: "Hosting & Server Services", companyId: "tech", icon: "Server", isDefault: true },

  // Consultancy
  { id: "graphic-design", name: "Graphic Design", companyId: "consultancy", icon: "Palette", isDefault: true },
  { id: "ai-video", name: "AI Video", companyId: "consultancy", icon: "Video", isDefault: true },
  { id: "digital-marketing", name: "Digital Marketing", companyId: "consultancy", icon: "Megaphone", isDefault: true },
  { id: "loan", name: "Loan", companyId: "consultancy", icon: "Coins", isDefault: true },
  { id: "insurance", name: "Insurance", companyId: "consultancy", icon: "ShieldCheck", isDefault: true },
  { id: "education", name: "Education", companyId: "consultancy", icon: "GraduationCap", isDefault: true },
  { id: "legal", name: "Legal", companyId: "consultancy", icon: "Scale", isDefault: true },
];

export function slugifyCategoryId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseRawCategories(rawList: EcommerceCategoryItem[]) {
  const list = Array.isArray(rawList) ? rawList : [];
  const metaEntry = list.find((c) => c && c.id === DELETED_CATEGORIES_META_ID);
  const deletedIds = new Set<string>(
    Array.isArray(metaEntry?.deletedIds) ? metaEntry!.deletedIds!.map(String) : []
  );
  const customEntries = list.filter(
    (c) => c && c.id !== DELETED_CATEGORIES_META_ID && c.name
  );
  return { deletedIds, customEntries };
}

function mergeWithDefaults(rawList: EcommerceCategoryItem[]): EcommerceCategoryItem[] {
  const { deletedIds, customEntries } = parseRawCategories(rawList);
  const byId = new Map<string, EcommerceCategoryItem>();

  DEFAULT_ECOMMERCE_CATEGORIES.forEach((cat) => {
    if (!deletedIds.has(cat.id)) {
      byId.set(cat.id, cat);
    }
  });

  customEntries.forEach((cat) => {
    if (deletedIds.has(cat.id)) return;
    const defaultMatch = DEFAULT_ECOMMERCE_CATEGORIES.find((d) => d.id === cat.id);
    byId.set(cat.id, {
      ...cat,
      name: defaultMatch ? defaultMatch.name : cat.name,
      isDefault: Boolean(defaultMatch),
    });
  });

  return Array.from(byId.values());
}

async function fetchRawCategoryList(): Promise<EcommerceCategoryItem[]> {
  const res = await api.get("/store/ecommerce_categories");
  const raw = res?.data;
  return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
}

function buildPayload(customEntries: EcommerceCategoryItem[], deletedIds: Set<string>): EcommerceCategoryItem[] {
  const filteredCustom = customEntries.filter(
    (c) => c && c.id !== DELETED_CATEGORIES_META_ID && !deletedIds.has(c.id)
  );
  if (deletedIds.size === 0) {
    return filteredCustom;
  }
  return [
    ...filteredCustom,
    {
      id: DELETED_CATEGORIES_META_ID,
      name: "__deleted_categories__",
      companyId: "tech",
      deletedIds: Array.from(deletedIds),
    },
  ];
}

export async function getEcommerceCategories(): Promise<EcommerceCategoryItem[]> {
  try {
    const raw = await fetchRawCategoryList();
    return mergeWithDefaults(raw);
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

  let raw: EcommerceCategoryItem[] = [];
  try {
    raw = await fetchRawCategoryList();
  } catch {}
  const { deletedIds, customEntries } = parseRawCategoryList(raw);
  deletedIds.delete(cleanId);

  const isDefault = DEFAULT_ECOMMERCE_CATEGORIES.some((d) => d.id === cleanId);
  const newItem: EcommerceCategoryItem = {
    id: cleanId,
    name: category.name.trim(),
    companyId: category.companyId,
    icon: category.icon || (category.companyId === "tech" ? "Layers" : "Briefcase"),
    description: category.description?.trim() || "",
    isDefault,
    createdAt: new Date().toISOString(),
  };

  const nextCustom = customEntries.filter((c) => c.id !== cleanId);
  nextCustom.push(newItem);

  const payloadList = buildPayload(nextCustom, deletedIds);
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
  let raw: EcommerceCategoryItem[] = [];
  try {
    raw = await fetchRawCategoryList();
  } catch {}
  const { deletedIds, customEntries } = parseRawCategoryList(raw);

  if (DEFAULT_ECOMMERCE_CATEGORIES.some((d) => d.id === categoryId)) {
    deletedIds.add(categoryId);
  }
  const nextCustom = customEntries.filter((c) => c.id !== categoryId);
  const payloadList = buildPayload(nextCustom, deletedIds);

  await api.post("/store/ecommerce_categories", {
    data: payloadList,
    mode: "replace",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_categories_updated"));
  }

  return mergeWithDefaults(payloadList);
}

export async function restoreDefaultCategories(): Promise<EcommerceCategoryItem[]> {
  let raw: EcommerceCategoryItem[] = [];
  try {
    raw = await fetchRawCategoryList();
  } catch {}
  const { customEntries } = parseRawCategoryList(raw);
  const payloadList = buildPayload(customEntries, new Set<string>());

  await api.post("/store/ecommerce_categories", {
    data: payloadList,
    mode: "replace",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_categories_updated"));
  }

  return mergeWithDefaults(payloadList);
}
