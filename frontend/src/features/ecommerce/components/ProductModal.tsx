"use client";

import * as React from "react";
import { X, Plus, Trash2, Image, Layers, DollarSign, Clock, Tag, Sparkles, Check } from "lucide-react";
import { EcommerceProduct, EcommerceCompany } from "../types/ecommerce.types";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: EcommerceProduct) => Promise<void>;
  product?: EcommerceProduct | null;
  activeCompanyId: string;
}

export function ProductModal({ isOpen, onClose, onSave, product, activeCompanyId }: ProductModalProps) {
  const isConsultancy = activeCompanyId === "2" || activeCompanyId === "consultancy" || activeCompanyId?.includes("consult");
  const defaultComp: EcommerceCompany = isConsultancy ? "consultancy" : "tech";

  const [formData, setFormData] = React.useState<Partial<EcommerceProduct>>({
    name: "",
    shortName: "",
    slug: "",
    companyId: defaultComp,
    primaryCategory: isConsultancy ? "graphic-design" : "web-services",
    category: isConsultancy ? "graphic-design" : "website",
    startingPrice: 4999,
    discountPrice: 3999,
    priceType: "one-time",
    deliveryDays: "3-5 Days",
    badge: "Popular",
    isPopular: true,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    description: "",
    features: [
      "Custom responsive design for desktop and mobile",
      "Fast cloud performance optimization",
      "Instant WhatsApp & lead enquiry integration",
      "1-Year free cloud hosting and SSL certificate"
    ],
    technologiesUsed: ["Next.js", "React", "Tailwind CSS"],
    faqs: [
      { question: "How long does delivery take?", answer: "Delivery takes 3 to 5 business days after receiving assets." }
    ]
  });

  const [newFeature, setNewFeature] = React.useState("");
  const [techInput, setTechInput] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (product) {
      setFormData(product);
      setTechInput((product.technologiesUsed || []).join(", "));
    } else {
      setFormData({
        name: "",
        shortName: "",
        slug: "",
        companyId: defaultComp,
        primaryCategory: isConsultancy ? "graphic-design" : "web-services",
        category: isConsultancy ? "graphic-design" : "website",
        startingPrice: 4999,
        discountPrice: 3999,
        priceType: "one-time",
        deliveryDays: "3-5 Days",
        badge: "Popular",
        isPopular: true,
        isFeatured: true,
        status: "Active",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        description: "",
        features: [
          "Custom responsive design for desktop and mobile",
          "Fast cloud performance optimization",
          "Instant WhatsApp & lead enquiry integration"
        ],
        technologiesUsed: ["Next.js", "React", "Tailwind CSS"],
        faqs: [
          { question: "How long does delivery take?", answer: "Delivery takes 3 to 5 business days." }
        ]
      });
      setTechInput("Next.js, React, Tailwind CSS");
    }
  }, [product, activeCompanyId, isConsultancy, defaultComp, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug && product ? prev.slug : slug,
      shortName: prev.shortName || name.slice(0, 20)
    }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    setNewFeature("");
  };

  const removeFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== idx)
    }));
  };

  const handleTechChange = (val: string) => {
    setTechInput(val);
    const list = val.split(",").map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, technologiesUsed: list }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    setIsSubmitting(true);
    try {
      const payload: EcommerceProduct = {
        id: product?.id || `prod-${formData.companyId || defaultComp}-${Date.now().toString(36)}`,
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || formData.name.trim(),
        slug: formData.slug?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        companyId: formData.companyId || defaultComp,
        primaryCategory: formData.primaryCategory || "web-services",
        category: formData.category || "website",
        startingPrice: Number(formData.startingPrice) || 0,
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        priceType: formData.priceType || "one-time",
        deliveryDays: formData.deliveryDays || "3-5 Days",
        badge: formData.badge || "",
        isPopular: !!formData.isPopular,
        isFeatured: !!formData.isFeatured,
        status: formData.status || "Active",
        image: formData.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        description: formData.description || "",
        features: formData.features && formData.features.length > 0 ? formData.features : ["Standard Deliverable"],
        technologiesUsed: formData.technologiesUsed || [],
        faqs: formData.faqs || [],
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${formData.companyId === "tech" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {product ? "Edit E-Commerce Product" : "Add New E-Commerce Product"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure service details, delivery time, tech stack, and storefront features
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Company Assignment & Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Company *
              </label>
              <select
                value={formData.companyId}
                onChange={(e) => setFormData({ ...formData, companyId: e.target.value as EcommerceCompany })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="tech">SAAMPARK TECHNOLOGY & RESEARCH</option>
                <option value="consultancy">SAAMPARK CONSULTANCY SERVICE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="Active">Active (Visible in Storefront)</option>
                <option value="Draft">Draft (Internal Only)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Promotional Badge
              </label>
              <input
                type="text"
                placeholder="e.g. Best Seller, Trending, Hot"
                value={formData.badge || ""}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Product Name, Slug, Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Product / Service Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Full Stack E-Commerce Platform"
                value={formData.name || ""}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                SEO Slug / URL Path
              </label>
              <input
                type="text"
                value={formData.slug || ""}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Primary Category
              </label>
              <select
                value={formData.primaryCategory}
                onChange={(e) => setFormData({ ...formData, primaryCategory: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {formData.companyId === "tech" ? (
                  <>
                    <option value="web-services">Web Development & Portals</option>
                    <option value="application-services">Mobile Apps (Android & iOS)</option>
                    <option value="software-services">Custom Cloud Software & ERP</option>
                    <option value="ai-services">AI Integrations & Automation</option>
                    <option value="maintenance-services">Maintenance & Security</option>
                  </>
                ) : (
                  <>
                    <option value="graphic-design">Graphic Design & Brand Identity</option>
                    <option value="legal">Corporate Legal & Company Registration</option>
                    <option value="digital-marketing">Digital Marketing & Growth Ads</option>
                    <option value="loan">Loan Advisory & Corporate Finance</option>
                    <option value="insurance">Insurance Consultancy</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Delivery Timeline *
              </label>
              <input
                type="text"
                placeholder="e.g. 3-5 Days, 10-14 Days"
                value={formData.deliveryDays || ""}
                onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pricing Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Standard / Original Price (₹) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.startingPrice || 0}
                onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Discounted Offer Price (₹)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Optional"
                value={formData.discountPrice || ""}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-emerald-600 dark:text-emerald-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Billing Model
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value as any })}
                className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="one-time">One-Time Project Payment</option>
                <option value="monthly">Monthly Recurring Retainer</option>
                <option value="weekly">Weekly Payment</option>
                <option value="on-request">Custom Quote / On Request</option>
              </select>
            </div>
          </div>

          {/* Image URL & Thumbnail preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Thumbnail / Banner Image URL
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="url"
                value={formData.image || ""}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {formData.image && (
                <div className="w-12 h-10 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 flex-shrink-0">
                  <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Product Overview & Value Proposition *
            </label>
            <textarea
              rows={3}
              required
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of deliverables, target audience, and business benefits..."
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Technologies Used (Tags) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Technologies / Tools Used (comma-separated)
            </label>
            <input
              type="text"
              value={techInput}
              onChange={(e) => handleTechChange(e.target.value)}
              placeholder="e.g. Next.js, React, Node.js, MySQL, Tailwind CSS, Docker"
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(formData.technologiesUsed || []).map((tech, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 text-xs rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Features / Deliverables Checklist */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Key Features & Deliverables Checklist
            </label>
            <div className="space-y-2 mb-3">
              {(formData.features || []).map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200">{feat}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another deliverable item..."
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={addFeature}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Highlight as Popular in Store
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={!!formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              Feature on Homepage Slider & Showcase
            </label>
          </div>

          {/* Modal Footer */}
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
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : product ? "Update Product" : "Publish Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
