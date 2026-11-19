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

export function createProjectDetailViewHandler2(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { projectInvoices, selectedProject, handleOpenGenerateInvoice, loadProjectInvoices, handlePrintProjectInvoice, handleUpdateInvoiceRowStatus } = getCtrl();
    const __fn: any = () => {
    const totalInvoicedNum = projectInvoices.reduce((acc, inv) => {
      const val = parseInt((inv.totalInvoiced || "0").replace(/[^0-9]/g, "")) || 0
      return acc + val
    }, 0)
    const totalPaidNum = projectInvoices.reduce((acc, inv) => {
      const val = parseInt((inv.paymentReceived || "0").replace(/[^0-9]/g, "")) || 0
      return acc + val
    }, 0)
    const totalDueNum = projectInvoices.reduce((acc, inv) => {
      const val = parseInt((inv.due || "0").replace(/[^0-9]/g, "")) || 0
      return acc + val
    }, 0)

    return (
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Receipt size={18} className="text-emerald-600" />
              <span>Project Invoices & Billing Ledger</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Live-synced with Sales & Invoices module. Manage invoices, billings, and payments for <strong>{selectedProject.title}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenGenerateInvoice}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>+ Generate Invoice for Project</span>
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Contract / Quoted Value</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{selectedProject.price}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Client: {selectedProject.client}</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Total Invoiced</span>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              ₹{totalInvoicedNum.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">{projectInvoices.length} invoices generated</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Payment Received</span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              ₹{totalPaidNum.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Real-time collections</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Outstanding Balance</span>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
              ₹{totalDueNum.toLocaleString("en-IN")}
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">Pending payments</div>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
              <FileText size={15} className="text-zinc-500" />
              <span>Invoices List ({projectInvoices.length})</span>
            </h4>
            <button
              type="button"
              onClick={loadProjectInvoices}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Description / Items</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Received</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {projectInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Receipt size={32} className="text-zinc-300 dark:text-zinc-600" />
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">No invoices generated yet for this project</p>
                        <p className="text-[11px] text-zinc-400">Click below to generate a milestone or final tax invoice.</p>
                        <button
                          type="button"
                          onClick={handleOpenGenerateInvoice}
                          className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer"
                        >
                          + Generate Invoice for Project
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projectInvoices.map((inv) => {
                    const isPaid = inv.status === "Fully paid"
                    const isPartial = inv.status === "Partially paid"
                    return (
                      <tr key={inv.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                          {inv.id}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 dark:text-zinc-300">{formatDisplayDate(inv.billDate)}</td>
                        <td className="py-3 px-4 text-red-600 dark:text-red-400 font-mono font-semibold">{inv.dueDate ? formatDisplayDate(inv.dueDate) : "-"}</td>
                        <td className="py-3 px-4 max-w-xs truncate text-zinc-700 dark:text-zinc-300">
                          {inv.items?.[0]?.serviceName || inv.project || "Deliverable"}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                          {inv.totalInvoiced}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          {inv.paymentReceived}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {inv.due}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                              : isPartial
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                              : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handlePrintProjectInvoice(inv)}
                              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                              title="Print / View Invoice PDF"
                            >
                              <Printer size={14} />
                            </button>
                            <select
                              value={inv.status}
                              onChange={(e) => handleUpdateInvoiceRowStatus(inv.id, e.target.value as InvoiceStatus)}
                              className="text-[11px] px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
                            >
                              <option value="Payment Pending">Pending</option>
                              <option value="Partially paid">Partially Paid</option>
                              <option value="Fully paid">Fully Paid</option>
                              <option value="Draft">Draft</option>
                            </select>
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
      </div>
    )
  };
    return __fn(...__args);
  };
}
