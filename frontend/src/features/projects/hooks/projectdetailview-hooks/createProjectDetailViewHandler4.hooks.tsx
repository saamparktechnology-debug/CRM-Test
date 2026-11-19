"use client"

import * as React from "react"
import {
  ArrowLeft,
  Star,
  Clock,
  Settings,
  Zap,
  Play,
  Pause,
  Plus,
  Filter,
  Search,
  ChevronRight,
  Mail,
  X,
  MoreVertical,
  Layers,
  CheckCircle2,
  Code2,
  Database,
  KeyRound,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Receipt,
  FileText,
  Printer,
  DollarSign,
  TrendingUp,
  Percent,
  Calendar,
  Check,
  User as UserIcon,
  Trash2,
  Download,
  CreditCard,
  Briefcase,
  Megaphone,
  Video,
  Image as ImageIcon,
  CheckSquare,
  Eye,
  FileCheck,
  Users,
  MapPin,
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Project, ProjectMilestone, isMarketingProject } from "@/features/projects/types"
import { addOrUpdateProjectMilestone } from "@/features/projects/services/projectService"
import { useAuthStore } from "@/store/useAuthStore"
import { getUserAvatar } from "@/features/users/services/userService"
import { getInvoices, addInvoice, generateInvoiceNumber, updateInvoiceStatus, InvoiceItem, InvoiceStatus } from "@/features/invoice/services/invoiceService"
import { taskService } from "@/features/tasks/services/taskService"
import { Task, TaskPriority, TaskStatus, getTaskCountdownChip } from "@/features/tasks/types"
import { fetchModuleDataFromDB, saveModuleDataToDB, filterGlobalDeletedItems } from "@/lib/storageSync"
import { printPDFReport, exportToExcel } from "@/lib/exportUtils"
import { formatDisplayDate } from "@/lib/utils"
import { OfficialQuotationDocument } from "@/features/quotations/components/OfficialQuotationDocument"
import { OfficialEstimateDocument } from "@/features/estimates/components/OfficialEstimateDocument"
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal"
import { DigitalMarketingPackage, createDefaultMarketingPackage } from "@/types/digitalMarketing"
import { type ProjectDetailViewProps, DONUT_COLORS } from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers"

export function createProjectDetailViewHandler4(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { projectExpenses, selectedProject, setExpTitle, setExpAmount, setExpPayee, user, setIsExpenseModalOpen, loadProjectExpenses } = getCtrl();
    const __fn: any = () => {
    const totalExpNum = projectExpenses.reduce((acc, exp) => acc + (exp.amountNum || 0), 0)
    const projectPriceNum = parseInt(selectedProject.price.replace(/[^0-9]/g, "")) || 0
    const grossMargin = projectPriceNum - totalExpNum
    const marginPct = projectPriceNum > 0 ? Math.round((grossMargin / projectPriceNum) * 100) : 0

    return (
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CreditCard size={18} className="text-purple-600" />
              <span>Project Cost Ledger & Profit Margin</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Direct expenses, contractor costs, and material purchases linked to <strong>{selectedProject.title}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setExpTitle("")
              setExpAmount("")
              setExpPayee(user?.name || "Admin")
              setIsExpenseModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>+ Record Project Expense</span>
          </button>
        </div>

        {/* 3 Financial Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Total Project Revenue</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedProject.price}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Agreed project contract</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Direct Expenses Incurred</span>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              ₹{totalExpNum.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">{projectExpenses.length} expense items</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Net Margin / Profit</span>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-bold ${grossMargin >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600"}`}>
                ₹{grossMargin.toLocaleString("en-IN")}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                grossMargin >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-rose-100 text-rose-700"
              }`}>
                {marginPct}% Margin
              </span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Project profitability</div>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Expenses Log</h4>
            <button
              type="button"
              onClick={loadProjectExpenses}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Expense #</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Payee / Member</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {projectExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CreditCard size={32} className="text-zinc-300 dark:text-zinc-600" />
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">No direct expenses recorded yet for this project</p>
                        <p className="text-[11px] text-zinc-400">Log software licenses, cloud servers, or subcontractor payments.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setExpTitle("")
                            setExpAmount("")
                            setExpPayee(user?.name || "Admin")
                            setIsExpenseModalOpen(true)
                          }}
                          className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs cursor-pointer"
                        >
                          + Record Project Expense
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projectExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-zinc-600 dark:text-zinc-400">{exp.expenseNumber || exp.id}</td>
                      <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{exp.title}</td>
                      <td className="py-3 px-4 text-zinc-500">{exp.category}</td>
                      <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 font-medium">{exp.member}</td>
                      <td className="py-3 px-4 text-zinc-500">{formatDisplayDate(exp.date)}</td>
                      <td className="py-3 px-4 text-right font-bold text-rose-600 dark:text-rose-400">{exp.amount}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                          {exp.status || "Approved"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  };
    return __fn(...__args);
  };
}
