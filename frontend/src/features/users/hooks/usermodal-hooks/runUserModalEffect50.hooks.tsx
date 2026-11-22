"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Mail,
  Shield,
  Building,
  Phone,
  Lock,
  UserCheck,
  ShieldCheck,
  Check,
  Info,
  Crown,
  MapPin,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Search,
  Briefcase,
  Percent,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Layers,
  Globe,
  Radio,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  UserItem as UserType,
  UserRole,
  UserStatus,
} from "@/features/users/types";
import {
  generateCompanyEmployeeId,
  getStoredUserAccountsAsync,
} from "@/features/users/services/userService";
import {
  useAuthStore,
  isMatchingCompany,
  getCompanyFullName,
} from "@/store/useAuthStore";
import {
  usePermissionStore,
  CONFIGURABLE_MODULES,
  ModuleName,
  ModuleActionFlags,
  DEFAULT_FULL_ACTIONS,
  DEFAULT_VIEW_ONLY_ACTIONS,
  MODULE_ACTION_CONFIG,
  normalizeRole,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_ACTION_PERMISSIONS,
} from "@/store/usePermissionStore";
import { createNotification } from "@/services/notificationService";
import { UserModalSection1 } from "@/features/users/components/usermodal-sections/UserModalSection1";
import { UserModalSection2 } from "@/features/users/components/usermodal-sections/UserModalSection2";
import { UserModalSection3 } from "@/features/users/components/usermodal-sections/UserModalSection3";
import { createUserModalHandler1 } from "@/features/users/hooks/usermodal-hooks/createUserModalHandler1.hooks";
import {
  type UserModalProps,
  MODULE_CATEGORIES,
  DEPARTMENT_SUGGESTIONS,
} from "@/features/users/components/usermodal-sections/UserModalHelpers";

export function runUserModalEffect50(getCtrl: () => any) {
  const {
    isOpen,
    wasOpenRef,
    editingUserIdRef,
    editingUser,
    setActiveTab,
    setEmailError,
    fetchCompanies,
    fetchBranches,
    fetchSubBranches,
    setName,
    setEmail,
    isRootSuperAdminEmail,
    isCurrentSuperAdmin,
    setRole,
    isCompanyLocked,
    availableCompanies,
    activeCompanyId,
    setSelectedCompanyId,
    setScopeType,
    setSelectedSubBranchId,
    subBranches,
    setSelectedBranchId,
    setDepartment,
    setDesignation,
    setEmployeeId,
    setCommissionRate,
    setPhone,
    setPassword,
    setStatus,
    setAvatarUrl,
    setKycStatus,
    userActionPermissions,
    getMatrixForRole,
    setActionMatrix,
    setAllowedModules,
    activeSubBranchId,
    activeBranchId,
    initialRole,
  } = getCtrl();
  const __fn: any = () => {
    if (!isOpen) {
      if (wasOpenRef) wasOpenRef.current = false;
      if (editingUserIdRef) editingUserIdRef.current = null;
      return;
    }

    const currentEditId = editingUser
      ? String(editingUser.id || editingUser.email)
      : "__new__";
    const isInitialOpen = !wasOpenRef.current;
    const hasEditingUserChanged = currentEditId !== editingUserIdRef.current;

    // If modal is already open and target hasn't changed, DO NOT wipe form!
    if (!isInitialOpen && !hasEditingUserChanged) {
      return;
    }

    wasOpenRef.current = true;
    editingUserIdRef.current = currentEditId;
    setActiveTab("profile");
    setEmailError(null);

    fetchCompanies();
    fetchBranches();
    fetchSubBranches();

    if (editingUser) {
      setName(editingUser.name || "");
      setEmail(editingUser.email || "");
      let initRole: UserRole = editingUser.role || "Teams";
      if (isRootSuperAdminEmail(editingUser.email)) {
        initRole = "Super Admin";
      } else if (
        !isCurrentSuperAdmin &&
        (initRole === "Super Admin" || initRole === "Admin")
      ) {
        initRole = "Teams";
      }
      setRole(initRole);

      const initComp = isCompanyLocked
        ? availableCompanies[0]?.id || activeCompanyId!
        : editingUser.companyId || "tech";
      setSelectedCompanyId(initComp);

      const rawSubBranch =
        editingUser.subBranchId ||
        (editingUser as any).sub_branch_id ||
        (editingUser.subBranchIds && editingUser.subBranchIds[0]);
      const userBranch =
        editingUser.branchId ||
        (editingUser as any).branch_id ||
        (editingUser.branchIds && editingUser.branchIds[0]);

      if (rawSubBranch) {
        setScopeType("subbranch");
        setSelectedSubBranchId(String(rawSubBranch));
        const matchedSb = subBranches.find(
          (sb) => String(sb.id) === String(rawSubBranch),
        );
        setSelectedBranchId(
          String(userBranch || matchedSb?.parentBranchId || ""),
        );
      } else if (userBranch) {
        setScopeType("branch");
        setSelectedBranchId(String(userBranch));
        setSelectedSubBranchId("");
      } else {
        setScopeType("company");
        setSelectedBranchId("");
        setSelectedSubBranchId("");
      }

      setDepartment(editingUser.department || "");
      setDesignation((editingUser as any).designation || "");
      setEmployeeId(editingUser.employeeId || "");
      setCommissionRate(
        (editingUser as any).commissionRate ||
          (editingUser as any).invoiceRate ||
          "",
      );
      setPhone(editingUser.phone || "");
      setPassword(editingUser.password || "");
      setStatus(editingUser.status || "Active");
      setAvatarUrl(editingUser.avatarUrl || (editingUser as any)?.avatar || "");
      setKycStatus(editingUser.kycStatus || "Pending");

      const userIdStr = String(editingUser.id);
      const emailNorm = (editingUser.email || "").toLowerCase().trim();
      const existingMatrix =
        userActionPermissions[userIdStr] ||
        (emailNorm ? userActionPermissions[emailNorm] : undefined) ||
        editingUser.permissions?.actionMatrix;

      const fallbackMatrix = getMatrixForRole(editingUser.role || "Teams");
      const finalMatrix: Record<string, ModuleActionFlags> = {};

      CONFIGURABLE_MODULES.forEach((m) => {
        if (existingMatrix && existingMatrix[m]) {
          finalMatrix[m] = existingMatrix[m];
        } else {
          finalMatrix[m] = fallbackMatrix[m] || {
            view: false,
            add: false,
            edit: false,
            delete: false,
          };
        }
      });

      setActionMatrix(finalMatrix);
      setAllowedModules(
        CONFIGURABLE_MODULES.filter((m) => {
          const flags = finalMatrix[m];
          return flags
            ? flags.view || flags.add || flags.edit || flags.delete
            : false;
        }),
      );
    } else {
      setName("");
      setEmail("");
      const defaultComp = isCompanyLocked
        ? availableCompanies[0]?.id || activeCompanyId!
        : "tech";
      setSelectedCompanyId(defaultComp);

      // Auto-generate employee serial ID (STR-EMP-2601 or SCS-EMP-2601)
      getStoredUserAccountsAsync()
        .then((accs) => {
          setEmployeeId(generateCompanyEmployeeId(defaultComp, accs));
        })
        .catch(() => {
          setEmployeeId(generateCompanyEmployeeId(defaultComp, []));
        });
      setEmailError(null);
      if (activeSubBranchId && activeSubBranchId !== "all") {
        setScopeType("subbranch");
        setSelectedSubBranchId(activeSubBranchId);
        setSelectedBranchId(activeBranchId || "");
      } else if (activeBranchId && activeBranchId !== "all") {
        setScopeType("branch");
        setSelectedBranchId(activeBranchId);
        setSelectedSubBranchId("");
      } else {
        setScopeType("company");
        setSelectedBranchId("");
        setSelectedSubBranchId("");
      }

      setDepartment("");
      setDesignation("");
      setCommissionRate("");
      setPhone("");
      setPassword("Pass@" + Math.floor(100000 + Math.random() * 900000));
      setStatus("Active");
      setAvatarUrl("");
      setKycStatus("Pending");

      const defaultRole: UserRole = initialRole || "Teams";
      setRole(defaultRole);
      const matrix = getMatrixForRole(defaultRole);
      setActionMatrix(matrix);
      setAllowedModules(
        CONFIGURABLE_MODULES.filter((m) => {
          const flags = matrix[m];
          return flags
            ? flags.view || flags.add || flags.edit || flags.delete
            : false;
        }),
      );
    }
  };
  return __fn();
}
