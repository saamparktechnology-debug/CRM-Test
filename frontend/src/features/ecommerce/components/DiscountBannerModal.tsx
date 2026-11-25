"use client";

import * as React from "react";
import { X, Tag } from "lucide-react";
import { DiscountBanner } from "../types/ecommerce.types";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

interface DiscountBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: DiscountBanner) => void;
  banner?: DiscountBanner | null;
}

export function DiscountBannerModal({ isOpen, onClose, onSave, banner }: DiscountBannerModalProps) {
  const [formData, setFormData] = React.useState<Partial<DiscountBanner>>({
    title: "",
    badge: "Limited Offer",
    discountPercentage: 20,
    discountText: "",
    promoCode: "",
    showInCheckout: false,
    validUntil: "2026-12-31",
    ctaText: "Claim Offer",
    ctaLink: "/#marketplace-catalog",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    isActive: true,
  });

  React.useEffect(() => {
    if (banner) {
      setFormData({
        ...banner,
        showInCheckout: !!banner.showInCheckout,
      });
    } else {
      setFormData({
        title: "",
        badge: "Special Offer",
        discountPercentage: 20,
        discountText: "FLAT 20% DISCOUNT THIS MONTH",
        promoCode: "SAVE20",
        showInCheckout: false,
        validUntil: "2026-12-31",
        ctaText: "Claim Offer",
        ctaLink: "/#marketplace-catalog",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
        isActive: true,
      });
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    const pct = Number(formData.discountPercentage) || 0;
    const finalBanner: DiscountBanner = {
      id: banner?.id || `banner-${Date.now().toString(36)}`,
      title: formData.title.trim(),
      badge: formData.badge?.trim() || (pct > 0 ? `${pct}% OFF` : "Featured"),
      discountPercentage: pct,
      discountText: formData.discountText?.trim() || (pct > 0 ? `FLAT ${pct}% OFF` : formData.title.trim()),
      promoCode: formData.promoCode?.trim().toUpperCase() || "",
      showInCheckout: !!formData.showInCheckout,
      validUntil: formData.validUntil || "",
      ctaText: formData.ctaText?.trim() || "Claim Offer",
      ctaLink: formData.ctaLink?.trim() || "/#marketplace-catalog",
      image: formData.image?.trim() || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      isActive: !!formData.isActive,
    };
    onSave(finalBanner);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {banner ? "Edit Promotional Banner" : "Add New Promotional Banner"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Discount callout banners and seasonal campaign banners
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Campaign / Banner Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Diwali Digital Booster Pack"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discountPercentage || 0}
                onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Promo Code
              </label>
              <input
                type="text"
                placeholder="e.g. DIWALI25"
                value={formData.promoCode || ""}
                onChange={(e) => setFormData({ ...formData, promoCode: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Highlighted Banner Text
            </label>
            <input
              type="text"
              placeholder="e.g. FLAT 25% DISCOUNT ON CUSTOM CRM & ERP SYSTEMS"
              value={formData.discountText || ""}
              onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Valid Until Date
              </label>
              <input
                type="date"
                value={formData.validUntil || ""}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Badge Label
              </label>
              <input
                type="text"
                placeholder="e.g. Limited Offer"
                value={formData.badge || ""}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                CTA Button &amp; Link
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Claim Offer"
                  value={formData.ctaText || ""}
                  onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                  className="w-1/2 px-2.5 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="/#marketplace-catalog"
                  value={formData.ctaLink || ""}
                  onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                  className="w-1/2 px-2.5 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <ImageUploadField
              label="Banner Slider Image"
              value={formData.image || ""}
              onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
              placeholder="https://... or choose file above"
              uploadNamePrefix="promo_banner"
              aspectRatio="wide"
            />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              Active Banner (Show in Homepage Slider)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!formData.showInCheckout}
                onChange={(e) => setFormData({ ...formData, showInCheckout: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Show Promo Coupon in Ordering / Checkout Section
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
            >
              {banner ? "Save Changes" : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
