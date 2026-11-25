"use client";

import * as React from "react";
import { X, Plus, Trash2, Layers, Sparkles, Check } from "lucide-react";
import { EcommerceCategoryItem, EcommerceCompany } from "../types/ecommerce.types";
import {
  getEcommerceCategories,
  saveEcommerceCategory,
  deleteEcommerceCategory,
  slugifyCategoryId,
} from "../services/ecommerceCategoryService";

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCompanyId?: EcommerceCompany;
  onCategoriesUpdated?: (categories: EcommerceCategoryItem[], created?: EcommerceCategoryItem) => void;
}

const ICON_OPTIONS = [
  "Layers",
  "Globe",
  "Smartphone",
  "Cpu",
  "Bot",
  "Wrench",
  "Server",
  "Palette",
  "Video",
  "Megaphone",
  "Scale",
  "Coins",
  "ShieldCheck",
  "GraduationCap",
  "Briefcase",
];

export function CategoryManagerModal({
  isOpen,
  onClose,
  defaultCompanyId = "tech",
  onCategoriesUpdated,
}: CategoryManagerModalProps) {
  const [categories, setCategories] = React.useState<EcommerceCategoryItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [name, setName] = React.useState("");
  const [companyId, setCompanyId] = React.useState<EcommerceCompany>(defaultCompanyId);
  const [icon, setIcon] = React.useState("Layers");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCompanyId(defaultCompanyId);
  }, [defaultCompanyId]);

  const loadCats = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await getEcommerceCategories();
      setCategories(list);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      loadCats();
      setError(null);
    }
  }, [isOpen, loadCats]);

  if (!isOpen) return null;

  const generatedSlug = slugifyCategoryId(name);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await saveEcommerceCategory({
        name: name.trim(),
        companyId,
        icon,
      });
      setCategories(updated);
      const created = updated.find((c) => c.id === generatedSlug);
      setName("");
      onCategoriesUpdated?.(updated, created);
    } catch (err: any) {
      setError(err?.message || "Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (catId: string) => {
    setSaving(true);
    try {
      const updated = await deleteEcommerceCategory(catId);
      setCategories(updated);
      onCategoriesUpdated?.(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Manage E-Commerce Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create custom storefront categories for Technology or Consultancy divisions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <form
            onSubmit={handleCreate}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Add New Category
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Display Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cybersecurity Audits, Cloud DevOps"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {generatedSlug && (
                  <p className="text-[11px] font-mono text-slate-400 mt-1">
                    Slug ID: {generatedSlug}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Division *
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value as EcommerceCompany)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="tech">Technology (STR)</option>
                  <option value="consultancy">Consultancy (SCS)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Storefront Icon
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {ICON_OPTIONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow flex items-center gap-1.5 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                {saving ? "Saving..." : "Create Category"}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Storefront Categories ({categories.length})
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading categories...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            cat.companyId === "tech"
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                              : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                          }`}
                        >
                          {cat.companyId === "tech" ? "TECH" : "CONSULTANCY"}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                          {cat.id}
                        </span>
                      </div>
                    </div>

                    {cat.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <Check className="w-3 h-3" /> Core
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id)}
                        disabled={saving}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete custom category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
