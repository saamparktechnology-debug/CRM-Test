"use client";

import * as React from "react";
import { Plus, Search, Filter, Sparkles, Package, ExternalLink, Edit2, Trash2, Tag, Check, Eye, Clock, ShieldCheck, RefreshCw, Layers } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { EcommerceProduct, EcommerceCompany, EcommerceCategoryItem } from "@/features/ecommerce/types/ecommerce.types";
import { getEcommerceProducts, saveEcommerceProduct, deleteEcommerceProduct } from "@/features/ecommerce/services/ecommerceProductService";
import { getEcommerceCategories, DEFAULT_ECOMMERCE_CATEGORIES } from "@/features/ecommerce/services/ecommerceCategoryService";
import { ProductModal } from "@/features/ecommerce/components/ProductModal";
import { CategoryManagerModal } from "@/features/ecommerce/components/CategoryManagerModal";
import { confirmTwoStepDelete } from "@/lib/confirmDialog";

export default function EcommerceProductsPage() {
  const { user, activeCompanyId } = useAuthStore();
  const isAllCompanies = !activeCompanyId || activeCompanyId === "all" || activeCompanyId === "group" || activeCompanyId === "saampark-group";
  const { canPerformAction, isModuleAllowed } = usePermissionStore();

  const [products, setProducts] = React.useState<EcommerceProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<EcommerceProduct | null>(null);
  const [categories, setCategories] = React.useState<EcommerceCategoryItem[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);

  // Compute normalized operating company
  const isConsultancy = activeCompanyId === "2" || activeCompanyId === "consultancy" || activeCompanyId?.includes("consult");
  const companyScope = isAllCompanies ? "all" : isConsultancy ? "consultancy" : "tech";

  const loadProducts = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEcommerceProducts(companyScope);
      setProducts(data);
      const realCats = await getEcommerceCategories(data);
      setCategories(realCats);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyScope]);

  React.useEffect(() => {
    loadProducts();

    const handleDataSync = () => loadProducts();
    const handleCompSwitch = () => loadProducts();
    const loadCats = () => {
      getEcommerceCategories(products.length > 0 ? products : undefined)
        .then(setCategories)
        .catch(() => {});
    };

    window.addEventListener("saampark_ecommerce_updated", handleDataSync);
    window.addEventListener("saampark_ecommerce_categories_updated", loadCats);
    window.addEventListener("saampark_company_switched", handleCompSwitch);
    window.addEventListener("storage", handleDataSync);

    return () => {
      window.removeEventListener("saampark_ecommerce_updated", handleDataSync);
      window.removeEventListener("saampark_ecommerce_categories_updated", loadCats);
      window.removeEventListener("saampark_company_switched", handleCompSwitch);
      window.removeEventListener("storage", handleDataSync);
    };
  }, [loadProducts]);

  // Handle Save
  const handleSaveProduct = async (product: EcommerceProduct) => {
    await saveEcommerceProduct(product);
    await loadProducts();
  };

  // Handle Delete
  const handleDeleteProduct = async (p: EcommerceProduct) => {
    const confirmed = await confirmTwoStepDelete(
      `Are you sure you want to delete product "${p.name}"? This will remove it from the online store.`
    );
    if (!confirmed) return;
    await deleteEcommerceProduct(p.id, p.companyId);
    await loadProducts();
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.shortName && p.shortName.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.technologiesUsed && p.technologiesUsed.some((t) => t.toLowerCase().includes(q)));

    const matchesCategory =
      categoryFilter === "all" ||
      p.primaryCategory === categoryFilter ||
      p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  // Calculate metrics
  const totalCount = products.length;
  const activeCount = products.filter((p) => p.status === "Active").length;
  const featuredCount = products.filter((p) => p.isFeatured || p.isPopular).length;
  const techCount = products.filter((p) => p.companyId === "tech").length;
  const consultCount = products.filter((p) => p.companyId === "consultancy").length;

  const canAdd = user?.role === "Super Admin" || canPerformAction(user, "Ecommerce", "add");
  const canEdit = user?.role === "Super Admin" || canPerformAction(user, "Ecommerce", "edit");
  const canDelete = user?.role === "Super Admin" || canPerformAction(user, "Ecommerce", "delete");

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-6">
      {/* Top Header & Company Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manage E-Commerce Products
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Storefront Catalog & Services CMS &bull;
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  companyScope === "tech"
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                    : companyScope === "consultancy"
                    ? "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20"
                    : "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                }`}>
                  {companyScope === "tech"
                    ? "SAAMPARK TECHNOLOGY & RESEARCH"
                    : companyScope === "consultancy"
                    ? "SAAMPARK CONSULTANCY SERVICE"
                    : "Cross-Company View (Super Admin)"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="https://saampark.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            Live on saampark.com <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => loadProducts()}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh Catalog"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {canAdd && (
            <>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4 text-blue-600" /> Categories ({categories.length})
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Catalog Items
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</span>
            <span className="text-xs text-slate-400">Products</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Live in Storefront
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</span>
            <span className="text-xs text-emerald-500/80">Active</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Featured / Best Sellers
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-500">{featuredCount}</span>
            <span className="text-xs text-amber-500/80">Showcased</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Operating Division
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {companyScope === "tech" ? "Technology (STR)" : companyScope === "consultancy" ? "Consultancy (SCS)" : "All Companies"}
            </span>
            <span className="text-xs text-slate-400">
              {companyScope === "all" ? `${techCount} Tech / ${consultCount} Consult` : `${products.length} Items`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by product name, tech stack, deliverables..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">All Categories ({products.length})</option>
            {categories
              .filter((cat) =>
                companyScope === "all" ? true : cat.companyId === companyScope
              )
              .map((cat) => {
                const cnt = products.filter(
                  (p) => p.primaryCategory === cat.id || p.category === cat.id
                ).length;
                return (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cnt})
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Product Catalog Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">Loading catalog items...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">No products found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery ? "Try refining your search terms or filters." : "Start by adding the first product for this company."}
          </p>
          {canAdd && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow"
            >
              Add Product
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => {
            const isProdConsult = p.companyId === "consultancy";
            return (
              <div
                key={p.id}
                className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Image & Badges Overlay */}
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={p.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold shadow-sm ${
                      isProdConsult
                        ? "bg-orange-600 text-white"
                        : "bg-blue-600 text-white"
                    }`}>
                      {isProdConsult ? "CONSULTANCY" : "TECHNOLOGY"}
                    </span>
                    {p.badge && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500 text-slate-950 shadow-sm flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> {p.badge}
                      </span>
                    )}
                  </div>

                  {/* Status Pill */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow ${
                      p.status === "Active"
                        ? "bg-emerald-500 text-white"
                        : p.status === "Draft"
                        ? "bg-amber-500 text-white"
                        : "bg-slate-500 text-white"
                    }`}>
                      {p.status}
                    </span>
                  </div>

                  {/* Pricing tag over image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-baseline justify-between text-white">
                    <div>
                      <span className="text-xl font-bold font-mono">
                        ₹{(p.discountPrice || p.startingPrice).toLocaleString()}
                      </span>
                      {p.discountPrice && (
                        <span className="ml-2 text-xs text-slate-300 line-through">
                          ₹{p.startingPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <span className="text-xs bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" /> {p.deliveryDays || "3-5 Days"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Tech Stack Chips */}
                    {p.technologiesUsed && p.technologiesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.technologiesUsed.slice(0, 4).map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {tech}
                          </span>
                        ))}
                        {p.technologiesUsed.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">
                            +{p.technologiesUsed.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Deliverables Checklist preview */}
                    {p.features && p.features.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {p.features.slice(0, 2).map((feat, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span className="line-clamp-1">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Billing: <strong className="font-semibold text-slate-600 dark:text-slate-300 capitalize">{p.priceType}</strong>
                    </span>

                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        product={editingProduct}
        activeCompanyId={companyScope}
        products={products}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        defaultCompanyId={companyScope === "consultancy" ? "consultancy" : "tech"}
        products={products}
        onCategoriesUpdated={(updated) => setCategories(updated)}
      />
    </div>
  );
}
