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
import { getUsers, getUserAvatar } from "../users/services/userService"
import { getInvoices, InvoiceItem, parseCurrencyNumber } from "@/features/invoice/services/invoiceService"
import { getPayments, PaymentItem } from "@/features/payments/services/paymentService"
import { fetchModuleDataFromDB, filterGlobalDeletedItems, isGlobalItemDeleted } from "@/lib/storageSync"
import { getClients } from "../clients/services/clientService"
import { ClientItem } from "../clients/types"
import { taskService } from "../tasks/services/taskService"
import { Task } from "../tasks/types"
import { getLeads } from "../leads/services/leadService"
import { Lead } from "../leads/types"
import { getSubscriptions } from "../subscriptions/services/subscriptionService"
import { Subscription, BillingCycle } from "../subscriptions/types"
import { getProjects } from "../projects/services/projectService"
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
export * from "@/features/reports/components/reports-sections/ReportsHelpers"
import { createReportsAction20 } from "@/features/reports/hooks/reports-hooks/createReportsAction20.hooks"
import { computeReportsMemo50 } from "@/features/reports/hooks/reports-hooks/computeReportsMemo50.hooks"
import { computeReportsMemo51 } from "@/features/reports/hooks/reports-hooks/computeReportsMemo51.hooks"
import { computeReportsMemo52 } from "@/features/reports/hooks/reports-hooks/computeReportsMemo52.hooks"



export default function ReportsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, branches, subBranches, fetchSubBranches, activeCompanyId, activeBranchId } = useAuthStore()
  
  const isSuperAdmin = user?.role === "Super Admin"
  const isAdmin = user?.role === "Admin"
  const isTeamOrBranchAdmin = !isSuperAdmin && !isAdmin

  // Allowed companies for current user (Super Admin has all; Admin has assigned)
  const allowedCompanies = React.useMemo(() => {
    if (isSuperAdmin) return companies
    const userCompIds = (user?.companyIds && user.companyIds.length > 0)
      ? user.companyIds
      : [user?.companyId || "tech"]
    return companies.filter((c) => userCompIds.some((id) => isMatchingCompany(c, id)))
  }, [isSuperAdmin, companies, user])

  // Active Company Selection
  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(
    activeCompanyId || (isSuperAdmin ? "all" : user?.companyId || "tech")
  )

  // Active Branches available for the selected company
  const availableBranches = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    if (selectedCompanyId && selectedCompanyId !== "all") {
      return branches.filter((b) => isMatchingCompany({ id: b.companyId, slug: b.companyId } as any, selectedCompanyId))
    }
    return branches
  }, [branches, selectedCompanyId])

  // User's default or assigned branch
  const userAssignedBranchId = user?.branchId || ""
  const userAssignedBranchName = user?.branchName || ""

  // Selected Branch state
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(() => {
    if (activeBranchId) return activeBranchId
    if (isSuperAdmin) return "all"
    if (userAssignedBranchId) return userAssignedBranchId
    return "all"
  })

  // Auto-reset branch to "all" if selected branch is not in the newly available branches
  React.useEffect(() => {
    if (selectedBranchId !== "all" && !isTeamOrBranchAdmin) {
      const isStillAvailable = availableBranches.some(b => 
        String(b.id).toLowerCase().trim() === selectedBranchId.toLowerCase().trim() ||
        String(b.name).toLowerCase().trim() === selectedBranchId.toLowerCase().trim()
      )
      if (!isStillAvailable) {
        setSelectedBranchId("all")
      }
    }
  }, [availableBranches, selectedBranchId, isTeamOrBranchAdmin])

  // Sync activeCompanyId & activeBranchId from auth store if changed
  React.useEffect(() => {
    if (activeCompanyId) {
      if (isSuperAdmin) {
        setSelectedCompanyId(activeCompanyId)
      } else if (allowedCompanies.some(c => isMatchingCompany(c, activeCompanyId))) {
        setSelectedCompanyId(activeCompanyId)
      }
    }
  }, [activeCompanyId, isSuperAdmin, allowedCompanies])

  React.useEffect(() => {
    if (activeBranchId) {
      setSelectedBranchId(activeBranchId)
    } else if (isSuperAdmin && !selectedBranchId) {
      setSelectedBranchId("all")
    }
  }, [activeBranchId, isSuperAdmin])

  const [activeTab, setActiveTab] = React.useState<ReportTab>("revenue")
  const [invoiceSubFilter, setInvoiceSubFilter] = React.useState<InvoiceFilterType>("all")
  const [subscriptionSubFilter, setSubscriptionSubFilter] = React.useState<SubscriptionFilterType>("all")
  const [invoiceSearchQuery, setInvoiceSearchQuery] = React.useState("")
  const [subscriptionSearchQuery, setSubscriptionSearchQuery] = React.useState("")
  const [dateRange, setDateRange] = React.useState("all_time")

  const [users, setUsers] = React.useState<any[]>([])
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([])
  const [payments, setPayments] = React.useState<PaymentItem[]>([])
  const [clients, setClients] = React.useState<ClientItem[]>([])
  const [expenses, setExpenses] = React.useState<any[]>([])
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [leads, setLeads] = React.useState<Lead[]>([])
  const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([])
  const [projects, setProjects] = React.useState<any[]>([])
  const [viewingForm9Pkg, setViewingForm9Pkg] = React.useState<any | null>(null)
  const [marketingSearchQuery, setMarketingSearchQuery] = React.useState("")
  const [marketingPlanFilter, setMarketingPlanFilter] = React.useState("all")

  const targetComp = selectedCompanyId || activeCompanyId || user?.companyId || "tech"

  const loadData: any = createReportsAction20(() => __ctrlRef.current);

  React.useEffect(() => {
    loadData()
    fetchSubBranches().catch(() => {})
    window.addEventListener("storage", loadData)
    window.addEventListener("saampark_data_synced", loadData)
    window.addEventListener("saampark_company_switched", loadData)
    window.addEventListener("saampark_subbranches_updated", loadData)
    window.addEventListener("saampark_invoices_updated", loadData)
    window.addEventListener("saampark_clients_updated", loadData)
    window.addEventListener("saampark_payments_updated", loadData)
    window.addEventListener("saampark_subscriptions_updated", loadData)
    window.addEventListener("saampark_projects_updated", loadData)
    return () => {
      window.removeEventListener("storage", loadData)
      window.removeEventListener("saampark_data_synced", loadData)
      window.removeEventListener("saampark_company_switched", loadData)
      window.removeEventListener("saampark_subbranches_updated", loadData)
      window.removeEventListener("saampark_invoices_updated", loadData)
      window.removeEventListener("saampark_clients_updated", loadData)
      window.removeEventListener("saampark_payments_updated", loadData)
      window.removeEventListener("saampark_subscriptions_updated", loadData)
      window.removeEventListener("saampark_projects_updated", loadData)
    }
  }, [loadData, fetchSubBranches])

  // Helper map for client GSTIN and Branch details
  const clientMap = React.useMemo(() => {
    const map: Record<string, ClientItem> = {}
    clients.forEach((c) => {
      if (c.name) map[c.name.toLowerCase().trim()] = c
    })
    return map
  }, [clients])

  // Branch map for quick lookup
  const branchMap = React.useMemo(() => {
    const map: Record<string, string> = {}
    ;(branches || []).forEach((b) => {
      if (b.id) map[b.id] = b.name
    })
    return map
  }, [branches])

  // ── Canonical Matching Helpers ──────────────────────────────────────────
  const targetBranch = isTeamOrBranchAdmin && userAssignedBranchId ? userAssignedBranchId : selectedBranchId

  const itemMatchesCompany = React.useCallback(
    (itemCompId: string | number | null | undefined, targetCompId: string) => {
      if (!targetCompId || targetCompId === "all") return true
      const canonTarget = getCanonicalCompanyId(targetCompId)
      const canonItem = getCanonicalCompanyId(itemCompId || "tech")
      return canonItem === canonTarget
    },
    []
  )

  const itemMatchesBranch = React.useCallback(
    (
      itemBranchId: string | number | null | undefined,
      itemBranchName: string | null | undefined,
      targetBranchVal: string,
      fallbackClientBranchId?: string | null,
      fallbackClientBranchName?: string | null
    ) => {
      if (!targetBranchVal || targetBranchVal === "all") return true

      const targetBranchObj = branches.find(
        (b) =>
          String(b.id).toLowerCase().trim() === String(targetBranchVal).toLowerCase().trim() ||
          String(b.name).toLowerCase().trim() === String(targetBranchVal).toLowerCase().trim()
      )
      const targetIdNorm = String(targetBranchObj?.id || targetBranchVal).toLowerCase().trim()
      const targetNameNorm = String(targetBranchObj?.name || targetBranchVal).toLowerCase().trim()

      const effBranchId = String(itemBranchId || fallbackClientBranchId || "").toLowerCase().trim()
      const effBranchName = String(itemBranchName || fallbackClientBranchName || "").toLowerCase().trim()

      return (
        (effBranchId && (effBranchId === targetIdNorm || effBranchId === targetNameNorm)) ||
        (effBranchName && (effBranchName === targetNameNorm || effBranchName === targetIdNorm))
      )
    },
    [branches]
  )

  // ── Scoped Invoices Filter ────────────────────────────────────────────────
  const scopedInvoices = React.useMemo(() => {
    return invoices.filter((inv) => {
      // 1. Strict Company Scoping
      if (!itemMatchesCompany(inv.companyId, selectedCompanyId)) return false

      // 2. Strict Branch Scoping
      const clientInfo = clientMap[(inv.client || "").toLowerCase().trim()]
      if (!itemMatchesBranch(inv.branchId, inv.branchName, targetBranch, clientInfo?.branchId, clientInfo?.branchName)) {
        return false
      }

      return true
    })
  }, [invoices, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch, clientMap])

  // ── Scoped Payments Filter ────────────────────────────────────────────────
  const scopedPayments = React.useMemo(() => {
    return payments.filter((p) => {
      if (!itemMatchesCompany(p.companyId, selectedCompanyId)) return false
      if (!itemMatchesBranch(p.branchId || (p as any).branch_id, p.branchName || (p as any).branch_name, targetBranch)) {
        return false
      }
      return true
    })
  }, [payments, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch])

  // ── Scoped Leads Filter ───────────────────────────────────────────────────
  const scopedLeads = React.useMemo(() => {
    return leads.filter((l) => {
      if (!itemMatchesCompany(l.companyId, selectedCompanyId)) return false
      const lBranchId = l.branchId || (l as any).assignedBranchId || (l as any).branch_id
      const lBranchName = l.branchName || (l as any).assignedBranchName || (l as any).branch_name
      if (!itemMatchesBranch(lBranchId, lBranchName, targetBranch)) {
        return false
      }
      return true
    })
  }, [leads, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch])

  // ── Scoped Subscriptions Filter ───────────────────────────────────────────
  const scopedSubscriptions = React.useMemo(() => {
    return subscriptions.filter((s) => {
      if (!itemMatchesCompany(s.companyId || (s as any).company, selectedCompanyId)) return false
      const clientInfo = clientMap[(s.clientName || "").toLowerCase().trim()]
      if (!itemMatchesBranch(s.branchId, s.branchName, targetBranch, clientInfo?.branchId, clientInfo?.branchName)) {
        return false
      }
      return true
    })
  }, [subscriptions, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch, clientMap])

  // ── Scoped Expenses Filter ────────────────────────────────────────────────
  const scopedExpenses = React.useMemo(() => {
    return expenses.filter((e) => {
      if (!itemMatchesCompany(e.companyId, selectedCompanyId)) return false
      if (!itemMatchesBranch(e.branchId || (e as any).branch_id, e.branchName || (e as any).branch_name, targetBranch)) {
        return false
      }
      return true
    })
  }, [expenses, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch])

  // ── Scoped Users Filter ───────────────────────────────────────────────────
  const scopedUsers = React.useMemo(() => {
    return users
      .filter((u) => u.role !== "Clients" && u.status !== "Inactive")
      .filter((u) => {
        if (selectedCompanyId && selectedCompanyId !== "all") {
          const uCompIds = (u.companyIds && u.companyIds.length > 0)
            ? u.companyIds.map((id: string) => getCanonicalCompanyId(id))
            : [getCanonicalCompanyId(u.companyId || "tech")]
          if (!uCompIds.includes(getCanonicalCompanyId(selectedCompanyId))) return false
        }
        if (targetBranch && targetBranch !== "all") {
          if (!itemMatchesBranch(u.branchId, u.branchName, targetBranch)) return false
        }
        return true
      })
  }, [users, selectedCompanyId, targetBranch, itemMatchesBranch])

  // ── Scoped Tasks Filter ───────────────────────────────────────────────────
  const scopedTasks = React.useMemo(() => {
    return tasks.filter((t) => {
      if (!itemMatchesCompany(t.companyId, selectedCompanyId)) return false
      if (!itemMatchesBranch(t.branchId, (t as any).branchName, targetBranch)) return false
      return true
    })
  }, [tasks, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch])

  // ── Scoped Projects Filter ───────────────────────────────────────────────────
  const scopedProjects = React.useMemo(() => {
    return projects.filter((p) => {
      if (!itemMatchesCompany(p.companyId, selectedCompanyId)) return false
      if (!itemMatchesBranch(p.branchId, (p as any).branchName, targetBranch)) return false
      return true
    })
  }, [projects, selectedCompanyId, targetBranch, itemMatchesCompany, itemMatchesBranch])

  // ── Scoped Digital Marketing Campaigns ─────────────────────────────────────
  const scopedMarketingCampaigns = React.useMemo(() => {
    return scopedProjects.filter((p) => {
      const isMkt = 
        p.projectType === "Digital Marketing Campaign" ||
        Boolean((p as any).marketingPackage?.enabled) ||
        (Array.isArray(p.labels) && p.labels.includes("Digital Marketing")) ||
        String((p as any).category || "").toLowerCase().includes("marketing")
      if (!isMkt) return false

      if (marketingPlanFilter !== "all") {
        const plan = String((p as any).marketingPackage?.planName || "").toLowerCase()
        if (!plan.includes(marketingPlanFilter.toLowerCase())) return false
      }

      if (marketingSearchQuery.trim()) {
        const q = marketingSearchQuery.toLowerCase().trim()
        const matchTitle = String(p.title || "").toLowerCase().includes(q)
        const matchClient = String(p.client || "").toLowerCase().includes(q)
        if (!matchTitle && !matchClient) return false
      }

      return true
    })
  }, [scopedProjects, marketingPlanFilter, marketingSearchQuery])

  // Metrics for Digital Marketing
  const marketingKPIs: any = React.useMemo(() => computeReportsMemo50({ scopedMarketingCampaigns }), [scopedMarketingCampaigns]);

  // Helper to normalize amount to Monthly Recurring Revenue (MRR)
  const getSubscriptionMRR = (sub: Subscription): number => {
    const rawAmt = sub.numericAmount || parseInt(String(sub.amount || "0").replace(/[^0-9]/g, "")) || 0
    if (rawAmt <= 0) return 0
    switch (sub.billingCycle) {
      case "Daily": return Math.round(rawAmt * 30)
      case "Weekly": return Math.round(rawAmt * 4.33)
      case "Monthly": return rawAmt
      case "Quarterly": return Math.round(rawAmt / 3)
      case "Half-Yearly": return Math.round(rawAmt / 6)
      case "Annually": return Math.round(rawAmt / 12)
      case "Custom Days": return Math.round((rawAmt / (sub.customDaysCount || 30)) * 30)
      default: return rawAmt
    }
  }

  // Subscriptions KPIs
  const totalSubsCount = scopedSubscriptions.length
  const activeSubs = scopedSubscriptions.filter(s => s.status === "Active")
  const activeSubsCount = activeSubs.length
  const expiringSoonSubsCount = scopedSubscriptions.filter(s => s.status === "Expiring Soon").length
  const pastDueSubsCount = scopedSubscriptions.filter(s => s.status === "Past Due").length
  const canceledSubsCount = scopedSubscriptions.filter(s => s.status === "Canceled").length

  // Subscriptions by Model
  const packageSubs = scopedSubscriptions.filter(s => s.subscriptionType === "package")
  const regularSubs = scopedSubscriptions.filter(s => !s.subscriptionType || s.subscriptionType === "regular")
  const emiSubs = scopedSubscriptions.filter(s => s.subscriptionType === "emi")

  // MRR & ARR Calculations
  const totalMRR = activeSubs.reduce((sum, s) => sum + getSubscriptionMRR(s), 0)
  const totalARR = totalMRR * 12
  const totalSubContractValue = scopedSubscriptions.reduce((sum, s) => {
    return sum + (s.numericAmount || parseInt(String(s.amount || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)

  // Renewals in next 30 days
  const upcomingRenewals = scopedSubscriptions.filter(s => {
    if (!s.nextBillingDate) return false
    const now = Date.now()
    const dMs = new Date(s.nextBillingDate).getTime()
    return !isNaN(dMs) && dMs >= now - (24 * 60 * 60 * 1000) && dMs <= now + 30 * 24 * 60 * 60 * 1000
  })
  const upcomingRenewalsAmount = upcomingRenewals.reduce((sum, s) => {
    return sum + (s.numericAmount || parseInt(String(s.amount || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)

  // Filtered Subscriptions for Table
  const filteredTableSubscriptions = React.useMemo(() => {
    return scopedSubscriptions.filter((sub) => {
      if (subscriptionSubFilter === "package" && sub.subscriptionType !== "package") return false
      if (subscriptionSubFilter === "regular" && (sub.subscriptionType && sub.subscriptionType !== "regular")) return false
      if (subscriptionSubFilter === "emi" && sub.subscriptionType !== "emi") return false
      if (subscriptionSubFilter === "active" && sub.status !== "Active") return false
      if (subscriptionSubFilter === "expiring_soon" && sub.status !== "Expiring Soon") return false
      if (subscriptionSubFilter === "past_due" && sub.status !== "Past Due") return false
      if (subscriptionSubFilter === "canceled" && sub.status !== "Canceled") return false

      if (subscriptionSearchQuery.trim()) {
        const q = subscriptionSearchQuery.toLowerCase().trim()
        const match =
          (sub.planName || "").toLowerCase().includes(q) ||
          (sub.clientName || "").toLowerCase().includes(q) ||
          (sub.clientCompany || "").toLowerCase().includes(q) ||
          (sub.clientEmail || "").toLowerCase().includes(q) ||
          (sub.branchName || "").toLowerCase().includes(q) ||
          (sub.packageCategory || "").toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [scopedSubscriptions, subscriptionSubFilter, subscriptionSearchQuery])

  // ── GST vs Non-GST Invoices Categorization & Metrics ──────────────────────
  const gstInvoices = React.useMemo(() => {
    return scopedInvoices.filter((i) => {
      const rate = typeof i.gstRate === "number" ? i.gstRate : 0
      const gstAmt = typeof i.gstAmount === "number" ? i.gstAmount : 0
      const hasGstInClient = Boolean(clientMap[i.client.toLowerCase().trim()]?.gstNumber)
      return rate > 0 || gstAmt > 0 || hasGstInClient
    })
  }, [scopedInvoices, clientMap])

  const nonGstInvoices = React.useMemo(() => {
    return scopedInvoices.filter((i) => {
      const rate = typeof i.gstRate === "number" ? i.gstRate : 0
      const gstAmt = typeof i.gstAmount === "number" ? i.gstAmount : 0
      const hasGstInClient = Boolean(clientMap[i.client.toLowerCase().trim()]?.gstNumber)
      return rate === 0 && gstAmt === 0 && !hasGstInClient
    })
  }, [scopedInvoices, clientMap])

  // Calculations: Total Invoices
  const totalBillsCount = scopedInvoices.length
  const totalInvoicedSum = scopedInvoices.reduce((sum, i) => {
    return sum + (parseInt((i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)

  // Calculations: GST Bills
  const totalGstBillsCount = gstInvoices.length
  const totalGstInvoicedSum = gstInvoices.reduce((sum, i) => {
    return sum + (parseInt((i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)
  const totalGstTaxAmountSum = gstInvoices.reduce((sum, i) => {
    if (typeof i.gstAmount === "number" && i.gstAmount > 0) return sum + i.gstAmount
    const total = parseInt((i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
    const rate = i.gstRate || 18
    const base = Math.round(total / (1 + rate / 100))
    return sum + (total - base)
  }, 0)
  const totalGstBaseAmountSum = totalGstInvoicedSum - totalGstTaxAmountSum
  const cgstCollected = Math.round(totalGstTaxAmountSum / 2)
  const sgstCollected = Math.round(totalGstTaxAmountSum / 2)

  // Calculations: Non-GST Bills
  const totalNonGstBillsCount = nonGstInvoices.length
  const totalNonGstInvoicedSum = nonGstInvoices.reduce((sum, i) => {
    return sum + (parseInt((i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)

  // Calculations: Payments & Dues
  const totalCollectedSum = scopedInvoices.reduce((sum, i) => {
    return sum + (parseInt((i.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)
  const totalDueSum = scopedInvoices.reduce((sum, i) => {
    return sum + (parseInt((i.due || "0").replace(/[^0-9]/g, "")) || 0)
  }, 0)
  const paymentPendingCount = scopedInvoices.filter(
    (i) => i.status === "Not paid" || i.status === "Partially paid" || i.status === "Payment Pending"
  ).length
  const fullyPaidCount = scopedInvoices.filter((i) => i.status === "Fully paid").length
  const partiallyPaidCount = scopedInvoices.filter((i) => i.status === "Partially paid").length

  // ── GST Slab Distribution (18%, 12%, 5%, 0%) ──────────────────────────────
  const gstSlabs = React.useMemo(() => {
    const slabs: Record<number, { count: number; base: number; tax: number; total: number }> = {
      18: { count: 0, base: 0, tax: 0, total: 0 },
      12: { count: 0, base: 0, tax: 0, total: 0 },
      5: { count: 0, base: 0, tax: 0, total: 0 },
      0: { count: 0, base: 0, tax: 0, total: 0 },
    }

    scopedInvoices.forEach((i) => {
      const rate = typeof i.gstRate === "number" ? i.gstRate : 0
      const total = parseInt((i.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
      const tax = typeof i.gstAmount === "number" && i.gstAmount > 0 
        ? i.gstAmount 
        : rate > 0 ? Math.round(total - total / (1 + rate / 100)) : 0
      const base = total - tax

      const matchedRate = rate === 12 ? 12 : rate === 5 ? 5 : rate > 0 ? 18 : 0
      if (!slabs[matchedRate]) slabs[matchedRate] = { count: 0, base: 0, tax: 0, total: 0 }
      slabs[matchedRate].count += 1
      slabs[matchedRate].base += base
      slabs[matchedRate].tax += tax
      slabs[matchedRate].total += total
    })

    return slabs
  }, [scopedInvoices])

  // ── Table Filtering & Search ──────────────────────────────────────────────
  const filteredTableInvoices: any = React.useMemo(() => computeReportsMemo51({ scopedInvoices, invoiceSubFilter, clientMap, invoiceSearchQuery }), [scopedInvoices, invoiceSubFilter, invoiceSearchQuery, clientMap]);

  // ── User Productivity Calculation ─────────────────────────────────────────
  const userProductivity = React.useMemo(() => {
    if (!scopedUsers || scopedUsers.length === 0) return []
    return scopedUsers.map((u) => {
      const uName = (u.name || "").toLowerCase().trim()
      const uEmail = (u.email || "").toLowerCase().trim()
      const assigned = scopedTasks.filter((t) => {
        const a = (t.assignedTo || "").toLowerCase().trim()
        const c = (t.collaborators || "").toLowerCase().trim()
        return a === uName || a === uEmail || (uName && a.includes(uName)) || c.includes(uName) || c.includes(uEmail)
      })
      const completed = assigned.filter((t) => t.status === "Done")
      const rate = assigned.length > 0 ? Math.round((completed.length / assigned.length) * 100) : 100
      return {
        name: u.name,
        role: u.role || "Team Member",
        department: u.department || "Operations",
        branchName: u.branchName || branchMap[u.branchId || ""] || "-",
        assigned: assigned.length,
        completed: completed.length,
        rate: `${rate}%`,
        avgTime: "4.0 hrs",
      }
    })
  }, [scopedUsers, scopedTasks, branchMap])

  // ── Sub-Branch Performance & Percentage Revenue Share Calculations ─────────
  const scopedSubBranches = React.useMemo(() => {
    let list = subBranches || []
    if (selectedCompanyId && selectedCompanyId !== "all") {
      list = list.filter((sb) => {
        const parent = (branches || []).find((b) => b.id === sb.parentBranchId)
        const pComp = parent?.companyId || sb.companyId || "tech"
        return itemMatchesCompany(pComp, selectedCompanyId)
      })
    }
    if (targetBranch && targetBranch !== "all") {
      list = list.filter((sb) => {
        return (
          String(sb.parentBranchId).toLowerCase().trim() === targetBranch.toLowerCase().trim() ||
          String((sb as any).branchId || "").toLowerCase().trim() === targetBranch.toLowerCase().trim()
        )
      })
    }
    return list
  }, [subBranches, branches, selectedCompanyId, targetBranch, itemMatchesCompany])

  const subBranchReportData: any = React.useMemo(() => computeReportsMemo52({ scopedSubBranches, branches, scopedInvoices }), [scopedSubBranches, branches, scopedInvoices]);

  const totalSubBranchGrossVolume = subBranchReportData.reduce((sum, sb) => sum + sb.totalInvoicedGross, 0)
  const totalCompanyRetainedFromSubBranches = subBranchReportData.reduce((sum, sb) => sum + sb.companyRetainedGross, 0)
  const totalPartnerPayoutAccrued = subBranchReportData.reduce((sum, sb) => sum + sb.partnerEarnedGross, 0)
  const totalPartnerPayoutRealized = subBranchReportData.reduce((sum, sb) => sum + sb.partnerEarnedRealized, 0)

  // ── CSV / Excel Export ────────────────────────────────────────────────────
  const handleExportCSV: any = createReportsHandler1(() => __ctrlRef.current);

  
  __ctrl = { user, companies, branches, subBranches, fetchSubBranches, activeCompanyId, activeBranchId, isSuperAdmin, isAdmin, isTeamOrBranchAdmin, allowedCompanies, selectedCompanyId, setSelectedCompanyId, availableBranches, userAssignedBranchId, userAssignedBranchName, selectedBranchId, setSelectedBranchId, activeTab, setActiveTab, invoiceSubFilter, setInvoiceSubFilter, subscriptionSubFilter, setSubscriptionSubFilter, invoiceSearchQuery, setInvoiceSearchQuery, subscriptionSearchQuery, setSubscriptionSearchQuery, dateRange, setDateRange, users, setUsers, invoices, setInvoices, payments, setPayments, clients, setClients, expenses, setExpenses, tasks, setTasks, leads, setLeads, subscriptions, setSubscriptions, projects, setProjects, viewingForm9Pkg, setViewingForm9Pkg, marketingSearchQuery, setMarketingSearchQuery, marketingPlanFilter, setMarketingPlanFilter, targetComp, loadData, clientMap, branchMap, targetBranch, itemMatchesCompany, itemMatchesBranch, scopedInvoices, scopedPayments, scopedLeads, scopedSubscriptions, scopedExpenses, scopedUsers, scopedTasks, scopedProjects, scopedMarketingCampaigns, marketingKPIs, getSubscriptionMRR, totalSubsCount, activeSubs, activeSubsCount, expiringSoonSubsCount, pastDueSubsCount, canceledSubsCount, packageSubs, regularSubs, emiSubs, totalMRR, totalARR, totalSubContractValue, upcomingRenewals, upcomingRenewalsAmount, filteredTableSubscriptions, gstInvoices, nonGstInvoices, totalBillsCount, totalInvoicedSum, totalGstBillsCount, totalGstInvoicedSum, totalGstTaxAmountSum, totalGstBaseAmountSum, cgstCollected, sgstCollected, totalNonGstBillsCount, totalNonGstInvoicedSum, totalCollectedSum, totalDueSum, paymentPendingCount, fullyPaidCount, partiallyPaidCount, gstSlabs, filteredTableInvoices, userProductivity, scopedSubBranches, subBranchReportData, totalSubBranchGrossVolume, totalCompanyRetainedFromSubBranches, totalPartnerPayoutAccrued, totalPartnerPayoutRealized, handleExportCSV };
  __ctrlRef.current = __ctrl;
return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <ReportsSection1 ctrl={__ctrl} />
      <ReportsSection2 ctrl={__ctrl} />

      {/* ── TAB: DIGITAL MARKETING & ADS CAMPAIGN HUB (FORM NO - 9) ───────── */}
      <ReportsSection3 ctrl={__ctrl} />

      {/* ── TAB: SUBSCRIPTIONS & RECURRING REVENUE REPORT ───────────────────── */}
      <ReportsSection4 ctrl={__ctrl} />

      <ReportsSection5 ctrl={__ctrl} />

      <ReportsSection6 ctrl={__ctrl} />
    </motion.div>
  )
}
