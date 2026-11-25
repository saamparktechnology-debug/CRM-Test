"use client";

import * as React from "react";
import { Sparkles, Sliders, Image, Tag, Plus, Trash2, Edit2, Save, CheckCircle2, RefreshCw, BarChart2, Bell, ExternalLink, ArrowRight, Layers } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { StorefrontConfig, HeroSlide, CoreCapabilitySlide, DiscountBanner, LiveStats } from "@/features/ecommerce/types/ecommerce.types";
import { getStorefrontConfig, saveStorefrontConfig } from "@/features/ecommerce/services/ecommerceStorefrontService";
import { HeroSlideModal } from "@/features/ecommerce/components/HeroSlideModal";
import { DiscountBannerModal } from "@/features/ecommerce/components/DiscountBannerModal";
import { CoreSliderModal } from "@/features/ecommerce/components/CoreSliderModal";

export default function EcommerceStorefrontPage() {
  const { user, activeCompanyId } = useAuthStore();
  const isAllCompanies = !activeCompanyId || activeCompanyId === "all" || activeCompanyId === "group" || activeCompanyId === "saampark-group";
  const { canPerformAction } = usePermissionStore();

  const isConsultancy = activeCompanyId === "2" || activeCompanyId === "consultancy" || activeCompanyId?.includes("consult");
  const companyScope = isConsultancy ? "consultancy" : "tech";

  const [config, setConfig] = React.useState<StorefrontConfig | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Modals state
  const [isSlideModalOpen, setIsSlideModalOpen] = React.useState(false);
  const [editingSlide, setEditingSlide] = React.useState<HeroSlide | null>(null);

  const [isBannerModalOpen, setIsBannerModalOpen] = React.useState(false);
  const [editingBanner, setEditingBanner] = React.useState<DiscountBanner | null>(null);

  const [isCoreModalOpen, setIsCoreModalOpen] = React.useState(false);
  const [editingCoreSlide, setEditingCoreSlide] = React.useState<CoreCapabilitySlide | null>(null);

  const loadConfig = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getStorefrontConfig(companyScope);
      setConfig(data);
    } catch (err) {
      console.error("Failed to load storefront config:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyScope]);

  React.useEffect(() => {
    loadConfig();

    const handleSync = () => loadConfig();
    const handleCompSwitch = () => loadConfig();

    window.addEventListener("saampark_ecommerce_storefront_updated", handleSync);
    window.addEventListener("saampark_company_switched", handleCompSwitch);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("saampark_ecommerce_storefront_updated", handleSync);
      window.removeEventListener("saampark_company_switched", handleCompSwitch);
      window.removeEventListener("storage", handleSync);
    };
  }, [loadConfig]);

  const handleSaveWholeConfig = async (newConfig?: StorefrontConfig) => {
    const target = newConfig || config;
    if (!target) return;
    setIsSaving(true);
    try {
      await saveStorefrontConfig(companyScope, target);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      await loadConfig();
    } catch (err) {
      console.error("Failed to save config:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Slide CRUD
  const handleSaveSlide = async (slide: HeroSlide) => {
    if (!config) return;
    const existing = config.heroSlides || [];
    const idx = existing.findIndex((s) => s.id === slide.id);
    let updated: HeroSlide[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = slide;
    } else {
      updated = [...existing, slide];
    }
    const newConfig: StorefrontConfig = { ...config, heroSlides: updated };
    setConfig(newConfig);
    await handleSaveWholeConfig(newConfig);
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!config) return;
    const updated = (config.heroSlides || []).filter((s) => s.id !== slideId);
    const newConfig: StorefrontConfig = { ...config, heroSlides: updated };
    setConfig(newConfig);
    await handleSaveWholeConfig(newConfig);
  };

  // Banner CRUD
  const handleSaveBanner = async (banner: DiscountBanner) => {
    if (!config) return;
    const existing = config.discountBanners || [];
    const idx = existing.findIndex((b) => b.id === banner.id);
    let updated: DiscountBanner[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = banner;
    } else {
      updated = [...existing, banner];
    }
    const newConfig: StorefrontConfig = { ...config, discountBanners: updated };
    setConfig(newConfig);
    await handleSaveWholeConfig(newConfig);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!config) return;
    const updated = (config.discountBanners || []).filter((b) => b.id !== bannerId);
    const newConfig: StorefrontConfig = { ...config, discountBanners: updated };
    setConfig(newConfig);
    await handleSaveWholeConfig(newConfig);
  };

  // Explore Our Core Slider CRUD
  const handleSaveCoreSlide = async (coreSlide: CoreCapabilitySlide) => {
    if (!config) return;
    const existing = config.coreSliders || [];
    const idx = existing.findIndex((s) => s.id === coreSlide.id);
    let updated: CoreCapabilitySlide[];
    if (idx >= 0) {
      updated = [...existing];
      updated[idx] = coreSlide;
    } else {
      updated = [...existing, coreSlide];
    }
    const newConfig: StorefrontConfig = { ...config, coreSliders: updated };
    setConfig(newConfig);
    await handleSaveWholeConfig(newConfig);
  };

  const handleDeleteCoreSlide = async (slideId: string) => {
    if (!config) return;
    const updated = (config.coreSliders || []).filter((s) => s.id !== slideId);
    const newConfig: StorefrontConfig = { ...config, coreSliders: updated };
    setConfig(newConfig);
    await handleSaveWholeConfig(newConfig);
  };

  // Live Stats
  const handleStatsChange = (key: keyof LiveStats, value: string) => {
    if (!config) return;
    const newStats: LiveStats = {
      ...config.liveStats,
      [key]: value,
    };
    setConfig({ ...config, liveStats: newStats });
  };

  if (isLoading || !config) {
    return <div className="max-w-[1600px] mx-auto p-12 text-center text-slate-400">Loading storefront CMS...</div>;
  }

  const isTech = companyScope === "tech";

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isTech ? "bg-blue-600/10 text-blue-600 dark:text-blue-400" : "bg-orange-600/10 text-orange-600 dark:text-orange-400"}`}>
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Manage Storefront CMS
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Visual Carousel Sliders, Promo Ribbons, Campaign Banners & Live Counters &bull;
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isTech
                    ? "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                    : "bg-orange-500/10 text-orange-700 dark:text-orange-300 border border-orange-500/20"
                }`}>
                  {isTech ? "SAAMPARK TECHNOLOGY & RESEARCH" : "SAAMPARK CONSULTANCY SERVICE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://saampark.com"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5"
          >
            Preview Live Store <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => loadConfig()}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reload Config"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSaveWholeConfig()}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            {isSaving ? "Publishing Changes..." : saveSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Changes Published!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Publish All Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Section 1: Hero Carousel Sliders ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Homepage Hero Carousel Sliders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage the rotating high-impact visual banners on the top of the storefront homepage
            </p>
          </div>
          <button
            onClick={() => {
              setEditingSlide(null);
              setIsSlideModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Slide
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config.heroSlides || []).map((slide, idx) => (
            <div
              key={slide.id || idx}
              className="relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 flex flex-col justify-between"
            >
              <div className="relative h-40 w-full overflow-hidden bg-slate-200 dark:bg-slate-700">
                <img
                  src={slide.image || "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-2.5 left-2.5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow">
                    Slide #{slide.order || idx + 1}
                  </span>
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  {slide.badge && (
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
                      {slide.badge}
                    </span>
                  )}
                  <h4 className="text-sm font-bold line-clamp-1">{slide.title}</h4>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {slide.subtitle || "No subtitle provided"}
                </p>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">
                    CTA: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{slide.ctaText}</strong> ({slide.ctaLink})
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingSlide(slide);
                        setIsSlideModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Edit Slide"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 1B: Explore Our Core Capability Sliders ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" />
              Explore Our Core Sliders (3D Coverflow)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add, edit, or remove the rotating domain cards shown under &ldquo;Explore Our Core&rdquo;
            </p>
          </div>
          <button
            onClick={() => {
              setEditingCoreSlide(null);
              setIsCoreModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Core Slider
          </button>
        </div>

        {(config.coreSliders || []).length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No core sliders configured for this division yet. Click &ldquo;Add Core Slider&rdquo; above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(config.coreSliders || []).map((cs, idx) => (
              <div
                key={cs.id || idx}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 flex flex-col gap-3 justify-between"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={cs.image || "https://saampark.com/assets/images/services/str-web-dynamic.png"}
                    alt={cs.title}
                    className="w-14 h-14 rounded-xl object-contain bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-1 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 truncate">
                        {cs.tag}
                      </span>
                      {cs.isActive === false && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                          Hidden
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 truncate">
                      {cs.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {cs.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono truncate">
                    #{cs.order || idx + 1} &bull; {cs.targetSectionId || cs.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCoreSlide(cs);
                        setIsCoreModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Edit Core Slider"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCoreSlide(cs.id)}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                      title="Delete Core Slider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 2: Top Promo Ribbon / Announcement Bar ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              Top Promo Ribbon & Announcement Bar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The continuous announcement banner displayed at the very top of the website
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={!!config.promoRibbon?.enabled}
              onChange={(e) =>
                setConfig({
                  ...config,
                  promoRibbon: { ...config.promoRibbon, enabled: e.target.checked },
                })
              }
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            Ribbon Enabled
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Announcement Message
            </label>
            <input
              type="text"
              value={config.promoRibbon?.text || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  promoRibbon: { ...config.promoRibbon, text: e.target.value },
                })
              }
              placeholder="e.g.  FESTIVE DEAL: Get FLAT 20% OFF on all Website & Mobile App Developments!"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Highlight Pill / Promo Code Tag
            </label>
            <input
              type="text"
              value={config.promoRibbon?.highlightText || ""}
              onChange={(e) =>
                setConfig({
                  ...config,
                  promoRibbon: { ...config.promoRibbon, highlightText: e.target.value },
                })
              }
              placeholder="e.g. Use Code: TECH20"
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono font-bold text-amber-600 dark:text-amber-400"
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Discount & Campaign Banners ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-500" />
              Seasonal & Discount Campaign Banners
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Promotional banner callouts with discount percentages and coupon codes
            </p>
          </div>
          <button
            onClick={() => {
              setEditingBanner(null);
              setIsBannerModalOpen(true);
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add Discount Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config.discountBanners || []).map((banner, idx) => (
            <div
              key={banner.id || idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {banner.discountPercentage}% OFF
                  </span>
                  {banner.promoCode && (
                    <span className="font-mono text-xs font-bold bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                      {banner.promoCode}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{banner.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">{banner.discountText}</p>
                <div className="text-[11px] text-slate-400">Valid Until: {banner.validUntil || "Ongoing"}</div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setIsBannerModalOpen(true);
                  }}
                  className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBanner(banner.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Live Business Stats Counters ── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-purple-500" />
            Live Storefront Credibility Counters & Stats
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time numbers displayed on the storefront credibility section to build customer trust
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Projects Delivered
            </label>
            <input
              type="text"
              value={config.liveStats?.projectsDelivered || "500+"}
              onChange={(e) => handleStatsChange("projectsDelivered", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Client Satisfaction
            </label>
            <input
              type="text"
              value={config.liveStats?.clientSatisfaction || "99.4%"}
              onChange={(e) => handleStatsChange("clientSatisfaction", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center text-emerald-600 dark:text-emerald-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Active Retainers
            </label>
            <input
              type="text"
              value={config.liveStats?.activeRetainers || "140+"}
              onChange={(e) => handleStatsChange("activeRetainers", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Expert Staff / Engineers
            </label>
            <input
              type="text"
              value={config.liveStats?.expertEngineers || "35+"}
              onChange={(e) => handleStatsChange("expertEngineers", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Support Hours
            </label>
            <input
              type="text"
              value={config.liveStats?.supportHours || "24/7"}
              onChange={(e) => handleStatsChange("supportHours", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center text-blue-600 dark:text-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Avg Delivery Time
            </label>
            <input
              type="text"
              value={config.liveStats?.avgDeliveryDays || "5 Days"}
              onChange={(e) => handleStatsChange("avgDeliveryDays", e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-center text-purple-600 dark:text-purple-400"
            />
          </div>
        </div>
      </div>

      {/* Hero Slide Modal */}
      <HeroSlideModal
        isOpen={isSlideModalOpen}
        onClose={() => setIsSlideModalOpen(false)}
        onSave={handleSaveSlide}
        slide={editingSlide}
      />

      {/* Discount Banner Modal */}
      <DiscountBannerModal
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        onSave={handleSaveBanner}
        banner={editingBanner}
      />

      {/* Core Capability Slider Modal */}
      <CoreSliderModal
        isOpen={isCoreModalOpen}
        onClose={() => setIsCoreModalOpen(false)}
        onSave={handleSaveCoreSlide}
        slide={editingCoreSlide}
      />
    </div>
  );
}
