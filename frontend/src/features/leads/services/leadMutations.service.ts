import { Lead } from "@/features/leads/types"
import { api } from "@/lib/api"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients } from "@/features/clients/services/clientService"
import { recordUserAccount } from "@/features/users/services/userService"
import { recordActivityLog } from "@/services/activityLogService"

import {
  isReminderDateOverdue,
  canUserUnlockLead,
  canUserLockLead,
  syncLeadReminderTask,
  normalizeCompanyId,
  isLeadClientPrivate,
  MONTH_NAMES_SHORT,
} from "./leadHelpers.service"
import { getLeads, checkAndAutoConvertLeadToClient } from "./leadQueryAndCreate.service"

export const updateLead = async (id: string, updates: Partial<Lead>, userRole?: string | any, companyId?: string): Promise<Lead> => {
  let currentUserObj: any = typeof userRole === "object" && userRole !== null ? userRole : null
  const effectiveRole = typeof userRole === "string" ? userRole : (currentUserObj?.role || "Super Admin")

  if (!currentUserObj && typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore")
      currentUserObj = useAuthStore.getState().user
    } catch {}
  }
  const isSuperOrAdmin =
    effectiveRole === "Super Admin" ||
    effectiveRole === "Admin" ||
    currentUserObj?.role === "Super Admin" ||
    currentUserObj?.role === "Admin"

  const targetComp = companyId ? normalizeCompanyId(companyId) : undefined

  // Find target lead fast across DB partitions in parallel
  const [scopedList, allLeads] = await Promise.all([
    targetComp ? fetchModuleDataFromDB<Lead[]>("leads", [], targetComp).catch(() => []) : Promise.resolve([]),
    fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => []),
  ])

  let target: Lead | null =
    scopedList.find(l => l.id === id) ||
    allLeads.find(l => l.id === id) ||
    null

  let foundComp: string = targetComp || (target?.companyId ? normalizeCompanyId(target.companyId) : "tech")

  if (!target) {
    const fallbackComps = ["tech", "consultancy", "print"]
    const results = await Promise.all(
      fallbackComps.map(c => fetchModuleDataFromDB<Lead[]>("leads", [], c).catch(() => []))
    )
    for (let i = 0; i < fallbackComps.length; i++) {
      const found = results[i].find(l => l.id === id)
      if (found) {
        target = found
        foundComp = normalizeCompanyId(fallbackComps[i])
        break
      }
    }
  }

  if (!target) throw new Error("Lead not found")

  const finalStatus = updates.status !== undefined ? updates.status : target.status
  const statusLower = (finalStatus || "").toLowerCase().trim()
  const isWonOrLost = statusLower === "won" || statusLower === "lost"

  const isClientCreator =
    currentUserObj &&
    isLeadClientPrivate(target) &&
    canUserUnlockLead(currentUserObj, target)

  const isAllowedToEditLocked = isSuperOrAdmin || isClientCreator

  const finalReminderDate = updates.reminderDate !== undefined ? updates.reminderDate : target.reminderDate
  const finalReminderTime = updates.reminderTime !== undefined ? updates.reminderTime : target.reminderTime
  const isTargetOverdue = isReminderDateOverdue(target.reminderDate, target.reminderTime)
  const isNewReminderOverdue = isReminderDateOverdue(finalReminderDate, finalReminderTime)

  const isLeadExplicitlyUnlocked =
    (target as any).isExplicitlyUnlocked === true ||
    target.lockedReason?.includes("Unlocked") ||
    (target as any).unlockedByAdmin === true ||
    (target as any).unlockedByClient === true

  const isCurrentlyLocked = Boolean(
    target.isLocked && !isLeadExplicitlyUnlocked && !isWonOrLost
  )

  const isAdvancingOrClearingReminder = updates.reminderDate !== undefined && !isNewReminderOverdue

  // Prevent callers/teams from updating a locked lead unless being explicitly unlocked, moving to Won/Lost, or updating an expired reminder date
  if (isCurrentlyLocked && !isAllowedToEditLocked && updates.isLocked !== false && !isWonOrLost && !isAdvancingOrClearingReminder) {
    if (isLeadClientPrivate(target)) {
      throw new Error("This lead was added by a client and is locked. Only that specific client (or Super Admin) can unlock or edit it.")
    }
    throw new Error("This lead is locked because its reminder date has expired. Only an Admin or Super Admin can unlock it.")
  }

  let nextIsLocked = target.isLocked
  let nextReason = target.lockedReason
  let nextIsExplicitlyUnlocked = (target as any).isExplicitlyUnlocked

  // Priority order for lock status:
  if (updates.isLocked === false) {
    nextIsLocked = false
    nextReason = updates.lockedReason || "Unlocked"
    nextIsExplicitlyUnlocked = true
  } else if (updates.isLocked === true) {
    nextIsLocked = true
    nextReason = updates.lockedReason || (isClientCreator ? "Manually locked by Client" : "Manually locked by Admin")
    nextIsExplicitlyUnlocked = false
  } else if (statusLower === "won") {
    nextIsLocked = true
    nextReason = "Won: Lead is finalized and converted to Client."
    nextIsExplicitlyUnlocked = false
  } else if (statusLower === "lost") {
    nextIsLocked = false
    nextReason = undefined
    nextIsExplicitlyUnlocked = false
  } else if (target.isLocked && target.lockedReason?.includes("Manually locked")) {
    nextIsLocked = true
    nextReason = target.lockedReason
    nextIsExplicitlyUnlocked = false
  } else if (updates.reminderDate !== undefined && !isNewReminderOverdue) {
    // Setting a new valid future date or clearing reminder automatically unlocks the lead!
    nextIsLocked = false
    nextReason = undefined
    nextIsExplicitlyUnlocked = true
  } else if (isLeadExplicitlyUnlocked) {
    nextIsLocked = false
    nextReason = target.lockedReason || "Unlocked"
    nextIsExplicitlyUnlocked = true
  } else if (finalReminderDate && isNewReminderOverdue) {
    nextIsLocked = true
    nextReason = "Overdue: Lead reminder date expired."
    nextIsExplicitlyUnlocked = false
  } else if (!isNewReminderOverdue) {
    nextIsLocked = false
    nextReason = undefined
    nextIsExplicitlyUnlocked = false
  }

  const oldCompanyId = normalizeCompanyId(target.companyId || foundComp)
  const newCompanyId = updates.companyId ? normalizeCompanyId(updates.companyId) : oldCompanyId

  const updatedLead: Lead = {
    ...target,
    ...updates,
    companyId: newCompanyId,
    isLocked: nextIsLocked,
    lockedReason: nextReason,
    isExplicitlyUnlocked: nextIsExplicitlyUnlocked,
  }

  // Fast concurrent write to DB: save to newCompanyId and 'all' in parallel
  const updatePromises: Promise<any>[] = []

  const updatedNew = [updatedLead, ...scopedList.filter(l => l.id !== id)]
  updatePromises.push(saveModuleDataToDB("leads", updatedNew, newCompanyId))

  const updatedAll = [updatedLead, ...allLeads.filter(l => l.id !== id)]
  updatePromises.push(saveModuleDataToDB("leads", updatedAll, "all"))

  if (newCompanyId !== oldCompanyId) {
    const oldList = scopedList.filter(l => l.id !== id)
    updatePromises.push(saveModuleDataToDB("leads", oldList, oldCompanyId))
  }

  // Execute all DB partition saves concurrently
  await Promise.all(updatePromises).catch((err) => {
    console.warn("DB leads write error:", err)
  })

  // Fire UI notifications immediately
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_leads_updated"))
    window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    window.dispatchEvent(new Event("storage"))
  }

  // Run side tasks in the background without blocking the UI response
  syncLeadReminderTask(updatedLead).catch(() => {})
  checkAndAutoConvertLeadToClient(updatedLead, newCompanyId).catch(() => {})

  // Background activity logging
  if (statusLower === "won" && (target.status || "").toLowerCase().trim() !== "won") {
    recordActivityLog({
      type: "lead",
      module: "Leads",
      action: "Lead Deal Won",
      description: `Lead deal "${updatedLead.name}" marked as WON & auto-converted to Client!`,
      companyId: updatedLead.companyId,
      branchId: updatedLead.branchId,
      branchName: updatedLead.branchName,
      details: `Deal Value: ${updatedLead.value || "₹0"}`
    }).catch(() => {})
  } else if (statusLower === "lost" && (target.status || "").toLowerCase().trim() !== "lost") {
    recordActivityLog({
      type: "lead",
      module: "Leads",
      action: "Lead Marked Lost",
      description: `Lead "${updatedLead.name}" marked as Lost`,
      companyId: updatedLead.companyId,
      branchId: updatedLead.branchId,
      branchName: updatedLead.branchName,
    }).catch(() => {})
  } else if (updates.status && updates.status !== target.status) {
    recordActivityLog({
      type: "lead",
      module: "Leads",
      action: "Lead Stage Updated",
      description: `Lead "${updatedLead.name}" moved from "${target.status || 'New'}" to "${updatedLead.status}"`,
      companyId: updatedLead.companyId,
      branchId: updatedLead.branchId,
      branchName: updatedLead.branchName,
    }).catch(() => {})
  } else if (updates.caller && updates.caller !== target.caller) {
    recordActivityLog({
      type: "lead",
      module: "Leads",
      action: "Lead Reassigned",
      description: `Lead "${updatedLead.name}" assigned to caller/owner "${updatedLead.caller}"`,
      companyId: updatedLead.companyId,
      branchId: updatedLead.branchId,
      branchName: updatedLead.branchName,
    }).catch(() => {})
  }

  return updatedLead
}

export const deleteLead = async (id: string, companyId?: string): Promise<boolean> => {
  await markGlobalItemDeleted(id, "leads")
  const targetComp = normalizeCompanyId(companyId)
  
  const [currentScoped, allCurrent] = await Promise.all([
    fetchModuleDataFromDB<Lead[]>("leads", [], targetComp).catch(() => []),
    fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => []),
  ])

  const target = currentScoped.find(l => l.id === id) || allCurrent.find(l => l.id === id)
  const filteredScoped = currentScoped.filter((l) => l.id !== id)
  const filteredAll = allCurrent.filter((l) => l.id !== id)

  await Promise.all([
    saveModuleDataToDB("leads", filteredScoped, targetComp),
    saveModuleDataToDB("leads", filteredAll, "all"),
  ]).catch(() => {})

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("saampark_leads_updated"))
    window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    window.dispatchEvent(new Event("storage"))
  }

  recordActivityLog({
    type: "lead",
    module: "Leads",
    action: "Lead Deleted",
    description: `Lead "${target?.name || id}" removed from the system`,
    companyId: target?.companyId || targetComp,
    branchId: target?.branchId,
    branchName: target?.branchName,
  }).catch(() => {})

  return true
}

export const unlockLead = async (
  id: string,
  userOrCompanyId?: any,
  companyIdParam?: string
): Promise<Lead> => {
  let currentUser: any = null
  let targetComp: string | undefined = undefined

  if (typeof userOrCompanyId === "object" && userOrCompanyId !== null) {
    currentUser = userOrCompanyId
    targetComp = companyIdParam
  } else if (typeof userOrCompanyId === "string") {
    if (userOrCompanyId === "Super Admin" || userOrCompanyId === "Admin") {
      currentUser = { role: userOrCompanyId }
      targetComp = companyIdParam
    } else {
      targetComp = userOrCompanyId
    }
  }

  if (!currentUser && typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore")
      currentUser = useAuthStore.getState().user
    } catch {}
  }

  const canonComp = targetComp ? normalizeCompanyId(targetComp) : undefined

  // Concurrently fetch DB partitions for fastest response
  const [allLeads, compLeads] = await Promise.all([
    fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => []),
    canonComp ? fetchModuleDataFromDB<Lead[]>("leads", [], canonComp).catch(() => []) : Promise.resolve([]),
  ])

  const lead =
    compLeads.find(l => String(l.id).toLowerCase().trim() === String(id).toLowerCase().trim()) ||
    allLeads.find(l => String(l.id).toLowerCase().trim() === String(id).toLowerCase().trim())

  const resolvedComp = normalizeCompanyId(lead?.companyId || targetComp)

  if (currentUser && lead && !canUserUnlockLead(currentUser, lead)) {
    if (isLeadClientPrivate(lead)) {
      throw new Error("This lead was created by a client. Only that specific client (or Super Admin) can unlock it.")
    }
    throw new Error("Only Administrators can unlock this lead.")
  }

  const isClient = (currentUser?.role || "").toLowerCase().includes("client")
  const unlockReason = isClient ? "Unlocked by Client" : "Unlocked by Admin"

  // Advance reminder date to tomorrow in DD MMM YYYY format
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const d = String(tomorrow.getDate()).padStart(2, "0")
  const m = MONTH_NAMES_SHORT[tomorrow.getMonth()]
  const y = tomorrow.getFullYear()
  const futureReminderDate = `${d} ${m} ${y}`

  const updates: Partial<Lead> & Record<string, any> = {
    isLocked: false,
    lockedReason: unlockReason,
    isExplicitlyUnlocked: true,
    unlockedByAdmin: !isClient,
    unlockedByClient: isClient,
    unlockedBy: currentUser?.name || currentUser?.email || (isClient ? "Client" : "Admin"),
    unlockedByRole: currentUser?.role || (isClient ? "Clients" : "Admin"),
    unlockedById: currentUser?.id ? String(currentUser.id) : undefined,
    unlockedAt: new Date().toISOString(),
  }

  if (!lead?.reminderDate || isReminderDateOverdue(lead.reminderDate)) {
    updates.reminderDate = futureReminderDate
  }

  return updateLead(id, updates as any, currentUser || "Super Admin", resolvedComp)
}

export const lockLead = async (
  id: string,
  reason?: string,
  userOrCompanyId?: any,
  companyIdParam?: string
): Promise<Lead> => {
  let currentUser: any = null
  let targetComp: string | undefined = undefined

  if (typeof userOrCompanyId === "object" && userOrCompanyId !== null) {
    currentUser = userOrCompanyId
    targetComp = companyIdParam
  } else if (typeof userOrCompanyId === "string") {
    if (userOrCompanyId === "Super Admin" || userOrCompanyId === "Admin") {
      currentUser = { role: userOrCompanyId }
      targetComp = companyIdParam
    } else {
      targetComp = userOrCompanyId
    }
  }

  if (!currentUser && typeof window !== "undefined") {
    try {
      const { useAuthStore } = require("@/store/useAuthStore")
      currentUser = useAuthStore.getState().user
    } catch {}
  }

  const canonComp = targetComp ? normalizeCompanyId(targetComp) : undefined

  const [allLeads, compLeads] = await Promise.all([
    fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => []),
    canonComp ? fetchModuleDataFromDB<Lead[]>("leads", [], canonComp).catch(() => []) : Promise.resolve([]),
  ])

  const lead =
    compLeads.find(l => String(l.id).toLowerCase().trim() === String(id).toLowerCase().trim()) ||
    allLeads.find(l => String(l.id).toLowerCase().trim() === String(id).toLowerCase().trim())

  const resolvedComp = normalizeCompanyId(lead?.companyId || targetComp)

  if (currentUser && lead && !canUserLockLead(currentUser, lead)) {
    if (isLeadClientPrivate(lead)) {
      throw new Error("This lead was created by a client. Only that specific client (or Super Admin) can lock it.")
    }
    throw new Error("You do not have permission to lock this lead.")
  }

  const isClient = (currentUser?.role || "").toLowerCase().includes("client")
  const defaultReason = reason || (isClient ? "Manually locked by Client" : "Manually locked by Admin")

  const updates: Partial<Lead> & Record<string, any> = {
    isLocked: true,
    lockedReason: defaultReason,
    isExplicitlyUnlocked: false,
    unlockedByAdmin: false,
    unlockedByClient: false,
    lockedBy: currentUser?.name || currentUser?.email || (isClient ? "Client" : "Admin"),
    lockedByRole: currentUser?.role || (isClient ? "Clients" : "Admin"),
    lockedById: currentUser?.id ? String(currentUser.id) : undefined,
    lockedAt: new Date().toISOString(),
  }

  return updateLead(
    id,
    updates as any,
    currentUser || "Super Admin",
    resolvedComp
  )
}

export const transferLeadsToBranch = async (
  leadIds: string[],
  branchId: string,
  branchName: string,
  transferredBy: string,
  transferredByRole: string = "Admin",
  companyId?: string
): Promise<Lead[]> => {
  const idSet = new Set(leadIds.map(id => String(id).toLowerCase().trim()))
  const nowFormatted = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })

  // Find destination branch details flexibly by ID, code, or name
  let branches: any[] = []
  try {
    const { useAuthStore } = require("@/store/useAuthStore")
    branches = useAuthStore.getState().branches || []
  } catch {}

  const targetBranch = branches.find(b => 
    String(b.id).toLowerCase().trim() === String(branchId).toLowerCase().trim() ||
    String(b.code || "").toLowerCase().trim() === String(branchId).toLowerCase().trim() ||
    (b.name && b.name.toLowerCase().trim() === branchName.toLowerCase().trim())
  )

  const effectiveBranchId = String(targetBranch?.id || branchId)
  const effectiveBranchName = targetBranch?.name || branchName
  const targetBranchCompanyId = (targetBranch?.companyId || targetBranch?.company_id || "").toLowerCase().trim()

  // Load all master leads
  const master = await fetchModuleDataFromDB<Lead[]>("leads", [], "all").catch(() => [])
  const updatedLeads: Lead[] = []

  const masterUpdated = master.map(lead => {
    if (idSet.has(String(lead.id).toLowerCase().trim())) {
      const finalComp = targetBranchCompanyId || lead.companyId || (companyId && companyId !== "all" ? companyId : "tech")
      const updatedItem: Lead = {
        ...lead,
        branchId: effectiveBranchId,
        branchName: effectiveBranchName,
        assignedBranchId: effectiveBranchId,
        assignedBranchName: effectiveBranchName,
        companyId: finalComp,
        transferredBy,
        transferredByRole,
        transferredAt: nowFormatted,
      }
      updatedLeads.push(updatedItem)
      return updatedItem
    }
    return lead
  })

  await saveModuleDataToDB("leads", masterUpdated, "all")

  // Also sync per-company stores for all touched companies
  const touchedCompanies = new Set<string>()
  if (companyId && companyId !== "all") touchedCompanies.add(String(companyId).toLowerCase().trim())
  if (targetBranchCompanyId && targetBranchCompanyId !== "all") touchedCompanies.add(String(targetBranchCompanyId).toLowerCase().trim())
  updatedLeads.forEach(l => {
    if (l.companyId && l.companyId !== "all") touchedCompanies.add(String(l.companyId).toLowerCase().trim())
  })
  touchedCompanies.add("tech")

  for (const c of Array.from(touchedCompanies)) {
    const cList = await fetchModuleDataFromDB<Lead[]>("leads", [], c).catch(() => [])
    const cMap = new Map<string, Lead>()
    for (const l of cList) {
      if (l && l.id) cMap.set(String(l.id).toLowerCase().trim(), l)
    }
    for (const ul of updatedLeads) {
      const ulId = String(ul.id).toLowerCase().trim()
      const ulComp = (ul.companyId || "tech").toLowerCase().trim()
      if (ulComp === c) {
        cMap.set(ulId, ul)
      } else {
        // If moved to a different company, remove from old company
        cMap.delete(ulId)
      }
    }
    await saveModuleDataToDB("leads", Array.from(cMap.values()), c).catch(() => {})
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent("saampark_data_synced"))
    window.dispatchEvent(new CustomEvent("saampark_leads_updated"))
  }

  recordActivityLog({
    type: "lead",
    module: "Leads",
    action: "Leads Transferred to Branch",
    description: `${leadIds.length} lead(s) transferred to branch "${effectiveBranchName}" by ${transferredBy}`,
    companyId: targetBranchCompanyId || companyId,
    branchId: effectiveBranchId,
    branchName: effectiveBranchName,
  }).catch(() => {})

  return updatedLeads
}

