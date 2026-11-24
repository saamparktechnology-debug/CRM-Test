"use client";

import * as React from "react";
import { X, Sparkles, Image, Link as LinkIcon, Check } from "lucide-react";
import { HeroSlide } from "../types/ecommerce.types";

interface HeroSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: HeroSlide) => void;
  slide?: HeroSlide | null;
}

export function HeroSlideModal({ isOpen, onClose, onSave, slide }: HeroSlideModalProps) {
  const [formData, setFormData] = React.useState<Partial<HeroSlide>>({
    title: "",
    subtitle: "",
    badge: "",
    ctaText: "Get Started",
    ctaLink: "/services",
    secondaryCtaText: "Learn More",
    secondaryCtaLink: "/contact",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
    bgGradient: "from-blue-900/80 via-indigo-950/90 to-black",
    order: 1,
    isActive: true,
  });

  React.useEffect(() => {
    if (slide) {
      setFormData(slide);
    } else {
      setFormData({
        title: "",
        subtitle: "",
        badge: "FEATURED SHOWCASE",
        ctaText: "Explore Packages",
        ctaLink: "/services",
        secondaryCtaText: "Contact Us",
        secondaryCtaLink: "/contact",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
        bgGradient: "from-blue-900/80 via-indigo-950/90 to-black",
        order: 1,
        isActive: true,
      });
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    const finalSlide: HeroSlide = {
      id: slide?.id || `slide-${Date.now().toString(36)}`,
      title: formData.title.trim(),
      subtitle: formData.subtitle?.trim() || "",
      badge: formData.badge?.trim() || "",
      ctaText: formData.ctaText?.trim() || "Explore",
      ctaLink: formData.ctaLink?.trim() || "/services",
      secondaryCtaText: formData.secondaryCtaText?.trim() || "",
      secondaryCtaLink: formData.secondaryCtaLink?.trim() || "",
      image: formData.image?.trim() || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      bgGradient: formData.bgGradient || "from-blue-900/80 via-indigo-950/90 to-black",
      order: Number(formData.order) || 1,
      isActive: !!formData.isActive,
    };
    onSave(finalSlide);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {slide ? "Edit Hero Carousel Slide" : "Add New Hero Carousel Slide"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visual hero banner visible on the homepage storefront
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
              Highlight Pill / Badge Text
            </label>
            <input
              type="text"
              placeholder="e.g. SAAMPARK TECHNOLOGY & RESEARCH"
              value={formData.badge || ""}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Hero Heading / Main Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Architecting Next-Generation Digital Experiences"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Subtitle / Overview Paragraph
            </label>
            <textarea
              rows={2}
              placeholder="High-performance websites, custom cloud ERPs, and native mobile apps..."
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary CTA Button Text
              </label>
              <input
                type="text"
                placeholder="e.g. Explore Digital Solutions"
                value={formData.ctaText || ""}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary CTA Link URL
              </label>
              <input
                type="text"
                placeholder="/services or https://..."
                value={formData.ctaLink || ""}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Secondary Button Text (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Request Fast Quote"
                value={formData.secondaryCtaText || ""}
                onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Secondary Button Link URL
              </label>
              <input
                type="text"
                placeholder="/contact"
                value={formData.secondaryCtaLink || ""}
                onChange={(e) => setFormData({ ...formData, secondaryCtaLink: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Background Hero Image URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
              {formData.image && (
                <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 flex-shrink-0">
                  <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Slide is Active & Live
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Display Order:</span>
              <input
                type="number"
                min="1"
                value={formData.order || 1}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-16 px-2 py-1 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-center font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              Save Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
