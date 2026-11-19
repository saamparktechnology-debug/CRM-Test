import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Role, User } from './useAuthStore'

// The complete, clean list of all real CRM modules in the application
import {
  ALL_APP_MODULES,
  AppModuleName,
  ModuleName,
  CONFIGURABLE_MODULES,
  ALL_MODULE_NAMES,
  ALL_NAV_MODULES,
  ALL_ACTIONS,
  ActionType,
  ModuleActionFlags,
  MODULE_ACTION_CONFIG,
  CLEAN_MODULE_CATEGORIES,
  DEFAULT_FULL_ACTIONS,
  DEFAULT_VIEW_ONLY_ACTIONS,
  DEFAULT_NO_ACTIONS,
  normalizeRole,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_ACTION_PERMISSIONS,
} from "./permissions/permission.constants"
export {
  ALL_APP_MODULES,
  CONFIGURABLE_MODULES,
  ALL_MODULE_NAMES,
  ALL_NAV_MODULES,
  ALL_ACTIONS,
  MODULE_ACTION_CONFIG,
  CLEAN_MODULE_CATEGORIES,
  DEFAULT_FULL_ACTIONS,
  DEFAULT_VIEW_ONLY_ACTIONS,
  DEFAULT_NO_ACTIONS,
  normalizeRole,
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_ACTION_PERMISSIONS,
}
export type { AppModuleName, ModuleName, ActionType, ModuleActionFlags }

interface PermissionState {
  rolePermissions: Record<Role, ModuleName[]>
  roleActionPermissions: Record<Role, Record<string, ModuleActionFlags>>
  userPermissions: Record<string, ModuleName[]>
  userActionPermissions: Record<string, Record<string, ModuleActionFlags>>
  companyEnabledModules: Record<string, string[]>
  branchEnabledModules: Record<string, string[]>
  subBranchEnabledModules: Record<string, string[]>
  
  // Actions
  fetchRolePermissions: () => Promise<void>
  fetchUserPermissions: (userId?: string) => Promise<void>
  setRolePermissions: (role: Role, modules: ModuleName[]) => void
  setRoleAllModuleActions: (role: Role, matrix: Record<string, ModuleActionFlags>) => void
  setUserPermissions: (userId: string, modules: ModuleName[]) => void
  setUserModuleAction: (userId: string, moduleName: ModuleName, action: ActionType, value: boolean) => void
  setUserAllModuleActions: (userId: string, matrix: Record<string, ModuleActionFlags>) => void
  setCompanyEnabledModules: (companyId: string, modules: string[]) => void
  setBranchEnabledModules: (branchId: string, modules: string[]) => void
  setSubBranchEnabledModules: (subBranchId: string, modules: string[]) => void
  resetToDefaults: () => void
  
  // Helpers
  isModuleAllowed: (user: User | null, moduleName: string) => boolean
  isCompanyModuleAllowed: (companyId: string | null | undefined, moduleName: string) => boolean
  isEntityModuleAllowed: (companyId: string | null | undefined, branchId: string | null | undefined, subBranchId: string | null | undefined, moduleName: string) => boolean
  getEnabledModulesForCompany: (companyId: string | null | undefined) => string[]
  getEnabledModulesForEntity: (type: 'company' | 'branch' | 'subbranch', id: string) => string[]
  getModulesForUser: (user: User | null) => ModuleName[]
  getUserModuleActions: (user: User | null, moduleName: string) => ModuleActionFlags
  canPerformAction: (user: User | null, moduleName: string, action: ActionType) => boolean
  canAccessModule: (user: User | null, moduleName: string) => boolean
}

const PERM_FETCH_TTL_MS = 30000
let _inFlightRolePerms: Promise<void> | null = null
let _lastRolePermsAt = 0
const _inFlightUserPerms = new Map<string, Promise<void>>()
const _lastUserPermsAt = new Map<string, number>()

export const usePermissionStore = create<PermissionState>()(
  persist(
    (set, get) => ({
      rolePermissions: DEFAULT_ROLE_PERMISSIONS,
      roleActionPermissions: DEFAULT_ROLE_ACTION_PERMISSIONS,
      userPermissions: {},
      userActionPermissions: {},
      companyEnabledModules: {
        tech: [...ALL_APP_MODULES],
        consultancy: [...ALL_APP_MODULES],
      },
      branchEnabledModules: {},
      subBranchEnabledModules: {},

      fetchRolePermissions: async () => {
        if (Date.now() - _lastRolePermsAt < PERM_FETCH_TTL_MS) return
        if (_inFlightRolePerms) return _inFlightRolePerms
        _inFlightRolePerms = (async () => {
          try {
            const { PermissionService } = await import('@/services/permissionService')
            const res = await PermissionService.getAllRoleMatrices()
            const data = res?.data?.data || res?.data
            if (data && typeof data === 'object') {
              const current = get().roleActionPermissions || DEFAULT_ROLE_ACTION_PERMISSIONS
              const updated = { ...current }
              for (const [r, matrix] of Object.entries(data)) {
                if (matrix && typeof matrix === 'object') {
                  updated[r as Role] = { ...(updated[r as Role] || {}), ...(matrix as any) }
                }
              }
              set({ roleActionPermissions: updated })
            }
            _lastRolePermsAt = Date.now()
          } catch (err) {
            console.warn('fetchRolePermissions error:', err)
          } finally {
            _inFlightRolePerms = null
          }
        })()
        return _inFlightRolePerms
      },

      fetchUserPermissions: async (userId?: string) => {
        if (!userId) return
        const lastAt = _lastUserPermsAt.get(userId) || 0
        if (Date.now() - lastAt < PERM_FETCH_TTL_MS) return
        if (_inFlightUserPerms.has(userId)) return _inFlightUserPerms.get(userId)
        const p = (async () => {
        try {
          const { PermissionService } = await import('@/services/permissionService')
          const res = await PermissionService.getUserMatrix(userId)
          const data = res?.data?.data || res?.data
          if (data && typeof data === 'object') {
            const allowedMods = Object.keys(data).filter(m => {
              const f = data[m]
              return f && (f.view || f.add || f.edit || f.delete)
            })
            const normId = String(userId).toLowerCase().trim()
            set((state) => ({
              userActionPermissions: {
                ...state.userActionPermissions,
                [userId]: data,
                [normId]: data,
              },
              userPermissions: {
                ...state.userPermissions,
                [userId]: allowedMods,
                [normId]: allowedMods,
              }
            }))
          }
          _lastUserPermsAt.set(userId, Date.now())
        } catch (err) {
          console.warn('fetchUserPermissions error:', err)
        } finally {
          _inFlightUserPerms.delete(userId)
        }
        })()
        _inFlightUserPerms.set(userId, p)
        return p
      },

      setRolePermissions: (role: Role, modules: ModuleName[]) => {
        const norm = normalizeRole(role)
        set((state) => ({
          rolePermissions: {
            ...state.rolePermissions,
            [norm]: modules,
          },
        }))
      },

      setRoleAllModuleActions: (role: Role, matrix: Record<string, ModuleActionFlags>) => {
        const norm = normalizeRole(role)
        set((state) => ({
          roleActionPermissions: {
            ...(state.roleActionPermissions || DEFAULT_ROLE_ACTION_PERMISSIONS),
            [norm]: {
              ...((state.roleActionPermissions || {})[norm] || {}),
              ...matrix,
            },
          },
        }))
      },

      setUserPermissions: (userId: string, modules: ModuleName[]) => {
        const normId = String(userId).toLowerCase().trim()
        set((state) => ({
          userPermissions: {
            ...state.userPermissions,
            [userId]: modules,
            [normId]: modules,
          },
        }))
      },

      setUserModuleAction: (userId: string, moduleName: ModuleName, action: ActionType, value: boolean) => {
        set((state) => {
          const userMatrix = state.userActionPermissions[userId] || {}
          const currentFlags = userMatrix[moduleName] || { view: false, add: false, edit: false, delete: false }
          return {
            userActionPermissions: {
              ...state.userActionPermissions,
              [userId]: {
                ...userMatrix,
                [moduleName]: {
                  ...currentFlags,
                  [action]: value,
                },
              },
            },
          }
        })
      },

      setUserAllModuleActions: (userId: string, matrix: Record<string, ModuleActionFlags>) => {
        const normId = String(userId).toLowerCase().trim()
        const allowedMods = Object.keys(matrix).filter(m => {
          const f = matrix[m]
          return f && (f.view || f.add || f.edit || f.delete)
        })
        set((state) => ({
          userActionPermissions: {
            ...state.userActionPermissions,
            [userId]: {
              ...(state.userActionPermissions[userId] || {}),
              ...matrix,
            },
            [normId]: {
              ...(state.userActionPermissions[normId] || {}),
              ...matrix,
            },
          },
          userPermissions: {
            ...state.userPermissions,
            [userId]: allowedMods,
            [normId]: allowedMods,
          }
        }))
      },

      setCompanyEnabledModules: (companyId: string, modules: string[]) => {
        const cKey = String(companyId || '').toLowerCase().trim()
        const canonKey = (cKey.includes('consult') || cKey === '2') ? 'consultancy' : (cKey.includes('tech') || cKey === '1' ? 'tech' : cKey)
        set((state) => ({
          companyEnabledModules: {
            ...state.companyEnabledModules,
            [companyId]: modules,
            [canonKey]: modules,
          }
        }))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("saampark_entity_permissions_updated"))
          window.dispatchEvent(new CustomEvent("saampark_data_synced"))
        }
      },

      setBranchEnabledModules: (branchId: string, modules: string[]) => {
        const bKey = String(branchId || '').toLowerCase().trim()
        set((state) => ({
          branchEnabledModules: {
            ...state.branchEnabledModules,
            [branchId]: modules,
            [bKey]: modules,
          }
        }))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("saampark_entity_permissions_updated"))
          window.dispatchEvent(new CustomEvent("saampark_data_synced"))
        }
      },

      setSubBranchEnabledModules: (subBranchId: string, modules: string[]) => {
        const sbKey = String(subBranchId || '').toLowerCase().trim()
        set((state) => ({
          subBranchEnabledModules: {
            ...state.subBranchEnabledModules,
            [subBranchId]: modules,
            [sbKey]: modules,
          }
        }))
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("saampark_entity_permissions_updated"))
          window.dispatchEvent(new CustomEvent("saampark_data_synced"))
        }
      },

      getEnabledModulesForEntity: (type: 'company' | 'branch' | 'subbranch', id: string): string[] => {
        if (!id || id === 'all') return [...ALL_APP_MODULES]
        const state = get()
        const normId = String(id).toLowerCase().trim()
        if (type === 'company') {
          const canonKey = (normId.includes('consult') || normId === '2') ? 'consultancy' : (normId.includes('tech') || normId === '1' ? 'tech' : normId)
          return state.companyEnabledModules?.[canonKey] || state.companyEnabledModules?.[id] || [...ALL_APP_MODULES]
        }
        if (type === 'branch') {
          return state.branchEnabledModules?.[id] || state.branchEnabledModules?.[normId] || [...ALL_APP_MODULES]
        }
        if (type === 'subbranch') {
          return state.subBranchEnabledModules?.[id] || state.subBranchEnabledModules?.[normId] || [...ALL_APP_MODULES]
        }
        return [...ALL_APP_MODULES]
      },

      getEnabledModulesForCompany: (companyId: string | null | undefined): string[] => {
        if (!companyId || companyId === 'all') return [...ALL_APP_MODULES]
        const state = get()
        const cKey = String(companyId).toLowerCase().trim()
        const canonKey = (cKey.includes('consult') || cKey === '2') ? 'consultancy' : (cKey.includes('tech') || cKey === '1' ? 'tech' : cKey)
        const enabled = state.companyEnabledModules?.[canonKey] || state.companyEnabledModules?.[companyId]
        if (Array.isArray(enabled) && enabled.length > 0) {
          return enabled
        }
        return [...ALL_APP_MODULES]
      },

      isCompanyModuleAllowed: (companyId: string | null | undefined, moduleName: string): boolean => {
        return get().isEntityModuleAllowed(companyId, undefined, undefined, moduleName)
      },

      isEntityModuleAllowed: (companyId: string | null | undefined, branchId: string | null | undefined, subBranchId: string | null | undefined, moduleName: string): boolean => {
        const mKey = String(moduleName || '').toLowerCase().trim()
        if (mKey === 'dashboard' || mKey === 'companies' || mKey === 'settings' || mKey === 'general settings') return true

        const state = get()

        const ALIAS_MAP: Record<string, string> = {
          'marketing': 'Digital Marketing',
          'digital marketing': 'Digital Marketing',
          'digital_marketing': 'Digital Marketing',
          'client marketing report': 'Digital Marketing',
          'marketing plans & retainers': 'Digital Marketing',
          'posts & deliverables': 'Digital Marketing',
          'marketing leads & ads': 'Digital Marketing',
          'sales': 'Invoices',
          'store': 'Services & Store',
          'packages & retainers': 'Subscriptions',
          'emi milestone plans': 'EMI',
          'team members': 'Teams',
          'payments & payroll': 'Payroll',
          'leave management': 'Leave',
          'attendance & timecards': 'Attendance',
          'knowledge base': 'Knowledge base',
          'documents': 'Files',
          'crm': 'Leads',
          'organisation': 'Companies',
          'hr & employees': 'Teams',
          'support': 'Tickets',
          'general settings': 'Settings',
          'approvals': 'Approvals'
        }
        const resolvedName = (ALIAS_MAP[mKey] || mKey).toLowerCase().trim()

        const checkList = (list?: string[]): boolean => {
          if (!list || !Array.isArray(list) || list.length === 0) return true
          return list.some(m => {
            const modNorm = String(m).toLowerCase().trim()
            return modNorm === mKey || modNorm === resolvedName || (ALIAS_MAP[modNorm] && ALIAS_MAP[modNorm].toLowerCase() === mKey)
          })
        }

        // 1. Sub-Branch level check
        if (subBranchId && subBranchId !== 'all') {
          const sbNorm = String(subBranchId).toLowerCase().trim()
          const sbList = state.subBranchEnabledModules?.[subBranchId] || state.subBranchEnabledModules?.[sbNorm]
          if (sbList && !checkList(sbList)) return false
        }

        // 2. Branch level check
        if (branchId && branchId !== 'all') {
          const bNorm = String(branchId).toLowerCase().trim()
          const bList = state.branchEnabledModules?.[branchId] || state.branchEnabledModules?.[bNorm]
          if (bList && !checkList(bList)) return false
        }

        // 3. Company level check
        if (companyId && companyId !== 'all') {
          const cKey = String(companyId).toLowerCase().trim()
          const canonKey = (cKey.includes('consult') || cKey === '2') ? 'consultancy' : (cKey.includes('tech') || cKey === '1' ? 'tech' : cKey)
          const cList = state.companyEnabledModules?.[canonKey] || state.companyEnabledModules?.[companyId]
          if (cList && !checkList(cList)) return false
        }

        return true
      },

      resetToDefaults: () => {
        set({
          rolePermissions: DEFAULT_ROLE_PERMISSIONS,
          roleActionPermissions: DEFAULT_ROLE_ACTION_PERMISSIONS,
          userPermissions: {},
          userActionPermissions: {},
          companyEnabledModules: {
            tech: [...ALL_APP_MODULES],
            consultancy: [...ALL_APP_MODULES],
          },
        })
      },

      isModuleAllowed: (user: User | null, moduleName: string) => {
        if (!user) return false
        
        const mKey = String(moduleName || '').toLowerCase().trim()
        if (mKey === 'dashboard') return true

        const normRole = normalizeRole(user.role)
        if (normRole === 'Super Admin') return true

        const state = get()
        const userIdStr = String(user.id)
        const emailStr = (user.email || '').toLowerCase().trim()
        const normId = userIdStr.toLowerCase().trim()
        const uAny = user as any

        const ALIAS_MAP: Record<string, string> = {
          'marketing': 'Digital Marketing',
          'digital marketing': 'Digital Marketing',
          'digital_marketing': 'Digital Marketing',
          'client marketing report': 'Digital Marketing',
          'marketing plans & retainers': 'Digital Marketing',
          'posts & deliverables': 'Digital Marketing',
          'marketing leads & ads': 'Digital Marketing',
          'sales': 'Invoices',
          'store': 'Services & Store',
          'packages & retainers': 'Subscriptions',
          'emi milestone plans': 'EMI',
          'team members': 'Teams',
          'payments & payroll': 'Payroll',
          'leave management': 'Leave',
          'attendance & timecards': 'Attendance',
          'knowledge base': 'Knowledge base',
          'documents': 'Files',
          'crm': 'Leads',
          'organisation': 'Companies',
          'hr & employees': 'Teams',
          'support': 'Tickets',
          'general settings': 'Settings'
        }
        const resolvedName = (ALIAS_MAP[mKey] || mKey).toLowerCase().trim()

        // 1. FIRST PRIORITY: User custom action matrix (exact source of truth)
        let userMatrix = state.userActionPermissions[userIdStr] || 
          (emailStr ? state.userActionPermissions[emailStr] : undefined) ||
          state.userActionPermissions[normId]

        if (!userMatrix && uAny.permissions) {
          let pObj: any = uAny.permissions
          if (typeof pObj === 'string') {
            try { pObj = JSON.parse(pObj) } catch {}
          }
          if (pObj && pObj.actionMatrix && typeof pObj.actionMatrix === 'object') {
            userMatrix = pObj.actionMatrix
          }
        }

        if (userMatrix && typeof userMatrix === 'object' && Object.keys(userMatrix).length > 0) {
          const matchedKey = Object.keys(userMatrix).find(k => {
            const kNorm = k.toLowerCase().trim()
            return kNorm === mKey || kNorm === resolvedName || (ALIAS_MAP[kNorm] && ALIAS_MAP[kNorm].toLowerCase().trim() === mKey)
          })
          if (matchedKey && userMatrix[matchedKey]) {
            const flags = userMatrix[matchedKey]
            return Boolean(flags.view)
          }
          // Explicit custom matrix configured: if unlisted or view false, disallow
          return false
        }

        // 2. SECOND PRIORITY: Custom allowedModules list
        let userAllowed: string[] | undefined = undefined
        let hasCustomOverride = false

        if (state.userPermissions[userIdStr] !== undefined) {
          userAllowed = state.userPermissions[userIdStr]
          hasCustomOverride = true
        } else if (emailStr && state.userPermissions[emailStr] !== undefined) {
          userAllowed = state.userPermissions[emailStr]
          hasCustomOverride = true
        } else if (state.userPermissions[normId] !== undefined) {
          userAllowed = state.userPermissions[normId]
          hasCustomOverride = true
        } else if (Array.isArray(uAny.allowedModules)) {
          userAllowed = uAny.allowedModules
          hasCustomOverride = true
        } else if (uAny.permissions) {
          let pObj: any = uAny.permissions
          if (typeof pObj === 'string') {
            try { pObj = JSON.parse(pObj) } catch {}
          }
          if (pObj && Array.isArray(pObj.allowedModules)) {
            userAllowed = pObj.allowedModules
            hasCustomOverride = true
          }
        }

        if (hasCustomOverride && userAllowed && Array.isArray(userAllowed)) {
          return userAllowed.some(m => {
            const mNorm = m.toLowerCase().trim()
            return mNorm === mKey || mNorm === resolvedName || (ALIAS_MAP[mNorm] && ALIAS_MAP[mNorm].toLowerCase().trim() === mKey)
          })
        }

        // 3. THIRD PRIORITY: Fallback to role action matrix
        const roleMatrix = state.roleActionPermissions[normRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[normRole]
        if (roleMatrix && typeof roleMatrix === 'object') {
          const matchedKey = Object.keys(roleMatrix).find(k => {
            const kNorm = k.toLowerCase().trim()
            return kNorm === mKey || kNorm === resolvedName || (ALIAS_MAP[kNorm] && ALIAS_MAP[kNorm].toLowerCase().trim() === mKey)
          })
          if (matchedKey && roleMatrix[matchedKey]) {
            const flags = roleMatrix[matchedKey]
            return Boolean(flags.view)
          }
        }

        // 4. Fallback to role permissions list
        const roleMods = (state.rolePermissions && state.rolePermissions[normRole] !== undefined)
          ? state.rolePermissions[normRole]
          : (DEFAULT_ROLE_PERMISSIONS[normRole] || [])
        return roleMods.some(m => {
          const mNorm = m.toLowerCase().trim()
          return mNorm === mKey || mNorm === resolvedName || (ALIAS_MAP[mNorm] && ALIAS_MAP[mNorm].toLowerCase().trim() === mKey)
        })
      },

      getModulesForUser: (user: User | null) => {
        if (!user) return ['Dashboard']
        const normRole = normalizeRole(user.role)
        if (normRole === 'Super Admin') return [...ALL_APP_MODULES]

        const state = get()
        return ALL_APP_MODULES.filter(m => state.isModuleAllowed(user, m))
      },

      getUserModuleActions: (user: User | null, moduleName: string): ModuleActionFlags => {
        if (!user) return { view: false, add: false, edit: false, delete: false }
        
        const mKey = String(moduleName || '').toLowerCase().trim()
        if (mKey === 'dashboard') return { ...DEFAULT_FULL_ACTIONS }

        const normRole = normalizeRole(user.role)
        if (normRole === 'Super Admin') return { ...DEFAULT_FULL_ACTIONS }

        const state = get()
        const userIdStr = String(user.id)
        const emailStr = (user.email || '').toLowerCase().trim()
        const uAny = user as any

        // Check if user has custom action matrix in store or in user object
        let userMatrix = state.userActionPermissions[userIdStr] || (emailStr ? state.userActionPermissions[emailStr] : undefined)
        let hasCustomMatrix = !!(userMatrix && typeof userMatrix === 'object' && Object.keys(userMatrix).length > 0)
        
        if (!hasCustomMatrix && uAny.permissions) {
          let pObj: any = uAny.permissions
          if (typeof pObj === 'string') {
            try { pObj = JSON.parse(pObj) } catch {}
          }
          if (pObj && pObj.actionMatrix && typeof pObj.actionMatrix === 'object') {
            userMatrix = pObj.actionMatrix
            hasCustomMatrix = Object.keys(userMatrix).length > 0
          }
        }

        // Module group alias mappings for backwards-compatible queries (e.g. "Sales" -> Invoices, etc.)
        const ALIAS_MAP: Record<string, string> = {
          'marketing': 'Digital Marketing',
          'digital marketing': 'Digital Marketing',
          'digital_marketing': 'Digital Marketing',
          'client marketing report': 'Digital Marketing',
          'marketing plans & retainers': 'Digital Marketing',
          'posts & deliverables': 'Digital Marketing',
          'marketing leads & ads': 'Digital Marketing',
          'sales': 'Invoices',
          'store': 'Services & Store',
          'packages & retainers': 'Subscriptions',
          'emi milestone plans': 'EMI',
          'team members': 'Teams',
          'payments & payroll': 'Payroll',
          'leave management': 'Leave',
          'attendance & timecards': 'Attendance',
          'knowledge base': 'Knowledge base',
          'documents': 'Files',
        }

        const resolvedName = ALIAS_MAP[mKey] ? ALIAS_MAP[mKey].toLowerCase().trim() : mKey

        // If this user has custom matrix overrides:
        if (hasCustomMatrix && userMatrix) {
          const matchedKey = Object.keys(userMatrix).find(k => {
            const kNorm = k.toLowerCase().trim()
            return kNorm === mKey || kNorm === resolvedName
          })
          if (matchedKey && userMatrix[matchedKey]) {
            const flags = userMatrix[matchedKey]
            return {
              view: Boolean(flags.view),
              add: Boolean(flags.view && flags.add),
              edit: Boolean(flags.view && flags.edit),
              delete: Boolean(flags.view && flags.delete),
              lockUnlock: Boolean(flags.view && (flags.lockUnlock ?? (normRole === 'Admin'))),
            }
          }
          // If custom matrix exists but module not listed, access is completely denied
          return { view: false, add: false, edit: false, delete: false, lockUnlock: false }
        }

        // If user has allowedModules list override:
        let userAllowed: string[] | undefined = undefined
        if (Array.isArray(uAny.allowedModules)) {
          userAllowed = uAny.allowedModules
        } else if (uAny.permissions && Array.isArray(uAny.permissions.allowedModules)) {
          userAllowed = uAny.permissions.allowedModules
        } else if (state.userPermissions[userIdStr] !== undefined) {
          userAllowed = state.userPermissions[userIdStr]
        } else if (emailStr && state.userPermissions[emailStr] !== undefined) {
          userAllowed = state.userPermissions[emailStr]
        }

        if (userAllowed !== undefined && Array.isArray(userAllowed)) {
          const isAllowed = userAllowed.some(m => {
            const mNorm = m.toLowerCase().trim()
            return mNorm === mKey || mNorm === resolvedName
          })
          if (!isAllowed) {
            return { view: false, add: false, edit: false, delete: false, lockUnlock: false }
          }
        }

        // Fallback to role action permissions only if user has no custom overrides
        const roleActionMatrix = (state.roleActionPermissions && state.roleActionPermissions[normRole]) || (DEFAULT_ROLE_ACTION_PERMISSIONS[normRole])
        if (roleActionMatrix) {
          const matchedKey = Object.keys(roleActionMatrix).find(k => {
            const kNorm = k.toLowerCase().trim()
            return kNorm === mKey || kNorm === resolvedName
          })
          if (matchedKey && roleActionMatrix[matchedKey]) {
            return { ...roleActionMatrix[matchedKey] }
          }
        }

        return { view: false, add: false, edit: false, delete: false, lockUnlock: false }
      },

      canPerformAction: (user: User | null, moduleName: string, action: ActionType | 'lockUnlock'): boolean => {
        if (!user) return false
        const normRole = normalizeRole(user.role)
        if (normRole === 'Super Admin') return true

        const actions = get().getUserModuleActions(user, moduleName)
        if (!actions.view) return false

        if (action === 'lockUnlock') {
          return Boolean(actions.lockUnlock)
        }

        return Boolean(actions[action])
      },

      canAccessModule: (user: User | null, moduleName: string): boolean => {
        return get().isModuleAllowed(user, moduleName)
      }
    }),
    {
      name: 'saampark_clean_permissions_store_v3',
    }
  )
)
