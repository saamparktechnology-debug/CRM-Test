"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
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

export function UserModalSection2({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { setScopeType, scopeType, isCompanyLocked, selectedCompanyId, setSelectedCompanyId, setSelectedBranchId, setSelectedSubBranchId, editingUser, setEmployeeId, isCurrentSuperAdmin, availableCompanies, availableBranches, selectedBranchId, availableSubBranches, selectedSubBranchId, role, department, setDepartment, employeeId, designation, setDesignation, referByCategory, setReferByCategory, commissionRate, setCommissionRate, joiningDate, setJoiningDate, ctc, setCtc, autoSendOfferLetter, setAutoSendOfferLetter, kycStatus, setKycStatus, isEditingRootSuperAdmin, status, setStatus } = ctrl;
  return (
    <>
      <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 shadow-xs dark:shadow-[0_8px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <Building size={14} className="text-blue-600 dark:text-blue-400" />
                    <span>Step 3: Company & Branch Scope Isolation</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Strict regional access boundaries</span>
                </div>

                {/* 3D Scope Selection Tiles */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Access Boundary Level *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* 1. Company-Wide Scope */}
                    <div
                      onClick={() => setScopeType("company")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                        scopeType === "company"
                          ? "bg-blue-50 dark:bg-gradient-to-b dark:from-blue-500/20 dark:to-transparent border-blue-500 shadow-sm dark:shadow-[0_8px_20px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] -translate-y-0.5"
                          : "bg-white hover:bg-slate-50 dark:bg-[#111726]/60 dark:hover:bg-[#151c2e]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-blue-500 dark:border-blue-400 flex items-center justify-center shrink-0">
                        {scopeType === "company" && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 shadow-xs" />}
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Globe size={13} className="text-blue-600 dark:text-blue-400" />
                          <span>Company-Wide</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Access company HQ, and all branches and sub-branches under this company.
                        </p>
                      </div>
                    </div>

                    {/* 2. Dedicated Branch Only */}
                    <div
                      onClick={() => setScopeType("branch")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                        scopeType === "branch"
                          ? "bg-amber-50 dark:bg-gradient-to-b dark:from-amber-500/20 dark:to-transparent border-amber-500 shadow-sm dark:shadow-[0_8px_20px_rgba(245,158,11,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] -translate-y-0.5"
                          : "bg-white hover:bg-slate-50 dark:bg-[#111726]/60 dark:hover:bg-[#151c2e]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-amber-500 dark:border-amber-400 flex items-center justify-center shrink-0">
                        {scopeType === "branch" && <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 shadow-xs" />}
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <MapPin size={13} className="text-amber-500 dark:text-amber-400" />
                          <span>Dedicated Branch</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Access strictly this specific branch and its child sub-branches. Isolated from other branches and company HQ.
                        </p>
                      </div>
                    </div>

                    {/* 3. Dedicated Sub-Branch Only */}
                    <div
                      onClick={() => setScopeType("subbranch")}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 flex items-start gap-3 ${
                        scopeType === "subbranch"
                          ? "bg-emerald-50 dark:bg-gradient-to-b dark:from-emerald-500/20 dark:to-transparent border-emerald-500 shadow-sm dark:shadow-[0_8px_20px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.25)] -translate-y-0.5"
                          : "bg-white hover:bg-slate-50 dark:bg-[#111726]/60 dark:hover:bg-[#151c2e]/80 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 shadow-xs dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                      }`}
                    >
                      <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-emerald-500 dark:border-emerald-400 flex items-center justify-center shrink-0">
                        {scopeType === "subbranch" && <div className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-xs" />}
                      </div>
                      <div>
                        <div className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Layers size={13} className="text-emerald-600 dark:text-emerald-400" />
                          <span>Dedicated Sub-Branch</span>
                        </div>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          User is strictly locked to this sub-branch only. Cannot access branch HQ, other branches, or company HQ.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Company & Branch & Sub-Branch Pickers */}
                <div className={`grid grid-cols-1 ${scopeType === "subbranch" ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-4 pt-1`}>
                  {/* Company Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Target Company *</span>
                      {isCompanyLocked && (
                        <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
                          <Lock size={10} /> Locked to active company
                        </span>
                      )}
                    </label>
                    <select
                      value={selectedCompanyId}
                      disabled={isCompanyLocked}
                      onChange={(e) => {
                        const newCompId = e.target.value
                        setSelectedCompanyId(newCompId)
                        setSelectedBranchId("")
                        setSelectedSubBranchId("")
                        if (!editingUser) {
                          getStoredUserAccountsAsync().then(accs => {
                            setEmployeeId(generateCompanyEmployeeId(newCompId, accs))
                          }).catch(() => {
                            setEmployeeId(generateCompanyEmployeeId(newCompId, []))
                          })
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-bold transition-all disabled:opacity-90 disabled:cursor-not-allowed"
                    >
                      {!isCompanyLocked && isCurrentSuperAdmin && (
                        <option value="all">🌐 SAAMPARK Group (All Companies / Global Scope)</option>
                      )}
                      {availableCompanies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id === "tech" ? "💻" : "🏢"} {getCompanyFullName(c)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branch Picker */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>{scopeType === "subbranch" ? "Parent Branch *" : (scopeType === "branch" ? "Assigned Dedicated Branch *" : "Regional Branch (Optional)")}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        {availableBranches.length} branch{availableBranches.length === 1 ? "" : "es"}
                      </span>
                    </label>
                    {availableBranches.length > 0 ? (
                      <select
                        value={selectedBranchId}
                        onChange={(e) => {
                          setSelectedBranchId(e.target.value)
                          setSelectedSubBranchId("")
                        }}
                        required={scopeType === "branch" || scopeType === "subbranch"}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all ${
                          (scopeType === "branch" || scopeType === "subbranch") && !selectedBranchId ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "border-slate-300 dark:border-white/15"
                        }`}
                      >
                        <option value="">{(scopeType === "branch" || scopeType === "subbranch") ? "-- Select Assigned Branch --" : "🏢 Main Headquarters / All Branches"}</option>
                        {availableBranches.map((b) => (
                          <option key={b.id} value={b.id}>
                            📍 {b.name} {b.city ? `(${b.city})` : ""} {b.code ? `[${b.code}]` : ""}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#090d16]/50 border border-dashed border-slate-300 dark:border-white/15 text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                        <Info size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
                        <span>No branches configured for this company.</span>
                      </div>
                    )}
                  </div>

                  {/* Sub-Branch Picker (Only when scopeType === "subbranch") */}
                  {scopeType === "subbranch" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                          <Layers size={11} /> Assigned Sub-Branch *
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                          {availableSubBranches.length} sub-branch{availableSubBranches.length === 1 ? "" : "es"}
                        </span>
                      </label>
                      {availableSubBranches.length > 0 ? (
                        <select
                          value={selectedSubBranchId}
                          onChange={(e) => setSelectedSubBranchId(e.target.value)}
                          required={scopeType === "subbranch"}
                          className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border text-xs text-slate-900 dark:text-white focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all ${
                            !selectedSubBranchId ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20" : "border-slate-300 dark:border-white/15"
                          }`}
                        >
                          <option value="">-- Select Dedicated Sub-Branch --</option>
                          {availableSubBranches.map((sb) => (
                            <option key={sb.id} value={sb.id}>
                              ⚡ {sb.name} {sb.city ? `(${sb.city})` : ""} {sb.code ? `[${sb.code}]` : ""}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#090d16]/50 border border-dashed border-slate-300 dark:border-white/15 text-xs text-slate-500 dark:text-slate-400 italic flex items-center gap-1.5">
                          <Info size={13} className="text-amber-500 dark:text-amber-400 shrink-0" />
                          <span>No sub-branches for this branch.</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Role Specific: Teams (Department, Designation, Commission %) */}
                  {(role === "Teams" || role === "Referer") && (
                    <>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Department
                        </label>
                        <input
                          type="text"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          placeholder="e.g. Sales & Marketing, Engineering, Support"
                        />
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 mb-1.5">
                          Refer By Category
                        </label>
                        <select
                          value={referByCategory || ""}
                          onChange={(e) => setReferByCategory?.(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white outline-hidden font-medium"
                        >
                          <option value="">-- Select Refer By Category --</option>
                          {(masterBundle?.options?.["refer_by_category"] || []).map((opt) => (
                            <option key={opt.id} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <input type="hidden" className="hidden px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium mb-2 transition-all"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {DEPARTMENT_SUGGESTIONS.map((dept) => (
                            <button
                              key={dept}
                              type="button"
                              onClick={() => setDepartment(dept)}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-semibold ${
                                department === dept 
                                  ? "bg-blue-600 text-white font-bold border-blue-400 shadow-xs" 
                                  : "bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                              }`}
                            >
                              {dept}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                            <span>Employee Serial ID</span>
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold font-mono">
                              {selectedCompanyId === "consultancy" || selectedCompanyId === "2" ? "SCS-EMP-26XX" : "STR-EMP-26XX"}
                            </span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              value={employeeId}
                              onChange={(e) => setEmployeeId(e.target.value)}
                              placeholder={selectedCompanyId === "consultancy" || selectedCompanyId === "2" ? "e.g. SCS-EMP-2601" : "e.g. STR-EMP-2601"}
                              className="w-full pl-3.5 pr-20 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white font-mono focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-bold transition-all"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                getStoredUserAccountsAsync().then(accs => {
                                  setEmployeeId(generateCompanyEmployeeId(selectedCompanyId, accs))
                                }).catch(() => {
                                  setEmployeeId(generateCompanyEmployeeId(selectedCompanyId, []))
                                })
                              }}
                              className="absolute right-2 px-2 py-1 text-[10px] font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer shadow-2xs"
                              title="Recalculate next serial ID for this company"
                            >
                              Auto ID
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Designation / Job Title
                          </label>
                          <input
                            type="text"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="e.g. Senior Branch Executive"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                          <Percent size={12} className="text-amber-500 dark:text-amber-400" />
                          <span>Invoice Commission Rate</span>
                        </label>
                        <input
                          type="text"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(e.target.value)}
                          placeholder="e.g. 5% or ₹1,500/task"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            Date of Joining (Past or Present)
                          </label>
                          <input
                            type="date"
                            value={joiningDate}
                            onChange={(e) => setJoiningDate(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                            CTC / Salary Package
                          </label>
                          <input
                            type="text"
                            value={ctc}
                            onChange={(e) => setCtc(e.target.value)}
                            placeholder="e.g. ₹4,80,000 per Annum"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                          />
                        </div>
                      </div>

                      {!editingUser && (
                        <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 rounded-xl flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="autoSendOfferLetterCheck"
                            checked={autoSendOfferLetter}
                            onChange={(e) => setAutoSendOfferLetter(e.target.checked)}
                            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <label htmlFor="autoSendOfferLetterCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                            <span className="font-bold text-blue-700 dark:text-blue-400">✉️ Auto-send Welcome Email & Offer Letter</span>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              When this team member is created, an official offer letter and onboarding credentials will be dispatched to their email address.
                            </p>
                          </label>
                        </div>
                      )}
                    </>
                  )}

                  {/* KYC Status - Only required for Teams and Admin! Clients do NOT need KYC */}
                  {role !== "Clients" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        KYC Verification Status
                      </label>
                      <select
                        value={kycStatus}
                        onChange={(e) => setKycStatus(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#090d16]/90 border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.3)] shadow-xs dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] outline-hidden font-medium transition-all"
                      >
                        {(masterBundle?.options?.["order_status"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                      </select>
                    </div>
                  )}

                  {/* Account Status - Super Admin is permanently Active (cannot be made inactive) */}
                  {role !== "Super Admin" && !isEditingRootSuperAdmin && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Account Status
                      </label>
                      <div className="flex items-center gap-3 h-10">
                        {(["Active", "Inactive", "Pending"] as UserStatus[]).map((st) => (
                          <label key={st} className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                            <input
                              type="radio"
                              name="accountStatus"
                              checked={status === st}
                              onChange={() => setStatus(st)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                            <span>{st}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
    </>
  );
}
