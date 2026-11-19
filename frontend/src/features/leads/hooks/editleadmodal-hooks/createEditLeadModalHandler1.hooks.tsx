"use client"

import * as React from "react"
import { X, Plus, Check, Calendar, Clock, Wrench, FileText, User as UserIcon, Trash2, MapPin, Building, Info } from "lucide-react"
import { Lead, LeadStatus, LeadType } from "@/features/leads/types"
import { updateLead, unlockLead, parseLeadDate, formatLeadReminderDate, isReminderDateOverdue, MONTH_NAMES_SHORT, canUserUnlockLead, isLeadClientPrivate } from "@/features/leads/services/leadService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import {
  SearchableSelect,
  ALL_COUNTRIES,
  INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
  getDistrictsForState,
  getCitiesForDistrict,
} from "@/features/leads/components/SearchableLocationSelect"
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, formatTimeForDisplay, type EditLeadModalProps, STANDARD_SOURCES } from "@/features/leads/components/editleadmodal-sections/EditLeadModalHelpers"

export function createEditLeadModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { lead, companyName, selectedServices, customService, source, customSource, caller, isNoReminder, reminderDate, reminderTime, selectedBranchId, branches, user, selectedCompanyId, isSuperOrAdmin, activeCompanyId, unlockedLocally, setIsSubmitting, type, primaryContact, secondaryContact, phone, secondaryPhone, email, status, reminderNotes, managers, address, district, city, state, zip, country, website, vatNumber, gstNumber, currency, relatedTo, selectedSubBranchId, subBranches, onLeadUpdated, onClose } = getCtrl();
    const __fn: any = async () => {
    if (!lead) return

    if (!companyName.trim()) {
      alert("Please enter a company or lead name.")
      return
    }

    const allEnteredServices = [...selectedServices, customService.trim()].filter(Boolean)
    const finalService = allEnteredServices.length > 0 ? Array.from(new Set(allEnteredServices)).join(", ") : ""
    const finalSource = source === "Others" ? (customSource.trim() || "Custom Source") : source
    const effectiveCaller = (caller && caller !== "None" && caller !== "Unassigned") ? caller : "None"
    const effectiveOwner = effectiveCaller !== "None" ? effectiveCaller : "None"
    const effectiveAssignedTo = effectiveCaller !== "None" ? effectiveCaller : "None"
    const finalReminderDate = isNoReminder ? "None" : (reminderDate || "None")
    const finalReminderTime = (isNoReminder || finalReminderDate === "None") ? "None" : (reminderTime || "11:30 AM")

    const cleanBranchId = selectedBranchId.trim()
    const targetBranchObj = cleanBranchId ? (branches || []).find((b: any) => 
      String(b.id || "").toLowerCase().trim() === cleanBranchId.toLowerCase() ||
      String(b.code || "").toLowerCase().trim() === cleanBranchId.toLowerCase() ||
      String(b.name || b.branch_name || "").toLowerCase().trim() === cleanBranchId.toLowerCase()
    ) : undefined

    const finalBranchId = targetBranchObj ? String(targetBranchObj.id) : (cleanBranchId || undefined)
    const finalBranchName = targetBranchObj?.name || (finalBranchId ? user?.branchName : undefined)
    const branchCompId = targetBranchObj?.companyId || (targetBranchObj as any)?.company_id
    const finalCompanyId = selectedCompanyId || branchCompId || (isSuperOrAdmin ? (activeCompanyId || "tech") : (lead.companyId || activeCompanyId || user?.companyId || "tech"))

    const isNewReminderOverdue = isReminderDateOverdue(finalReminderDate, finalReminderTime)
    const shouldUnlock = !isNewReminderOverdue || unlockedLocally

    setIsSubmitting(true)
    try {
      const updated = await updateLead(lead.id, {
        type,
        name: companyName,
        primaryContact,
        secondaryContact: secondaryContact || undefined,
        phone,
        secondaryPhone: secondaryPhone || undefined,
        email: email || undefined,
        status,
        service: finalService,
        reminderDate: finalReminderDate,
        reminderTime: finalReminderTime,
        reminderNotes,
        caller: effectiveCaller,
        owner: effectiveOwner,
        assignedTo: effectiveAssignedTo,
        managers: secondaryContact || managers,
        source: finalSource,
        address,
        district,
        city,
        state,
        zip,
        country: country || "India",
        website,
        vatNumber,
        gstNumber,
        currency,
        relatedTo: relatedTo.trim() || undefined,
        branchId: finalBranchId,
        branchName: finalBranchName,
        subBranchId: selectedSubBranchId || undefined,
        subBranchName: subBranches?.find(sb => String(sb.id).toLowerCase().trim() === String(selectedSubBranchId).toLowerCase().trim())?.name || undefined,
        companyId: finalCompanyId,
        isLocked: shouldUnlock ? false : undefined,
        isExplicitlyUnlocked: shouldUnlock ? true : undefined,
        lockedReason: shouldUnlock ? undefined : undefined,
      }, user?.role, finalCompanyId)

      onLeadUpdated(updated)
      onClose()
    } catch (err: any) {
      alert(err?.message || "Failed to update lead")
    } finally {
      setIsSubmitting(false)
    }
  };
    return __fn(...__args);
  };
}
