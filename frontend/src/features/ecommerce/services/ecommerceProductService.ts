import { EcommerceProduct } from "../types/ecommerce.types";
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted } from "@/lib/storageSync";

export const DEFAULT_TECH_PRODUCTS: EcommerceProduct[] = [
  {
    "id": "str-web-onepage",
    "name": "One Page Website",
    "shortName": "One Page",
    "slug": "one-page-website",
    "companyId": "tech",
    "primaryCategory": "web-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 1999,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "5 Days",
    "badge": "Special Offer",
    "isPopular": false,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/str_web_onepage.png",
    "color": "#2563EB",
    "icon": "Globe",
    "href": "/technology/web-development/one-page-website",
    "description": "Perfect for personal brands, portfolios, and small businesses. Everything on a single, beautiful scrolling page.",
    "features": [
      "Personal / Portfolio / Small Business",
      "Mobile Responsive Design",
      "Basic SEO Setup",
      "Contact Form",
      "Hosting Setup Guidance",
      "Social Media Integration",
      "Google Maps Integration"
    ],
    "notIncluded": [
      "Admin Panel",
      "Database"
    ],
    "technologiesUsed": [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-web-static",
    "name": "Static Website",
    "shortName": "Static",
    "slug": "static-website",
    "companyId": "tech",
    "primaryCategory": "web-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 3999,
    "discountPrice": 3199,
    "priceType": "one-time",
    "deliveryDays": "7 Days",
    "badge": "Popular",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/str_web_dynamic.png",
    "color": "#1E90FF",
    "icon": "Layout",
    "href": "/technology/web-development/static-website",
    "description": "A professional multi-page website to establish your online presence with a company profile.",
    "features": [
      "Company Profile / Portfolio / Business Info",
      "Up to 5 Pages",
      "Custom Design",
      "Mobile Responsive",
      "Google Analytics Integration",
      "Basic On-Page SEO",
      "Sitemap & robots.txt"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 7 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-web-dynamic",
    "name": "Dynamic Website",
    "shortName": "Dynamic",
    "slug": "dynamic-website",
    "companyId": "tech",
    "primaryCategory": "web-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 11999,
    "discountPrice": 9599,
    "priceType": "one-time",
    "deliveryDays": "15 Days",
    "badge": "Most Popular",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/str_web_dynamic.png",
    "color": "#F4511E",
    "icon": "Zap",
    "href": "/technology/web-development/dynamic-website",
    "description": "Full-featured website with admin panel, database, and complete management system.",
    "features": [
      "Admin Panel (CMS)",
      "Database Integration (MySQL)",
      "Complete Management System",
      "User Login System",
      "Dynamic Content Pages",
      "Search Functionality",
      "Contact & Inquiry Management",
      "Newsletter Integration",
      "Advanced SEO Setup"
    ],
    "notIncluded": [
      "Payment Gateway (add-on)",
      "Mobile App (separate)"
    ],
    "technologiesUsed": [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 15 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-web-ecommerce",
    "name": "E-Commerce Website",
    "shortName": "E-Commerce",
    "slug": "ecommerce-website",
    "companyId": "tech",
    "primaryCategory": "web-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 21999,
    "discountPrice": 17599,
    "priceType": "one-time",
    "deliveryDays": "25 Days",
    "badge": "Enterprise",
    "isPopular": false,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/str_web_ecommerce.png",
    "color": "#4CAF50",
    "icon": "ShoppingCart",
    "href": "/technology/web-development/ecommerce-website",
    "description": "Complete online store with payment gateway, inventory, and order management.",
    "features": [
      "Online Store with Product Catalog",
      "Customer Login & Account",
      "Payment Gateway (Razorpay / PayU)",
      "Order Management System",
      "Product Management",
      "Inventory Tracking",
      "Invoice Generation",
      "Cart & Wishlist",
      "Product Search & Filter",
      "Admin Dashboard & Analytics"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 25 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-app-android",
    "name": "Android App Development",
    "shortName": "Android App",
    "slug": "android-app",
    "companyId": "tech",
    "primaryCategory": "application-services",
    "category": "app",
    "sector": "app-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "Popular",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/str_app_android.png",
    "color": "#3DDC84",
    "icon": "Smartphone",
    "href": "/technology/app-development/android",
    "description": "Native Android application built with Kotlin for your business needs.",
    "features": [
      "Native Android (Kotlin/Java)",
      "Custom UI/UX Design",
      "API Integration",
      "Push Notifications",
      "Google Play Store Publishing",
      "30-Day Post-Launch Support"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Flutter",
      "React Native",
      "Android SDK",
      "iOS Swift",
      "Firebase"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-app-ios",
    "name": "iOS App Development",
    "shortName": "iOS App",
    "slug": "ios-app",
    "companyId": "tech",
    "primaryCategory": "application-services",
    "category": "app",
    "sector": "app-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#1C1C1E",
    "icon": "Smartphone",
    "href": "/technology/app-development/ios",
    "description": "Native iOS application built with Swift for iPhone and iPad users.",
    "features": [
      "Native iOS (Swift)",
      "Custom UI/UX Design",
      "API Integration",
      "Push Notifications",
      "App Store Publishing",
      "30-Day Post-Launch Support"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Flutter",
      "React Native",
      "Android SDK",
      "iOS Swift",
      "Firebase"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-app-hybrid",
    "name": "Hybrid Mobile App",
    "shortName": "Hybrid App",
    "slug": "hybrid-app",
    "companyId": "tech",
    "primaryCategory": "application-services",
    "category": "app",
    "sector": "app-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "Best Value",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/str_app_android.png",
    "color": "#54C5F8",
    "icon": "Layers",
    "href": "/technology/app-development/hybrid",
    "description": "Cross-platform app (Flutter) for Android & iOS from a single, cost-effective codebase.",
    "features": [
      "Android + iOS (Flutter)",
      "Single Codebase",
      "Custom UI/UX Design",
      "API Integration",
      "Both Store Publishing",
      "Cost Effective vs. 2 Native Apps"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Flutter",
      "React Native",
      "Android SDK",
      "iOS Swift",
      "Firebase"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-hotel",
    "name": "Hotel Management Website",
    "shortName": "Hotel",
    "slug": "hotel-management",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "specialized-website",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#F5A623",
    "icon": "Building2",
    "href": "/technology/specialized/hotel-management",
    "description": "Complete hotel and hospitality management system with booking.",
    "features": [
      "Room Management",
      "Online Booking",
      "Guest Portal",
      "Invoice",
      "Housekeeping"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-hospital",
    "name": "Hospital Management System",
    "shortName": "Hospital",
    "slug": "hospital-management",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "specialized-website",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "Popular",
    "isPopular": true,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#EF4444",
    "icon": "Heart",
    "href": "/technology/specialized/hospital-management",
    "description": "Comprehensive healthcare management for hospitals and clinics.",
    "features": [
      "Patient Records",
      "Doctor Schedule",
      "Appointment Booking",
      "Billing",
      "Lab Reports"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-school",
    "name": "School Management System",
    "shortName": "School",
    "slug": "school-management",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "specialized-website",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "Popular",
    "isPopular": true,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#2563EB",
    "icon": "GraduationCap",
    "href": "/technology/specialized/school-management",
    "description": "End-to-end school management with student portal, fees, attendance.",
    "features": [
      "Student Portal",
      "Fee Management",
      "Attendance",
      "Timetable",
      "Result Management"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-elearning",
    "name": "E-Learning Platform",
    "shortName": "E-Learning",
    "slug": "elearning-platform",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "specialized-website",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#2563EB",
    "icon": "BookOpen",
    "href": "/technology/specialized/elearning",
    "description": "Online education platform with courses, quizzes, and certificates.",
    "features": [
      "Course Management",
      "Video Streaming",
      "Quiz System",
      "Certificate",
      "Payment"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-realestate",
    "name": "Real Estate Website",
    "shortName": "Real Estate",
    "slug": "real-estate",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "specialized-website",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#F59E0B",
    "icon": "Home",
    "href": "/technology/specialized/real-estate",
    "description": "Property listing portal with search, filters, and agent management.",
    "features": [
      "Property Listings",
      "Advanced Search",
      "Agent Portal",
      "Inquiry Management",
      "Virtual Tours"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-restaurant",
    "name": "Restaurant & Food Ordering",
    "shortName": "Restaurant",
    "slug": "restaurant",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "specialized-website",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#EF4444",
    "icon": "Utensils",
    "href": "/technology/specialized/restaurant",
    "description": "Online food ordering system with menu, cart, and delivery management.",
    "features": [
      "Online Menu",
      "Order Management",
      "Table Booking",
      "Delivery Tracking",
      "Payment Gateway"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-erp",
    "name": "ERP Software",
    "shortName": "ERP",
    "slug": "erp-software",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "software",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "Enterprise",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#1E90FF",
    "icon": "Database",
    "href": "/technology/software/erp",
    "description": "Enterprise Resource Planning for complete business operations management.",
    "features": [
      "Finance",
      "HR & Payroll",
      "Inventory",
      "Sales & CRM",
      "Reporting",
      "Multi-Branch"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-spec-crm",
    "name": "CRM Software",
    "shortName": "CRM",
    "slug": "crm-software",
    "companyId": "tech",
    "primaryCategory": "software-services",
    "category": "software",
    "sector": "software-erp",
    "group": "technology",
    "entity": "str",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#2563EB",
    "icon": "Users",
    "href": "/technology/software/crm",
    "description": "Customer Relationship Management system to grow and retain your client base.",
    "features": [
      "Lead Management",
      "Client Tracking",
      "Follow-up Reminders",
      "Sales Pipeline",
      "Analytics"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "PostgreSQL / MySQL",
      "Express.js",
      "Docker",
      "Tailwind"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-maint-website",
    "name": "Website Maintenance & AMC",
    "shortName": "Web AMC",
    "slug": "website-maintenance",
    "companyId": "tech",
    "primaryCategory": "maintenance-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 999,
    "discountPrice": null,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "AMC Managed",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#2563EB",
    "icon": "Wrench",
    "href": "/technology/web-development/one-page-website",
    "description": "Complete annual website maintenance, daily backups, speed optimization, and security monitoring.",
    "features": [
      "Regular Backups",
      "Security Patching",
      "Uptime Monitoring",
      "Content Updates",
      "Bug Fixing",
      "Speed Optimization"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Node.js"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-maint-app",
    "name": "Mobile App Support & AMC",
    "shortName": "App AMC",
    "slug": "app-maintenance",
    "companyId": "tech",
    "primaryCategory": "maintenance-services",
    "category": "app",
    "sector": "app-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 2499,
    "discountPrice": 1999,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#3DDC84",
    "icon": "Wrench",
    "href": "/technology/app-development/android",
    "description": "Ongoing Android and iOS mobile application support, API maintenance, and OS compatibility updates.",
    "features": [
      "API Maintenance",
      "OS Compatibility Updates",
      "Crash Reporting & Fixes",
      "Store Compliance",
      "Performance Monitoring"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Flutter",
      "React Native",
      "Android SDK",
      "iOS Swift",
      "Firebase"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-host-cloud",
    "name": "High Performance NVMe Cloud Hosting",
    "shortName": "Cloud Host",
    "slug": "cloud-hosting",
    "companyId": "tech",
    "primaryCategory": "hosting-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 1499,
    "discountPrice": null,
    "priceType": "monthly",
    "deliveryDays": "1 Days",
    "badge": "99.9% Uptime",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#1E90FF",
    "icon": "Server",
    "href": "/technology/web-development/static-website",
    "description": "Lightning-fast LiteSpeed NVMe SSD cloud web hosting with free SSL, CDN, and automatic daily backups.",
    "features": [
      "NVMe SSD Storage",
      "Free SSL Certificate",
      "Global CDN Integration",
      "99.9% Uptime Guarantee",
      "Unmetered Bandwidth",
      "cPanel / Control Panel"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "NVMe Cloud",
      "KVM Virtualization",
      "cPanel / CloudLinux",
      "DDoS Shield"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 1 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "str-host-domain",
    "name": "Domain Registration & Managed DNS",
    "shortName": "Domain & DNS",
    "slug": "domain-registration",
    "companyId": "tech",
    "primaryCategory": "hosting-services",
    "category": "website",
    "sector": "web-development",
    "group": "technology",
    "entity": "str",
    "startingPrice": 799,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "1 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "color": "#F4511E",
    "icon": "Globe",
    "href": "/technology/web-development/static-website",
    "description": "Secure domain name registration (.com, .in, .co.in, .org) with DNSSEC protection and free privacy lock.",
    "features": [
      ".com / .in / .org Extensions",
      "Managed DNS Records",
      "DNSSEC Protection",
      "Domain Theft Protection",
      "Auto-Renewal Support"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "NVMe Cloud",
      "KVM Virtualization",
      "cPanel / CloudLinux",
      "DDoS Shield"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 1 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  }
];

export const DEFAULT_CONSULTANCY_PRODUCTS: EcommerceProduct[] = [
  {
    "id": "scs-social-standard",
    "name": "Social Media Page Control",
    "shortName": "Social Media",
    "slug": "social-media-management",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "social-media",
    "sector": "digital-marketing",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 499,
    "discountPrice": null,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "Most Affordable",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/scs_social_standard.png",
    "color": "#1877F2",
    "icon": "Share2",
    "href": "/consultancy/digital-marketing/social-media",
    "description": "Professional management of your social media presence across Facebook, Instagram and WhatsApp.",
    "features": [
      "4 Business Posters / Month",
      "Wish Day Poster — FREE",
      "Facebook & Instagram Management",
      "Content Scheduling",
      "Audience Engagement",
      "Page Performance Monitoring"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Meta Business Suite",
      "Canva Pro",
      "Photoshop",
      "Buffer / Hootsuite"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-meta-weekly",
    "name": "Meta Ads — Weekly",
    "shortName": "Meta Weekly",
    "slug": "meta-ads-weekly",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "meta-ads",
    "sector": "ads-management",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 600,
    "discountPrice": null,
    "priceType": "weekly",
    "deliveryDays": "7 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#0866FF",
    "icon": "Megaphone",
    "href": "/consultancy/ads-management/meta-ads",
    "description": "Short-burst Facebook & Instagram advertising campaign with Wish Day poster.",
    "features": [
      "Wish Day Poster Included",
      "Facebook + Instagram Ads",
      "Audience Targeting",
      "Campaign Report",
      "Professional Setup"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Meta Ads Manager",
      "Facebook Pixel",
      "Conversion API",
      "Lookalike Audiences"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 7 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-meta-monthly",
    "name": "Meta Ads — Monthly",
    "shortName": "Meta Monthly",
    "slug": "meta-ads-monthly",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "meta-ads",
    "sector": "ads-management",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 2000,
    "discountPrice": 1600,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "SPECIAL DEAL",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "/assets/images/services/scs_meta_monthly.png",
    "color": "#0866FF",
    "icon": "Megaphone",
    "href": "/consultancy/ads-management/meta-ads",
    "description": "Full-month managed Meta advertising with Wish Day poster and optimization.",
    "features": [
      "Wish Day Poster Included",
      "Facebook + Instagram Ads",
      "Monthly Optimization",
      "A/B Testing",
      "Retargeting",
      "Monthly Performance Report"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Meta Ads Manager",
      "Facebook Pixel",
      "Conversion API",
      "Lookalike Audiences"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-meta-premium",
    "name": "Meta Ads — Premium",
    "shortName": "Meta Premium",
    "slug": "meta-ads-premium",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "meta-ads",
    "sector": "ads-management",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 9499,
    "discountPrice": 7599,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "Best Value",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#0866FF",
    "icon": "Megaphone",
    "href": "/consultancy/ads-management/meta-ads",
    "description": "The ultimate Meta advertising package with AI videos, reels, and 1M impressions.",
    "features": [
      "2 AI Videos / Normal Videos",
      "4 Reels Videos / Offer ",
      "1 Ads Poster",
      "20 Business Posters",
      "Wish Day Poster — FREE",
      "Professional Fees Included",
      "Meta Ads Cost (1M) Included"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Meta Ads Manager",
      "Facebook Pixel",
      "Conversion API",
      "Lookalike Audiences"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-google-weekly",
    "name": "Google Ads — Weekly",
    "shortName": "Google Weekly",
    "slug": "google-ads-weekly",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "google-ads",
    "sector": "ads-management",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 1000,
    "discountPrice": null,
    "priceType": "weekly",
    "deliveryDays": "7 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#4285F4",
    "icon": "Search",
    "href": "/consultancy/ads-management/google-ads",
    "description": "Quick Google Search campaign to capture immediate, high-intent leads.",
    "features": [
      "Google Search Ads",
      "Keyword Targeting",
      "Basic Campaign Setup",
      "Campaign Report"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Google Ads",
      "Google Tag Manager",
      "Search Console",
      "Google Analytics 4"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 7 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-google-monthly",
    "name": "Google Ads — Monthly",
    "shortName": "Google Monthly",
    "slug": "google-ads-monthly",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "google-ads",
    "sector": "ads-management",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 3500,
    "discountPrice": 2800,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "Popular",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80",
    "color": "#4285F4",
    "icon": "Search",
    "href": "/consultancy/ads-management/google-ads",
    "description": "Full-month managed Google advertising with Search, Display, and conversion tracking.",
    "features": [
      "Google Search + Display Ads",
      "Monthly Campaign Optimization",
      "Conversion Tracking Setup",
      "Negative Keywords Management",
      "Monthly Performance Report"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Google Ads",
      "Google Tag Manager",
      "Search Console",
      "Google Analytics 4"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-google-premium",
    "name": "Google Ads — Premium",
    "shortName": "Google Premium",
    "slug": "google-ads-premium",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "google-ads",
    "sector": "ads-management",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 19999,
    "discountPrice": 15999,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "Premium",
    "isPopular": false,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#4285F4",
    "icon": "Search",
    "href": "/consultancy/ads-management/google-ads",
    "description": "Maximum Google impact — AI videos, content, and 1M Google Ad impressions.",
    "features": [
      "2 AI Videos / Normal Videos",
      "4 Reels Videos / Offer ",
      "1 Ads Poster",
      "Professional Fees Included",
      "Google Ads Cost (1M) Included",
      "YouTube Ads Included"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Google Ads",
      "Google Tag Manager",
      "Search Console",
      "Google Analytics 4"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-gbp-basic",
    "name": "GBP — Basic Management",
    "shortName": "GBP Basic",
    "slug": "gbp-basic",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "google-business",
    "sector": "seo-local",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 1000,
    "discountPrice": null,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#34A853",
    "icon": "MapPin",
    "href": "/consultancy/digital-marketing/google-business-profile",
    "description": "Setup and basic management of your Google Business Profile for local visibility.",
    "features": [
      "Google Business Profile Setup",
      "Business Verification Support",
      "Product & Service Listing",
      "Weekly Business Updates"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Google Business Profile",
      "Local Citation Engine",
      "Geo-tagging",
      "Review Automator"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-gbp-regular",
    "name": "GBP — Regular & SEO",
    "shortName": "GBP Regular",
    "slug": "gbp-regular",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "google-business",
    "sector": "seo-local",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 3000,
    "discountPrice": 2400,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "Local Domination",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#34A853",
    "icon": "MapPin",
    "href": "/consultancy/digital-marketing/google-business-profile",
    "description": "Active management plus local SEO optimization for higher Google Maps rankings.",
    "features": [
      "Everything in Basic",
      "Local SEO Optimization",
      "Review & Reputation Management",
      "Q&A Management",
      "Photo & Video Uploads",
      "Regular Posts & Offers"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Google Business Profile",
      "Local Citation Engine",
      "Geo-tagging",
      "Review Automator"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-gbp-advanced",
    "name": "GBP — Advanced Local SEO",
    "shortName": "GBP Advanced",
    "slug": "gbp-advanced",
    "companyId": "consultancy",
    "primaryCategory": "digital-marketing",
    "category": "google-business",
    "sector": "seo-local",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 8000,
    "discountPrice": 6400,
    "priceType": "monthly",
    "deliveryDays": "3-5 Days",
    "badge": "LIMITED TIME",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#34A853",
    "icon": "MapPin",
    "href": "/consultancy/digital-marketing/google-business-profile",
    "description": "Full GBP domination — advanced local SEO, reputation management, and brand authority.",
    "features": [
      "Everything in Regular",
      "Advanced Local SEO Strategy",
      "Competitor Analysis",
      "Citation Building",
      "Negative Review Management",
      "Monthly Audit & Report"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Google Business Profile",
      "Local Citation Engine",
      "Geo-tagging",
      "Review Automator"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3-5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-video-simple",
    "name": "Simple Video",
    "shortName": "Simple Video",
    "slug": "simple-video",
    "companyId": "consultancy",
    "primaryCategory": "ai-video",
    "category": "video-ai",
    "sector": "video-animation",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 499,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "2 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#EB412C",
    "icon": "Video",
    "href": "/consultancy/video-ai/simple-video",
    "description": "Clean, professional video for business announcements and social media posts.",
    "features": [
      "Slideshow / Text Animation",
      "Background Music",
      "HD Quality",
      "Fast 48h Delivery",
      "AI Voice & Script"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Adobe Premiere Pro",
      "After Effects",
      "Midjourney / Runway AI",
      "CapCut Pro"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 2 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-video-poster",
    "name": "Poster Video",
    "shortName": "Poster Video",
    "slug": "poster-video",
    "companyId": "consultancy",
    "primaryCategory": "ai-video",
    "category": "video-ai",
    "sector": "video-animation",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 599,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "2 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#EC4899",
    "icon": "Video",
    "href": "/consultancy/video-ai/poster-video",
    "description": "Animated business poster video — perfect for WhatsApp status and stories.",
    "features": [
      "Animated Poster",
      "Business Branding",
      "Background Music",
      "HD Quality",
      "Fast Delivery"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Adobe Premiere Pro",
      "After Effects",
      "Midjourney / Runway AI",
      "CapCut Pro"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 2 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-video-cartoon",
    "name": "Cartoon Video",
    "shortName": "Cartoon Video",
    "slug": "cartoon-video",
    "companyId": "consultancy",
    "primaryCategory": "ai-video",
    "category": "video-ai",
    "sector": "video-animation",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 699,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "3 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#F59E0B",
    "icon": "Video",
    "href": "/consultancy/video-ai/cartoon-video",
    "description": "Engaging animated cartoon explainer video for your products and services.",
    "features": [
      "Animated Characters",
      "Custom Storyline",
      "Voiceover",
      "Background Music",
      "HD Delivery"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Adobe Premiere Pro",
      "After Effects",
      "Midjourney / Runway AI",
      "CapCut Pro"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-video-motion-ai",
    "name": "Motion AI Video",
    "shortName": "Motion AI",
    "slug": "motion-ai-video",
    "companyId": "consultancy",
    "primaryCategory": "ai-video",
    "category": "video-ai",
    "sector": "ai-integration",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 799,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "3 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#EB412C",
    "icon": "Sparkles",
    "href": "/consultancy/video-ai/motion-ai-video",
    "description": "AI-enhanced motion graphics video with premium visual quality.",
    "features": [
      "AI-Enhanced Motion Graphics",
      "Professional Editing",
      "AI Voice & Script",
      "Background Music",
      "Fast Delivery"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Adobe Premiere Pro",
      "After Effects",
      "Midjourney / Runway AI",
      "CapCut Pro"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-video-full-ai",
    "name": "Full AI Video",
    "shortName": "Full AI Video",
    "slug": "full-ai-video",
    "companyId": "consultancy",
    "primaryCategory": "ai-video",
    "category": "video-ai",
    "sector": "ai-integration",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 1499,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "3 Days",
    "badge": "AI-Powered",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#EB412C",
    "icon": "Sparkles",
    "href": "/consultancy/video-ai/full-ai-video",
    "description": "Completely AI-generated video with voice, script, visuals, and professional editing.",
    "features": [
      "AI Voice & Script",
      "AI-Generated Visuals",
      "Professional Editing",
      "Background Music",
      "HD Quality",
      "Fast 72h Delivery"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Adobe Premiere Pro",
      "After Effects",
      "Midjourney / Runway AI",
      "CapCut Pro"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 3 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-video-4k",
    "name": "4K High Quality AI Video",
    "shortName": "4K AI Video",
    "slug": "4k-ai-video",
    "companyId": "consultancy",
    "primaryCategory": "ai-video",
    "category": "video-ai",
    "sector": "video-animation",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 1999,
    "discountPrice": null,
    "priceType": "one-time",
    "deliveryDays": "4 Days",
    "badge": "4K Ultra HD",
    "isPopular": false,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#F4511E",
    "icon": "Sparkles",
    "href": "/consultancy/video-ai/4k-ai-video",
    "description": "Premium 4K AI production — the highest quality AI video for maximum impact.",
    "features": [
      "4K Ultra HD Quality",
      "AI Voice & Script",
      "AI-Generated Visuals",
      "Professional Editing",
      "Background Music",
      "Fast Delivery"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "Adobe Premiere Pro",
      "After Effects",
      "Midjourney / Runway AI",
      "CapCut Pro"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 4 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-legal-pvtltd",
    "name": "Pvt. Ltd. Company Registration",
    "shortName": "Pvt. Ltd.",
    "slug": "pvt-ltd-registration",
    "companyId": "consultancy",
    "primaryCategory": "legal",
    "category": "business-legal",
    "sector": "business-legal",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "15 Days",
    "badge": "100% Legal",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#1E293B",
    "icon": "Briefcase",
    "href": "/consultancy/business-legal/pvt-ltd-registration",
    "description": "100% legal Pvt. Ltd. company registration with expert guidance and support.",
    "features": [
      "DIN & DSC",
      "MOA & AOA Drafting",
      "MCA Filing",
      "Certificate of Incorporation",
      "PAN & TAN",
      "Expert Support"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "MCA V3 Portal",
      "SPICe+ Forms",
      "GST Portal",
      "IP India Registry"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 15 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-legal-gst",
    "name": "GST Registration",
    "shortName": "GST",
    "slug": "gst-registration",
    "companyId": "consultancy",
    "primaryCategory": "legal",
    "category": "business-legal",
    "sector": "financial-tax",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "7 Days",
    "badge": "Popular",
    "isPopular": true,
    "isFeatured": true,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#EF4444",
    "icon": "FileText",
    "href": "/consultancy/business-legal/gst-registration",
    "description": "Hassle-free GST registration for your business — fast, legal, expert-handled.",
    "features": [
      "Complete GST Setup",
      "Document Filing",
      "GSTIN Certificate",
      "GST Portal Access",
      "Expert Support"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "MCA V3 Portal",
      "SPICe+ Forms",
      "GST Portal",
      "IP India Registry"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 7 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-legal-msme",
    "name": "MSME (Udyam) Registration",
    "shortName": "MSME",
    "slug": "msme-registration",
    "companyId": "consultancy",
    "primaryCategory": "legal",
    "category": "business-legal",
    "sector": "business-legal",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "5 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#F59E0B",
    "icon": "FileText",
    "href": "/consultancy/business-legal/msme-registration",
    "description": "MSME Udyam registration to access government schemes and benefits.",
    "features": [
      "Udyam Certificate",
      "Government Benefits Access",
      "Priority Lending Eligibility",
      "Trademark Fee Concession",
      "Expert Guidance"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "MCA V3 Portal",
      "SPICe+ Forms",
      "GST Portal",
      "IP India Registry"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 5 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  },
  {
    "id": "scs-legal-itr",
    "name": "Income Tax Returns",
    "shortName": "ITR Filing",
    "slug": "income-tax-returns",
    "companyId": "consultancy",
    "primaryCategory": "legal",
    "category": "business-legal",
    "sector": "financial-tax",
    "group": "consultancy",
    "entity": "scs",
    "startingPrice": 4999,
    "discountPrice": 3999,
    "priceType": "on-request",
    "deliveryDays": "7 Days",
    "badge": "",
    "isPopular": false,
    "isFeatured": false,
    "status": "Active",
    "image": "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80",
    "color": "#10B981",
    "icon": "FileText",
    "href": "/consultancy/business-legal/income-tax-returns",
    "description": "Professional ITR filing for individuals and businesses — on time, every time.",
    "features": [
      "All ITR Forms",
      "Tax Planning Advice",
      "Refund Tracking",
      "Compliance Assured",
      "Expert CA Support"
    ],
    "notIncluded": [],
    "technologiesUsed": [
      "MCA V3 Portal",
      "SPICe+ Forms",
      "GST Portal",
      "IP India Registry"
    ],
    "faqs": [
      {
        "question": "How long will the project kickoff take?",
        "answer": "Initial kickoff begins within 24 hours of onboarding. Complete turnaround is estimated at 7 Days."
      },
      {
        "question": "Can we request changes or revisions?",
        "answer": "Yes, our packages include full review cycles and post-delivery revision support to ensure 100% satisfaction."
      }
    ]
  }
];

export async function getEcommerceProducts(companyScope?: string | null): Promise<EcommerceProduct[]> {
  try {
    const scope = (companyScope || "tech").toLowerCase().trim();
    const isConsult = scope === "2" || scope === "consultancy" || scope.includes("consult");
    const isTech = scope === "1" || scope === "tech" || scope.includes("tech");
    const isAll = !scope || scope === "all" || scope === "group" || scope === "saampark-group";

    if (isAll) {
      const [techList, consultList] = await Promise.all([
        getEcommerceProducts("tech"),
        getEcommerceProducts("consultancy")
      ]);
      const combined = [...techList, ...consultList];
      const map = new Map<string, EcommerceProduct>();
      combined.forEach(p => { if (p && p.id) map.set(p.id, p); });
      return Array.from(map.values());
    }

    const targetScope = isConsult ? "consultancy" : "tech";
    const defaultData = isConsult ? DEFAULT_CONSULTANCY_PRODUCTS : DEFAULT_TECH_PRODUCTS;

    const dbData = await fetchModuleDataFromDB<EcommerceProduct[]>("ecommerce_products", defaultData, targetScope);
    
    // Smart merge: ensure all 19 (tech) or 20 (consultancy) products are present,
    // while seamlessly keeping any user customizations from DB!
    const mergedMap = new Map<string, EcommerceProduct>();
    defaultData.forEach(p => mergedMap.set(p.id, p));

    if (Array.isArray(dbData) && dbData.length > 0) {
      dbData.forEach(p => {
        if (p && p.id) {
          const def = mergedMap.get(p.id);
          mergedMap.set(p.id, def ? { ...def, ...p } : p);
        }
      });
    }

    const finalList = Array.from(mergedMap.values());
    
    // If DB was missing any default products, persist the merged catalog to DB
    if (!Array.isArray(dbData) || dbData.length < defaultData.length) {
      saveModuleDataToDB("ecommerce_products", finalList, targetScope).catch(console.warn);
    }

    return finalList;
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
