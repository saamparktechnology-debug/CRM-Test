import { api } from "@/lib/api"

const UNIVERSAL_DELETED_KEY = "saampark_universal_deleted_ids"

// Core protected system records that can NEVER be deleted (Master Super Admin user account only)
const PROTECTED_ACCOUNTS = ["hiisupriya@gmail.com"]

export function getLocalDeletedIds(_moduleName?: string): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(UNIVERSAL_DELETED_KEY)
    const list: string[] = raw ? JSON.parse(raw) : []
    return list.filter(id => !PROTECTED_ACCOUNTS.includes(String(id).toLowerCase().trim()))
  } catch {
    return []
  }
}

export function saveLocalDeletedId(id: string | number, moduleName?: string): void {
  if (typeof window === "undefined" || !id) return
  const strId = String(id).toLowerCase().trim()
  if (PROTECTED_ACCOUNTS.includes(strId)) return

  const current = getLocalDeletedIds()
  const mod = moduleName ? String(moduleName).toLowerCase().trim() : ""
  const namespacedKey = mod ? `${mod}:${strId}` : ""

  const next = new Set(current)
  if (namespacedKey) next.add(namespacedKey)
  next.add(strId)

  const merged = Array.from(next)
  localStorage.setItem(UNIVERSAL_DELETED_KEY, JSON.stringify(merged))

  deletedCache = merged
  lastDeletedSyncTime = Date.now()
}

/**
 * Marks an item deleted locally in client state/cache without firing rogue /deleted HTTP requests.
 * Actual resource deletion is handled strictly by each domain service's DELETE endpoint.
 */
export async function markGlobalItemDeleted(id: string | number, moduleName?: string): Promise<void> {
  if (!id) return
  const strId = String(id).toLowerCase().trim()
  if (PROTECTED_ACCOUNTS.includes(strId)) return

  if (typeof window !== "undefined") {
    try {
      const authRaw = localStorage.getItem("saampark-auth-v3") || localStorage.getItem("auth-storage")
      if (authRaw) {
        const parsed = JSON.parse(authRaw)
        const roleLower = String(parsed?.state?.user?.role || "").toLowerCase().trim()
        if (roleLower.includes("client")) {
          console.warn("Client blocked from deleting system items:", strId, moduleName)
          return
        }
      }
    } catch {}
  }

  saveLocalDeletedId(strId, moduleName)
  invalidateModuleCache(moduleName)

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("storage"))
    window.dispatchEvent(new CustomEvent("saampark_data_synced"))
  }
}

/**
 * Unmarks an item from local deleted cache ONLY (no rogue DELETE /deleted/:id or POST /deleted/restore API calls).
 */
export function unmarkGlobalItemDeleted(id: string | number, moduleName?: string): void {
  if (!id) return
  const strId = String(id).toLowerCase().trim()
  const mod = moduleName ? String(moduleName).toLowerCase().trim() : ""
  const namespacedKey = mod ? `${mod}:${strId}` : ""

  const local = getLocalDeletedIds().filter(d => d !== strId && d !== namespacedKey && !d.endsWith(`:${strId}`))
  if (typeof window !== "undefined") {
    localStorage.setItem(UNIVERSAL_DELETED_KEY, JSON.stringify(local))
  }
  deletedCache = deletedCache.filter(d => d !== strId && d !== namespacedKey && !d.endsWith(`:${strId}`))
  lastDeletedSyncTime = Date.now()
}

let deletedCache: string[] = []
let lastDeletedSyncTime = 0

export function resetDeletedCache(): void {
  deletedCache = []
  lastDeletedSyncTime = 0
}

/**
 * Returns local soft-deleted IDs without spamming GET /api/v1/deleted on every fetch.
 */
export async function syncGlobalDeletedIds(_moduleName?: string): Promise<string[]> {
  const local = getLocalDeletedIds()
  deletedCache = local
  lastDeletedSyncTime = Date.now()
  return local
}

export function isGlobalItemDeleted(id: string | number, deletedIds?: string[], moduleName?: string): boolean {
  if (!id) return false
  const strId = String(id).toLowerCase().trim()
  if (PROTECTED_ACCOUNTS.includes(strId)) return false

  const list = (deletedIds && Array.isArray(deletedIds) && deletedIds.length > 0) ? deletedIds : getLocalDeletedIds()
  if (!list || list.length === 0) return false

  const mod = moduleName ? String(moduleName).toLowerCase().trim() : ""
  const namespacedKey = mod ? `${mod}:${strId}` : ""
  const isPureNumber = /^\d+$/.test(strId)

  for (const entry of list) {
    if (!entry) continue
    const strEntry = String(entry).toLowerCase().trim()

    if (namespacedKey && strEntry === namespacedKey) {
      return true
    }

    if (strEntry.includes(":")) {
      const [entryMod, ...rest] = strEntry.split(":")
      const entryId = rest.join(":")
      if (entryId === strId) {
        if (mod && entryMod !== "global" && entryMod !== mod) {
          continue
        }
        return true
      }
    } else if (strEntry === strId) {
      if (isPureNumber && mod) {
        continue
      }
      return true
    }
  }

  return false
}

export function filterGlobalDeletedItems<T extends { id: string | number }>(items: T[], deletedIds?: string[], moduleName?: string): T[] {
  if (!Array.isArray(items)) return []
  return items.filter((item) => item?.id && !isGlobalItemDeleted(item.id, deletedIds, moduleName))
}

const inFlightRequests = new Map<string, Promise<any>>()
const cacheStore = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL_MS = 15000

export function invalidateModuleCache(moduleKey?: string) {
  if (moduleKey) {
    for (const k of Array.from(cacheStore.keys())) {
      if (k.startsWith(moduleKey)) {
        cacheStore.delete(k)
      }
    }
    for (const k of Array.from(inFlightRequests.keys())) {
      if (k.startsWith(moduleKey)) {
        inFlightRequests.delete(k)
      }
    }
  } else {
    cacheStore.clear()
    inFlightRequests.clear()
    lastDeletedSyncTime = 0
  }
}

export async function fetchModuleDataFromDB<T>(
  moduleKey: string,
  fallbackData: T,
  companyId?: string,
  branchId?: string,
  subBranchId?: string
): Promise<T> {
  let targetCompany = companyId
  let targetBranch = branchId
  let targetSubBranch = subBranchId

  try {
    if (typeof window !== "undefined") {
      try {
        const { useAuthStore } = require("@/store/useAuthStore")
        const authState = useAuthStore.getState()
        const authUser = authState.user
        if (!targetCompany) {
          targetCompany = authState.activeCompanyId || undefined
        }
        if (!targetBranch) {
          targetBranch = authState.activeBranchId || undefined
        }
        if (!targetSubBranch) {
          targetSubBranch = authState.activeSubBranchId || undefined
        }
        const isSuperOrAdmin = authUser && (authUser.role === "Super Admin" || authUser.role === "Admin")
        if (authUser && !isSuperOrAdmin && targetCompany && targetCompany !== "all") {
          const rawIds = authUser.companyIds || (authUser.companyId ? [authUser.companyId] : ["tech"])
          const allowedIds = (Array.isArray(rawIds) ? rawIds : [rawIds]).map((id: any) => String(id).toLowerCase().trim())
          const targetNorm = String(targetCompany).toLowerCase().trim()
          const activeNorm = String(authState.activeCompanyId || "").toLowerCase().trim()
          const isAllowed = allowedIds.some((id: string) => id === targetNorm) || targetNorm === activeNorm
          if (!isAllowed) {
            return (Array.isArray(fallbackData) ? [] : fallbackData) as any
          }
        }
      } catch {}
    }

    const cacheKey = `${moduleKey}_${targetCompany || "default"}_${targetBranch || "all"}_${targetSubBranch || "all"}`
    const now = Date.now()
    const cached = cacheStore.get(cacheKey)

    if (cached && now - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as any
    }

    if (inFlightRequests.has(cacheKey)) {
      const pendingRes = await inFlightRequests.get(cacheKey)
      if (pendingRes !== undefined && pendingRes !== null) {
        return pendingRes as any
      }
    }

    const params = new URLSearchParams()
    if (targetCompany && targetCompany !== "all") params.set("company_id", targetCompany)
    if (targetBranch && targetBranch !== "all") params.set("branch_id", targetBranch)
    if (targetSubBranch && targetSubBranch !== "all") params.set("sub_branch_id", targetSubBranch)
    const queryStr = params.toString() ? `?${params.toString()}` : ""

    const requestPromise = api.get(`/store/${moduleKey}${queryStr}`).then((res) => {
      const isError = !res || res.status === "error" || res.error === true
      if (!isError && res?.data !== undefined && res?.data !== null) {
        const rawData = res.data
        let finalData: any = rawData
        if (typeof rawData === "object" && rawData !== null && "data" in rawData && Object.keys(rawData).length === 1) {
          finalData = rawData.data
        }
        cacheStore.set(cacheKey, { data: finalData, timestamp: Date.now() })
        return finalData
      }
      return null
    }).finally(() => {
      inFlightRequests.delete(cacheKey)
    })

    inFlightRequests.set(cacheKey, requestPromise)

    const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve(null), 5000))
    const serverData = await Promise.race([requestPromise, timeoutPromise])

    if (serverData !== null && serverData !== undefined) {
      if (Array.isArray(serverData)) {
        return filterGlobalDeletedItems(serverData, undefined, moduleKey) as any
      }
      return serverData as any
    }
  } catch (err) {
    console.warn(`MySQL fetch warning for module ${moduleKey}:`, err)
  }

  // Hard rule: never return frontend dummy/fallback data when API fails or returns empty
  if (Array.isArray(fallbackData)) {
    return [] as any
  }
  return null as any
}

export async function saveModuleDataToDB<T>(
  moduleKey: string,
  data: T,
  companyId?: string,
  branchId?: string,
  subBranchId?: string
): Promise<void> {
  let targetCompany = companyId
  let targetBranch = branchId
  let targetSubBranch = subBranchId
  try {
    if (typeof window !== "undefined") {
      try {
        const { useAuthStore } = require("@/store/useAuthStore")
        const authState = useAuthStore.getState()
        const authUser = authState.user
        if (!targetCompany) {
          targetCompany = authState.activeCompanyId || undefined
        }
        if (!targetBranch) {
          targetBranch = authState.activeBranchId || undefined
        }
        if (!targetSubBranch) {
          targetSubBranch = authState.activeSubBranchId || undefined
        }
        const isSuperOrAdmin = authUser && (authUser.role === "Super Admin" || authUser.role === "Admin")
        if (authUser && !isSuperOrAdmin && targetCompany && targetCompany !== "all") {
          const rawIds = authUser.companyIds || (authUser.companyId ? [authUser.companyId] : ["tech"])
          const allowedIds = (Array.isArray(rawIds) ? rawIds : [rawIds]).map((id: any) => String(id).toLowerCase().trim())
          const targetNorm = String(targetCompany).toLowerCase().trim()
          const activeNorm = String(authState.activeCompanyId || "").toLowerCase().trim()
          const isAllowed = allowedIds.some((id: string) => id === targetNorm) || targetNorm === activeNorm
          if (!isAllowed) {
            return
          }
        }
      } catch {}
    }

    invalidateModuleCache(moduleKey)

    await api.post(`/store/${moduleKey}`, {
      data,
      company_id: targetCompany && targetCompany !== "all" ? targetCompany : undefined,
      branch_id: targetBranch && targetBranch !== "all" ? targetBranch : undefined,
      sub_branch_id: targetSubBranch && targetSubBranch !== "all" ? targetSubBranch : undefined,
    })

    invalidateModuleCache(moduleKey)
  } catch (err) {
    console.error(`MySQL save error for module ${moduleKey}:`, err)
    throw err
  }
}
