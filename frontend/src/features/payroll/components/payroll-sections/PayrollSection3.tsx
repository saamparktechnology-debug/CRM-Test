"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  DollarSign, Plus, Search, Check, Clock, Edit, X, 
  FolderKanban, User, Users, Briefcase, Filter, Award, 
  FileText, Printer, Download, ShieldCheck, Percent, 
  TrendingUp, CheckCircle2, Building2, Sparkles, AlertCircle, 
  ArrowUpRight, ExternalLink
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { PayrollService } from "@/services/hrService"
import { getProjects } from "@/features/projects/services/projectService"
import { getStoredUserAccountsAsync } from "@/features/users/services/userService"
import { Project } from "@/features/projects/types"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type PayrollItem } from "@/features/payroll/components/payroll-sections/PayrollHelpers"

export function PayrollSection3({ ctrl }: { ctrl: any }) {
  const { isTeamMember, isAdmin, setSelectionMode, setForm, setSelectedProjectId, setSelectedProjectMembers, setIsModalOpen, setIsPayoutModalOpen, setActivePayrollTab, activePayrollTab, userIncentivesList, filtered, successfulProjectsCount, totalEarnedIncentives, totalPendingIncentives, teamMetrics, setPayoutReqType, setPayoutReqAmount, setPayoutReqNotes, handleRequestIncentiveForProject } = ctrl;
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200/60 dark:border-blue-800">
              <DollarSign size={22} />
            </div>
            <span>{isTeamMember ? "My Earnings & Compensation" : "Payroll Management"}</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            {isTeamMember
              ? "View your personal earnings breakdown, payslips, and request advances or payouts"
              : "Generate and manage employee payroll against specific projects or individual team members"}
          </p>
        </div>

        {isAdmin ? (
          <button 
            onClick={() => { 
              setSelectionMode("project")
              setForm({ 
                employee: "", 
                employeeId: "",
                projectId: "",
                projectName: "",
                month: new Date().toISOString().slice(0, 7), 
                basic: 0, 
                allowances: 0, 
                deductions: 0 
              })
              setSelectedProjectId("")
              setSelectedProjectMembers([])
              setIsModalOpen(true) 
            }} 
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Generate Payroll</span>
          </button>
        ) : (
          <button 
            onClick={() => setIsPayoutModalOpen(true)} 
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Plus size={14} />
            <span>Request Payout / Advance</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActivePayrollTab("incentives")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activePayrollTab === "incentives"
              ? "border-purple-600 text-purple-600 dark:text-purple-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <Award size={15} />
          <span>Project Incentives & Counts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
            {userIncentivesList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePayrollTab("salaries")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activePayrollTab === "salaries"
              ? "border-blue-600 text-blue-600 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <DollarSign size={15} />
          <span>Monthly Salary Records</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold">
            {filtered.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActivePayrollTab("payslips")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activePayrollTab === "payslips"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <FileText size={15} />
          <span>Statutory Pay Slips (PF & ESI)</span>
        </button>
      </div>

      {/* TAB 1: PROJECT INCENTIVES & SUCCESSFUL COUNTS */}
      {activePayrollTab === "incentives" && (
        <div className="space-y-6">
          {/* Top KPI Cards for Incentives */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Successful Projects Delivered</span>
              </span>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {successfulProjectsCount}
              </p>
              <p className="text-[11px] text-zinc-400">Successfully completed projects count</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <TrendingUp size={13} className="text-emerald-600" />
                <span>Earned Incentives (Pro-Rata)</span>
              </span>
              <p className="text-2xl font-black text-emerald-600 font-mono">
                ₹{totalEarnedIncentives.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-emerald-600/80">Accrued from received client payments</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-amber-500" />
                <span>Pending Client Balance</span>
              </span>
              <p className="text-2xl font-black text-amber-600 font-mono">
                ₹{totalPendingIncentives.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-400">Unlocks upon client balance settlement</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                <Building2 size={13} className="text-blue-500" />
                <span>Disbursement Account</span>
              </span>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {teamMetrics.bankName}
              </p>
              <p className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">
                {teamMetrics.accountNumber}
              </p>
            </div>
          </div>

          {/* Pro-Rata Attribution Guide Banner */}
          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-600 text-white shrink-0">
                <Percent size={15} />
              </div>
              <div>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  Pro-Rata Commission Structure: Advance & Final Settlement
                </span>
                <p className="text-[11px] text-zinc-500">
                  When a client pays an advance (e.g. ₹100 on ₹1,000 project at 10% commission), you earn ₹10 immediately. The remaining ₹90 unlocks automatically once the client clears the final invoice balance.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPayoutReqType("Monthly Salary Payout")
                setPayoutReqAmount(String(totalEarnedIncentives > 0 ? totalEarnedIncentives : 5000))
                setPayoutReqNotes("Total accrued project incentives payout request")
                setIsPayoutModalOpen(true)
              }}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer shrink-0"
            >
              Request Total Incentive →
            </button>
          </div>

          {/* Incentives Ledger Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Project & Category</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Delivery Status</th>
                    <th className="py-3.5 px-4">Total Value</th>
                    <th className="py-3.5 px-4">Client Paid / Due</th>
                    <th className="py-3.5 px-4">Share %</th>
                    <th className="py-3.5 px-4">Earned (Pro-Rata)</th>
                    <th className="py-3.5 px-4">Pending Due</th>
                    <th className="py-3.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {userIncentivesList.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400">
                        No project commission records found. You will see incentives here once assigned to active or completed projects.
                      </td>
                    </tr>
                  ) : (
                    userIncentivesList.map((item, idx) => (
                      <tr key={`${item.projectId}_${idx}`} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-zinc-900 dark:text-zinc-100">{item.projectTitle}</div>
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-semibold mt-0.5 ${
                            item.category === "Digital Marketing"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                          }`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-600 dark:text-zinc-400">
                          {item.client}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.isCompleted
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          ₹{item.projectTotal.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-emerald-600 font-mono font-semibold text-[11px]">
                            Paid: ₹{item.clientPaid.toLocaleString("en-IN")}
                          </div>
                          {item.clientDue > 0 && (
                            <div className="text-amber-600 font-mono text-[10px]">
                              Due: ₹{item.clientDue.toLocaleString("en-IN")}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-purple-600">
                          {item.sharePct}%
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                            ₹{item.earnedIncentive.toLocaleString("en-IN")}
                          </div>
                          <span className="text-[10px] text-zinc-400">
                            of ₹{item.totalPotential.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold font-mono text-amber-600 text-xs">
                            ₹{item.pendingIncentive.toLocaleString("en-IN")}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleRequestIncentiveForProject(item)}
                            className="px-2.5 py-1 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 rounded-lg transition-colors cursor-pointer"
                          >
                            Request Payout
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
