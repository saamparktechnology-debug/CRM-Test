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
import { UserItem as UserType, UserRole, UserStatus } from "../types";
import {
  generateCompanyEmployeeId,
  getStoredUserAccountsAsync,
} from "../services/userService";
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
export * from "@/features/users/components/usermodal-sections/UserModalHelpers";
import { runUserModalEffect50 } from "@/features/users/hooks/usermodal-hooks/runUserModalEffect50.hooks";
import { createUserModalFn51 } from "@/features/users/hooks/usermodal-hooks/createUserModalFn51.hooks";
import { createUserModalFn52 } from "@/features/users/hooks/usermodal-hooks/createUserModalFn52.hooks";

export function UserModal({
  isOpen,
  onClose,
  onSave,
  editingUser,
  initialRole,
}: UserModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const {
    userActionPermissions,
    userPermissions,
    setUserPermissions,
    setUserAllModuleActions,
    isModuleAllowed,
    getUserModuleActions,
  } = usePermissionStore();
  const {
    companies,
    branches,
    subBranches,
    user: currentUser,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    fetchCompanies,
    fetchBranches,
    fetchSubBranches,
  } = useAuthStore();

  const isRootSuperAdminEmail = React.useCallback((e?: string) => {
    if (!e) return false;
    const norm = e.toLowerCase().trim();
    return (
      norm === "saampark.official@gmail.com" || norm === "saampark.official"
    );
  }, []);

  const isCurrentSuperAdmin =
    currentUser?.role === "Super Admin" ||
    isRootSuperAdminEmail(currentUser?.email) ||
    String(currentUser?.role || "")
      .toLowerCase()
      .includes("super");

  // Company Selection State (allows Super Admin to pick target company)
  const [selectedCompanyId, setSelectedCompanyId] =
    React.useState<string>("tech");
  // Access Scope Type: "company" (Entire company), "branch" (Dedicated branch only), or "subbranch" (Dedicated sub-branch only)
  const [scopeType, setScopeType] = React.useState<
    "company" | "branch" | "subbranch"
  >("company");
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("");
  const [selectedSubBranchId, setSelectedSubBranchId] =
    React.useState<string>("");

  // Form Fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState<string | null>(null);

  const isEditingRootSuperAdmin = Boolean(
    (editingUser?.email && isRootSuperAdminEmail(editingUser.email)) ||
    (email && isRootSuperAdminEmail(email)),
  );
  const [role, setRole] = React.useState<UserRole>("Teams");
  const [employeeId, setEmployeeId] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [designation, setDesignation] = React.useState("");
  const [referByCategory, setReferByCategory] = React.useState("");
  const [commissionRate, setCommissionRate] = React.useState("");
  const [joiningDate, setJoiningDate] = React.useState(
    new Date().toISOString().split("T")[0],
  );
  const [ctc, setCtc] = React.useState("₹4,80,000 per Annum");
  const [autoSendOfferLetter, setAutoSendOfferLetter] = React.useState(true);
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [status, setStatus] = React.useState<UserStatus>("Active");
  const [avatarUrl, setAvatarUrl] = React.useState("");
  const [kycStatus, setKycStatus] = React.useState<
    "Pending" | "Processing" | "Verified" | "Rejected"
  >("Pending");

  // Tabs & Search State (Preserved between tab clicks!)
  const [activeTab, setActiveTab] = React.useState<"profile" | "permissions">(
    "profile",
  );
  const [moduleSearch, setModuleSearch] = React.useState("");
  const [collapsedCategories, setCollapsedCategories] = React.useState<
    Record<string, boolean>
  >({});

  // Action Matrix & Allowed Modules
  const [actionMatrix, setActionMatrix] = React.useState<
    Record<string, ModuleActionFlags>
  >({});
  const [allowedModules, setAllowedModules] = React.useState<ModuleName[]>([]);

  // Tracking refs to ensure form values are NEVER wiped when switching tabs
  const wasOpenRef = React.useRef(false);
  const editingUserIdRef = React.useRef<string | null>(null);

  // Resolve selected company object
  const targetCompanyObj = React.useMemo(() => {
    return (
      companies.find((c) => isMatchingCompany(c, selectedCompanyId)) ||
      companies[0] || {
        id: "tech",
        name: "SAAMPARK TECHNOLOGY",
        brand_name: "SAAMPARK",
        division_name: "TECHNOLOGY",
        logo: "💻",
      }
    );
  }, [companies, selectedCompanyId]);

  // If user selected a specific company (not "all"), lock company selector to that company
  const isCompanyLocked = Boolean(activeCompanyId && activeCompanyId !== "all");

  // Available companies for selection:
  // If locked to a company (e.g. SAAMPARK TECHNOLOGY), strictly show only that company.
  // If switched to "all" (All Companies / Global Scope), show all companies.
  const availableCompanies = React.useMemo(() => {
    if (isCompanyLocked) {
      const filtered = companies.filter((c) =>
        isMatchingCompany(c, activeCompanyId!),
      );
      if (filtered.length > 0) return filtered;
      return [
        {
          id: activeCompanyId!,
          name:
            activeCompanyId === "tech"
              ? "SAAMPARK TECHNOLOGY"
              : activeCompanyId!,
          brand_name: "SAAMPARK",
          division_name: "TECHNOLOGY",
          logo: "💻",
        },
      ];
    }
    return companies;
  }, [companies, isCompanyLocked, activeCompanyId]);

  // Role options strictly enforced:
  // Super Admin can create Super Admin, Admin, Teams, Clients.
  // Regular Admin can ONLY create Teams (Team Member) and Clients.
  const availableRoleOptions = React.useMemo(() => {
    if (isCurrentSuperAdmin) {
      return [
        {
          id: "Teams" as UserRole,
          label: "Team Member",
          desc: "Staff & Employee",
          icon: "👥",
          color: "blue",
          activeBorder: "border-blue-500/80 shadow-blue-500/25",
          glow: "from-blue-500/20 to-transparent",
        },
        {
          id: "Referer" as UserRole,
          label: "Referer",
          desc: "Referral Partner",
          icon: "🤝",
          color: "emerald",
          activeBorder: "border-emerald-500/80 shadow-emerald-500/25",
          glow: "from-emerald-500/20 to-transparent",
        },
        {
          id: "Clients" as UserRole,
          label: "Client Account",
          desc: "Portal Customer",
          icon: "💼",
          color: "amber",
          activeBorder: "border-amber-500/80 shadow-amber-500/25",
          glow: "from-amber-500/20 to-transparent",
        },
        {
          id: "Admin" as UserRole,
          label: "Branch / Co. Admin",
          desc: "Operational Manager",
          icon: "🛡️",
          color: "indigo",
          activeBorder: "border-indigo-500/80 shadow-indigo-500/25",
          glow: "from-indigo-500/20 to-transparent",
        },
        {
          id: "Super Admin" as UserRole,
          label: "Super Admin",
          desc: "Full Master Access",
          icon: "👑",
          color: "purple",
          activeBorder: "border-purple-500/80 shadow-purple-500/25",
          glow: "from-purple-500/20 to-transparent",
        },
      ];
    }
    // Admin can create Team members, Client accounts, or Branch/Co. Admins
    return [
      {
        id: "Teams" as UserRole,
        label: "Team Member",
        desc: "Staff & Employee",
        icon: "👥",
        color: "blue",
        activeBorder: "border-blue-500/80 shadow-blue-500/25",
        glow: "from-blue-500/20 to-transparent",
      },
      {
        id: "Clients" as UserRole,
        label: "Client Account",
        desc: "Portal Customer",
        icon: "💼",
        color: "amber",
        activeBorder: "border-amber-500/80 shadow-amber-500/25",
        glow: "from-amber-500/20 to-transparent",
      },
      {
        id: "Admin" as UserRole,
        label: "Branch / Co. Admin",
        desc: "Operational Manager",
        icon: "🛡️",
        color: "indigo",
        activeBorder: "border-indigo-500/80 shadow-indigo-500/25",
        glow: "from-indigo-500/20 to-transparent",
      },
    ];
  }, [isCurrentSuperAdmin]);

  // Available branches for the chosen company
  const availableBranches = React.useMemo(() => {
    if (!branches || branches.length === 0) return [];
    if (selectedCompanyId === "all") return branches;
    return branches.filter((b) =>
      isMatchingCompany(targetCompanyObj, b.companyId || (b as any).company_id),
    );
  }, [branches, targetCompanyObj, selectedCompanyId]);

  // Available sub-branches for the chosen branch or company
  const availableSubBranches = React.useMemo(() => {
    if (!subBranches || subBranches.length === 0) return [];
    if (selectedBranchId) {
      return subBranches.filter(
        (sb) => String(sb.parentBranchId) === String(selectedBranchId),
      );
    }
    if (selectedCompanyId && selectedCompanyId !== "all") {
      return subBranches.filter((sb) =>
        isMatchingCompany(targetCompanyObj, sb.companyId),
      );
    }
    return subBranches;
  }, [subBranches, selectedBranchId, selectedCompanyId, targetCompanyObj]);

  // Helper to compute standard action matrix for a role
  const getMatrixForRole = React.useCallback(
    (targetRole: UserRole) => {
      const norm = normalizeRole(targetRole);
      const storeState = usePermissionStore.getState();
      const configuredRoleMatrix =
        (storeState.roleActionPermissions &&
          storeState.roleActionPermissions[norm]) ||
        DEFAULT_ROLE_ACTION_PERMISSIONS[norm] ||
        {};
      const configuredRoleMods =
        (storeState.rolePermissions && storeState.rolePermissions[norm]) ||
        DEFAULT_ROLE_PERMISSIONS[norm] ||
        [];

      const matrix: Record<string, ModuleActionFlags> = {};
      CONFIGURABLE_MODULES.forEach((m) => {
        const adminFlags = isCurrentSuperAdmin
          ? DEFAULT_FULL_ACTIONS
          : getUserModuleActions(currentUser, m);

        if (configuredRoleMatrix[m]) {
          const flag = configuredRoleMatrix[m];
          matrix[m] = {
            view: Boolean(adminFlags.view && flag.view),
            add: Boolean(adminFlags.add && flag.add),
            edit: Boolean(adminFlags.edit && flag.edit),
            delete: Boolean(adminFlags.delete && flag.delete),
          };
        } else {
          const isModInRole = configuredRoleMods.includes(m as ModuleName);
          matrix[m] = isModInRole
            ? {
                view: Boolean(adminFlags.view),
                add: Boolean(adminFlags.add && norm !== "Clients"),
                edit: Boolean(adminFlags.edit && norm !== "Clients"),
                delete: Boolean(adminFlags.delete && norm === "Admin"),
              }
            : { view: false, add: false, edit: false, delete: false };
        }
      });
      return matrix;
    },
    [isCurrentSuperAdmin, currentUser, getUserModuleActions],
  );

  // Initialize or reset form ONLY when the modal opens or when editing user target changes
  React.useEffect(
    () => runUserModalEffect50(() => __ctrlRef.current),
    [
      isOpen,
      editingUser,
      initialRole,
      isCompanyLocked,
      availableCompanies,
      activeCompanyId,
      activeBranchId,
      getMatrixForRole,
      fetchCompanies,
      fetchBranches,
      userActionPermissions,
    ],
  );

  // Handle Role change & apply default permission presets
  const handleRoleSelect = (newRole: UserRole) => {
    if (isEditingRootSuperAdmin) return;
    if (
      !isCurrentSuperAdmin &&
      (newRole === "Super Admin" || newRole === "Admin")
    )
      return;
    setRole(newRole);
    const nextMatrix = getMatrixForRole(newRole);
    setActionMatrix(nextMatrix);
    setAllowedModules(
      CONFIGURABLE_MODULES.filter((m) => {
        const flags = nextMatrix[m];
        return flags
          ? flags.view || flags.add || flags.edit || flags.delete
          : false;
      }),
    );
  };

  // Permission Suite Quick Presets
  const applyPreset: any = createUserModalFn51(() => __ctrlRef.current);

  // Checkbox toggle for permissions
  const handleCheckboxChange: any = createUserModalFn52(
    () => __ctrlRef.current,
  );

  // Generate strong password (guaranteed 10 chars: at least 1 uppercase, 1 lowercase, 1 number, 1 special character)
  const generatePassword = () => {
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghijkmnopqrstuvwxyz";
    const numbers = "23456789";
    const specials = "!@#$%&*?";
    const all = uppers + lowers + numbers + specials;
    let res = "";
    res += uppers[Math.floor(Math.random() * uppers.length)];
    res += lowers[Math.floor(Math.random() * lowers.length)];
    res += numbers[Math.floor(Math.random() * numbers.length)];
    res += specials[Math.floor(Math.random() * specials.length)];
    for (let i = 0; i < 6; i++) {
      res += all[Math.floor(Math.random() * all.length)];
    }
    const shuffled = res
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
    setPassword(shuffled);
  };

  // Save handler
  const handleSubmit: any = createUserModalHandler1(() => __ctrlRef.current);

  if (!isOpen) return null;

  const companyDisplayName = getCompanyFullName(targetCompanyObj);
  const isTechCompany =
    targetCompanyObj.slug === "tech" || targetCompanyObj.id === "tech";

  // Role glow colors for 3D styling
  const roleGlowMap = {
    "Super Admin": "from-purple-600/30 via-pink-600/20 to-transparent",
    Admin: "from-indigo-600/30 via-blue-600/20 to-transparent",
    Clients: "from-amber-500/30 via-orange-600/20 to-transparent",
    Teams: "from-blue-600/30 via-cyan-600/20 to-transparent",
  };

  __ctrl = {
    isOpen,
    onClose,
    onSave,
    editingUser,
    initialRole,
    userActionPermissions,
    userPermissions,
    setUserPermissions,
    setUserAllModuleActions,
    isModuleAllowed,
    getUserModuleActions,
    companies,
    branches,
    subBranches,
    currentUser,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    fetchCompanies,
    fetchBranches,
    fetchSubBranches,
    isRootSuperAdminEmail,
    isCurrentSuperAdmin,
    selectedCompanyId,
    setSelectedCompanyId,
    scopeType,
    setScopeType,
    selectedBranchId,
    setSelectedBranchId,
    selectedSubBranchId,
    setSelectedSubBranchId,
    name,
    setName,
    email,
    setEmail,
    emailError,
    setEmailError,
    isEditingRootSuperAdmin,
    role,
    setRole,
    employeeId,
    setEmployeeId,
    department,
    setDepartment,
    designation,
    referByCategory,
    setReferByCategory,
    setDesignation,
    commissionRate,
    setCommissionRate,
    joiningDate,
    setJoiningDate,
    ctc,
    setCtc,
    autoSendOfferLetter,
    setAutoSendOfferLetter,
    phone,
    setPhone,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    status,
    setStatus,
    avatarUrl,
    setAvatarUrl,
    kycStatus,
    setKycStatus,
    activeTab,
    setActiveTab,
    moduleSearch,
    setModuleSearch,
    collapsedCategories,
    setCollapsedCategories,
    actionMatrix,
    setActionMatrix,
    allowedModules,
    setAllowedModules,
    wasOpenRef,
    editingUserIdRef,
    targetCompanyObj,
    isCompanyLocked,
    availableCompanies,
    availableRoleOptions,
    availableBranches,
    availableSubBranches,
    getMatrixForRole,
    handleRoleSelect,
    applyPreset,
    handleCheckboxChange,
    generatePassword,
    handleSubmit,
    companyDisplayName,
    isTechCompany,
    roleGlowMap,
  };
  __ctrlRef.current = __ctrl;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/50 dark:bg-black/80 backdrop-blur-xl overflow-y-auto"
        style={{ perspective: "1400px" }}
      >
        {/* Subtle Ambient Background Light */}
        <div
          className={`fixed -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b ${roleGlowMap[role] || roleGlowMap.Teams} blur-[120px] pointer-events-none opacity-30 dark:opacity-70`}
        />

        {/* 3D Elevated Main Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, rotateX: 6, y: 30 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, rotateX: -6, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl my-auto rounded-[32px] overflow-hidden flex flex-col max-h-[92vh] border border-slate-200/90 dark:border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.25)] bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Top Gloss Highlight Bevel */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/25 dark:via-white/40 to-transparent z-30" />

          {/* 3D Header */}
          <div className="relative flex flex-wrap items-center justify-between gap-4 px-6 sm:px-8 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.04] backdrop-blur-xl sticky top-0 z-20 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            {/* Title & Badge */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-2xl transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] dark:shadow-[0_8px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] border ${
                  role === "Super Admin"
                    ? "bg-purple-50 dark:bg-gradient-to-br dark:from-purple-500/30 dark:to-pink-600/30 border-purple-200 dark:border-purple-400/40 text-purple-700 dark:text-purple-300"
                    : role === "Admin"
                      ? "bg-indigo-50 dark:bg-gradient-to-br dark:from-indigo-500/30 dark:to-blue-600/30 border-indigo-200 dark:border-indigo-400/40 text-indigo-700 dark:text-indigo-300"
                      : role === "Clients"
                        ? "bg-amber-50 dark:bg-gradient-to-br dark:from-amber-500/30 dark:to-orange-600/30 border-amber-200 dark:border-amber-400/40 text-amber-700 dark:text-amber-300"
                        : "bg-blue-50 dark:bg-gradient-to-br dark:from-blue-500/30 dark:to-cyan-600/30 border-blue-200 dark:border-blue-400/40 text-blue-700 dark:text-blue-300"
                }`}
              >
                {role === "Super Admin"
                  ? "👑"
                  : role === "Admin"
                    ? "🛡️"
                    : role === "Clients"
                      ? "💼"
                      : "👥"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2 drop-shadow-xs">
                    {editingUser ? "Edit User Account" : "Create New User"}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider border shadow-xs ${
                      role === "Super Admin"
                        ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/40"
                        : role === "Admin"
                          ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/40"
                          : role === "Clients"
                            ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/40"
                            : "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/40"
                    }`}
                  >
                    {role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
                    <span>{isTechCompany ? "💻" : "🏢"}</span>
                    <span>{companyDisplayName}</span>
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {scopeType === "branch" && selectedBranchId
                      ? "📍 Dedicated Branch Scope"
                      : "🏢 Company-Wide Scope"}
                  </span>
                </div>
              </div>
            </div>

            {/* 3D Segmented Control Tab Switcher & Close */}
            <div className="flex items-center gap-3">
              {/* Tactile Sunken 3D Switcher */}
              <div className="flex p-1.5 bg-slate-100 dark:bg-[#090d16]/80 rounded-2xl border border-slate-200 dark:border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_6px_rgba(0,0,0,0.7)]">
                <button
                  type="button"
                  onClick={() => setActiveTab("profile")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "profile"
                      ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] -translate-y-0.5"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <User size={13} />
                  <span>Profile & Assignment</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("permissions")}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "permissions"
                      ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] -translate-y-0.5"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <Lock size={13} />
                  <span>Configure Modules ({allowedModules.length})</span>
                </button>
              </div>

              {/* Close Button with 3D Bevel */}
              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white shadow-2xs active:translate-y-0.5 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Form Content: Scrollable Body */}
          <form
            noValidate
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6"
          >
            {/* ========================================================================= */}
            {/* TAB 1: PROFILE & ASSIGNMENT (Kept mounted via CSS to preserve typed data) */}
            {/* ========================================================================= */}
            <div
              className={
                activeTab === "profile" ? "space-y-6 block" : "space-y-6 hidden"
              }
            >
              <UserModalSection1 ctrl={__ctrl} />
              <UserModalSection2 ctrl={__ctrl} />
            </div>

            <UserModalSection3 ctrl={__ctrl} />

            {/* 3D FLOATING ACTION FOOTER */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-white/10 sticky bottom-0 bg-white/95 dark:bg-[#0f1422]/95 backdrop-blur-xl z-20 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_20px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-3">
                {activeTab === "profile" ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab("permissions")}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/20 text-xs font-black text-slate-800 dark:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:translate-y-0.5"
                  >
                    <span>Next: Configure Modules</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("profile")}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] border border-slate-300 dark:border-white/20 text-xs font-black text-slate-800 dark:text-white transition-all cursor-pointer shadow-xs active:translate-y-0.5"
                  >
                    Back to Profile
                  </button>
                )}

                <Button
                  type="submit"
                  onClick={handleSubmit}
                  className="px-8 py-2.5 rounded-xl bg-gradient-to-b from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs shadow-[0_8px_25px_rgba(59,130,246,0.4)] hover:shadow-[0_12px_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer border border-blue-400/40"
                >
                  {editingUser ? "Save User Account" : "Create Account Now"}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
