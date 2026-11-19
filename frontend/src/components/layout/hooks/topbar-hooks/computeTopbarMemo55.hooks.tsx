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

export function computeTopbarMemo55(ctx: any) {
  const { isGroupLevel, activeBranchId, allowedSubBranches, activeBranch } = ctx;
  const __fn: any = () => {
    if (isGroupLevel || !activeBranchId || activeBranchId === "all") {
      return [];
    }
    const validSubs = allowedSubBranches || [];
    const targetNorm = String(activeBranchId).toLowerCase().trim();
    const bId = activeBranch
      ? String(activeBranch.id).toLowerCase().trim()
      : "";
    const bSlug = activeBranch
      ? String((activeBranch as any).slug || activeBranch.name)
          .toLowerCase()
          .trim()
      : "";

    return validSubs.filter((sb) => {
      const pId = String(
        sb.parentBranchId ||
          (sb as any).branch_id ||
          (sb as any).branchId ||
          "",
      )
        .toLowerCase()
        .trim();
      const pName = String(
        (sb as any).branchName || (sb as any).branch_name || "",
      )
        .toLowerCase()
        .trim();
      return (
        pId === targetNorm ||
        pName === targetNorm ||
        (bId && (pId === bId || pName === bId)) ||
        (bSlug && (pId === bSlug || pName === bSlug))
      );
    });
  };
  return __fn();
}
