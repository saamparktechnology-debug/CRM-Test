"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QUERY_RESTRICTIONS } from "@/lib/queryOptions";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  CheckSquare,
  LayoutGrid,
  Briefcase,
  Monitor,
  Calendar,
  Command,
  CheckCircle,
  Check,
  Search,
  Plus,
  Clock,
  Bell,
  Mail,
  Settings,
  LogOut,
  User,
  Sun,
  Moon,
  X,
  Building2,
  GitBranch,
  CreditCard,
  MapPin,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "../ui/Button";
import { useUIStore } from "@/store/useUIStore";
import {
  useAuthStore,
  COMPANIES,
  getCompanyLogoUrl,
  getCompanyFullName,
  isMatchingCompany,
  getUserEntityScope,
} from "@/store/useAuthStore";
import { usePermissionStore } from "@/store/usePermissionStore";
import { TopbarSection1 } from "@/components/layout/components/topbar-sections/TopbarSection1"
import { TopbarSection2 } from "@/components/layout/components/topbar-sections/TopbarSection2"
import { TopbarSection3 } from "@/components/layout/components/topbar-sections/TopbarSection3"
import { TopbarSection4 } from "@/components/layout/components/topbar-sections/TopbarSection4"
import { runTopbarEffect50 } from "@/components/layout/hooks/topbar-hooks/runTopbarEffect50.hooks"
import { createTopbarFn51 } from "@/components/layout/hooks/topbar-hooks/createTopbarFn51.hooks"
import { createTopbarFn52 } from "@/components/layout/hooks/topbar-hooks/createTopbarFn52.hooks"
import { runTopbarEffect53 } from "@/components/layout/hooks/topbar-hooks/runTopbarEffect53.hooks"
import { runTopbarEffect54 } from "@/components/layout/hooks/topbar-hooks/runTopbarEffect54.hooks"
import { computeTopbarMemo55 } from "@/components/layout/hooks/topbar-hooks/computeTopbarMemo55.hooks"



export function Topbar() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar, openModal } = useUIStore();
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

  // Real-time synchronization of company and branch from URL path
  React.useEffect(() => runTopbarEffect50(() => __ctrlRef.current), [
    pathname,
    branches,
    activeCompanyId,
    activeBranchId,
    switchCompany,
    switchBranch,
  ]);

  const handleSelectCompany: any = createTopbarFn51(() => __ctrlRef.current);

  const handleSelectBranch: any = createTopbarFn52(() => __ctrlRef.current);

  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = React.useState(false);
  const [showBranchMenu, setShowBranchMenu] = React.useState(false);
  const [showSubBranchMenu, setShowSubBranchMenu] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);

  // DOM element refs for robust outside-click detection
  const companyMenuRef = React.useRef<HTMLDivElement>(null);
  const branchMenuRef = React.useRef<HTMLDivElement>(null);
  const subBranchMenuRef = React.useRef<HTMLDivElement>(null);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const notifRef = React.useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    fetchCompanies().catch(() => {});
    fetchBranches().catch(() => {});
    fetchSubBranches().catch(() => {});
    const handleSync = () => {
      fetchCompanies(true).catch(() => {});
      fetchBranches(true).catch(() => {});
      fetchSubBranches(true).catch(() => {});
    };
    window.addEventListener("saampark_company_updated", handleSync);
    return () => {
      window.removeEventListener("saampark_company_updated", handleSync);
    };
  }, [fetchCompanies, fetchBranches, fetchSubBranches]);

  // Real-time synchronization of current user session with latest database record
  React.useEffect(() => runTopbarEffect53(() => __ctrlRef.current), [user?.email]);

  React.useEffect(() => {
    if (!user) return;
    const handleNotifUpdate = () => {
      queryClient.invalidateQueries({
        queryKey: ["app-notifications", user.email, user.role],
      });
    };
    window.addEventListener(
      "saampark_notifications_updated",
      handleNotifUpdate,
    );
    return () => {
      window.removeEventListener(
        "saampark_notifications_updated",
        handleNotifUpdate,
      );
    };
  }, [user, queryClient]);

  // Robust outside click, touch and scroll handling using ref containment
  React.useEffect(() => runTopbarEffect54(() => __ctrlRef.current), []);

  // Auto-close any open dropdown menu upon route navigation
  React.useEffect(() => {
    setShowCompanyMenu(false);
    setShowBranchMenu(false);
    setShowSubBranchMenu(false);
    setShowProfileMenu(false);
    setShowNotifications(false);
  }, [pathname]);

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Resolve hierarchical user entity scope (Company -> Branch -> Sub-Branch)
  const userScope = React.useMemo(() => {
    return getUserEntityScope(user, companies, branches, subBranches);
  }, [user, companies, branches, subBranches]);

  // Companies this specific user has access to
  const allowedCompanies = React.useMemo(() => {
    if (userScope.isSuperAdmin) return companies;
    return companies.filter((c) =>
      userScope.allowedCompanyIds.some((id) => isMatchingCompany(c, id)),
    );
  }, [userScope, companies]);

  // Branches this specific user has access to
  const allowedBranches = React.useMemo(() => {
    const validBranches = (branches || []).filter((b) => Boolean(b && b.id));
    if (userScope.isSuperAdmin) return validBranches;
    return validBranches.filter((b) =>
      userScope.allowedBranchIds.some(
        (id) =>
          String(id).toLowerCase().trim() === String(b.id).toLowerCase().trim(),
      ),
    );
  }, [userScope, branches]);

  // Sub-Branches this specific user has access to
  const allowedSubBranches = React.useMemo(() => {
    const validSubs = (subBranches || []).filter((sb) => Boolean(sb && sb.id));
    if (
      userScope.isSuperAdmin ||
      userScope.scopeLevel === "company" ||
      userScope.scopeLevel === "global"
    )
      return validSubs;
    return validSubs.filter((sb) =>
      userScope.allowedSubBranchIds.some(
        (id) =>
          String(id).toLowerCase().trim() ===
          String(sb.id).toLowerCase().trim(),
      ),
    );
  }, [userScope, subBranches]);

  const isSuperAdmin = user?.role === "Super Admin";
  const isGroupLevel =
    !activeCompanyId ||
    activeCompanyId === "all" ||
    activeCompanyId === "group" ||
    activeCompanyId === "saampark-group";
  const isAllCompanies = isGroupLevel;

  const activeCompany = isGroupLevel
    ? null
    : companies.find((c) => isMatchingCompany(c, activeCompanyId)) ||
      companies.find((c) => isMatchingCompany(c, user?.companyId)) ||
      allowedCompanies[0] ||
      companies[0];

  const activeCompanyName = isGroupLevel
    ? "SAAMPARK GROUP"
    : activeCompany
      ? getCompanyFullName(activeCompany)
      : "SAAMPARK GROUP";
  const activeCompanyLogo = isGroupLevel
    ? null
    : activeCompany
      ? getCompanyLogoUrl(activeCompany)
      : null;
  const activeBranch = isGroupLevel || !activeBranchId
    ? null
    : branches.find((b) => String(b.id).toLowerCase().trim() === String(activeBranchId).toLowerCase().trim()) || null;
  const activeSubBranch = isGroupLevel || !activeSubBranchId
    ? null
    : subBranches.find((sb) => String(sb.id).toLowerCase().trim() === String(activeSubBranchId).toLowerCase().trim()) || null;
  const activeEntityLogo =
    activeSubBranch?.logo_url || activeBranch?.logo_url || activeCompanyLogo;

  const canSwitchEntities =
    userScope.isSuperAdmin ||
    (userScope.scopeLevel !== "subbranch" &&
      (allowedCompanies.length > 1 ||
        allowedBranches.length > 1 ||
        allowedSubBranches.length > 0));

  // Branches belonging strictly to currently active company scope
  // If at SAAMPARK Group level, branches are strictly empty (hidden from Topbar)
  const companyBranches = React.useMemo(() => {
    if (isGroupLevel) {
      return [];
    }
    const targetIds = [
      activeCompanyId,
      activeCompany?.id,
      activeCompany?.slug,
      (activeCompany as any)?.numeric_id,
    ]
      .filter((v) => v !== undefined && v !== null && String(v).trim() !== "")
      .map((v) => String(v));

    return allowedBranches.filter((b) => {
      const candidateCompIds = [
        b.companyId,
        (b as any).company_id,
        (b as any).company_slug,
      ].filter((v) => v !== undefined && v !== null && String(v).trim() !== "");

      if (candidateCompIds.length === 0) return false;
      return candidateCompIds.some((bCompId) =>
        targetIds.some(
          (tId) =>
            String(bCompId).toLowerCase().trim() === tId.toLowerCase().trim() ||
            isMatchingCompany({ id: bCompId, slug: bCompId } as any, tId),
        ),
      );
    });
  }, [isGroupLevel, allowedBranches, activeCompanyId, activeCompany]);

  // Sub-branches belonging strictly to currently active branch scope
  // If at SAAMPARK Group level or no specific branch is selected, sub-branches are strictly empty (hidden from Topbar)
  const availableSubBranches: any = React.useMemo(() => computeTopbarMemo55({ isGroupLevel, activeBranchId, allowedSubBranches, activeBranch }), [isGroupLevel, allowedSubBranches, activeBranchId, activeBranch]);

  // Automatic clean state synchronization across entity hierarchy
  React.useEffect(() => {
    if (isGroupLevel) {
      if (activeBranchId !== null) switchBranch(null);
      if (activeSubBranchId !== null) switchSubBranch(null);
    } else {
      if (companyBranches.length === 0) {
        if (activeBranchId !== null) switchBranch(null);
        if (activeSubBranchId !== null) switchSubBranch(null);
      } else if (activeBranchId) {
        const branchMatches = companyBranches.some(
          (b) =>
            String(b.id).toLowerCase().trim() ===
            String(activeBranchId).toLowerCase().trim(),
        );
        if (!branchMatches) {
          switchBranch(null);
          switchSubBranch(null);
        }
      }
    }
  }, [
    isGroupLevel,
    activeCompanyId,
    companyBranches.length,
    activeBranchId,
    activeSubBranchId,
    switchBranch,
    switchSubBranch,
  ]);

  // Clean sub-branch state synchronization
  React.useEffect(() => {
    if (activeSubBranchId) {
      if (availableSubBranches.length === 0) {
        switchSubBranch(null);
      } else {
        const subMatches = availableSubBranches.some(
          (sb) =>
            String(sb.id).toLowerCase().trim() ===
            String(activeSubBranchId).toLowerCase().trim(),
        );
        if (!subMatches) {
          switchSubBranch(null);
        }
      }
    }
  }, [availableSubBranches, activeSubBranchId, switchSubBranch]);

  
  __ctrl = { theme, setTheme, router, pathname, isSidebarCollapsed, toggleSidebar, openModal, user, activeCompanyId, activeBranchId, activeSubBranchId, switchCompany, switchBranch, switchSubBranch, logout, companies, branches, subBranches, fetchCompanies, fetchBranches, fetchSubBranches, handleSelectCompany, handleSelectBranch, showProfileMenu, setShowProfileMenu, showNotifications, setShowNotifications, showCompanyMenu, setShowCompanyMenu, showBranchMenu, setShowBranchMenu, showSubBranchMenu, setShowSubBranchMenu, notifications, setNotifications, companyMenuRef, branchMenuRef, subBranchMenuRef, profileMenuRef, notifRef, queryClient, stop, isMobile, setIsMobile, userScope, allowedCompanies, allowedBranches, allowedSubBranches, isSuperAdmin, isGroupLevel, isAllCompanies, activeCompany, activeCompanyName, activeCompanyLogo, activeBranch, activeSubBranch, activeEntityLogo, canSwitchEntities, companyBranches, availableSubBranches };
  __ctrlRef.current = __ctrl;

  if (!user) return null;

  return (
    <>
      {/* Mobile Dimmed Backdrop Overlay (Positioned behind header and dropdowns at z-[90] without blur) */}
      {(showCompanyMenu ||
        showBranchMenu ||
        showSubBranchMenu ||
        showNotifications ||
        showProfileMenu) && (
        <div
          className="fixed inset-0 bg-black/25 z-[90] sm:hidden"
          onClick={() => {
            setShowCompanyMenu(false);
            setShowBranchMenu(false);
            setShowSubBranchMenu(false);
            setShowNotifications(false);
            setShowProfileMenu(false);
          }}
        />
      )}

      <header
        style={{ left: isMobile ? 0 : isSidebarCollapsed ? 64 : 256 }}
        className="fixed top-0 right-0 h-16 glass-panel border-b border-border/50 flex items-center justify-between px-2 sm:px-6 z-30 transition-[left] duration-300 ease-in-out bg-surface/95 overflow-visible"
      >
        {/* ── LEFT: Hamburger + Current Company View & Workspace Switcher ── */}
        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 overflow-visible">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              stop(e);
              toggleSidebar();
            }}
            className="text-slate-500 hover:text-slate-900 dark:hover:text-white shrink-0 cursor-pointer h-9 w-9 p-0"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </Button>

          {/* Hierarchical Entity Selectors in Top Navbar: Company Tab, Branch Tab, Sub-Branch Tab */}
          <div className="flex items-center gap-1 sm:gap-2 flex-nowrap shrink min-w-0 overflow-x-auto sm:overflow-visible scrollbar-hide py-1 max-w-[calc(100vw-180px)] sm:max-w-[65vw]">
            <TopbarSection1 ctrl={__ctrl} />

            <TopbarSection2 ctrl={__ctrl} />

            <TopbarSection3 ctrl={__ctrl} />
          </div>
        </div>

        {/* ── RIGHT: Actions + Profile ── */}
        <TopbarSection4 ctrl={__ctrl} />
      </header>
    </>
  );
}
