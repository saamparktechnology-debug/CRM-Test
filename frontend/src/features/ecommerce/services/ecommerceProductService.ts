import { EcommerceProduct, EcommerceCompany } from "../types/ecommerce.types";
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted } from "@/lib/storageSync";

export const DEFAULT_TECH_PRODUCTS: EcommerceProduct[] = [
  {
    id: "prod-tech-onepage",
    name: "One Page Website",
    shortName: "One Page",
    slug: "one-page-website",
    companyId: "tech",
    primaryCategory: "web-services",
    category: "website",
    startingPrice: 6999,
    discountPrice: 4999,
    priceType: "one-time",
    deliveryDays: "3-5 Days",
    badge: "Best Seller",
    isPopular: true,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    description: "High-performance single page landing website crafted for modern businesses, personal portfolios, and fast product launches.",
    features: [
      "Custom responsive UI/UX design (Mobile, Tablet, Desktop)",
      "Ultra-fast loading with Next.js & Tailwind CSS",
      "Interactive enquiry contact form with instant WhatsApp integration",
      "SEO meta tags, Google Analytics 4 & Search Console setup",
      "Free 1st-year high-speed cloud hosting & SSL certificate"
    ],
    technologiesUsed: ["Next.js", "React", "Tailwind CSS", "TypeScript", "Vercel / Cloudflare"],
    faqs: [
      { question: "How long does delivery take?", answer: "Delivery takes 3 to 5 business days after receiving content and brand assets." },
      { question: "Can I update content later?", answer: "Yes, you can edit all text and images via our integrated admin CMS." }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-tech-ecommerce",
    name: "Full Stack E-Commerce Platform",
    shortName: "E-Commerce",
    slug: "full-stack-ecommerce-platform",
    companyId: "tech",
    primaryCategory: "web-services",
    category: "website",
    startingPrice: 24999,
    discountPrice: 19999,
    priceType: "one-time",
    deliveryDays: "10-14 Days",
    badge: "Trending",
    isPopular: true,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80",
    description: "Enterprise multi-vendor e-commerce portal with Razorpay / Stripe payment gateway, inventory control, and automated GST billing.",
    features: [
      "Catalog, shopping cart & frictionless multi-step checkout",
      "Payment gateway integration (Razorpay, UPI, PhonePe, Cards)",
      "Automated PDF Tax Invoicing with GST calculation",
      "Real-time courier API shipping tracking & order status SMS/Email",
      "Full role-based admin panel for products, discounts & analytics"
    ],
    technologiesUsed: ["Next.js 15", "Node.js", "MySQL", "Prisma", "Razorpay", "Tailwind"],
    faqs: [
      { question: "Is payment gateway integrated?", answer: "Yes, Razorpay and UPI QR codes are connected directly with your bank account." }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-tech-mobile-app",
    name: "Cross-Platform Mobile App (iOS & Android)",
    shortName: "Mobile App",
    slug: "cross-platform-mobile-app",
    companyId: "tech",
    primaryCategory: "application-services",
    category: "app",
    startingPrice: 34999,
    discountPrice: 29999,
    priceType: "one-time",
    deliveryDays: "15-21 Days",
    badge: "Premium",
    isPopular: false,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    description: "Native-feel Flutter / React Native hybrid application deployed on Google Play Store and Apple App Store.",
    features: [
      "Unified codebase running seamlessly on Android & iOS",
      "Push notification engine with Firebase Cloud Messaging (FCM)",
      "Biometric fingerprint & Face ID authentication",
      "Offline caching and sync capabilities",
      "Full deployment assistance on Google Play Console and App Store"
    ],
    technologiesUsed: ["React Native", "Flutter", "Firebase", "Redux", "Node.js REST API"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-tech-erp",
    name: "Custom Cloud ERP & CRM System",
    shortName: "Cloud ERP",
    slug: "custom-cloud-erp-system",
    companyId: "tech",
    primaryCategory: "software-services",
    category: "software",
    startingPrice: 49999,
    discountPrice: 39999,
    priceType: "one-time",
    deliveryDays: "20-30 Days",
    badge: "Enterprise",
    isPopular: false,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    description: "Bespoke internal operations software uniting Lead Management, Telecalling, Invoicing, Inventory, HR Payroll and Multi-branch reporting.",
    features: [
      "Custom multi-tenant hierarchy with company and branch switching",
      "Granular role-based permissions matrix for teams and departments",
      "Dynamic PDF quotation and invoice studio with e-signatures",
      "Attendance, shift punch clock and monthly payroll generation",
      "Automated MySQL daily backups with encryption"
    ],
    technologiesUsed: ["React", "Express.js", "MySQL", "Redis", "Docker", "Nginx"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_CONSULTANCY_PRODUCTS: EcommerceProduct[] = [
  {
    id: "prod-consult-graphic-pack",
    name: "Corporate Brand Identity & Graphic Suite",
    shortName: "Branding Suite",
    slug: "corporate-brand-identity-suite",
    companyId: "consultancy",
    primaryCategory: "graphic-design",
    category: "graphic-design",
    startingPrice: 8999,
    discountPrice: 5999,
    priceType: "one-time",
    deliveryDays: "3-5 Days",
    badge: "Popular",
    isPopular: true,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    description: "Complete corporate brand package including vector Logo design, business cards, letterheads, social media kit and official brand guidelines.",
    features: [
      "5 Original Logo concepts with unlimited revisions until 100% satisfaction",
      "Complete print-ready vector files (AI, EPS, PDF, SVG, high-res PNG)",
      "Business cards, official letterhead, envelope and invoice branding",
      "Social media profile kit (Avatars, Cover banners for LinkedIn, FB, IG)",
      "Brand style manual with typography and color palette codes"
    ],
    technologiesUsed: ["Adobe Illustrator", "Photoshop", "Figma", "Vector Master"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-consult-incorporation",
    name: "Private Limited Company Incorporation & Legal Setup",
    shortName: "Pvt Ltd Setup",
    slug: "private-limited-company-incorporation",
    companyId: "consultancy",
    primaryCategory: "legal",
    category: "business-legal",
    startingPrice: 11999,
    discountPrice: 8999,
    priceType: "one-time",
    deliveryDays: "7-10 Days",
    badge: "Official",
    isPopular: true,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    description: "End-to-end MCA company registration including DSC, DIN, MOA/AOA drafting, Certificate of Incorporation, PAN & TAN.",
    features: [
      "2 Digital Signature Certificates (Class 3 DSC)",
      "Name reservation approval via SPICe+ MCA Portal",
      "Drafting of Memorandum of Association (MOA) and Articles of Association (AOA)",
      "Incorporation Certificate, Company PAN & TAN generation",
      "Zero-balance corporate bank account opening assistance"
    ],
    technologiesUsed: ["MCA Portal", "SPICe+", "Govt Compliance Engine"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "prod-consult-gst-trademark",
    name: "GST Registration & Trademark Brand Protection",
    shortName: "GST & Trademark",
    slug: "gst-registration-trademark",
    companyId: "consultancy",
    primaryCategory: "legal",
    category: "business-legal",
    startingPrice: 6999,
    discountPrice: 4999,
    priceType: "one-time",
    deliveryDays: "5-7 Days",
    badge: "Essential",
    isPopular: false,
    isFeatured: true,
    status: "Active",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80",
    description: "Formal GST state registration certification and Trademark (TM) application filing with the IP India registry.",
    features: [
      "Government GSTIN allocation and official certificate",
      "Comprehensive TM class public search report across 45 classes",
      "Filing of Form TM-A with official application acknowledgment",
      "Legal response to standard preliminary examination notices"
    ],
    technologiesUsed: ["GST Portal", "IP India Registry", "Legal Database"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function getEcommerceProducts(companyScope?: string | null): Promise<EcommerceProduct[]> {
  try {
    const scope = (companyScope || "tech").toLowerCase().trim();
    const isConsult = scope === "2" || scope === "consultancy" || scope.includes("consult");
    const isTech = scope === "1" || scope === "tech" || scope.includes("tech");
    const isAll = !scope || scope === "all" || scope === "group" || scope === "saampark-group";

    if (isAll) {
      const techList = await fetchModuleDataFromDB<EcommerceProduct[]>("ecommerce_products", DEFAULT_TECH_PRODUCTS, "tech");
      const consultList = await fetchModuleDataFromDB<EcommerceProduct[]>("ecommerce_products", DEFAULT_CONSULTANCY_PRODUCTS, "consultancy");
      
      const combined = [...(Array.isArray(techList) ? techList : DEFAULT_TECH_PRODUCTS), ...(Array.isArray(consultList) ? consultList : DEFAULT_CONSULTANCY_PRODUCTS)];
      const map = new Map<string, EcommerceProduct>();
      combined.forEach(p => { if (p && p.id) map.set(p.id, p); });
      return Array.from(map.values());
    }

    const targetScope = isConsult ? "consultancy" : "tech";
    const defaultData = isConsult ? DEFAULT_CONSULTANCY_PRODUCTS : DEFAULT_TECH_PRODUCTS;

    const data = await fetchModuleDataFromDB<EcommerceProduct[]>("ecommerce_products", defaultData, targetScope);
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    // Seed initial products if DB empty
    await saveModuleDataToDB("ecommerce_products", defaultData, targetScope);
    return defaultData;
  } catch (err) {
    console.warn("getEcommerceProducts error:", err);
    return DEFAULT_TECH_PRODUCTS;
  }
}

export async function saveEcommerceProduct(product: EcommerceProduct): Promise<EcommerceProduct> {
  const compScope = (product.companyId || "tech").toLowerCase().trim();
  const currentList = await getEcommerceProducts(compScope);
  
  const existingIdx = currentList.findIndex(p => p.id === product.id);
  let updatedList: EcommerceProduct[];
  
  const updatedProduct: EcommerceProduct = {
    ...product,
    updatedAt: new Date().toISOString(),
    createdAt: product.createdAt || new Date().toISOString()
  };

  if (existingIdx >= 0) {
    updatedList = [...currentList];
    updatedList[existingIdx] = updatedProduct;
  } else {
    updatedList = [updatedProduct, ...currentList];
  }

  await saveModuleDataToDB("ecommerce_products", updatedList, compScope);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_updated"));
  }

  return updatedProduct;
}

export async function deleteEcommerceProduct(productId: string, companyScope: string): Promise<boolean> {
  const compScope = (companyScope || "tech").toLowerCase().trim();
  await markGlobalItemDeleted(productId, "ecommerce_products");
  
  const currentList = await getEcommerceProducts(compScope);
  const filtered = currentList.filter(p => p.id !== productId);
  
  await saveModuleDataToDB("ecommerce_products", filtered, compScope);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("saampark_ecommerce_updated"));
  }

  return true;
}
