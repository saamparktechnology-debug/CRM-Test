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
import { LeadKanbanSection1 } from "@/features/leads/components/leadkanban-sections/LeadKanbanSection1"
import { LeadKanbanSection2 } from "@/features/leads/components/leadkanban-sections/LeadKanbanSection2"
import { LeadKanbanSection3 } from "@/features/leads/components/leadkanban-sections/LeadKanbanSection3"
import { type LeadKanbanProps, WhatsAppIcon, parseReminderTimestamp, getCallerAvatar, type KanbanColumnConfig, KANBAN_COLUMNS } from "@/features/leads/components/leadkanban-sections/LeadKanbanHelpers"

export function createLeadKanbanFn50(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { draggedLeadId, leads, user, setDraggedLeadId, onLeadUpdated, setMoveToast } = getCtrl();
    const __fn: any = async (newStatus: LeadStatus, leadIdParam?: string) => {
    const leadId = leadIdParam || draggedLeadId
    if (!leadId) return
    const targetLead = leads.find((l) => l.id === leadId)
    if (targetLead && targetLead.status !== newStatus) {
      const canUnlock = canUserUnlockLead(user, targetLead)
      if (targetLead.isLocked && !canUnlock && newStatus !== "Won" && newStatus !== "Lost") {
        alert("🔒 This lead is locked and cannot be moved.")
        setDraggedLeadId(null)
        return
      }
      const previousStatus = targetLead.status
      try {
        const updated = await updateLead(leadId, { status: newStatus }, user, targetLead.companyId)
        onLeadUpdated(updated)
        setMoveToast({
          visible: true,
          leadName: targetLead.name,
          fromStatus: previousStatus,
          toStatus: newStatus,
        })
      } catch (err: any) {
        console.error("Error moving lead:", err)
      }
    }
    setDraggedLeadId(null)
  };
    return __fn(...__args);
  };
}
