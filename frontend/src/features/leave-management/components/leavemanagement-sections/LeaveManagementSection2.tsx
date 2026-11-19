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

export function LeaveManagementSection2({ ctrl }: { ctrl: any }) {
  const { activeTab, searchQuery, setSearchQuery, canApprove, setViewScope, viewScope, statusFilter, setStatusFilter, scopedRequests, handleApprove, handleReject } = ctrl;
  return (
    <>
      {activeTab === "requests" && (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search employee, leave type, reason..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {canApprove && (
                <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setViewScope("all")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewScope === "all" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs" : "text-zinc-500"}`}
                  >
                    All Company
                  </button>
                  <button
                    onClick={() => setViewScope("my")}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${viewScope === "my" ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs" : "text-zinc-500"}`}
                  >
                    My Applications
                  </button>
                </div>
              )}

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden cursor-pointer font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Duration (From - To)</th>
                    <th className="py-3 px-4">Total Days</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {scopedRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-zinc-400">
                        <Calendar size={28} className="mx-auto mb-2 opacity-40" />
                        <p className="font-semibold">No leave applications found.</p>
                        <p className="text-[11px] mt-1">Click "Apply for Leave" above to submit a new request.</p>
                      </td>
                    </tr>
                  ) : (
                    scopedRequests.map(item => {
                      const isPending = item.status === "Pending"
                      const isApproved = item.status === "Approved"
                      const isRejected = item.status === "Rejected"

                      return (
                        <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img 
                                src={getUserAvatar(item.employeeEmail || item.employee, undefined, item.employee)} 
                                alt={item.employee} 
                                className="w-6 h-6 rounded-full border shrink-0" 
                              />
                              <div>
                                <span className="font-bold text-zinc-900 dark:text-zinc-100 block">{item.employee}</span>
                                {item.employeeEmail && <span className="text-[10px] text-zinc-400 font-mono">{item.employeeEmail}</span>}
                              </div>
                            </div>
                          </td>

                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-900">
                              {item.type}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-mono text-[11px]">
                            {item.from} <span className="text-zinc-400">to</span> {item.to}
                            {item.isHalfDay && <span className="ml-1 text-[10px] text-amber-600 font-bold">(Half Day)</span>}
                          </td>

                          <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">
                            {item.days} {item.days === 1 ? "day" : "days"}
                          </td>

                          <td className="py-3 px-4 max-w-xs truncate text-zinc-600 dark:text-zinc-400" title={item.reason || "No reason specified"}>
                            {item.reason || "No reason specified"}
                          </td>

                          <td className="py-3 px-4">
                            {isApproved && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                                <CheckCircle2 size={11} /> Approved
                              </span>
                            )}
                            {isRejected && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
                                <XCircle size={11} /> Rejected
                              </span>
                            )}
                            {isPending && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800 animate-pulse">
                                <Clock size={11} /> Pending Review
                              </span>
                            )}
                            {item.reviewedBy && (
                              <span className="block text-[9px] text-zinc-400 mt-0.5">by {item.reviewedBy}</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* ADMIN APPROVAL / REJECTION BUTTONS */}
                              {canApprove && isPending ? (
                                <>
                                  <button 
                                    onClick={() => handleApprove(item.id)} 
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 rounded-md transition-all cursor-pointer" 
                                    title="Approve Leave"
                                  >
                                    <Check size={13} />
                                    <span>Approve</span>
                                  </button>
                                  <button 
                                    onClick={() => handleReject(item.id)} 
                                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 rounded-md transition-all cursor-pointer" 
                                    title="Reject Leave"
                                  >
                                    <XCircle size={13} />
                                    <span>Reject</span>
                                  </button>
                                </>
                              ) : (
                                <span className="text-[11px] text-zinc-400 font-medium">
                                  {isPending ? "Awaiting Decision" : "Processed"}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}
