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

export function ProjectDetailViewSection3({ ctrl }: { ctrl: any }) {
  const { onBackToTable, leftSearch, setLeftSearch, setLeftFilter, leftFilter, filteredProjects, selectedProject, onSelectProject, currentPage, setCurrentPage } = ctrl;
  return (
    <>
      {/* ---------------- LEFT PANEL: Project Navigation ---------------- */}
      <div className="w-full lg:w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col overflow-hidden shadow-sm shrink-0">
        
        {/* Top Header */}
        <div className="flex items-center justify-between p-3 border-b border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={onBackToTable}
            className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Projects</span>
          </button>
          <button type="button" className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="p-3 space-y-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-zinc-400" size={14} />
            <input
              type="text"
              placeholder="Search projects..."
              value={leftSearch}
              onChange={(e) => setLeftSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {["All", "In Progress", "Completed", "High Priority"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setLeftFilter(tab)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  leftFilter === tab
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[600px]">
          {filteredProjects.map((p) => {
            const isSelected = p.id === selectedProject.id
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p)}
                className={`w-full text-left p-3.5 flex items-start justify-between gap-2 transition-colors ${
                  isSelected
                    ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                }`}
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs text-zinc-800 dark:text-zinc-100 truncate">
                      {p.title}
                    </span>
                    {p.starred && <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
                  </div>
                  <div className="text-[11px] text-zinc-400 truncate">{p.client}</div>
                  <div className="flex items-center gap-2 pt-1 text-[10px] text-zinc-400">
                    <span className="text-red-600 dark:text-red-400 font-bold font-mono">{p.deadline ? formatDisplayDate(p.deadline) : "-"}</span>
                    <span>•</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{p.price}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    p.status === "Completed" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  }`}>
                    {p.status}
                  </span>
                  <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
                    {p.progress}%
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bottom Pagination matching image */}
        <div className="p-2.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40"
          >
            &lt; 1
          </button>
          <span>Page {currentPage} of {Math.ceil(filteredProjects.length / 5) || 1}</span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            2 &gt;
          </button>
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: Project Main Detail Canvas ---------------- */}
    </>
  );
}
