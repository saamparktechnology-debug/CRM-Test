"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, GitBranch, MapPin, CheckCircle2, AlertCircle, 
  Search, SlidersHorizontal, ShieldCheck, Check, X, 
  RotateCcw, Sparkles, Layers, Eye, EyeOff, Save, Info
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, DEFAULT_COMPANIES } from "@/store/useAuthStore"
import { 
  usePermissionStore, 
  ALL_APP_MODULES, 
  CONFIGURABLE_MODULES, 
  CLEAN_MODULE_CATEGORIES 
} from "@/store/usePermissionStore"
import { saveModuleDataToDB, fetchModuleDataFromDB } from "@/lib/storageSync"
import { Button } from "@/components/ui/Button"
import { type EntityTier } from "@/features/settings/components/entitymodulepermissionstab-sections/EntityModulePermissionsTabHelpers"

export function EntityModulePermissionsTabSection1({ ctrl }: { ctrl: any }) {
  const { activeCount, totalModulesCount, handleSave, isSaving, selectedEntityId, successMessage, errorMessage, setTier, tier, effectiveCompanies, branches, subBranches, selectedEntityMeta, setSelectedEntityId, handleEnableAll, handleDisableAll } = ctrl;
  return (
    <>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/20 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Super Admin Master Control
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Multi-Tenant Governance
              </span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2 text-white">
              <Building2 className="text-blue-400" size={22} />
              <span>Entity-Level Module Permissions</span>
            </h2>
            <p className="text-xs text-blue-200/80 max-w-2xl leading-relaxed">
              Configure which modules are available for each Company, Branch, and Sub-Branch. When a module is turned off for an entity, it is completely hidden from the sidebar and protected against direct URL navigation for anyone operating in that entity.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-2xl font-black text-white">{activeCount} / {totalModulesCount}</div>
              <div className="text-[11px] text-blue-200/70 font-medium">Modules Enabled</div>
            </div>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedEntityId}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-2 px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSaving ? "Saving Changes..." : "Save Permissions"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-xs"
          >
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ENTITY TIER SELECTOR & ENTITY DROPDOWN ── */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          {/* Tier Pills */}
          <div className="md:col-span-5 space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={13} className="text-blue-600" />
              <span>1. Select Entity Scope Tier</span>
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200/60 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setTier("company")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tier === "company"
                    ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Building2 size={13} />
                <span>Company</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-700">
                  {effectiveCompanies.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTier("branch")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tier === "branch"
                    ? "bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <GitBranch size={13} />
                <span>Branch</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-700">
                  {branches.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTier("subbranch")}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  tier === "subbranch"
                    ? "bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-zinc-200 dark:border-zinc-700"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <MapPin size={13} />
                <span>Sub-Branch</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-200 dark:bg-zinc-700">
                  {subBranches.length}
                </span>
              </button>
            </div>
          </div>

          {/* Entity Dropdown */}
          <div className="md:col-span-7 space-y-1.5">
            <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-blue-600" />
                <span>2. Target {tier === "company" ? "Company" : tier === "branch" ? "Branch Office" : "Sub-Branch Partner"}</span>
              </span>
              <span className="text-[11px] font-normal text-zinc-400">
                Active: <strong className="text-zinc-700 dark:text-zinc-300">{selectedEntityMeta.name}</strong>
              </span>
            </label>

            {tier === "company" && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                {effectiveCompanies.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏢 {c.name} {c.division_name ? `(${c.division_name})` : ""}
                  </option>
                ))}
              </select>
            )}

            {tier === "branch" && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {branches.length === 0 ? (
                  <option value="">No branches configured yet</option>
                ) : (
                  branches.map((b) => {
                    const comp = effectiveCompanies.find(c => String(c.id).toLowerCase() === String(b.companyId).toLowerCase())
                    return (
                      <option key={b.id} value={b.id}>
                        🌿 {b.name} [{comp?.name || b.companyId}]
                      </option>
                    )
                  })
                )}
              </select>
            )}

            {tier === "subbranch" && (
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {subBranches.length === 0 ? (
                  <option value="">No sub-branches registered yet</option>
                ) : (
                  subBranches.map((sb) => {
                    const parentBr = branches.find(b => String(b.id).toLowerCase() === String(sb.parentBranchId).toLowerCase())
                    return (
                      <option key={sb.id} value={sb.id}>
                        🍃 {sb.name} [Branch: {parentBr?.name || sb.parentBranchId}]
                      </option>
                    )
                  })
                )}
              </select>
            )}
          </div>
        </div>

        {/* Current Entity Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {tier === "company" ? <Building2 size={18} /> : tier === "branch" ? <GitBranch size={18} /> : <MapPin size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
                  {selectedEntityMeta.name}
                </h4>
                <span className="px-2 py-0.2 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {selectedEntityMeta.type}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {selectedEntityMeta.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleEnableAll}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/50 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Check size={13} />
              <span>Enable All</span>
            </button>
            <button
              type="button"
              onClick={handleDisableAll}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 hover:bg-rose-200 dark:hover:bg-rose-900/50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <X size={13} />
              <span>Disable All</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
