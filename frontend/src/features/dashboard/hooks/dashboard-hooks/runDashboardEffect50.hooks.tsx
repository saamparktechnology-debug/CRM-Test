"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  CheckSquare, Clock, Calendar, DollarSign, Plus, Edit2, 
  Trash2, Download, Search, CheckCircle2, MoreHorizontal,
  FileText, PieChart, Users, AlertCircle, TrendingUp, Bell, Grid, Briefcase, Monitor,
  ShieldCheck, Lock, Unlock, PhoneCall, Check, ExternalLink, UserCheck, Building2, MapPin
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useTimerStore } from "@/store/useTimerStore"
import { Button } from "@/components/ui/Button"
import { Widget } from "@/features/dashboard/components/Widget"
import { KPICard } from "@/features/dashboard/components/KPICard"
import { DonutChart } from "@/features/dashboard/components/DonutChart"
import { BarChartMockup } from "@/features/dashboard/components/BarChartMockup"
import { getStoredUserAccountsAsync, getUsers, getUserAvatar } from "@/features/users/services/userService"
import { taskService } from "@/features/tasks/services/taskService"
import { getProjects } from "@/features/projects/services/projectService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getOrders, OrderItem } from "@/features/orders/services/orderService"
import { Task } from "@/features/tasks/types"
import { Project } from "@/features/projects/types"
import { filterGlobalDeletedItems, fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync"
import { normalizeRole } from "@/store/usePermissionStore"
import { ClientDashboard } from "@/features/dashboard/components/ClientDashboard"
import { SuperAdminDashboard } from "@/features/dashboard/components/SuperAdminDashboard"
import { DashboardSection1 } from "@/features/dashboard/components/dashboard-sections/DashboardSection1"
import { DashboardSection2 } from "@/features/dashboard/components/dashboard-sections/DashboardSection2"
import { createDashboardAction20 } from "@/features/dashboard/hooks/dashboard-hooks/createDashboardAction20.hooks"

export function runDashboardEffect50(getCtrl: () => any) {
  const { refreshLiveDashboard } = getCtrl();
  const __fn: any = () => {
    refreshLiveDashboard()
    
    let interval: any = null
    const startPolling = () => {
      if (!interval) {
        interval = setInterval(() => {
          if (typeof document !== "undefined" && !document.hidden) {
            refreshLiveDashboard()
          }
        }, 4000)
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshLiveDashboard()
      }
    }

    startPolling()
    window.addEventListener("storage", refreshLiveDashboard)
    window.addEventListener("saampark_company_switched", refreshLiveDashboard)
    window.addEventListener("saampark_branch_switched", refreshLiveDashboard)
    window.addEventListener("saampark_sub_branch_switched", refreshLiveDashboard)
    window.addEventListener("saampark_subbranch_switched", refreshLiveDashboard)
    document.addEventListener("visibilitychange", handleVisibility)

    return () => {
      if (interval) clearInterval(interval)
      window.removeEventListener("storage", refreshLiveDashboard)
      window.removeEventListener("saampark_company_switched", refreshLiveDashboard)
      window.removeEventListener("saampark_branch_switched", refreshLiveDashboard)
      window.removeEventListener("saampark_sub_branch_switched", refreshLiveDashboard)
      window.removeEventListener("saampark_subbranch_switched", refreshLiveDashboard)
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  };
  return __fn();
}
