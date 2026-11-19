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
import { Lead } from "../types"
import { LeadFiltersDropdown } from "./LeadFiltersDropdown"
import { formatLeadReminderDate, transferLeadsToBranch, parseLeadDate, isReminderDateOverdue, canUserUnlockLead, isLeadClientPrivate, isLeadAssignedToUser, isTeamMemberRole } from "../services/leadService"
import { LabelItem } from "./ManageLabelsModal"
import { LabelSelectorPopover } from "./LabelSelectorPopover"
import { WhatsAppTemplateModal } from "./WhatsAppTemplateModal"
import { CallOutcomeModal } from "./CallOutcomeModal"
import { formatDisplayDate } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { getUsers } from "@/features/users/services/userService"
import { exportToExcel, printPDFReport } from "@/lib/exportUtils"
import { confirmTwoStepBulkDelete } from "@/lib/confirmDialog"
import { LeadListSection1 } from "@/features/leads/components/leadlist-sections/LeadListSection1"
import { LeadListSection2 } from "@/features/leads/components/leadlist-sections/LeadListSection2"
import { LeadListSection3 } from "@/features/leads/components/leadlist-sections/LeadListSection3"
import { LeadListSection4 } from "@/features/leads/components/leadlist-sections/LeadListSection4"


import { type LeadListProps, WhatsAppIcon, statusBadgeStyles } from "@/features/leads/components/leadlist-sections/LeadListHelpers"
export * from "@/features/leads/components/leadlist-sections/LeadListHelpers"
import { createLeadListAction20 } from "@/features/leads/hooks/leadlist-hooks/createLeadListAction20.hooks"
import { createLeadListAction21 } from "@/features/leads/hooks/leadlist-hooks/createLeadListAction21.hooks"
import { createLeadListFn50 } from "@/features/leads/hooks/leadlist-hooks/createLeadListFn50.hooks"



export function LeadList({
  leads = [],
  availableLabels = [],
  activeViewTab = "list",
  onChangeViewTab,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteLead,
  onSelectLeadDetail,
  onOpenManageLabelsModal,
  onToggleLeadLabel,
  onLeadUpdated,
}: LeadListProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, branches, activeCompanyId, activeBranchId } = useAuthStore()
  const { canPerformAction } = usePermissionStore()
  
  const isSuperAdmin = user?.role === "Super Admin"
  const isSuperAdminOrAdmin = user?.role === "Super Admin" || user?.role === "Admin"
  const canAddLead = isSuperAdmin || canPerformAction(user, "Leads", "add")
  const canEditLead = isSuperAdmin || canPerformAction(user, "Leads", "edit")
  const canDeleteLead = isSuperAdmin || canPerformAction(user, "Leads", "delete")

  // Branches belonging to current active company (cleanly handle empty branches)
  const activeBranches = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    if (activeCompanyId && activeCompanyId !== "all") {
      return branches.filter((b) => b.companyId === activeCompanyId)
    }
    return branches
  }, [branches, activeCompanyId])

  // Bulk and Individual Lead Selection state
  const [selectedLeadIds, setSelectedLeadIds] = React.useState<string[]>([])
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false)
  const [selectedTargetBranchId, setSelectedTargetBranchId] = React.useState<string>("")
  const isTeamMember = isTeamMemberRole(user)
  const [selectedBranchFilter, setSelectedBranchFilter] = React.useState<string>(isTeamMember ? "all" : (activeBranchId || "all"))
  const [isTransferring, setIsTransferring] = React.useState(false)

  React.useEffect(() => {
    if (isTeamMember) {
      setSelectedBranchFilter("all")
    } else if (activeBranchId) {
      setSelectedBranchFilter(activeBranchId)
    } else {
      setSelectedBranchFilter("all")
    }
  }, [activeBranchId, isTeamMember])

  const [allUsers, setAllUsers] = React.useState<{ id: string; name: string; role?: string; department?: string; email?: string; avatar?: string; avatarUrl?: string }[]>([])
  const [usersMap, setUsersMap] = React.useState<Record<string, { department?: string; role?: string; avatarUrl?: string }>>({})
  const [selectedMember, setSelectedMember] = React.useState<string>("all")
  const [selectedMemberStage, setSelectedMemberStage] = React.useState<string>("all")
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = React.useState(false)
  const [memberSearchQuery, setMemberSearchQuery] = React.useState("")

  const [selectedStageFilter, setSelectedStageFilter] = React.useState<string>("all")
  const [isStageDropdownOpen, setIsStageDropdownOpen] = React.useState(false)
  const [selectedReminderFilter, setSelectedReminderFilter] = React.useState<string>("all")
  const [isReminderDropdownOpen, setIsReminderDropdownOpen] = React.useState(false)
  const [whatsAppModalLead, setWhatsAppModalLead] = React.useState<Lead | null>(null)
  const [callOutcomeModalLead, setCallOutcomeModalLead] = React.useState<Lead | null>(null)

  React.useEffect(() => {
    getUsers("all").then((list) => {
      setAllUsers(list || [])
      const map: Record<string, { department?: string; role?: string; avatarUrl?: string }> = {}
      ;(list || []).forEach((u) => {
        if (u.name) map[u.name.toLowerCase().trim()] = { department: u.department, role: u.role, avatarUrl: u.avatarUrl }
        if (u.email) map[u.email.toLowerCase().trim()] = { department: u.department, role: u.role, avatarUrl: u.avatarUrl }
      })
      setUsersMap(map)
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
  const [activePopoverLeadId, setActivePopoverLeadId] = React.useState<string | null>(null)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // Mouse horizontal drag-to-scroll
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  const isDraggingRef = React.useRef(false)
  const startXRef = React.useRef(0)
  const scrollLeftRef = React.useRef(0)
  const hasDraggedRef = React.useRef(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !tableContainerRef.current) return
    const target = e.target as HTMLElement
    // Ignore interactive elements so users can click/select normally
    if (target.closest("input, select, textarea, button, a")) return

    isDraggingRef.current = true
    hasDraggedRef.current = false
    startXRef.current = e.pageX - tableContainerRef.current.offsetLeft
    scrollLeftRef.current = tableContainerRef.current.scrollLeft
    tableContainerRef.current.style.cursor = "grabbing"
    tableContainerRef.current.style.userSelect = "none"
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !tableContainerRef.current) return
    e.preventDefault()
    const x = e.pageX - tableContainerRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.5
    if (Math.abs(walk) > 3) {
      hasDraggedRef.current = true
    }
    tableContainerRef.current.scrollLeft = scrollLeftRef.current - walk
  }

  const handleMouseUpOrLeave = () => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    if (tableContainerRef.current) {
      tableContainerRef.current.style.cursor = "grab"
      tableContainerRef.current.style.removeProperty("user-select")
    }
  }

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasDraggedRef.current) {
      e.stopPropagation()
      e.preventDefault()
      hasDraggedRef.current = false
    }
  }

  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeFilter, pageSize, selectedStageFilter, selectedReminderFilter, selectedBranchFilter, selectedMember, selectedMemberStage])

  // Filter logic
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

  // Pagination calculation
  const totalItems = filteredLeads.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

  // Selection handlers
  const isAllVisibleSelected =
    paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedLeadIds.includes(l.id))
  const isSomeVisibleSelected =
    paginatedLeads.some((l) => selectedLeadIds.includes(l.id)) && !isAllVisibleSelected

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      const visibleIds = new Set(paginatedLeads.map((l) => l.id))
      setSelectedLeadIds((prev) => prev.filter((id) => !visibleIds.has(id)))
    } else {
      const next = new Set([...selectedLeadIds, ...paginatedLeads.map((l) => l.id)])
      setSelectedLeadIds(Array.from(next))
    }
  }

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleExecuteTransfer: any = createLeadListFn50(() => __ctrlRef.current);

  // Export Leads to Excel
  const handleExportExcel: any = createLeadListAction20(() => __ctrlRef.current);

  // PDF Print Generator
  const handlePrintPDF: any = createLeadListAction21(() => __ctrlRef.current);

  
  __ctrl = { leads, availableLabels, activeViewTab, onChangeViewTab, onOpenAddModal, onOpenEditModal, onDeleteLead, onSelectLeadDetail, onOpenManageLabelsModal, onToggleLeadLabel, onLeadUpdated, user, branches, activeCompanyId, activeBranchId, canPerformAction, isSuperAdmin, isSuperAdminOrAdmin, canAddLead, canEditLead, canDeleteLead, activeBranches, selectedLeadIds, setSelectedLeadIds, isTransferModalOpen, setIsTransferModalOpen, selectedTargetBranchId, setSelectedTargetBranchId, isTeamMember, selectedBranchFilter, setSelectedBranchFilter, isTransferring, setIsTransferring, allUsers, setAllUsers, usersMap, setUsersMap, selectedMember, setSelectedMember, selectedMemberStage, setSelectedMemberStage, isMemberDropdownOpen, setIsMemberDropdownOpen, memberSearchQuery, setMemberSearchQuery, selectedStageFilter, setSelectedStageFilter, isStageDropdownOpen, setIsStageDropdownOpen, selectedReminderFilter, setSelectedReminderFilter, isReminderDropdownOpen, setIsReminderDropdownOpen, whatsAppModalLead, setWhatsAppModalLead, callOutcomeModalLead, setCallOutcomeModalLead, assignedTeamMembers, memberStageBreakdown, activeFilter, setActiveFilter, searchQuery, setSearchQuery, isFiltersDropdownOpen, setIsFiltersDropdownOpen, activePopoverLeadId, setActivePopoverLeadId, currentPage, setCurrentPage, pageSize, setPageSize, tableContainerRef, isDraggingRef, startXRef, scrollLeftRef, hasDraggedRef, handleMouseDown, handleMouseMove, handleMouseUpOrLeave, handleClickCapture, filteredLeads, totalItems, totalPages, safeCurrentPage, startIndex, endIndex, paginatedLeads, isAllVisibleSelected, isSomeVisibleSelected, handleToggleSelectAll, handleToggleSelectLead, handleExecuteTransfer, handleExportExcel, handlePrintPDF };
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
            className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
              activeViewTab === "list"
                ? "text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            List
            {activeViewTab === "list" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-white rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onChangeViewTab("kanban")}
            className={`pb-2 text-sm font-medium transition-colors relative cursor-pointer ${
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
          <LeadListSection1 ctrl={__ctrl} />

          <LeadListSection2 ctrl={__ctrl} />
        </div>

        {/* Right Side Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => alert("Settings clicked")}
            className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Settings size={15} />
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Excel
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            className="px-2.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Print
          </button>

          {canDeleteLead && selectedLeadIds.length > 0 && (
            <button
              type="button"
              onClick={async () => {
                if (await confirmTwoStepBulkDelete(selectedLeadIds.length, "lead(s)")) {
                  selectedLeadIds.forEach((id) => onDeleteLead(id))
                  setSelectedLeadIds([])
                }
              }}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete Selected ({selectedLeadIds.length})</span>
            </button>
          )}

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search name, assigned user, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-44 sm:w-60 pl-3 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
            <Search size={13} className="absolute right-2.5 top-2 text-zinc-400" />
          </div>
        </div>

      </div>

      {/* ---------------- DATA TABLE (Image 1 & Screenshot 1) ---------------- */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
        <div
          ref={tableContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleClickCapture}
          className="overflow-x-auto select-none cursor-grab active:cursor-grabbing scrollbar-thin"
        >
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold bg-zinc-50/50 dark:bg-zinc-800/40">
                {canDeleteLead && (
                  <th className="py-3 px-3 w-8 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      ref={(input) => {
                        if (input) input.indeterminate = isSomeVisibleSelected
                      }}
                      onChange={handleToggleSelectAll}
                      className="w-3.5 h-3.5 rounded border-zinc-300 text-blue-600 cursor-pointer"
                    />
                  </th>
                )}
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Primary contact</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Assigned to</th>
                <th className="py-3 px-4">Labels</th>
                <th className="py-3 px-4">Created at</th>
                <th className="py-3 px-4">Reminder Date</th>
                <th className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <ArrowDown size={12} className="text-zinc-500" />
                    <span>Status</span>
                  </div>
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800">
              <LeadListSection3 ctrl={__ctrl} />

              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center text-xl shadow-xs">
                        📋
                      </div>
                      <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">No leads found matching criteria</p>
                      <p className="text-xs text-zinc-400 max-w-xs">Try adjusting your filters or search keywords, or add a new lead.</p>
                      {canAddLead && (
                        <button
                          type="button"
                          onClick={onOpenAddModal}
                          className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>Add New Lead</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="px-2 py-1 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-700 dark:text-zinc-300 font-medium cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span className="font-medium">
              {totalItems === 0 ? "0 / 0" : `${startIndex + 1}-${endIndex} / ${totalItems}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold"
              title="Previous page"
            >
              &lt;
            </button>

            {/* Page number buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              if (
                totalPages > 7 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - safeCurrentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="px-1 text-zinc-400">...</span>
                }
                return null
              }

              const isActive = pageNum === safeCurrentPage
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`min-w-[28px] px-2 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}

            {/* Next Page Button */}
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-colors font-semibold"
              title="Next page"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      <LeadListSection4 ctrl={__ctrl} />

    </div>
  )
}
