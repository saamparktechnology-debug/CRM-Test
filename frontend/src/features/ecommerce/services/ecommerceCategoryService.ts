import { api } from "@/lib/api";
import { EcommerceCategoryItem, EcommerceCompany, EcommerceProduct } from "../types/ecommerce.types";
import { fetchModuleDataFromDB } from "@/lib/storageSync";

export const DELETED_CATEGORIES_META_ID = "__deleted_ids__";

export const REAL_CATEGORY_LABELS: Record<string, { name: string; companyId: EcommerceCompany; icon: string }> = {
  "web-services": { name: "Web Services", companyId: "tech", icon: "Globe" },
  "application-services": { name: "Application Services", companyId: "tech", icon: "Smartphone" },
  "software-services": { name: "Software Services", companyId: "tech", icon: "Cpu" },
  "ai-services": { name: "AI Services", companyId: "tech", icon: "Bot" },
  "maintenance-services": { name: "Maintenance Services", companyId: "tech", icon: "Wrench" },
  "hosting-services": { name: "Hosting & Server Services", companyId: "tech", icon: "Server" },
  "graphic-design": { name: "Graphic Design", companyId: "consultancy", icon: "Palette" },
  "ai-video": { name: "AI Video", companyId: "consultancy", icon: "Video" },
  "digital-marketing": { name: "Digital Marketing", companyId: "consultancy", icon: "Megaphone" },
  "loan": { name: "Loan", companyId: "consultancy", icon: "Coins" },
  "insurance": { name: "Insurance", companyId: "consultancy", icon: "ShieldCheck" },
  "education": { name: "Education", companyId: "consultancy", icon: "GraduationCap" },
  "legal": { name: "Legal", companyId: "consultancy", icon: "Scale" },
};

// Kept for initial typing fallback; populated dynamically from real catalog products
export const DEFAULT_ECOMMERCE_CATEGORIES: EcommerceCategoryItem[] = [
  { id: "web-services", name: "Web Services", companyId: "tech", icon: "Globe", isDefault: true },
  { id: "application-services", name: "Application Services", companyId: "tech", icon: "Smartphone", isDefault: true },
  { id: "software-services", name: "Software Services", companyId: "tech", icon: "Cpu", isDefault: true },
  { id: "maintenance-services", name: "Maintenance Services", companyId: "tech", icon: "Wrench", isDefault: true },
  { id: "hosting-services", name: "Hosting & Server Services", companyId: "tech", icon: "Server", isDefault: true },
  { id: "ai-video", name: "AI Video", companyId: "consultancy", icon: "Video", isDefault: true },
  { id: "digital-marketing", name: "Digital Marketing", companyId: "consultancy", icon: "Megaphone", isDefault: true },
  { id: "legal", name: "Legal", companyId: "consultancy", icon: "Scale", isDefault: true },
];

export function slugifyCategoryId(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function prettyCategoryName(slug: string): string {
  if (REAL_CATEGORY_LABELS[slug]) return REAL_CATEGORY_LABELS[slug].name;
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
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

async function fetchRawCategoryList(): Promise<EcommerceCategoryItem[]> {
  try {
    const res = await api.get("/store/ecommerce_categories");
    const raw = res?.data;
    return Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
  } catch {
    return [];
  }
}

async function fetchRealProductsForCategories(): Promise<EcommerceProduct[]> {
  try {
    const [tech, consult] = await Promise.all([
      fetchModuleDataFromDB<EcommerceProduct[]>("ecommerce_products", [], "tech"),
      fetchModuleDataFromDB<EcommerceProduct[]>("ecommerce_products", [], "consultancy"),
    ]);
    return [
      ...(Array.isArray(tech) ? tech : []),
      ...(Array.isArray(consult) ? consult : []),
    ];
  } catch {
    return [];
  }
}

export function buildRealCategoriesList(
  rawList: EcommerceCategoryItem[],
  products: EcommerceProduct[]
): EcommerceCategoryItem[] {
  const { deletedIds, customEntries } = parseRawCategories(rawList);
  const byId = new Map<string, EcommerceCategoryItem>();

  // 1. Derive real categories present on actual live products
  (Array.isArray(products) ? products : []).forEach((p) => {
    const catId = String(p?.primaryCategory || "").trim();
    if (!catId || deletedIds.has(catId)) return;
    if (!byId.has(catId)) {
      const meta = REAL_CATEGORY_LABELS[catId];
      const comp: EcommerceCompany =
        p.companyId === "consultancy" || p.group === "consultancy"
          ? "consultancy"
          : meta?.companyId || "tech";
      byId.set(catId, {
        id: catId,
        name: prettyCategoryName(catId),
        companyId: comp,
        icon: meta?.icon || (comp === "consultancy" ? "Briefcase" : "Layers"),
      });
    }
  });

  // 2. Include explicitly added / customized categories stored in DB
  customEntries.forEach((cat) => {
    if (deletedIds.has(cat.id)) return;
    byId.set(cat.id, {
      ...cat,
      name: cat.name.trim(),
    });
  });

  // 3. Fallback only if DB has literally 0 products & 0 custom categories
  if (byId.size === 0 && (!products || products.length === 0)) {
    DEFAULT_ECOMMERCE_CATEGORIES.forEach((cat) => {
      if (!deletedIds.has(cat.id)) byId.set(cat.id, cat);
    });
  }

  return Array.from(byId.values());
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

export async function getEcommerceCategories(
  knownProducts?: EcommerceProduct[]
): Promise<EcommerceCategoryItem[]> {
  try {
    const [raw, products] = await Promise.all([
      fetchRawCategoryList(),
      knownProducts ? Promise.resolve(knownProducts) : fetchRealProductsForCategories(),
    ]);
    return buildRealCategoriesList(raw, products);
  } catch {
    return buildRealCategoriesList([], knownProducts || []);
  }
}

export async function saveEcommerceCategory(
  category: {
    id?: string;
    name: string;
    companyId: EcommerceCompany;
    icon?: string;
    description?: string;
  },
  knownProducts?: EcommerceProduct[]
): Promise<EcommerceCategoryItem[]> {
  const cleanId = slugifyCategoryId(category.id || category.name);
  if (!cleanId || !category.name.trim()) {
    throw new Error("Category name is required");
  }

  const [raw, products] = await Promise.all([
    fetchRawCategoryList(),
    knownProducts ? Promise.resolve(knownProducts) : fetchRealProductsForCategories(),
  ]);
  const { deletedIds, customEntries } = parseRawCategories(raw);
  deletedIds.delete(cleanId);

  const meta = REAL_CATEGORY_LABELS[cleanId];
  const newItem: EcommerceCategoryItem = {
    id: cleanId,
    name: category.name.trim(),
    companyId: category.companyId,
    icon: category.icon || meta?.icon || (category.companyId === "tech" ? "Layers" : "Briefcase"),
    description: category.description?.trim() || "",
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

  return buildRealCategoriesList(payloadList, products);
}

export async function deleteEcommerceCategory(
  categoryId: string,
  knownProducts?: EcommerceProduct[]
): Promise<EcommerceCategoryItem[]> {
  const [raw, products] = await Promise.all([
    fetchRawCategoryList(),
    knownProducts ? Promise.resolve(knownProducts) : fetchRealProductsForCategories(),
  ]);
  const { deletedIds, customEntries } = parseRawCategories(raw);

  // Mark deleted if any product uses it or it's a known label so it stays hidden
  if (
    products.some((p) => p?.primaryCategory === categoryId) ||
    Boolean(REAL_CATEGORY_LABELS[categoryId])
  ) {
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

  return buildRealCategoriesList(payloadList, products);
}
