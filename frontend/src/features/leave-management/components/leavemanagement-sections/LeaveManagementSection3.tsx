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

export function LeaveManagementSection3({ ctrl }: { ctrl: any }) {
  const { activeTab, canApprove, leaveTypes, isApplyModalOpen, setIsApplyModalOpen, handleApplySubmit, teamMembers, applyForm, setApplyForm } = ctrl;
  return (
    <>
      {/* ── TAB 2: LEAVE TYPES ── */}
      {activeTab === "types" && canApprove && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Leave Policy Name</th>
                <th className="py-3 px-4">Annual Quota (Days)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              {leaveTypes.map(item => (
                <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{item.name}</td>
                  <td className="py-3 px-4 font-mono font-semibold">{item.daysAllowed} days / year</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase border bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── APPLY FOR LEAVE MODAL ── */}
      <AnimatePresence>
        {isApplyModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/50">
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Apply for Leave</h3>
                  <p className="text-[11px] text-zinc-500">Submit an official leave request for approval</p>
                </div>
                <button onClick={() => setIsApplyModalOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
                {/* Employee Selector (Admins can select other members, regular team members see their own name) */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                    Employee Name *
                  </label>
                  {canApprove && teamMembers.length > 0 ? (
                    <select
                      value={applyForm.employeeEmail}
                      onChange={(e) => {
                        const selected = teamMembers.find(m => m.email === e.target.value)
                        setApplyForm({
                          ...applyForm,
                          employee: selected?.name || e.target.value,
                          employeeEmail: e.target.value,
                          employeeId: selected?.id || "",
                          companyId: selected?.companyId || applyForm.companyId
                        })
                      }}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden cursor-pointer"
                    >
                      {teamMembers.map(m => (
                        <option key={m.id || m.email} value={m.email}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input 
                      type="text" 
                      readOnly
                      value={applyForm.employee} 
                      className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-500 cursor-not-allowed font-semibold" 
                    />
                  )}
                </div>

                {/* Leave Type */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                    Leave Type *
                  </label>
                  <select 
                    value={applyForm.type} 
                    onChange={(e) => setApplyForm({...applyForm, type: e.target.value})} 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden cursor-pointer"
                  >
                    {leaveTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name} ({t.daysAllowed} days quota)</option>
                    ))}
                  </select>
                </div>

                {/* From / To Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">From Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={applyForm.from} 
                      onChange={(e) => setApplyForm({...applyForm, from: e.target.value})} 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden" 
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">To Date *</label>
                    <input 
                      type="date" 
                      required 
                      value={applyForm.to} 
                      onChange={(e) => setApplyForm({...applyForm, to: e.target.value})} 
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden" 
                    />
                  </div>
                </div>

                {/* Half Day Checkbox & Calculated Duration */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={applyForm.isHalfDay} 
                      onChange={(e) => setApplyForm({...applyForm, isHalfDay: e.target.checked})} 
                      className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Half Day Request</span>
                  </label>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Duration: {applyForm.days} {applyForm.days === 1 ? "day" : "days"}
                  </span>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-zinc-700 dark:text-zinc-300 font-bold mb-1">
                    Reason for Leave *
                  </label>
                  <textarea 
                    rows={3} 
                    required 
                    placeholder="Provide details about your leave application..."
                    value={applyForm.reason} 
                    onChange={(e) => setApplyForm({...applyForm, reason: e.target.value})} 
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden" 
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <button 
                    type="button" 
                    onClick={() => setIsApplyModalOpen(false)} 
                    className="px-3.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-lg font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
