"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Shield, 
  Check, 
  RotateCcw, 
  Save, 
  Loader2, 
  Search, 
  Layers, 
  CheckCheck, 
  UserCheck, 
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { UserItem } from "../types"
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
import { recordActivityLog } from "@/services/activityLogService"
import { UserPermissionsModalSection1 } from "@/features/users/components/userpermissionsmodal-sections/UserPermissionsModalSection1"
import { createUserPermissionsModalHandler1 } from "@/features/users/hooks/userpermissionsmodal-hooks/createUserPermissionsModalHandler1.hooks"


import { ACTIONS, type UserPermissionsModalProps } from "@/features/users/components/userpermissionsmodal-sections/UserPermissionsModalHelpers"
export * from "@/features/users/components/userpermissionsmodal-sections/UserPermissionsModalHelpers"

export function UserPermissionsModal({ isOpen, onClose, user: targetUser, onSaved }: UserPermissionsModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user: currentUser } = useAuthStore()
  const { 
    roleActionPermissions, 
    userActionPermissions,
    setUserAllModuleActions,
    fetchUserPermissions 
  } = usePermissionStore()

  const [matrix, setMatrix] = React.useState<Record<string, Record<string, boolean>>>({})
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Load user matrix when modal opens or targetUser changes
  React.useEffect(() => {
    if (!isOpen || !targetUser) return
    let isMounted = true
    const fetchMatrix = async () => {
      setIsLoading(true)
      try {
        const userRole = targetUser.role || "Teams"
        let res = await PermissionService.getUserMatrix(targetUser.id)
        let dbUserMatrix = res?.data?.data
        if (!dbUserMatrix && targetUser.email) {
          try {
            res = await PermissionService.getUserMatrix(targetUser.email)
            dbUserMatrix = res?.data?.data
          } catch {}
        }
        
        const uAny = targetUser as any
        const fallbackMatrix = (userActionPermissions as any)[targetUser.id] || 
          (targetUser.email ? (userActionPermissions as any)[targetUser.email] : undefined) ||
          uAny.permissions?.actionMatrix ||
          (roleActionPermissions as any)[userRole] || 
          (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[userRole] || {}
        
        const sourceMatrix = (dbUserMatrix && typeof dbUserMatrix === 'object') ? dbUserMatrix : fallbackMatrix

        const filled: Record<string, Record<string, boolean>> = {}
        CONFIGURABLE_MODULES.forEach(m => {
          filled[m] = {}
          ACTIONS.forEach(a => { 
            filled[m][a.key] = sourceMatrix[m]?.[a.key] ?? (userRole === 'Super Admin')
          })
        })
        if (isMounted) setMatrix(filled)
      } catch {
        const userRole = targetUser.role || "Teams"
        const uAny = targetUser as any
        const fallbackMatrix = uAny.permissions?.actionMatrix || 
          (roleActionPermissions as any)[userRole] || 
          (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[userRole] || {}
        const filled: Record<string, Record<string, boolean>> = {}
        CONFIGURABLE_MODULES.forEach(m => {
          filled[m] = {}
          ACTIONS.forEach(a => { 
            filled[m][a.key] = fallbackMatrix[m]?.[a.key] ?? (userRole === 'Super Admin')
          })
        })
        if (isMounted) setMatrix(filled)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    fetchMatrix()
    return () => { isMounted = false }
  }, [isOpen, targetUser, userActionPermissions, roleActionPermissions])

  const handleToggleAction = (module: string, actionKey: string) => {
    setMatrix(prev => {
      const current = prev[module] || {}
      const nextVal = !current[actionKey]
      const updated = { ...current, [actionKey]: nextVal }
      if (actionKey === "view" && !nextVal) {
        updated.add = false
        updated.edit = false
        updated.delete = false
      }
      if ((actionKey === "add" || actionKey === "edit" || actionKey === "delete") && nextVal) {
        updated.view = true
      }
      return {
        ...prev,
        [module]: updated
      }
    })
  }

  const handleToggleRow = (module: string) => {
    const row = matrix[module] || {}
    const allChecked = ACTIONS.every(a => row[a.key])
    const newRow: Record<string, boolean> = {}
    ACTIONS.forEach(a => { newRow[a.key] = !allChecked })
    setMatrix(prev => ({ ...prev, [module]: newRow }))
  }

  const handleToggleCategory = (categoryKey: string) => {
    const group = CLEAN_MODULE_CATEGORIES[categoryKey]
    if (!group) return

    const allEnabled = group.modules.every(m => 
      ACTIONS.every(a => !!matrix[m.key]?.[a.key])
    )

    const updated: Record<string, Record<string, boolean>> = { ...matrix }
    group.modules.forEach(m => {
      updated[m.key] = { ...(updated[m.key] || {}) }
      ACTIONS.forEach(a => {
        updated[m.key][a.key] = !allEnabled
      })
    })
    setMatrix(updated)
  }

  const handleResetToRoleDefaults = () => {
    if (!targetUser) return
    const userRole = targetUser.role || "Teams"
    const roleMatrix = (roleActionPermissions as any)[userRole] || (DEFAULT_ROLE_ACTION_PERMISSIONS as any)[userRole] || {}
    const filled: Record<string, Record<string, boolean>> = {}
    CONFIGURABLE_MODULES.forEach(m => {
      filled[m] = {}
      ACTIONS.forEach(a => { 
        filled[m][a.key] = roleMatrix[m]?.[a.key] ?? false 
      })
    })
    setMatrix(filled)
  }

  const handleSetTemplate = (template: "full" | "view" | "none") => {
    const filled: Record<string, Record<string, boolean>> = {}
    CONFIGURABLE_MODULES.forEach(m => {
      filled[m] = {
        view: template === "full" || template === "view",
        add: template === "full",
        edit: template === "full",
        delete: template === "full",
      }
    })
    setMatrix(filled)
  }

  const handleSave: any = createUserPermissionsModalHandler1(() => __ctrlRef.current);

  // Filtered categories
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

  // Active checks count
  const activeChecksCount = React.useMemo(() => {
    let count = 0
    Object.values(matrix).forEach(mod => {
      Object.values(mod).forEach(val => {
        if (val) count++
      })
    })
    return count
  }, [matrix])

  if (!isOpen || !targetUser) return null

  const isSuperAdmin = targetUser.role === "Super Admin"

  
  __ctrl = { isOpen, onClose, targetUser, onSaved, currentUser, roleActionPermissions, userActionPermissions, setUserAllModuleActions, fetchUserPermissions, matrix, setMatrix, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, isLoading, setIsLoading, isSaving, setIsSaving, handleToggleAction, handleToggleRow, handleToggleCategory, handleResetToRoleDefaults, handleSetTemplate, handleSave, visibleCategories, activeChecksCount, isSuperAdmin };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.96, y: 15 }} 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
      >
        <UserPermissionsModalSection1 ctrl={__ctrl} />

        {/* Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="text-xs text-zinc-500">
            {activeChecksCount} permissions assigned to <strong>{targetUser.name}</strong>
          </span>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || isSuperAdmin} className="gap-2 font-bold">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save User Matrix</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
