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
import { LeadListSection1 } from "@/features/leads/components/leadlist-sections/LeadListSection1"
import { LeadListSection2 } from "@/features/leads/components/leadlist-sections/LeadListSection2"
import { LeadListSection3 } from "@/features/leads/components/leadlist-sections/LeadListSection3"
import { LeadListSection4 } from "@/features/leads/components/leadlist-sections/LeadListSection4"
import { type LeadListProps, WhatsAppIcon, statusBadgeStyles } from "@/features/leads/components/leadlist-sections/LeadListHelpers"
import { createLeadListAction20 } from "@/features/leads/hooks/leadlist-hooks/createLeadListAction20.hooks"
import { createLeadListAction21 } from "@/features/leads/hooks/leadlist-hooks/createLeadListAction21.hooks"

export function createLeadListFn50(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { selectedTargetBranchId, activeBranches, setIsTransferring, selectedLeadIds, user, activeCompanyId, setSelectedLeadIds, setIsTransferModalOpen, onLeadUpdated } = getCtrl();
    const __fn: any = async () => {
    if (!selectedTargetBranchId) {
      alert("Please select a destination branch.")
      return
    }
    const targetBranch = activeBranches.find((b) => b.id === selectedTargetBranchId)
    if (!targetBranch) {
      alert("Selected branch could not be found.")
      return
    }

    setIsTransferring(true)
    try {
      const updated = await transferLeadsToBranch(
        selectedLeadIds,
        targetBranch.id,
        targetBranch.name,
        user?.name || "Admin",
        user?.role || "Admin",
        activeCompanyId || undefined
      )
      setSelectedLeadIds([])
      setIsTransferModalOpen(false)
      if (updated.length > 0 && onLeadUpdated) {
        updated.forEach((ul) => onLeadUpdated(ul))
      }
    } catch (err) {
      console.error("Error transferring leads to branch:", err)
      alert("Failed to transfer leads to branch.")
    } finally {
      setIsTransferring(false)
    }
  };
    return __fn(...__args);
  };
}
