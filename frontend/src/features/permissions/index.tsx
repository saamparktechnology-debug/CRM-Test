"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Shield, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Check, 
  Lock, 
  UserCheck, 
  RotateCcw, 
  Save, 
  Loader2, 
  Sparkles,
  Layers,
  CheckCheck,
  CheckCircle2,
  Database,
  ChevronDown,
  User
} from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { PermissionService } from "@/services/permissionService"
import { 
  CONFIGURABLE_MODULES, 
  CLEAN_MODULE_CATEGORIES,
  ALL_ACTIONS,
  usePermissionStore, 
  ModuleActionFlags,
  DEFAULT_ROLE_ACTION_PERMISSIONS
} from "@/store/usePermissionStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { getUsers } from "@/features/users/services/userService"
import { UserItem } from "@/features/users/types"
import { PermissionsSection1 } from "@/features/permissions/components/permissions-sections/PermissionsSection1"
import { PermissionsSection2 } from "@/features/permissions/components/permissions-sections/PermissionsSection2"
import { PermissionsSection3 } from "@/features/permissions/components/permissions-sections/PermissionsSection3"
import { createPermissionsHandler1 } from "@/features/permissions/hooks/permissions-hooks/createPermissionsHandler1.hooks"


import { type Tab, type CustomRole, ACTIONS, DEFAULT_ROLES_CONFIG } from "@/features/permissions/components/permissions-sections/PermissionsHelpers"
export * from "@/features/permissions/components/permissions-sections/PermissionsHelpers"

export default function PermissionsMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user: currentUser, activeCompanyId, activeBranchId, companies, branches } = useAuthStore()
  const { 
    roleActionPermissions, 
    userActionPermissions,
    setRoleAllModuleActions, 
    setUserAllModuleActions,
    fetchRolePermissions,
    fetchUserPermissions,
  } = usePermissionStore()

  const [activeTab, setActiveTab] = React.useState<Tab>("permissions")
  const [customRoles, setCustomRoles] = React.useState<CustomRole[]>([])
  const [usersList, setUsersList] = React.useState<UserItem[]>([])
  const [selectedRole, setSelectedRole] = React.useState<string>("Admin")
  const [selectedUserId, setSelectedUserId] = React.useState<string>("")
  const [permissionMatrix, setPermissionMatrix] = React.useState<Record<string, Record<string, boolean>>>({})
  const [userPermissionMatrix, setUserPermissionMatrix] = React.useState<Record<string, Record<string, boolean>>>({})
  const [isLoadingMatrix, setIsLoadingMatrix] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Filtering & Category Navigation
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  // Searchable User Picker state
  const [isUserPickerOpen, setIsUserPickerOpen] = React.useState(false)
  const [userPickerSearch, setUserPickerSearch] = React.useState("")
  const userPickerRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userPickerRef.current && !userPickerRef.current.contains(event.target as Node)) {
        setIsUserPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])
  
  // Custom role modal states
  const [isRoleModalOpen, setIsRoleModalOpen] = React.useState(false)
  const [editingRole, setEditingRole] = React.useState<CustomRole | null>(null)
  const [deleteConfirm, setDeleteConfirm] = React.useState<CustomRole | null>(null)
  const [formName, setFormName] = React.useState("")
  const [formDescription, setFormDescription] = React.useState("")

  const loadRoles = React.useCallback(async () => {
    try { 
      const res = await PermissionService.getCustomRoles()
      const data = res?.data?.data || res?.data || res
      setCustomRoles(Array.isArray(data) ? data : []) 
    } catch { }
  }, [])

  const loadUsersList = React.useCallback(async () => {
    try {
      const list = await getUsers("all")
      setUsersList(Array.isArray(list) ? list : [])
    } catch { }
  }, [])

  React.useEffect(() => { 
    loadRoles()
    loadUsersList()
  }, [loadRoles, loadUsersList])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get("tab") as Tab | null
    const userParam = params.get("userId")
    if (tabParam && ["permissions", "user-permissions", "roles", "custom-roles"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
    if (userParam) {
      setSelectedUserId(userParam)
      if (!tabParam) setActiveTab("user-permissions")
    }
  }, [])

  // Filter users strictly matching active company / branch
  const visibleUsersList = React.useMemo(() => {
    if (!usersList || usersList.length === 0) return []
    const isSuperAdmin = currentUser?.role === "Super Admin"
    const targetComp = (activeCompanyId || currentUser?.companyId || "").toLowerCase().trim()
    const targetBranch = activeBranchId || currentUser?.branchId

    let filtered = usersList

    if (!isSuperAdmin) {
      filtered = filtered.filter((u) => u.role !== "Super Admin")
    }

    if (targetComp && targetComp !== "all") {
      const matchedCompany = companies.find(
        (c) =>
          String(c.id).toLowerCase().trim() === targetComp ||
          String(c.slug || "").toLowerCase().trim() === targetComp ||
          String(c.name || "").toLowerCase().trim() === targetComp
      )
      const validTargetCompIds = new Set<string>([
        targetComp,
        ...(matchedCompany?.id ? [String(matchedCompany.id).toLowerCase().trim()] : []),
        ...(matchedCompany?.slug ? [String(matchedCompany.slug).toLowerCase().trim()] : []),
        ...(matchedCompany?.name ? [String(matchedCompany.name).toLowerCase().trim()] : []),
      ])

      filtered = filtered.filter((u) => {
        if (u.role === "Super Admin") {
          const sCompIds = (u.companyIds || [u.companyId]).map(id => String(id || "").toLowerCase().trim())
          return sCompIds.some(id => validTargetCompIds.has(id)) || u.email === "saampark.official@gmail.com"
        }

        const uCompIds = (u.companyIds && u.companyIds.length > 0)
          ? u.companyIds.map(id => String(id).toLowerCase().trim())
          : (u.companyId ? [String(u.companyId).toLowerCase().trim()] : [])
        
        if (u.companyName) {
          uCompIds.push(String(u.companyName).toLowerCase().trim())
        }

        return uCompIds.some(id => validTargetCompIds.has(id))
      })
    }

    if (targetBranch && targetBranch !== "all") {
      const targetBranchObj = branches.find(b => b.id === targetBranch || b.name.toLowerCase() === targetBranch.toLowerCase())
      const targetBranchId = String(targetBranchObj?.id || targetBranch).toLowerCase().trim()
      const targetBranchName = targetBranchObj?.name?.toLowerCase().trim() || ""

      filtered = filtered.filter((u) => {
        if (u.role === "Super Admin") return true
        const uBranchIds = (u.branchIds && u.branchIds.length > 0)
          ? u.branchIds.map(id => String(id).toLowerCase().trim())
          : (u.branchId ? [String(u.branchId).toLowerCase().trim()] : [])
        const uBranchName = String(u.branchName || "").toLowerCase().trim()

        return (
          uBranchIds.includes(targetBranchId) ||
          (targetBranchName && uBranchIds.includes(targetBranchName)) ||
          String(u.branchId || "").toLowerCase().trim() === targetBranchId ||
          (targetBranchName && (uBranchName === targetBranchName || String(u.branchId || "").toLowerCase().trim() === targetBranchName))
        )
      })
    }

    return filtered
  }, [usersList, currentUser, activeCompanyId, activeBranchId, companies, branches])

  // Sync selectedUserId
  React.useEffect(() => {
    if (visibleUsersList.length > 0) {
      if (!selectedUserId || (!visibleUsersList.some(u => u.id === selectedUserId) && !usersList.some(u => u.id === selectedUserId))) {
        setSelectedUserId(visibleUsersList[0].id)
      }
    } else if (usersList.length > 0) {
      if (!selectedUserId || !usersList.some(u => u.id === selectedUserId)) {
        setSelectedUserId(usersList[0].id)
      }
    } else {
      setSelectedUserId("")
    }
  }, [visibleUsersList, usersList, selectedUserId])

  // Load role matrix from backend
  React.useEffect(() => {
    if (!selectedRole) return
    let isMounted = true
    const fetchMatrix = async () => {
      setIsLoadingMatrix(true)
      try {
        const res = await PermissionService.getRoleMatrix(selectedRole)
        const dbMatrix = res?.data?.data
        const fallbackMatrix = (roleActionPermissions as any)[selectedRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[selectedRole] || {}
        const sourceMatrix = (dbMatrix && typeof dbMatrix === 'object') ? dbMatrix : fallbackMatrix

        const filled: Record<string, Record<string, boolean>> = {}
        CONFIGURABLE_MODULES.forEach(m => {
          filled[m] = {}
          ACTIONS.forEach(a => { 
            filled[m][a.key] = sourceMatrix[m]?.[a.key] ?? (selectedRole === 'Super Admin')
          })
          if (m === "Leads") {
            filled[m]["lockUnlock"] = sourceMatrix[m]?.lockUnlock ?? (selectedRole === 'Super Admin' || selectedRole === 'Admin')
          }
        })
        if (isMounted) setPermissionMatrix(filled)
      } catch {
        const fallbackMatrix = (roleActionPermissions as any)[selectedRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[selectedRole] || {}
        const filled: Record<string, Record<string, boolean>> = {}
        CONFIGURABLE_MODULES.forEach(m => {
          filled[m] = {}
          ACTIONS.forEach(a => { 
            filled[m][a.key] = fallbackMatrix[m]?.[a.key] ?? (selectedRole === 'Super Admin')
          })
          if (m === "Leads") {
            filled[m]["lockUnlock"] = fallbackMatrix[m]?.lockUnlock ?? (selectedRole === 'Super Admin' || selectedRole === 'Admin')
          }
        })
        if (isMounted) setPermissionMatrix(filled)
      } finally {
        if (isMounted) setIsLoadingMatrix(false)
      }
    }
    fetchMatrix()
    return () => { isMounted = false }
  }, [selectedRole, roleActionPermissions])

  // Load user matrix when selectedUserId changes
  React.useEffect(() => {
    if (!selectedUserId) return
    let isMounted = true
    const fetchUserMatrix = async () => {
      setIsLoadingMatrix(true)
      try {
        const selectedUser = usersList.find(u => u.id === selectedUserId)
        const userRole = selectedUser?.role || "Teams"
        
        const res = await PermissionService.getUserMatrix(selectedUserId)
        const dbUserMatrix = res?.data?.data
        
        const roleMatrix = (roleActionPermissions as any)[userRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[userRole] || {}
        const sourceMatrix = (dbUserMatrix && typeof dbUserMatrix === 'object') ? dbUserMatrix : roleMatrix

        const filled: Record<string, Record<string, boolean>> = {}
        CONFIGURABLE_MODULES.forEach(m => {
          filled[m] = {}
          ACTIONS.forEach(a => { 
            filled[m][a.key] = sourceMatrix[m]?.[a.key] ?? (userRole === 'Super Admin')
          })
          if (m === "Leads") {
            filled[m]["lockUnlock"] = sourceMatrix[m]?.lockUnlock ?? (userRole === 'Super Admin' || userRole === 'Admin')
          }
        })
        if (isMounted) setUserPermissionMatrix(filled)
      } catch {
        const selectedUser = usersList.find(u => u.id === selectedUserId)
        const userRole = selectedUser?.role || "Teams"
        const roleMatrix = (roleActionPermissions as any)[userRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[userRole] || {}
        const filled: Record<string, Record<string, boolean>> = {}
        CONFIGURABLE_MODULES.forEach(m => {
          filled[m] = {}
          ACTIONS.forEach(a => { 
            filled[m][a.key] = roleMatrix[m]?.[a.key] ?? (userRole === 'Super Admin')
          })
          if (m === "Leads") {
            filled[m]["lockUnlock"] = roleMatrix[m]?.lockUnlock ?? (userRole === 'Super Admin' || userRole === 'Admin')
          }
        })
        if (isMounted) setUserPermissionMatrix(filled)
      } finally {
        if (isMounted) setIsLoadingMatrix(false)
      }
    }
    fetchUserMatrix()
    return () => { isMounted = false }
  }, [selectedUserId, usersList, roleActionPermissions])

  const handlePermissionToggle = (module: string, action: string) => {
    setPermissionMatrix(prev => {
      const current = prev[module] || {}
      const nextVal = !current[action]
      const updated = { ...current, [action]: nextVal }
      if (action === "view" && !nextVal) {
        updated.add = false
        updated.edit = false
        updated.delete = false
      }
      if ((action === "add" || action === "edit" || action === "delete") && nextVal) {
        updated.view = true
      }
      return { ...prev, [module]: updated }
    })
  }

  const handleUserPermissionToggle = (module: string, action: string) => {
    setUserPermissionMatrix(prev => {
      const current = prev[module] || {}
      const nextVal = !current[action]
      const updated = { ...current, [action]: nextVal }
      if (action === "view" && !nextVal) {
        updated.add = false
        updated.edit = false
        updated.delete = false
      }
      if ((action === "add" || action === "edit" || action === "delete") && nextVal) {
        updated.view = true
      }
      return { ...prev, [module]: updated }
    })
  }

  const handleToggleRow = (module: string, isUser = false) => {
    const currentMatrix = isUser ? userPermissionMatrix : permissionMatrix
    const row = currentMatrix[module] || {}
    const allChecked = ACTIONS.every(a => row[a.key])
    const newRow: Record<string, boolean> = {}
    ACTIONS.forEach(a => { newRow[a.key] = !allChecked })
    if (module === "Leads") {
      newRow["lockUnlock"] = !allChecked
    }

    if (isUser) {
      setUserPermissionMatrix(prev => ({ ...prev, [module]: newRow }))
    } else {
      setPermissionMatrix(prev => ({ ...prev, [module]: newRow }))
    }
  }

  const handleToggleCategory = (categoryKey: string, isUser = false) => {
    const group = CLEAN_MODULE_CATEGORIES[categoryKey]
    if (!group) return

    const currentMatrix = isUser ? userPermissionMatrix : permissionMatrix
    const allEnabled = group.modules.every(m => 
      ACTIONS.every(a => !!currentMatrix[m.key]?.[a.key])
    )

    const updated: Record<string, Record<string, boolean>> = { ...currentMatrix }
    group.modules.forEach(m => {
      updated[m.key] = { ...(updated[m.key] || {}) }
      ACTIONS.forEach(a => {
        updated[m.key][a.key] = !allEnabled
      })
      if (m.key === "Leads") {
        updated[m.key]["lockUnlock"] = !allEnabled
      }
    })

    if (isUser) {
      setUserPermissionMatrix(updated)
    } else {
      setPermissionMatrix(updated)
    }
  }

  const handleSetTemplate = (template: "full" | "view" | "none", isUser = false) => {
    const updated: Record<string, Record<string, boolean>> = {}
    CONFIGURABLE_MODULES.forEach(m => {
      updated[m] = {
        view: template === "full" || template === "view",
        add: template === "full",
        edit: template === "full",
        delete: template === "full",
        ...(m === "Leads" ? { lockUnlock: template === "full" } : {})
      }
    })
    if (isUser) setUserPermissionMatrix(updated)
    else setPermissionMatrix(updated)
  }

  const handleSaveRolePermissions = async () => {
    if (!selectedRole) return
    setIsSaving(true)
    try {
      const typed: Record<string, ModuleActionFlags> = {}
      Object.keys(permissionMatrix).forEach(m => { 
        typed[m] = {
          view: !!permissionMatrix[m]?.view,
          add: !!permissionMatrix[m]?.add,
          edit: !!permissionMatrix[m]?.edit,
          delete: !!permissionMatrix[m]?.delete,
          ...(m === "Leads" ? { lockUnlock: !!permissionMatrix[m]?.lockUnlock } : {})
        }
      })

      const activeModules = CONFIGURABLE_MODULES.filter((m) => {
        const flags = typed[m]
        return flags && (flags.view || flags.add || flags.edit || flags.delete)
      })

      await executeWithFeedback(async () => { 
        await PermissionService.saveRoleMatrix(selectedRole, typed)
        setRoleAllModuleActions(selectedRole as any, typed)
        usePermissionStore.getState().setRolePermissions(selectedRole as any, activeModules)
        await fetchRolePermissions()

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("saampark_data_synced"))
          window.dispatchEvent(new Event("storage"))
        }
      }, {
        actionType: "update", 
        successTitle: "Role Permissions Saved", 
        successMsg: "Permission matrix saved to database for role " + selectedRole + "."
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveUserPermissions: any = createPermissionsHandler1(() => __ctrlRef.current);

  const handleResetUserToRoleDefaults = () => {
    const selectedUser = usersList.find(u => u.id === selectedUserId)
    const userRole = selectedUser?.role || "Teams"
    const roleMatrix = (roleActionPermissions as any)[userRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[userRole] || {}
    const filled: Record<string, Record<string, boolean>> = {}
    CONFIGURABLE_MODULES.forEach(m => {
      filled[m] = {}
      ACTIONS.forEach(a => { 
        filled[m][a.key] = roleMatrix[m]?.[a.key] ?? false 
      })
      if (m === "Leads") {
        filled[m]["lockUnlock"] = roleMatrix[m]?.lockUnlock ?? false
      }
    })
    setUserPermissionMatrix(filled)
  }

  // Filtered module list by category & search
  const visibleCategories = React.useMemo(() => {
    const searchLower = searchQuery.toLowerCase().trim()
    const result: Array<{ key: string; label: string; modules: { key: string; name: string; description: string }[] }> = []

    Object.entries(CLEAN_MODULE_CATEGORIES).forEach(([catKey, catData]) => {
      if (selectedCategory !== "all" && selectedCategory !== catKey) return

      const matchingModules = catData.modules.filter(m => {
        if (!searchLower) return true
        return (
          m.name.toLowerCase().includes(searchLower) ||
          m.key.toLowerCase().includes(searchLower) ||
          m.description.toLowerCase().includes(searchLower)
        )
      })

      if (matchingModules.length > 0) {
        result.push({
          key: catKey,
          label: catData.label,
          modules: matchingModules
        })
      }
    })

    return result
  }, [selectedCategory, searchQuery])

  // Count active permissions currently checked in matrix
  const currentTotalChecked = React.useMemo(() => {
    const matrix = activeTab === "user-permissions" ? userPermissionMatrix : permissionMatrix
    let count = 0
    Object.values(matrix).forEach(mod => {
      Object.values(mod).forEach(val => {
        if (val) count++
      })
    })
    return count
  }, [activeTab, userPermissionMatrix, permissionMatrix])

  const selectedUserData = visibleUsersList.find(u => u.id === selectedUserId) || usersList.find(u => u.id === selectedUserId)

  const filteredPickerUsers = React.useMemo(() => {
    if (!userPickerSearch.trim()) return visibleUsersList
    const q = userPickerSearch.toLowerCase().trim()
    return visibleUsersList.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.role && u.role.toLowerCase().includes(q))
    )
  }, [visibleUsersList, userPickerSearch])

  
  __ctrl = { currentUser, activeCompanyId, activeBranchId, companies, branches, roleActionPermissions, userActionPermissions, setRoleAllModuleActions, setUserAllModuleActions, fetchRolePermissions, fetchUserPermissions, activeTab, setActiveTab, customRoles, setCustomRoles, usersList, setUsersList, selectedRole, setSelectedRole, selectedUserId, setSelectedUserId, permissionMatrix, setPermissionMatrix, userPermissionMatrix, setUserPermissionMatrix, isLoadingMatrix, setIsLoadingMatrix, isSaving, setIsSaving, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, isUserPickerOpen, setIsUserPickerOpen, userPickerSearch, setUserPickerSearch, userPickerRef, isRoleModalOpen, setIsRoleModalOpen, editingRole, setEditingRole, deleteConfirm, setDeleteConfirm, formName, setFormName, formDescription, setFormDescription, loadRoles, loadUsersList, visibleUsersList, handlePermissionToggle, handleUserPermissionToggle, handleToggleRow, handleToggleCategory, handleSetTemplate, handleSaveRolePermissions, handleSaveUserPermissions, handleResetUserToRoleDefaults, visibleCategories, currentTotalChecked, selectedUserData, filteredPickerUsers };
  __ctrlRef.current = __ctrl;
return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6">
      
      <PermissionsSection1 ctrl={__ctrl} />

      {/* Tab 2: Per-User Permission Overrides */}
      <PermissionsSection2 ctrl={__ctrl} />

      <PermissionsSection3 ctrl={__ctrl} />

    </motion.div>
  )
}
