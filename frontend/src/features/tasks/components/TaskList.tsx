"use client"

import * as React from "react"
import {
  Heart,
  Upload,
  Plus,
  Filter,
  Search,
  RotateCw,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  ArrowUpCircle,
  AlertCircle,
  ArrowDownCircle,
  Columns,
} from "lucide-react"
import { Task, TaskStatus, getTaskCountdownChip } from "../types"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepBulkDelete } from "@/lib/confirmDialog"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { formatDisplayDate } from "@/lib/utils"
import { TaskListSection1 } from "@/features/tasks/components/tasklist-sections/TaskListSection1"
import { TaskListSection2 } from "@/features/tasks/components/tasklist-sections/TaskListSection2"


import { type TaskListProps, statusBadgeStyles, labelBadgeStyles } from "@/features/tasks/components/tasklist-sections/TaskListHelpers"
export * from "@/features/tasks/components/tasklist-sections/TaskListHelpers"

export function TaskList({
  tasks = [],
  activeViewTab = "list",
  onChangeViewTab,
  onOpenAddModal,
  onSelectTask,
  onDeleteTask,
  onUpdateTaskStatus,
  onOpenManageLabels,
}: TaskListProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const isSuperAdmin = user?.role === "Super Admin"
  const canAddTask = isSuperAdmin || canPerformAction(user, "Tasks", "add")
  const canEditTask = isSuperAdmin || canPerformAction(user, "Tasks", "edit")
  const canDeleteTask = isSuperAdmin || canPerformAction(user, "Tasks", "delete")

  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilterPill, setActiveFilterPill] = React.useState("All tasks")
  const [sourceFilter, setSourceFilter] = React.useState<"all" | "leads" | "projects" | "direct">("all")
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<string[]>([])
  const [allUsers, setAllUsers] = React.useState<UserItem[]>([])

  React.useEffect(() => {
    getUsers("all").then(setAllUsers).catch(() => {})
  }, [])

  const toggleSelectAll = () => {
    if (!canDeleteTask) return
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([])
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id))
    }
  }

  const toggleSelectRow = (id: string) => {
    if (!canDeleteTask) return
    if (selectedTaskIds.includes(id)) {
      setSelectedTaskIds(selectedTaskIds.filter((item) => item !== id))
    } else {
      setSelectedTaskIds([...selectedTaskIds, id])
    }
  }

  const filteredTasks = React.useMemo(() => {
    const list = tasks || []
    const seen = new Set<string>()
    const uniqueList = list.filter((t) => {
      if (!t || !t.id) return false
      const normId = String(t.id).toLowerCase().trim()
      if (seen.has(normId)) return false
      seen.add(normId)
      return true
    })

    return uniqueList.filter((t) => {
      const titleStr = t.title || ""
      const relStr = t.relatedTo || ""
      const assignStr = t.assignedTo || ""
      const idStr = String(t.id || "")

      const matchesSearch =
        titleStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        relStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        idStr.includes(searchQuery)

      if (!matchesSearch) return false

      // Source Filter check
      if (sourceFilter === "leads") {
        const isFromLead = t.source === "leads" || relStr.toLowerCase().includes("lead") || idStr.startsWith("lead_task_")
        if (!isFromLead) return false
      } else if (sourceFilter === "projects") {
        const isFromProject = t.source === "projects" || relStr.toLowerCase().includes("project") || Boolean(t.projectName)
        if (!isFromProject) return false
      } else if (sourceFilter === "direct") {
        const isFromLead = t.source === "leads" || relStr.toLowerCase().includes("lead") || idStr.startsWith("lead_task_")
        const isFromProject = t.source === "projects" || relStr.toLowerCase().includes("project") || Boolean(t.projectName)
        if (isFromLead || isFromProject) return false
      }

      if (activeFilterPill === "All tasks" || activeFilterPill === "My Tasks" || activeFilterPill === "Recently Updated") {
        return true
      }

      if (activeFilterPill === "Bug") {
        return (t.labels || []).includes("Bug")
      }

      if (activeFilterPill === "exclamation") {
        return (t.priorityIcon === "exclamation" || t.priority === "Urgent")
      }

      if (activeFilterPill === "up") {
        return (t.priorityIcon === "up" || t.priority === "High")
      }

      return true
    })
  }, [tasks, searchQuery, activeFilterPill, sourceFilter])

  
  __ctrl = { tasks, activeViewTab, onChangeViewTab, onOpenAddModal, onSelectTask, onDeleteTask, onUpdateTaskStatus, onOpenManageLabels, user, canPerformAction, isSuperAdmin, canAddTask, canEditTask, canDeleteTask, searchQuery, setSearchQuery, activeFilterPill, setActiveFilterPill, sourceFilter, setSourceFilter, selectedTaskIds, setSelectedTaskIds, allUsers, setAllUsers, toggleSelectAll, toggleSelectRow, filteredTasks };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-4">
      
      {/* ---------------- TOP VIEW TABS & HEADER ACTIONS (Screenshot 1 Match) ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        {/* Left View Tabs */}
        <div className="flex items-center gap-6 text-sm font-medium">
          <span className="text-zinc-400 font-semibold cursor-default">Tasks</span>
          <button
            type="button"
            onClick={() => onChangeViewTab("list")}
            className={`pb-1 transition-colors ${
              activeViewTab === "list"
                ? "text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            List
          </button>
          <button
            type="button"
            onClick={() => onChangeViewTab("kanban")}
            className={`pb-1 transition-colors ${
              activeViewTab === "kanban"
                ? "text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Kanban
          </button>
          <button
            type="button"
            onClick={() => onChangeViewTab("gantt")}
            className={`pb-1 transition-colors ${
              activeViewTab === "gantt"
                ? "text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Gantt
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onOpenManageLabels}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs"
          >
            <Heart size={13} className="text-zinc-500" />
            <span>Manage labels</span>
          </button>

          <button
            type="button"
            onClick={() => alert("Import tasks clicked")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs"
          >
            <Upload size={13} className="text-zinc-500" />
            <span>Import tasks</span>
          </button>

          {canAddTask && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs"
            >
              <Plus size={13} className="text-zinc-500" />
              <span>Add multiple tasks</span>
            </button>
          )}

          {canAddTask && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={14} />
              <span>Add task</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- SECOND CONTROL TOOLBAR (Screenshot 1 Match) ---------------- */}
      <TaskListSection1 ctrl={__ctrl} />

      <TaskListSection2 ctrl={__ctrl} />

    </div>
  )
}
