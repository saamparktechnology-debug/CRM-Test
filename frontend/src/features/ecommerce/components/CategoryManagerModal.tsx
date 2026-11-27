"use client";

import * as React from "react";
import { X, Plus, Trash2, Layers, Check } from "lucide-react";
import { EcommerceCategoryItem, EcommerceCompany, EcommerceProduct } from "../types/ecommerce.types";
import {
  getEcommerceCategories,
  saveEcommerceCategory,
  deleteEcommerceCategory,
} from "../services/ecommerceCategoryService";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: EcommerceCompany;
  companyScope?: EcommerceCompany | "all";
  products?: EcommerceProduct[];
  onCategoriesUpdated?: (categories: EcommerceCategoryItem[], created?: EcommerceCategoryItem) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  defaultCompanyId = "tech",
  companyScope = "all",
  products = [],
  onCategoriesUpdated,
}: CategoryManagerModalProps) {
  const isScoped = companyScope === "tech" || companyScope === "consultancy";
  const effectiveDefaultCompany: EcommerceCompany = isScoped ? companyScope : defaultCompanyId;

  const [categories, setCategories] = React.useState<EcommerceCategoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState("");
  const [companyId, setCompanyId] = React.useState<EcommerceCompany>(effectiveDefaultCompany);
  const [confirmDeleteId, setConfirmDeleteId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCompanyId(effectiveDefaultCompany);
  }, [effectiveDefaultCompany]);

  const loadCats = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await getEcommerceCategories(products.length > 0 ? products : undefined);
      setCategories(list);
    } finally {
      setLoading(false);
    }
  }, [products]);

  React.useEffect(() => {
    if (isOpen) {
      loadCats();
      setError(null);
      setConfirmDeleteId(null);
    }
  }, [isOpen, loadCats]);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }
    const targetCompanyId: EcommerceCompany = isScoped ? companyScope : companyId;
    setSaving(true);
    setError(null);
    try {
      const updated = await saveEcommerceCategory(
        { name: name.trim(), companyId: targetCompanyId },
        products.length > 0 ? products : undefined
      );
      setCategories(updated);
      const created = updated.find(
        (c) =>
          c.name.toLowerCase() === name.trim().toLowerCase() &&
          c.companyId === targetCompanyId
      );
      setName("");
      onCategoriesUpdated?.(updated, created);
    } catch (err: any) {
      setError(err?.message || "Failed to add category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId: string) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await deleteEcommerceCategory(
        catId,
        products.length > 0 ? products : undefined
      );
      setCategories(updated);
      setConfirmDeleteId(null);
      onCategoriesUpdated?.(updated);
    } catch (err: any) {
      setError(err?.message || "Failed to delete category");
    } finally {
      setSaving(false);
    }
  };

  const visibleCategories = isScoped
    ? categories.filter((c) => c.companyId === companyScope)
    : categories;

  const countFor = (cat: EcommerceCategoryItem) =>
    products.filter(
      (p) =>
        (p.primaryCategory === cat.id || p.category === cat.id) &&
        (!isScoped ? p.companyId === cat.companyId : true)
    ).length;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Manage Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Simple one-step category add &amp; delete
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Ultra-simple single-row Add form */}
          <form onSubmit={handleCreate} className="space-y-2.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="Type new category name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
              {isScoped ? (
                <div
                  className={`px-3.5 py-2.5 text-sm rounded-xl border font-semibold flex items-center whitespace-nowrap ${
                    companyScope === "consultancy"
                      ? "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400"
                      : "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400"
                  }`}
                >
                  {companyScope === "consultancy" ? "Consultancy (SCS)" : "Technology (STR)"}
                </div>
              ) : (
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value as EcommerceCompany)}
                  className="px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
                >
                  <option value="tech">Technology (STR)</option>
                  <option value="consultancy">Consultancy (SCS)</option>
                </select>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {saving ? "Adding..." : "Add"}
              </button>
            </div>
          </form>

          {/* Simple Active Categories List */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Categories ({visibleCategories.length})
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading categories...</div>
            ) : visibleCategories.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                No categories added yet. Add your first category above.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900">
                {visibleCategories.map((cat) => {
                  const pCount = countFor(cat);
                  const isConfirming = confirmDeleteId === cat.id;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${
                            cat.companyId === "tech"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {cat.companyId === "tech" ? "STR" : "SCS"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 flex-shrink-0">
                          ({pCount})
                        </span>
                      </div>

                      {isConfirming ? (
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[11px] text-red-500 font-semibold">
                            {pCount > 0 ? `Remove (${pCount} items)?` : "Delete?"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat.id)}
                            disabled={saving}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
                          >
                            <Check className="w-3 h-3" /> Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(cat.id)}
                          disabled={saving}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                          title={`Delete ${cat.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
