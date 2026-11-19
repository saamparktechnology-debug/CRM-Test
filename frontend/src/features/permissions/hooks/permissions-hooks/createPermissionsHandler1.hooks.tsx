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
import { type Tab, type CustomRole, ACTIONS, DEFAULT_ROLES_CONFIG } from "@/features/permissions/components/permissions-sections/PermissionsHelpers"

export function createPermissionsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { selectedUserId, setIsSaving, userPermissionMatrix, usersList, setUserAllModuleActions, fetchUserPermissions } = getCtrl();
    const __fn: any = async () => {
    if (!selectedUserId) return
    setIsSaving(true)
    try {
      const typed: Record<string, ModuleActionFlags> = {}
      Object.keys(userPermissionMatrix).forEach(m => { 
        typed[m] = {
          view: !!userPermissionMatrix[m]?.view,
          add: !!userPermissionMatrix[m]?.add,
          edit: !!userPermissionMatrix[m]?.edit,
          delete: !!userPermissionMatrix[m]?.delete,
          ...(m === "Leads" ? { lockUnlock: !!userPermissionMatrix[m]?.lockUnlock } : {})
        }
      })

      const allowedModules = CONFIGURABLE_MODULES.filter(m => {
        const flags = typed[m]
        return flags && (flags.view || flags.add || flags.edit || flags.delete)
      })

      const selectedUser = usersList.find(u => u.id === selectedUserId)
      const userLabel = selectedUser ? selectedUser.name + " (" + selectedUser.email + ")" : selectedUserId

      await executeWithFeedback(async () => { 
        await PermissionService.saveUserMatrix(selectedUserId, typed)
        if (selectedUser?.email) {
          await PermissionService.saveUserMatrix(selectedUser.email, typed)
        }
        setUserAllModuleActions(selectedUserId, typed)
        usePermissionStore.getState().setUserPermissions(selectedUserId, allowedModules)
        if (selectedUser?.email) {
          setUserAllModuleActions(selectedUser.email, typed)
          usePermissionStore.getState().setUserPermissions(selectedUser.email, allowedModules)
        }
        await fetchUserPermissions(selectedUserId)

        // Sync with userService so users table & UserModal see the update
        try {
          const { updateUser } = await import("@/features/users/services/userService")
          await updateUser(selectedUserId, {
            allowedModules,
            permissions: {
              actionMatrix: typed,
              allowedModules,
            }
          })
        } catch {}

        // If current auth user, update session
        try {
          const curAuth = useAuthStore.getState().user
          if (curAuth && (String(curAuth.id) === String(selectedUserId) || curAuth.email?.toLowerCase().trim() === selectedUser?.email?.toLowerCase().trim())) {
            useAuthStore.setState({
              user: {
                ...curAuth,
                allowedModules,
                permissions: {
                  actionMatrix: typed,
                  allowedModules,
                }
              }
            })
          }
        } catch {}

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("saampark_user_permissions_updated"))
          window.dispatchEvent(new Event("saampark_users_updated"))
          window.dispatchEvent(new Event("saampark_data_synced"))
          window.dispatchEvent(new Event("storage"))
        }
      }, {
        actionType: "update", 
        successTitle: "User Overrides Saved", 
        successMsg: "Custom permission overrides saved to database for " + userLabel + "."
      })
    } finally {
      setIsSaving(false)
    }
  };
    return __fn(...__args);
  };
}
