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

export function ExpensesSection1({ ctrl }: { ctrl: any }) {
  const { activeViewTab, currentProject, projectRevenueNum, projectExpenses, projectExtraCharges, totalProjectExpenses, netProfit, profitMarginPct, selectedCategory, filteredExpenses, canAddExpense, setIsProjectScoped, setFormProjectId, setIsAddModalOpen, setActiveViewTab, expenses, projects } = ctrl;
  return (
    <>
      {/* ---------------- TOP HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Calculator className="text-blue-600 dark:text-blue-400" size={24} />
            <span>Operational Expenses &amp; Project Profitability</span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track business operating costs, project-wise team deliverables, custom subcontractor charges, and net profit margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (activeViewTab === "project_wise" && currentProject) {
                exportToExcel({
                  filename: `SAAMPARK_Project_Cost_${currentProject.title.replace(/\s+/g, "_")}`,
                  title: `Project Profitability Statement: ${currentProject.title}`,
                  subtitle: `Client: ${currentProject.client} | Contract: ₹${projectRevenueNum.toLocaleString("en-IN")}`,
                  headers: ["Type", "Title / Item", "Category / Role", "Amount (INR)", "Date", "Status / Paid To"],
                  rows: [
                    ...projectExpenses.map(e => [
                      "Team Expense",
                      e.title,
                      e.category,
                      `₹${e.amountNum.toLocaleString("en-IN")}`,
                      e.date,
                      `${e.member} (${e.status})`,
                    ]),
                    ...projectExtraCharges.map(c => [
                      "Custom Extra Charge",
                      c.title,
                      c.category,
                      `₹${c.amount.toLocaleString("en-IN")}`,
                      c.date,
                      c.payee || c.vendor || "Direct Payee",
                    ]),
                    ["SUMMARY", "Contract Billed Revenue", "-", `₹${projectRevenueNum.toLocaleString("en-IN")}`, "-", "-"],
                    ["SUMMARY", "Total Project Expenses", "-", `₹${totalProjectExpenses.toLocaleString("en-IN")}`, "-", "-"],
                    ["SUMMARY", "Net Profit", "-", `₹${netProfit.toLocaleString("en-IN")}`, "-", `${profitMarginPct}% Margin`],
                  ],
                })
              } else {
                exportToExcel({
                  filename: "SAAMPARK_Operational_Expenses",
                  title: "Operational Expenses Report",
                  subtitle: selectedCategory === "all" ? "All Expenses" : selectedCategory,
                  headers: ["#", "Expense #", "Title", "Category", "Amount (₹)", "Date", "Recorded By", "Project", "Status"],
                  rows: filteredExpenses.map((exp, idx) => [
                    idx + 1,
                    exp.expenseNumber,
                    exp.title,
                    exp.category,
                    `₹${exp.amountNum.toLocaleString("en-IN")}`,
                    exp.date,
                    exp.member,
                    exp.projectName || "General",
                    exp.status,
                  ]),
                })
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer"
          >
            <Download size={13} className="text-emerald-600" />
            <span>Excel</span>
          </button>

          <button
            type="button"
            onClick={() => {
              printPDFReport({
                title: activeViewTab === "project_wise" && currentProject ? `Project Cost & Net Profit: ${currentProject.title}` : "Operational Expenses Report",
                subtitle: activeViewTab === "project_wise" && currentProject ? `Contract: ₹${projectRevenueNum.toLocaleString("en-IN")} | Net Profit: ₹${netProfit.toLocaleString("en-IN")} (${profitMarginPct}%)` : (selectedCategory === "all" ? "All Expenses" : selectedCategory),
                headers: ["Ref #", "Title", "Category", "Amount", "Date", "Member / Payee", "Status"],
                rows: (activeViewTab === "project_wise" ? projectExpenses : filteredExpenses).map((exp, idx) => [
                  exp.expenseNumber,
                  exp.title,
                  exp.category,
                  `₹${exp.amountNum.toLocaleString("en-IN")}`,
                  exp.date,
                  exp.member,
                  exp.status,
                ]),
              })
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 shadow-2xs cursor-pointer"
          >
            <Printer size={13} className="text-zinc-500" />
            <span>Print</span>
          </button>

          {canAddExpense && (
            <button
              type="button"
              onClick={() => {
                if (activeViewTab === "project_wise" && currentProject) {
                  setIsProjectScoped(true)
                  setFormProjectId(currentProject.id)
                }
                setIsAddModalOpen(true)
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Expense</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- VIEW TABS (GENERAL VS PROJECT-WISE) ---------------- */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveViewTab("all")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeViewTab === "all"
              ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Receipt size={14} />
          <span>All Operational Expenses</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {expenses.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveViewTab("project_wise")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition-all border-b-2 cursor-pointer ${
            activeViewTab === "project_wise"
              ? "border-emerald-600 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30"
              : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          }`}
        >
          <Briefcase size={14} />
          <span>💼 Project-Wise Expenses &amp; Net Profit</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
            {projects.length} Projects
          </span>
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────────── */}
      {/* ── TAB 1: ALL GENERAL OPERATIONAL EXPENSES ────────────────────────── */}
      {/* ────────────────────────────────────────────────────────────────────── */}
    </>
  );
}
