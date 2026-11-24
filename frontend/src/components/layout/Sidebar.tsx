"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Mail,
  Briefcase,
  ShoppingCart,
  File,
  Book,
  Users,
  LifeBuoy,
  Folder,
  Clock,
  Settings,
  LayoutDashboard,
  KanbanSquare,
  CheckSquare,
  Sparkles,
  Target,
  FileText,
  Calculator,
  HeadphonesIcon,
  MessageSquare,
  CreditCard,
  Receipt,
  UserCheck,
  ChevronDown,
  ShoppingBag,
  X,
  Building2,
  GitBranch,
  MapPin,
  Shield,
  UserPlus,
  Handshake,
  HelpCircle,
  Phone,
  MessageCircle,
  ClipboardList,
  FileOutput,
  FileInput,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Wallet,
  PiggyBank,
  BarChart3,
  Package,
  Tag,
  Award,
  Boxes,
  Warehouse,
  QrCode,
  UserCog,
  GraduationCap,
  BadgeCheck,
  DollarSign,
  FileStack,
  Ticket,
  Bell,
  FileCheck,
  ShieldCheck,
  Zap,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/useUIStore";
import {
  useAuthStore,
  getCompanyLogoUrl,
  getCompanyFullName,
  isMatchingCompany,
} from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { SidebarSection1 } from "@/components/layout/components/sidebar-sections/SidebarSection1";

import {
  SaamparkVortexLogo,
  type SubNavItem,
  type NavItem,
  ALL_NAV_ITEMS,
} from "@/components/layout/components/sidebar-sections/SidebarHelpers";
export * from "@/components/layout/components/sidebar-sections/SidebarHelpers";
import { createSidebarAction20 } from "@/components/layout/hooks/sidebar-hooks/createSidebarAction20.hooks";

export function Sidebar() {
  const __ctrl: any = {
    get pathname() {
      try {
        return pathname;
      } catch {
        return undefined;
      }
    },
    get isSidebarCollapsed() {
      try {
        return isSidebarCollapsed;
      } catch {
        return undefined;
      }
    },
    get setSidebarCollapsed() {
      try {
        return setSidebarCollapsed;
      } catch {
        return undefined;
      }
    },
    get user() {
      try {
        return user;
      } catch {
        return undefined;
      }
    },
    get activeCompanyId() {
      try {
        return activeCompanyId;
      } catch {
        return undefined;
      }
    },
    get activeBranchId() {
      try {
        return activeBranchId;
      } catch {
        return undefined;
      }
    },
    get activeSubBranchId() {
      try {
        return activeSubBranchId;
      } catch {
        return undefined;
      }
    },
    get switchCompany() {
      try {
        return switchCompany;
      } catch {
        return undefined;
      }
    },
    get switchBranch() {
      try {
        return switchBranch;
      } catch {
        return undefined;
      }
    },
    get switchSubBranch() {
      try {
        return switchSubBranch;
      } catch {
        return undefined;
      }
    },
    get logout() {
      try {
        return logout;
      } catch {
        return undefined;
      }
    },
    get companies() {
      try {
        return companies;
      } catch {
        return undefined;
      }
    },
    get branches() {
      try {
        return branches;
      } catch {
        return undefined;
      }
    },
    get subBranches() {
      try {
        return subBranches;
      } catch {
        return undefined;
      }
    },
    get fetchCompanies() {
      try {
        return fetchCompanies;
      } catch {
        return undefined;
      }
    },
    get fetchBranches() {
      try {
        return fetchBranches;
      } catch {
        return undefined;
      }
    },
    get fetchSubBranches() {
      try {
        return fetchSubBranches;
      } catch {
        return undefined;
      }
    },
    get allowedCompanies() {
      try {
        return allowedCompanies;
      } catch {
        return undefined;
      }
    },
    get allowedBranches() {
      try {
        return allowedBranches;
      } catch {
        return undefined;
      }
    },
    get isAllCompanies() {
      try {
        return isAllCompanies;
      } catch {
        return undefined;
      }
    },
    get activeCompany() {
      try {
        return activeCompany;
      } catch {
        return undefined;
      }
    },
    get activeCompanyName() {
      try {
        return activeCompanyName;
      } catch {
        return undefined;
      }
    },
    get activeCompanyLogo() {
      try {
        return activeCompanyLogo;
      } catch {
        return undefined;
      }
    },
    get activeBranch() {
      try {
        return activeBranch;
      } catch {
        return undefined;
      }
    },
    get activeSubBranch() {
      try {
        return activeSubBranch;
      } catch {
        return undefined;
      }
    },
    get activeEntityLogo() {
      try {
        return activeEntityLogo;
      } catch {
        return undefined;
      }
    },
    get isModuleAllowed() {
      try {
        return isModuleAllowed;
      } catch {
        return undefined;
      }
    },
    get isCompanyModuleAllowed() {
      try {
        return isCompanyModuleAllowed;
      } catch {
        return undefined;
      }
    },
    get isEntityModuleAllowed() {
      try {
        return isEntityModuleAllowed;
      } catch {
        return undefined;
      }
    },
    get userActionPermissions() {
      try {
        return userActionPermissions;
      } catch {
        return undefined;
      }
    },
    get userPermissions() {
      try {
        return userPermissions;
      } catch {
        return undefined;
      }
    },
    get rolePermissions() {
      try {
        return rolePermissions;
      } catch {
        return undefined;
      }
    },
    get roleActionPermissions() {
      try {
        return roleActionPermissions;
      } catch {
        return undefined;
      }
    },
    get companyEnabledModules() {
      try {
        return companyEnabledModules;
      } catch {
        return undefined;
      }
    },
    get rawCounts() {
      try {
        return rawCounts;
      } catch {
        return undefined;
      }
    },
    get setRawCounts() {
      try {
        return setRawCounts;
      } catch {
        return undefined;
      }
    },
    get visitedCounts() {
      try {
        return visitedCounts;
      } catch {
        return undefined;
      }
    },
    get setVisitedCounts() {
      try {
        return setVisitedCounts;
      } catch {
        return undefined;
      }
    },
    get queryClient() {
      try {
        return queryClient;
      } catch {
        return undefined;
      }
    },
    get setAvatarUpdateTick() {
      try {
        return setAvatarUpdateTick;
      } catch {
        return undefined;
      }
    },
    get NAV_TO_MODULE_MAP() {
      try {
        return NAV_TO_MODULE_MAP;
      } catch {
        return undefined;
      }
    },
    get GROUP_GOVERNANCE_MODULES() {
      try {
        return GROUP_GOVERNANCE_MODULES;
      } catch {
        return undefined;
      }
    },
    get checkNavAllowed() {
      try {
        return checkNavAllowed;
      } catch {
        return undefined;
      }
    },
    get allowedNavItems() {
      try {
        return allowedNavItems;
      } catch {
        return undefined;
      }
    },
    get isMobile() {
      try {
        return isMobile;
      } catch {
        return undefined;
      }
    },
    get setIsMobile() {
      try {
        return setIsMobile;
      } catch {
        return undefined;
      }
    },
    get openSubmenus() {
      try {
        return openSubmenus;
      } catch {
        return undefined;
      }
    },
    get setOpenSubmenus() {
      try {
        return setOpenSubmenus;
      } catch {
        return undefined;
      }
    },
    get toggleSubmenu() {
      try {
        return toggleSubmenu;
      } catch {
        return undefined;
      }
    },
    get handleLinkClick() {
      try {
        return handleLinkClick;
      } catch {
        return undefined;
      }
    },
    get getScopedHref() {
      try {
        return getScopedHref;
      } catch {
        return undefined;
      }
    },
    get isDrawerOpen() {
      try {
        return isDrawerOpen;
      } catch {
        return undefined;
      }
    },
  };
  const __ctrlRef = React.useRef<any>(__ctrl);
  __ctrlRef.current = __ctrl;

  const pathname = usePathname();
  const { isSidebarCollapsed, setSidebarCollapsed } = useUIStore();
  const {
    user,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    switchCompany,
    switchBranch,
    switchSubBranch,
    logout,
    companies,
    branches,
    subBranches,
    fetchCompanies,
    fetchBranches,
    fetchSubBranches,
  } = useAuthStore();

  // Initial company/branch/sub-branch hydration is handled centrally by Topbar (with store deduplication).

  const allowedCompanies = React.useMemo(() => {
    if (!user) return [];
    if (user.role === "Super Admin") return companies;
    let rawCompIds = user.companyIds || (user as any).company_ids;
    let userCompIds: string[] = [];
    if (typeof rawCompIds === "string") {
      try {
        userCompIds = JSON.parse(rawCompIds);
      } catch {
        userCompIds = [rawCompIds];
      }
    } else if (Array.isArray(rawCompIds)) {
      userCompIds = rawCompIds;
    }
    if (userCompIds.length === 0) {
      userCompIds = [user.companyId || "tech"];
    }
    return companies.filter((c) =>
      userCompIds.some((id) => isMatchingCompany(c, id)),
    );
  }, [user, companies]);

  const allowedBranches = React.useMemo(() => {
    const validBranches = (branches || []).filter((b) => Boolean(b && b.id));
    if (!user) return [];
    if (user.role === "Super Admin") return validBranches;
    let rawBranchIds = user.branchIds || (user as any).branch_ids;
    let userBranchIds: string[] = [];
    if (typeof rawBranchIds === "string") {
      try {
        userBranchIds = JSON.parse(rawBranchIds);
      } catch {
        userBranchIds = [rawBranchIds];
      }
    } else if (Array.isArray(rawBranchIds)) {
      userBranchIds = rawBranchIds;
    }
    if (userBranchIds.length === 0 && user.branchId) {
      userBranchIds = [user.branchId];
    }
    if (userBranchIds.length === 0) return validBranches;
    return validBranches.filter((b) =>
      userBranchIds.some(
        (id) =>
          String(id).toLowerCase().trim() === String(b.id).toLowerCase().trim(),
      ),
    );
  }, [user, branches]);

  const isAllCompanies = !activeCompanyId || activeCompanyId === "all";

  const activeCompany = React.useMemo(() => {
    if (isAllCompanies) {
      return null;
    }
    return (
      companies.find((c) => isMatchingCompany(c, activeCompanyId)) ||
      companies.find((c) => isMatchingCompany(c, user?.companyId)) ||
      allowedCompanies[0] ||
      companies[0] ||
      null
    );
  }, [
    isAllCompanies,
    activeCompanyId,
    user?.companyId,
    companies,
    allowedCompanies,
  ]);

  const activeCompanyName = isAllCompanies
    ? "SAAMPARK GROUP"
    : activeCompany
      ? getCompanyFullName(activeCompany)
      : "SAAMPARK GROUP";
  const activeCompanyLogo = isAllCompanies
    ? null
    : activeCompany
      ? getCompanyLogoUrl(activeCompany)
      : null;
  const activeBranch = (branches || []).find(
    (b) => b && b.id === activeBranchId,
  );
  const activeSubBranch = (subBranches || []).find(
    (sb) => sb && sb.id === activeSubBranchId,
  );
  const activeEntityLogo =
    activeSubBranch?.logo_url || activeBranch?.logo_url || activeCompanyLogo;
  const {
    isModuleAllowed,
    isCompanyModuleAllowed,
    isEntityModuleAllowed,
    userActionPermissions,
    userPermissions,
    rolePermissions,
    roleActionPermissions,
    companyEnabledModules,
  } = usePermissionStore();

  const [rawCounts, setRawCounts] = React.useState<Record<string, number>>({});
  const [visitedCounts, setVisitedCounts] = React.useState<
    Record<string, number>
  >({});
  const queryClient = useQueryClient();

  // Request browser notification permission and run 3-tier automated reminders on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        import("@/lib/notificationService").then(
          ({ requestNotificationPermission }) => {
            requestNotificationPermission().catch(() => {});
          },
        );
      }

      const lastRun = Number(
        localStorage.getItem("saampark_last_reminder_run") || "0",
      );
      if (Date.now() - lastRun > 30 * 60 * 1000) {
        localStorage.setItem("saampark_last_reminder_run", String(Date.now()));
        import("@/lib/automatedReminderEngine").then(
          ({ runAutomated3TierReminders }) => {
            runAutomated3TierReminders().catch(() => {});
          },
        );
      }
    }
  }, []);

  const [, setAvatarUpdateTick] = React.useState(0);
  React.useEffect(() => {
    const handleAvatarChange = () => setAvatarUpdateTick((t) => t + 1);
    window.addEventListener("crm_avatar_changed", handleAvatarChange);
    window.addEventListener("storage", handleAvatarChange);
    return () => {
      window.removeEventListener("crm_avatar_changed", handleAvatarChange);
      window.removeEventListener("storage", handleAvatarChange);
    };
  }, []);

  // Load dynamic module badges in real time
  React.useEffect(() => {
    const handlePermsUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ["sidebar-badges"] });
    };
    window.addEventListener(
      "saampark_user_permissions_updated",
      handlePermsUpdated,
    );
    return () =>
      window.removeEventListener(
        "saampark_user_permissions_updated",
        handlePermsUpdated,
      );
  }, [queryClient]);

  // Load visited counts from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("saampark_visited_badge_counts");
      if (stored) setVisitedCounts(JSON.parse(stored));
    } catch {}
  }, []);

  // Auto clear badges on visit
  React.useEffect(() => {
    const activeItem = ALL_NAV_ITEMS.find(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
    );
    if (activeItem) {
      const currentRaw =
        rawCounts[activeItem.name] !== undefined
          ? rawCounts[activeItem.name]
          : activeItem.badge || 0;
      setVisitedCounts((prev) => {
        if (prev[activeItem.name] === currentRaw) return prev;
        const updated = { ...prev, [activeItem.name]: currentRaw };
        try {
          localStorage.setItem(
            "saampark_visited_badge_counts",
            JSON.stringify(updated),
          );
        } catch {}
        return updated;
      });
    }
  }, [pathname, rawCounts]);

  // Precise mapping between sidebar navigation item titles and CRM module keys
  const NAV_TO_MODULE_MAP: Record<string, string> = {
    Dashboard: "Dashboard",
    Organisation: "Companies",
    Companies: "Companies",
    Branches: "Branches",
    Departments: "Departments",
    Teams: "Teams",
    Users: "Users",
    Permissions: "Permissions",
    CRM: "Leads",
    Leads: "Leads",
    Clients: "Clients",
    Proposals: "Proposals",
    Projects: "Projects",
    Tasks: "Tasks",
    "Digital Marketing": "Digital Marketing",
    "Client Marketing Report": "Digital Marketing",
    "Marketing Plans & Retainers": "Digital Marketing",
    "Posts & Deliverables": "Digital Marketing",
    "Marketing Leads & Ads": "Digital Marketing",
    Sales: "Invoices",
    "Manage Ecommerce": "Ecommerce",
    Ecommerce: "Ecommerce",
    "Manage Products": "Ecommerce",
    "Manage Orders": "Ecommerce",
    "Manage Storefront": "Ecommerce",
    Quotations: "Quotations",
    Estimates: "Estimates",
    Invoices: "Invoices",
    Payments: "Payments",
    Subscriptions: "Subscriptions",
    "Packages & Retainers": "Subscriptions",
    "EMI Milestone Plans": "EMI",
    EMI: "EMI",
    "HR & Employees": "Teams",
    "Team Members": "Teams",
    "Payments & Payroll": "Payroll",
    "Leave Management": "Leave",
    "Attendance & Timecards": "Attendance",
    Support: "Tickets",
    Tickets: "Tickets",
    "Knowledge Base": "Knowledge base",
    Files: "Files",
    Expenses: "Expenses",
    Reports: "Reports",
    Settings: "Settings",
    "General Settings": "Settings",
    Approvals: "Approvals",
    "Activity Logs": "Activity Logs",
  };

  // Essential governance modules required when viewing at SAAMPARK Group holding level
  const GROUP_GOVERNANCE_MODULES = new Set([
    "Dashboard",
    "Companies",
    "Branches",
    "Users",
    "Approvals",
    "Reports",
    "Settings",
    "General Settings",
    "Permissions",
    "Departments",
    "Teams",
    "Activity Logs",
  ]);

  // Check permission for any nav or sub-nav item strictly and individually
  const checkNavAllowed: any = createSidebarAction20(() => __ctrlRef.current);

  // Filter items strictly by individual module permissions
  const allowedNavItems = React.useMemo(() => {
    if (!user) return [];
    return ALL_NAV_ITEMS.map((item) => {
      if (item.subItems && item.subItems.length > 0) {
        // Filter every sub-item individually against the user's permissions
        const filteredSubs = item.subItems.filter((sub) =>
          checkNavAllowed(user, sub.name),
        );
        // Parent menu header is ONLY visible if at least one sub-item is granted to this user!
        if (filteredSubs.length === 0) return null;
        return {
          ...item,
          subItems: filteredSubs,
        };
      }
      return checkNavAllowed(user, item.name) ? item : null;
    }).filter(Boolean) as NavItem[];
  }, [
    user,
    checkNavAllowed,
    userActionPermissions,
    userPermissions,
    rolePermissions,
    roleActionPermissions,
  ]);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Automatically collapse sidebar on initial mobile load
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarCollapsed]);

  const [openSubmenus, setOpenSubmenus] = React.useState<
    Record<string, boolean>
  >({
    Settings: false,
    CRM: false,
    "Digital Marketing": true,
    Sales: true,
    "Manage Ecommerce": false,
    Subscriptions: false,
    "HR & Employees": false,
    Support: false,
  });

  React.useEffect(() => {
    if (pathname.startsWith("/feature/marketing")) {
      setOpenSubmenus((prev) => ({ ...prev, "Digital Marketing": true }));
    }
    if (
      pathname.startsWith("/feature/settings") ||
      pathname.startsWith("/feature/companies") ||
      pathname.startsWith("/feature/branches") ||
      pathname.startsWith("/feature/permissions") ||
      pathname === "/feature/teams" ||
      pathname.startsWith("/feature/teams")
    ) {
      setOpenSubmenus((prev) => ({ ...prev, Settings: true }));
    }
    if (
      pathname.startsWith("/feature/leads") ||
      pathname.startsWith("/feature/clients")
    ) {
      setOpenSubmenus((prev) => ({ ...prev, CRM: true }));
    }
    if (
      pathname.startsWith("/feature/sales") ||
      pathname.startsWith("/feature/quotations") ||
      pathname.startsWith("/feature/estimates") ||
      pathname.startsWith("/feature/credit-notes") ||
      pathname.startsWith("/feature/debit-notes")
    ) {
      setOpenSubmenus((prev) => ({ ...prev, Sales: true }));
    }
    if (pathname.startsWith("/feature/ecommerce")) {
      setOpenSubmenus((prev) => ({ ...prev, "Manage Ecommerce": true }));
    }
    if (
      pathname.startsWith("/feature/subscriptions") ||
      pathname.startsWith("/feature/emi")
    ) {
      setOpenSubmenus((prev) => ({ ...prev, Subscriptions: true }));
    }
    if (pathname.startsWith("/feature/team")) {
      setOpenSubmenus((prev) => ({ ...prev, "HR & Employees": true }));
    }
    if (
      pathname.startsWith("/feature/tickets") ||
      pathname.startsWith("/feature/knowledge-base")
    ) {
      setOpenSubmenus((prev) => ({ ...prev, Support: true }));
    }
  }, [pathname]);

  const toggleSubmenu = (name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubmenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  // Scoped URL generator for company + branch hierarchical routing
  const getScopedHref = React.useCallback(
    (baseHref: string) => {
      if (!baseHref || !baseHref.startsWith("/feature/")) return baseHref;
      if (
        !activeCompanyId ||
        activeCompanyId === "all" ||
        activeCompanyId === "group"
      ) {
        return baseHref;
      }
      const cSlug = String(activeCompanyId).toLowerCase().includes("consult")
        ? "saampark-consultancy"
        : "saampark-technology";
      const currentBranchObj = branches?.find((b) => b.id === activeBranchId);
      const bSlug = currentBranchObj
        ? currentBranchObj.code?.toLowerCase() ||
          currentBranchObj.name?.toLowerCase().replace(/\s+/g, "-")
        : "main";
      return `/${cSlug}/${bSlug}${baseHref}`;
    },
    [activeCompanyId, activeBranchId, branches],
  );

  // Sidebar visibility on mobile
  const isDrawerOpen = !isSidebarCollapsed;

  __ctrlRef.current = __ctrl;
  return (
    <>
      {/* ── MOBILE BACKDROP OVERLAY ── */}
      <AnimatePresence>
        {isMobile && isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarCollapsed(true)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR DRAWER ── */}
      <SidebarSection1 ctrl={__ctrl} />
    </>
  );
}
