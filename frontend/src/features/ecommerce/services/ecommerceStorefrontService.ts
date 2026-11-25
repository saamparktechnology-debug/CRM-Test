import { StorefrontConfig, EcommerceCompany, HeroSlide, CoreCapabilitySlide, PromoRibbon, DiscountBanner, LiveStats } from "../types/ecommerce.types";
import { fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync";

export const DEFAULT_TECH_CORE_SLIDERS: CoreCapabilitySlide[] = [
  {
    id: "web-services",
    title: "Web Development",
    tag: "Next.js & E-Commerce",
    description: "Dynamic & high-converting storefronts built for scale.",
    image: "https://saampark.com/assets/images/services/str-web-dynamic.png",
    accent: "#EB412C",
    targetSectionId: "web-services",
    order: 1,
    isActive: true,
  },
  {
    id: "application-services",
    title: "Mobile Applications",
    tag: "iOS & Android Hybrid",
    description: "Flutter & React Native ultra-fast mobile applications.",
    image: "https://saampark.com/assets/images/services/str-app-android.png",
    accent: "#9CAF88",
    targetSectionId: "application-services",
    order: 2,
    isActive: true,
  },
  {
    id: "ai-services",
    title: "AI & Automation",
    tag: "ChatGPT & Agents",
    description: "Custom AI Chatbots, agentic automation & ERP intelligence.",
    image: "https://saampark.com/assets/images/services/str-ai-chatbot.png",
    accent: "#FFC93C",
    targetSectionId: "ai-services",
    order: 3,
    isActive: true,
  },
  {
    id: "software-services",
    title: "Software & ERP Systems",
    tag: "Cloud ERP & Portals",
    description: "Tailored enterprise software, CRM, and billing systems.",
    image: "https://saampark.com/assets/images/services/res-stock-equity.png",
    accent: "#9CAF88",
    targetSectionId: "software-services",
    order: 4,
    isActive: true,
  },
];

export const DEFAULT_CONSULTANCY_CORE_SLIDERS: CoreCapabilitySlide[] = [
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    tag: "Meta & Google Ads",
    description: "High-ROI multi-channel campaigns & verified business leads.",
    image: "https://saampark.com/assets/images/services/scs-social-standard.png",
    accent: "#EB412C",
    targetSectionId: "digital-marketing",
    order: 5,
    isActive: true,
  },
  {
    id: "legal",
    title: "Business & Legal Setup",
    tag: "Pvt Ltd & GST Filings",
    description: "ISO-certified legal company formation & tax compliance.",
    image: "https://saampark.com/assets/images/services/con-pvt-ltd.png",
    accent: "#9CAF88",
    targetSectionId: "legal",
    order: 6,
    isActive: true,
  },
];

export const DEFAULT_TECH_STOREFRONT: StorefrontConfig = {
  companyId: "tech",
  coreSliders: DEFAULT_TECH_CORE_SLIDERS,
  heroSlides: [
    {
      id: "slide-tech-1",
      title: "Architecting Next-Generation Digital Experiences",
      subtitle: "High-performance websites, custom cloud ERPs, AI automation engines, and native mobile apps designed to scale your business.",
      badge: "SAAMPARK TECHNOLOGY & RESEARCH",
      ctaText: "Explore Digital Solutions",
      ctaLink: "/services",
      secondaryCtaText: "Request Fast Quote",
      secondaryCtaLink: "/contact",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
      bgGradient: "from-blue-900/80 via-indigo-950/90 to-black",
      order: 1,
      isActive: true
    },
    {
      id: "slide-tech-2",
      title: "Enterprise E-Commerce & Custom Software Solutions",
      subtitle: "Engineered with Next.js 15, TypeScript, microservices, and instant UPI / Card payment gateways.",
      badge: "ENGINEERED FOR SCALE",
      ctaText: "View Packages",
      ctaLink: "/services/e-commerce",
      secondaryCtaText: "Live Demo",
      secondaryCtaLink: "/demo",
      image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
      bgGradient: "from-cyan-950/80 via-blue-950/90 to-black",
      order: 2,
      isActive: true
    }
  ],
  promoRibbon: {
    enabled: true,
    text: "FESTIVE DEAL: Get FLAT 20% OFF on all Website & Mobile App Developments this month!",
    highlightText: "Use Code: TECH20",
    link: "/services",
    badge: "Limited Offer"
  },
  discountBanners: [
    {
      id: "banner-tech-1",
      title: "Diwali Digital Booster Pack",
      discountPercentage: 25,
      discountText: "FLAT 25% DISCOUNT ON CUSTOM CRM & ERP SYSTEMS",
      promoCode: "DIWALI25",
      validUntil: "2026-12-31",
      ctaText: "Claim Offer",
      ctaLink: "/services",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
      isActive: true
    }
  ],
  liveStats: {
    projectsDelivered: "500+",
    clientSatisfaction: "99.4%",
    activeRetainers: "140+",
    expertEngineers: "35+",
    supportHours: "24/7",
    avgDeliveryDays: "5 Days"
  },
  announcement: "SAAMPARK Technology announces official AI Agent integration services for businesses across India.",
  featuredProductIds: ["prod-tech-onepage", "prod-tech-ecommerce", "prod-tech-mobile-app"],
  updatedAt: new Date().toISOString()
};

export const DEFAULT_CONSULTANCY_STOREFRONT: StorefrontConfig = {
  companyId: "consultancy",
  coreSliders: DEFAULT_CONSULTANCY_CORE_SLIDERS,
  heroSlides: [
    {
      id: "slide-consult-1",
      title: "Strategic Corporate & Legal Advisory",
      subtitle: "Complete business incorporation, GST filing, trademark protection, and corporate identity solutions under one roof.",
      badge: "SAAMPARK CONSULTANCY SERVICE",
      ctaText: "Explore Advisory Services",
      ctaLink: "/services",
      secondaryCtaText: "Free 15-Min Consultation",
      secondaryCtaLink: "/contact",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      bgGradient: "from-amber-950/80 via-orange-950/90 to-black",
      order: 1,
      isActive: true
    }
  ],
  promoRibbon: {
    enabled: true,
    text: "START YOUR BUSINESS TODAY: Complete Pvt Ltd Incorporation with Free Class 3 DSC & PAN/TAN!",
    highlightText: "All-Inclusive ₹8,999",
    link: "/services",
    badge: "Govt Certified"
  },
  discountBanners: [
    {
      id: "banner-consult-1",
      title: "Startup Legal Onboarding Bundle",
      discountPercentage: 30,
      discountText: "TRADEMARK + GST + COMPANY REGISTRATION COMBO",
      promoCode: "STARTUP30",
      validUntil: "2026-12-31",
      ctaText: "Get Started",
      ctaLink: "/services",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      isActive: true
    }
  ],
  liveStats: {
    projectsDelivered: "850+",
    clientSatisfaction: "99.8%",
    activeRetainers: "210+",
    expertEngineers: "20+ Advocates & CAs",
    supportHours: "24/7",
    avgDeliveryDays: "3 Days"
  },
  announcement: "Special subsidy assistance for MSME and Udyam registrations across West Bengal and Eastern India.",
  featuredProductIds: ["prod-consult-graphic-pack", "prod-consult-incorporation", "prod-consult-gst-trademark"],
  updatedAt: new Date().toISOString()
};

export async function getStorefrontConfig(companyScope?: string | null): Promise<StorefrontConfig> {
  try {
    const scope = (companyScope || "tech").toLowerCase().trim();
    const isConsult = scope === "2" || scope === "consultancy" || scope.includes("consult");
    const targetScope = isConsult ? "consultancy" : "tech";
    const defaultConfig = isConsult ? DEFAULT_CONSULTANCY_STOREFRONT : DEFAULT_TECH_STOREFRONT;

    const data = await fetchModuleDataFromDB<StorefrontConfig>("ecommerce_storefront", defaultConfig, targetScope);
    if (data && typeof data === "object" && data.heroSlides) {
      return {
        ...data,
        coreSliders: Array.isArray(data.coreSliders)
          ? data.coreSliders
          : isConsult
          ? DEFAULT_CONSULTANCY_CORE_SLIDERS
          : DEFAULT_TECH_CORE_SLIDERS,
      };
    }

    await saveModuleDataToDB("ecommerce_storefront", defaultConfig, targetScope);
    return defaultConfig;
  } catch (err) {
    console.warn("getStorefrontConfig error:", err);
    return DEFAULT_TECH_STOREFRONT;
  }
}

export async function saveStorefrontConfig(companyScope: string, config: StorefrontConfig): Promise<StorefrontConfig> {
  const scope = (companyScope || "tech").toLowerCase().trim();
  const isConsult = scope === "2" || scope === "consultancy" || scope.includes("consult");
  const targetScope = isConsult ? "consultancy" : "tech";

  const updatedConfig: StorefrontConfig = {
    ...config,
    companyId: isConsult ? "consultancy" : "tech",
    updatedAt: new Date().toISOString()
  };

  await saveModuleDataToDB("ecommerce_storefront", updatedConfig, targetScope);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_storefront_updated"));
  }

  return updatedConfig;
}
