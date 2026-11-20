"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GitBranch,
  Users,
  Briefcase,
  IndianRupee,
  ChevronDown,
  Eye,
  ArrowUpRight,
  Loader2,
  CheckCircle2,
  Plus,
  Clock,
  FileText,
  CreditCard,
  FolderKanban,
  Check,
  TrendingUp,
  ArrowUp,
  MapPin,
  Monitor,
  CheckSquare,
  Calendar,
  PieChart,
  AlertCircle,
  Bell,
  Grid,
  DollarSign,
  Sparkles,
  Layers,
} from "lucide-react";
import Link from "next/link";
import {
  useAuthStore,
  getCompanyFullName,
  isMatchingCompany,
  isMatchingBranch,
  getCanonicalCompanyId,
} from "@/store/useAuthStore";
import { getActivityLogs, ActivityLog } from "@/services/activityLogService";
import {
  fetchModuleDataFromDB,
  filterGlobalDeletedItems,
} from "@/lib/storageSync";
import { Widget } from "./Widget";
import { KPICard } from "./KPICard";
import { DonutChart } from "./DonutChart";
import { getUserAvatar } from "../../users/services/userService";
import { taskService } from "../../tasks/services/taskService";
import { getProjects } from "../../projects/services/projectService";
import {
  getInvoices,
  InvoiceItem,
} from "@/features/invoice/services/invoiceService";
import { getOrders, OrderItem } from "@/features/orders/services/orderService";
import { Task } from "../../tasks/types";
import { Project } from "../../projects/types";
import { SuperAdminDashboardSection1 } from "@/features/dashboard/components/superadmindashboard-sections/SuperAdminDashboardSection1";

import {
  type CompanyRow,
  type BranchRow,
  parseAmt,
  formatINR,
  formatTime,
} from "@/features/dashboard/components/superadmindashboard-sections/SuperAdminDashboardHelpers";
export * from "@/features/dashboard/components/superadmindashboard-sections/SuperAdminDashboardHelpers";
import { createSuperAdminDashboardAction20 } from "@/features/dashboard/hooks/superadmindashboard-hooks/createSuperAdminDashboardAction20.hooks";
import { computeSuperAdminDashboardMemo50 } from "@/features/dashboard/hooks/superadmindashboard-hooks/computeSuperAdminDashboardMemo50.hooks";

export function SuperAdminDashboard() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const {
    user,
    companies,
    branches,
    subBranches,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    switchCompany,
    switchBranch,
  } = useAuthStore();

  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"companies" | "branches">(
    "companies",
  );
  const [revenueYear, setRevenueYear] = React.useState("This Year");
  const [activities, setActivities] = React.useState<ActivityLog[]>([]);

  // Custom Dropdown Open States
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] =
    React.useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = React.useState(false);

  // Dynamic modules data
  const [dbUsers, setDbUsers] = React.useState<any[]>([]);
  const [dbProjects, setDbProjects] = React.useState<Project[]>([]);
  const [dbInvoices, setDbInvoices] = React.useState<InvoiceItem[]>([]);
  const [dbOrders, setDbOrders] = React.useState<OrderItem[]>([]);
  const [dbTasks, setDbTasks] = React.useState<Task[]>([]);
  const [dbExpenses, setDbExpenses] = React.useState<any[]>([]);
  const [dbTimecards, setDbTimecards] = React.useState<any[]>([]);

  // User attendance / sticky note state
  const [selectedUserEmail, setSelectedUserEmail] = React.useState<string>("");
  const [noteText, setNoteText] = React.useState("");
  const [todos, setTodos] = React.useState<
    { id: number; text: string; done: boolean }[]
  >([]);

  const isSuperAdmin = user?.role === "Super Admin";
  const isAllCompanies =
    isSuperAdmin &&
    (!activeCompanyId || activeCompanyId === "all") &&
    (!activeBranchId || activeBranchId === "all");

  // Allowed companies for current user session (if assigned to 1, user cannot switch)
  const allowedCompanies = React.useMemo(() => {
    if (!user) return companies;
    if (isSuperAdmin) return companies;
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
  }, [user, isSuperAdmin, companies]);

  // Allowed branches for current user session (if assigned to 1, user cannot switch)
  const allowedBranches = React.useMemo(() => {
    if (isSuperAdmin) {
      if (!activeCompanyId || activeCompanyId === "all") return branches;
      return branches.filter((b) =>
        isMatchingCompany(
          { id: b.companyId, slug: b.companyId } as any,
          activeCompanyId,
        ),
      );
    }
    let rawBranchIds = user?.branchIds || (user as any)?.branch_ids;
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
    if (userBranchIds.length === 0 && user?.branchId) {
      userBranchIds = [user.branchId];
    }
    if (userBranchIds.length === 0) return branches;
    return branches.filter((b) =>
      userBranchIds.some(
        (id) =>
          String(id).toLowerCase().trim() === String(b.id).toLowerCase().trim(),
      ),
    );
  }, [user, isSuperAdmin, branches, activeCompanyId]);

  // Eligibility to switch
  const canSwitchCompany = isSuperAdmin || allowedCompanies.length > 1;
  const canSwitchBranch = isSuperAdmin || allowedBranches.length > 1;

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleOutside = () => {
      setIsCompanyDropdownOpen(false);
      setIsBranchDropdownOpen(false);
    };
    window.addEventListener("click", handleOutside);
    return () => window.removeEventListener("click", handleOutside);
  }, []);

  const loadDashboardData = React.useCallback(
    () => createSuperAdminDashboardAction20(() => __ctrlRef.current)(),
    [],
  );

  React.useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData, activeCompanyId, activeBranchId, activeSubBranchId]);

  React.useEffect(() => {
    const handleSync = () => loadDashboardData();
    window.addEventListener("saampark_data_synced", handleSync);
    window.addEventListener("storage", handleSync);
    window.addEventListener("saampark_activity_logged", handleSync);
    window.addEventListener("saampark_company_switched", handleSync);
    window.addEventListener("saampark_branch_switched", handleSync);
    window.addEventListener("saampark_sub_branch_switched", handleSync);
    window.addEventListener("saampark_subbranch_switched", handleSync);
    return () => {
      window.removeEventListener("saampark_data_synced", handleSync);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("saampark_activity_logged", handleSync);
      window.removeEventListener("saampark_company_switched", handleSync);
      window.removeEventListener("saampark_branch_switched", handleSync);
      window.removeEventListener("saampark_sub_branch_switched", handleSync);
      window.removeEventListener("saampark_subbranch_switched", handleSync);
    };
  }, [loadDashboardData]);

  // Sticky notes & todos local storage
  React.useEffect(() => {
    if (typeof window !== "undefined" && user?.email) {
      const userKey = user.email.toLowerCase().trim();
      const savedNote = localStorage.getItem(`saampark_sticky_note_${userKey}`);
      if (savedNote !== null) setNoteText(savedNote);
      else setNoteText("Quick executive reminders and scratchpad notes...");

      const savedTodos = localStorage.getItem(`saampark_todos_${userKey}`);
      if (savedTodos) {
        try {
          setTodos(JSON.parse(savedTodos));
        } catch {}
      } else {
        setTodos([
          { id: 1, text: "Review company branch reports", done: false },
          { id: 2, text: "Verify GST tax invoice submissions", done: true },
          { id: 3, text: "Approve quarterly team payroll", done: false },
        ]);
      }
    }
  }, [user]);

  const updateNoteText = (val: string) => {
    setNoteText(val);
    if (typeof window !== "undefined" && user?.email) {
      localStorage.setItem(
        `saampark_sticky_note_${user.email.toLowerCase().trim()}`,
        val,
      );
    }
  };

  // -------------------------------------------------------------------------
  // TARGET SCOPED ENTITIES (RESPECTS COMPANY ADMIN SCOPE & TOPBAR SELECTION)
  // -------------------------------------------------------------------------
  const targetCompanies = React.useMemo(() => {
    if (!isSuperAdmin) {
      return allowedCompanies;
    }
    if (activeCompanyId && activeCompanyId !== "all") {
      return companies.filter((c) => isMatchingCompany(c, activeCompanyId));
    }
    return companies;
  }, [isSuperAdmin, allowedCompanies, companies, activeCompanyId]);

  const targetBranches = React.useMemo(() => {
    if (!isSuperAdmin) {
      return allowedBranches;
    }
    if (activeCompanyId && activeCompanyId !== "all") {
      return branches.filter((b) =>
        isMatchingCompany(
          { id: b.companyId, slug: b.companyId } as any,
          activeCompanyId,
        ),
      );
    }
    return branches;
  }, [isSuperAdmin, allowedBranches, branches, activeCompanyId]);

  // -------------------------------------------------------------------------
  // DYNAMIC COMPANIES BREAKDOWN
  // -------------------------------------------------------------------------
  const realCompaniesData: CompanyRow[] = React.useMemo(() => {
    const palette = [
      "#2563eb",
      "#10b981",
      "#8b5cf6",
      "#f59e0b",
      "#ec4899",
      "#06b6d4",
    ];

    const validCompanies = Array.isArray(targetCompanies)
      ? targetCompanies
      : [];
    const validBranches = Array.isArray(targetBranches) ? targetBranches : [];
    const validUsers = Array.isArray(dbUsers) ? dbUsers : [];
    const validProjects = Array.isArray(dbProjects) ? dbProjects : [];
    const validInvoices = Array.isArray(dbInvoices) ? dbInvoices : [];

    const rows = validCompanies
      .map((c, idx) => {
        if (!c) return null;
        const cId = c.id;
        const compBranches = validBranches.filter(
          (b) =>
            b &&
            isMatchingCompany(
              { id: b.companyId, slug: b.companyId } as any,
              cId,
            ),
        );
        const compUsers = validUsers.filter((u) => {
          if (!u) return false;
          if (Array.isArray(u.companyIds) && u.companyIds.length > 0) {
            return u.companyIds.some((cid: any) =>
              isMatchingCompany({ id: cid, slug: cid } as any, cId),
            );
          }
          if (typeof u.companyIds === "string") {
            try {
              const parsed = JSON.parse(u.companyIds);
              if (Array.isArray(parsed)) {
                return parsed.some((cid: any) =>
                  isMatchingCompany({ id: cid, slug: cid } as any, cId),
                );
              }
            } catch {}
          }
          const uComp = u.companyId || u.company_id || u.company;
          return isMatchingCompany({ id: uComp, slug: uComp } as any, cId);
        });
        const compProjects = validProjects.filter(
          (p) =>
            p &&
            isMatchingCompany(
              { id: p.companyId, slug: p.companyId } as any,
              cId,
            ),
        );
        const compInvoices = validInvoices.filter((inv) => {
          if (!inv) return false;
          const invComp = inv.companyId || (inv as any).company;
          return isMatchingCompany({ id: invComp, slug: invComp } as any, cId);
        });

        const realRev = compInvoices.reduce((s, inv) => {
          const rec = parseAmt(inv.paymentReceived);
          if (rec > 0) return s + rec;
          const st = String(inv.status || "").toLowerCase();
          if (st === "fully paid" || st === "paid")
            return s + parseAmt(inv.totalInvoiced);
          return s;
        }, 0);
        const realOut = compInvoices.reduce(
          (s, inv) => s + parseAmt(inv.due),
          0,
        );

        return {
          id: String(c.id || idx),
          name: getCompanyFullName(c),
          branches: compBranches.length,
          users: compUsers.length,
          projects: compProjects.length,
          revenue: realRev,
          outstanding: realOut,
          percent: 0,
          color: palette[idx % palette.length],
        };
      })
      .filter(Boolean) as CompanyRow[];

    const totalRev =
      rows.reduce((s, r) => s + (Number(r?.revenue) || 0), 0) || 1;
    return rows.map((r) => ({
      ...r,
      percent: Math.round(((Number(r?.revenue) || 0) / totalRev) * 1000) / 10,
    }));
  }, [targetCompanies, targetBranches, dbUsers, dbProjects, dbInvoices]);

  // Total calculated metrics
  const totalCompaniesCount = targetCompanies.length;
  const totalBranchesCount = targetBranches.length;
  const activeUsersCount = (dbUsers || []).filter((u) => {
    if (isSuperAdmin && (!activeCompanyId || activeCompanyId === "all"))
      return true;
    const userComp = u.companyId || u.company_id || u.company;
    return targetCompanies.some((c) => isMatchingCompany(c, userComp));
  }).length;
  const activeProjectsCount = (dbProjects || []).filter((p) => {
    if (isSuperAdmin && (!activeCompanyId || activeCompanyId === "all"))
      return true;
    return targetCompanies.some((c) => isMatchingCompany(c, p.companyId));
  }).length;
  const totalRevenueNumber = (realCompaniesData || []).reduce(
    (s, c) => s + (Number(c?.revenue) || 0),
    0,
  );
  const totalOutstandingNumber = (realCompaniesData || []).reduce(
    (s, c) => s + (Number(c?.outstanding) || 0),
    0,
  );
  const totalReceivedNumber = Math.max(
    0,
    totalRevenueNumber - totalOutstandingNumber,
  );

  // -------------------------------------------------------------------------
  // DYNAMIC BRANCHES BREAKDOWN (INCLUDING ALL NEWLY CREATED BRANCHES)
  // -------------------------------------------------------------------------
  const realBranchesData: BranchRow[] = React.useMemo(() => {
    const validBranches = Array.isArray(targetBranches) ? targetBranches : [];
    const validCompanies = Array.isArray(targetCompanies)
      ? targetCompanies
      : [];
    const validUsers = Array.isArray(dbUsers) ? dbUsers : [];
    const validProjects = Array.isArray(dbProjects) ? dbProjects : [];
    const validInvoices = Array.isArray(dbInvoices) ? dbInvoices : [];

    return validBranches
      .map((b) => {
        if (!b) return null;
        const parentComp = validCompanies.find(
          (c) => c && isMatchingCompany(c, b.companyId),
        );
        const compName = parentComp
          ? getCompanyFullName(parentComp)
          : b.companyId || "SAAMPARK";

        const bUsers = validUsers.filter((u) => {
          if (!u) return false;
          const uBranch =
            u.branchId || (u as any).branch_id || (u as any).branch;
          return isMatchingBranch(
            { id: uBranch, code: uBranch, name: uBranch } as any,
            b.id,
          );
        });

        const bProjects = validProjects.filter((p) => {
          if (!p) return false;
          const pBranch =
            p.branchId || (p as any).branch_id || (p as any).branch;
          return isMatchingBranch(
            { id: pBranch, code: pBranch, name: pBranch } as any,
            b.id,
          );
        });

        const bInvoices = validInvoices.filter((inv) => {
          if (!inv) return false;
          const invBranch =
            inv.branchId || (inv as any).branch_id || (inv as any).branch;
          return isMatchingBranch(
            { id: invBranch, code: invBranch, name: invBranch } as any,
            b.id,
          );
        });

        const realRev = bInvoices.reduce((s, inv) => {
          const rec = parseAmt(inv.paymentReceived);
          if (rec > 0) return s + rec;
          const st = String(inv.status || "").toLowerCase();
          if (st === "fully paid" || st === "paid")
            return s + parseAmt(inv.totalInvoiced);
          return s;
        }, 0);
        const realOut = bInvoices.reduce((s, inv) => s + parseAmt(inv.due), 0);

        return {
          id: String(b.id),
          name: b.name,
          companyName: compName,
          users: bUsers.length,
          projects: bProjects.length,
          revenue: realRev,
          outstanding: realOut,
        };
      })
      .filter(Boolean) as BranchRow[];
  }, [targetBranches, targetCompanies, dbUsers, dbProjects, dbInvoices]);

  // Active Company / Branch Display Names
  const activeCompanyObj = (companies || []).find(
    (c) => c && isMatchingCompany(c, activeCompanyId),
  );
  const currentCompanyDisplayName =
    activeCompanyId === "all" || !activeCompanyId
      ? "All Companies"
      : activeCompanyObj
        ? getCompanyFullName(activeCompanyObj)
        : "Selected Company";

  const currentBranchObj = (branches || []).find(
    (b) => b && isMatchingBranch(b, activeBranchId),
  );
  const currentBranchDisplayName =
    activeBranchId === "all" || !activeBranchId
      ? "All Branches"
      : currentBranchObj
        ? currentBranchObj.name
        : "Selected Branch";

  // Selected User Object for Attendance Table
  const selectedUserObj =
    (dbUsers || []).find((u) => u && u.email === selectedUserEmail) ||
    (dbUsers || [])[0] ||
    user;

  // Scoped lists for operational widgets
  const isBranchSelected = Boolean(activeBranchId && activeBranchId !== "all");
  const isSubBranchSelected = Boolean(
    activeSubBranchId && activeSubBranchId !== "all",
  );

  const scopedTasks = React.useMemo(() => {
    let list = Array.isArray(dbTasks) ? dbTasks : [];
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter(
        (t) =>
          t &&
          isMatchingCompany(
            { id: t.companyId, slug: t.companyId } as any,
            activeCompanyId,
          ),
      );
    }
    if (isBranchSelected) {
      list = list.filter((t) => {
        if (!t) return false;
        const bId = t.branchId || (t as any).branch_id || (t as any).branch;
        return isMatchingBranch({ id: bId, code: bId } as any, activeBranchId);
      });
    }
    if (isSubBranchSelected) {
      list = list.filter((t) => {
        if (!t) return false;
        const sbId = String(t.subBranchId || (t as any).sub_branch_id || "")
          .toLowerCase()
          .trim();
        return sbId === String(activeSubBranchId).toLowerCase().trim();
      });
    }
    return list;
  }, [
    dbTasks,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    isBranchSelected,
    isSubBranchSelected,
  ]);

  const scopedProjects = React.useMemo(() => {
    let list = Array.isArray(dbProjects) ? dbProjects : [];
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter(
        (p) =>
          p &&
          isMatchingCompany(
            { id: p.companyId, slug: p.companyId } as any,
            activeCompanyId,
          ),
      );
    }
    if (isBranchSelected) {
      list = list.filter((p) => {
        if (!p) return false;
        const bId = p.branchId || (p as any).branch_id || (p as any).branch;
        return isMatchingBranch({ id: bId, code: bId } as any, activeBranchId);
      });
    }
    if (isSubBranchSelected) {
      list = list.filter((p) => {
        if (!p) return false;
        const sbId = String(p.subBranchId || (p as any).sub_branch_id || "")
          .toLowerCase()
          .trim();
        return sbId === String(activeSubBranchId).toLowerCase().trim();
      });
    }
    return list;
  }, [
    dbProjects,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    isBranchSelected,
    isSubBranchSelected,
  ]);

  const scopedInvoices = React.useMemo(() => {
    let list = Array.isArray(dbInvoices) ? dbInvoices : [];
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter((inv) => {
        if (!inv) return false;
        const cId = inv.companyId || (inv as any).company;
        if (!cId) return false;
        return isMatchingCompany(
          { id: cId, slug: cId } as any,
          activeCompanyId,
        );
      });
    }
    if (isBranchSelected) {
      list = list.filter((inv) => {
        if (!inv) return false;
        const bId =
          inv.branchId || (inv as any).branch_id || (inv as any).branch;
        return isMatchingBranch({ id: bId, code: bId } as any, activeBranchId);
      });
    }
    if (isSubBranchSelected) {
      list = list.filter((inv) => {
        if (!inv) return false;
        const sbId = String(inv.subBranchId || (inv as any).sub_branch_id || "")
          .toLowerCase()
          .trim();
        return sbId === String(activeSubBranchId).toLowerCase().trim();
      });
    }
    return list;
  }, [
    dbInvoices,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    isBranchSelected,
    isSubBranchSelected,
  ]);

  const scopedExpenses = React.useMemo(() => {
    let list = Array.isArray(dbExpenses) ? dbExpenses : [];
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter((exp) => {
        if (!exp) return false;
        const cId = exp.companyId || (exp as any).company;
        if (!cId) return false;
        return isMatchingCompany(
          { id: cId, slug: cId } as any,
          activeCompanyId,
        );
      });
    }
    if (isBranchSelected) {
      list = list.filter((exp) => {
        if (!exp) return false;
        const bId =
          exp.branchId || (exp as any).branch_id || (exp as any).branch;
        return isMatchingBranch({ id: bId, code: bId } as any, activeBranchId);
      });
    }
    if (isSubBranchSelected) {
      list = list.filter((exp) => {
        if (!exp) return false;
        const sbId = String(exp.subBranchId || (exp as any).sub_branch_id || "")
          .toLowerCase()
          .trim();
        return sbId === String(activeSubBranchId).toLowerCase().trim();
      });
    }
    return list;
  }, [
    dbExpenses,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    isBranchSelected,
    isSubBranchSelected,
  ]);

  const scopedOrders = React.useMemo(() => {
    let list = Array.isArray(dbOrders) ? dbOrders : [];
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter((ord) => {
        if (!ord) return false;
        const cId = ord.companyId || (ord as any).company;
        if (!cId) return false;
        return isMatchingCompany(
          { id: cId, slug: cId } as any,
          activeCompanyId,
        );
      });
    }
    if (isBranchSelected) {
      list = list.filter((ord) => {
        if (!ord) return false;
        const bId =
          ord.branchId || (ord as any).branch_id || (ord as any).branch;
        return isMatchingBranch({ id: bId, code: bId } as any, activeBranchId);
      });
    }
    if (isSubBranchSelected) {
      list = list.filter((ord) => {
        if (!ord) return false;
        const sbId = String(
          (ord as any).subBranchId || (ord as any).sub_branch_id || "",
        )
          .toLowerCase()
          .trim();
        return sbId === String(activeSubBranchId).toLowerCase().trim();
      });
    }
    return list;
  }, [
    dbOrders,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    isBranchSelected,
    isSubBranchSelected,
  ]);

  const scopedUsers: any = React.useMemo(
    () =>
      computeSuperAdminDashboardMemo50({
        dbUsers,
        activeCompanyId,
        isBranchSelected,
        activeBranchId,
        isSubBranchSelected,
        activeSubBranchId,
      }),
    [
      dbUsers,
      activeCompanyId,
      activeBranchId,
      activeSubBranchId,
      isBranchSelected,
      isSubBranchSelected,
    ],
  );

  const realInvoicedSum = scopedInvoices.reduce(
    (acc, i) => acc + parseAmt(i.totalInvoiced || i.baseAmount),
    0,
  );
  const realReceivedSum = scopedInvoices.reduce((acc, i) => {
    const rec = parseAmt(i.paymentReceived);
    if (rec > 0) return acc + rec;
    const st = String(i.status || "").toLowerCase();
    if (st === "fully paid" || st === "paid")
      return acc + parseAmt(i.totalInvoiced);
    return acc;
  }, 0);
  const realDueSum = scopedInvoices.reduce(
    (acc, i) => acc + parseAmt(i.due),
    0,
  );
  const realExpenseSum = scopedExpenses.reduce(
    (acc, e) => acc + parseAmt(e.amount),
    0,
  );

  // Real company financial totals
  const activeCompanyInvoiced = realInvoicedSum;
  const activeCompanyReceived = realReceivedSum;
  const activeCompanyDue = realDueSum;
  const activeCompanyExpenses = realExpenseSum;
  const activeCompanyMargin = activeCompanyReceived - activeCompanyExpenses;

  // Invoice categorization & accurate sums
  const paidInvoices = scopedInvoices.filter((i) => {
    const s = String(i.status || "")
      .toLowerCase()
      .trim();
    const received = parseAmt(i.paymentReceived);
    const due = parseAmt(i.due);
    return s === "fully paid" || s === "paid" || (due === 0 && received > 0);
  });

  const partialInvoices = scopedInvoices.filter((i) => {
    const s = String(i.status || "")
      .toLowerCase()
      .trim();
    const received = parseAmt(i.paymentReceived);
    const due = parseAmt(i.due);
    if (s === "partially paid" || s === "partial" || s === "advance received")
      return true;
    return received > 0 && due > 0 && s !== "fully paid" && s !== "paid";
  });

  const dueInvoices = scopedInvoices.filter((i) => {
    const s = String(i.status || "")
      .toLowerCase()
      .trim();
    const received = parseAmt(i.paymentReceived);
    const due = parseAmt(i.due);
    if (
      s === "not paid" ||
      s === "payment pending" ||
      s === "draft" ||
      s === "unpaid" ||
      s === "pending"
    )
      return true;
    return (
      received === 0 &&
      due > 0 &&
      !partialInvoices.some((p) => p.id === i.id) &&
      !paidInvoices.some((p) => p.id === i.id)
    );
  });

  // Invoices with outstanding due
  const invoicesWithDue = scopedInvoices.filter((i) => parseAmt(i.due) > 0);
  const invoicesWithDueCount = invoicesWithDue.length;

  const paidInvoicesCount = paidInvoices.length;
  const partialInvoicesCount = partialInvoices.length;
  const dueInvoicesCount = dueInvoices.length;

  const paidInvoicesReceived = paidInvoices.reduce(
    (acc, i) =>
      acc + (parseAmt(i.paymentReceived) || parseAmt(i.totalInvoiced)),
    0,
  );
  const partialInvoicesReceived = partialInvoices.reduce(
    (acc, i) => acc + parseAmt(i.paymentReceived),
    0,
  );
  const partialInvoicesDue = partialInvoices.reduce(
    (acc, i) => acc + parseAmt(i.due),
    0,
  );
  const dueInvoicesDue = dueInvoices.reduce(
    (acc, i) => acc + (parseAmt(i.due) || parseAmt(i.totalInvoiced)),
    0,
  );

  const openProjectsCount = scopedProjects.filter(
    (p) => String(p.status) === "In Progress" || String(p.status) === "Open",
  ).length;
  const completedProjectsCount = scopedProjects.filter(
    (p) => String(p.status) === "Completed" || (p.progress || 0) >= 100,
  ).length;
  const holdProjectsCount = scopedProjects.filter(
    (p) => String(p.status) === "Hold" || String(p.status) === "On Hold",
  ).length;
  const averageProjectProgression =
    scopedProjects.length > 0
      ? Math.round(
          scopedProjects.reduce((acc, p) => acc + (p.progress || 0), 0) /
            scopedProjects.length,
        )
      : 0;

  const taskTodoCount = scopedTasks.filter(
    (t) => String(t.status) === "To do" || String(t.status) === "Pending",
  ).length;
  const taskInProgressCount = scopedTasks.filter(
    (t) =>
      String(t.status) === "In progress" || String(t.status) === "In Progress",
  ).length;
  const taskReviewCount = scopedTasks.filter(
    (t) => String(t.status) === "Review",
  ).length;
  const taskDoneCount = scopedTasks.filter(
    (t) => String(t.status) === "Done" || String(t.status) === "Completed",
  ).length;

  const taskDonutData = [
    {
      label: "To do",
      value: taskTodoCount || (scopedTasks.length === 0 ? 0 : 1),
      color: "#eab308",
    },
    { label: "In progress", value: taskInProgressCount, color: "#3b82f6" },
    { label: "Review", value: taskReviewCount, color: "#a855f7" },
    { label: "Done", value: taskDoneCount, color: "#10b981" },
  ];

  const incomeVsExpenseData = [
    {
      label: "Revenue Collected",
      value: Math.max(0, activeCompanyReceived),
      color: "#10b981",
    },
    {
      label: "Expenses Incurred",
      value: Math.max(0, activeCompanyExpenses),
      color: "#ec4899",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "company":
        return {
          icon: <Building2 size={15} />,
          bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
        };
      case "branch":
        return {
          icon: <GitBranch size={15} />,
          bg: "bg-amber-50 text-amber-600 border-amber-200",
        };
      case "user":
        return {
          icon: <Users size={15} />,
          bg: "bg-purple-50 text-purple-600 border-purple-200",
        };
      case "project":
        return {
          icon: <Briefcase size={15} />,
          bg: "bg-rose-50 text-rose-600 border-rose-200",
        };
      case "payment":
        return {
          icon: <CreditCard size={15} />,
          bg: "bg-emerald-50 text-emerald-600 border-emerald-200",
        };
      default:
        return {
          icon: <CheckCircle2 size={15} />,
          bg: "bg-blue-50 text-blue-600 border-blue-200",
        };
    }
  };

  const formatActivityTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "recently";
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHrs = Math.floor(diffMs / 3600000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } catch {
      return "recently";
    }
  };

  __ctrl = {
    user,
    companies,
    branches,
    subBranches,
    activeCompanyId,
    activeBranchId,
    activeSubBranchId,
    switchCompany,
    switchBranch,
    isLoading,
    setIsLoading,
    activeTab,
    setActiveTab,
    revenueYear,
    setRevenueYear,
    activities,
    setActivities,
    isCompanyDropdownOpen,
    setIsCompanyDropdownOpen,
    isBranchDropdownOpen,
    setIsBranchDropdownOpen,
    dbUsers,
    setDbUsers,
    dbProjects,
    setDbProjects,
    dbInvoices,
    setDbInvoices,
    dbOrders,
    setDbOrders,
    dbTasks,
    setDbTasks,
    dbExpenses,
    setDbExpenses,
    dbTimecards,
    setDbTimecards,
    selectedUserEmail,
    setSelectedUserEmail,
    noteText,
    setNoteText,
    todos,
    setTodos,
    isSuperAdmin,
    isAllCompanies,
    allowedCompanies,
    allowedBranches,
    canSwitchCompany,
    canSwitchBranch,
    loadDashboardData,
    updateNoteText,
    targetCompanies,
    targetBranches,
    realCompaniesData,
    totalCompaniesCount,
    totalBranchesCount,
    activeUsersCount,
    activeProjectsCount,
    totalRevenueNumber,
    totalOutstandingNumber,
    totalReceivedNumber,
    realBranchesData,
    activeCompanyObj,
    currentCompanyDisplayName,
    currentBranchObj,
    currentBranchDisplayName,
    selectedUserObj,
    isBranchSelected,
    isSubBranchSelected,
    scopedTasks,
    scopedProjects,
    scopedInvoices,
    scopedExpenses,
    scopedOrders,
    scopedUsers,
    realInvoicedSum,
    realReceivedSum,
    realDueSum,
    realExpenseSum,
    activeCompanyInvoiced,
    activeCompanyReceived,
    activeCompanyDue,
    activeCompanyExpenses,
    activeCompanyMargin,
    paidInvoices,
    partialInvoices,
    dueInvoices,
    invoicesWithDue,
    invoicesWithDueCount,
    paidInvoicesCount,
    partialInvoicesCount,
    dueInvoicesCount,
    paidInvoicesReceived,
    partialInvoicesReceived,
    partialInvoicesDue,
    dueInvoicesDue,
    openProjectsCount,
    completedProjectsCount,
    holdProjectsCount,
    averageProjectProgression,
    taskTodoCount,
    taskInProgressCount,
    taskReviewCount,
    taskDoneCount,
    taskDonutData,
    incomeVsExpenseData,
    getActivityIcon,
    formatActivityTime,
  };
  __ctrlRef.current = __ctrl;
  return (
    <div className="space-y-8 max-w-[1550px] mx-auto p-4 sm:p-6 pb-24 bg-[#f8fafc] dark:bg-zinc-950 min-h-screen">
      <SuperAdminDashboardSection1 ctrl={__ctrl} />
    </div>
  );
}
