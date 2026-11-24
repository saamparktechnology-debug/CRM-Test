"use client";

import * as React from "react";
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Ban,
  HelpCircle,
  Code2,
  Layers,
  DollarSign,
  Eye
} from "lucide-react";
import { EcommerceProduct, EcommerceCompany } from "../types/ecommerce.types";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

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

  const [activeTab, setActiveTab] = React.useState<"general" | "pricing" | "media" | "features" | "faqs">("general");

  const [formData, setFormData] = React.useState<Partial<EcommerceProduct>>({
    name: "",
    shortName: "",
    slug: "",
    companyId: defaultComp,
    primaryCategory: isConsultancy ? "graphic-design" : "web-services",
    category: isConsultancy ? "graphic-design" : "website",
    sector: isConsultancy ? "digital-marketing" : "web-development",
    startingPrice: 4999,
    discountPrice: 3999,
    priceType: "one-time",
    deliveryDays: "3-5 Days",
    badge: "Popular",
    isPopular: true,
    isFeatured: true,
    status: "Active",
    color: "#2563EB",
    icon: "Globe",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    description: "",
    features: [
      "Custom responsive design for desktop and mobile",
      "Fast cloud performance optimization",
      "Instant WhatsApp & lead enquiry integration",
      "1-Year free cloud hosting and SSL certificate"
    ],
    notIncluded: ["Domain registration (available as add-on)"],
    technologiesUsed: ["Next.js", "React", "Tailwind CSS"],
    faqs: [
      { question: "How long does delivery take?", answer: "Delivery takes 3 to 5 business days after receiving assets." },
      { question: "Is post-launch support included?", answer: "Yes, we provide 30 days of complimentary support after launch." }
    ]
  });

  const [newFeature, setNewFeature] = React.useState("");
  const [newNotIncluded, setNewNotIncluded] = React.useState("");
  const [newTech, setNewTech] = React.useState("");
  const [newFaqQ, setNewFaqQ] = React.useState("");
  const [newFaqA, setNewFaqA] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (product) {
      setFormData(product);
    } else {
      setFormData({
        name: "",
        shortName: "",
        slug: "",
        companyId: defaultComp,
        primaryCategory: isConsultancy ? "graphic-design" : "web-services",
        category: isConsultancy ? "graphic-design" : "website",
        sector: isConsultancy ? "digital-marketing" : "web-development",
        startingPrice: 4999,
        discountPrice: 3999,
        priceType: "one-time",
        deliveryDays: "3-5 Days",
        badge: "Popular",
        isPopular: true,
        isFeatured: true,
        status: "Active",
        color: isConsultancy ? "#EB412C" : "#2563EB",
        icon: isConsultancy ? "Briefcase" : "Globe",
        image: isConsultancy
          ? "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80"
          : "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        description: "",
        features: [
          "Custom responsive design for desktop and mobile",
          "Fast cloud performance optimization",
          "Instant WhatsApp & lead enquiry integration"
        ],
        notIncluded: [],
        technologiesUsed: isConsultancy ? ["Adobe Illustrator", "Photoshop", "Figma"] : ["Next.js", "React", "Tailwind CSS"],
        faqs: [
          { question: "How long does delivery take?", answer: "Delivery takes 3 to 5 business days." }
        ]
      });
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
      shortName: prev.shortName || name.slice(0, 24)
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

  const addNotIncluded = () => {
    if (!newNotIncluded.trim()) return;
    setFormData((prev) => ({
      ...prev,
      notIncluded: [...(prev.notIncluded || []), newNotIncluded.trim()]
    }));
    setNewNotIncluded("");
  };

  const removeNotIncluded = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      notIncluded: (prev.notIncluded || []).filter((_, i) => i !== idx)
    }));
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    const current = formData.technologiesUsed || [];
    if (!current.includes(newTech.trim())) {
      setFormData((prev) => ({
        ...prev,
        technologiesUsed: [...current, newTech.trim()]
      }));
    }
    setNewTech("");
  };

  const removeTech = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      technologiesUsed: (prev.technologiesUsed || []).filter((t) => t !== item)
    }));
  };

  const addFaq = () => {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    setFormData((prev) => ({
      ...prev,
      faqs: [...(prev.faqs || []), { question: newFaqQ.trim(), answer: newFaqA.trim() }]
    }));
    setNewFaqQ("");
    setNewFaqA("");
  };

  const removeFaq = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      faqs: (prev.faqs || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    setIsSubmitting(true);
    try {
      const payload: EcommerceProduct = {
        id: product?.id || `${formData.companyId === "tech" ? "str" : "scs"}-${Date.now().toString(36)}`,
        name: formData.name.trim(),
        shortName: formData.shortName?.trim() || formData.name.trim(),
        slug: formData.slug?.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        companyId: formData.companyId || defaultComp,
        primaryCategory: formData.primaryCategory || (formData.companyId === "tech" ? "web-services" : "graphic-design"),
        category: formData.category || (formData.companyId === "tech" ? "website" : "graphic-design"),
        sector: formData.sector || (formData.companyId === "tech" ? "web-development" : "digital-marketing"),
        startingPrice: Number(formData.startingPrice) || 0,
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
        priceType: formData.priceType || "one-time",
        deliveryDays: formData.deliveryDays || "3-5 Days",
        badge: formData.badge || "",
        isPopular: !!formData.isPopular,
        isFeatured: !!formData.isFeatured,
        status: formData.status || "Active",
        color: formData.color || (formData.companyId === "tech" ? "#2563EB" : "#EB412C"),
        icon: formData.icon || "Globe",
        image: formData.image || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        description: formData.description || "",
        features: formData.features && formData.features.length > 0 ? formData.features : ["Standard Deliverable"],
        notIncluded: formData.notIncluded || [],
        technologiesUsed: formData.technologiesUsed || [],
        faqs: formData.faqs || [],
        createdAt: product?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error("Failed to save product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl text-white shadow-md ${
                formData.companyId === "tech"
                  ? "bg-gradient-to-tr from-blue-600 to-indigo-600"
                  : "bg-gradient-to-tr from-orange-600 to-red-600"
              }`}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {product ? "Edit E-Commerce Product / Service" : "Add New E-Commerce Product"}
                </h2>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  formData.companyId === "tech" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                }`}>
                  {formData.companyId === "tech" ? "Technology & Research" : "Consultancy Services"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full granular control over pricing, media, features, deliverables, tech stack, and storefront display
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

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50/30 dark:bg-slate-900 overflow-x-auto">
          {[
            { id: "general", label: "General & Categorization", icon: Layers },
            { id: "pricing", label: "Pricing & Delivery", icon: DollarSign },
            { id: "media", label: "Media & Image Upload", icon: Eye },
            { id: "features", label: "Inclusions & Exclusions", icon: Check },
            { id: "faqs", label: "Tech Stack & FAQs", icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  isSel
                    ? "border-blue-600 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* TAB 1: GENERAL & CATEGORIZATION */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Company Scope *
                  </label>
                  <select
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value as EcommerceCompany })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="tech">SAAMPARK TECHNOLOGY & RESEARCH</option>
                    <option value="consultancy">SAAMPARK CONSULTANCY SERVICE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Publication Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    <option value="Active">Active (Live in Storefront)</option>
                    <option value="Draft">Draft (Internal Only)</option>
                    <option value="Archived">Archived (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Promotional Ribbon Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ⚡ Special Offer, 🔥 Most Popular"
                    value={formData.badge || ""}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Full Product / Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack E-Commerce Platform"
                    value={formData.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Short Display Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. E-Commerce"
                    value={formData.shortName || ""}
                    onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    URL Slug (Path Identifier) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-xs text-slate-600 dark:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Brand Accent Color & Icon Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color || "#2563EB"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-9 p-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Icon e.g. Globe, Zap, Layout, Briefcase"
                      value={formData.icon || "Globe"}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Category *
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
                        <option value="software-services">Custom Software & ERP/CRM</option>
                        <option value="ai-services">AI Integration & Automation</option>
                        <option value="maintenance-services">Maintenance & AMC Support</option>
                        <option value="hosting-services">Cloud Hosting & Managed DNS</option>
                      </>
                    ) : (
                      <>
                        <option value="graphic-design">Graphic Design & Brand Identity</option>
                        <option value="ai-video">AI Video & Motion Graphics</option>
                        <option value="digital-marketing">Digital Marketing & Ads</option>
                        <option value="legal">Company Legal & Compliance</option>
                        <option value="loan">Business Loan & Finance Advisory</option>
                        <option value="insurance">Insurance Consultancy</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Sub-Category
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. website, app, software, legal"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. web-development, business-legal"
                    value={formData.sector || ""}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!formData.isPopular}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  Mark as Popular / Best Seller
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={!!formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  Feature on Homepage Showcase Slider
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: PRICING & DELIVERY */}
          {activeTab === "pricing" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Standard / Original Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.startingPrice ?? 0}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Discounted Offer Price (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Leave empty for no discount"
                    value={formData.discountPrice ?? ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-emerald-600 dark:text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Billing Cycle / Model *
                  </label>
                  <select
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="one-time">One-Time Project Payment</option>
                    <option value="monthly">Monthly Recurring Retainer</option>
                    <option value="weekly">Weekly Plan</option>
                    <option value="on-request">Custom Quote / On Request</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Estimated Delivery Timeline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3-5 Days, 15 Days, Instant Setup"
                    value={formData.deliveryDays ?? ""}
                    onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pricing Savings Preview
                  </label>
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                    <span>
                      {formData.discountPrice && formData.startingPrice && formData.startingPrice > formData.discountPrice
                        ? `Client saves ₹${(formData.startingPrice - formData.discountPrice).toLocaleString()} (${Math.round(
                            ((formData.startingPrice - formData.discountPrice) / formData.startingPrice) * 100
                          )}% OFF)`
                        : "Standard pricing (No active discount badge)"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Product Description & Client Value Proposition *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive description of the service deliverables, business ROI, scope, and target clients..."
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: MEDIA & DIRECT IMAGE UPLOAD */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Product Hero Image / Thumbnail
                  </h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload an image directly from your computer (drag & drop or click file) or toggle to paste an image URL.
                </p>

                <ImageUploadField
                  label="Product Thumbnail / Showcase Banner"
                  value={formData.image || ""}
                  onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                  placeholder="https://... or choose file above"
                  uploadNamePrefix={`product_${formData.companyId || "saampark"}`}
                  aspectRatio="wide"
                  required
                />
              </div>
            </div>
          )}

          {/* TAB 4: INCLUSIONS & EXCLUSIONS */}
          {activeTab === "features" && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" /> Included Deliverables Checklist ({formData.features?.length || 0})
                  </label>
                </div>
                <div className="space-y-2 mb-3">
                  {(formData.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 truncate">{feat}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an included deliverable item..."
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Ban className="w-4 h-4 text-rose-500" /> What is NOT Included / Exclusions ({formData.notIncluded?.length || 0})
                  </label>
                </div>
                <div className="space-y-2 mb-3">
                  {(formData.notIncluded || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Ban className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-slate-800 dark:text-slate-200 truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNotIncluded(idx)}
                        className="text-slate-400 hover:text-red-500 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type an excluded item (e.g. Domain registration separate)..."
                    value={newNotIncluded}
                    onChange={(e) => setNewNotIncluded(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addNotIncluded();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addNotIncluded}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Exclusion
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TECH STACK & FAQS */}
          {activeTab === "faqs" && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-600" /> Technologies & Tools Stack
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(formData.technologiesUsed || []).map((tech, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-semibold"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add technology or tool (e.g. Next.js, Node.js, MCA Portal)..."
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTech();
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addTech}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Tag
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" /> Frequently Asked Questions ({formData.faqs?.length || 0})
                </label>
                <div className="space-y-3 mb-3">
                  {(formData.faqs || []).map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Q: {faq.question}</span>
                        <button
                          type="button"
                          onClick={() => removeFaq(idx)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                  <input
                    type="text"
                    placeholder="Question (e.g. How long does the setup take?)"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer (e.g. Setup typically takes 3-5 business days...)"
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={addFaq}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add FAQ Item
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Company: <strong className="text-slate-800 dark:text-slate-200">{formData.companyId?.toUpperCase()}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
              >
                {isSubmitting ? "Saving..." : product ? "Save & Update Product" : "Publish to Storefront"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
