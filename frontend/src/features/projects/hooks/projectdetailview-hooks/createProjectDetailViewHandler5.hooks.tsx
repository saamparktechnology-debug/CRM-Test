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

export function createProjectDetailViewHandler5(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { linkedQuotation, linkedEstimate, setViewingQuotation, setViewingEstimate } = getCtrl();
    const __fn: any = () => {
    const hasQuotation = Boolean(linkedQuotation)
    const hasEstimate = Boolean(linkedEstimate)

    return (
      <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60">
              <Receipt size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Originating Commercial Documents
              </h3>
              <p className="text-[11px] text-zinc-500">
                Official Quotation &amp; Estimate converted to this Client Project
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {hasQuotation && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Quotation Linked
              </span>
            )}
            {hasEstimate && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Estimate Linked
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Linked Quotation Card */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            hasQuotation 
              ? "border-teal-200 dark:border-teal-800/60 bg-teal-50/30 dark:bg-teal-950/20" 
              : "border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20"
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 block">
                  COMMERCIAL QUOTATION
                </span>
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                  {hasQuotation ? (linkedQuotation.number || linkedQuotation.id) : "No Quotation Linked"}
                </h4>
                {hasQuotation && (
                  <div className="text-[11px] text-zinc-500 mt-1 space-y-0.5">
                    <div>Date: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{formatDisplayDate(linkedQuotation.date)}</strong></div>
                    <div>Amount: <strong className="text-emerald-600 font-mono font-bold">₹{(linkedQuotation.total || linkedQuotation.totalAmount || 0).toLocaleString("en-IN")}</strong></div>
                    <div>Status: <span className="font-semibold text-emerald-700">{linkedQuotation.status || "Accepted"}</span></div>
                  </div>
                )}
              </div>

              {hasQuotation && (
                <button
                  type="button"
                  onClick={() => setViewingQuotation(linkedQuotation)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Eye size={12} />
                  <span>View PDF</span>
                </button>
              )}
            </div>
            {!hasQuotation && (
              <p className="text-[11px] text-zinc-400 mt-2">
                This project does not originate from a direct quotation tender.
              </p>
            )}
          </div>

          {/* Linked Estimate Card */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            hasEstimate 
              ? "border-amber-200 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20" 
              : "border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20"
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  TECHNICAL ESTIMATE
                </span>
                <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-0.5 font-mono">
                  {hasEstimate ? (linkedEstimate.estimateNumber || linkedEstimate.number || linkedEstimate.id) : "No Estimate Linked"}
                </h4>
                {hasEstimate && (
                  <div className="text-[11px] text-zinc-500 mt-1 space-y-0.5">
                    <div>Valid Until: <strong className="text-zinc-800 dark:text-zinc-200 font-mono">{formatDisplayDate(linkedEstimate.validUntil || linkedEstimate.date)}</strong></div>
                    <div>Amount: <strong className="text-emerald-600 font-mono font-bold">{linkedEstimate.formattedTotal || `₹${(linkedEstimate.totalAmount || 0).toLocaleString("en-IN")}`}</strong></div>
                    <div>Status: <span className="font-semibold text-amber-700">{linkedEstimate.status || "Accepted"}</span></div>
                  </div>
                )}
              </div>

              {hasEstimate && (
                <button
                  type="button"
                  onClick={() => setViewingEstimate(linkedEstimate)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Eye size={12} />
                  <span>View PDF</span>
                </button>
              )}
            </div>
            {!hasEstimate && (
              <p className="text-[11px] text-zinc-400 mt-2">
                This project does not originate from an accepted estimate document.
              </p>
            )}
          </div>
        </div>
      </div>
    )
  };
    return __fn(...__args);
  };
}
