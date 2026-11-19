"use client"

import * as React from "react"
import {
  Tag,
  Upload,
  Plus,
  Filter,
  Search,
  RotateCw,
  User as UserIcon,
  Phone,
  Wrench,
  Clock,
  MessageSquare,
  Heart,
  MapPin,
  Lock,
  Unlock,
  Building2,
  Pencil,
  CheckCircle2,
  X,
  Check,
  Layers,
  Trash2,
  Info,
} from "lucide-react"
import { Lead, LeadStatus } from "@/features/leads/types"
import { LeadFiltersDropdown } from "@/features/leads/components/LeadFiltersDropdown"
import { updateLead, parseLeadDate, formatLeadReminderDate, isReminderDateOverdue, canUserUnlockLead, isLeadClientPrivate, isLeadAssignedToUser, isTeamMemberRole } from "@/features/leads/services/leadService"
import { LabelItem } from "@/features/leads/components/ManageLabelsModal"
import { WhatsAppTemplateModal } from "@/features/leads/components/WhatsAppTemplateModal"
import { CallOutcomeModal } from "@/features/leads/components/CallOutcomeModal"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { type LeadKanbanProps, WhatsAppIcon, parseReminderTimestamp, getCallerAvatar, type KanbanColumnConfig, KANBAN_COLUMNS } from "@/features/leads/components/leadkanban-sections/LeadKanbanHelpers"

export function LeadKanbanSection1({ ctrl }: { ctrl: any }) {
  const { setIsFiltersDropdownOpen, isFiltersDropdownOpen, activeFilter, setActiveFilter, availableLabels, onOpenManageLabelsModal, setIsMemberDropdownOpen, isMemberDropdownOpen, selectedMember, isSuperAdminOrAdmin, user, selectedMemberStage, setMemberSearchQuery, memberSearchQuery, setSelectedMember, setSelectedMemberStage, assignedTeamMembers, allUsers, memberStageBreakdown } = ctrl;
  return (
    <>
      {/* Refresh Kanban */}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/50 cursor-pointer"
            title="Refresh"
          >
            <RotateCw size={14} />
          </button>

          {/* All Leads Filter Dropdown Trigger */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFiltersDropdownOpen(!isFiltersDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Filter size={13} className="text-zinc-500" />
              <span>{activeFilter || "All Leads"}</span>
              <span className="text-[10px] ml-0.5 text-zinc-400">▼</span>
            </button>

            <LeadFiltersDropdown
              isOpen={isFiltersDropdownOpen}
              onClose={() => setIsFiltersDropdownOpen(false)}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
              onClearFilters={() => setActiveFilter("All leads")}
              availableLabels={availableLabels}
              onOpenManageLabelsModal={onOpenManageLabelsModal}
            />
          </div>

          {/* Team Member Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setIsMemberDropdownOpen(!isMemberDropdownOpen)
                setIsFiltersDropdownOpen(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer ${
                selectedMember !== "all"
                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700"
                  : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <UserIcon size={13} className={selectedMember !== "all" ? "text-blue-600" : "text-zinc-500"} />
              <span>
                {!isSuperAdminOrAdmin && selectedMember === "all"
                  ? (user?.name || "My Leads") + (selectedMemberStage !== "all" ? ` • ${selectedMemberStage}` : "")
                  : selectedMember === "all"
                  ? "All Team Members"
                  : selectedMember === "unassigned"
                  ? "Unassigned Leads"
                  : selectedMemberStage !== "all"
                  ? `${selectedMember} • ${selectedMemberStage}`
                  : selectedMember}
              </span>
              <span className="text-[10px] ml-0.5 text-zinc-400">▼</span>
            </button>

            {isMemberDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => {
                    setIsMemberDropdownOpen(false)
                    setMemberSearchQuery("")
                  }}
                />
                <div className="absolute left-0 mt-1 w-72 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-30 overflow-hidden flex flex-col max-h-96">
                  {/* Search inside Member Dropdown */}
                  <div className="p-2 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search member..."
                        value={memberSearchQuery}
                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
                        autoFocus
                      />
                      <Search size={12} className="absolute left-2.5 top-2 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="py-1 overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {isSuperAdminOrAdmin && (
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember("all")
                            setSelectedMemberStage("all")
                            setIsMemberDropdownOpen(false)
                            setMemberSearchQuery("")
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                            selectedMember === "all" ? "font-semibold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <span>All Team Members</span>
                          {selectedMember === "all" && <span>✓</span>}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMember("unassigned")
                            setSelectedMemberStage("all")
                            setIsMemberDropdownOpen(false)
                            setMemberSearchQuery("")
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
                            selectedMember === "unassigned" ? "font-semibold text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <span className="text-zinc-500 italic">Unassigned Leads</span>
                          {selectedMember === "unassigned" && <span>✓</span>}
                        </button>
                      </div>
                    )}

                    <div className="py-1">
                      <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                        Assigned Members ({assignedTeamMembers.length})
                      </div>

                      {(() => {
                        const filtered = assignedTeamMembers.filter((m) =>
                          m.name.toLowerCase().includes(memberSearchQuery.toLowerCase().trim())
                        )

                        if (filtered.length === 0) {
                          return (
                            <div className="px-3 py-2 text-xs text-zinc-400 text-center italic">
                              {memberSearchQuery ? "No matching member" : "No assigned members"}
                            </div>
                          )
                        }

                        return filtered.map(({ name: member, count: leadCount }) => {
                          const userObj = allUsers.find(
                            (u) => u.name && u.name.trim().toLowerCase() === member.trim().toLowerCase()
                          )
                          const avatar = userObj?.avatar || (user?.name === member ? user?.avatar : null)
                          const initials = member
                            .split(" ")
                            .map((w) => w[0])
                            .filter(Boolean)
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()

                          const isMemberSelected = selectedMember.toLowerCase() === member.toLowerCase()
                          const stagesForMember = Object.entries(memberStageBreakdown[member] || {}).sort((a, b) => b[1] - a[1])

                          return (
                            <div
                              key={member}
                              className={`px-3 py-2 text-xs flex flex-col gap-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${
                                isMemberSelected ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
                              }`}
                            >
                              {/* Member Title Row */}
                              <div
                                onClick={() => {
                                  setSelectedMember(member)
                                  setSelectedMemberStage("all")
                                  setIsMemberDropdownOpen(false)
                                  setMemberSearchQuery("")
                                }}
                                className="flex items-center justify-between cursor-pointer group/mem"
                              >
                                <div className="flex items-center gap-2 min-w-0 pr-2">
                                  {avatar && !avatar.includes("dicebear") ? (
                                    <img
                                      src={avatar}
                                      alt={member}
                                      className="w-5 h-5 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover shrink-0"
                                    />
                                  ) : (
                                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                                      {initials}
                                    </div>
                                  )}
                                  <span className={`truncate font-medium group-hover/mem:text-blue-600 ${isMemberSelected ? "text-blue-600 font-semibold" : "text-zinc-800 dark:text-zinc-200"}`}>
                                    {member}
                                  </span>
                                </div>
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold shrink-0">
                                  {leadCount} Leads
                                </span>
                              </div>

                              {/* Stage Sub-filters for this member */}
                              {stagesForMember.length > 0 && (
                                <div className="flex items-center gap-1 flex-wrap pl-7">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedMember(member)
                                      setSelectedMemberStage("all")
                                      setIsMemberDropdownOpen(false)
                                      setMemberSearchQuery("")
                                    }}
                                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                                      isMemberSelected && selectedMemberStage === "all"
                                        ? "bg-blue-600 text-white font-bold shadow-2xs"
                                        : "bg-zinc-100/90 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                    }`}
                                  >
                                    All ({leadCount})
                                  </button>
                                  {stagesForMember.map(([stageName, sCount]) => {
                                    const isStageActive = isMemberSelected && selectedMemberStage === stageName
                                    return (
                                      <button
                                        key={stageName}
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setSelectedMember(member)
                                          setSelectedMemberStage(stageName)
                                          setIsMemberDropdownOpen(false)
                                          setMemberSearchQuery("")
                                        }}
                                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-medium transition-all cursor-pointer ${
                                          isStageActive
                                            ? "bg-blue-600 text-white font-bold shadow-2xs"
                                            : "bg-zinc-100/90 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-zinc-700"
                                        }`}
                                      >
                                        {stageName} ({sCount})
                                      </button>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
    </>
  );
}
