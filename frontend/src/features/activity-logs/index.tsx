"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Search,
  Building2,
  GitBranch,
  User,
  FolderKanban,
  CreditCard,
  CheckCircle2,
  Clock,
  Filter,
  ArrowLeft,
  Shield,
  Target,
  Briefcase,
  FileText,
  CheckSquare,
  RotateCcw,
  Sparkles,
  AlertCircle,
  Trash2,
  Calendar,
  Crown,
  UserCheck,
  ShieldAlert,
  Users,
  Layers,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore, getCompanyFullName } from "@/store/useAuthStore";
import { ActivityLog, ActivityType } from "./types";
import {
  useActivityLogsQuery,
  useClearActivityLogsMutation,
} from "./hooks/useActivityLogs";
import { Button } from "@/components/ui/Button";
import { ActivityLogsSection1 } from "@/features/activity-logs/components/activitylogs-sections/ActivityLogsSection1";
import { ActivityLogsSection2 } from "@/features/activity-logs/components/activitylogs-sections/ActivityLogsSection2";

export default function ActivityLogsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, activeCompanyId } = useAuthStore();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCompany, setSelectedCompany] = React.useState<string>(
    activeCompanyId || "all",
  );
  const [selectedActor, setSelectedActor] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const isSuperAdmin = user?.role === "Super Admin";
  const isAdmin = user?.role === "Admin";
  const isAuthorized = isSuperAdmin || isAdmin;
  const isTeamMember = !isAuthorized;

  // Company scope filtering
  const allowedCompanies = React.useMemo(() => {
    if (!user) return [];
    if (isSuperAdmin) return companies;
    const compIds = (
      user.companyIds || (user.companyId ? [user.companyId] : ["tech"])
    ).map((id) => String(id).toLowerCase().trim());
    return companies.filter(
      (c) =>
        compIds.includes(String(c.id).toLowerCase().trim()) ||
        (c.slug && compIds.includes(String(c.slug).toLowerCase().trim())),
    );
  }, [user, companies, isSuperAdmin]);

  const targetCompany = React.useMemo(() => {
    if (!isSuperAdmin && selectedCompany === "all") {
      return allowedCompanies[0]?.id || user?.companyId || "tech";
    }
    return selectedCompany;
  }, [isSuperAdmin, selectedCompany, allowedCompanies, user?.companyId]);

  const {
    data: logs = [],
    isLoading: loading,
    refetch: loadLogs,
  } = useActivityLogsQuery(targetCompany);
  const clearLogsMutation = useClearActivityLogsMutation(targetCompany);

  const handleClearLogs = async () => {
    if (!isSuperAdmin) return;
    if (
      confirm(
        "Are you sure you want to clear the activity log history? This action cannot be undone.",
      )
    ) {
      await clearLogsMutation.mutateAsync();
    }
  };

  // Extract distinct actors/admins for the Actor Filter
  const actorsList = React.useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; role: string; email?: string }
    >();
    logs.forEach((l) => {
      const key = (l.userName || l.userEmail || "System").trim();
      if (key && !map.has(key)) {
        map.set(key, {
          key,
          name: l.userName || key,
          role: l.userRole || "User",
          email: l.userEmail,
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => {
      // Super Admin and Admin first
      if (a.role === "Super Admin" && b.role !== "Super Admin") return -1;
      if (b.role === "Super Admin" && a.role !== "Super Admin") return 1;
      if (a.role === "Admin" && b.role !== "Admin") return -1;
      if (b.role === "Admin" && a.role !== "Admin") return 1;
      return a.name.localeCompare(b.name);
    });
  }, [logs]);

  // Filter logs by search, company, category type, and actor/admin
  const filteredLogs = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return logs.filter((log) => {
      const matchesSearch =
        !q ||
        (log.action || "").toLowerCase().includes(q) ||
        (log.description || "").toLowerCase().includes(q) ||
        (log.companyName || "").toLowerCase().includes(q) ||
        (log.userName || "").toLowerCase().includes(q) ||
        (log.userRole || "").toLowerCase().includes(q) ||
        (log.userEmail || "").toLowerCase().includes(q) ||
        (log.module || "").toLowerCase().includes(q) ||
        (log.details || "").toLowerCase().includes(q);

      let matchesType = true;
      if (typeFilter !== "all") {
        if (typeFilter === "finance") {
          matchesType =
            log.type === "invoice" ||
            log.type === "payment" ||
            log.type === "quotation" ||
            log.type === "estimate";
        } else if (typeFilter === "operations") {
          matchesType = log.type === "project" || log.type === "task";
        } else {
          matchesType = log.type === typeFilter;
        }
      }

      let matchesActor = true;
      if (!isAuthorized) {
        // User-specific strict audit trail for Team members & non-admins
        const uId = String(user?.id || "")
          .toLowerCase()
          .trim();
        const uEmail = String(user?.email || "")
          .toLowerCase()
          .trim();
        const uName = String(user?.name || "")
          .toLowerCase()
          .trim();

        const logActor = (log.userName || "").toLowerCase().trim();
        const logEmail = (log.userEmail || "").toLowerCase().trim();
        const logUserId = String(log.userId || "")
          .toLowerCase()
          .trim();

        const isMyAction =
          (uId && logUserId === uId) ||
          (uEmail && logEmail === uEmail) ||
          (uName && logActor === uName);
        if (!isMyAction) return false;
      } else if (selectedActor !== "all") {
        if (selectedActor === "__admins_only__") {
          const roleLower = (log.userRole || "").toLowerCase().trim();
          matchesActor = roleLower === "admin" || roleLower === "super admin";
        } else {
          const actorKey = (log.userName || log.userEmail || "")
            .trim()
            .toLowerCase();
          matchesActor = actorKey === selectedActor.toLowerCase();
        }
      }

      return matchesSearch && matchesType && matchesActor;
    });
  }, [logs, searchQuery, typeFilter, selectedActor, isAuthorized, user]);

  // Count categories for KPI cards
  const stats = React.useMemo(() => {
    return {
      total: logs.length,
      adminActions: logs.filter((l) => {
        const r = (l.userRole || "").toLowerCase();
        return r === "admin" || r === "super admin";
      }).length,
      permissions: logs.filter((l) => l.type === "permission").length,
      leadsAndClients: logs.filter(
        (l) => l.type === "lead" || l.type === "client",
      ).length,
      billing: logs.filter(
        (l) =>
          l.type === "invoice" ||
          l.type === "payment" ||
          l.type === "quotation" ||
          l.type === "estimate",
      ).length,
      operations: logs.filter((l) => l.type === "project" || l.type === "task")
        .length,
    };
  }, [logs]);

  const getTypeMeta = (type: ActivityType | string) => {
    switch (type) {
      case "permission":
        return {
          icon: Shield,
          color: "text-amber-500",
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400",
          label: "Security & Permissions",
        };
      case "lead":
        return {
          icon: Target,
          color: "text-blue-500",
          bg: "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400",
          label: "Leads Pipeline",
        };
      case "client":
        return {
          icon: Briefcase,
          color: "text-purple-500",
          bg: "bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400",
          label: "Client Accounts",
        };
      case "invoice":
      case "payment":
        return {
          icon: CreditCard,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
          label: "Billing & Revenue",
        };
      case "quotation":
      case "estimate":
        return {
          icon: FileText,
          color: "text-indigo-500",
          bg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
          label: "Estimates & Proposals",
        };
      case "project":
        return {
          icon: FolderKanban,
          color: "text-cyan-500",
          bg: "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400",
          label: "Projects & Operations",
        };
      case "task":
        return {
          icon: CheckSquare,
          color: "text-teal-500",
          bg: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
          label: "Task Operations",
        };
      case "user":
        return {
          icon: User,
          color: "text-rose-500",
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
          label: "User Accounts",
        };
      default:
        return {
          icon: ClipboardList,
          color: "text-zinc-500",
          bg: "bg-zinc-500/10 border-zinc-500/20 text-zinc-600 dark:text-zinc-400",
          label: "System Action",
        };
    }
  };

  const getActorRoleBadge = (role?: string) => {
    const rLower = (role || "").toLowerCase().trim();
    if (rLower === "super admin") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Crown size={10} className="text-purple-600 dark:text-purple-400" />{" "}
          Super Admin
        </span>
      );
    }
    if (rLower === "admin") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          <Shield size={10} className="text-blue-600 dark:text-blue-400" />{" "}
          Admin
        </span>
      );
    }
    if (rLower === "clients") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <Briefcase size={10} className="text-amber-600 dark:text-amber-400" />{" "}
          Client
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
        <Users size={10} /> {role || "Team Member"}
      </span>
    );
  };

  const formatTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "Recently";
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHrs = Math.floor(diffMin / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
    } catch {
      return "Recently";
    }
  };

  const formatExactTime = (ts: string) => {
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "";
    }
  };

  __ctrl = {
    user,
    companies,
    activeCompanyId,
    targetCompany,
    logs,
    loading,
    clearLogsMutation,
    searchQuery,
    setSearchQuery,
    selectedCompany,
    setSelectedCompany,
    selectedActor,
    setSelectedActor,
    typeFilter,
    setTypeFilter,
    isSuperAdmin,
    isAdmin,
    isAuthorized,
    isTeamMember,
    allowedCompanies,
    handleClearLogs,
    actorsList,
    filteredLogs,
    stats,
    getTypeMeta,
    getActorRoleBadge,
    formatTime,
    formatExactTime,
  };
  __ctrlRef.current = __ctrl;
  return (
    <div className="space-y-6 max-w-[1500px] mx-auto p-4 sm:p-6 pb-16">
      <ActivityLogsSection1 ctrl={__ctrl} />

      <ActivityLogsSection2 ctrl={__ctrl} />
    </div>
  );
}
