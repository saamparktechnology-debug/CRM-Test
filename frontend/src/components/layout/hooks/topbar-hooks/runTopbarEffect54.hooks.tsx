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

export function runTopbarEffect54(getCtrl: () => any) {
  const { companyMenuRef, setShowCompanyMenu, branchMenuRef, setShowBranchMenu, subBranchMenuRef, setShowSubBranchMenu, profileMenuRef, setShowProfileMenu, notifRef, setShowNotifications } = getCtrl();
  const __fn: any = () => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (!target) return;

      if (companyMenuRef.current && !companyMenuRef.current.contains(target)) {
        setShowCompanyMenu(false);
      }
      if (branchMenuRef.current && !branchMenuRef.current.contains(target)) {
        setShowBranchMenu(false);
      }
      if (
        subBranchMenuRef.current &&
        !subBranchMenuRef.current.contains(target)
      ) {
        setShowSubBranchMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setShowNotifications(false);
      }
    };

    const handleWindowScroll = () => {
      setShowCompanyMenu(false);
      setShowBranchMenu(false);
      setShowSubBranchMenu(false);
      setShowProfileMenu(false);
      setShowNotifications(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  };
  return __fn();
}
