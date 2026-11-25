"use client";

import * as React from "react";
import { X, Layers } from "lucide-react";
import { CoreCapabilitySlide } from "../types/ecommerce.types";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

interface CoreSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: CoreCapabilitySlide) => void;
  slide?: CoreCapabilitySlide | null;
}

export function CoreSliderModal({ isOpen, onClose, onSave, slide }: CoreSliderModalProps) {
  const [formData, setFormData] = React.useState<Partial<CoreCapabilitySlide>>({
    title: "",
    tag: "",
    description: "",
    image: "https://saampark.com/assets/images/services/str-web-dynamic.png",
    accent: "#EB412C",
    targetSectionId: "web-services",
    order: 1,
    isActive: true,
  });

  React.useEffect(() => {
    if (slide) {
      setFormData(slide);
    } else {
      setFormData({
        title: "",
        tag: "",
        description: "",
        image: "https://saampark.com/assets/images/services/str-web-dynamic.png",
        accent: "#EB412C",
        targetSectionId: "web-services",
        order: 1,
        isActive: true,
      });
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) return;
    const slugId = formData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const payload: CoreCapabilitySlide = {
      id: slide?.id || slugId || `core-${Date.now().toString(36)}`,
      title: formData.title.trim(),
      tag: formData.tag?.trim() || "SAAMPARK CORE",
      description: formData.description?.trim() || "",
      image: formData.image?.trim() || "https://saampark.com/assets/images/services/str-web-dynamic.png",
      accent: formData.accent || "#EB412C",
      targetSectionId: formData.targetSectionId?.trim() || "marketplace-catalog",
      order: Number(formData.order) || 1,
      isActive: formData.isActive !== false,
    };
    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {slide ? "Edit Core Capability Slider" : "Add Core Capability Slider"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize cards in the "Explore Our Core" 3D slider on the storefront
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Slider Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Web Development"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Top Pill Tag *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Next.js & E-Commerce"
                value={formData.tag || ""}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Short Description *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Dynamic & high-converting storefronts built for scale."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <ImageUploadField
              label="Slider Visual Image"
              value={formData.image || ""}
              onChange={(url) => setFormData({ ...formData, image: url })}
              placeholder="Paste image URL or upload"
              previewClass="h-28 w-full object-contain rounded-lg bg-slate-100 dark:bg-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Category ID
              </label>
              <input
                type="text"
                placeholder="e.g. web-services"
                value={formData.targetSectionId || ""}
                onChange={(e) => setFormData({ ...formData, targetSectionId: e.target.value })}
                className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.accent || "#EB412C"}
                  onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                  className="w-10 h-9 p-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.accent || "#EB412C"}
                  onChange={(e) => setFormData({ ...formData, accent: e.target.value })}
                  className="w-full px-2 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Order
              </label>
              <input
                type="number"
                min={1}
                value={formData.order ?? 1}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive !== false}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            Visible in Live Storefront ("Explore Our Core")
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
            >
              {slide ? "Save Core Slider" : "Add Core Slider"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
