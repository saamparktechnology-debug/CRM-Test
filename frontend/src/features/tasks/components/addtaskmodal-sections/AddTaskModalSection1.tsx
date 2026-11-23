"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { X, Check, Paperclip, Mic, HelpCircle, Plus, Tag, Building, MapPin } from "lucide-react"
import { Task, TaskStatus, TaskPriority } from "@/features/tasks/types"
import { taskService } from "@/features/tasks/services/taskService"
import { getUsers, getUserAvatar } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { type AddTaskModalProps } from "@/features/tasks/components/addtaskmodal-sections/AddTaskModalHelpers"

export function AddTaskModalSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { isSuperOrAdmin, availableSubBranchesForBranch, selectableCompanies, selectedCompanyId, handleCompanyChange, isBranchLocked, branches, user, selectedBranchId, handleBranchChange, availableBranches, selectedSubBranchId, setSelectedSubBranchId, title, setTitle, description, setDescription, selectedRelatedTo, setSelectedRelatedTo, availableRelatedOptions, customRelatedInput, setCustomRelatedInput, milestone, setMilestone, points, setPoints, assignedTo, setAssignedTo, teamMembers, status, setStatus, priority, setPriority, labels, setLabels, startDate, setStartDate, deadline, setDeadline, dueTime, setDueTime, sourceType, setSourceType, isRecurring, setIsRecurring } = ctrl;
  return (
    <>
      <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Company, Branch & Sub-Branch Selector Card */}
          {isSuperOrAdmin && (
            <div className={`p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 grid grid-cols-1 ${availableSubBranchesForBranch.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 mb-2`}>
              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1 flex items-center justify-between">
                  <span>Company Entity</span>
                  {selectableCompanies.length <= 1 && (
                    <span className="text-[9px] text-blue-600 font-bold bg-blue-50 dark:bg-blue-950/40 px-1 py-0.2 rounded border border-blue-200 dark:border-blue-800">
                      🔒 Active Scope
                    </span>
                  )}
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  disabled={selectableCompanies.length <= 1}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-85 text-xs"
                >
                  {selectableCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                  Branch Location
                </label>
                {isBranchLocked ? (
                  <div className="w-full px-2.5 py-1.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-between">
                    <span className="truncate">📍 {branches.find(b => b.id === user?.branchId)?.name || user?.branchId || "Assigned Branch"}</span>
                    <span className="text-[9px] text-amber-600 font-bold">🔒 Locked</span>
                  </div>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                  >
                    <option value="">🏢 Company HQ (All Branches)</option>
                    {availableBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        📍 {b.name || (b as any).branch_name || b.code || "Branch"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Dynamic Sub-Branch Selector */}
              {availableSubBranchesForBranch.length > 0 && (
                <div>
                  <label className="block text-[10.5px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    Sub-Branch Partner
                  </label>
                  <select
                    value={selectedSubBranchId}
                    onChange={(e) => setSelectedSubBranchId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 rounded-lg text-zinc-800 dark:text-zinc-200 font-bold focus:outline-none focus:ring-1 focus:ring-purple-500 text-xs"
                  >
                    <option value="">-- Direct Branch Task --</option>
                    {availableSubBranchesForBranch.map((sb) => (
                      <option key={sb.id} value={sb.id}>
                        🤝 {sb.name || (sb as any).sub_branch_name || sb.code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
          
          {/* Title */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Title</label>
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* Description */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2">Description</label>
            <textarea
              rows={3}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 resize-none"
            />
          </div>

          {/* Related to Multi-Select & Custom Tag Addition */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2 flex items-center gap-1">
              <Tag size={13} className="text-zinc-400" />
              <span>Related to</span>
            </label>
            <div className="col-span-3 space-y-2">
              {/* Selected Pills */}
              {selectedRelatedTo.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  {selectedRelatedTo.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-800 shadow-2xs"
                    >
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedRelatedTo(prev => prev.filter(i => i !== item))}
                        className="hover:text-rose-500 transition-colors ml-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Selector for pre-defined & dynamically loaded items */}
              <div className="flex items-center gap-2">
                <select
                  value=""
                  onChange={(e) => {
                    const val = e.target.value
                    if (val && !selectedRelatedTo.includes(val)) {
                      setSelectedRelatedTo(prev => [...prev, val])
                    }
                  }}
                  className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 text-xs"
                >
                  <option value="">Select pre-defined service, project, or lead...</option>
                  {availableRelatedOptions
                    .filter(opt => !selectedRelatedTo.includes(opt))
                    .map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                </select>
              </div>

              {/* Custom Add Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type custom related item (e.g. Campaign, Feature, Referral)..."
                  value={customRelatedInput}
                  onChange={(e) => setCustomRelatedInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      if (customRelatedInput.trim() && !selectedRelatedTo.includes(customRelatedInput.trim())) {
                        setSelectedRelatedTo(prev => [...prev, customRelatedInput.trim()])
                        setCustomRelatedInput("")
                      }
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 text-xs placeholder-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customRelatedInput.trim() && !selectedRelatedTo.includes(customRelatedInput.trim())) {
                      setSelectedRelatedTo(prev => [...prev, customRelatedInput.trim()])
                      setCustomRelatedInput("")
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shrink-0"
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Milestone (Lead Stage / Development Stage) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Milestone</label>
            <select
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
            >
              <optgroup label="Lead Stages">
                {(masterBundle?.options?.["enquiry_status"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Points */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium flex items-center gap-1">
              <span>Points</span>
              <HelpCircle size={13} className="text-zinc-400" />
            </label>
            <select
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            >
              <option value="1 Point">1 Point</option>
              <option value="2 Points">2 Points</option>
              <option value="3 Points">3 Points</option>
              <option value="5 Points">5 Points</option>
              <option value="8 Points">8 Points</option>
            </select>
          </div>

          {/* Assign to */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Assign to</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
            >
              {teamMembers.length === 0 ? (
                <option value="">No team members available</option>
              ) : (
                teamMembers.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} {m.role ? `(${m.role})` : ""}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Status */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
            >
              <option value="To do">To do</option>
              <option value="In progress">In progress</option>
              <option value="Review">Review</option>
              <option value="Done">Done</option>
            </select>
          </div>

          {/* Priority */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            >
              {(masterBundle?.options?.["enquiry_priority"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
            </select>
          </div>

          {/* Labels */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Labels</label>
            <input
              type="text"
              placeholder="Labels (e.g. Design, Bug, Enhancement)"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* Start date */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Start date</label>
            <input
              type="text"
              placeholder="DD-MM-YYYY"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* Deadline */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Deadline Date</label>
            <input
              type="text"
              placeholder="DD-MM-YYYY or YYYY-MM-DD"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 font-mono"
            />
          </div>

          {/* Due Time */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Due Time</label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-mono"
            />
          </div>

          {/* Task Source Category */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Source Type</label>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value as any)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
            >
              <option value="direct">Direct / Internal Task</option>
              <option value="leads">From Leads (Telecalling / Follow-up)</option>
              <option value="projects">From Projects (Milestone / Deliverable)</option>
            </select>
          </div>

          {/* Recurring */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium flex items-center gap-1">
              <span>Recurring</span>
              <HelpCircle size={13} className="text-zinc-400" />
            </label>
            <div className="col-span-3 flex items-center">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>

        </div>
    </>
  );
}
