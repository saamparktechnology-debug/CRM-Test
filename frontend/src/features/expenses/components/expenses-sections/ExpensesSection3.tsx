"use client"

import * as React from "react"
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

export function ExpensesSection3({ ctrl }: { ctrl: any }) {
  const { activeViewTab, selectedProjectId, setSelectedProjectId, projects, currentProject, setIsProjectScoped, setFormProjectId, setIsAddModalOpen, setIsAddExtraChargeModalOpen, projectRevenueNum, totalMemberExpensesNum, projectExpenses, totalExtraChargesNum, projectExtraCharges, isProfitable, profitMarginPct, netProfit, totalProjectExpenses, memberCostMap, setMember, handleDeleteExtraCharge, handleDelete } = ctrl;
  return (
    <>
      {activeViewTab === "project_wise" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Project Selector Bar */}
          <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Select Project to Inspect Profitability</h3>
                  <p className="text-[11px] text-zinc-500">Live reconciliation of contract billing vs. assigned member costs &amp; custom payee expenses</p>
                </div>
              </div>

              {/* Project Dropdown */}
              <div className="w-full sm:w-80">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({p.client || "Client"}) — {p.price || "₹0"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Project Info Pill */}
            {currentProject && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                    <Building2 size={13} className="text-blue-500" />
                    <span>Client: {currentProject.client}</span>
                  </span>
                  <span className="text-zinc-500">|</span>
                  <span className="text-zinc-500">Timeline: {currentProject.startDate || "Ongoing"} &rarr; {currentProject.deadline || "TBD"}</span>
                  <span className="text-zinc-500">|</span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 text-[10.5px] font-bold">
                    {currentProject.status || "In Progress"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProjectScoped(true)
                      setFormProjectId(currentProject.id)
                      setIsAddModalOpen(true)
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs hover:bg-blue-100 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Log Member Expense</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddExtraChargeModalOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs hover:bg-purple-100 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Custom Extra Charge</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 4 Financial Performance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Contract Revenue */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>Contract Billed Revenue</span>
                <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600">
                  <Receipt size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-zinc-100">
                ₹{projectRevenueNum.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-500">Gross billing agreed with client</p>
            </div>

            {/* 2. Team Member Expenses */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>Team Member Costs</span>
                <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                  <Users size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                ₹{totalMemberExpensesNum.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-500">{projectExpenses.length} member expense logs recorded</p>
            </div>

            {/* 3. Custom Extra Charges */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-1.5">
              <div className="flex items-center justify-between text-zinc-500 text-xs font-semibold">
                <span>Custom Direct Charges</span>
                <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600">
                  <Tag size={14} />
                </div>
              </div>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                ₹{totalExtraChargesNum.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-500">{projectExtraCharges.length} subcontractor / supplier charges</p>
            </div>

            {/* 4. Net Profit & Margin */}
            <div className={`p-5 rounded-2xl border shadow-2xs space-y-1.5 ${
              isProfitable 
                ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" 
                : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800"
            }`}>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={isProfitable ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"}>
                  Net Profit (Take-Home)
                </span>
                <span className={`px-2 py-0.5 rounded-full font-mono text-[10.5px] font-bold ${
                  isProfitable ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
                }`}>
                  {profitMarginPct}% Margin
                </span>
              </div>
              <p className={`text-2xl font-black ${isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                ₹{netProfit.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-zinc-500">
                Total Expenses: ₹{totalProjectExpenses.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          {/* Interactive Profitability Split Progress Bar */}
          {projectRevenueNum > 0 && (
            <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <span>📊 Project Financial Distribution &amp; Cost Allocation</span>
                <span className="font-mono text-zinc-500">Revenue: ₹{projectRevenueNum.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-3 rounded-full overflow-hidden flex bg-zinc-200 dark:bg-zinc-800 shadow-inner">
                {/* Net Profit Bar */}
                {isProfitable && (
                  <div
                    style={{ width: `${Math.max(0, Math.min(100, profitMarginPct))}%` }}
                    className="bg-emerald-500 h-full transition-all text-[9px] text-white font-bold flex items-center justify-center"
                    title={`Net Profit: ₹${netProfit.toLocaleString("en-IN")} (${profitMarginPct}%)`}
                  >
                    {profitMarginPct >= 15 ? `${profitMarginPct}% Profit` : ""}
                  </div>
                )}
                {/* Team Costs Bar */}
                <div
                  style={{ width: `${Math.min(100, Math.round((totalMemberExpensesNum / projectRevenueNum) * 100))}%` }}
                  className="bg-amber-500 h-full transition-all text-[9px] text-white font-bold flex items-center justify-center"
                  title={`Member Costs: ₹${totalMemberExpensesNum.toLocaleString("en-IN")}`}
                >
                  {Math.round((totalMemberExpensesNum / projectRevenueNum) * 100) >= 12 ? "Member Costs" : ""}
                </div>
                {/* Extra Charges Bar */}
                <div
                  style={{ width: `${Math.min(100, Math.round((totalExtraChargesNum / projectRevenueNum) * 100))}%` }}
                  className="bg-purple-600 h-full transition-all text-[9px] text-white font-bold flex items-center justify-center"
                  title={`Custom Extra Charges: ₹${totalExtraChargesNum.toLocaleString("en-IN")}`}
                >
                  {Math.round((totalExtraChargesNum / projectRevenueNum) * 100) >= 12 ? "Extra Charges" : ""}
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-semibold pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span>Net Profit: ₹{netProfit.toLocaleString("en-IN")} ({profitMarginPct}%)</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Member Costs: ₹{totalMemberExpensesNum.toLocaleString("en-IN")}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block" />
                  <span>Extra Charges: ₹{totalExtraChargesNum.toLocaleString("en-IN")}</span>
                </span>
              </div>
            </div>
          )}

          {/* ---------------- ASSIGNED TEAM MEMBERS & COST ALLOCATION ---------------- */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span>Assigned Team Members &amp; Individual Expense Attribution</span>
                </h3>
                <p className="text-[11px] text-zinc-500">Track costs logged by or allocated to each specialist on this deliverable</p>
              </div>
            </div>

            {(!currentProject?.members || currentProject.members.length === 0) ? (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-700 text-center text-xs text-zinc-400">
                No team members assigned to this project yet. Edit the project in Projects module to assign staff.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {currentProject.members.map((m) => {
                  const mKey = (m.name || "").toLowerCase().trim()
                  const mCost = memberCostMap[mKey] || 0
                  return (
                    <div
                      key={m.id || m.name}
                      className="p-3.5 rounded-xl bg-zinc-50/80 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-700/60 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={m.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${m.name}`}
                          alt={m.name}
                          className="w-8 h-8 rounded-full border shrink-0"
                        />
                        <div className="truncate">
                          <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 truncate">{m.name}</h4>
                          <p className="text-[10px] text-zinc-500 truncate">{m.role || "Member"}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 block">
                          ₹{mCost.toLocaleString("en-IN")}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setIsProjectScoped(true)
                            setFormProjectId(currentProject.id)
                            setMember(m.name)
                            setIsAddModalOpen(true)
                          }}
                          className="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer"
                        >
                          + Log Cost
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ---------------- CUSTOM DIRECT EXTRA CHARGES LEDGER ---------------- */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Tag size={16} className="text-purple-600" />
                  <span>Custom Direct Extra Charges &amp; Subcontracting Costs</span>
                </h3>
                <p className="text-[11px] text-zinc-500">Dedicated supplies, cloud servers, specialized APIs, or subcontractor invoices</p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddExtraChargeModalOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                <Plus size={13} />
                <span>Add Extra Charge</span>
              </button>
            </div>

            {projectExtraCharges.length === 0 ? (
              <div className="p-6 rounded-xl bg-purple-50/20 dark:bg-purple-950/10 border border-dashed border-purple-200/60 dark:border-purple-800/40 text-center text-xs text-zinc-500 space-y-1">
                <p className="font-semibold text-zinc-800 dark:text-zinc-200">No custom extra charges recorded for this project.</p>
                <p className="text-[11px]">Click above to add supplier bills, subcontractor charges, or domain/hosting fees.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10.5px]">
                    <tr>
                      <th className="py-2.5 px-3.5">Charge Item</th>
                      <th className="py-2.5 px-3.5">Category</th>
                      <th className="py-2.5 px-3.5">Payee / Supplier</th>
                      <th className="py-2.5 px-3.5">Date</th>
                      <th className="py-2.5 px-3.5 text-right">Amount</th>
                      <th className="py-2.5 px-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                    {projectExtraCharges.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">{c.title}</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium text-[10.5px] border border-purple-200 dark:border-purple-800">
                            {c.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-zinc-600 dark:text-zinc-400">{c.payee || c.vendor || "Direct Payee"}</td>
                        <td className="py-2.5 px-3.5 font-mono text-zinc-500 text-[11px]">{formatDisplayDate(c.date)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                          ₹{c.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteExtraCharge(c.id, c.title)}
                            className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                            title="Delete Charge"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ---------------- COMBINED PROJECT EXPENSES LEDGER ---------------- */}
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-2xs space-y-4">
            <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Receipt size={16} className="text-emerald-600" />
              <span>All Logged Expenses for {currentProject?.title}</span>
            </h3>

            <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10.5px]">
                  <tr>
                    <th className="py-2.5 px-3.5">Ref #</th>
                    <th className="py-2.5 px-3.5">Expense Title</th>
                    <th className="py-2.5 px-3.5">Category</th>
                    <th className="py-2.5 px-3.5">Member</th>
                    <th className="py-2.5 px-3.5">Date</th>
                    <th className="py-2.5 px-3.5 text-right">Amount</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
                  {projectExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-zinc-400">
                        No team expenses recorded for this project yet. Click "+ Add Expense" above to log costs.
                      </td>
                    </tr>
                  ) : (
                    projectExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-2.5 px-3.5 font-bold font-mono text-blue-600">{exp.expenseNumber}</td>
                        <td className="py-2.5 px-3.5 font-bold text-zinc-900 dark:text-zinc-100">{exp.title}</td>
                        <td className="py-2.5 px-3.5 text-zinc-600 dark:text-zinc-400">{exp.category}</td>
                        <td className="py-2.5 px-3.5 font-semibold text-zinc-800 dark:text-zinc-200">{exp.member}</td>
                        <td className="py-2.5 px-3.5 font-mono text-zinc-500 text-[11px]">{formatDisplayDate(exp.date)}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">{exp.amount}</td>
                        <td className="py-2.5 px-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                            exp.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
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
