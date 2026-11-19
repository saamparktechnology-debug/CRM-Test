"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Clock,
  Calendar,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Download,
  Search,
  CheckCircle2,
  MoreHorizontal,
  FileText,
  PieChart,
  Users,
  AlertCircle,
  TrendingUp,
  Bell,
  Grid,
  Briefcase,
  Monitor,
  ShieldCheck,
  Lock,
  Unlock,
  PhoneCall,
  Check,
  ExternalLink,
  UserCheck,
  Building2,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useTimerStore } from "@/store/useTimerStore";
import { Button } from "@/components/ui/Button";
import { Widget } from "@/features/dashboard/components/Widget";
import { KPICard } from "@/features/dashboard/components/KPICard";
import { DonutChart } from "@/features/dashboard/components/DonutChart";
import { BarChartMockup } from "@/features/dashboard/components/BarChartMockup";
import {
  getStoredUserAccountsAsync,
  getUsers,
  getUserAvatar,
} from "@/features/users/services/userService";
import { taskService } from "@/features/tasks/services/taskService";
import { getProjects } from "@/features/projects/services/projectService";
import {
  getInvoices,
  InvoiceItem,
} from "@/features/invoice/services/invoiceService";
import { getOrders, OrderItem } from "@/features/orders/services/orderService";
import { Task } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";
import {
  filterGlobalDeletedItems,
  fetchModuleDataFromDB,
  saveModuleDataToDB,
} from "@/lib/storageSync";
import { normalizeRole } from "@/store/usePermissionStore";
import { ClientDashboard } from "@/features/dashboard/components/ClientDashboard";
import { SuperAdminDashboard } from "@/features/dashboard/components/SuperAdminDashboard";
import { DashboardSection1 } from "@/features/dashboard/components/dashboard-sections/DashboardSection1";
import { DashboardSection2 } from "@/features/dashboard/components/dashboard-sections/DashboardSection2";

export function createDashboardAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {
      targetComp,
      branches,
      targetBranch,
      targetSubBranch,
      setRealUsers,
      selectedUserEmail,
      setSelectedUserEmail,
      user,
      setActiveTasksCount,
      setLiveTasks,
      setLiveProjects,
      setLiveLeads,
      setLiveInvoices,
      setLiveOrders,
      setLiveExpenses,
    } = getCtrl();
    const __fn: any = async () => {
      try {
        const { getLeads } =
          await import("@/features/leads/services/leadService");
        const [uList, tList, pList, lList, invList, ordList, expList] =
          await Promise.all([
            getUsers(targetComp),
            taskService.getTasks(targetComp),
            getProjects(targetComp),
            getLeads(targetComp),
            getInvoices(targetComp),
            getOrders(targetComp),
            fetchModuleDataFromDB<any[]>("expenses", [], targetComp),
          ]);

        const cleanUsers = filterGlobalDeletedItems(uList);
        const cleanTasks = filterGlobalDeletedItems(tList);
        const cleanProjects = filterGlobalDeletedItems(pList);
        const cleanLeads = filterGlobalDeletedItems(lList);
        const cleanInvoices = filterGlobalDeletedItems(invList);
        const cleanOrders = filterGlobalDeletedItems(ordList);
        const cleanExpenses = filterGlobalDeletedItems(expList);

        // Apply company scoping
        const companyFilter = (item: any) => {
          if (!targetComp || targetComp === "all") return true;
          const cId = (item.companyId || item.company || "tech")
            .toLowerCase()
            .trim();
          const tComp = targetComp.toLowerCase().trim();
          return cId === tComp || (tComp === "tech" && !item.companyId);
        };

        // Apply branch scoping if active branch is selected
        const targetBranchObj = branches.find(
          (b: any) =>
            b.id === targetBranch ||
            b.name.toLowerCase() === (targetBranch || "").toLowerCase(),
        );
        const targetBranchId = String(targetBranchObj?.id || targetBranch || "")
          .toLowerCase()
          .trim();
        const targetBranchName =
          targetBranchObj?.name?.toLowerCase().trim() || "";

        const branchFilter = (item: any) => {
          if (!targetBranch) return true;
          const bId = String(
            item.branchId || item.assignedBranchId || item.branch_id || "",
          )
            .toLowerCase()
            .trim();
          const bName = String(
            item.branchName ||
              item.assignedBranchName ||
              item.branch_name ||
              "",
          )
            .toLowerCase()
            .trim();
          if (item.branchIds && Array.isArray(item.branchIds)) {
            const ids = item.branchIds.map((s: string) =>
              String(s).toLowerCase().trim(),
            );
            if (ids.includes(targetBranchId)) return true;
          }
          return (
            (bId &&
              (bId === targetBranchId ||
                (targetBranchName && bId === targetBranchName))) ||
            (bName && (bName === targetBranchName || bName === targetBranchId))
          );
        };

        const subBranchFilter = (item: any) => {
          if (!targetSubBranch || targetSubBranch === "all") return true;
          const sbId = String(item.subBranchId || item.sub_branch_id || "")
            .toLowerCase()
            .trim();
          const targetSbId = String(targetSubBranch).toLowerCase().trim();
          if (item.subBranchIds && Array.isArray(item.subBranchIds)) {
            const ids = item.subBranchIds.map((s: string) =>
              String(s).toLowerCase().trim(),
            );
            if (ids.includes(targetSbId)) return true;
          }
          return sbId && sbId === targetSbId;
        };

        const userCompanyFilter = (u: any) => {
          if (!targetComp || targetComp === "all") return true;
          if (u.role === "Super Admin") return true;
          const uCompIds =
            u.companyIds && u.companyIds.length > 0
              ? u.companyIds.map((id: string) =>
                  String(id).toLowerCase().trim(),
                )
              : [
                  String(u.companyId || "tech")
                    .toLowerCase()
                    .trim(),
                ];
          return uCompIds.includes(targetComp.toLowerCase().trim());
        };

        const scopedUsers = cleanUsers
          .filter(userCompanyFilter)
          .filter((u: any) => {
            if (!targetBranch) return true;
            if (u.role === "Super Admin") return true;
            return branchFilter(u);
          })
          .filter((u: any) => {
            if (!targetSubBranch) return true;
            if (u.role === "Super Admin") return true;
            return subBranchFilter(u);
          });

        const scopedTasks = cleanTasks
          .filter(companyFilter)
          .filter(branchFilter)
          .filter(subBranchFilter);
        const scopedProjects = cleanProjects
          .filter(companyFilter)
          .filter(branchFilter)
          .filter(subBranchFilter);
        const scopedLeads = cleanLeads
          .filter(companyFilter)
          .filter(branchFilter)
          .filter(subBranchFilter);
        const scopedInvoices = cleanInvoices
          .filter(companyFilter)
          .filter(branchFilter)
          .filter(subBranchFilter);
        const scopedOrders = cleanOrders
          .filter(companyFilter)
          .filter(branchFilter)
          .filter(subBranchFilter);
        const scopedExpenses = cleanExpenses
          .filter(companyFilter)
          .filter(branchFilter)
          .filter(subBranchFilter);

        setRealUsers(scopedUsers);
        if (scopedUsers.length > 0 && !selectedUserEmail) {
          setSelectedUserEmail(scopedUsers[0].email);
        }

        const isSuperOrAdmin =
          user?.role === "Super Admin" || user?.role === "Admin";
        let userScopedTasks = scopedTasks;
        if (user && !isSuperOrAdmin) {
          const normName = (user.name || "").toLowerCase().trim();
          const normEmail = (user.email || "").toLowerCase().trim();
          userScopedTasks = scopedTasks.filter((t) => {
            const assigned = (t.assignedTo || "").toLowerCase().trim();
            const collab = (t.collaborators || "").toLowerCase().trim();
            return (
              assigned === normName ||
              assigned === normEmail ||
              (normName && assigned.includes(normName)) ||
              (normEmail && assigned.includes(normEmail)) ||
              collab.includes(normName) ||
              collab.includes(normEmail)
            );
          });
        }

        const active = userScopedTasks.filter((t) => t.status !== "Done");
        setActiveTasksCount(active.length);
        setLiveTasks(scopedTasks);
        setLiveProjects(scopedProjects);
        setLiveLeads(scopedLeads);
        setLiveInvoices(scopedInvoices);
        setLiveOrders(scopedOrders);
        setLiveExpenses(scopedExpenses);
      } catch (e) {
        console.warn("Dashboard refresh error:", e);
      }
    };
    return __fn(...__args);
  };
}
