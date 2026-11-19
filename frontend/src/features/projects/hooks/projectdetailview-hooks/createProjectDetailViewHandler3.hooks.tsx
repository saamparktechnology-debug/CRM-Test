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

export function createProjectDetailViewHandler3(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { projectTasks, selectedProject, setTaskTitle, setTaskDeadline, setTaskPriority, setTaskAssignedTo, user, setIsTaskModalOpen, loadProjectTasks, handleUpdateTaskRowStatus } = getCtrl();
    const __fn: any = () => {
    const todoCount = projectTasks.filter(t => t.status === "To do").length
    const inProgressCount = projectTasks.filter(t => t.status === "In progress").length
    const doneCount = projectTasks.filter(t => t.status === "Done").length

    return (
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-800/40 p-5 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              <span>Project Tasks & Deliverables</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Assigned tasks and action items for <strong>{selectedProject.title}</strong> live-synced across team members.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setTaskTitle("")
              setTaskDeadline(selectedProject.deadline || "")
              setTaskPriority("Normal")
              setTaskAssignedTo(selectedProject.members?.[0]?.name || user?.name || "")
              setIsTaskModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>+ Add Task to Project</span>
          </button>
        </div>

        {/* 4 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Total Tasks</span>
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{projectTasks.length}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Assigned to team</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">To Do</span>
            <div className="text-xl font-bold text-amber-500">{todoCount}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Pending kickoff</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">In Progress</span>
            <div className="text-xl font-bold text-cyan-600">{inProgressCount}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Currently active</div>
          </div>
          <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-zinc-400 block mb-1">Completed</span>
            <div className="text-xl font-bold text-emerald-600">{doneCount}</div>
            <div className="text-[10px] text-zinc-400 mt-1">Finished tasks</div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tasks List</h4>
            <button
              type="button"
              onClick={loadProjectTasks}
              className="text-xs text-blue-600 hover:underline cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/70 dark:bg-zinc-800/60 border-b border-zinc-100 dark:border-zinc-800 text-zinc-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Assigned Member</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {projectTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-zinc-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CheckCircle2 size={32} className="text-zinc-300 dark:text-zinc-600" />
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">No tasks added for this project yet</p>
                        <p className="text-[11px] text-zinc-400">Break down your project into deliverables and tasks.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setTaskTitle("")
                            setTaskDeadline(selectedProject.deadline || "")
                            setTaskPriority("Normal")
                            setTaskAssignedTo(selectedProject.members?.[0]?.name || user?.name || "")
                            setIsTaskModalOpen(true)
                          }}
                          className="mt-2 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs cursor-pointer"
                        >
                          + Add Task to Project
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  projectTasks.map((t) => {
                    const chip = getTaskCountdownChip(t.deadline, t.dueTime, t.status)
                    return (
                      <tr key={t.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{t.title}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={getUserAvatar(t.assignedTo, undefined, t.assignedTo)}
                              alt={t.assignedTo || "Assignee"}
                              className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0 bg-surface"
                            />
                            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{t.assignedTo || "Unassigned"}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.priority === "Urgent" || t.priority === "High"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}>
                            {t.priority || "Normal"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-zinc-600 dark:text-zinc-300">{t.deadline || "No deadline"}</span>
                            {chip && (
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${chip.colorClass}`}>
                                {chip.label}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={t.status}
                            onChange={(e) => handleUpdateTaskRowStatus(t.id, e.target.value as TaskStatus)}
                            className="text-xs px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold cursor-pointer"
                          >
                            <option value="To do">To do</option>
                            <option value="In progress">In progress</option>
                            <option value="Review">Review</option>
                            <option value="Done">Done ✅</option>
                          </select>
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
