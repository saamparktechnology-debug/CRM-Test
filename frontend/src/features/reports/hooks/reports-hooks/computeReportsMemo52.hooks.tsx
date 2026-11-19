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

export function computeReportsMemo52(ctx: any) {
  const { scopedSubBranches, branches, scopedInvoices } = ctx;
  const __fn: any = () => {
    return scopedSubBranches.map((sb) => {
      const parentBranch = (branches || []).find((b) => b.id === sb.parentBranchId)
      const parentBranchName = parentBranch?.name || sb.parentBranchId || "Main Operating Branch"

      // Match invoices attributed to this sub-branch
      const matchedInvoices = scopedInvoices.filter((inv) => {
        const strSubBranchId = String(inv.subBranchId || "").toLowerCase().trim()
        const strSubBranchName = String(inv.subBranchName || "").toLowerCase().trim()
        const sbId = String(sb.id).toLowerCase().trim()
        const sbName = String(sb.name).toLowerCase().trim()

        return (
          (strSubBranchId && strSubBranchId === sbId) ||
          (strSubBranchName && strSubBranchName === sbName) ||
          ((inv as any).subBranch && String((inv as any).subBranch).toLowerCase().trim() === sbName)
        )
      })

      const totalInvoicedGross = matchedInvoices.reduce((sum, inv) => {
        const num = parseInt((inv.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
        return sum + num
      }, 0)

      const totalPaid = matchedInvoices.reduce((sum, inv) => {
        const num = parseInt((inv.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
        return sum + num
      }, 0)

      const totalDue = matchedInvoices.reduce((sum, inv) => {
        const num = parseInt((inv.due || "0").replace(/[^0-9]/g, "")) || 0
        return sum + num
      }, 0)

      const sharePct = sb.revenueSharePct ?? 30
      const companySharePct = 100 - sharePct
      const partnerEarnedGross = Math.round(totalInvoicedGross * (sharePct / 100))
      const companyRetainedGross = totalInvoicedGross - partnerEarnedGross

      const partnerEarnedRealized = Math.round(totalPaid * (sharePct / 100))
      const partnerPendingPayout = Math.round(totalDue * (sharePct / 100))

      return {
        ...sb,
        parentBranchName,
        invoicesCount: matchedInvoices.length,
        totalInvoicedGross,
        totalPaid,
        totalDue,
        sharePct,
        companySharePct,
        partnerEarnedGross,
        companyRetainedGross,
        partnerEarnedRealized,
        partnerPendingPayout,
        matchedInvoices,
      }
    })
  };
  return __fn();
}
