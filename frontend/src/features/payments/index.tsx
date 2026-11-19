"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, 
  Download, 
  CreditCard, 
  Search, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  Printer, 
  Trash2, 
  X, 
  Send, 
  Eye,
  TrendingUp,
  Receipt
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { formatDisplayDate } from "@/lib/utils"
import { Tabs } from "@/components/ui/Tabs"
import { useAuthStore } from "@/store/useAuthStore"
import { getPayments, addPayment, deletePayment, PaymentItem } from "./services/paymentService"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"

import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { isRecordAssignedToClient, isRecordAssignedToTeamMember } from "@/lib/clientScopeUtils"
import { usePermissionStore } from "@/store/usePermissionStore"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { PaymentsSection1 } from "@/features/payments/components/payments-sections/PaymentsSection1"
import { PaymentsSection2 } from "@/features/payments/components/payments-sections/PaymentsSection2"


export default function PaymentsPage() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const canViewPayment = canPerformAction(user, "Payments", "view")
  const canAddPayment = canPerformAction(user, "Payments", "add")
  const canEditPayment = canPerformAction(user, "Payments", "edit")
  const canDeletePayment = canPerformAction(user, "Payments", "delete")

  const isClientRole = user?.role === "Clients"
  const clientEmailNorm = (user?.email || "").toLowerCase().trim()
  const clientNameNorm = (user?.name || "").toLowerCase().trim()

  const [activeTab, setActiveTab] = React.useState("list")
  const [payments, setPayments] = React.useState<PaymentItem[]>([])
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([])
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = React.useState(false)
  const [selectedPayment, setSelectedPayment] = React.useState<PaymentItem | null>(null)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Add Payment Form State
  const [selectedInvoiceId, setSelectedInvoiceId] = React.useState("")
  const [client, setClient] = React.useState("")
  const [clientEmail, setClientEmail] = React.useState("")
  const [project, setProject] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [paymentMethod, setPaymentMethod] = React.useState("UPI / Net Banking")
  const [transactionRef, setTransactionRef] = React.useState("")
  const [paymentDate, setPaymentDate] = React.useState("")
  const [note, setNote] = React.useState("")

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  const loadData = React.useCallback(async () => {
    const targetComp = activeCompanyId || user?.companyId || "tech"
    const [pList, invList] = await Promise.all([
      getPayments(targetComp),
      getInvoices(targetComp)
    ])
    setPayments(pList)
    setInvoices(invList)
  }, [activeCompanyId, user?.companyId])

  React.useEffect(() => {
    loadData()
    window.addEventListener("saampark_data_synced", loadData)
    window.addEventListener("saampark_payments_updated", loadData)
    window.addEventListener("saampark_company_switched", loadData)
    window.addEventListener("saampark_branch_switched", loadData)
    return () => {
      window.removeEventListener("saampark_data_synced", loadData)
      window.removeEventListener("saampark_payments_updated", loadData)
      window.removeEventListener("saampark_company_switched", loadData)
      window.removeEventListener("saampark_branch_switched", loadData)
    }
  }, [loadData])


  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId)
    const target = invoices.find(i => i.id === invId)
    if (target) {
      setClient(target.client)
      setClientEmail(target.clientEmail || "")
      setProject(target.project)
      const dueVal = target.due && target.due !== "₹0" ? target.due : target.totalInvoiced
      setAmount(dueVal.replace(/[^0-9]/g, ""))
    }
  }

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client || !amount) {
      alert("Please provide client and amount.")
      return
    }

    const numAmount = parseInt(amount.replace(/[^0-9]/g, "")) || 0
    const formattedAmount = `₹${numAmount.toLocaleString("en-IN")}`

    await addPayment({
      invoiceId: selectedInvoiceId || "Custom Payment",
      client,
      clientEmail: clientEmail || `${client.toLowerCase().replace(/\s+/g, '')}@example.com`,
      project: project || "Consulting & Services",
      paymentDate: paymentDate || new Date().toLocaleDateString("en-GB"),
      paymentMethod,
      transactionRef: transactionRef || `TXN${Date.now()}`,
      note: note || `Payment received for ${client}`,
      amount: formattedAmount,
      amountNum: numAmount,
      status: "Completed"
    })

    showToast(`✅ Payment of ${formattedAmount} recorded successfully!`)
    setIsAddPaymentModalOpen(false)
    // reset
    setSelectedInvoiceId("")
    setClient("")
    setClientEmail("")
    setProject("")
    setAmount("")
    setTransactionRef("")
    setNote("")
    loadData()
  }

  const handleDeletePayment = async (id: string) => {
    if (isClientRole || !canDeletePayment) {
      alert("Permission Denied: Clients cannot delete payment records.")
      return
    }
    const payment = payments.find(p => p.id === id)
    const label = payment ? `${payment.id} (${payment.amount || ''} from ${payment.client || 'Client'})` : id
    if (await confirmTwoStepDelete(label, "payment record")) {
      await deletePayment(id)
      setPayments(prev => prev.filter(p => p.id !== id))
      showToast("Payment record removed.")
    }
  }

  const displayedPayments = React.useMemo(() => {
    const { activeCompanyId: freshComp, activeBranchId: freshBranch, activeSubBranchId: freshSubBranch, branches: freshBranches, subBranches: freshSubBranches } = useAuthStore.getState()
    const userComp = (freshComp || user?.companyId || "").toLowerCase().trim()
    const targetBranch = freshBranch || (user?.role !== "Super Admin" && user?.role !== "Admin" ? user?.branchId : null)

    const targetBranchObj = (freshBranches || []).find(b => b.id === targetBranch || b.name.toLowerCase() === (targetBranch || "").toLowerCase())
    const targetBranchId = String(targetBranchObj?.id || targetBranch || "").toLowerCase().trim()
    const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

    const targetSubBranch = freshSubBranch || (user?.role !== "Super Admin" && user?.role !== "Admin" ? (user as any)?.subBranchId : null)
    const targetSubBranchObj = (freshSubBranches || []).find(sb => sb.id === targetSubBranch || (sb as any).name?.toLowerCase() === (targetSubBranch || "").toLowerCase())
    const targetSubBranchId = String(targetSubBranchObj?.id || targetSubBranch || "").toLowerCase().trim()
    const targetSubBranchName = targetSubBranchObj?.name?.toLowerCase().trim() || ""

    const checkBranch = (p: any) => {
      if (!targetBranch || targetBranch === "all" || targetBranch === "main" || targetBranch === "hq") return true
      const pBranch = String(p.branchId || p.branch_id || "").toLowerCase().trim()
      const pBranchName = String(p.branchName || p.branch_name || "").toLowerCase().trim()
      if (!pBranch && !pBranchName) return false
      return (pBranch && (pBranch === targetBranchId || (targetBranchName && pBranch === targetBranchName))) ||
             (pBranchName && (pBranchName === targetBranchName || pBranchName === targetBranchId))
    }

    const checkSubBranch = (p: any) => {
      if (!targetSubBranch || targetSubBranch === "all" || targetSubBranch === "main" || targetSubBranch === "hq" || targetSubBranch === "all_subbranches") return true
      const pSubBranch = String(p.subBranchId || p.sub_branch_id || "").toLowerCase().trim()
      const pSubBranchName = String(p.subBranchName || p.sub_branch_name || "").toLowerCase().trim()
      if (!pSubBranch && !pSubBranchName) return false
      return (pSubBranch && (pSubBranch === targetSubBranchId || (targetSubBranchName && pSubBranch === targetSubBranchName))) ||
             (pSubBranchName && (pSubBranchName === targetSubBranchName || pSubBranchName === targetSubBranchId))
    }

    let filtered = payments
    if (isClientRole) {
      filtered = filtered.filter((p) => {
        if (!checkBranch(p)) return false
        if (!checkSubBranch(p)) return false
        return isRecordAssignedToClient(p, user)
      })
    } else {
      if (user?.role === "Teams" || (user?.role as string) === "Team") {
        filtered = filtered.filter((p) => isRecordAssignedToTeamMember(p, user))
      }
      if (userComp && userComp !== "all") {
        filtered = filtered.filter((p) => {
          const pComp = (p.companyId || (p as any).company || "tech").toLowerCase().trim()
          return pComp === userComp || (userComp === "tech" && !p.companyId)
        })
      }
      if (targetBranch && targetBranch !== "all" && targetBranch !== "main" && targetBranch !== "hq") {
        filtered = filtered.filter((p) => checkBranch(p))
      }
      if (targetSubBranch && targetSubBranch !== "all" && targetSubBranch !== "main" && targetSubBranch !== "hq" && targetSubBranch !== "all_subbranches") {
        filtered = filtered.filter((p) => checkSubBranch(p))
      }
    }

    return filtered.slice().sort((a, b) => {
      const timeA = new Date(a.paymentDate || (a as any).createdAt || 0).getTime()
      const timeB = new Date(b.paymentDate || (b as any).createdAt || 0).getTime()
      if (timeA && timeB && timeA !== timeB) return timeB - timeA
      return String(b.id || "").localeCompare(String(a.id || ""))
    })
  }, [payments, isClientRole, clientEmailNorm, clientNameNorm, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, user?.companyId, user?.branchId])

  const totalAmountNum = displayedPayments.reduce((sum, p) => sum + (p.amountNum || (parseInt(p.amount.replace(/[^0-9]/g, "")) || 0)), 0)
  const totalTransactions = displayedPayments.length
  const avgPayment = totalTransactions > 0 ? Math.round(totalAmountNum / totalTransactions) : 0

  const columns: ColumnDef<PaymentItem>[] = [
    {
      accessorKey: "invoiceId",
      header: "Invoice / Ref ID",
      cell: ({ row }) => (
        <div className="font-bold text-blue-600 dark:text-blue-400">
          {row.getValue("invoiceId")}
        </div>
      ),
    },
    {
      accessorKey: "client",
      header: "Client",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{row.getValue("client")}</div>
          <div className="text-[11px] text-zinc-400">{row.original.clientEmail}</div>
        </div>
      ),
    },
    {
      accessorKey: "project",
      header: "Project",
      cell: ({ row }) => (
        <div className="text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
          {row.getValue("project")}
        </div>
      ),
    },
    {
      accessorKey: "paymentDate",
      header: "Payment date",
      cell: ({ row }) => <div className="text-zinc-500 font-mono text-xs">{formatDisplayDate(row.getValue("paymentDate"))}</div>,
    },
    {
      accessorKey: "paymentMethod",
      header: "Method",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5 font-medium text-zinc-800 dark:text-zinc-200">
          <CreditCard size={13} className="text-zinc-400" />
          <span>{row.getValue("paymentMethod")}</span>
        </div>
      ),
    },
    {
      accessorKey: "transactionRef",
      header: "Transaction Ref",
      cell: ({ row }) => (
        <div className="text-zinc-500 font-mono text-[11px]">
          {row.getValue("transactionRef") || "—"}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => <div className="font-bold text-emerald-600 dark:text-emerald-400">{row.getValue("amount")}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedPayment(row.original)}
            className="p-1 text-zinc-400 hover:text-blue-600 transition-colors"
            title="View Receipt"
          >
            <Receipt size={14} />
          </button>
          {canDeletePayment && (
            <button
              type="button"
              onClick={() => handleDeletePayment(row.original.id)}
              className="p-1 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Delete Payment"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ),
    },
  ]

  
  __ctrl = { user, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, canPerformAction, canViewPayment, canAddPayment, canEditPayment, canDeletePayment, isClientRole, clientEmailNorm, clientNameNorm, activeTab, setActiveTab, payments, setPayments, invoices, setInvoices, isAddPaymentModalOpen, setIsAddPaymentModalOpen, selectedPayment, setSelectedPayment, toastMessage, setToastMessage, selectedInvoiceId, setSelectedInvoiceId, client, setClient, clientEmail, setClientEmail, project, setProject, amount, setAmount, paymentMethod, setPaymentMethod, transactionRef, setTransactionRef, paymentDate, setPaymentDate, note, setNote, showToast, loadData, handleInvoiceChange, handleCreatePayment, handleDeletePayment, displayedPayments, totalAmountNum, totalTransactions, avgPayment, columns };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <PaymentsSection1 ctrl={__ctrl} />

      <PaymentsSection2 ctrl={__ctrl} />
    </motion.div>
  )
}
