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
import { Task, TaskStatus, getTaskCountdownChip } from "@/features/tasks/types"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepBulkDelete } from "@/lib/confirmDialog"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { formatDisplayDate } from "@/lib/utils"

export interface TaskListProps {
  tasks: Task[]
  activeViewTab: "list" | "kanban" | "gantt"
  onChangeViewTab: (tab: "list" | "kanban" | "gantt") => void
  onOpenAddModal: () => void
  onSelectTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onUpdateTaskStatus?: (id: string, newStatus: TaskStatus) => void
  onOpenManageLabels: () => void
}

export const statusBadgeStyles: Record<TaskStatus, string> = {
  "To do": "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  "In progress": "bg-blue-600 text-white dark:bg-blue-600 dark:text-white border-blue-600",
  "Review": "bg-fuchsia-700 text-white dark:bg-fuchsia-700 dark:text-white border-fuchsia-700",
  "Done": "bg-emerald-600 text-white dark:bg-emerald-600 dark:text-white border-emerald-600",
}

export const labelBadgeStyles: Record<string, string> = {
  Design: "bg-emerald-500 text-white dark:bg-emerald-600",
  Feedback: "bg-fuchsia-600 text-white dark:bg-fuchsia-700",
  Enhancement: "bg-blue-500 text-white dark:bg-blue-600",
  Bug: "bg-rose-500 text-white dark:bg-rose-600",
}
