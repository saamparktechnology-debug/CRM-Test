"use client";

import * as React from "react";
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
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Project,
  ProjectMilestone,
  isMarketingProject,
} from "@/features/projects/types";
import { addOrUpdateProjectMilestone } from "@/features/projects/services/projectService";
import { useAuthStore } from "@/store/useAuthStore";
import { getUserAvatar } from "@/features/users/services/userService";
import {
  getInvoices,
  addInvoice,
  generateInvoiceNumber,
  updateInvoiceStatus,
  InvoiceItem,
  InvoiceStatus,
} from "@/features/invoice/services/invoiceService";
import { taskService } from "@/features/tasks/services/taskService";
import {
  Task,
  TaskPriority,
  TaskStatus,
  getTaskCountdownChip,
} from "@/features/tasks/types";
import {
  fetchModuleDataFromDB,
  saveModuleDataToDB,
  filterGlobalDeletedItems,
} from "@/lib/storageSync";
import { printPDFReport, exportToExcel } from "@/lib/exportUtils";
import { formatDisplayDate } from "@/lib/utils";
import { OfficialQuotationDocument } from "@/features/quotations/components/OfficialQuotationDocument";
import { OfficialEstimateDocument } from "@/features/estimates/components/OfficialEstimateDocument";
import { ProjectCompletionModal } from "@/features/projects/components/ProjectCompletionModal";
import {
  DigitalMarketingPackage,
  createDefaultMarketingPackage,
} from "@/types/digitalMarketing";
import {
  type ProjectDetailViewProps,
  DONUT_COLORS,
} from "@/features/projects/components/projectdetailview-sections/ProjectDetailViewHelpers";

export function ProjectDetailViewSection2({ ctrl }: { ctrl: any }) {
  const {
    selectedProject,
    setIsStarred,
    isStarred,
    setIsCompletionModalOpen,
    onSelectProject,
    isAdmin,
    onOpenEditModal,
    canManageProgress,
    setIsUpdateProgressModalOpen,
    isClient,
    setIsTimerRunning,
    isTimerRunning,
    formatTimer,
    timerSeconds,
    navTabs,
    activeTab,
    setActiveTab,
  } = ctrl;
  return (
    <>
      {/* Top Title & Action Bar */}
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-zinc-500" />
          <h1 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
            {selectedProject.title}
          </h1>
          <button
            type="button"
            onClick={() => setIsStarred(!isStarred)}
            className="text-amber-400 hover:scale-110 transition-transform ml-1 cursor-pointer"
          >
            <Star size={16} fill={isStarred ? "currentColor" : "none"} />
          </button>

          {/* Direct Quick Status Changer */}
          <select
            value={selectedProject.status || "Open"}
            onChange={async (e) => {
              const newStatus = e.target.value as any;
              if (newStatus === "Completed" || newStatus === "Finished") {
                setIsCompletionModalOpen(true);
                return;
              }
              const newProgress =
                newStatus === "Open"
                  ? 0
                  : selectedProject.progress === 100
                    ? 50
                    : selectedProject.progress;
              const updated = {
                ...selectedProject,
                status: newStatus,
                progress: newProgress,
              };
              onSelectProject(updated);
              const { updateProject } =
                await import("@/features/projects/services/projectService");
              await updateProject(selectedProject.id, {
                status: newStatus,
                progress: newProgress,
              });
              window.dispatchEvent(
                new CustomEvent("saampark_projects_updated"),
              );
            }}
            className={`ml-2 px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer outline-none transition-colors ${
              selectedProject.status === "Completed" ||
              selectedProject.status === "Finished"
                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                : selectedProject.status === "Cancelled"
                  ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800"
                  : selectedProject.status === "Under Review"
                    ? "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800"
                    : selectedProject.status === "Hold"
                      ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                      : "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
            }`}
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Under Review">Under Review</option>
            <option value="Hold">Hold</option>
            <option value="Completed">Completed</option>
            <option value="Finished">Finished</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {isAdmin && (
            <button
              type="button"
              onClick={() => onOpenEditModal(selectedProject)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Settings size={13} className="text-zinc-500" />
              <span>Project Settings</span>
            </button>
          )}

          {canManageProgress && (
            <button
              type="button"
              onClick={() => setIsUpdateProgressModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>Update Progress</span>
            </button>
          )}

          {!isClient && (
            <button
              type="button"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-md transition-colors shadow-sm cursor-pointer ${
                isTimerRunning
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
            >
              {isTimerRunning ? <Pause size={13} /> : <Play size={13} />}
              <span>
                {isTimerRunning
                  ? `Timer: ${formatTimer(timerSeconds)}`
                  : "🟢 Start timer"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-6 px-4 border-b border-zinc-100 dark:border-zinc-800 overflow-x-auto no-scrollbar text-xs font-medium text-zinc-500">
        {navTabs.map((tab: any) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`py-3 whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-blue-600 text-zinc-900 dark:text-zinc-100 font-semibold"
                  : "border-transparent hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Canvas Body */}
    </>
  );
}
