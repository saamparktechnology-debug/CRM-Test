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
import { UserItem } from "@/features/users/types"
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
import { ACTIONS, type UserPermissionsModalProps } from "@/features/users/components/userpermissionsmodal-sections/UserPermissionsModalHelpers"

export function UserPermissionsModalSection1({ ctrl }: { ctrl: any }) {
  const { targetUser, activeChecksCount, isSuperAdmin, handleSetTemplate, handleResetToRoleDefaults, onClose, setSelectedCategory, selectedCategory, searchQuery, setSearchQuery, isLoading, visibleCategories, handleToggleCategory, matrix, handleToggleRow, handleToggleAction } = ctrl;
  return (
    <>
      {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  User Permissions: {targetUser.name}
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {targetUser.role}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                {targetUser.email} • {CONFIGURABLE_MODULES.length} Modules • {activeChecksCount} Checks Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isSuperAdmin && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSetTemplate("full")}
                  className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 font-bold hover:underline cursor-pointer"
                >
                  Full Access
                </button>
                <button
                  type="button"
                  onClick={() => handleSetTemplate("view")}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 font-semibold hover:underline cursor-pointer"
                >
                  View Only
                </button>
                <button
                  type="button"
                  onClick={handleResetToRoleDefaults}
                  className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory("all")}
              className={"px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer " + (
                selectedCategory === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              )}
            >
              All ({CONFIGURABLE_MODULES.length})
            </button>
            {Object.entries(CLEAN_MODULE_CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={"px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer " + (
                  selectedCategory === key
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
                )}
              >
                {cat.label} ({cat.modules.length})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56 shrink-0">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter modules..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Matrix Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isSuperAdmin ? (
            <div className="p-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-700 dark:text-purple-300 flex items-center gap-4">
              <Crown size={32} className="text-purple-600 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Super Admin Master Access Active</h4>
                <p className="text-xs opacity-90 mt-1">
                  Super Admin accounts have full master access across all modules, companies, and branches.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-16 flex flex-col items-center justify-center text-zinc-400 gap-3">
              <Loader2 size={24} className="animate-spin text-blue-600" />
              <span className="text-xs">Loading user permission matrix...</span>
            </div>
          ) : (
            <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-semibold text-[10px] sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="py-3 px-4 min-w-[200px]">Module</th>
                      <th className="py-3 px-2 text-center w-16">Row</th>
                      {ACTIONS.map(a => (
                        <th key={a.key} className="py-3 px-3 text-center min-w-[65px] font-bold text-zinc-700 dark:text-zinc-300 capitalize">
                          <span className="mr-1">{a.icon}</span> {a.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                    {visibleCategories.map(cat => (
                      <React.Fragment key={cat.key}>
                        {/* Category Header */}
                        <tr className="bg-zinc-100/70 dark:bg-zinc-800/40 border-t border-b border-zinc-200/60 dark:border-zinc-800">
                          <td colSpan={ACTIONS.length + 2} className="py-2 px-4">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center gap-1.5">
                                <Layers size={13} className="text-blue-600" />
                                <span>{cat.label} ({cat.modules.length} Modules)</span>
                              </span>
                              <button
                                type="button"
                                onClick={() => handleToggleCategory(cat.key)}
                                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCheck size={12} />
                                <span>Toggle Category</span>
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Modules */}
                        {cat.modules.map(mod => {
                          const isAllChecked = ACTIONS.every(a => matrix[mod.key]?.[a.key])
                          return (
                            <tr key={mod.key} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                              <td className="py-2.5 px-4">
                                <div className="font-bold text-zinc-900 dark:text-zinc-100">{mod.name}</div>
                                <div className="text-[10px] text-zinc-400 line-clamp-1">{mod.description}</div>
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleRow(mod.key)}
                                  className={"text-[9px] px-2 py-0.5 rounded font-bold border transition-colors cursor-pointer " + (
                                    isAllChecked 
                                      ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-400" 
                                      : "bg-zinc-50 border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700"
                                  )}
                                >
                                  {isAllChecked ? "Clear" : "All"}
                                </button>
                              </td>
                              {ACTIONS.map(a => {
                                const checked = !!matrix[mod.key]?.[a.key]
                                return (
                                  <td key={a.key} className="py-2.5 px-3 text-center">
                                    <button 
                                      type="button"
                                      onClick={() => handleToggleAction(mod.key, a.key)} 
                                      title={"Toggle " + a.label + " for " + mod.name}
                                      className={"w-6 h-6 mx-auto rounded border flex items-center justify-center transition-all cursor-pointer " + (
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
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
    </>
  );
}
