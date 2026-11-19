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

export function computeReportsMemo51(ctx: any) {
  const { scopedInvoices, invoiceSubFilter, clientMap, invoiceSearchQuery } = ctx;
  const __fn: any = () => {
    return scopedInvoices.filter((inv) => {
      // Sub-filter
      if (invoiceSubFilter === "gst") {
        const isGst = (typeof inv.gstRate === "number" && inv.gstRate > 0) || (typeof inv.gstAmount === "number" && inv.gstAmount > 0) || Boolean(clientMap[inv.client.toLowerCase().trim()]?.gstNumber)
        if (!isGst) return false
      } else if (invoiceSubFilter === "non_gst") {
        const isGst = (typeof inv.gstRate === "number" && inv.gstRate > 0) || (typeof inv.gstAmount === "number" && inv.gstAmount > 0) || Boolean(clientMap[inv.client.toLowerCase().trim()]?.gstNumber)
        if (isGst) return false
      } else if (invoiceSubFilter === "due") {
        const dueNum = parseInt((inv.due || "0").replace(/[^0-9]/g, "")) || 0
        if (dueNum <= 0 && inv.status === "Fully paid") return false
      } else if (invoiceSubFilter === "paid") {
        if (inv.status !== "Fully paid") return false
      } else if (invoiceSubFilter === "partially_paid") {
        if (inv.status !== "Partially paid") return false
      }

      // Search Query
      if (invoiceSearchQuery.trim()) {
        const q = invoiceSearchQuery.toLowerCase().trim()
        const clientGst = (clientMap[String(inv.client || "").toLowerCase().trim()]?.gstNumber || "").toLowerCase()
        const match =
          String(inv.id || "").toLowerCase().includes(q) ||
          String(inv.invoiceNumber || "").toLowerCase().includes(q) ||
          String(inv.client || "").toLowerCase().includes(q) ||
          (inv.project || "").toLowerCase().includes(q) ||
          (inv.branchName || "").toLowerCase().includes(q) ||
          clientGst.includes(q)
        if (!match) return false
      }

      return true
    })
  };
  return __fn();
}
