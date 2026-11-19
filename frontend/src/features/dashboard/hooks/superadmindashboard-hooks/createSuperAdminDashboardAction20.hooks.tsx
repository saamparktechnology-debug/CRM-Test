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

export function createSuperAdminDashboardAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { activeCompanyId, setDbUsers, setDbProjects, setDbInvoices, setDbOrders, setDbTasks, setDbExpenses, setDbTimecards, setActivities, selectedUserEmail, setSelectedUserEmail, setIsLoading } = getCtrl();
    const __fn: any = async () => {
    try {
      const [uList, pList, invList, ordList, tList, expList, actList, tcList] = await Promise.all([
        fetchModuleDataFromDB<any[]>("users", [], "all").catch(() => []),
        getProjects("all").catch(() => []),
        getInvoices("all").catch(() => []),
        getOrders("all").catch(() => []),
        taskService.getTasks("all").catch(() => []),
        fetchModuleDataFromDB<any[]>("expenses", [], "all").catch(() => []),
        getActivityLogs(activeCompanyId || "all").catch(() => []),
        fetchModuleDataFromDB<any[]>("timecards", [], "all").catch(() => [])
      ])
      
      const rawCleanUsers = filterGlobalDeletedItems(uList || [])
      const seenUserKeys = new Set<string>()
      const cleanUsers = rawCleanUsers.filter((u: any) => {
        if (!u) return false
        const key = String(u.email || u.id || "").toLowerCase().trim()
        if (!key) return true
        if (seenUserKeys.has(key)) return false
        seenUserKeys.add(key)
        return true
      })
      const cleanProjects = filterGlobalDeletedItems(pList || [])
      const cleanInvoices = filterGlobalDeletedItems(invList || [])
      const cleanOrders = filterGlobalDeletedItems(ordList || [])
      const cleanTasks = filterGlobalDeletedItems(tList || [])
      const cleanExpenses = filterGlobalDeletedItems(expList || [])
      const cleanTimecards = filterGlobalDeletedItems(tcList || [])

      setDbUsers(cleanUsers)
      setDbProjects(cleanProjects)
      setDbInvoices(cleanInvoices)
      setDbOrders(cleanOrders)
      setDbTasks(cleanTasks)
      setDbExpenses(cleanExpenses)
      setDbTimecards(cleanTimecards)
      setActivities(actList || [])

      if (cleanUsers.length > 0 && !selectedUserEmail) {
        setSelectedUserEmail(cleanUsers[0].email)
      }
    } finally {
      setIsLoading(false)
    }
  };
    return __fn(...__args);
  };
}
