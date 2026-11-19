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

export function UserModalSection1({ ctrl }: { ctrl: any }) {
  const { isCurrentSuperAdmin, isEditingRootSuperAdmin, availableRoleOptions, role, handleRoleSelect, name, setName, email, setEmail, phone, setPhone, generatePassword, showPassword, password, setPassword, setShowPassword } = ctrl;
  return (
    <>
      {/* STEP 1: 3D INTERACTIVE ROLE SELECTOR */}
              <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]">
                <div className="flex items-center justify-between mb-3.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Crown size={14} className="text-amber-500" />
                    <span>Step 1: Select Account Role *</span>
                  </label>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isCurrentSuperAdmin ? "Super Admin can assign any role including Super Admin" : "Admins can add Team Members and Clients"}
                  </span>
                </div>

                {isEditingRootSuperAdmin && (
                  <div className="p-3.5 mb-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                    <Crown size={16} className="text-amber-500 shrink-0" />
                    <span>🛡️ Primary Root Super Admin (saampark.official) — This master account is permanently Super Admin and its role cannot be modified.</span>
                  </div>
                )}

                <div className={`grid gap-3 ${availableRoleOptions.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
                  {availableRoleOptions.map((r) => {
                    const isSelected = role === r.id
                    const isLocked = isEditingRootSuperAdmin && r.id !== "Super Admin"
                    return (
                      <button
                        key={r.id}
                        type="button"
                        disabled={isLocked}
                        onClick={() => {
                          if (isEditingRootSuperAdmin) return
                          handleRoleSelect(r.id)
                        }}
                        className={`group relative p-4 rounded-2xl text-left flex flex-col justify-between transition-all duration-200 ${isLocked ? "opacity-35 cursor-not-allowed" : "cursor-pointer"} border ${
                          isSelected
                            ? `bg-gradient-to-b ${r.glow} ${r.activeBorder} shadow-[0_10px_20px_-4px_rgba(59,130,246,0.25)] dark:shadow-[0_12px_24px_-4px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] -translate-y-1 ring-2 ring-blue-500/40 dark:ring-white/20`
                            : "bg-white hover:bg-slate-50 dark:bg-[#111726]/60 dark:hover:bg-[#151c2e]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 shadow-xs dark:shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.05)] hover:-translate-y-0.5"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-3xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
                            {r.icon}
                          </span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
                              <Check size={12} strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-white/20" />
                          )}
                        </div>
                        <div>
                          <div className={`font-black text-xs ${isSelected ? "text-blue-700 dark:text-white font-black" : "text-slate-800 dark:text-slate-200"}`}>{r.label}</div>
                          <div className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">{r.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
              {/* STEP 2: 3D CORE PROFILE DETAILS */}
              <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <User size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>Step 2: Basic Identity & Credentials</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Credentials will be emailed automatically</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      {role === "Clients" ? "Client / Contact Person Name *" : "Full Name *"}
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={role === "Clients" ? "e.g. Rahul Sharma" : "e.g. Supriya Adhikary"}
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Email Address (Login ID) *</span>
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@saampark.in"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                      />
                    </div>
                  </div>

                  {/* Password & Generator */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Login Password *</span>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles size={10} /> Generate Strong
                      </button>
                    </label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Initial account password"
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 3: 3D COMPANY & BRANCH SCOPE */}
    </>
  );
}
