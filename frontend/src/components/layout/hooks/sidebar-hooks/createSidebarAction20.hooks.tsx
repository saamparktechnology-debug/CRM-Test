"use client"

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
import { SidebarSection1 } from "@/components/layout/components/sidebar-sections/SidebarSection1"
import { SaamparkVortexLogo, type SubNavItem, type NavItem, ALL_NAV_ITEMS } from "@/components/layout/components/sidebar-sections/SidebarHelpers"

export function createSidebarAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { NAV_TO_MODULE_MAP, activeCompanyId, GROUP_GOVERNANCE_MODULES, isEntityModuleAllowed, activeBranchId, activeSubBranchId, isModuleAllowed } = getCtrl();
    const __fn: any = (u: any, name: string): boolean => {
      if (!u) return false;
      if (name === "Dashboard") return true;

      if (name === "Approvals") {
        return u.role === "Super Admin" || u.role === "Admin";
      }

      const targetModule = NAV_TO_MODULE_MAP[name] || name;

      const isGroupLevel =
        !activeCompanyId ||
        activeCompanyId === "all" ||
        activeCompanyId === "group" ||
        activeCompanyId === "saampark-group";

      // When at SAAMPARK Group holding level, show only necessary executive governance modules for Super Admin.
      // Operational business modules (Projects, Tasks, Marketing, Invoices, Quotations, Leads, Subscriptions, etc.)
      // belong to operating companies and will appear when switching to that specific operating company.
      if (isGroupLevel && u.role === "Super Admin") {
        if (
          !GROUP_GOVERNANCE_MODULES.has(name) &&
          !GROUP_GOVERNANCE_MODULES.has(targetModule)
        ) {
          return false;
        }
      }

      // Super Admin has unrestricted access when viewing an operating company
      if (u.role === "Super Admin") return true;

      // Entity-level module visibility restriction (Company -> Branch -> Sub-Branch)
      const isEntityAllowed = isEntityModuleAllowed(
        activeCompanyId,
        activeBranchId,
        activeSubBranchId,
        targetModule,
      );
      if (!isEntityAllowed) {
        // If Super Admin, let them see system governance (Dashboard, Companies, Branches, Settings, Permissions, Users, Activity Logs)
        if (
          u.role === "Super Admin" &&
          [
            "Dashboard",
            "Companies",
            "Branches",
            "Settings",
            "Permissions",
            "Users",
            "Activity Logs",
          ].includes(targetModule)
        ) {
          return true;
        }
        return false;
      }

      if (name === "Activity Logs") {
        return u.role === "Super Admin" || u.role === "Admin";
      }
      if (u.role === "Super Admin") return true;

      return isModuleAllowed(u, targetModule);
    };
    return __fn(...__args);
  };
}
