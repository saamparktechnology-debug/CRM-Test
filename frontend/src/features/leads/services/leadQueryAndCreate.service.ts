import { Lead } from "@/features/leads/types"
import { api } from "@/lib/api"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients } from "@/features/clients/services/clientService"
import { recordUserAccount } from "@/features/users/services/userService"
import { recordActivityLog } from "@/services/activityLogService"

import {
  isReminderDateOverdue,
  syncLeadReminderTask,
  normalizeCompanyId,
  isTeamMemberRole,
  isLeadAssignedToUser,
} from "./leadHelpers.service"

export const getLeads = async (companyId?: string): Promise<Lead[]> => {
  let targetComp = companyId
  let currentUser: any = null
  if (typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore")
      targetComp = targetComp || useAuthStore.getState().activeCompanyId || undefined
      currentUser = useAuthStore.getState().user
    } catch {}
  }

  const isTeam = isTeamMemberRole(currentUser)
  const effectiveComp = isTeam ? "all" : (targetComp || "all")
  let list: Lead[] = []

  const knownCompanies = ["tech", "consultancy", "print", "saampark"]

  if (effectiveComp === "all") {
    const allData = await fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => [])
    const map = new Map<string, Lead>()
    for (const l of (Array.isArray(allData) ? allData : [])) {
      if (l && l.id) {
        map.set(String(l.id).toLowerCase().trim(), l)
      }
    }
    const results = await Promise.all(
      knownCompanies.map(c => fetchModuleDataFromDB<Lead[]>("leads", [], c).catch(() => []))
    )
    for (let i = 0; i < results.length; i++) {
      const items = Array.isArray(results[i]) ? results[i] : []
      for (const l of items) {
        if (l && l.id) {
          const lId = String(l.id).toLowerCase().trim()
          if (!map.has(lId)) {
            map.set(lId, { ...l, companyId: normalizeCompanyId(l.companyId || knownCompanies[i]) })
          }
        }
      }
    }
    list = Array.from(map.values())
  } else {
    const canonicalTarget = normalizeCompanyId(effectiveComp)
    const toFetch = [canonicalTarget]
    if (canonicalTarget === "consultancy") {
      toFetch.push("print")
    }
    if (canonicalTarget === "tech") {
      toFetch.push("saampark")
    }

    const [allData, ...scopedResults] = await Promise.all([
      fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => []),
      ...toFetch.map(c => fetchModuleDataFromDB<Lead[]>("leads", [], c).catch(() => []))
    ])

    const map = new Map<string, Lead>()
    for (const res of scopedResults) {
      for (const l of (Array.isArray(res) ? res : [])) {
        if (l && l.id) {
          map.set(String(l.id).toLowerCase().trim(), { ...l, companyId: canonicalTarget })
        }
      }
    }

    for (const l of (Array.isArray(allData) ? allData : [])) {
      if (l && l.id && normalizeCompanyId(l.companyId) === canonicalTarget) {
        const lId = String(l.id).toLowerCase().trim()
        const existing = map.get(lId)
        if (!existing) {
          map.set(lId, { ...l, companyId: canonicalTarget })
        } else {
          map.set(lId, {
            ...existing,
            ...l,
            companyId: canonicalTarget,
            branchId: l.branchId !== undefined ? l.branchId : existing.branchId,
            branchName: l.branchName !== undefined ? l.branchName : existing.branchName,
            assignedBranchId: l.assignedBranchId !== undefined ? l.assignedBranchId : existing.assignedBranchId,
            assignedBranchName: l.assignedBranchName !== undefined ? l.assignedBranchName : existing.assignedBranchName,
            isLocked: l.isLocked !== undefined ? l.isLocked : existing.isLocked,
            lockedReason: l.lockedReason !== undefined ? l.lockedReason : existing.lockedReason,
            isExplicitlyUnlocked: (l as any).isExplicitlyUnlocked !== undefined ? (l as any).isExplicitlyUnlocked : (existing as any).isExplicitlyUnlocked,
            unlockedByAdmin: (l as any).unlockedByAdmin !== undefined ? (l as any).unlockedByAdmin : (existing as any).unlockedByAdmin,
            unlockedByClient: (l as any).unlockedByClient !== undefined ? (l as any).unlockedByClient : (existing as any).unlockedByClient,
            unlockedBy: (l as any).unlockedBy !== undefined ? (l as any).unlockedBy : (existing as any).unlockedBy,
            unlockedByRole: (l as any).unlockedByRole !== undefined ? (l as any).unlockedByRole : (existing as any).unlockedByRole,
            unlockedAt: (l as any).unlockedAt !== undefined ? (l as any).unlockedAt : (existing as any).unlockedAt,
          })
        }
      }
    }
    list = Array.from(map.values())
  }

  // Auto-lock leads if reminder date is overdue (locks at the end of the reminder date)
  // Leads in "Won" or "Lost" stages are NEVER locked
  let hasChanges = false
  const processed = list.map((rawLead) => {
    const safeLabels = Array.isArray(rawLead.labels) ? rawLead.labels : []
    const lead = {
      ...rawLead,
      labels: safeLabels,
    }
    const statusLower = (lead.status || "").toLowerCase().trim()
    const isWonOrLost = statusLower === "won" || statusLower === "lost"

    // 1. Won leads are LOCKED by default (finalized deal, converted to client)
    if (statusLower === "won") {
      if (lead.isLocked !== true && !lead.lockedReason?.includes("Unlocked")) {
        hasChanges = true
        return {
          ...lead,
          isLocked: true,
          lockedReason: "Won: Lead is finalized and converted to Client.",
        }
      }
      return lead
    }

    if (statusLower === "lost") {
      if (lead.isLocked) {
        hasChanges = true
        return {
          ...lead,
          isLocked: false,
          lockedReason: undefined,
        }
      }
      return lead
    }

    // 2. Explicitly unlocked leads: PRESERVE unlocked state unconditionally
    const isExplicitlyUnlocked =
      (lead as any).isExplicitlyUnlocked === true ||
      lead.lockedReason?.includes("Unlocked") ||
      (lead as any).unlockedByAdmin === true ||
      (lead as any).unlockedByClient === true

    if (isExplicitlyUnlocked) {
      if (lead.isLocked) {
        hasChanges = true
        return {
          ...lead,
          isLocked: false,
          lockedReason: lead.lockedReason || "Unlocked",
          isExplicitlyUnlocked: true,
        }
      }
      return lead
    }

    // 3. Active leads: check if reminder date is overdue (passed reminder time or end of date)
    const overdue = isReminderDateOverdue(lead.reminderDate, lead.reminderTime)
    if (overdue) {
      if (!lead.isLocked) {
        hasChanges = true
        return {
          ...lead,
          isLocked: true,
          lockedReason: "Overdue: Lead reminder date expired.",
          isExplicitlyUnlocked: false,
        }
      }
      return lead
    }

    // 4. Not overdue leads: release automatic lock
    if (!overdue && lead.isLocked && !lead.lockedReason?.includes("Manually locked")) {
      hasChanges = true
      return {
        ...lead,
        isLocked: false,
        lockedReason: undefined,
        isExplicitlyUnlocked: false,
      }
    }

    return lead
  })

  // Read-only fetch: never trigger write (POST /store/leads) inside getLeads()

  // Client Isolation: If client user, strictly only return their leads.
  if (currentUser?.role === "Clients" || currentUser?.role?.toLowerCase().includes("client")) {
    const cId = String(currentUser.id || "").toLowerCase().trim()
    const cEmail = (currentUser.email || "").toLowerCase().trim()
    const cName = (currentUser.name || "").toLowerCase().trim()
    return processed.filter((l) => {
      const leadCreatorId = String(l.createdById || "").toLowerCase().trim()
      const leadCreatorEmail = (l.createdByEmail || "").toLowerCase().trim()
      const leadCreatedBy = (l.createdBy || "").toLowerCase().trim()
      return (
        (cId && leadCreatorId === cId) ||
        (cEmail && leadCreatorEmail === cEmail) ||
        (cEmail && leadCreatedBy === cEmail) ||
        (cName && leadCreatedBy === cName)
      )
    })
  }

  // Team Member Scoping: Team members only see leads assigned to them or created by them
  if (isTeam) {
    return processed.filter((l) => isLeadAssignedToUser(l, currentUser))
  }

  return processed.filter((l) => (l as any).isClientPrivate !== true && l.createdByRole !== "Clients")
}

export async function checkAndAutoConvertLeadToClient(lead: Lead, companyId?: string): Promise<void> {
  if (!lead || lead.status !== "Won") return

  try {
    const effLeadComp = normalizeCompanyId(lead.companyId || companyId || "tech")
    const storedClients = await getClients(effLeadComp)
    const rawEmail = (lead.email || "").trim()
    const internalEmail = rawEmail || `lead_${lead.id}@saampark.in`
    const clientName = lead.name || "Won Client"

    const exists = storedClients.some(
      (c) => c.name.toLowerCase().trim() === clientName.toLowerCase().trim() || (rawEmail && c.email?.toLowerCase().trim() === rawEmail.toLowerCase().trim())
    )

    if (!exists) {
      const newClient = {
        id: `cli_${lead.id}`,
        name: clientName,
        primaryContact: lead.primaryContact || lead.name,
        email: rawEmail,
        phone: lead.phone || "N/A",
        group: "VIP",
        label: lead.service || "Potential",
        labelColor: "#3b82f6",
        projectsCount: 0,
        totalInvoiced: lead.value || "₹0",
        paymentReceived: "₹0",
        due: lead.value || "₹0",
        address: `${lead.city || ""}, ${lead.state || ""}, ${lead.country || ""}`.trim(),
        branchId: lead.branchId,
        branchName: lead.branchName,
        branchCode: (lead as any).branchCode,
        companyId: effLeadComp,
      }

      await saveStoredClient(newClient as any, effLeadComp)

      recordUserAccount({
        id: `usr_cli_${lead.id}`,
        name: lead.primaryContact || lead.name,
        email: internalEmail,
        role: "Clients",
        companyId: effLeadComp,
        companyIds: [effLeadComp],
        branchId: lead.branchId,
        branchName: lead.branchName,
        phone: lead.phone,
        password: "Password123",
        status: "Active",
      }, true)
    }
  } catch (err) {
    console.warn("Auto-convert lead to client error:", err)
  }
}

export const addLead = async (leadData: Omit<Lead, "id">, companyId?: string): Promise<Lead> => {
  let authState: any = null
  if (typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore")
      authState = useAuthStore.getState()
    } catch {}
  }
  const targetComp = normalizeCompanyId(companyId || leadData.companyId || authState?.activeCompanyId || "tech")

  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const newId = `lead_${timestamp}_${randomSuffix}`
  
  const currentUser = authState?.user
  const isClientRole = currentUser?.role === "Clients"

  const creatorName = leadData.createdByName || leadData.createdBy || currentUser?.name || currentUser?.email || "User"
  const creatorId = isClientRole ? String(currentUser?.id || "") : String(leadData.createdById || currentUser?.id || "")
  const creatorEmail = isClientRole ? (currentUser?.email || "") : (leadData.createdByEmail || currentUser?.email || "")
  const creatorRole = isClientRole ? "Clients" : (leadData.createdByRole || currentUser?.role || "Teams")

  const newLead: Lead = {
    ...leadData,
    id: newId,
    companyId: targetComp,
    branchId: leadData.branchId || authState?.activeBranchId || authState?.user?.branchId || undefined,
    createdAt: leadData.createdAt || `${new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}`,
    service: leadData.service !== undefined ? leadData.service : "",
    source: leadData.source || "Social Media",
    reminderDate: leadData.reminderDate || "None",
    reminderNotes: leadData.reminderNotes || "",
    caller: leadData.caller || leadData.owner || (isClientRole ? (currentUser?.name || "Client") : "Team"),
    isLocked: false,
    isClientPrivate: isClientRole ? true : (leadData.isClientPrivate || false),
    createdBy: creatorName,
    createdByName: creatorName,
    createdById: creatorId,
    createdByEmail: creatorEmail,
    createdByRole: creatorRole,
  }

  // Fast concurrent write to DB
  const saveOps: Promise<any>[] = []
  if (targetComp !== "all") {
    saveOps.push(
      fetchModuleDataFromDB<Lead[]>("leads", [], targetComp)
        .catch(() => [])
        .then((current) => saveModuleDataToDB("leads", [newLead, ...current.filter((l) => l.id !== newId)], targetComp))
    )
  }
  saveOps.push(
    fetchModuleDataFromDB<Lead[]>("leads", [], "all")
      .catch(() => [])
      .then((allCurrent) => saveModuleDataToDB("leads", [newLead, ...allCurrent.filter((l) => l.id !== newId)], "all"))
  )

  await Promise.all(saveOps).catch(() => {})

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_leads_updated"))
    window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    window.dispatchEvent(new Event("storage"))
  }

  syncLeadReminderTask(newLead).catch(() => {})
  checkAndAutoConvertLeadToClient(newLead, targetComp).catch(() => {})

  recordActivityLog({
    type: "lead",
    module: "Leads",
    action: "New Lead Created",
    description: `New lead "${newLead.name}" registered for ${newLead.service || "General Inquiry"}`,
    companyId: newLead.companyId,
    branchId: newLead.branchId,
    details: `Source: ${newLead.source || "Direct"} | Value: ${newLead.value || "₹0"} | Caller: ${newLead.caller || "Team"}`
  }).catch(() => {})

  return newLead
}

