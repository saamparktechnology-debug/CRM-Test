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
import { type TaskListProps, statusBadgeStyles, labelBadgeStyles } from "@/features/tasks/components/tasklist-sections/TaskListHelpers"

export function TaskListSection1({ ctrl }: { ctrl: any }) {
  const { onOpenAddModal, setSourceFilter, sourceFilter, setActiveFilterPill, activeFilterPill, canDeleteTask, selectedTaskIds, onDeleteTask, setSelectedTaskIds, filteredTasks, searchQuery, setSearchQuery } = ctrl;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-2.5 shadow-2xs">
        
        {/* Left Toolbar Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Columns Toggle Button */}
          <button
            type="button"
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50"
            title="Columns"
          >
            <Columns size={14} />
          </button>

          {/* Filters Button */}
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <Filter size={13} className="text-zinc-500" />
            <span>Filters</span>
            <span className="text-[10px] ml-0.5 text-zinc-400">▼</span>
          </button>

          {/* Plus Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50"
          >
            <Plus size={14} />
          </button>

          {/* Source Filter Group (All / From Leads / From Projects / Direct) */}
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/80 dark:border-zinc-700/80 text-[11px] font-semibold">
            <button
              type="button"
              onClick={() => setSourceFilter("all")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                sourceFilter === "all"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              All Sources
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("leads")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                sourceFilter === "leads"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span>🎯</span>
              <span>From Leads</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("projects")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                sourceFilter === "projects"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span>🚀</span>
              <span>From Projects</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter("direct")}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                sourceFilter === "direct"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
            >
              <span>📝</span>
              <span>Direct Tasks</span>
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs ml-1 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveFilterPill("All tasks")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilterPill === "All tasks"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              All tasks
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill("Bug")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilterPill === "Bug"
                  ? "bg-rose-50 text-rose-600 border border-rose-200"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Bug
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill("exclamation")}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                activeFilterPill === "exclamation"
                  ? "bg-purple-100 text-purple-600"
                  : "text-zinc-400 hover:bg-zinc-100"
              }`}
              title="Urgent Priority"
            >
              <AlertCircle size={15} className="text-purple-600" />
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill("up")}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                activeFilterPill === "up"
                  ? "bg-amber-100 text-amber-600"
                  : "text-zinc-400 hover:bg-zinc-100"
              }`}
              title="High Priority"
            >
              <ArrowUpCircle size={15} className="text-amber-500" />
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill("My Tasks")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilterPill === "My Tasks"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              My Tasks
            </button>

            <button
              type="button"
              onClick={() => setActiveFilterPill("Recently Updated")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeFilterPill === "Recently Updated"
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              Recently Updated
            </button>
          </div>
        </div>

        {/* Right Search & Export Controls */}
        <div className="flex items-center gap-2">
          {canDeleteTask && selectedTaskIds.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                if (await confirmTwoStepBulkDelete(selectedTaskIds.length, "task(s)")) {
                  selectedTaskIds.forEach((id) => onDeleteTask(id))
                  setSelectedTaskIds([])
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedTaskIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              exportToExcel({
                filename: "SAAMPARK_Tasks",
                title: "Tasks Report",
                subtitle: activeFilterPill || "All Tasks",
                headers: ["#", "Title", "Related To", "Assigned To", "Start Date", "Deadline", "Priority", "Status"],
                rows: filteredTasks.map((t, idx) => [
                  idx + 1,
                  t.title,
                  t.relatedTo || "-",
                  t.assignedTo,
                  t.startDate,
                  t.deadline,
                  t.priority,
                  t.status,
                ]),
              })
            }}
            className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            Excel
          </button>

          <button
            type="button"
            onClick={() => {
              printPDFReport({
                title: "Tasks Report",
                subtitle: activeFilterPill || "All Tasks",
                headers: ["#", "Title", "Related To", "Assigned To", "Start Date", "Deadline", "Priority", "Status"],
                rows: filteredTasks.map((t, idx) => [
                  idx + 1,
                  t.title,
                  t.relatedTo || "-",
                  t.assignedTo,
                  t.startDate,
                  t.deadline,
                  t.priority,
                  t.status,
                ]),
              })
            }}
            className="px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            Print
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-52 pl-3 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
            <Search size={13} className="absolute right-2.5 top-2 text-zinc-400" />
          </div>
        </div>

      </div>
    </>
  );
}
