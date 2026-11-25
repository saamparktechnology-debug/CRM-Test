export type EcommerceCompany = 'tech' | 'consultancy';

export interface EcommerceProduct {
  id: string;
  name: string;
  shortName?: string;
  slug: string;
  companyId: EcommerceCompany;
  primaryCategory: string; // e.g. 'web-services', 'application-services', 'software-services', 'ai-services', 'graphic-design', 'legal', etc.
  category?: string;
  sector?: string;
  group?: string;
  entity?: string;
  startingPrice: number;
  discountPrice?: number | null;
  priceType: 'one-time' | 'monthly' | 'weekly' | 'on-request';
  deliveryDays?: number | string; // e.g. 5 or "3-5 Days"
  badge?: string; // e.g. "Most Popular", "Best Value", "Hot"
  isPopular?: boolean;
  isFeatured?: boolean;
  status: 'Active' | 'Draft' | 'Archived';
  image?: string; // Main image / thumbnail
  galleryImages?: string[];
  description: string;
  features: string[]; // Deliverables / features checklist
  notIncluded?: string[]; // Things not included
  technologiesUsed?: string[]; // e.g. ["Next.js", "React", "Node.js", "MySQL", "AWS"]
  faqs?: { question: string; answer: string }[];
  color?: string;
  icon?: string;
  href?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EcommerceOrderItem {
  serviceId: string;
  name: string;
  price: number;
  qty: number;
  priceType?: string;
  deliveryDays?: number | string;
  technologiesUsed?: string[];
}

export type EcommerceOrderStatus = 
  | 'Order Pending' 
  | 'Invoice Created' 
  | 'Order Processed' 
  | 'Cancelled';

export interface EcommerceOrder {
  id: string;
  orderNumber: string; // e.g. ORD-2026-1001
  companyId: EcommerceCompany;
  clientName: string;
  businessName?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pincode: string;
  gstNumber?: string;
  panNumber?: string;
  items: EcommerceOrderItem[];
  subtotal?: number;
  gstAmount?: number;
  gstType?: string;
  discountAmount?: number;
  couponCode?: string;
  urgency?: string;
  totalAmount: number;
  status: EcommerceOrderStatus;
  invoiceId?: string; // Linked CRM invoice ID
  invoiceNumber?: string; // Linked CRM invoice number
  invoiceUrl?: string; // View invoice URL
  clientUserId?: string; // Created Role 4 client user ID
  clientPassword?: string; // Auto-generated password for login
  notes?: string;
  orderDate: string;
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  image?: string;
  bgGradient?: string;
  order: number;
  isActive: boolean;
}

export interface PromoRibbon {
  enabled: boolean;
  text: string;
  highlightText?: string;
  link?: string;
  badge?: string;
}

export interface DiscountBanner {
  id: string;
  title: string;
  badge?: string;
  discountPercentage?: number;
  discountText?: string; // e.g. "FLAT 30% OFF THIS MONTH"
  promoCode?: string;
  showInCheckout?: boolean;
  validUntil?: string;
  ctaText?: string;
  ctaLink?: string;
  image?: string;
  isActive: boolean;
}

export interface LiveStats {
  projectsDelivered: string; // e.g. "500+"
  clientSatisfaction: string; // e.g. "99%"
  activeRetainers: string; // e.g. "120+"
  expertEngineers: string; // e.g. "45+"
  supportHours: string; // e.g. "24/7"
  avgDeliveryDays: string; // e.g. "7 Days"
}

export interface CoreCapabilitySlide {
  id: string;
  title: string;
  tag: string;
  description: string;
  image: string;
  accent?: string;
  targetSectionId?: string;
  order: number;
  isActive: boolean;
}

export interface StorefrontConfig {
  companyId: EcommerceCompany;
  heroSlides: HeroSlide[];
  coreSliders?: CoreCapabilitySlide[];
  promoRibbon: PromoRibbon;
  discountBanners: DiscountBanner[];
  liveStats: LiveStats;
  announcement?: string;
  featuredProductIds: string[];
  updatedAt?: string;
}

export interface EcommerceCategoryItem {
  id: string;
  name: string;
  companyId: EcommerceCompany;
  icon?: string;
  description?: string;
  isDefault?: boolean;
  createdAt?: string;
}
