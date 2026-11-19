"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, Plus, Search, Edit, Trash2, X, Check, XCircle, Clock, 
  User, CheckCircle2, AlertCircle, ShieldCheck, Building2, Filter
} from "lucide-react"
import { useAuthStore, getCompanyFullName, isMatchingCompany } from "@/store/useAuthStore"
import { LeaveService } from "@/services/hrService"
import { getUsers, getUserAvatar } from "../users/services/userService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"

import { LeaveRequest, LeaveTab as Tab, LeaveType } from "./types"
import { useInvalidateLeaveQueries, useLeaveRequestsQuery, useLeaveTeamMembersQuery, useLeaveTypesQuery } from "./hooks/useLeaveManagement"
import { LeaveManagementSection1 } from "@/features/leave-management/components/leavemanagement-sections/LeaveManagementSection1"
import { LeaveManagementSection2 } from "@/features/leave-management/components/leavemanagement-sections/LeaveManagementSection2"
import { LeaveManagementSection3 } from "@/features/leave-management/components/leavemanagement-sections/LeaveManagementSection3"

export default function LeaveManagementMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, activeCompanyId, companies } = useAuthStore()
  const isSuperAdmin = user?.role === "Super Admin"
  const isAdmin = user?.role === "Admin"
  const canApprove = isSuperAdmin || isAdmin

  const [activeTab, setActiveTab] = React.useState<Tab>("requests")
  const todayStrFallback = new Date().toISOString().split("T")[0]
  const { data: requests = [] } = useLeaveRequestsQuery(todayStrFallback)
  const { data: leaveTypes = [] } = useLeaveTypesQuery()
  const { data: teamMembers = [] } = useLeaveTeamMembersQuery()
  const loadData = useInvalidateLeaveQueries()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [viewScope, setViewScope] = React.useState<"all" | "my">("all")
  
  // Modals
  const [isApplyModalOpen, setIsApplyModalOpen] = React.useState(false)
  const [isTypeModalOpen, setIsTypeModalOpen] = React.useState(false)
  const [editingType, setEditingType] = React.useState<LeaveType | null>(null)
  
  // Apply Form State
  const todayStr = new Date().toISOString().split("T")[0]
  const [applyForm, setApplyForm] = React.useState({
    employee: user?.name || "",
    employeeEmail: user?.email || "",
    employeeId: user?.id || "",
    companyId: user?.companyId || activeCompanyId || "tech",
    type: "Casual Leave",
    from: todayStr,
    to: todayStr,
    days: 1,
    isHalfDay: false,
    reason: ""
  })

  // Type Form State
  const [typeForm, setTypeForm] = React.useState({ name: "", daysAllowed: 12 })

  // Auto-calculate days when from/to/halfDay change
  React.useEffect(() => {
    if (applyForm.isHalfDay) {
      setApplyForm(prev => ({ ...prev, days: 0.5 }))
      return
    }
    if (applyForm.from && applyForm.to) {
      const start = new Date(applyForm.from).getTime()
      const end = new Date(applyForm.to).getTime()
      if (end >= start) {
        const diffDays = Math.round((end - start) / (1000 * 3600 * 24)) + 1
        setApplyForm(prev => ({ ...prev, days: Math.max(1, diffDays) }))
      } else {
        setApplyForm(prev => ({ ...prev, days: 1 }))
      }
    }
  }, [applyForm.from, applyForm.to, applyForm.isHalfDay])

  

  // Company and User Scoped Requests
  const scopedRequests = React.useMemo(() => {
    return requests.filter(r => {
      // 1. Company scope
      if (activeCompanyId && activeCompanyId !== "all") {
        const comp = r.companyId || "tech"
        if (!isMatchingCompany({ id: comp, slug: comp } as any, activeCompanyId)) {
          return false
        }
      }

      // 2. Normal team members can only see their own requests unless switched to team view
      if (!canApprove || viewScope === "my") {
        const isMyEmail = r.employeeEmail && user?.email && r.employeeEmail.toLowerCase() === user.email.toLowerCase()
        const isMyName = r.employee.toLowerCase() === (user?.name || "").toLowerCase()
        if (!isMyEmail && !isMyName) return false
      }

      // 3. Status filter
      if (statusFilter !== "all" && r.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false
      }

      // 4. Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          r.employee.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.reason && r.reason.toLowerCase().includes(q))
        )
      }

      return true
    })
  }, [requests, activeCompanyId, canApprove, viewScope, user, statusFilter, searchQuery])

  // Balance Metrics (for employee or general)
  const myLeaves = React.useMemo(() => {
    return requests.filter(r => 
      (r.employeeEmail && user?.email && r.employeeEmail.toLowerCase() === user.email.toLowerCase()) ||
      r.employee.toLowerCase() === (user?.name || "").toLowerCase()
    )
  }, [requests, user])

  const casualUsed = myLeaves.filter(r => r.type === "Casual Leave" && r.status === "Approved").reduce((s, r) => s + r.days, 0)
  const sickUsed = myLeaves.filter(r => r.type === "Sick Leave" && r.status === "Approved").reduce((s, r) => s + r.days, 0)
  const earnedUsed = myLeaves.filter(r => r.type === "Earned Leave" && r.status === "Approved").reduce((s, r) => s + r.days, 0)

  // Submit Leave Request
  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!applyForm.employee.trim()) return

    await executeWithFeedback(async () => {
      await LeaveService.requestLeave({
        ...applyForm,
        companyId: applyForm.companyId || activeCompanyId || user?.companyId || "tech",
        status: "Pending"
      })
    }, { actionType: "create", successTitle: "Leave Application Submitted" })

    setIsApplyModalOpen(false)
    loadData()
  }

  // Type Submit
  const handleTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!typeForm.name.trim()) return
    await executeWithFeedback(async () => {
      await LeaveService.createType(typeForm)
    }, { actionType: editingType ? "update" : "create", successTitle: editingType ? "Type Updated" : "Type Created" })
    setIsTypeModalOpen(false)
    loadData()
  }

  // Approve Request
  const handleApprove = async (id: string) => {
    if (!canApprove) return
    await executeWithFeedback(async () => { 
      await LeaveService.approve(id, `Approved by ${user?.name || "Admin"}`) 
    }, { actionType: "update", successTitle: "Leave Approved" })
    loadData()
  }

  // Reject Request
  const handleReject = async (id: string) => {
    if (!canApprove) return
    const reason = prompt("Enter reason for rejection (optional):")
    await executeWithFeedback(async () => { 
      await LeaveService.reject(id, reason || `Rejected by ${user?.name || "Admin"}`) 
    }, { actionType: "update", successTitle: "Leave Rejected" })
    loadData()
  }

  
  __ctrl = { user, activeCompanyId, companies, isSuperAdmin, isAdmin, canApprove, activeTab, setActiveTab, todayStrFallback, requests, leaveTypes, teamMembers, loadData, searchQuery, setSearchQuery, statusFilter, setStatusFilter, viewScope, setViewScope, isApplyModalOpen, setIsApplyModalOpen, isTypeModalOpen, setIsTypeModalOpen, editingType, setEditingType, todayStr, applyForm, setApplyForm, typeForm, setTypeForm, scopedRequests, myLeaves, casualUsed, sickUsed, earnedUsed, handleApplySubmit, handleTypeSubmit, handleApprove, handleReject };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      
      <LeaveManagementSection1 ctrl={__ctrl} />
      <LeaveManagementSection2 ctrl={__ctrl} />

      <LeaveManagementSection3 ctrl={__ctrl} />

      {/* ── ADD LEAVE TYPE MODAL ── */}
      <AnimatePresence>
        {isTypeModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="font-bold text-sm">Add Leave Policy Type</h3>
                <button onClick={() => setIsTypeModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"><X size={16} /></button>
              </div>
              <form onSubmit={handleTypeSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Policy Name *</label>
                  <input type="text" required placeholder="e.g. Parental Leave, Exam Leave..." value={typeForm.name} onChange={(e) => setTypeForm({...typeForm, name: e.target.value})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-semibold mb-1">Days Allowed Per Year *</label>
                  <input type="number" min="1" value={typeForm.daysAllowed} onChange={(e) => setTypeForm({...typeForm, daysAllowed: Number(e.target.value)})} className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button type="button" onClick={() => setIsTypeModalOpen(false)} className="px-3 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 rounded-lg font-semibold cursor-pointer">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer">Create Type</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
