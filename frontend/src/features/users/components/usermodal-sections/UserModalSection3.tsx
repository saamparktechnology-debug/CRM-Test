"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, User, Mail, Shield, Building, Phone, Lock, UserCheck, ShieldCheck, 
  Check, Info, Crown, MapPin, Eye, EyeOff, Sparkles, RefreshCw, Search,
  Briefcase, Percent, ChevronDown, ChevronRight, CheckCircle2, Layers,
  Globe, Radio, ShieldAlert, KeyRound, ArrowRight, CheckSquare, Square
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { UserItem as UserType, UserRole, UserStatus } from "@/features/users/types"
import { generateCompanyEmployeeId, getStoredUserAccountsAsync } from "@/features/users/services/userService"
import { useAuthStore, isMatchingCompany, getCompanyFullName } from "@/store/useAuthStore"
import { 
  usePermissionStore, 
  CONFIGURABLE_MODULES, 
  ModuleName, 
  ModuleActionFlags, 
  DEFAULT_FULL_ACTIONS, 
  DEFAULT_VIEW_ONLY_ACTIONS, 
  MODULE_ACTION_CONFIG,
  normalizeRole, 
  DEFAULT_ROLE_PERMISSIONS,
  DEFAULT_ROLE_ACTION_PERMISSIONS
} from "@/store/usePermissionStore"
import { createNotification } from "@/services/notificationService"
import { type UserModalProps, MODULE_CATEGORIES, DEPARTMENT_SUGGESTIONS } from "@/features/users/components/usermodal-sections/UserModalHelpers"

export function UserModalSection3({ ctrl }: { ctrl: any }) {
  const { activeTab, role, applyPreset, moduleSearch, setModuleSearch, collapsedCategories, actionMatrix, setCollapsedCategories, setActionMatrix, setAllowedModules, handleCheckboxChange } = ctrl;
  return (
    <>
      {/* ========================================================================= */}
            {/* TAB 2: PERMISSIONS & MODULE MATRIX (Kept mounted to preserve all states)  */}
            {/* ========================================================================= */}
            <div className={activeTab === "permissions" ? "space-y-4 block" : "space-y-4 hidden"}>
              
              {/* 3D Master Presets Bar */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  <span>3D Quick Presets:</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {role === "Clients" ? (
                    <button
                      type="button"
                      onClick={() => applyPreset("clientPortal")}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-amber-500/15 dark:bg-gradient-to-b dark:from-amber-500/25 dark:to-amber-600/25 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 shadow-xs hover:bg-amber-500/25 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      💼 Standard Client Portal
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => applyPreset("salesCRM")}
                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-500/15 dark:bg-gradient-to-b dark:from-blue-500/25 dark:to-blue-600/25 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-500/40 shadow-xs hover:bg-blue-500/25 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        🎯 Sales & CRM
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("finance")}
                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-500/15 dark:bg-gradient-to-b dark:from-emerald-500/25 dark:to-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 shadow-xs hover:bg-emerald-500/25 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        📊 Accounts & Finance
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("full")}
                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-purple-500/15 dark:bg-gradient-to-b dark:from-purple-500/25 dark:to-pink-600/25 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40 shadow-xs hover:bg-purple-500/25 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        🌟 Full Master Access
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset("viewOnly")}
                        className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10 shadow-xs hover:bg-slate-200 dark:hover:bg-white/[0.08] active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        👁️ View Only All
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => applyPreset("revoke")}
                    className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-rose-500/15 dark:bg-gradient-to-b dark:from-rose-500/20 dark:to-rose-600/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 shadow-xs hover:bg-rose-500/25 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Revoke All
                  </button>
                </div>
              </div>

              {/* Module Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  placeholder="Search modules to configure..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                />
              </div>

              {/* Categorized 3D Module Cards Accordions */}
              <div className="space-y-3.5">
                {MODULE_CATEGORIES.map((cat) => {
                  const filteredModules = cat.modules.filter(m => 
                    m.toLowerCase().includes(moduleSearch.toLowerCase())
                  )
                  if (filteredModules.length === 0 && moduleSearch) return null

                  const isCollapsed = Boolean(collapsedCategories[cat.name])
                  const activeCountInCat = cat.modules.filter(m => {
                    const f = actionMatrix[m]
                    return f && (f.view || f.add || f.edit || f.delete)
                  }).length

                  return (
                    <div key={cat.name} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111726]/60 shadow-xs dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] overflow-hidden">
                      {/* Category Header */}
                      <div 
                        onClick={() => setCollapsedCategories(prev => ({ ...prev, [cat.name]: !prev[cat.name] }))}
                        className="px-4 py-3 bg-slate-50 hover:bg-slate-100 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] flex items-center justify-between cursor-pointer transition-colors border-b border-slate-200 dark:border-white/5"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl filter drop-shadow-xs">{cat.icon}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{cat.name}</span>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-extrabold border border-blue-200 dark:border-blue-500/30 shadow-2xs">
                            {activeCountInCat} of {cat.modules.length} active
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              const next = { ...actionMatrix }
                              const shouldEnable = activeCountInCat < cat.modules.length
                              cat.modules.forEach(m => {
                                next[m] = shouldEnable ? { view: true, add: true, edit: true, delete: false } : { view: false, add: false, edit: false, delete: false }
                              })
                              setActionMatrix(next)
                              setAllowedModules(CONFIGURABLE_MODULES.filter(m => {
                                const f = next[m]
                                return f && (f.view || f.add || f.edit || f.delete)
                              }))
                            }}
                            className="text-[10.5px] px-2.5 py-1 rounded-lg font-bold text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 border border-blue-200 dark:border-blue-500/20 transition-all cursor-pointer"
                          >
                            Toggle Suite
                          </button>
                          {isCollapsed ? <ChevronRight size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
                        </div>
                      </div>

                      {/* 3D Module Action Chips */}
                      {!isCollapsed && (
                        <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/50 dark:bg-transparent">
                          {filteredModules.map((m) => {
                            const flags = actionMatrix[m] || { view: false, add: false, edit: false, delete: false }
                            const isAnyActive = flags.view || flags.add || flags.edit || flags.delete

                            return (
                              <div
                                key={m}
                                className={`p-3.5 rounded-xl border transition-all duration-200 ${
                                  isAnyActive 
                                    ? "bg-blue-50/60 dark:bg-[#141b2e]/90 border-blue-400/60 dark:border-blue-500/40 shadow-xs dark:shadow-[0_4px_12px_rgba(59,130,246,0.15)]" 
                                    : "bg-white dark:bg-[#0c101a]/60 border-slate-200 dark:border-white/5 opacity-80 hover:opacity-100"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2.5">
                                  <span className="text-xs font-extrabold text-slate-900 dark:text-white">{m}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextState = !flags.view
                                      handleCheckboxChange(m, "view", nextState)
                                      handleCheckboxChange(m, "add", nextState)
                                      handleCheckboxChange(m, "edit", nextState)
                                      handleCheckboxChange(m, "delete", nextState)
                                    }}
                                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-extrabold cursor-pointer"
                                  >
                                    {isAnyActive ? "Clear" : "Full Access"}
                                  </button>
                                </div>

                                {/* 3D Interactive Action Buttons */}
                                <div className="grid grid-cols-4 gap-1.5">
                                  {(["view", "add", "edit", "delete"] as (keyof ModuleActionFlags)[]).map((actionKey) => {
                                    const isChecked = Boolean(flags[actionKey])
                                    const colorTheme = 
                                      actionKey === "view" ? "emerald" :
                                      actionKey === "add" ? "blue" :
                                      actionKey === "edit" ? "amber" : "rose"

                                    const themeClasses = {
                                      emerald: isChecked 
                                        ? "bg-emerald-600 dark:bg-gradient-to-b dark:from-emerald-500 dark:to-emerald-600 text-white border-emerald-500 shadow-xs" 
                                        : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white",
                                      blue: isChecked 
                                        ? "bg-blue-600 dark:bg-gradient-to-b dark:from-blue-500 dark:to-blue-600 text-white border-blue-500 shadow-xs" 
                                        : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white",
                                      amber: isChecked 
                                        ? "bg-amber-500 dark:bg-gradient-to-b dark:from-amber-500 dark:to-amber-600 text-white border-amber-400 shadow-xs" 
                                        : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white",
                                      rose: isChecked 
                                        ? "bg-rose-600 dark:bg-gradient-to-b dark:from-rose-500 dark:to-rose-600 text-white border-rose-500 shadow-xs" 
                                        : "bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:border-slate-300 hover:text-slate-900 dark:hover:text-white",
                                    }[colorTheme]

                                    return (
                                      <button
                                        key={actionKey}
                                        type="button"
                                        onClick={() => handleCheckboxChange(m, actionKey, !isChecked)}
                                        className={`py-1 rounded-lg text-[10.5px] font-black capitalize border transition-all duration-150 cursor-pointer flex items-center justify-center gap-1 active:translate-y-0.5 ${themeClasses}`}
                                      >
                                        {isChecked && <Check size={10} strokeWidth={3} />}
                                        <span>{actionKey}</span>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
    </>
  );
}
