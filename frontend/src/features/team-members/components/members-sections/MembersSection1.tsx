"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Plus, Download, Mail, X, ExternalLink, CheckCircle2, 
  Briefcase, CheckSquare, Clock, Phone, User, Shield, Building2, Eye,
  DollarSign, Percent, Sparkles, RefreshCw, Lock, Layers, Trash2, Pencil,
  CreditCard, Calendar, FolderKanban, Check, ChevronRight
} from "lucide-react"
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/DataTable"
import { Button } from "@/components/ui/Button"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { taskService } from "@/features/tasks/services/taskService"
import { Task } from "@/features/tasks/types"
import { getUsers, getUserAvatar, deleteUser } from "@/features/users/services/userService"
import { getSubscriptions } from "@/features/subscriptions/services/subscriptionService"
import { Subscription, calculateTeamRevenueShare } from "@/features/subscriptions/types"
import { getProjectWiseUserEarnings, getTeamBankingMap, updateMemberBankingDetails } from "@/features/team/services/teamPaymentService"
import { ProjectUserEarningsRecord, TeamMemberBankingInfo } from "@/features/team/types"
import { AddTeamMemberModal } from "@/features/team/components/AddTeamMemberModal"
import { EditTeamMemberModal } from "@/features/team/components/EditTeamMemberModal"
import { RecordPayoutModal } from "@/features/team/components/RecordPayoutModal"
import { confirmTwoStepDelete } from "@/lib/confirmDialog"
import { type TeamMember } from "@/features/team-members/components/members-sections/MembersHelpers"

export function MembersSection1({ ctrl }: { ctrl: any }) {
  const { selectedMember, setSelectedMember, canEditMember, setEditingMember, canDeleteMember, handleDeleteMember, setDrawerActiveTab, drawerActiveTab, canDisbursePayout, setPayingMember, isEditingBankingInline, handleOpenInlineBanking, setIsEditingBankingInline, inlineSalary, setInlineSalary, inlineBankName, setInlineBankName, inlineAccountNum, setInlineAccountNum, inlineIfsc, setInlineIfsc, inlineUpi, setInlineUpi, handleSaveInlineBanking } = ctrl;
  return (
    <>
      {selectedMember && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity" onClick={() => setSelectedMember(null)} />
            
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-screen max-w-lg bg-white dark:bg-zinc-900 shadow-2xl border-l border-zinc-200 dark:border-zinc-800 flex flex-col"
              >
                {/* Header */}
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-850/50">
                  <div className="flex items-center gap-3">
                    <img src={selectedMember.avatarUrl} alt={selectedMember.name} className="w-12 h-12 rounded-full object-cover border border-zinc-200 dark:border-zinc-700" />
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{selectedMember.name}</h2>
                      <p className="text-xs text-zinc-500">{selectedMember.jobTitle} • {selectedMember.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {canEditMember && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingMember(selectedMember)
                          setSelectedMember(null)
                        }}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                        title="Edit Member"
                      >
                        <Pencil size={15} />
                      </button>
                    )}

                    {canDeleteMember && (
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(selectedMember)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        title="Delete Member"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                    <button type="button" onClick={() => setSelectedMember(null)} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Drawer Tab Navigation */}
                <div className="flex items-center gap-1 px-6 border-b border-zinc-100 dark:border-zinc-800 text-xs overflow-x-auto bg-zinc-50/40 dark:bg-zinc-850/30">
                  {[
                    { id: "overview", label: "Overview" },
                    { id: "projects", label: `Projects (${selectedMember.assignedProjects.length})` },
                    { id: "subs", label: `Subscriptions (${selectedMember.assignedSubscriptions.length})` },
                    { id: "tasks", label: `Tasks (${selectedMember.activeTasks.length})` },
                    { id: "banking", label: "Banking & Salary" },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setDrawerActiveTab(tab.id as any)}
                      className={`py-3 px-2.5 font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                        drawerActiveTab === tab.id
                          ? "border-blue-600 text-blue-600 dark:text-blue-400"
                          : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
                  
                  {/* OVERVIEW TAB */}
                  {drawerActiveTab === "overview" && (
                    <div className="space-y-4">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Branch Office:</span>
                          <strong className="text-zinc-800 dark:text-zinc-200">📍 {selectedMember.branchName || "Central Office / HQ"}</strong>
                        </div>
                        {selectedMember.subbranchName && (
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Sub-Branch / Satellite:</span>
                            <strong className="text-purple-600 dark:text-purple-400">🏢 {selectedMember.subbranchName}</strong>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Email:</span>
                          <strong className="font-mono text-zinc-800 dark:text-zinc-200">{selectedMember.email}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Phone:</span>
                          <strong className="text-zinc-800 dark:text-zinc-200">{selectedMember.phone}</strong>
                        </div>
                      </div>

                      {/* Quick Summary Cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60">
                          <span className="text-[10.5px] text-purple-700 dark:text-purple-300 font-bold block">Project Milestone Earnings</span>
                          <div className="text-base font-black text-purple-900 dark:text-purple-100 mt-0.5">
                            ₹{selectedMember.totalProjectEarnings.toLocaleString("en-IN")}
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-1 block">
                            Across {selectedMember.assignedProjects.length} Projects
                          </span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60">
                          <span className="text-[10.5px] text-indigo-700 dark:text-indigo-300 font-bold block">Subscription Commissions</span>
                          <div className="text-base font-black text-indigo-900 dark:text-indigo-100 mt-0.5">
                            ₹{selectedMember.totalMonthlyCommission.toLocaleString("en-IN")}/mo
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-1 block">
                            From {selectedMember.assignedSubscriptions.length} Subscriptions
                          </span>
                        </div>
                      </div>

                      {/* Action trigger */}
                      {canDisbursePayout && (
                        <div className="pt-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center"
                            leftIcon={<CreditCard size={14} />}
                            onClick={() => {
                              setPayingMember(selectedMember)
                              setSelectedMember(null)
                            }}
                          >
                            Disburse Compensation / Payout Voucher
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROJECTS TAB */}
                  {drawerActiveTab === "projects" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                          Assigned Projects & Revenue Share
                        </h3>
                        <span className="text-[11px] font-black text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                          ₹{selectedMember.totalProjectEarnings.toLocaleString("en-IN")} Total
                        </span>
                      </div>

                      {selectedMember.assignedProjects.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
                          No project assignments found for this team member.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedMember.assignedProjects.map(proj => (
                            <div key={proj.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1.5">
                              <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                                <span>{proj.projectTitle}</span>
                                <span className="text-purple-600 dark:text-purple-400 font-black">{proj.memberSharePercentage}% Share</span>
                              </div>
                              <div className="flex justify-between text-[11px] text-zinc-500">
                                <span>Client: <strong>{proj.clientName}</strong></span>
                                <span>Project Value: ₹{proj.projectTotalValue.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="pt-1.5 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-[11px]">
                                <span className="text-zinc-500">Client Paid: ₹{proj.clientPaymentReceived.toLocaleString("en-IN")}</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                  Member Earned: ₹{proj.memberTotalEarned.toLocaleString("en-IN")} (Pending: ₹{proj.memberPendingAmount.toLocaleString("en-IN")})
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SUBSCRIPTIONS TAB */}
                  {drawerActiveTab === "subs" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                          Managed Subscriptions & Commission Share
                        </h3>
                        <span className="text-[11px] font-black text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                          ₹{selectedMember.totalMonthlyCommission.toLocaleString("en-IN")}/mo
                        </span>
                      </div>

                      {selectedMember.assignedSubscriptions.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
                          No recurring subscription clients assigned yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedMember.assignedSubscriptions.map(sub => {
                            const rev = calculateTeamRevenueShare(sub)
                            return (
                              <div key={sub.id} className="p-3 bg-indigo-50/40 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/60 space-y-1.5">
                                <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-zinc-100">
                                  <span>{sub.planName}</span>
                                  <span className="text-indigo-600 dark:text-indigo-400">{sub.teamSharePercentage || 0}% Share</span>
                                </div>
                                <div className="flex justify-between text-[11px] text-zinc-500">
                                  <span>Client: <strong>{sub.clientName}</strong></span>
                                  <span>Cycle: {sub.billingCycle}</span>
                                </div>
                                <div className="pt-1.5 border-t border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center text-[11px]">
                                  <span className="text-zinc-500">Plan Amount: {sub.amount}</span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    +₹{rev.monthlyRevenue.toLocaleString("en-IN")}/mo
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TASKS TAB */}
                  {drawerActiveTab === "tasks" && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        Active Assigned Tasks ({selectedMember.activeTasks.length})
                      </h3>

                      {selectedMember.activeTasks.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400">
                          No pending tasks. Member is completely available.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {selectedMember.activeTasks.map(t => (
                            <div key={t.id} className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                              <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                                <span>{t.title}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                  {t.status}
                                </span>
                              </div>
                              <div className="flex justify-between text-[10px] text-zinc-400">
                                <span>Project: {t.projectName || t.relatedTo || t.sourceName || "Internal"}</span>
                                <span>Due: {t.deadline || "No deadline"}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BANKING TAB */}
                  {drawerActiveTab === "banking" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          Banking & Salary Settings
                        </h3>
                        {!isEditingBankingInline ? (
                          <button
                            type="button"
                            onClick={() => handleOpenInlineBanking(selectedMember)}
                            className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-1"
                          >
                            <Pencil size={12} />
                            <span>Edit Banking</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditingBankingInline(false)}
                            className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                      </div>

                      {!isEditingBankingInline ? (
                        <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-2">
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Base Salary:</span>
                            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
                              ₹{(selectedMember.bankingInfo?.baseSalary ?? 0).toLocaleString("en-IN")}/mo
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Bank Name:</span>
                            <strong className="text-zinc-800 dark:text-zinc-200">{selectedMember.bankingInfo?.bankName || "Not configured"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Account Number:</span>
                            <strong className="font-mono text-zinc-800 dark:text-zinc-200">{selectedMember.bankingInfo?.accountNumber || "Not configured"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">IFSC Code:</span>
                            <strong className="font-mono text-zinc-800 dark:text-zinc-200">{selectedMember.bankingInfo?.ifscCode || "Not configured"}</strong>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">UPI ID:</span>
                            <strong className="font-mono text-indigo-600 dark:text-indigo-400">{selectedMember.bankingInfo?.upiId || "Not configured"}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-blue-200 dark:border-blue-800 space-y-3">
                          <div>
                            <label className="text-zinc-500 font-semibold block mb-1">Base Salary (₹)</label>
                            <input
                              type="number"
                              value={inlineSalary}
                              onChange={(e) => setInlineSalary(e.target.value === "" ? "" : Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="text-zinc-500 font-semibold block mb-1">Bank Name</label>
                            <input
                              type="text"
                              value={inlineBankName}
                              onChange={(e) => setInlineBankName(e.target.value)}
                              placeholder="e.g. HDFC Bank"
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-zinc-500 font-semibold block mb-1">Account No.</label>
                              <input
                                type="text"
                                value={inlineAccountNum}
                                onChange={(e) => setInlineAccountNum(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                              />
                            </div>

                            <div>
                              <label className="text-zinc-500 font-semibold block mb-1">IFSC Code</label>
                              <input
                                type="text"
                                value={inlineIfsc}
                                onChange={(e) => setInlineIfsc(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono uppercase"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-zinc-500 font-semibold block mb-1">UPI ID</label>
                            <input
                              type="text"
                              value={inlineUpi}
                              onChange={(e) => setInlineUpi(e.target.value)}
                              placeholder="user@upi"
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-mono"
                            />
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full justify-center"
                            onClick={() => handleSaveInlineBanking(selectedMember)}
                          >
                            Save Banking Details
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </motion.div>
            </div>
          </div>
        )}
    </>
  );
}
