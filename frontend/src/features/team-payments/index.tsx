"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { 
  CreditCard, 
  Building2, 
  QrCode, 
  Search, 
  RefreshCw, 
  Send, 
  Trash2, 
  Eye, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  User, 
  Shield, 
  Edit, 
  Plus, 
  Lock, 
  Filter,
  Download,
  Printer,
  Sparkles,
  Layers,
  FolderGit2,
  CheckSquare,
  HelpCircle,
  TrendingUp,
  Receipt
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { 
  TeamMemberPayoutProfile, 
  TeamPayoutRecord, 
  TeamPayrollKPIs,
  TeamMemberBankingInfo,
  ProjectUserEarningsRecord,
  CustomPaymentAdjustment,
  PayoutType
} from "@/features/team/types"
import { 
  getTeamPayoutProfiles, 
  getPayoutRecords, 
  updateMemberBankingDetails, 
  deletePayoutRecord, 
  sendTeamPaymentReceiptEmail,
  getProjectWiseUserEarnings,
  getCustomAdjustments,
  updateCustomAdjustmentStatus,
  deleteCustomAdjustment,
  recordTeamPayout
} from "@/features/team/services/teamPaymentService"
import { RecordPayoutModal } from "@/features/team/components/RecordPayoutModal"
import { EditMemberBankingModal } from "@/features/team/components/EditMemberBankingModal"
import { TeamPaymentReceiptModal } from "@/features/team/components/TeamPaymentReceiptModal"
import { MemberPayoutLedgerModal } from "@/features/team/components/MemberPayoutLedgerModal"
import { DisburseProjectShareModal } from "@/features/team/components/DisburseProjectShareModal"
import { AddCustomAdjustmentModal } from "@/features/team/components/AddCustomAdjustmentModal"
import { Button } from "@/components/ui/Button"
import { ThreeDotLoader } from "@/components/ui/ThreeDotLoader"
import { exportToExcel } from "@/lib/exportUtils"
import { PaymentsSection1 } from "@/features/team-payments/components/payments-sections/PaymentsSection1"
import { PaymentsSection2 } from "@/features/team-payments/components/payments-sections/PaymentsSection2"
import { createPaymentsHandler1 } from "@/features/team-payments/hooks/payments-hooks/createPaymentsHandler1.hooks"


export default function TeamPaymentsPage() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { activeCompanyId, activeBranchId, branches, subBranches, user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const roleLower = (user?.role || "").toLowerCase().trim()
  const isSuperAdmin = roleLower.includes("super") || roleLower === "super admin"
  const isCompanyAdmin = !isSuperAdmin && (
    roleLower.includes("admin") || 
    roleLower.includes("owner") || 
    roleLower.includes("manager") ||
    roleLower === "admin"
  )
  const isSingleBranchAdmin = Boolean(
    !isSuperAdmin &&
    user?.branchId && 
    (roleLower.includes("branch admin") || roleLower.includes("branch manager") || roleLower.includes("branch"))
  )
  const isClient = roleLower.includes("client")

  // Permissions
  const canAddPayout = canPerformAction(user, "Teams", "add") || isSuperAdmin || isCompanyAdmin
  const canEditBanking = canPerformAction(user, "Teams", "edit") || isSuperAdmin || isCompanyAdmin
  const canDeletePayout = canPerformAction(user, "Teams", "delete") || isSuperAdmin || isCompanyAdmin

  // Active View Tab: "directory" | "projects" | "history" | "custom"
  const [activeTab, setActiveTab] = React.useState<"directory" | "projects" | "history" | "custom">("directory")

  // Branch & Sub-Branch Selector Filters
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>("all")
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>("all")

  React.useEffect(() => {
    if (isSingleBranchAdmin && user?.branchId) {
      setSelectedBranchId(user.branchId)
    } else if (activeBranchId) {
      setSelectedBranchId(activeBranchId)
    } else {
      setSelectedBranchId("all")
    }
  }, [isSingleBranchAdmin, user?.branchId, activeBranchId])

  // Filter available sub-branches based on selected branch
  const availableSubBranches = React.useMemo(() => {
    if (selectedBranchId === "all") return subBranches
    return subBranches.filter(sb => sb.parentBranchId === selectedBranchId)
  }, [subBranches, selectedBranchId])

  // Data States
  const [profiles, setProfiles] = React.useState<TeamMemberPayoutProfile[]>([])
  const [records, setRecords] = React.useState<TeamPayoutRecord[]>([])
  const [projectEarnings, setProjectEarnings] = React.useState<ProjectUserEarningsRecord[]>([])
  const [customAdjustments, setCustomAdjustments] = React.useState<CustomPaymentAdjustment[]>([])
  
  const [kpis, setKpis] = React.useState<TeamPayrollKPIs>({
    totalMonthlyPayroll: 0,
    totalPaidThisMonth: 0,
    totalNeedToPay: 0,
    teamMembersOnPayroll: 0,
    paidMembersCount: 0,
    pendingMembersCount: 0,
    totalProjectDisbursements: 0,
    totalCustomAdjustments: 0,
  })
  const [isLoading, setIsLoading] = React.useState(true)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null)

  // Filters & Search
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("all")

  // Modals
  const [payingProfile, setPayingProfile] = React.useState<TeamMemberPayoutProfile | null>(null)
  const [editingBankingProfile, setEditingBankingProfile] = React.useState<TeamMemberPayoutProfile | null>(null)
  const [viewingReceipt, setViewingReceipt] = React.useState<TeamPayoutRecord | null>(null)
  const [viewingLedgerProfile, setViewingLedgerProfile] = React.useState<TeamMemberPayoutProfile | null>(null)
  const [disbursingProject, setDisbursingProject] = React.useState<ProjectUserEarningsRecord | null>(null)
  const [isAddAdjustmentOpen, setIsAddAdjustmentOpen] = React.useState(false)

  // Custom Amount Payout State
  const [customPayInitialAmount, setCustomPayInitialAmount] = React.useState<number | undefined>(undefined)
  const [customPayProjectTitle, setCustomPayProjectTitle] = React.useState<string | undefined>(undefined)
  const [customPayType, setCustomPayType] = React.useState<PayoutType | undefined>(undefined)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // Load Data
  const loadData = React.useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true)
    try {
      const comp = activeCompanyId || "tech"
      const branch = selectedBranchId
      const subBranch = selectedSubBranchId
      const [pData, rData, projData, adjData] = await Promise.all([
        getTeamPayoutProfiles(comp, branch, subBranch),
        getPayoutRecords(comp, branch, subBranch),
        getProjectWiseUserEarnings(comp, branch, subBranch),
        getCustomAdjustments(comp, branch, subBranch),
      ])
      setProfiles(pData.profiles)
      setKpis(pData.kpis)
      setRecords(rData)
      setProjectEarnings(projData)
      setCustomAdjustments(adjData)
    } catch (err) {
      console.error("Error loading team payments data:", err)
    } finally {
      setIsLoading(false)
    }
  }, [activeCompanyId, selectedBranchId, selectedSubBranchId])

  React.useEffect(() => {
    loadData(true)
    const handleReload = () => loadData(false)
    window.addEventListener("storage", handleReload)
    window.addEventListener("saampark_company_switched", handleReload)
    window.addEventListener("saampark_branch_switched", handleReload)
    window.addEventListener("saampark_subbranches_updated", handleReload)
    window.addEventListener("saampark_team_payouts_updated", handleReload)
    window.addEventListener("saampark_team_banking_updated", handleReload)
    window.addEventListener("saampark_team_adjustments_updated", handleReload)

    return () => {
      window.removeEventListener("storage", handleReload)
      window.removeEventListener("saampark_company_switched", handleReload)
      window.removeEventListener("saampark_branch_switched", handleReload)
      window.removeEventListener("saampark_subbranches_updated", handleReload)
      window.removeEventListener("saampark_team_payouts_updated", handleReload)
      window.removeEventListener("saampark_team_banking_updated", handleReload)
      window.removeEventListener("saampark_team_adjustments_updated", handleReload)
    }
  }, [loadData])

  // Save Banking updates
  const handleSaveBanking = async (memberId: string, data: Partial<TeamMemberBankingInfo>) => {
    await updateMemberBankingDetails(memberId, data, activeCompanyId || "tech")
    showToast("✅ Banking and UPI details successfully updated!")
    loadData(false)
  }

  // Delete Voucher
  const handleDeleteVoucher = async (id: string) => {
    if (!canDeletePayout) {
      alert("You do not have permission to delete payout records.")
      return
    }
    if (confirm(`Delete disbursement voucher ${id}?`)) {
      await deletePayoutRecord(id, activeCompanyId || "tech")
      showToast(`Voucher ${id} deleted.`)
      loadData(false)
    }
  }

  // Resend Receipt Email
  const handleResendReceipt = async (record: TeamPayoutRecord) => {
    showToast(`Sending receipt voucher to ${record.memberEmail}...`)
    const res = await sendTeamPaymentReceiptEmail(record)
    showToast(res.success ? `✅ Receipt sent to ${record.memberEmail}!` : "❌ Failed to send receipt.")
  }

  // Disburse Custom Adjustment Directly
  const handleDisburseCustomItem = async (adj: CustomPaymentAdjustment) => {
    if (!canAddPayout) {
      alert("Permission required to disburse payouts.")
      return
    }

    try {
      const payout = await recordTeamPayout({
        memberId: adj.memberId,
        memberName: adj.memberName,
        memberEmail: adj.memberEmail,
        role: adj.role,
        department: adj.department,
        companyId: adj.companyId || "tech",
        branchId: adj.branchId,
        branchName: adj.branchName,
        period: `Custom: ${adj.category}`,
        payoutType: "Custom Allowance",
        baseAmount: 0,
        commissionAmount: 0,
        bonus: adj.type === "Credit" ? adj.amount : 0,
        deductions: adj.type === "Debit" ? adj.amount : 0,
        netAmount: adj.amount,
        netAmountFormatted: `₹${adj.amount.toLocaleString("en-IN")}`,
        paymentDate: new Date().toLocaleDateString("en-GB"),
        paymentMethod: "Bank IMPS/NEFT",
        transactionRef: `ADJTXN${Date.now().toString().slice(-6)}`,
        status: "Completed",
        notes: adj.description,
        billedBy: "Admin",
      }, adj.companyId)

      await updateCustomAdjustmentStatus(adj.id, "Disbursed", adj.companyId, payout.id)
      showToast(`🎉 Disbursed ₹${adj.amount.toLocaleString("en-IN")} for ${adj.category} to ${adj.memberName}!`)
      loadData(false)
      setViewingReceipt(payout)
    } catch (err) {
      console.error("Disbursement of adjustment failed:", err)
      alert("Failed to disburse adjustment.")
    }
  }

  // Delete Custom Adjustment
  const handleDeleteCustomItem = async (id: string) => {
    if (confirm("Delete this custom adjustment item?")) {
      await deleteCustomAdjustment(id, activeCompanyId || "tech")
      showToast("Custom adjustment deleted.")
      loadData(false)
    }
  }

  // Filtered Profiles (with non-admin privacy isolation)
  const filteredProfiles = React.useMemo(() => {
    return profiles.filter((p) => {
      // Non-admin privacy isolation: user only sees their own payout profile
      if (!isSuperAdmin && !isCompanyAdmin && user) {
        const uEmail = (user.email || "").toLowerCase().trim()
        const uId = String(user.id || "").trim()
        const pEmail = (p.email || "").toLowerCase().trim()
        const pId = String(p.id || "").trim()
        const isSelf = (uEmail && pEmail === uEmail) || (uId && pId === uId)
        if (!isSelf) return false
      }

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.bankingInfo?.bankName && p.bankingInfo.bankName.toLowerCase().includes(q)) ||
        (p.bankingInfo?.upiId && p.bankingInfo.upiId.toLowerCase().includes(q))

      const matchesStatus = statusFilter === "all" || p.payoutStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [profiles, searchQuery, statusFilter, isSuperAdmin, isCompanyAdmin, user])

  // Filtered Records (Universal History with non-admin privacy isolation)
  const filteredRecords = React.useMemo(() => {
    return records.filter((r) => {
      // Non-admin privacy isolation: user only sees their own payout records
      if (!isSuperAdmin && !isCompanyAdmin && user) {
        const uEmail = (user.email || "").toLowerCase().trim()
        const uId = String(user.id || "").trim()
        const rEmail = (r.memberEmail || "").toLowerCase().trim()
        const rId = String(r.memberId || "").trim()
        const isSelf = (uEmail && rEmail === uEmail) || (uId && rId === uId)
        if (!isSelf) return false
      }

      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q ||
        r.id.toLowerCase().includes(q) ||
        r.memberName.toLowerCase().includes(q) ||
        r.memberEmail.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q) ||
        r.payoutType.toLowerCase().includes(q) ||
        (r.transactionRef && r.transactionRef.toLowerCase().includes(q))

      const matchesCategory = categoryFilter === "all" || r.payoutType.toLowerCase().includes(categoryFilter.toLowerCase())
      return matchesSearch && matchesCategory
    })
  }, [records, searchQuery, categoryFilter, isSuperAdmin, isCompanyAdmin, user])

  // Filtered Projects (with non-admin privacy isolation)
  const filteredProjectEarnings = React.useMemo(() => {
    return projectEarnings.filter((pe) => {
      // Non-admin privacy isolation: user only sees their own project earnings
      if (!isSuperAdmin && !isCompanyAdmin && user) {
        const uEmail = (user.email || "").toLowerCase().trim()
        const uId = String(user.id || "").trim()
        const peEmail = (pe.memberEmail || "").toLowerCase().trim()
        const peId = String(pe.memberId || "").trim()
        const isSelf = (uEmail && peEmail === uEmail) || (uId && peId === uId)
        if (!isSelf) return false
      }

      const q = searchQuery.toLowerCase().trim()
      return !q ||
        pe.projectTitle.toLowerCase().includes(q) ||
        pe.clientName.toLowerCase().includes(q) ||
        pe.memberName.toLowerCase().includes(q) ||
        pe.memberEmail.toLowerCase().includes(q)
    })
  }, [projectEarnings, searchQuery, isSuperAdmin, isCompanyAdmin, user])

  // Filtered Custom Adjustments (with non-admin privacy isolation)
  const filteredCustomAdjustments = React.useMemo(() => {
    return customAdjustments.filter((ca) => {
      // Non-admin privacy isolation: user only sees their own custom adjustments
      if (!isSuperAdmin && !isCompanyAdmin && user) {
        const uEmail = (user.email || "").toLowerCase().trim()
        const uId = String(user.id || "").trim()
        const caEmail = (ca.memberEmail || "").toLowerCase().trim()
        const caId = String(ca.memberId || "").trim()
        const isSelf = (uEmail && caEmail === uEmail) || (uId && caId === uId)
        if (!isSelf) return false
      }

      const q = searchQuery.toLowerCase().trim()
      return !q ||
        ca.memberName.toLowerCase().includes(q) ||
        ca.category.toLowerCase().includes(q) ||
        ca.description.toLowerCase().includes(q)
    })
  }, [customAdjustments, searchQuery, isSuperAdmin, isCompanyAdmin, user])

  // Dynamic Scoped KPIs (Strictly my own totals for non-admins)
  const displayKpis = React.useMemo(() => {
    if (isSuperAdmin || isCompanyAdmin) return kpis
    const userProfiles = filteredProfiles
    const totalPayroll = userProfiles.reduce((sum, p) => sum + (p.totalDueThisMonth || 0), 0)
    const totalPaid = userProfiles.reduce((sum, p) => sum + (p.totalPaidThisMonth || 0), 0)
    const remaining = userProfiles.reduce((sum, p) => sum + (p.remainingNeedToPay || 0), 0)
    const projEarnings = filteredProjectEarnings.reduce((sum, pe) => sum + (pe.memberPendingAmount || 0), 0)
    return {
      totalMonthlyPayroll: totalPayroll,
      teamMembersOnPayroll: userProfiles.length,
      totalPaidThisMonth: totalPaid,
      fullyPaidMembers: userProfiles.filter(p => p.payoutStatus === "Paid").length,
      remainingNeedToPay: remaining,
      pendingMembers: userProfiles.filter(p => p.payoutStatus !== "Paid").length,
      projectEarningsPending: projEarnings,
      activeProjectsCount: filteredProjectEarnings.length,
    }
  }, [kpis, isSuperAdmin, isCompanyAdmin, filteredProfiles, filteredProjectEarnings])

  // Export Excel
  const handleExportExcel: any = createPaymentsHandler1(() => __ctrlRef.current);

  
  __ctrl = { activeCompanyId, activeBranchId, branches, subBranches, user, canPerformAction, roleLower, isSuperAdmin, isCompanyAdmin, isSingleBranchAdmin, isClient, canAddPayout, canEditBanking, canDeletePayout, activeTab, setActiveTab, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, availableSubBranches, profiles, setProfiles, records, setRecords, projectEarnings, setProjectEarnings, customAdjustments, setCustomAdjustments, kpis, setKpis, isLoading, setIsLoading, toastMessage, setToastMessage, searchQuery, setSearchQuery, statusFilter, setStatusFilter, categoryFilter, setCategoryFilter, payingProfile, setPayingProfile, editingBankingProfile, setEditingBankingProfile, viewingReceipt, setViewingReceipt, viewingLedgerProfile, setViewingLedgerProfile, disbursingProject, setDisbursingProject, isAddAdjustmentOpen, setIsAddAdjustmentOpen, customPayInitialAmount, setCustomPayInitialAmount, customPayProjectTitle, setCustomPayProjectTitle, customPayType, setCustomPayType, showToast, loadData, handleSaveBanking, handleDeleteVoucher, handleResendReceipt, handleDisburseCustomItem, handleDeleteCustomItem, filteredProfiles, filteredRecords, filteredProjectEarnings, filteredCustomAdjustments, displayKpis, handleExportExcel };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      <PaymentsSection1 ctrl={__ctrl} />

      {/* Main Content View */}
      <PaymentsSection2 ctrl={__ctrl} />

      {/* ── MODALS ── */}

      {/* 1. Record Salary & Commission Payout Modal */}
      <RecordPayoutModal
        isOpen={Boolean(payingProfile)}
        profile={payingProfile}
        initialAmount={customPayInitialAmount}
        initialProjectTitle={customPayProjectTitle}
        initialPayoutType={customPayType}
        onClose={() => {
          setPayingProfile(null)
          setCustomPayInitialAmount(undefined)
          setCustomPayProjectTitle(undefined)
          setCustomPayType(undefined)
        }}
        onSuccess={(payout) => {
          showToast(`🎉 Payment of ₹${payout.netAmount.toLocaleString("en-IN")} disbursed to ${payout.memberName}!`)
          loadData(false)
          setViewingReceipt(payout)
        }}
      />

      {/* 2. Disburse Project Share Modal */}
      <DisburseProjectShareModal
        isOpen={Boolean(disbursingProject)}
        earningsRecord={disbursingProject}
        onClose={() => setDisbursingProject(null)}
        onSuccess={(payout) => {
          showToast(`🎉 Project Share of ₹${payout.netAmount.toLocaleString("en-IN")} disbursed to ${payout.memberName}!`)
          loadData(false)
          setViewingReceipt(payout)
        }}
      />

      {/* 3. Add Custom Adjustment Modal */}
      <AddCustomAdjustmentModal
        isOpen={isAddAdjustmentOpen}
        profiles={profiles}
        onClose={() => setIsAddAdjustmentOpen(false)}
        onSuccess={(adj) => {
          showToast(`✅ Custom ${adj.category} of ₹${adj.amount.toLocaleString("en-IN")} added for ${adj.memberName}!`)
          loadData(false)
        }}
      />

      {/* 4. Edit Member Banking & UPI Modal */}
      <EditMemberBankingModal
        isOpen={Boolean(editingBankingProfile)}
        profile={editingBankingProfile}
        onClose={() => setEditingBankingProfile(null)}
        onSave={handleSaveBanking}
      />

      {/* 5. Official Payment Receipt Voucher Modal */}
      <TeamPaymentReceiptModal
        isOpen={Boolean(viewingReceipt)}
        payout={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
      />

      {/* 6. Single Member Historical Payout Ledger Modal */}
      <MemberPayoutLedgerModal
        isOpen={Boolean(viewingLedgerProfile)}
        profile={viewingLedgerProfile}
        onClose={() => setViewingLedgerProfile(null)}
        onViewReceipt={(payout) => setViewingReceipt(payout)}
        onPayNow={(p) => setPayingProfile(p)}
      />
    </motion.div>
  )
}
