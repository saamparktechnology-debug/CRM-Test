"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function TaskListSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { canDeleteTask, selectedTaskIds, filteredTasks, toggleSelectAll, toggleSelectRow, onSelectTask, allUsers, canEditTask, onUpdateTaskStatus, onDeleteTask } = ctrl;
  return (
    <>
      {/* ---------------- TABLE DATA (Screenshot 1 Match) ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            
            {/* Table Header */}
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 font-medium">
                {canDeleteTask && (
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={toggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">
                  <div className="flex items-center gap-1">
                    <span>↓</span>
                    <span>Title</span>
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Start date</th>
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Deadline</th>
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Milestone</th>
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Related to</th>
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Assigned to</th>
                <th className="py-3 px-3 font-semibold text-zinc-600 dark:text-zinc-300">Status</th>
                <th className="py-3 px-3 w-16 text-center">≡</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredTasks.map((t) => {
                const isSelected = selectedTaskIds.includes(t.id)

                return (
                  <tr
                    key={t.id}
                    className={`hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors ${
                      isSelected ? "bg-blue-50/30 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    {/* Checkbox */}
                    {canDeleteTask && (
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(t.id)}
                          className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Title with priority icons & clean label badge */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => onSelectTask(t)}
                            className="font-medium text-zinc-800 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                          >
                            {t.title.replace(/^Follow-up Call:\s*/i, "").replace(/^Follow-up:\s*/i, "")}
                          </span>

                          {/* Priority Icon Beside Title */}
                          {t.priorityIcon === "up" && (
                            <ArrowUpCircle size={14} className="text-amber-500 shrink-0" />
                          )}
                          {t.priorityIcon === "exclamation" && (
                            <AlertCircle size={14} className="text-purple-600 shrink-0" />
                          )}
                          {t.priorityIcon === "down" && (
                            <ArrowDownCircle size={14} className="text-zinc-400 shrink-0" />
                          )}
                        </div>

                        {/* Label Badges Below Title */}
                        {t.labels && t.labels.length > 0 && (
                          <div className="flex items-center gap-1">
                            {t.labels.map((lbl) => (
                              <span
                                key={lbl}
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  labelBadgeStyles[lbl] || "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                                }`}
                              >
                                {lbl}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Start Date */}
                    <td className="py-3 px-3 text-zinc-400 font-mono">
                      {t.startDate ? formatDisplayDate(t.startDate) : "-"}
                    </td>

                    {/* Deadline & Remaining Days Countdown */}
                    <td className="py-3 px-3 font-mono text-xs">
                      {(() => {
                        const chip = getTaskCountdownChip(t.deadline, t.dueTime, t.status)
                        return (
                          <div className="flex flex-col gap-1">
                            <span className="font-bold text-red-600 dark:text-red-400">
                              {t.deadline ? formatDisplayDate(t.deadline) : "-"}{t.dueTime ? ` (${t.dueTime})` : ''}
                            </span>
                            {chip && (
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] border ${chip.colorClass} w-fit`}>
                                {chip.label}
                              </span>
                            )}
                          </div>
                        )
                      })()}
                    </td>

                    {/* Milestone */}
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300">
                      {t.milestone || "-"}
                    </td>

                    {/* Related to (Blue Clickable Link) */}
                    <td className="py-3 px-3">
                      {t.relatedTo ? (
                        <span className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                          {t.relatedTo}
                        </span>
                      ) : (
                        <span className="text-zinc-400">-</span>
                      )}
                    </td>

                    {/* Assigned to */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={getUserAvatar(t.assignedTo, allUsers, t.assignedTo)}
                          alt={t.assignedTo}
                          className="w-5 h-5 rounded-full border border-zinc-200 object-cover shrink-0"
                        />
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {t.assignedTo}
                        </span>
                      </div>
                    </td>

                    {/* Status Badge with Quick Status Switcher */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {canEditTask && onUpdateTaskStatus ? (
                        <select
                          value={t.status}
                          onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                          className={`px-3 py-1 rounded text-[11px] font-semibold border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors whitespace-nowrap inline-block text-center ${
                            statusBadgeStyles[t.status] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {(masterBundle?.options?.["enquiry_status"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded text-[11px] font-semibold border whitespace-nowrap inline-block text-center ${
                            statusBadgeStyles[t.status] || "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {t.status === "To do" ? "To Do" : t.status}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-2 text-zinc-400">
                        {canEditTask && (
                          <button
                            type="button"
                            onClick={() => onSelectTask(t)}
                            className="hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded transition-colors"
                            title="Edit Task"
                          >
                            <Edit2 size={13} />
                          </button>
                        )}
                        {canDeleteTask && (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(t.id)}
                            className="hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                            title="Delete Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-zinc-400">
                    No tasks found matching query.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}
