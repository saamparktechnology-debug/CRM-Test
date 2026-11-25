"use client"

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
import { Button } from "@/components/ui/Button";
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

export function createTopbarFn51(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setShowCompanyMenu, setShowBranchMenu, setShowSubBranchMenu, pathname, switchCompany, switchBranch, switchSubBranch, router } = getCtrl();
    const __fn: any = (c: any) => {
    setShowCompanyMenu(false);
    setShowBranchMenu(false);
    setShowSubBranchMenu(false);
    const featurePath =
      pathname && pathname.includes("/feature/")
        ? pathname.substring(pathname.indexOf("/feature/"))
        : "/feature/dashboard";

    if (!c || c === "all") {
      switchCompany("all");
      switchBranch(null);
      switchSubBranch(null);
      router.push(featurePath);
      return;
    }

    const cId = c.id || c.slug;
    switchCompany(cId);
    switchBranch(null);
    switchSubBranch(null);
    router.push(featurePath);
  };
    return __fn(...__args);
  };
}
