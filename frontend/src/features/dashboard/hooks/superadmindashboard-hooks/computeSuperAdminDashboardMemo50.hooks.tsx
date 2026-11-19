"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
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
  Layers
} from "lucide-react"
import Link from "next/link"
import { useAuthStore, getCompanyFullName, isMatchingCompany, isMatchingBranch, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getActivityLogs, ActivityLog } from "@/services/activityLogService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { Widget } from "@/features/dashboard/components/Widget"
import { KPICard } from "@/features/dashboard/components/KPICard"
import { DonutChart } from "@/features/dashboard/components/DonutChart"
import { getUserAvatar } from "@/features/users/services/userService"
import { taskService } from "@/features/tasks/services/taskService"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getOrders, OrderItem } from "@/features/orders/services/orderService"
import { Task } from "@/features/tasks/types"
import { Project } from "@/features/projects/types"
import { SuperAdminDashboardSection1 } from "@/features/dashboard/components/superadmindashboard-sections/SuperAdminDashboardSection1"
import { type CompanyRow, type BranchRow, parseAmt, formatINR, formatTime } from "@/features/dashboard/components/superadmindashboard-sections/SuperAdminDashboardHelpers"
import { createSuperAdminDashboardAction20 } from "@/features/dashboard/hooks/superadmindashboard-hooks/createSuperAdminDashboardAction20.hooks"

export function computeSuperAdminDashboardMemo50(ctx: any) {
  const { dbUsers, activeCompanyId, isBranchSelected, activeBranchId, isSubBranchSelected, activeSubBranchId } = ctx;
  const __fn: any = () => {
    let list = Array.isArray(dbUsers) ? dbUsers : []
    if (activeCompanyId && activeCompanyId !== "all") {
      list = list.filter(u => {
        if (!u) return false
        if (Array.isArray(u.companyIds) && u.companyIds.length > 0) {
          return u.companyIds.some((cid: any) => isMatchingCompany({ id: cid, slug: cid } as any, activeCompanyId))
        }
        if (typeof u.companyIds === "string") {
          try {
            const parsed = JSON.parse(u.companyIds)
            if (Array.isArray(parsed)) {
              return parsed.some((cid: any) => isMatchingCompany({ id: cid, slug: cid } as any, activeCompanyId))
            }
          } catch {}
        }
        const cId = u.companyId || u.company_id || u.company
        if (!cId) return false
        return isMatchingCompany({ id: cId, slug: cId } as any, activeCompanyId)
      })
    }
    if (isBranchSelected) {
      list = list.filter(u => {
        if (!u) return false
        if (Array.isArray(u.branchIds) && u.branchIds.length > 0) {
          return u.branchIds.some((bid: any) => isMatchingBranch({ id: bid, code: bid } as any, activeBranchId))
        }
        const bId = u.branchId || u.branch_id || u.branch
        return isMatchingBranch({ id: bId, code: bId } as any, activeBranchId)
      })
    }
    if (isSubBranchSelected) {
      list = list.filter(u => {
        if (!u) return false
        const sbId = String(u.subBranchId || (u as any).sub_branch_id || "").toLowerCase().trim()
        const sbIds = Array.isArray((u as any).subBranchIds) ? (u as any).subBranchIds.map((id: any) => String(id).toLowerCase().trim()) : []
        const target = String(activeSubBranchId).toLowerCase().trim()
        return sbId === target || sbIds.includes(target)
      })
    }
    const seen = new Set<string>()
    return list.filter((u: any) => {
      if (!u) return false
      const key = String(u.email || u.id || "").toLowerCase().trim()
      if (!key) return true
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  };
  return __fn();
}
