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

export function PermissionsSection2({ ctrl }: { ctrl: any }) {
  const { activeTab, userPickerRef, setIsUserPickerOpen, isUserPickerOpen, setUserPickerSearch, selectedUserData, userPickerSearch, filteredPickerUsers, selectedUserId, setSelectedUserId, handleResetUserToRoleDefaults, handleSaveUserPermissions, isSaving, isLoadingMatrix, setSelectedCategory, selectedCategory, searchQuery, setSearchQuery, visibleCategories, userPermissionMatrix, handleToggleRow, handleUserPermissionToggle } = ctrl;
  return (
    <>
      {activeTab === "user-permissions" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 relative" ref={userPickerRef}>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 whitespace-nowrap">Select User Account:</label>
                
                {/* Searchable Combobox Trigger */}
                <div className="relative w-full sm:w-96">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserPickerOpen(!isUserPickerOpen)
                      if (!isUserPickerOpen) setUserPickerSearch("")
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    {selectedUserData ? (
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {selectedUserData.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate">{selectedUserData.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-semibold shrink-0">
                          {selectedUserData.role}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-normal truncate hidden md:inline">
                          ({selectedUserData.email})
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-400 font-normal">🔍 Search user by name or email...</span>
                    )}
                    <ChevronDown size={14} className={"text-zinc-400 transition-transform " + (isUserPickerOpen ? "rotate-180" : "")} />
                  </button>

                  {/* Dropdown Popover with Real-time Search by Name & Email */}
                  {isUserPickerOpen && (
                    <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[420px] max-w-[90vw] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[360px]">
                      {/* Search Input Box */}
                      <div className="p-2.5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50">
                        <div className="relative">
                          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            autoFocus
                            value={userPickerSearch}
                            onChange={(e) => setUserPickerSearch(e.target.value)}
                            placeholder="Search by name, email, or role..."
                            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                          />
                        </div>
                      </div>

                      {/* User List */}
                      <div className="overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60 p-1">
                        {filteredPickerUsers.length === 0 ? (
                          <div className="p-6 text-center text-xs text-zinc-400">
                            No user accounts match "{userPickerSearch}"
                          </div>
                        ) : (
                          filteredPickerUsers.map(u => {
                            const isSelected = u.id === selectedUserId
                            return (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => {
                                  setSelectedUserId(u.id)
                                  setIsUserPickerOpen(false)
                                  setUserPickerSearch("")
                                }}
                                className={"w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors cursor-pointer " + (
                                  isSelected 
                                    ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200" 
                                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-800 dark:text-zinc-200"
                                )}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 font-bold text-xs flex items-center justify-center shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="truncate">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs truncate">{u.name}</span>
                                      <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                        {u.role}
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-zinc-400 truncate">{u.email}</div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check size={14} className="text-blue-600 shrink-0 ml-2" />
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedUserData && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleResetUserToRoleDefaults} 
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset to Role Defaults</span>
                  </button>
                  <button 
                    onClick={handleSaveUserPermissions} 
                    disabled={isSaving || isLoadingMatrix}
                    className="flex items-center gap-2 px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    <span>Save User Overrides</span>
                  </button>
                </div>
              )}
            </div>

            {selectedUserData && (
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-lg flex items-center justify-between text-xs text-blue-800 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <UserCheck size={16} />
                  <span>Configuring custom permissions for <strong>{selectedUserData.name}</strong> ({selectedUserData.email})</span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400">Role: {selectedUserData.role}</span>
              </div>
            )}

            {/* Category Filter Chips & Search Bar for Tab 2 */}
            {selectedUserId && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-1">
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className={"px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer " + (
                        selectedCategory === "all"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                      )}
                    >
                      All Modules ({CONFIGURABLE_MODULES.length})
                    </button>
                    {Object.entries(CLEAN_MODULE_CATEGORIES).map(([key, cat]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={"px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer " + (
                          selectedCategory === key
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50"
                        )}
                      >
                        {cat.label} ({cat.modules.length})
                      </button>
                    ))}
                  </div>

                  <div className="relative w-52 shrink-0">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter modules..."
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Matrix Table */}
          {selectedUserId && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
              {isLoadingMatrix ? (
                <div className="p-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span className="text-xs">Loading user custom overrides...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px]">
                      <tr>
                        <th className="py-3 px-4 min-w-[220px]">Module</th>
                        <th className="py-3 px-2 text-center w-20">Row All</th>
                        {ACTIONS.map(a => (
                          <th key={a.key} className="py-3 px-3 text-center min-w-[70px] capitalize font-bold text-zinc-700 dark:text-zinc-300">
                            <span className="mr-1">{a.icon}</span> {a.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                      {visibleCategories.map(cat => (
                        <React.Fragment key={cat.key}>
                          <tr className="bg-zinc-100/70 dark:bg-zinc-800/40 border-t border-b border-zinc-200/60 dark:border-zinc-800">
                            <td colSpan={ACTIONS.length + 2} className="py-2 px-4">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                                {cat.label} ({cat.modules.length} Modules)
                              </span>
                            </td>
                          </tr>

                          {cat.modules.map(mod => {
                            const isAllChecked = ACTIONS.every(a => userPermissionMatrix[mod.key]?.[a.key])
                            return (
                              <React.Fragment key={mod.key}>
                                <tr className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                                  <td className="py-3 px-4">
                                    <div className="font-bold text-zinc-900 dark:text-zinc-100">{mod.name}</div>
                                    <div className="text-[10px] text-zinc-400 line-clamp-1">{mod.description}</div>
                                  </td>
                                  <td className="py-3 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleRow(mod.key, true)}
                                      className={"text-[10px] px-2 py-0.5 rounded font-medium border transition-colors cursor-pointer " + (
                                        isAllChecked 
                                          ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-400" 
                                          : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700"
                                      )}
                                    >
                                      {isAllChecked ? "Clear" : "All"}
                                    </button>
                                  </td>
                                  {ACTIONS.map(a => {
                                    const checked = !!userPermissionMatrix[mod.key]?.[a.key]
                                    return (
                                      <td key={a.key} className="py-3 px-3 text-center">
                                        <button 
                                          type="button"
                                          onClick={() => handleUserPermissionToggle(mod.key, a.key)} 
                                          title={"Toggle " + a.label + " for " + mod.name}
                                          className={"w-6 h-6 mx-auto rounded-md border flex items-center justify-center transition-all cursor-pointer " + (
                                            checked 
                                              ? "bg-blue-600 border-blue-600 text-white shadow-xs" 
                                              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-transparent hover:border-blue-400"
                                          )}
                                        >
                                          {checked && <Check size={12} strokeWidth={3} />}
                                        </button>
                                      </td>
                                    )
                                  })}
                                </tr>

                                {mod.key === "Leads" && (
                                  <tr className="bg-amber-50/40 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30">
                                    <td colSpan={ACTIONS.length + 2} className="py-2.5 px-6">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                                            <Lock size={14} />
                                          </div>
                                          <div>
                                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                              <span>Sub-Permission: Lock / Unlock Leads</span>
                                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                                                User Override
                                              </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                              Override whether this specific user can lock or unlock company leads. (Client-added leads are private and locked/unlocked strictly by the specific client).
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                            {userPermissionMatrix["Leads"]?.lockUnlock ? "Allowed" : "Restricted"}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleUserPermissionToggle("Leads", "lockUnlock")}
                                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                              userPermissionMatrix["Leads"]?.lockUnlock ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
                                            }`}
                                          >
                                            <span
                                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                                userPermissionMatrix["Leads"]?.lockUnlock ? "translate-x-4" : "translate-x-0"
                                              }`}
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            )
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
