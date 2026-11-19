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

export function createLeadListAction21(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { activeFilter, selectedMember, selectedMemberStage, filteredLeads } = getCtrl();
    const __fn: any = () => {
    let filterTitle = activeFilter || "All Leads"
    if (selectedMember === "unassigned") {
      filterTitle += ` - Unassigned Leads`
    } else if (selectedMember !== "all") {
      filterTitle += ` - Member: ${selectedMember}`
      if (selectedMemberStage !== "all") {
        filterTitle += ` (${selectedMemberStage})`
      }
    }

    const rows = filteredLeads.map((l, index) => {
      const assignedPerson = (l.assignedTo && l.assignedTo !== "None" && l.assignedTo !== "Unassigned")
        ? l.assignedTo
        : ((l.caller && l.caller !== "None" && l.caller !== "Unassigned")
          ? l.caller
          : ((l.owner && l.owner !== "None" && l.owner !== "Unassigned")
            ? l.owner
            : "Unassigned"))

      const phoneVal = l.secondaryPhone ? `${l.phone} (Mgr: ${l.secondaryPhone})` : l.phone
      const contactVal = l.secondaryContact ? `${l.primaryContact} (Mgr: ${l.secondaryContact})` : l.primaryContact
      const reminderVal = l.reminderDate && l.reminderDate !== "None" && formatLeadReminderDate(l.reminderDate) !== "No Reminder"
        ? `${formatLeadReminderDate(l.reminderDate)}${l.reminderTime && l.reminderTime !== "None" ? ` (${l.reminderTime})` : ""}`
        : "-"

      return [
        index + 1,
        l.name,
        contactVal || "-",
        phoneVal || "-",
        l.service || "-",
        l.source || "-",
        l.city?.trim() || l.address?.trim() || l.state?.trim() || "-",
        assignedPerson,
        reminderVal,
        l.status,
        l.createdAt || "-"
      ]
    })

    printPDFReport({
      title: "Leads & Opportunities Registry",
      subtitle: `Filter: ${filterTitle}`,
      headers: [
        "#",
        "Lead Name",
        "Contact",
        "Phone",
        "Service",
        "Source",
        "City",
        "Assigned To",
        "Reminder",
        "Status",
        "Date"
      ],
      rows,
      landscape: true
    })
  };
    return __fn(...__args);
  };
}
