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

export interface LeadKanbanProps {
  leads: Lead[]
  availableLabels: LabelItem[]
  activeViewTab: "list" | "kanban"
  onChangeViewTab: (tab: "list" | "kanban") => void
  onOpenAddModal: () => void
  onOpenEditModal?: (lead: Lead) => void
  onDeleteLead?: (id: string) => void
  onSelectLeadDetail: (lead: Lead) => void
  onLeadUpdated: (updatedLead: Lead) => void
  onOpenManageLabelsModal: () => void
  onToggleLeadLabel: (leadId: string, labelName: string) => void
}

export function WhatsAppIcon({ className, size = 13 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export function parseReminderTimestamp(dateStr?: string, timeStr?: string): number {
  const parsedDate = parseLeadDate(dateStr)
  if (!parsedDate) {
    return Infinity // Leads with no reminder appear at the bottom
  }

  let hours = 0
  let minutes = 0

  if (timeStr && timeStr !== "None") {
    const isPM = /pm/i.test(timeStr)
    const isAM = /am/i.test(timeStr)
    const cleanTime = timeStr.replace(/[^0-9:]/g, "").trim()
    const [hRaw, mRaw] = cleanTime.split(":").map((v) => parseInt(v, 10))
    if (!isNaN(hRaw)) {
      let h = hRaw
      if (isPM && h < 12) h += 12
      if (isAM && h === 12) h = 0
      hours = h
    }
    if (!isNaN(mRaw)) minutes = mRaw
  }

  const d = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), hours, minutes)
  return isNaN(d.getTime()) ? Infinity : d.getTime()
}

export function getCallerAvatar(
  lead: Lead,
  allUsers: { id: string; name: string; avatar?: string; avatarUrl?: string; email?: string }[],
  currentUser?: { name?: string; avatar?: string; avatarUrl?: string } | null
) {
  const callerName =
    (lead.assignedTo && lead.assignedTo !== "None" && lead.assignedTo !== "Unassigned")
      ? lead.assignedTo
      : ((lead.caller && lead.caller !== "None" && lead.caller !== "Unassigned")
        ? lead.caller
        : ((lead.owner && lead.owner !== "None" && lead.owner !== "Unassigned")
          ? lead.owner
          : null))

  if (!callerName) {
    return { type: "unassigned" as const, name: "Unassigned" }
  }

  // 1. Direct lead.ownerAvatar if it is a real profile image (not a placeholder svg string or dicebear)
  if (lead.ownerAvatar && lead.ownerAvatar.trim() && !lead.ownerAvatar.includes("dicebear")) {
    return { type: "image" as const, src: lead.ownerAvatar, name: callerName }
  }

  // 2. Current logged in user profile image
  if (currentUser && currentUser.name && currentUser.name.trim().toLowerCase() === callerName.trim().toLowerCase()) {
    const curAvatar = (currentUser as any).avatarUrl || currentUser.avatar
    if (curAvatar && curAvatar.trim() && !curAvatar.includes("dicebear")) {
      return { type: "image" as const, src: curAvatar, name: callerName }
    }
  }

  // 3. Matched user from allUsers database
  const matchedUser = allUsers.find(
    (u) => (u.name && u.name.trim().toLowerCase() === callerName.trim().toLowerCase()) ||
           (u.email && u.email.trim().toLowerCase() === callerName.trim().toLowerCase())
  )
  if (matchedUser) {
    const uAvatar = matchedUser.avatarUrl || matchedUser.avatar
    if (uAvatar && uAvatar.trim() && !uAvatar.includes("dicebear")) {
      return { type: "image" as const, src: uAvatar, name: callerName }
    }
  }

  // 4. If user exists with name, show initials badge
  const parts = callerName.trim().split(/\s+/)
  const initials = (parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : (parts[0] ? parts[0].substring(0, 2) : "")).toUpperCase()

  return { type: "initials" as const, initials, name: callerName }
}

export interface KanbanColumnConfig {
  id: LeadStatus
  title: string
  headerBg: string
  borderTop: string
  titleColor: string
  badgeBg: string
  badgeText: string
  columnBorder: string
}

export const KANBAN_COLUMNS: KanbanColumnConfig[] = [
  {
    id: "New",
    title: "New",
    headerBg: "bg-sky-100/70 dark:bg-sky-950/60",
    borderTop: "border-t-sky-500",
    titleColor: "text-sky-900 dark:text-sky-200",
    badgeBg: "bg-sky-200/80 dark:bg-sky-900/80",
    badgeText: "text-sky-800 dark:text-sky-200",
    columnBorder: "border-sky-200/80 dark:border-sky-900/60",
  },
  {
    id: "Qualified",
    title: "Qualified",
    headerBg: "bg-teal-100/70 dark:bg-teal-950/60",
    borderTop: "border-t-teal-500",
    titleColor: "text-teal-900 dark:text-teal-200",
    badgeBg: "bg-teal-200/80 dark:bg-teal-900/80",
    badgeText: "text-teal-800 dark:text-teal-200",
    columnBorder: "border-teal-200/80 dark:border-teal-900/60",
  },
  {
    id: "Discussion",
    title: "Discussion",
    headerBg: "bg-indigo-100/70 dark:bg-indigo-950/60",
    borderTop: "border-t-indigo-500",
    titleColor: "text-indigo-900 dark:text-indigo-200",
    badgeBg: "bg-indigo-200/80 dark:bg-indigo-900/80",
    badgeText: "text-indigo-800 dark:text-indigo-200",
    columnBorder: "border-indigo-200/80 dark:border-indigo-900/60",
  },
  {
    id: "Negotiation",
    title: "Negotiation",
    headerBg: "bg-purple-100/70 dark:bg-purple-950/60",
    borderTop: "border-t-purple-500",
    titleColor: "text-purple-900 dark:text-purple-200",
    badgeBg: "bg-purple-200/80 dark:bg-purple-900/80",
    badgeText: "text-purple-800 dark:text-purple-200",
    columnBorder: "border-purple-200/80 dark:border-purple-900/60",
  },
  {
    id: "Store Visit",
    title: "Store Visit",
    headerBg: "bg-amber-100/70 dark:bg-amber-950/60",
    borderTop: "border-t-amber-500",
    titleColor: "text-amber-900 dark:text-amber-200",
    badgeBg: "bg-amber-200/80 dark:bg-amber-900/80",
    badgeText: "text-amber-800 dark:text-amber-200",
    columnBorder: "border-amber-200/80 dark:border-amber-900/60",
  },
  {
    id: "Our Office Visit",
    title: "Our Office Visit",
    headerBg: "bg-orange-100/70 dark:bg-orange-950/60",
    borderTop: "border-t-orange-500",
    titleColor: "text-orange-900 dark:text-orange-200",
    badgeBg: "bg-orange-200/80 dark:bg-orange-900/80",
    badgeText: "text-orange-800 dark:text-orange-200",
    columnBorder: "border-orange-200/80 dark:border-orange-900/60",
  },
  {
    id: "Won",
    title: "Won",
    headerBg: "bg-emerald-100/70 dark:bg-emerald-950/60",
    borderTop: "border-t-emerald-500",
    titleColor: "text-emerald-900 dark:text-emerald-200",
    badgeBg: "bg-emerald-200/80 dark:bg-emerald-900/80",
    badgeText: "text-emerald-800 dark:text-emerald-200",
    columnBorder: "border-emerald-200/80 dark:border-emerald-900/60",
  },
  {
    id: "Lost",
    title: "Lost",
    headerBg: "bg-rose-100/70 dark:bg-rose-950/60",
    borderTop: "border-t-rose-500",
    titleColor: "text-rose-900 dark:text-rose-200",
    badgeBg: "bg-rose-200/80 dark:bg-rose-900/80",
    badgeText: "text-rose-800 dark:text-rose-200",
    columnBorder: "border-rose-200/80 dark:border-rose-900/60",
  },
]
