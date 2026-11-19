"use client"
import { approveApprovalRequest, rejectApprovalRequest } from "@/services/approvalService"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ShieldCheck, Check, X, Eye, Clock, AlertTriangle, Search, Filter, 
  FileText, ShoppingCart, CreditCard, User, Building2, Calendar, 
  ArrowRight, ShieldAlert, Sparkles, RefreshCw, Trash2, CheckCircle2,
  XCircle, ChevronRight, Info, GitBranch
} from "lucide-react"

import { useAuthStore, getUserEntityScope, isMatchingCompany } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { ApprovalRequest, ApprovalType, ApprovalStatus } from "./types"
import { useApprovalsQuery, useApproveRequestMutation, useRejectRequestMutation, useDeleteApprovalMutation } from "./hooks/useApprovals"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { ApprovalsSection1 } from "@/features/approvals/components/approvals-sections/ApprovalsSection1"
import { ApprovalsSection2 } from "@/features/approvals/components/approvals-sections/ApprovalsSection2"
import { ApprovalsSection3 } from "@/features/approvals/components/approvals-sections/ApprovalsSection3"


export default function ApprovalsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, companies, branches, subBranches } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  
  const isSuperOrAdmin = Boolean(user && (user.role === "Super Admin" || user.role === "Admin"))
  const canAccessApprovals = Boolean(
    isSuperOrAdmin || (user && canPerformAction(user as any, "Approvals", "view"))
  )
  const canApprove = Boolean(
    isSuperOrAdmin || (user && canPerformAction(user as any, "Approvals", "edit"))
  )

  const userScope = React.useMemo(() => {
    return getUserEntityScope(user, companies, branches, subBranches)
  }, [user, companies, branches, subBranches])

  const companyKey = activeCompanyId || "all"
  const { data: requests = [], isLoading: loading, refetch: loadRequests } = useApprovalsQuery(companyKey, canAccessApprovals)
  const approveMutation = useApproveRequestMutation(companyKey)
  const rejectMutation = useRejectRequestMutation(companyKey)
  const deleteMutation = useDeleteApprovalMutation(companyKey)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  
  // Inspection & Rejection Modals
  const [inspectItem, setInspectItem] = React.useState<ApprovalRequest | null>(null)
  const [rejectItem, setRejectItem] = React.useState<ApprovalRequest | null>(null)
  const [rejectionReason, setRejectionReason] = React.useState("")

  

  // Non-authorized block
  if (!user || !canAccessApprovals) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-surface border border-border shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-black text-foreground">Approvals Access Restricted</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Approvals Center is reserved for authorized administrators and managerial roles. All bills, quotations, and subscriptions created by team members are reviewed here.
          </p>
        </div>
      </div>
    )
  }

  // Cascading scoped requests according to organizational hierarchy:
  // - Super Admin: Global access across all companies and branches.
  // - Company Admin: Can see & approve company HQ direct requests, branch requests, and sub-branch requests under her company.
  // - Branch Admin: Can see & approve requests from their branch + its sub-branches. DIRECT COMPANY HQ REQUESTS ARE HIDDEN.
  // - Sub-Branch Admin: Can ONLY see & approve requests from their specific sub-branch. Parent branch and company requests are hidden.
  const scopedRequests = requests.filter(r => {
    if (!user) return false

    // Super Admin: global or company filtered
    if (userScope.isSuperAdmin) {
      if (activeCompanyId && activeCompanyId !== "all") {
        return isMatchingCompany({ id: activeCompanyId } as any, r.companyId)
      }
      return true
    }

    // 1. Sub-Branch Level: strictly scoped to assigned sub-branch
    if (userScope.scopeLevel === 'subbranch') {
      if (!r.subBranchId) return false
      return userScope.allowedSubBranchIds.some(
        id => String(id).toLowerCase().trim() === String(r.subBranchId).toLowerCase().trim()
      )
    }

    // 2. Branch Level: scoped to branch + sub-branches under that branch (NO company HQ direct approvals)
    if (userScope.scopeLevel === 'branch') {
      if (!r.branchId && !r.subBranchId) return false // Direct Company HQ request hidden

      if (r.branchId && userScope.allowedBranchIds.some(
        id => String(id).toLowerCase().trim() === String(r.branchId).toLowerCase().trim()
      )) {
        return true
      }

      if (r.subBranchId && userScope.allowedSubBranchIds.some(
        id => String(id).toLowerCase().trim() === String(r.subBranchId).toLowerCase().trim()
      )) {
        return true
      }

      return false
    }

    // 3. Company Level: can see company HQ, branches, and sub-branches under this company
    return userScope.allowedCompanyIds.some(
      cId => isMatchingCompany({ id: cId } as any, r.companyId)
    )
  })

  // Filtered requests by UI search & status tabs
  const filteredRequests = scopedRequests.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (typeFilter !== "all" && r.type !== typeFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const matchDoc = (r.documentNumber || "").toLowerCase().includes(q)
      const matchClient = (r.clientName || "").toLowerCase().includes(q)
      const matchSubmitter = (r.submittedBy?.name || "").toLowerCase().includes(q)
      const matchTitle = (r.title || "").toLowerCase().includes(q)
      const matchBranch = (r.branchName || "").toLowerCase().includes(q)
      const matchSubBranch = (r.subBranchName || "").toLowerCase().includes(q)
      if (!matchDoc && !matchClient && !matchSubmitter && !matchTitle && !matchBranch && !matchSubBranch) return false
    }
    return true
  })

  // KPI stats from scoped submissions
  const pendingRequests = scopedRequests.filter(r => r.status === "pending")
  const pendingCount = pendingRequests.length
  const pendingAmount = pendingRequests.reduce((sum, r) => sum + (r.amount || 0), 0)
  const approvedCount = scopedRequests.filter(r => r.status === "approved").length
  const rejectedCount = scopedRequests.filter(r => r.status === "rejected").length

  const handleApprove = async (req: ApprovalRequest) => {
    await executeWithFeedback(async () => {
      await approveApprovalRequest(req.id, {
        id: String(user.id || ""),
        name: user.name || "Administrator",
        email: user.email || "",
        role: user.role || "Admin",
      })
      await loadRequests()
    }, {
      actionType: "process",
      loadingTitle: "Approving Submission...",
      loadingMsg: `Approving ${req.type.toUpperCase()} #${req.documentNumber}...`,
      successTitle: "Approved Successfully!",
      successMsg: `${req.title} is now officially approved and activated.`,
    })
  }

  const handleRejectSubmit = async () => {
    if (!rejectItem) return
    const reason = rejectionReason.trim() || "Declined by administrator."

    await executeWithFeedback(async () => {
      await rejectApprovalRequest(rejectItem.id, {
        id: String(user.id || ""),
        name: user.name || "Administrator",
        email: user.email || "",
        role: user.role || "Admin",
      }, reason)
      setRejectItem(null)
      setRejectionReason("")
      await loadRequests()
    }, {
      actionType: "process",
      loadingTitle: "Rejecting Submission...",
      loadingMsg: `Declining ${rejectItem.type.toUpperCase()} #${rejectItem.documentNumber}...`,
      successTitle: "Submission Rejected",
      successMsg: `${rejectItem.title} has been rejected. Notification sent to ${rejectItem.submittedBy.name}.`,
    })
  }

  const handleDelete = async (req: ApprovalRequest) => {
    if (!window.confirm(`Are you sure you want to remove approval record ${req.documentNumber}?`)) return
    await deleteMutation.mutateAsync(req.id)
  }

  const getTypeIcon = (type: ApprovalType) => {
    switch (type) {
      case "invoice":
        return <FileText size={16} className="text-blue-500" />
      case "quotation":
        return <ShoppingCart size={16} className="text-emerald-500" />
      case "subscription":
        return <CreditCard size={16} className="text-purple-500" />
      default:
        return <FileText size={16} className="text-amber-500" />
    }
  }

  
  __ctrl = { loadRequests, user, activeCompanyId, companies, branches, subBranches, canPerformAction, isSuperOrAdmin, canAccessApprovals, canApprove, userScope, companyKey, requests, loading, approveMutation, rejectMutation, deleteMutation, searchQuery, setSearchQuery, statusFilter, setStatusFilter, typeFilter, setTypeFilter, inspectItem, setInspectItem, rejectItem, setRejectItem, rejectionReason, setRejectionReason, scopedRequests, filteredRequests, pendingRequests, pendingCount, pendingAmount, approvedCount, rejectedCount, handleApprove, handleRejectSubmit, handleDelete, getTypeIcon };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2 sm:p-4">
      <ApprovalsSection1 ctrl={__ctrl} />
      <ApprovalsSection2 ctrl={__ctrl} />

      <ApprovalsSection3 ctrl={__ctrl} />
    </div>
  )
}
