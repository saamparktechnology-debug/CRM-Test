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

export function createProjectDetailViewHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { canManageProgress, openAddMilestone, selectedProject, openEditMilestone } = getCtrl();
    const __fn: any = () => (
    <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Code2 size={16} className="text-blue-600" />
            <span>Developer Progress Updates & Milestones</span>
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Frontend Done, Backend Done, Deployment & Server Credentials (live-synced to Sales Orders & Invoices)
          </p>
        </div>

        {canManageProgress ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAddMilestone("Frontend")}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
            >
              + Frontend Done
            </button>
            <button
              type="button"
              onClick={() => openAddMilestone("Backend")}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              + Backend Done
            </button>
            <button
              type="button"
              onClick={() => openAddMilestone("Custom")}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus size={13} />
              <span>Add Update</span>
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">
            Progress Tracking (Managed by Admin & Assigned Team)
          </span>
        )}
      </div>

      <div className="space-y-3">
        {(selectedProject.milestones || []).length === 0 ? (
          <div className="p-6 text-center text-zinc-400 text-xs border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
            No milestones added yet. Developers can click "+ Add Update" above to record progress notes (e.g. Frontend Done, Backend Done, Credentials).
          </div>
        ) : (
          (selectedProject.milestones || []).map((ms) => {
            const isCompleted = ms.status === "Completed"
            const isInProgress = ms.status === "In Progress"
            return (
              <div
                key={ms.id}
                className="p-3.5 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-2 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${
                      isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600"
                        : isInProgress
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-600"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-500"
                    }`}>
                      {ms.stage === "Frontend" ? <Code2 size={14} /> : ms.stage === "Backend" ? <Database size={14} /> : ms.stage === "Credentials" ? <KeyRound size={14} /> : <CheckCircle2 size={14} />}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <span>{ms.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                          {ms.stage}
                        </span>
                      </h4>
                      {ms.updatedBy && (
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-1">
                          <img
                            src={getUserAvatar(ms.updatedBy, undefined, ms.updatedBy)}
                            alt={ms.updatedBy}
                            className="w-4 h-4 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0"
                          />
                          <span>
                            Updated by <strong className="text-zinc-700 dark:text-zinc-300 font-semibold">{ms.updatedBy}</strong> {ms.updatedAt ? `on ${new Date(ms.updatedAt).toLocaleDateString("en-GB")}` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompleted
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                        : isInProgress
                        ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200"
                        : "bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}>
                      {ms.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => openEditMilestone(ms)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                {ms.notes && (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <span className="font-bold text-[10px] text-zinc-400 uppercase tracking-wider block mb-0.5">
                      Developer Notes:
                    </span>
                    {ms.notes}
                  </div>
                )}

                {ms.credentials && (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 font-mono space-y-1">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-1 font-sans">
                      <KeyRound size={11} /> Credentials / Access URLs:
                    </span>
                    <p className="whitespace-pre-wrap select-all">{ms.credentials}</p>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  );
    return __fn(...__args);
  };
}
