"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, Download, Calendar, Filter, TrendingUp, Users, 
  DollarSign, CheckSquare, Target, PieChart, ArrowUpRight, ArrowDownRight, FileText,
  Receipt, ShieldCheck, AlertCircle, Building2, MapPin, Search, CheckCircle2, Clock, Landmark, Percent, Layers,
  Megaphone, Video, Image as ImageIcon, Sparkles, Printer
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useAuthStore, SubBranch, isMatchingCompany, getCanonicalCompanyId } from "@/store/useAuthStore"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, InvoiceItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { getPayments, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems, isGlobalItemDeleted } from "@/lib/storageSync"
import { getClients } from "@/features/clients/services/clientService"
import { ClientItem } from "@/features/clients/types"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getLeads } from "@/features/leads/services/leadService"
import { Lead } from "@/features/leads/types"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, BillingCycle } from "@/features/subscriptions/types"
import { getProjects } from "@/features/projects/services/projectService"
import { OfficialFormNo9Document } from "@/components/documents/OfficialFormNo9Document"
import { Repeat, Package, Zap, CalendarDays, RefreshCw } from "lucide-react"
import { resolveExportScope, exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { ReportsSection1 } from "@/features/reports/components/reports-sections/ReportsSection1"
import { ReportsSection2 } from "@/features/reports/components/reports-sections/ReportsSection2"
import { ReportsSection3 } from "@/features/reports/components/reports-sections/ReportsSection3"
import { ReportsSection4 } from "@/features/reports/components/reports-sections/ReportsSection4"
import { ReportsSection5 } from "@/features/reports/components/reports-sections/ReportsSection5"
import { ReportsSection6 } from "@/features/reports/components/reports-sections/ReportsSection6"
import { createReportsHandler1 } from "@/features/reports/hooks/reports-hooks/createReportsHandler1.hooks"
import { type ReportTab, type InvoiceFilterType, type SubscriptionFilterType } from "@/features/reports/components/reports-sections/ReportsHelpers"
import { createReportsAction20 } from "@/features/reports/hooks/reports-hooks/createReportsAction20.hooks"

export function computeReportsMemo50(ctx: any) {
  const { scopedMarketingCampaigns } = ctx;
  const __fn: any = () => {
    let totalPostersDone = 0
    let totalPostersScheduled = 0
    let totalVideosDone = 0
    let totalVideosScheduled = 0
    let totalLeads = 0
    let totalReach = 0
    let totalFollowers = 0
    let totalRevenue = 0

    scopedMarketingCampaigns.forEach((p) => {
      const pkg = (p as any).marketingPackage
      if (pkg) {
        const pSched = Array.isArray(pkg.posterSchedule) ? pkg.posterSchedule : []
        const vSched = Array.isArray(pkg.videoSchedule) ? pkg.videoSchedule : []
        totalPostersDone += pSched.filter((it: any) => it.done).length
        totalPostersScheduled += pSched.length > 0 ? pSched.length : (pkg.postersCount || 12)
        totalVideosDone += vSched.filter((it: any) => it.done).length
        totalVideosScheduled += vSched.length > 0 ? vSched.length : (pkg.videosCount || 2)

        if (pkg.performance) {
          totalLeads += Number(pkg.performance.leadsGenerated) || 0
          totalReach += Number(pkg.performance.reach) || 0
          totalFollowers += Number(pkg.performance.followersGained) || 0
        }
      }
      totalRevenue += parseCurrencyNumber(p.price || p.totalAmount || 0)
    })

    // Team workload map
    const teamWorkloadMap: Record<string, { id: string; name: string; role: string; avatar: string; count: number; campaigns: string[] }> = {}
    scopedMarketingCampaigns.forEach((p) => {
      const members = Array.isArray(p.members) ? p.members : []
      members.forEach((m: any) => {
        const mId = String(m.id || m.name || "Specialist")
        const mName = typeof m === "string" ? m : (m.name || "Specialist")
        const mRole = typeof m === "string" ? "Specialist" : (m.role || "Marketing Specialist")
        const mAvatar = (m as any).avatarUrl || (m as any).avatar || getUserAvatar(mName, undefined, mName)
        if (!teamWorkloadMap[mId]) {
          teamWorkloadMap[mId] = { id: mId, name: mName, role: mRole, avatar: mAvatar, count: 0, campaigns: [] }
        }
        teamWorkloadMap[mId].count += 1
        teamWorkloadMap[mId].campaigns.push(p.title)
      })
    })

    return {
      campaignsCount: scopedMarketingCampaigns.length,
      activeCount: scopedMarketingCampaigns.filter(p => p.status !== "Completed" && p.status !== "Cancelled").length,
      completedCount: scopedMarketingCampaigns.filter(p => p.status === "Completed").length,
      totalPostersDone,
      totalPostersScheduled,
      totalVideosDone,
      totalVideosScheduled,
      totalLeads,
      totalReach,
      totalFollowers,
      totalRevenue,
      teamWorkload: Object.values(teamWorkloadMap),
    }
  };
  return __fn();
}
