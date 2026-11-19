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

export function PermissionsSection3({ ctrl }: { ctrl: any }) {
  const { activeTab, setSelectedRole, setActiveTab, setEditingRole, setFormName, setFormDescription, setIsRoleModalOpen, customRoles, setDeleteConfirm, isRoleModalOpen, editingRole, formName, formDescription, loadRoles, deleteConfirm } = ctrl;
  return (
    <>
      {/* Tab 3: Roles Overview */}
      {activeTab === "roles" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DEFAULT_ROLES_CONFIG.map(role => (
              <div key={role.name} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center font-bold text-sm">
                    <Lock size={18} />
                  </div>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded-full border " + role.badgeColor}>
                    {role.badge}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-1">{role.name}</h3>
                <p className="text-[11px] text-zinc-500 mb-4 line-clamp-3">{role.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-blue-600">{role.permissionCount} Checks</span>
                  <button 
                    onClick={() => { setSelectedRole(role.name); setActiveTab("permissions") }}
                    className="text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    Configure →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Custom Roles */}
      {activeTab === "custom-roles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Create bespoke roles with custom permission matrices.</p>
            <button 
              onClick={() => { setEditingRole(null); setFormName(""); setFormDescription(""); setIsRoleModalOpen(true) }} 
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Custom Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {customRoles.map(role => (
              <div key={role.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{role.name}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => { setEditingRole(role); setFormName(role.name); setFormDescription(role.description || ""); setIsRoleModalOpen(true) }}
                      className="p-1.5 text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(role)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-3">{role.description || "No description provided."}</p>
                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-[11px] font-bold text-zinc-400">Custom Defined</span>
                  <button 
                    onClick={() => { setSelectedRole(role.name); setActiveTab("permissions") }}
                    className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Configure Matrix →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Role Modal */}
      <AnimatePresence>
        {isRoleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {editingRole ? "Edit Custom Role" : "Create Custom Role"}
                </h3>
                <button onClick={() => setIsRoleModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                if (!formName.trim()) return
                const data = { name: formName, description: formDescription }
                await executeWithFeedback(async () => {
                  if (editingRole) { 
                    await PermissionService.updateCustomRole(editingRole.id, data) 
                  } else { 
                    await PermissionService.createCustomRole(data) 
                  }
                }, { 
                  actionType: editingRole ? "update" : "create", 
                  successTitle: editingRole ? "Role Updated" : "Role Created" 
                })
                setIsRoleModalOpen(false)
                loadRoles()
              }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Role Name</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)} 
                    placeholder="e.g. Field Team Lead"
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">Description</label>
                  <textarea 
                    value={formDescription} 
                    onChange={(e) => setFormDescription(e.target.value)} 
                    placeholder="Describe role responsibilities..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsRoleModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 rounded-lg cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer">
                    {editingRole ? "Save Changes" : "Create Role"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Delete Custom Role?</h3>
              <p className="text-xs text-zinc-500">
                Are you sure you want to delete role <strong className="text-zinc-900 dark:text-zinc-100">{deleteConfirm.name}</strong>?
              </p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-xs font-semibold text-zinc-600 bg-zinc-100 rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button onClick={async () => {
                  if (!deleteConfirm) return
                  await executeWithFeedback(async () => { 
                    await PermissionService.deleteCustomRole(deleteConfirm.id) 
                  }, { actionType: "delete", successTitle: "Role Deleted" })
                  setDeleteConfirm(null)
                  loadRoles()
                }} className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm cursor-pointer">
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
