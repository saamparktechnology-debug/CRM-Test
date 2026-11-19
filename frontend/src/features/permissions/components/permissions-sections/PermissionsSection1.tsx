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

export function PermissionsSection1({ ctrl }: { ctrl: any }) {
  const { currentTotalChecked, setActiveTab, activeTab, selectedRole, setSelectedRole, customRoles, searchQuery, setSearchQuery, handleSetTemplate, handleSaveRolePermissions, isSaving, isLoadingMatrix, setSelectedCategory, selectedCategory, visibleCategories, handleToggleCategory, permissionMatrix, handleToggleRow, handlePermissionToggle } = ctrl;
  return (
    <>
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2.5">
            <Shield className="text-blue-600 dark:text-blue-400" size={24} />
            <span>Permissions & Access Control</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {CONFIGURABLE_MODULES.length} Modules • View, Add, Edit, Delete
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure role-based access control (RBAC) and individual user overrides with instant database persistence
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-200/80 dark:border-zinc-700 flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-500" />
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{currentTotalChecked} Active Checks</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-px overflow-x-auto">
        {(["permissions", "user-permissions", "roles", "custom-roles"] as Tab[]).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={"flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap cursor-pointer " + (
              activeTab === tab 
                ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/30" 
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            {tab === "permissions" && <Shield size={14} />}
            {tab === "user-permissions" && <UserCheck size={14} />}
            {tab === "roles" && <Lock size={14} />}
            {tab === "custom-roles" && <Sparkles size={14} />}
            <span>
              {tab === "permissions" && "Role Permission Matrix"}
              {tab === "user-permissions" && "Per-User Permissions"}
              {tab === "roles" && "Roles Overview"}
              {tab === "custom-roles" && "Custom Roles"}
            </span>
          </button>
        ))}
      </div>

      {/* Tab 1: Role Permission Matrix */}
      {activeTab === "permissions" && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Configuring Role:</span>
              <select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)} 
                className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {["Super Admin", "Admin", "Teams", "Clients", ...customRoles.map(r => r.name)].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>

              {/* Search Box */}
              <div className="relative w-52">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Quick Template Helpers */}
              <div className="flex items-center gap-1 pl-2 border-l border-zinc-200 dark:border-zinc-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSetTemplate("full", false)}
                  className="px-2 py-0.5 rounded font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 hover:underline cursor-pointer"
                >
                  Full Access
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTemplate("view", false)}
                  className="px-2 py-0.5 rounded font-semibold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:underline cursor-pointer"
                >
                  View Only
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTemplate("none", false)}
                  className="px-2 py-0.5 rounded font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={handleSaveRolePermissions} 
                disabled={isSaving || isLoadingMatrix}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>Save Role Permissions</span>
              </button>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
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

          {/* Matrix Table */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
            {isLoadingMatrix ? (
              <div className="p-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
                <Loader2 size={24} className="animate-spin text-blue-600" />
                <span className="text-xs">Loading permissions matrix from database...</span>
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
                        {/* Category Header Row */}
                        <tr className="bg-zinc-100/70 dark:bg-zinc-800/40 border-t border-b border-zinc-200/60 dark:border-zinc-800">
                          <td colSpan={ACTIONS.length + 2} className="py-2 px-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                                <Layers size={13} className="text-blue-600" />
                                <span>{cat.label} ({cat.modules.length} Modules)</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleCategory(cat.key, false)}
                                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCheck size={12} />
                                <span>Toggle Category</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Individual Module Rows */}
                        {cat.modules.map(mod => {
                          const isAllChecked = ACTIONS.every(a => permissionMatrix[mod.key]?.[a.key])
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
                                    onClick={() => handleToggleRow(mod.key, false)}
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
                                  const checked = !!permissionMatrix[mod.key]?.[a.key]
                                  return (
                                    <td key={a.key} className="py-3 px-3 text-center">
                                      <button 
                                        type="button"
                                        onClick={() => handlePermissionToggle(mod.key, a.key)} 
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
                                              Leads Granular Control
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                            Controls whether this role can lock or unlock company leads. (Client-added leads are private and locked/unlocked strictly by the specific client).
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300">
                                          {permissionMatrix["Leads"]?.lockUnlock ? "Allowed" : "Restricted"}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handlePermissionToggle("Leads", "lockUnlock")}
                                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                            permissionMatrix["Leads"]?.lockUnlock ? "bg-amber-500" : "bg-zinc-300 dark:bg-zinc-700"
                                          }`}
                                        >
                                          <span
                                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                              permissionMatrix["Leads"]?.lockUnlock ? "translate-x-4" : "translate-x-0"
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
            
            {/* Table Footer */}
            <div className="px-5 py-3.5 bg-zinc-50/70 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3">
              <span className="text-xs text-zinc-500">
                All changes take effect immediately across active user accounts.
              </span>
              <button 
                onClick={handleSaveRolePermissions} 
                disabled={isSaving || isLoadingMatrix}
                className="px-5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition-all cursor-pointer"
              >
                {isSaving ? "Saving..." : "Save Role Permissions"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
