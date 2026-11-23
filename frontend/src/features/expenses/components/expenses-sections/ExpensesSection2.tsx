"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calculator, Plus, Search, Download, Trash2, CheckCircle2, 
  Clock, XCircle, FileText, Printer, X, Check, DollarSign,
  Briefcase, Users, TrendingUp, Percent, ArrowUpRight, ArrowDownRight,
  Receipt, Building2, Tag, Layers, CreditCard, ShieldAlert, Sparkles, User
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems, markGlobalItemDeleted } from "@/lib/storageSync"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { getProjects } from "@/features/projects/services/projectService"
import { Project, ProjectMember } from "@/features/projects/types"
import { getInvoices, InvoiceItem } from "@/features/invoice/services/invoiceService"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { formatDisplayDate } from "@/lib/utils"
import { type ProjectExtraCharge, type ExpenseItem, type ExpenseTab } from "@/features/expenses/components/expenses-sections/ExpensesHelpers"

export function ExpensesSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { activeViewTab, totalExpenseNum, approvedNum, pendingCount, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, filteredExpenses, canEditExpense, handleUpdateStatus, canDeleteExpense, handleDelete } = ctrl;
  return (
    <>
      {activeViewTab === "all" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Total Expenses Incurred</p>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">₹{totalExpenseNum.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 text-rose-600 rounded-lg">
                <Calculator size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Approved &amp; Settled</p>
                <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">₹{approvedNum.toLocaleString("en-IN")}</h3>
              </div>
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-lg">
                <CheckCircle2 size={20} />
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-medium">Pending Approval</p>
                <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{pendingCount} Expenses</h3>
              </div>
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-lg">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search expense, project, category, member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-medium text-zinc-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Categories</option>
                {(masterBundle?.options?.["expense_category"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ref #</th>
                  <th className="py-3 px-4">Expense Title</th>
                  <th className="py-3 px-4">Associated Project</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Paid By</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-zinc-400">
                      No expense records found. Click "+ Add Expense" to log business costs.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => {
                    let statusBadge = "bg-zinc-100 text-zinc-700 border-zinc-200"
                    if (exp.status === "Approved") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                    if (exp.status === "Pending") statusBadge = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800"
                    if (exp.status === "Rejected") statusBadge = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800"

                    return (
                      <tr key={exp.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {exp.expenseNumber}
                        </td>
                        <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">
                          {exp.title}
                        </td>
                        <td className="py-3 px-4">
                          {exp.projectName ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10.5px] font-semibold border border-blue-200 dark:border-blue-800">
                              <Briefcase size={10} />
                              <span className="truncate max-w-[140px]">{exp.projectName}</span>
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic text-[11px]">General Overhead</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400 font-medium">
                          {exp.category}
                        </td>
                        <td className="py-3 px-4 font-bold text-rose-600 dark:text-rose-400 font-mono">
                          {exp.amount}
                        </td>
                        <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">{formatDisplayDate(exp.date)}</td>
                        <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">{exp.member}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${statusBadge}`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {canEditExpense && exp.status === "Pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(exp.id, "Approved")}
                                  className="p-1 rounded text-emerald-600 hover:bg-emerald-50"
                                  title="Approve Expense"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(exp.id, "Rejected")}
                                  className="p-1 rounded text-rose-600 hover:bg-rose-50"
                                  title="Reject Expense"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            )}

                            {canDeleteExpense && (
                              <button
                                type="button"
                                onClick={() => handleDelete(exp.id)}
                                className="p-1 hover:text-rose-600 text-zinc-400 transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
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
      )}
    </>
  );
}
