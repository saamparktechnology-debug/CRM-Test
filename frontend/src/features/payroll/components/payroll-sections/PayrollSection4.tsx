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

export function PayrollSection4({ ctrl }: { ctrl: any }) {
  const { activePayrollTab, isTeamMember, teamMetrics, searchQuery, setSearchQuery, projectFilter, setProjectFilter, projects, statusFilter, setStatusFilter, filtered, setSelectedPayslipItem, setIsPayslipModalOpen, isAdmin, handleMarkPaid, user, calculateStatutoryPayslip, totalEarnedIncentives } = ctrl;
  return (
    <>
      {/* TAB 2: MONTHLY SALARY RECORDS */}
      {activePayrollTab === "salaries" && (
        <div className="space-y-6">
          {/* Team Member Personal Earnings KPI Cards */}
          {isTeamMember && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-500 font-medium">Pending / Due Payout</span>
                <p className="text-2xl font-black text-amber-600 font-mono">₹{teamMetrics.totalDue.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-zinc-400">Available for payout disbursement</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-500 font-medium">Approved & Paid YTD</span>
                <p className="text-2xl font-black text-emerald-600 font-mono">₹{teamMetrics.totalPaid.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-zinc-400">Total received compensation</p>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-1">
                <span className="text-xs text-zinc-500 font-medium">Registered Payout Account</span>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{teamMetrics.bankName}</p>
                <p className="font-mono text-xs text-blue-600 dark:text-blue-400 font-semibold">{teamMetrics.accountNumber}</p>
              </div>
            </div>
          )}

          {/* Filter and Search controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search employee or project..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500" 
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <select 
                value={projectFilter} 
                onChange={(e) => setProjectFilter(e.target.value)} 
                className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="all">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>

              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Assignment / Project</th>
                    <th className="py-3.5 px-4">Month</th>
                    <th className="py-3.5 px-4">Basic</th>
                    <th className="py-3.5 px-4">Allowances</th>
                    <th className="py-3.5 px-4">Deductions</th>
                    <th className="py-3.5 px-4">Net Salary</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-zinc-400">
                        No payroll records found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map(item => (
                      <tr key={item.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                            {item.employee.charAt(0)}
                          </div>
                          <span>{item.employee}</span>
                        </td>
                        <td className="py-3 px-4">
                          {item.projectName ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                              <FolderKanban size={11} /> {item.projectName}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400">
                              <User size={11} /> Individual
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px]">{item.month}</td>
                        <td className="py-3 px-4 font-mono font-semibold">₹{(item.basic || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 font-mono text-emerald-600 font-semibold">+₹{(item.allowances || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 font-mono text-rose-600 font-semibold">-₹{(item.deductions || 0).toLocaleString("en-IN")}</td>
                        <td className="py-3 px-4 font-bold font-mono text-blue-600 dark:text-blue-400 text-sm">
                          ₹{(item.net || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === "Paid" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" 
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedPayslipItem(item)
                                setIsPayslipModalOpen(true)
                              }}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <FileText size={12} />
                              <span>Payslip</span>
                            </button>
                            {isAdmin && item.status !== "Paid" && (
                              <button 
                                onClick={() => handleMarkPaid(item.id)} 
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Check size={12} />
                                <span>Mark Paid</span>
                              </button>
                            )}
                          </div>
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

      {/* TAB 3: STATUTORY PAY SLIPS (PF & ESI) */}
      {activePayrollTab === "payslips" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Statutory Pay Slip Center (India PF & ESI Compliant)</span>
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Statutory deductions configured as per Ministry of Labour & Employment guidelines: PF (12% of Basic), ESI (0.75% of Gross), and Professional Tax.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const sample = filtered[0] || {
                  employee: user?.name || "Employee",
                  month: new Date().toISOString().slice(0, 7),
                  basic: 25000,
                  allowances: 10000,
                  deductions: 3200,
                  net: 31800,
                  status: "Paid",
                }
                setSelectedPayslipItem(sample)
                setIsPayslipModalOpen(true)
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 self-start md:self-auto"
            >
              <FileText size={14} />
              <span>Preview Statutory Pay Slip</span>
            </button>
          </div>

          {/* Grid of Available Pay Slip Records */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(filtered.length > 0 ? filtered : [
              {
                id: "current_month",
                employee: user?.name || "Team Member",
                month: new Date().toISOString().slice(0, 7),
                basic: 30000,
                allowances: 12000,
                deductions: 3800,
                net: 38200,
                status: "Current Month",
                projectName: "Active Engagements",
              }
            ]).map((slip, sIdx) => {
              const breakdown = calculateStatutoryPayslip(slip.basic + slip.allowances, totalEarnedIncentives)
              return (
                <div
                  key={slip.id || sIdx}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <div>
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 block">
                        {slip.employee}
                      </span>
                      <span className="font-mono text-xs text-zinc-400">Month: {slip.month}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                      PF & ESI Active
                    </span>
                  </div>

                  {/* Dual Column Financial Snapshot */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Gross Earnings</span>
                      <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">₹{breakdown.gross.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-emerald-600">+ Incentive: ₹{breakdown.incentiveAmt.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold block">Statutory Deductions</span>
                      <div className="font-mono font-bold text-rose-600">-₹{breakdown.totalDeductions.toLocaleString("en-IN")}</div>
                      <div className="text-[10px] text-zinc-400">PF (12%) + ESI (0.75%)</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 block font-semibold">Net Take-Home:</span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-base">
                        ₹{breakdown.netSalary.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPayslipItem(slip)
                        setIsPayslipModalOpen(true)
                      }}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <FileText size={12} />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  );
}
