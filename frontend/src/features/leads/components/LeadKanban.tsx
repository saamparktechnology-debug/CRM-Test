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
import { Lead, LeadStatus } from "../types"
import { LeadFiltersDropdown } from "./LeadFiltersDropdown"
import { updateLead, parseLeadDate, formatLeadReminderDate, isReminderDateOverdue, canUserUnlockLead, isLeadClientPrivate, isLeadAssignedToUser, isTeamMemberRole } from "../services/leadService"
import { LabelItem } from "./ManageLabelsModal"
import { WhatsAppTemplateModal } from "./WhatsAppTemplateModal"
import { CallOutcomeModal } from "./CallOutcomeModal"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { LeadKanbanSection1 } from "@/features/leads/components/leadkanban-sections/LeadKanbanSection1"
import { LeadKanbanSection2 } from "@/features/leads/components/leadkanban-sections/LeadKanbanSection2"
import { LeadKanbanSection3 } from "@/features/leads/components/leadkanban-sections/LeadKanbanSection3"


import { type LeadKanbanProps, WhatsAppIcon, parseReminderTimestamp, getCallerAvatar, type KanbanColumnConfig, KANBAN_COLUMNS } from "@/features/leads/components/leadkanban-sections/LeadKanbanHelpers"
export * from "@/features/leads/components/leadkanban-sections/LeadKanbanHelpers"
import { createLeadKanbanFn50 } from "@/features/leads/hooks/leadkanban-hooks/createLeadKanbanFn50.hooks"


export function LeadKanban({
  leads = [],
  availableLabels = [],
  activeViewTab = "kanban",
  onChangeViewTab,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteLead,
  onSelectLeadDetail,
  onLeadUpdated,
  onOpenManageLabelsModal,
  onToggleLeadLabel,
}: LeadKanbanProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, branches, activeCompanyId, activeBranchId } = useAuthStore()
  const { canPerformAction } = usePermissionStore()

  const isSuperAdmin = user?.role === "Super Admin"
  const isSuperAdminOrAdmin = user?.role === "Super Admin" || user?.role === "Admin"
  const canAddLead = isSuperAdmin || canPerformAction(user, "Leads", "add")
  const canEditLead = isSuperAdmin || canPerformAction(user, "Leads", "edit")
  const canDeleteLead = isSuperAdmin || canPerformAction(user, "Leads", "delete")

  // Branches belonging to current active company
  const activeBranches = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    if (activeCompanyId && activeCompanyId !== "all") {
      return branches.filter((b) => b.companyId === activeCompanyId)
    }
    return branches
  }, [branches, activeCompanyId])

  const [allUsers, setAllUsers] = React.useState<{ id: string; name: string; role?: string; department?: string; email?: string; avatar?: string }[]>([])
  const [selectedMember, setSelectedMember] = React.useState<string>("all")
  const [selectedMemberStage, setSelectedMemberStage] = React.useState<string>("all")
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = React.useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = React.useState("")
  const [whatsAppModalLead, setWhatsAppModalLead] = React.useState<Lead | null>(null)
  const [callOutcomeModalLead, setCallOutcomeModalLead] = React.useState<Lead | null>(null)

  React.useEffect(() => {
    getUsers("all").then((list) => {
      setAllUsers(list || [])
    })
  }, [])

  // Only include team members who actually have assigned leads
  const assignedTeamMembers = React.useMemo(() => {
    const memberCounts: Record<string, number> = {}
    ;(leads || []).forEach((l) => {
      const candidates = [l.assignedTo, l.caller, l.owner].filter(
        (name): name is string => Boolean(name && name.trim() && name !== "None" && name !== "Unassigned")
      )
      const uniqueNames = new Set(candidates.map((n) => n.trim()))
      uniqueNames.forEach((name) => {
        memberCounts[name] = (memberCounts[name] || 0) + 1
      })
    })

    const allMembers = Object.entries(memberCounts)
      .filter(([_, count]) => count > 0)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

    if (!isSuperAdminOrAdmin && user?.name) {
      const myNorm = user.name.toLowerCase().trim()
      return allMembers.filter(m => m.name.toLowerCase().trim() === myNorm || m.name.toLowerCase().includes(myNorm) || myNorm.includes(m.name.toLowerCase().trim()))
    }

    return allMembers
  }, [leads, isSuperAdminOrAdmin, user?.name])

  // Compute breakdown of stages for each assigned member
  const memberStageBreakdown = React.useMemo(() => {
    const breakdown: Record<string, Record<string, number>> = {}
    ;(leads || []).forEach((l) => {
      const candidates = [l.assignedTo, l.caller, l.owner].filter(
        (name): name is string => Boolean(name && name.trim() && name !== "None" && name !== "Unassigned")
      )
      const uniqueNames = new Set(candidates.map((n) => n.trim()))
      const rawStatus = l.status || "New"
      const status = rawStatus === "They come to our office" ? "Our Office Visit" : rawStatus
      uniqueNames.forEach((name) => {
        if (!breakdown[name]) breakdown[name] = {}
        breakdown[name][status] = (breakdown[name][status] || 0) + 1
      })
    })
    return breakdown
  }, [leads])

  const [activeFilter, setActiveFilter] = React.useState("All leads")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [isFiltersDropdownOpen, setIsFiltersDropdownOpen] = React.useState(false)
  const [draggedLeadId, setDraggedLeadId] = React.useState<string | null>(null)

  const isTeamMember = isTeamMemberRole(user)
  const [selectedBranchFilter, setSelectedBranchFilter] = React.useState<string>(isTeamMember ? "all" : (activeBranchId || "all"))

  React.useEffect(() => {
    if (isTeamMember) {
      setSelectedBranchFilter("all")
    } else if (activeBranchId) {
      setSelectedBranchFilter(activeBranchId)
    } else {
      setSelectedBranchFilter("all")
    }
  }, [activeBranchId, isTeamMember])

  const [selectedStageFilter, setSelectedStageFilter] = React.useState<string>("all")
  const [isStageDropdownOpen, setIsStageDropdownOpen] = React.useState(false)
  const [selectedReminderFilter, setSelectedReminderFilter] = React.useState<string>("all")
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = React.useState(false)
  const [activeContactTarget, setActiveContactTarget] = React.useState<Record<string, "primary" | "secondary">>({})
  const [moveToast, setMoveToast] = React.useState<{
    visible: boolean
    leadName: string
    fromStatus?: string
    toStatus: string
  } | null>(null)

  React.useEffect(() => {
    if (!moveToast?.visible) return
    const timer = setTimeout(() => {
      setMoveToast(null)
    }, 3800)
    return () => clearTimeout(timer)
  }, [moveToast])

  // Mouse horizontal drag-to-scroll (Initiated from Column Headers only)
  const kanbanTrackRef = React.useRef<HTMLDivElement>(null)
  const isKanbanDraggingRef = React.useRef(false)
  const kanbanStartXRef = React.useRef(0)
  const kanbanScrollLeftRef = React.useRef(0)
  const hasKanbanDraggedRef = React.useRef(false)

  React.useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isKanbanDraggingRef.current || !kanbanTrackRef.current) return
      const x = e.pageX - kanbanTrackRef.current.offsetLeft
      const walk = (x - kanbanStartXRef.current) * 1.5
      if (Math.abs(walk) > 3) {
        hasKanbanDraggedRef.current = true
      }
      kanbanTrackRef.current.scrollLeft = kanbanScrollLeftRef.current - walk
    }

    const onMouseUp = () => {
      if (!isKanbanDraggingRef.current) return
      isKanbanDraggingRef.current = false
      if (kanbanTrackRef.current) {
        kanbanTrackRef.current.style.removeProperty("user-select")
      }
    }

    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
    return () => {
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [])

  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !kanbanTrackRef.current) return
    isKanbanDraggingRef.current = true
    hasKanbanDraggedRef.current = false
    kanbanStartXRef.current = e.pageX - kanbanTrackRef.current.offsetLeft
    kanbanScrollLeftRef.current = kanbanTrackRef.current.scrollLeft
    kanbanTrackRef.current.style.userSelect = "none"
  }

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasKanbanDraggedRef.current) {
      e.stopPropagation()
      e.preventDefault()
      hasKanbanDraggedRef.current = false
    }
  }

  // Filter leads
  const filteredLeads = (leads || []).filter((l) => {
    if (!l) return false
    const q = searchQuery.trim().toLowerCase()
    const cleanQueryDigits = q.replace(/\D/g, "")

    const nameStr = (l.name || "").toLowerCase()
    const contactStr = (l.primaryContact || "").toLowerCase()
    const secondaryContactStr = (l.secondaryContact || "").toLowerCase()
    const cityStr = (l.city || "").toLowerCase()
    const phoneStr = (l.phone || "").toLowerCase()
    const phoneDigits = (l.phone || "").replace(/\D/g, "")
    const secondaryPhoneStr = (l.secondaryPhone || "").toLowerCase()
    const secondaryPhoneDigits = (l.secondaryPhone || "").replace(/\D/g, "")
    const assignedToStr = (l.assignedTo || "").toLowerCase()
    const ownerStr = (l.owner || "").toLowerCase()
    const callerStr = (l.caller || "").toLowerCase()
    const managersStr = (l.managers || "").toLowerCase()
    const createdByStr = (l.createdBy || "").toLowerCase()
    const serviceStr = (l.service || "").toLowerCase()
    const sourceStr = (l.source || "").toLowerCase()

    const matchesSearch =
      !q ||
      nameStr.includes(q) ||
      contactStr.includes(q) ||
      secondaryContactStr.includes(q) ||
      cityStr.includes(q) ||
      phoneStr.includes(q) ||
      secondaryPhoneStr.includes(q) ||
      (cleanQueryDigits.length >= 3 && (phoneDigits.includes(cleanQueryDigits) || secondaryPhoneDigits.includes(cleanQueryDigits))) ||
      assignedToStr.includes(q) ||
      ownerStr.includes(q) ||
      callerStr.includes(q) ||
      managersStr.includes(q) ||
      createdByStr.includes(q) ||
      serviceStr.includes(q) ||
      sourceStr.includes(q)

    if (!matchesSearch) return false

    // ── STAGE / STATUS FILTER ──
    if (selectedStageFilter !== "all") {
      const normLeadStatus = (l.status === "They come to our office" ? "Our Office Visit" : (l.status || "New")).toLowerCase().trim()
      const normTargetStage = (selectedStageFilter === "They come to our office" ? "Our Office Visit" : selectedStageFilter).toLowerCase().trim()
      if (normLeadStatus !== normTargetStage) return false
    }

    // ── REMINDER DATE FILTER ──
    if (selectedReminderFilter !== "all") {
      const rawDate = l.reminderDate
      const parsedD = parseLeadDate(rawDate)
      
      if (selectedReminderFilter === "none") {
        const clean = (rawDate || "").toString().toLowerCase().trim()
        if (clean && clean !== "none" && clean !== "-" && clean !== "00,00,0000" && clean !== "00-00-0000" && !clean.includes("no reminder") && parsedD) {
          return false
        }
      } else {
        if (!parsedD) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const targetTime = parsedD.getTime()

        if (selectedReminderFilter === "today") {
          const endToday = new Date(today)
          endToday.setDate(endToday.getDate() + 1)
          if (targetTime < today.getTime() || targetTime >= endToday.getTime()) return false
        } else if (selectedReminderFilter === "yesterday") {
          const startYest = new Date(today)
          startYest.setDate(startYest.getDate() - 1)
          if (targetTime < startYest.getTime() || targetTime >= today.getTime()) return false
        } else if (selectedReminderFilter === "tomorrow") {
          const startTom = new Date(today)
          startTom.setDate(startTom.getDate() + 1)
          const endTom = new Date(today)
          endTom.setDate(endTom.getDate() + 2)
          if (targetTime < startTom.getTime() || targetTime >= endTom.getTime()) return false
        } else if (selectedReminderFilter === "week") {
          // Current / next 7 days
          const startWeek = new Date(today)
          const endWeek = new Date(today)
          endWeek.setDate(endWeek.getDate() + 7)
          if (targetTime < startWeek.getTime() || targetTime > endWeek.getTime()) return false
        } else if (selectedReminderFilter === "month") {
          // Current / next 30 days
          const startMonth = new Date(today)
          const endMonth = new Date(today)
          endMonth.setDate(endMonth.getDate() + 30)
          if (targetTime < startMonth.getTime() || targetTime > endMonth.getTime()) return false
        }
      }
    }

    // ── TEAM MEMBER FILTER ──
    if (selectedMember !== "all") {
      if (selectedMember === "unassigned") {
        const isAssigned =
          (l.assignedTo && l.assignedTo !== "None" && l.assignedTo !== "Unassigned") ||
          (l.caller && l.caller !== "None" && l.caller !== "Unassigned") ||
          (l.owner && l.owner !== "None" && l.owner !== "Unassigned")
        if (isAssigned) return false
      } else {
        const targetMemberNorm = selectedMember.toLowerCase().trim()
        const isMatch =
          isLeadAssignedToUser(l, { name: selectedMember }) ||
          (l.assignedTo && l.assignedTo.toLowerCase().trim().includes(targetMemberNorm)) ||
          (l.caller && l.caller.toLowerCase().trim().includes(targetMemberNorm)) ||
          (l.owner && l.owner.toLowerCase().trim().includes(targetMemberNorm)) ||
          (l.managers && l.managers.toLowerCase().includes(targetMemberNorm))
        if (!isMatch) return false

        // Stage sub-filter for assigned member
        if (selectedMemberStage && selectedMemberStage !== "all") {
          const leadStatus = l.status === "They come to our office" ? "Our Office Visit" : (l.status || "New")
          const targetStage = selectedMemberStage === "They come to our office" ? "Our Office Visit" : selectedMemberStage
          if (leadStatus !== targetStage) return false
        }
      }
    }

    // ── BRANCH FILTER ──
    const effectiveBranch = selectedBranchFilter
    if (effectiveBranch && effectiveBranch !== "all") {
      const isAssignedToMe = isLeadAssignedToUser(l, user)
      if (isTeamMember && isAssignedToMe && !l.branchId && !l.assignedBranchId && !(l as any).branch_id) {
        // Keep visible for assigned team member
      } else if (effectiveBranch === "unassigned") {
        if (l.branchId || l.assignedBranchId || l.branchName || l.assignedBranchName) return false
      } else {
        const targetStr = String(effectiveBranch).toLowerCase().trim()
        const targetBranchObj = branches.find(b => 
          String(b.id).toLowerCase().trim() === targetStr || 
          String(b.code || "").toLowerCase().trim() === targetStr || 
          b.name.toLowerCase().trim() === targetStr
        )
        const targetBranchId = String(targetBranchObj?.id || effectiveBranch).toLowerCase().trim()
        const targetBranchCode = String(targetBranchObj?.code || "").toLowerCase().trim()
        const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

        const lBranch = String(l.branchId || l.assignedBranchId || (l as any).branch_id || "").toLowerCase().trim()
        const lBranchName = String(l.branchName || l.assignedBranchName || (l as any).branch_name || "").toLowerCase().trim()

        const bMatch =
          (lBranch && (
            lBranch === targetBranchId || 
            (targetBranchCode && lBranch === targetBranchCode) || 
            (targetBranchName && lBranch === targetBranchName)
          )) ||
          (lBranchName && (
            lBranchName === targetBranchName || 
            lBranchName === targetBranchId || 
            (targetBranchCode && lBranchName === targetBranchCode)
          ))

        if (!bMatch && !(isTeamMember && isAssignedToMe && (!lBranch && !lBranchName))) return false
      }
    }

    const leadLabels = l.labels || []

    if (!activeFilter || activeFilter === "All leads" || activeFilter === "All Leads") {
      return true
    }

    if (activeFilter === "My leads" || activeFilter === "my_leads") {
      return isLeadAssignedToUser(l, user)
    }

    // Check if activeFilter matches a source (e.g. Social Media, Meta Ads, Google Ads, Local Market)
    const leadSource = (l.source || "").toLowerCase().trim()
    const filterClean = activeFilter.toLowerCase().trim()
    if (leadSource === filterClean) {
      return true
    }

    return leadLabels.includes(activeFilter)
  })

  // Drag and drop handling
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
    setDraggedLeadId(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop: any = createLeadKanbanFn50(() => __ctrlRef.current);

  
  __ctrl = { leads, availableLabels, activeViewTab, onChangeViewTab, onOpenAddModal, onOpenEditModal, onDeleteLead, onSelectLeadDetail, onLeadUpdated, onOpenManageLabelsModal, onToggleLeadLabel, user, branches, activeCompanyId, activeBranchId, canPerformAction, isSuperAdmin, isSuperAdminOrAdmin, canAddLead, canEditLead, canDeleteLead, activeBranches, allUsers, setAllUsers, selectedMember, setSelectedMember, selectedMemberStage, setSelectedMemberStage, isMemberDropdownOpen, setIsMemberDropdownOpen, memberSearchQuery, setMemberSearchQuery, whatsAppModalLead, setWhatsAppModalLead, callOutcomeModalLead, setCallOutcomeModalLead, assignedTeamMembers, memberStageBreakdown, activeFilter, setActiveFilter, searchQuery, setSearchQuery, isFiltersDropdownOpen, setIsFiltersDropdownOpen, draggedLeadId, setDraggedLeadId, isTeamMember, selectedBranchFilter, setSelectedBranchFilter, selectedStageFilter, setSelectedStageFilter, isStageDropdownOpen, setIsStageDropdownOpen, selectedReminderFilter, setSelectedReminderFilter, isReminderDropdownOpen, setIsReminderDropdownOpen, activeContactTarget, setActiveContactTarget, moveToast, setMoveToast, kanbanTrackRef, isKanbanDraggingRef, kanbanStartXRef, kanbanScrollLeftRef, hasKanbanDraggedRef, handleHeaderMouseDown, handleClickCapture, filteredLeads, handleDragStart, handleDragOver, handleDrop };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-4">
      {/* ---------------- TOP VIEW TABS & HEADER ACTIONS ---------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => onChangeViewTab("list")}
            className={`pb-2 text-sm font-medium transition-colors relative cursor-pointer ${
              activeViewTab === "list"
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Leads
            {activeViewTab === "list" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => onChangeViewTab("kanban")}
            className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeViewTab === "kanban"
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            Kanban
            {activeViewTab === "kanban" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
            )}
          </button>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenManageLabelsModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs cursor-pointer"
          >
            <Tag size={14} className="text-zinc-500" />
            <span>Manage labels</span>
          </button>

          {canAddLead && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors shadow-2xs cursor-pointer"
            >
              <Plus size={14} className="text-zinc-500" />
              <span>Add lead</span>
            </button>
          )}
        </div>
      </div>

      {/* ---------------- SUB-HEADER TOOLBAR (Search & Filters) ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        {/* Left Side Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <LeadKanbanSection1 ctrl={__ctrl} />

          <LeadKanbanSection2 ctrl={__ctrl} />

          {/* Filter Quick Pills */}
          <div className="flex items-center gap-2 text-xs ml-1">
            <button
              type="button"
              onClick={() => setActiveFilter("Call this week")}
              className={`p-1.5 rounded-full transition-colors ${
                activeFilter === "Call this week"
                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                  : "text-zinc-500 hover:bg-zinc-100"
              }`}
              title="Phone Leads"
            >
              <Phone size={14} />
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("My leads")}
              className={`p-1.5 rounded-full transition-colors ${
                activeFilter === "My leads"
                  ? "bg-blue-100 text-blue-700 border border-blue-300"
                  : "text-zinc-500 hover:bg-zinc-100"
              }`}
              title="Caller Filter"
            >
              <UserIcon size={14} />
            </button>
          </div>
        </div>

        {/* Right Search Input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <RotateCw size={14} />
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search name, assigned user, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 sm:w-64 pl-3 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
            <Search size={13} className="absolute right-3 top-2 text-zinc-400" />
          </div>
        </div>

      </div>

      {/* ---------------- KANBAN STAGE COLUMNS (Single Horizontal Scroll Track) ---------------- */}
      <div
        ref={kanbanTrackRef}
        className="flex gap-4 overflow-x-auto pb-6 pt-1 items-start scrollbar-thin max-w-full"
      >
        <LeadKanbanSection3 ctrl={__ctrl} />
      </div>

      {/* Stage Movement Popup / Toast Notification */}
      {moveToast && moveToast.visible && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 shadow-2xl rounded-2xl p-4 max-w-sm flex items-start gap-3 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={20} />
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-zinc-900 dark:text-white">
                  Lead Stage Moved!
                </p>
                <button
                  type="button"
                  onClick={() => setMoveToast(null)}
                  className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-0.5"
                >
                  <X size={14} />
                </button>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 leading-snug">
                <strong className="text-zinc-900 dark:text-zinc-100 font-semibold">{moveToast.leadName}</strong> has been moved to{" "}
                <span className="inline-block font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200 dark:border-emerald-800">
                  {moveToast.toStatus}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 1-Click WhatsApp Message Generator Modal */}
      <WhatsAppTemplateModal
        isOpen={Boolean(whatsAppModalLead)}
        onClose={() => setWhatsAppModalLead(null)}
        lead={whatsAppModalLead}
      />

      {/* Telecalling Log Outcome Modal */}
      <CallOutcomeModal
        isOpen={Boolean(callOutcomeModalLead)}
        onClose={() => setCallOutcomeModalLead(null)}
        lead={callOutcomeModalLead}
        onLeadUpdated={(updated) => {
          onLeadUpdated(updated)
        }}
      />

    </div>
  )
}
