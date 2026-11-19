import { Lead } from "@/features/leads/types"
import { api } from "@/lib/api"
import { fetchModuleDataFromDB, saveModuleDataToDB, markGlobalItemDeleted, filterGlobalDeletedItems } from "@/lib/storageSync"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients } from "@/features/clients/services/clientService"
import { recordUserAccount } from "@/features/users/services/userService"
import { recordActivityLog } from "@/services/activityLogService"

export const initialLeads: Lead[] = []

export const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function parseLeadDate(dateStr?: string): Date | null {
  if (!dateStr || typeof dateStr !== "string") return null
  let clean = dateStr.trim().toLowerCase()
  if (
    clean === "none" ||
    clean === "-" ||
    clean === "" ||
    clean.includes("no reminder") ||
    clean.startsWith("00")
  ) {
    return null
  }

  // Strip anything in parentheses like "(04:00 pm)" or time suffix
  clean = clean.replace(/\(.*\)/g, "").trim()

  // 1. ISO format (e.g. "2026-08-28")
  const isoMatch = clean.match(/^(\d{4})[-\/\.,](\d{1,2})[-\/\.,](\d{1,2})/)
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10)
    const m = parseInt(isoMatch[2], 10)
    const d = parseInt(isoMatch[3], 10)
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m - 1, d, 0, 0, 0, 0)
    }
  }

  // 2. Text month format (e.g. "28 Aug 2026", "28 August 2026")
  for (let i = 0; i < MONTH_NAMES_SHORT.length; i++) {
    const mName = MONTH_NAMES_SHORT[i].toLowerCase()
    if (clean.includes(mName)) {
      const nums = clean.replace(/[^\d\s]/g, " ").split(/\s+/).filter(Boolean).map(Number)
      if (nums.length >= 2) {
        let day = nums[0]
        let year = nums[1]
        if (year < 100) year += 2000
        if (day > 1000) {
          const temp = day
          day = year
          year = temp
        }
        return new Date(year, i, day, 0, 0, 0, 0)
      }
    }
  }

  // 3. Delimited formats (e.g. "28-08-2026", "28/08/2026", "28,08,2026")
  const parts = clean.split(/[\s\-\/\,\.]+/)
  if (parts.length >= 3) {
    const p0 = parseInt(parts[0], 10)
    const p1 = parseInt(parts[1], 10)
    const p2 = parseInt(parts[2], 10)

    if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
      if (parts[2].length === 4 || p2 > 1000) {
        // "DD-MM-YYYY"
        return new Date(p2, p1 - 1, p0, 0, 0, 0, 0)
      } else if (parts[0].length === 4 || p0 > 1000) {
        // "YYYY-MM-DD"
        return new Date(p0, p1 - 1, p2, 0, 0, 0, 0)
      }
    }
  }

  // 4. Fallback standard JavaScript Date parse
  const parsed = new Date(dateStr)
  if (!isNaN(parsed.getTime())) {
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0)
  }

  return null
}

export function formatLeadReminderDate(dateStr?: string): string {
  if (!dateStr) return "No Reminder"
  const parsed = parseLeadDate(dateStr)
  if (!parsed) return "No Reminder"
  const day = String(parsed.getDate()).padStart(2, "0")
  const month = MONTH_NAMES_SHORT[parsed.getMonth()]
  const year = parsed.getFullYear()
  return `${day} ${month} ${year}`
}

export function isReminderDateOverdue(dateStr?: string, _timeStr?: string): boolean {
  const parsed = parseLeadDate(dateStr)
  if (!parsed) return false
  const now = new Date()

  // The lead remains active during the entire reminder day and only locks once the date passes 11:59:59 PM
  parsed.setHours(23, 59, 59, 999)
  return now.getTime() > parsed.getTime()
}

export function isLeadClientPrivate(lead?: Lead | null): boolean {
  if (!lead) return false
  const role = (lead.createdByRole || "").toLowerCase().trim()
  return (lead as any).isClientPrivate === true || role === "clients" || role === "client"
}

export function canUserUnlockLead(user: any, lead?: Lead | null): boolean {
  if (!user || !lead) return false
  const userRole = (user.role || "").trim()
  const isSuperAdmin = userRole === "Super Admin"

  // 1. If lead was added by a client:
  if (isLeadClientPrivate(lead)) {
    // Super Admin has full master governance
    if (isSuperAdmin) return true

    // The client acts as an admin for their own data:
    // ONLY the specific client who created this lead can lock/unlock it!
    if (userRole === "Clients" || userRole === "Client") {
      const uId = String(user.id || "").toLowerCase().trim()
      const uEmail = (user.email || "").toLowerCase().trim()
      const uName = (user.name || "").toLowerCase().trim()

      const cId = String(lead.createdById || "").toLowerCase().trim()
      const cEmail = (lead.createdByEmail || "").toLowerCase().trim()
      const cName = (lead.createdByName || lead.createdBy || "").toLowerCase().trim()

      if (uId && cId && uId === cId) return true
      if (uEmail && cEmail && uEmail === cEmail) return true
      if (uName && cName && uName === cName) return true
    }

    // Admins, telecallers, other clients, teams CANNOT unlock client-private leads
    return false
  }

  // 2. Standard company lead (not added by client):
  if (isSuperAdmin) return true

  // Check the explicit 'lockUnlock' sub-permission configured in the Permissions matrix
  try {
    const { usePermissionStore } = require("@/store/usePermissionStore")
    const store = usePermissionStore.getState()
    const actions = store.getUserModuleActions(user, "Leads")
    if (actions.lockUnlock !== undefined) {
      return Boolean(actions.lockUnlock)
    }
  } catch {}

  // Fallback default: Admin can unlock
  return userRole === "Admin"
}

export function canUserLockLead(user: any, lead?: Lead | null): boolean {
  return canUserUnlockLead(user, lead)
}

export async function syncLeadReminderTask(lead: Lead): Promise<void> {
  if (!lead || !lead.name) return
  const rDate = (lead.reminderDate || "").toString().toLowerCase().trim()
  const hasReminder = Boolean(rDate && rDate !== "none" && rDate !== "00,00,0000" && rDate !== "00-00-0000" && rDate !== "00/00/0000")

  const assignedTo = lead.caller || lead.owner || "Team"
  const taskId = `lead_task_${lead.id}`

  // If this task was ever explicitly deleted by the user, DO NOT recreate it!
  const { isGlobalItemDeleted } = await import("@/lib/storageSync")
  if (isGlobalItemDeleted(taskId) || isGlobalItemDeleted(`task_${lead.id}`)) {
    return
  }

  try {
    const existingTasks = await taskService.getTasks()
    const found = existingTasks.find((t) => t.id === taskId || t.id === `task_${lead.id}` || t.relatedTo === `Lead: ${lead.name}`)

    const taskTitle = lead.name
    const deadlineVal = hasReminder
      ? `${lead.reminderDate}${lead.reminderTime && lead.reminderTime !== "None" ? ` (${lead.reminderTime})` : ''}`
      : "None"
    const isDone = lead.status === "Won" || lead.status === "Lost"
    const desc = `Primary Contact: ${lead.primaryContact || lead.name}. Phone: ${lead.phone || 'N/A'}. Services: ${lead.service || 'N/A'}. Notes: ${lead.reminderNotes || 'Follow up call scheduled'}`
    
    // Dynamic milestone based on lead stage
    const currentLeadStage = lead.status === "They come to our office" ? "Our Office Visit" : (lead.status || "New")

    if (found) {
      await taskService.updateTask(found.id, {
        title: taskTitle,
        assignedTo,
        deadline: deadlineVal,
        milestone: currentLeadStage,
        description: desc,
        status: isDone ? "Done" : (found.status || "To do"),
        priority: "High",
        labels: ["Follow-up"],
      })
    } else if (hasReminder) {
      if (isGlobalItemDeleted(taskId)) return

      await taskService.addTask({
        id: taskId,
        title: taskTitle,
        startDate: lead.createdAt || new Date().toISOString().split("T")[0],
        deadline: deadlineVal,
        milestone: currentLeadStage,
        relatedTo: `Lead: ${lead.name}`,
        assignedTo,
        assignedToAvatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${assignedTo}`,
        collaborators: "-",
        status: isDone ? "Done" : "To do",
        priority: "High",
        priorityIcon: "up",
        labels: ["Follow-up"],
        points: "2 Points",
        description: desc,
        branchId: lead.branchId,
        branchName: lead.branchName,
        companyId: lead.companyId || "tech",
      } as any)
    }
  } catch (err) {
    console.warn("Sync lead reminder task warning:", err)
  }
}

export function normalizeCompanyId(comp?: string | null): string {
  if (!comp) return "tech"
  const s = String(comp).toLowerCase().trim()
  if (s === "consultancy" || s === "print" || s.includes("consult") || s === "2" || s.includes("print space")) {
    return "consultancy"
  }
  return "tech"
}

export function isTeamMemberRole(userOrRole?: any): boolean {
  if (!userOrRole) return false
  const roleStr = typeof userOrRole === "string" ? userOrRole : String(userOrRole.role || userOrRole.role_name || "")
  const roleId = typeof userOrRole === "object" ? userOrRole.role_id : undefined
  const rLower = roleStr.toLowerCase().trim()

  if (rLower === "super admin" || rLower.includes("super")) return false
  if (rLower === "admin") return false
  if (rLower === "clients" || rLower.includes("client")) return false

  return (
    roleId === 3 ||
    rLower === "teams" ||
    rLower === "team" ||
    rLower.includes("team") ||
    rLower.includes("sales") ||
    rLower.includes("caller") ||
    rLower.includes("member") ||
    rLower.includes("representative")
  )
}

export function isLeadAssignedToUser(lead: Lead, user: any): boolean {
  if (!user || !lead) return false

  // Client-private leads are excluded for non-creators
  if ((lead as any).isClientPrivate === true || lead.createdByRole === "Clients") {
    const uId = String(user.id || "").toLowerCase().trim()
    const uEmail = String(user.email || "").toLowerCase().trim()
    const cId = String((lead as any).createdById || "").toLowerCase().trim()
    const cEmail = ((lead as any).createdByEmail || "").toLowerCase().trim()
    return Boolean((uId && cId === uId) || (uEmail && cEmail === uEmail))
  }

  const uId = String(user.id || "").toLowerCase().trim()
  const uEmail = String(user.email || "").toLowerCase().trim()
  const uName = String(user.name || (user as any).full_name || "").toLowerCase().trim()

  // 1. Check Creator (Only exact ID, email, or exact non-admin creator name)
  const cId = String((lead as any).createdById || "").toLowerCase().trim()
  const cEmail = ((lead as any).createdByEmail || "").toLowerCase().trim()
  const createdBy = (lead.createdBy || "").toLowerCase().trim()

  if (uId && cId && cId === uId) return true
  if (uEmail && ((cEmail && cEmail === uEmail) || (createdBy && createdBy === uEmail))) return true
  if (
    uName &&
    createdBy &&
    !createdBy.includes("super admin") &&
    !createdBy.includes("(super admin)") &&
    !createdBy.includes("(admin)") &&
    !createdBy.includes("admin") &&
    createdBy !== "team" &&
    createdBy !== "teams" &&
    createdBy === uName
  ) {
    return true
  }

  // 2. Check Assigned candidates (ONLY assignedTo and caller! NEVER lead.owner or lead.managers!)
  const candidateFields = [
    lead.assignedTo,
    (lead as any).assigned_to,
    lead.caller,
  ]

  for (const rawVal of candidateFields) {
    if (!rawVal) continue
    const str = String(rawVal).toLowerCase().trim()
    if (!str || str === "none" || str === "unassigned" || str === "team" || str === "teams" || str === "all") continue

    // Split multiple assignees by comma, semicolon, slash, or " & "
    const tokens = str.split(/[,;\/&]+/).map((s) => s.trim()).filter(Boolean)
    if (tokens.length === 0) tokens.push(str)

    for (const t of tokens) {
      if (
        !t ||
        t === "none" ||
        t === "unassigned" ||
        t === "team" ||
        t === "teams" ||
        t === "all" ||
        t.includes("super admin") ||
        t.includes("(super admin)") ||
        t.includes("(admin)")
      ) {
        continue
      }

      // Check ID match
      if (uId && (t === uId || t === `usr_${uId}`)) return true

      // Check Email match
      if (uEmail && t === uEmail) return true

      // Check Exact Name match
      if (uName) {
        if (t === uName) return true

        // If both have multiple words (first and last name, e.g. "Rakhi Ghosh" or "Supriya Naskar"), match full words
        const uParts = uName.split(/\s+/).filter(Boolean)
        const tParts = t.split(/\s+/).filter(Boolean)
        if (uParts.length > 1 && tParts.length > 1) {
          const matchAll = uParts.every((p) => tParts.includes(p)) && tParts.every((p) => uParts.includes(p))
          if (matchAll) return true
        }
      }
    }
  }

  return false
}

