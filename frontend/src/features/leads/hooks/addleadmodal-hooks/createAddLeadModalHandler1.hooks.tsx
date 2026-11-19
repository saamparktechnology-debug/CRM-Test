"use client"

import * as React from "react"
import { X, Plus, Check, Calendar, Clock, Wrench, FileText, User as UserIcon, Tag, Building, MapPin } from "lucide-react"
import { Lead, LeadStatus, LeadType } from "@/features/leads/types"
import { addLead, parseLeadDate, formatLeadReminderDate, MONTH_NAMES_SHORT } from "@/features/leads/services/leadService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients, ClientItem } from "@/features/clients/services/clientService"
import {
  SearchableSelect,
  ALL_COUNTRIES,
  INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
  getDistrictsForState,
  getCitiesForDistrict,
} from "@/features/leads/components/SearchableLocationSelect"
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, formatTimeForDisplay, type AddLeadModalProps, STANDARD_SOURCES } from "@/features/leads/components/addleadmodal-sections/AddLeadModalHelpers"

export function createAddLeadModalHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { leadMode, selectedClientId, companyName, selectedServices, customService, source, customSource, caller, isNoReminder, reminderDate, reminderTime, selectedBranchId, branches, user, selectedCompanyId, isSuperOrAdmin, activeCompanyId, selectedSubBranchId, activeSubBranchId, subBranches, setIsSubmitting, type, primaryContact, secondaryContact, phone, secondaryPhone, email, status, reminderNotes, managers, address, district, city, state, zip, country, website, vatNumber, gstNumber, currency, relatedTo, expectedTimeline, selectedClient, expectedStartDate, projectRequirement, onLeadAdded, onClose } = getCtrl();
    const __fn: any = async () => {
    if (leadMode === "existing_client" && !selectedClientId && !companyName.trim()) {
      alert("Please select an existing client from the list.")
      return
    }
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
    const finalCompanyId = selectedCompanyId || branchCompId || (isSuperOrAdmin ? (activeCompanyId || "tech") : (activeCompanyId || user?.companyId || "tech"))

    const finalSubBranchId = selectedSubBranchId || (activeSubBranchId && activeSubBranchId !== "all" ? activeSubBranchId : (user?.subBranchId || undefined))
    const targetSubBranchObj = finalSubBranchId ? subBranches?.find(sb => String(sb.id).toLowerCase().trim() === String(finalSubBranchId).toLowerCase().trim()) : undefined
    const finalSubBranchName = targetSubBranchObj?.name || user?.subBranchName || undefined

    const currentFreshUser = useAuthStore.getState().user || user
    const finalCreatorName = currentFreshUser?.name || currentFreshUser?.email || "User"
    const finalCreatorId = String(currentFreshUser?.id || "")
    const finalCreatorEmail = currentFreshUser?.email || ""
    const finalCreatorRole = currentFreshUser?.role || "Teams"

    setIsSubmitting(true)
    try {
      const created = await addLead({
        type,
        name: companyName,
        primaryContact: primaryContact || companyName,
        secondaryContact: secondaryContact || undefined,
        phone: phone || "+91 XXXXXXXX",
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
        createdBy: finalCreatorName,
        createdById: finalCreatorId,
        createdByName: finalCreatorName,
        createdByEmail: finalCreatorEmail,
        createdByRole: finalCreatorRole,
        branchId: finalBranchId,
        branchName: finalBranchName,
        subBranchId: finalSubBranchId,
        subBranchName: finalSubBranchName,
        companyId: finalCompanyId,
        isClientPrivate: currentFreshUser?.role === "Clients",
        ownerAvatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${companyName}`,
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
        labels: (() => {
          const l = user?.role !== "Super Admin" && user?.role !== "Admin" ? ["My Leads", "Call this week"] : ["Call this week"]
          if (leadMode === "existing_client" || selectedClientId) {
            l.push("Existing Client", "Repeat Project")
            if (expectedTimeline) l.push(expectedTimeline)
          }
          return l
        })(),
        clientId: selectedClientId || undefined,
        clientName: selectedClient?.name || (leadMode === "existing_client" ? companyName : undefined),
        isExistingClient: leadMode === "existing_client" || Boolean(selectedClientId),
        expectedTimeline: expectedTimeline.trim() || undefined,
        expectedStartDate: expectedStartDate.trim() || undefined,
        projectRequirement: projectRequirement.trim() || undefined,
        createdAt: `${new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}`,
      }, finalCompanyId)

      onLeadAdded(created)
      onClose()
    } catch (err: any) {
      console.error("Failed to create lead:", err)
      alert(err?.message || "Failed to create lead. Please check network or required fields.")
    } finally {
      setIsSubmitting(false)
    }
  };
    return __fn(...__args);
  };
}
