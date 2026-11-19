"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar, Plus, Search, Edit, Trash2, X, Check, XCircle, Clock, 
  User, CheckCircle2, AlertCircle, ShieldCheck, Building2, Filter
} from "lucide-react"
import { useAuthStore, getCompanyFullName, isMatchingCompany } from "@/store/useAuthStore"
import { LeaveService } from "@/services/hrService"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { LeaveRequest, LeaveTab as Tab, LeaveType } from "@/features/leave-management/types"
import { useInvalidateLeaveQueries, useLeaveRequestsQuery, useLeaveTeamMembersQuery, useLeaveTypesQuery } from "@/features/leave-management/hooks/useLeaveManagement"

export function LeaveManagementSection1({ ctrl }: { ctrl: any }) {
  const { canApprove, setEditingType, setTypeForm, setIsTypeModalOpen, setApplyForm, user, activeCompanyId, leaveTypes, todayStr, setIsApplyModalOpen, casualUsed, sickUsed, earnedUsed, scopedRequests, setActiveTab, activeTab } = ctrl;
  return (
    <>
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            <span>Leave Management</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {canApprove 
              ? "Review and approve employee leave requests, track team balances, and manage policy quotas" 
              : "Apply for leaves, track review approvals, and monitor your personal leave balance"
            }
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Leave Type Management Button (Admin only) */}
          {canApprove && (
            <button 
              onClick={() => { 
                setEditingType(null)
                setTypeForm({ name: "", daysAllowed: 12 })
                setIsTypeModalOpen(true) 
              }} 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Clock size={14} />
              <span>Add Leave Type</span>
            </button>
          )}

          {/* Apply for Leave Button (EVERYONE CAN APPLY) */}
          <button 
            onClick={() => {
              setApplyForm({
                employee: user?.name || "",
                employeeEmail: user?.email || "",
                employeeId: user?.id || "",
                companyId: user?.companyId || activeCompanyId || "tech",
                type: leaveTypes[0]?.name || "Casual Leave",
                from: todayStr,
                to: todayStr,
                days: 1,
                isHalfDay: false,
                reason: ""
              })
              setIsApplyModalOpen(true)
            }} 
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* ── KPI & BALANCE SUMMARY CARDS ── */}
      {!canApprove ? (
        // Team Member Personal Balance Cards
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Casual Leave Balance</span>
              <span className="font-semibold text-blue-600">12 Total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">{Math.max(0, 12 - casualUsed)}</span>
              <span className="text-xs text-zinc-400">days left ({casualUsed} used)</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Sick Leave Balance</span>
              <span className="font-semibold text-emerald-600">10 Total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">{Math.max(0, 10 - sickUsed)}</span>
              <span className="text-xs text-zinc-400">days left ({sickUsed} used)</span>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>Earned Leave Balance</span>
              <span className="font-semibold text-purple-600">15 Total</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-zinc-900 dark:text-white">{Math.max(0, 15 - earnedUsed)}</span>
              <span className="text-xs text-zinc-400">days left ({earnedUsed} used)</span>
            </div>
          </div>
        </div>
      ) : (
        // Admin / Super Admin Approval Queue KPIs
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <span className="text-xs text-zinc-500">Total Applications</span>
            <p className="text-2xl font-black text-zinc-900 dark:text-white mt-1">{scopedRequests.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/20 shadow-2xs">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <Clock size={12} /> Pending Approval
            </span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {scopedRequests.filter(r => r.status === "Pending").length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 shadow-2xs">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} /> Approved
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {scopedRequests.filter(r => r.status === "Approved").length}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 shadow-2xs">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
              <XCircle size={12} /> Rejected
            </span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {scopedRequests.filter(r => r.status === "Rejected").length}
            </p>
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button 
          onClick={() => setActiveTab("requests")} 
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeTab === "requests" 
              ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20" 
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Calendar size={14} />
          <span>Leave Requests</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800">
            {scopedRequests.length}
          </span>
        </button>

        {canApprove && (
          <button 
            onClick={() => setActiveTab("types")} 
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
              activeTab === "types" 
                ? "border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20" 
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            <Clock size={14} />
            <span>Leave Types & Policy ({leaveTypes.length})</span>
          </button>
        )}
      </div>

      {/* ── TAB 1: REQUESTS ── */}
    </>
  );
}
