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

export function runTopbarEffect53(getCtrl: () => any) {
  const { user, companies } = getCtrl();
  const __fn: any = () => {
    if (!user || !user.email) return;

    const syncUserSession = async () => {
      try {
        const { getStoredUserAccountsAsync } =
          await import("@/features/users/services/userService");
        const { usePermissionStore } =
          await import("@/store/usePermissionStore");

        const accounts = await getStoredUserAccountsAsync();
        const myEmailNorm = user.email.toLowerCase().trim();
        const dbRecord = accounts.find(
          (a) => a.email.toLowerCase().trim() === myEmailNorm,
        );

        if (dbRecord) {
          const isSuperUser = user.role === "Super Admin";

          let rawCompIds =
            dbRecord.companyIds ||
            (dbRecord as any).company_ids ||
            user.companyIds;
          let freshCompanyIds: string[] = [];
          if (typeof rawCompIds === "string") {
            try {
              freshCompanyIds = JSON.parse(rawCompIds);
            } catch {
              freshCompanyIds = [rawCompIds];
            }
          } else if (Array.isArray(rawCompIds)) {
            freshCompanyIds = rawCompIds;
          }
          if (freshCompanyIds.length === 0) {
            freshCompanyIds = [
              dbRecord.companyId || (dbRecord as any).company_id || "tech",
            ];
          }

          // Super Admin and Admin can switch between all companies
          const isSuperOrAdmin = isSuperUser || user.role === "Admin";
          const currentActive = useAuthStore.getState().activeCompanyId;
          const isAllowedActive =
            isSuperOrAdmin ||
            freshCompanyIds.some((id) =>
              isMatchingCompany({ id, slug: id } as any, currentActive || ""),
            );
          const nextActive = isSuperOrAdmin
            ? currentActive ||
              (isSuperUser ? "all" : freshCompanyIds[0] || "tech")
            : isAllowedActive && currentActive
              ? currentActive
              : freshCompanyIds[0];

          const finalCompanyIds = isSuperOrAdmin
            ? Array.from(
                new Set(
                  [
                    ...freshCompanyIds,
                    currentActive || "all",
                    ...companies.map((c) => c.id),
                    ...companies.map((c) => c.slug || ""),
                  ].filter(Boolean),
                ),
              )
            : freshCompanyIds;

          let rawBranchIds =
            dbRecord.branchIds ||
            (dbRecord as any).branch_ids ||
            user.branchIds;
          let freshBranchIds: string[] = [];
          if (typeof rawBranchIds === "string") {
            try {
              freshBranchIds = JSON.parse(rawBranchIds);
            } catch {
              freshBranchIds = [rawBranchIds];
            }
          } else if (Array.isArray(rawBranchIds)) {
            freshBranchIds = rawBranchIds;
          }
          if (freshBranchIds.length === 0 && dbRecord.branchId) {
            freshBranchIds = [dbRecord.branchId];
          }

          let freshPerms = dbRecord.permissions;
          if (typeof freshPerms === "string") {
            try {
              freshPerms = JSON.parse(freshPerms);
            } catch {}
          }

          const freshAllowedMods = isSuperUser
            ? undefined
            : dbRecord.allowedModules ||
              (freshPerms && Array.isArray(freshPerms.allowedModules)
                ? freshPerms.allowedModules
                : undefined);

          // Update usePermissionStore in real-time
          if (freshAllowedMods) {
            usePermissionStore
              .getState()
              .setUserPermissions(String(dbRecord.id), freshAllowedMods);
            usePermissionStore
              .getState()
              .setUserPermissions(myEmailNorm, freshAllowedMods);
          }
          if (freshPerms?.actionMatrix) {
            usePermissionStore
              .getState()
              .setUserAllModuleActions(
                String(dbRecord.id),
                freshPerms.actionMatrix,
              );
            usePermissionStore
              .getState()
              .setUserAllModuleActions(myEmailNorm, freshPerms.actionMatrix);
          }

          const freshAvatar =
            dbRecord.avatarUrl ||
            (dbRecord as any).avatar ||
            (user as any).avatarUrl ||
            user.avatar;
          const latestUser = useAuthStore.getState().user || user;
          const resolvedKycStatus =
            dbRecord.kycStatus ||
            (dbRecord as any).kyc_status ||
            latestUser?.kycStatus ||
            "Pending";
          const resolvedKycData =
            dbRecord.kycData ||
            (dbRecord as any).kyc_data ||
            latestUser?.kycData;

          useAuthStore.setState({
            user: {
              ...latestUser,
              name: dbRecord.name || user.name,
              role: user.role,
              avatar: freshAvatar,
              avatarUrl: freshAvatar,
              companyId: nextActive || "tech",
              companyIds: finalCompanyIds,
              branchId: dbRecord.branchId,
              branchIds: freshBranchIds.length > 0 ? freshBranchIds : undefined,
              branchName: dbRecord.branchName,
              department: dbRecord.department,
              phone: dbRecord.phone,
              allowedModules: freshAllowedMods,
              permissions: freshPerms,
              kycStatus: resolvedKycStatus,
              kycData: resolvedKycData,
            },
            activeCompanyId: nextActive || (isSuperUser ? "all" : "tech"),
          });
        }
      } catch (err) {
        console.warn("Session sync warning:", err);
      }
    };

    syncUserSession();
    window.addEventListener("crm_avatar_changed", syncUserSession);
    return () => {
      window.removeEventListener("crm_avatar_changed", syncUserSession);
    };
  };
  return __fn();
}
