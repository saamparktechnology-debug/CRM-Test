"use client"

import * as React from "react"
import {
  Tag,
  Upload,
  Plus,
  Filter,
  Settings,
  Search,
  ArrowDown,
  Layout,
  Pencil,
  Trash2,
  X,
  Phone,
  MessageSquare,
  User as UserIcon,
  MapPin,
  Lock,
  Unlock,
  Building2,
  RotateCw,
  Send,
  CheckSquare,
  Check,
  Clock,
  Layers,
  Info,
} from "lucide-react"
import { Lead } from "@/features/leads/types"
import { LeadFiltersDropdown } from "@/features/leads/components/LeadFiltersDropdown"
import { formatLeadReminderDate, transferLeadsToBranch, parseLeadDate, isReminderDateOverdue, canUserUnlockLead, isLeadClientPrivate, isLeadAssignedToUser, isTeamMemberRole } from "@/features/leads/services/leadService"
import { LabelItem } from "@/features/leads/components/ManageLabelsModal"
import { LabelSelectorPopover } from "@/features/leads/components/LabelSelectorPopover"
import { WhatsAppTemplateModal } from "@/features/leads/components/WhatsAppTemplateModal"
import { CallOutcomeModal } from "@/features/leads/components/CallOutcomeModal"
import { formatDisplayDate } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepBulkDelete } from "@/lib/confirmDialog"
import { type LeadListProps, WhatsAppIcon, statusBadgeStyles } from "@/features/leads/components/leadlist-sections/LeadListHelpers"

export function LeadListSection2({ ctrl }: { ctrl: any }) {
  const { activeBranches, selectedBranchFilter, setSelectedBranchFilter, setIsStageDropdownOpen, isStageDropdownOpen, setIsReminderDropdownOpen, setIsMemberDropdownOpen, setIsFiltersDropdownOpen, selectedStageFilter, setSelectedStageFilter, isReminderDropdownOpen, selectedReminderFilter, setSelectedReminderFilter, onOpenAddModal, setActiveFilter, activeFilter } = ctrl;
  return (
    <>
      {/* Branch Filter Dropdown */}
          {activeBranches && activeBranches.length > 0 && (
            <div className="relative">
              <select
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-medium bg-zinc-100/80 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer hover:bg-zinc-200/70"
              >
                <option value="all">All Branches ({(activeBranches || []).length})</option>
                <option value="unassigned">Unassigned Branch</option>
                {(activeBranches || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Stage / Status Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsStageDropdownOpen(!isStageDropdownOpen)
                setIsReminderDropdownOpen(false)
                setIsMemberDropdownOpen(false)
                setIsFiltersDropdownOpen(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors cursor-pointer ${
                selectedStageFilter !== "all"
                  ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-700 font-semibold"
                  : "bg-zinc-100/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70"
              }`}
            >
              <Layers size={13} className={selectedStageFilter !== "all" ? "text-cyan-600" : "text-zinc-500"} />
              <span>{selectedStageFilter === "all" ? "All Stages" : selectedStageFilter}</span>
              <span className="text-[10px] ml-0.5">▼</span>
            </button>

            {isStageDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsStageDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 overflow-hidden py-1 max-h-80 overflow-y-auto">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Filter by Stage
                  </p>
                  {[
                    "all",
                    "New",
                    "Qualified",
                    "Discussion",
                    "Negotiation",
                    "Store Visit",
                    "Our Office Visit",
                    "Won",
                    "Lost",
                  ].map((st) => {
                    const isSel = selectedStageFilter === st
                    const label = st === "all" ? "All Stages" : st
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setSelectedStageFilter(st)
                          setIsStageDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                          isSel ? "font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50/50 dark:bg-cyan-950/30" : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <span>{label}</span>
                        {isSel && <Check size={13} />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Reminder Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsReminderDropdownOpen(!isReminderDropdownOpen)
                setIsStageDropdownOpen(false)
                setIsMemberDropdownOpen(false)
                setIsFiltersDropdownOpen(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-colors cursor-pointer ${
                selectedReminderFilter !== "all"
                  ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-semibold"
                  : "bg-zinc-100/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200/70"
              }`}
            >
              <Clock size={13} className={selectedReminderFilter !== "all" ? "text-amber-600" : "text-zinc-500"} />
              <span>
                {selectedReminderFilter === "all"
                  ? "All Reminders"
                  : selectedReminderFilter === "none"
                  ? "No Reminder / None"
                  : selectedReminderFilter === "today"
                  ? "Today"
                  : selectedReminderFilter === "yesterday"
                  ? "Yesterday"
                  : selectedReminderFilter === "tomorrow"
                  ? "Tomorrow"
                  : selectedReminderFilter === "week"
                  ? "This Week (7 Days)"
                  : "This Month (30 Days)"}
              </span>
              <span className="text-[10px] ml-0.5">▼</span>
            </button>

            {isReminderDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsReminderDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1 w-56 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 overflow-hidden py-1">
                  <p className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Filter by Reminder Date
                  </p>
                  {[
                    { id: "all", label: "All Reminders" },
                    { id: "none", label: "No Reminder / None" },
                    { id: "today", label: "Today" },
                    { id: "yesterday", label: "Yesterday" },
                    { id: "tomorrow", label: "Tomorrow" },
                    { id: "week", label: "This Week (7 Days)" },
                    { id: "month", label: "This Month (30 Days)" },
                  ].map((opt) => {
                    const isSel = selectedReminderFilter === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSelectedReminderFilter(opt.id)
                          setIsReminderDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                          isSel ? "font-bold text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30" : "text-zinc-700 dark:text-zinc-300"
                        }`}
                      >
                        <span>{opt.label}</span>
                        {isSel && <Check size={13} />}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Plus Quick Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-md bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer"
          >
            <Plus size={14} />
          </button>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs ml-1">

            <button
              type="button"
              onClick={() => setActiveFilter("Call this week")}
              className={`p-1.5 rounded-full transition-colors ${
                activeFilter === "Call this week"
                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
              }`}
              title="Call this week"
            >
              <Phone size={13} />
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("My leads")}
              className={`p-1.5 rounded-full transition-colors ${
                activeFilter === "My leads"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
              }`}
              title="My leads"
            >
              <UserIcon size={13} />
            </button>
          </div>
    </>
  );
}
