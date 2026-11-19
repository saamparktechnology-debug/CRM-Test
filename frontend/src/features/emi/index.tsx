"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Receipt, Plus, Download, Clock, AlertCircle, CheckCircle2, 
  Search, Calendar, User, Building2, ChevronRight, Send, 
  DollarSign, Sparkles, Filter, CreditCard, ArrowUpRight,
  ShieldCheck, Smartphone, QrCode, FileText, Check, X, Trash2
} from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { InstallmentItem, InstallmentScheduleItem, InstallmentStatus, EMIKPIs } from "../subscriptions/types"
import { 
  getInstallments, 
  saveInstallmentRecord, 
  recordInstallmentPayment, 
  sendInstallmentReminder,
  deleteInstallmentRecord
} from "../subscriptions/services/subscriptionService"
import { ClientInstallmentDetailModal } from "../subscriptions/components/ClientInstallmentDetailModal"
import { RecordInstallmentPaymentModal } from "../subscriptions/components/RecordInstallmentPaymentModal"
import { getClients } from "@/features/clients/services/clientService"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { isRecordAssignedToClient } from "@/lib/clientScopeUtils"
import { EmiSection1 } from "@/features/emi/components/emi-sections/EmiSection1"
import { EmiSection2 } from "@/features/emi/components/emi-sections/EmiSection2"
import { EmiSection3 } from "@/features/emi/components/emi-sections/EmiSection3"
import { EmiSection4 } from "@/features/emi/components/emi-sections/EmiSection4"


export default function EMIMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { activeCompanyId, activeBranchId, branches, user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const roleLower = (user?.role || "").toLowerCase().trim()
  const isSuperAdmin = roleLower.includes("super") || roleLower === "super admin"
  const isAdmin = !isSuperAdmin && (
    roleLower.includes("admin") || 
    roleLower.includes("owner") || 
    roleLower.includes("manager") ||
    roleLower === "admin"
  )
  const isClient = roleLower.includes("client")

  const canAddEMI = !isClient && (canPerformAction(user, "EMI", "add") || isSuperAdmin)
  const canEditEMI = !isClient && (canPerformAction(user, "EMI", "edit") || isSuperAdmin)
  const canDeleteEMI = !isClient && (canPerformAction(user, "EMI", "delete") || isSuperAdmin)

  // Data state
  const [installments, setInstallments] = React.useState<InstallmentItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [selectedForDetail, setSelectedForDetail] = React.useState<InstallmentItem | null>(null)
  
  // Record Payment Modal (Admin/Staff)
  const [recordingPayment, setRecordingPayment] = React.useState<{
    installment: InstallmentItem
    scheduleItem: InstallmentScheduleItem
  } | null>(null)

  // Client "Pay Now" Interactive Modal
  const [clientPayingInstallment, setClientPayingInstallment] = React.useState<{
    installment: InstallmentItem
    scheduleItem: InstallmentScheduleItem
  } | null>(null)
  const [clientPayMethod, setClientPayMethod] = React.useState<"upi" | "bank" | "card">("upi")
  const [isClientPayProcessing, setIsClientPayProcessing] = React.useState(false)

  // New EMI Contract Form state
  const [availableClients, setAvailableClients] = React.useState<{ name: string; email: string; phone?: string; company?: string }[]>([])
  const [newClientName, setNewClientName] = React.useState("")
  const [isCustomClient, setIsCustomClient] = React.useState(false)
  const [customClientEmail, setCustomClientEmail] = React.useState("")
  const [customClientPhone, setCustomClientPhone] = React.useState("")
  const [customClientCompany, setCustomClientCompany] = React.useState("")
  const [newProjectTitle, setNewProjectTitle] = React.useState("")
  const [newTotalValue, setNewTotalValue] = React.useState("60000")
  const [newAdvancePaid, setNewAdvancePaid] = React.useState("10000")
  const [newInstallmentsCount, setNewInstallmentsCount] = React.useState<number>(4)
  const [newInterval, setNewInterval] = React.useState<"Monthly" | "Bi-weekly" | "Quarterly">("Monthly")
  const [newFirstDueDate, setNewFirstDueDate] = React.useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  const [customMilestones, setCustomMilestones] = React.useState<{ num: number; amount: number; dueDate: string }[]>([])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load installments data fresh from store
  const loadData = React.useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const { activeCompanyId: freshCompanyId } = useAuthStore.getState()
      const data = await getInstallments(freshCompanyId || "tech")
      setInstallments(data || [])
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    loadData(true)
    const handleReload = () => loadData(false)
    window.addEventListener("storage", handleReload)
    window.addEventListener("saampark_company_switched", handleReload)
    window.addEventListener("saampark_branch_switched", handleReload)
    window.addEventListener("saampark_data_synced", handleReload)
    window.addEventListener("saampark_installments_updated", handleReload)

    return () => {
      window.removeEventListener("storage", handleReload)
      window.removeEventListener("saampark_company_switched", handleReload)
      window.removeEventListener("saampark_branch_switched", handleReload)
      window.removeEventListener("saampark_data_synced", handleReload)
      window.removeEventListener("saampark_installments_updated", handleReload)
    }
  }, [loadData])

  const handleDeleteContract = async (id: string, title?: string) => {
    if (!canDeleteEMI) {
      alert("You do not have permission to delete EMI contracts.")
      return
    }
    if (confirm(`Are you sure you want to delete EMI contract "${title || id}"? All associated installments, payments, and generated invoices will be deleted across the entire system.`)) {
      await deleteInstallmentRecord(id, activeCompanyId || "tech")
      showToast(`🗑️ EMI contract "${title || id}" deleted successfully.`)
      loadData(false)
    }
  }

  // Populate available clients on modal open
  React.useEffect(() => {
    if (isAddModalOpen) {
      getClients().then((cList) => {
        const mapped = cList.map(c => ({
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          company: c.companyName || c.name,
        }))
        setAvailableClients(mapped)
        if (mapped.length > 0 && !newClientName) {
          setNewClientName(mapped[0].name)
        }
      }).catch(() => {})
    }
  }, [isAddModalOpen, newClientName])

  // Auto-generate milestone preview matrix when form parameters change
  React.useEffect(() => {
    const totalVal = parseInt(newTotalValue.replace(/[^0-9]/g, "")) || 0
    const advVal = parseInt(newAdvancePaid.replace(/[^0-9]/g, "")) || 0
    const remaining = Math.max(0, totalVal - advVal)
    const count = Math.max(1, newInstallmentsCount)
    const perInst = Math.round(remaining / count)

    const baseDate = newFirstDueDate ? new Date(newFirstDueDate) : new Date()
    const validBase = isNaN(baseDate.getTime()) ? new Date() : baseDate

    const generated = []
    for (let i = 1; i <= count; i++) {
      const d = new Date(validBase)
      if (newInterval === "Monthly") {
        d.setMonth(d.getMonth() + (i - 1))
      } else if (newInterval === "Bi-weekly") {
        d.setDate(d.getDate() + (i - 1) * 14)
      } else if (newInterval === "Quarterly") {
        d.setMonth(d.getMonth() + (i - 1) * 3)
      }
      generated.push({
        num: i,
        amount: perInst,
        dueDate: d.toISOString().split("T")[0],
      })
    }
    setCustomMilestones(generated)
  }, [newTotalValue, newAdvancePaid, newInstallmentsCount, newInterval, newFirstDueDate])

  // ── Role Scoped Installments ──
  const visibleInstallments = React.useMemo(() => {
    if (!user) return []

    const { activeCompanyId: freshCompId, activeBranchId: freshBranchId, branches: freshBranches, user: freshUser } = useAuthStore.getState()
    const userComp = (freshCompId || freshUser?.companyId || "").toLowerCase().trim()
    const targetBranch = freshBranchId

    const checkCompany = (item: InstallmentItem) => {
      if (!userComp || userComp === "all") return true
      const comp = (item.companyId || "tech").toLowerCase().trim()
      return comp === userComp || (userComp === "tech" && !item.companyId)
    }

    const checkBranch = (item: InstallmentItem) => {
      if (!targetBranch) return true
      const bId = String(item.branchId || "").toLowerCase().trim()
      const bName = String(item.branchName || "").toLowerCase().trim()
      const target = String(targetBranch).toLowerCase().trim()
      return bId === target || bName === target
    }

    // 1. Super Admin & Company Admin: view within company/branch
    if (isSuperAdmin || isAdmin) {
      return installments.filter(item => checkCompany(item) && checkBranch(item))
    }

    const normName = (user.name || "").toLowerCase().trim()
    const normEmail = (user.email || "").toLowerCase().trim()
    const uId = String(user.id || "").toLowerCase().trim()

    // 2. Client role: strictly their own installments
    if (isClient) {
      return installments.filter((item) => {
        if (!checkBranch(item)) return false
        return isRecordAssignedToClient(item, user)
      })
    }

    // 3. Team Member: assigned to them
    return installments.filter((item) => {
      if (!checkBranch(item)) return false
      const assigned = (item.assignedMembers || []).map(m => m.toLowerCase().trim())
      const assignedEmails = (item.assignedMemberEmails || []).map(e => e.toLowerCase().trim())
      const billedBy = (item.billedBy || "").toLowerCase().trim()
      const createdById = String(item.createdById || "").toLowerCase().trim()

      if (uId && createdById === uId) return true
      if (normName && billedBy === normName) return true
      if (assigned.some(m => m === normName || (normName && m.includes(normName)) || (normName && normName.includes(m)))) return true
      if (normEmail && assignedEmails.some(e => e === normEmail)) return true

      return false
    })
  }, [installments, user, isSuperAdmin, isAdmin, isClient, activeCompanyId, activeBranchId, branches])

  // Filtered by Search & Status
  const filteredInstallments = React.useMemo(() => {
    return visibleInstallments.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = 
        !q ||
        item.clientName.toLowerCase().includes(q) ||
        item.projectTitle.toLowerCase().includes(q) ||
        (item.clientEmail && item.clientEmail.toLowerCase().includes(q)) ||
        (item.clientCompany && item.clientCompany.toLowerCase().includes(q)) ||
        item.id.toLowerCase().includes(q)

      let matchesStatus = true
      if (statusFilter === "pending") {
        matchesStatus = item.status === "Pending" || item.status === "Partially Paid"
      } else if (statusFilter === "overdue") {
        matchesStatus = item.status === "Overdue"
      } else if (statusFilter === "paid") {
        matchesStatus = item.status === "Paid"
      }

      return matchesSearch && matchesStatus
    })
  }, [visibleInstallments, searchQuery, statusFilter])

  // Compute EMI KPIs
  const kpis: EMIKPIs = React.useMemo(() => {
    let totalVal = 0
    let totalPaid = 0
    let totalRemaining = 0
    let upcomingCount = 0
    let upcomingAmt = 0
    let overdueCount = 0
    let overdueAmt = 0

    visibleInstallments.forEach((inst) => {
      totalVal += inst.totalContractValue
      totalPaid += inst.totalPaid
      totalRemaining += inst.remainingBalance

      inst.schedule.forEach((s) => {
        if (s.status === "Pending") {
          upcomingCount++
          upcomingAmt += s.amount
        } else if (s.status === "Overdue") {
          overdueCount++
          overdueAmt += s.amount
        }
      })
    })

    const collectionRate = totalVal > 0 ? Math.round((totalPaid / totalVal) * 100) : 0

    return {
      totalContractValue: totalVal,
      totalPaid,
      totalRemainingBalance: totalRemaining,
      activeContractsCount: visibleInstallments.length,
      upcomingInstallmentsDueCount: upcomingCount,
      upcomingInstallmentsDueAmount: upcomingAmt,
      overdueInstallmentsCount: overdueCount,
      overdueInstallmentsAmount: overdueAmt,
      collectionRatePercent: collectionRate,
    }
  }, [visibleInstallments])

  // ── Actions ──

  const handleCreateEMIContract = async (e: React.FormEvent) => {
    e.preventDefault()
    const totalVal = parseInt(newTotalValue.replace(/[^0-9]/g, "")) || 0
    const advVal = parseInt(newAdvancePaid.replace(/[^0-9]/g, "")) || 0
    const remaining = Math.max(0, totalVal - advVal)

    if (!newProjectTitle.trim() || totalVal <= 0) {
      alert("Please provide a valid contract / project title and contract value.")
      return
    }

    let clientName = newClientName
    let clientEmail = ""
    let clientPhone = ""
    let clientCompany = ""

    if (isCustomClient) {
      clientName = newClientName || "Custom Client"
      clientEmail = customClientEmail
      clientPhone = customClientPhone
      clientCompany = customClientCompany || clientName
    } else {
      const found = availableClients.find(c => c.name.toLowerCase().trim() === newClientName.toLowerCase().trim())
      clientEmail = found?.email || ""
      clientPhone = found?.phone || ""
      clientCompany = found?.company || clientName
    }

    const count = customMilestones.length
    const schedule: InstallmentScheduleItem[] = customMilestones.map((m) => ({
      installmentNumber: m.num,
      amount: m.amount,
      formattedAmount: `₹${m.amount.toLocaleString("en-IN")}`,
      dueDate: m.dueDate,
      status: "Pending" as InstallmentStatus,
    }))

    const newInst: InstallmentItem = {
      id: `emi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      clientName,
      clientEmail,
      clientPhone,
      clientCompany,
      projectTitle: newProjectTitle,
      totalContractValue: totalVal,
      totalAdvancePaid: advVal,
      totalPaid: advVal,
      remainingBalance: remaining,
      totalInstallments: count,
      currentInstallmentNumber: 1,
      currentInstallmentAmount: schedule[0]?.amount || Math.round(remaining / count),
      currentDueDate: schedule[0]?.dueDate || newFirstDueDate,
      status: remaining === 0 ? "Paid" : "Pending",
      schedule,
      companyId: activeCompanyId || "tech",
      branchId: activeBranchId || undefined,
      createdAt: new Date().toISOString().split("T")[0],
    }

    await saveInstallmentRecord(newInst, activeCompanyId || "tech")
    showToast(`✅ EMI Milestone Contract created for "${newProjectTitle}"!`)
    setIsAddModalOpen(false)
    loadData(false)
  }

  const handleSendReminder = async (installmentId: string, installmentNumber?: number) => {
    const ok = await sendInstallmentReminder(installmentId, installmentNumber, activeCompanyId || "tech")
    if (ok) {
      showToast("📧 Payment reminder email successfully sent to client.")
      loadData(false)
    } else {
      alert("Could not send reminder. Please verify client email address.")
    }
  }

  const handleRecordPaymentConfirm = async (
    installmentId: string,
    installmentNumber: number,
    amount: number,
    paymentMethod: string
  ) => {
    const updated = await recordInstallmentPayment(
      installmentId,
      installmentNumber,
      amount,
      paymentMethod,
      activeCompanyId || "tech"
    )
    if (updated) {
      showToast(`💰 Installment #${installmentNumber} marked as PAID!`)
      if (selectedForDetail && selectedForDetail.id === installmentId) {
        setSelectedForDetail(updated)
      }
      loadData(false)
    }
  }

  // Client Pay Now Simulation & Record
  const handleClientPayNowSubmit = async () => {
    if (!clientPayingInstallment) return
    setIsClientPayProcessing(true)
    try {
      const { installment, scheduleItem } = clientPayingInstallment
      const methodLabel = 
        clientPayMethod === "upi" ? "UPI (Instant Online)" :
        clientPayMethod === "card" ? "Debit / Credit Card" : "Bank Transfer (NEFT/RTGS)"

      const updated = await recordInstallmentPayment(
        installment.id,
        scheduleItem.installmentNumber,
        scheduleItem.amount,
        methodLabel,
        activeCompanyId || "tech"
      )

      if (updated) {
        showToast(`🎉 Payment of ${scheduleItem.formattedAmount} successful! Receipt generated.`)
        setClientPayingInstallment(null)
        loadData(false)
      }
    } catch (err) {
      alert("Payment processing error. Please try again or contact support.")
    } finally {
      setIsClientPayProcessing(false)
    }
  }

  
  __ctrl = { activeCompanyId, activeBranchId, branches, user, canPerformAction, roleLower, isSuperAdmin, isAdmin, isClient, canAddEMI, canEditEMI, canDeleteEMI, installments, setInstallments, isLoading, setIsLoading, toastMessage, setToastMessage, searchQuery, setSearchQuery, statusFilter, setStatusFilter, isAddModalOpen, setIsAddModalOpen, selectedForDetail, setSelectedForDetail, recordingPayment, setRecordingPayment, clientPayingInstallment, setClientPayingInstallment, clientPayMethod, setClientPayMethod, isClientPayProcessing, setIsClientPayProcessing, availableClients, setAvailableClients, newClientName, setNewClientName, isCustomClient, setIsCustomClient, customClientEmail, setCustomClientEmail, customClientPhone, setCustomClientPhone, customClientCompany, setCustomClientCompany, newProjectTitle, setNewProjectTitle, newTotalValue, setNewTotalValue, newAdvancePaid, setNewAdvancePaid, newInstallmentsCount, setNewInstallmentsCount, newInterval, setNewInterval, newFirstDueDate, setNewFirstDueDate, customMilestones, setCustomMilestones, showToast, loadData, handleDeleteContract, visibleInstallments, filteredInstallments, kpis, handleCreateEMIContract, handleSendReminder, handleRecordPaymentConfirm, handleClientPayNowSubmit };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      
      <EmiSection1 ctrl={__ctrl} />
      <EmiSection2 ctrl={__ctrl} />

      <EmiSection3 ctrl={__ctrl} />

      <EmiSection4 ctrl={__ctrl} />

    </motion.div>
  )
}
