"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  X, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Receipt,
  Eye,
  Plus,
  RefreshCw,
  CreditCard,
  AlertTriangle
} from "lucide-react"
import { Subscription, InstallmentItem, SubscriptionStatus, calculateOverdueDetails } from "../types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { getInstallments } from "../services/subscriptionService"
import { useAuthStore } from "@/store/useAuthStore"
import { formatDisplayDate } from "@/lib/utils"
import { ClientSubscriptionLedgerModalSection1 } from "@/features/subscriptions/components/clientsubscriptionledgermodal-sections/ClientSubscriptionLedgerModalSection1"
import { ClientSubscriptionLedgerModalSection2 } from "@/features/subscriptions/components/clientsubscriptionledgermodal-sections/ClientSubscriptionLedgerModalSection2"


import { type ClientSubscriptionLedgerModalProps } from "@/features/subscriptions/components/clientsubscriptionledgermodal-sections/ClientSubscriptionLedgerModalHelpers"
export * from "@/features/subscriptions/components/clientsubscriptionledgermodal-sections/ClientSubscriptionLedgerModalHelpers"

export function ClientSubscriptionLedgerModal({
  isOpen,
  clientName,
  clientEmail,
  subscriptions,
  onClose,
  onGenerateInvoice,
  onRenewSubscription,
  onViewInvoice,
  onOpenCreateSub,
}: ClientSubscriptionLedgerModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { branches } = useAuthStore()
  const [activeTab, setActiveTab] = React.useState<"subscriptions" | "invoices" | "installments">("subscriptions")
  const [clientInvoices, setClientInvoices] = React.useState<InvoiceItem[]>([])
  const [clientInstallments, setClientInstallments] = React.useState<InstallmentItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)
  const [generatingSubId, setGeneratingSubId] = React.useState<string | null>(null)

  // Filter subscriptions for this specific client
  const matchedSubs = React.useMemo(() => {
    if (!clientName) return []
    const norm = clientName.toLowerCase().trim()
    return subscriptions.filter(s => {
      const sName = (s.clientName || "").toLowerCase().trim()
      const sEmail = (s.clientEmail || "").toLowerCase().trim()
      return sName === norm || (clientEmail && sEmail === clientEmail.toLowerCase().trim())
    })
  }, [clientName, clientEmail, subscriptions])

  // Load Invoices and Installments for this client
  React.useEffect(() => {
    if (!isOpen || !clientName) return

    let isMounted = true
    setIsLoadingHistory(true)

    const fetchHistory = async () => {
      try {
        const [allInvs, allInsts] = await Promise.all([
          getInvoices("all").catch(() => []),
          getInstallments("all").catch(() => []),
        ])

        if (!isMounted) return

        const norm = clientName.toLowerCase().trim()
        const normEmail = (clientEmail || "").toLowerCase().trim()

        const filteredInvs = (allInvs || []).filter((inv: InvoiceItem) => {
          const invClient = (inv.client || "").toLowerCase().trim()
          const invEmail = (inv.clientEmail || "").toLowerCase().trim()
          return invClient === norm || (normEmail && invEmail === normEmail)
        })

        const filteredInsts = (allInsts || []).filter((inst: InstallmentItem) => {
          const instClient = (inst.clientName || "").toLowerCase().trim()
          const instEmail = (inst.clientEmail || "").toLowerCase().trim()
          return instClient === norm || (normEmail && instEmail === normEmail)
        })

        setClientInvoices(filteredInvs)
        setClientInstallments(filteredInsts)
      } finally {
        if (isMounted) setIsLoadingHistory(false)
      }
    }

    fetchHistory()

    return () => {
      isMounted = false
    }
  }, [isOpen, clientName, clientEmail])

  // Financial Metrics Computations
  const metrics = React.useMemo(() => {
    const today = new Date().toISOString().split("T")[0]

    // 1. Invoices stats
    let totalInvoiced = 0
    let totalPaid = 0
    let totalDue = 0
    let overdueInvoicesCount = 0
    let overdueInvoicesAmount = 0

    clientInvoices.forEach(inv => {
      const invTotal = parseInt(String(inv.totalInvoiced || "0").replace(/[^0-9]/g, "")) || (inv.baseAmount || 0)
      const invPaid = parseInt(String(inv.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
      const invDue = parseInt(String(inv.due || "0").replace(/[^0-9]/g, "")) || Math.max(0, invTotal - invPaid)

      totalInvoiced += invTotal
      totalPaid += invPaid
      totalDue += invDue

      // Overdue check
      if (invDue > 0 && inv.status !== "Fully paid" && inv.dueDate && inv.dueDate < today) {
        overdueInvoicesCount++
        overdueInvoicesAmount += invDue
      }
    })

    // 2. Subscriptions overdue check
    let overdueSubsCount = 0
    let overdueSubsAmount = 0
    matchedSubs.forEach(s => {
      const numAmt = s.numericAmount || parseInt(String(s.amount).replace(/[^0-9]/g, "")) || 0
      if (s.status === "Past Due" || (s.nextBillingDate && s.nextBillingDate < today && s.status !== "Canceled")) {
        overdueSubsCount++
        overdueSubsAmount += numAmt
      }
    })

    // 3. Installments overdue check
    clientInstallments.forEach(inst => {
      (inst.schedule || []).forEach(item => {
        if (item.status === "Overdue" || (item.status === "Pending" && item.dueDate < today)) {
          overdueInvoicesCount++
          overdueInvoicesAmount += item.amount
        }
      })
    })

    const activeSubsCount = matchedSubs.filter(s => s.status === "Active").length
    const primaryClientObj = matchedSubs[0] || (clientInvoices[0] as any) || {}

    return {
      totalInvoiced,
      totalPaid,
      totalDue,
      overdueInvoicesCount: overdueInvoicesCount + overdueSubsCount,
      overdueInvoicesAmount: overdueInvoicesAmount + overdueSubsAmount,
      activeSubsCount,
      totalSubsCount: matchedSubs.length,
      email: clientEmail || (primaryClientObj as any).clientEmail || "N/A",
      phone: (primaryClientObj as any).clientPhone || "N/A",
      company: (primaryClientObj as any).clientCompany || (primaryClientObj as any).companyName || clientName,
      branchId: (primaryClientObj as any).branchId,
      branchName: (primaryClientObj as any).branchName,
    }
  }, [clientInvoices, matchedSubs, clientInstallments, clientEmail, clientName])

  if (!isOpen || !clientName) return null

  const handleGenInvoice = async (sub: Subscription) => {
    setGeneratingSubId(sub.id)
    try {
      await onGenerateInvoice(sub)
      // Refresh invoices list
      const allInvs = await getInvoices("all").catch(() => [])
      const norm = clientName.toLowerCase().trim()
      setClientInvoices((allInvs || []).filter((inv: InvoiceItem) => (inv.client || "").toLowerCase().trim() === norm))
    } finally {
      setGeneratingSubId(null)
    }
  }

  const getSubStatusBadge = (status: SubscriptionStatus) => {
    let style = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
    if (status === "Past Due") {
      style = "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse"
    } else if (status === "Expiring Soon") {
      style = "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800"
    } else if (status === "Canceled") {
      style = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
    }
    return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${style}`}>{status}</span>
  }

  const getInvoiceStatusBadge = (status: string, dueAmount: number, dueDate?: string) => {
    const isPastDue = dueAmount > 0 && dueDate && dueDate < new Date().toISOString().split("T")[0]
    if (isPastDue || status === "Overdue") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse flex items-center gap-1">
          <AlertTriangle size={10} />
          <span>Overdue</span>
        </span>
      )
    }
    if (status === "Fully paid" || status === "Paid") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800">
          Paid
        </span>
      )
    }
    if (status === "Partially paid") {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800">
          Partial
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold border bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700">
        Unpaid
      </span>
    )
  }

  
  __ctrl = { isOpen, clientName, clientEmail, subscriptions, onClose, onGenerateInvoice, onRenewSubscription, onViewInvoice, onOpenCreateSub, branches, activeTab, setActiveTab, clientInvoices, setClientInvoices, clientInstallments, setClientInstallments, isLoadingHistory, setIsLoadingHistory, generatingSubId, setGeneratingSubId, matchedSubs, metrics, handleGenInvoice, getSubStatusBadge, getInvoiceStatusBadge };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        <ClientSubscriptionLedgerModalSection1 ctrl={__ctrl} />
        <ClientSubscriptionLedgerModalSection2 ctrl={__ctrl} />

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
          <div className="text-[11px] text-zinc-500">
            {metrics.activeSubsCount} active plans • {clientInvoices.length} invoices generated
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold text-xs transition-colors cursor-pointer"
          >
            Close Ledger
          </button>
        </div>
      </motion.div>
    </div>
  )
}
