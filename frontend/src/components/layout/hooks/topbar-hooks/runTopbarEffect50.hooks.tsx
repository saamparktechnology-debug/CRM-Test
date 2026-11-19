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

export function runTopbarEffect50(getCtrl: () => any) {
  const { pathname, activeCompanyId, switchCompany, branches, activeBranchId, switchBranch } = getCtrl();
  const __fn: any = () => {
    if (!pathname || pathname === "/" || pathname.startsWith("/login")) return;

    const segments = pathname.split("/").filter(Boolean);
    const featureIdx = segments.indexOf("feature");

    if (featureIdx > 0) {
      const urlCompSlug = segments[0]?.toLowerCase().trim();
      let detectedCompId = "";
      if (urlCompSlug.includes("consult")) {
        detectedCompId = "consultancy";
      } else if (
        urlCompSlug.includes("tech") ||
        urlCompSlug.includes("research")
      ) {
        detectedCompId = "tech";
      } else if (urlCompSlug === "all") {
        detectedCompId = "all";
      }

      if (detectedCompId && detectedCompId !== activeCompanyId) {
        switchCompany(detectedCompId);
      }

      if (featureIdx >= 2) {
        const urlBranchSlug = segments[1]?.toLowerCase().trim();
        if (urlBranchSlug === "main" || urlBranchSlug === "hq") {
          if (activeBranchId !== null) {
            switchBranch(null);
          }
        } else {
          const matchedBranch = branches.find(
            (b) =>
              b.name.toLowerCase().replace(/\s+/g, "-") === urlBranchSlug ||
              b.name.toLowerCase() === urlBranchSlug ||
              String(b.code || "").toLowerCase() === urlBranchSlug ||
              String(b.id).toLowerCase() === urlBranchSlug,
          );
          if (matchedBranch && String(matchedBranch.id) !== String(activeBranchId)) {
            switchBranch(matchedBranch.id);
          }
        }
      } else if (featureIdx === 1) {
        // Direct company view without branch: /saampark-technology/feature/dashboard
        if (activeBranchId !== null) {
          switchBranch(null);
        }
      }
    }
  };
  return __fn();
}
