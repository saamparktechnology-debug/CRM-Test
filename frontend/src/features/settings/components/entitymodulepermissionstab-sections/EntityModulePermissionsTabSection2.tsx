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

export function EntityModulePermissionsTabSection2({ ctrl }: { ctrl: any }) {
  const { searchQuery, setSearchQuery, setSelectedCategory, selectedCategory, filteredCategories, draftModules, toggleCategory, toggleModule, selectedEntityMeta } = ctrl;
  return (
    <>
      {/* ── SEARCH & CATEGORY FILTER BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search modules (e.g. Tickets, Invoices)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            All Categories
          </button>
          {Object.entries(CLEAN_MODULE_CATEGORIES).map(([catKey, cat]) => (
            <button
              key={catKey}
              type="button"
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === catKey
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
              }`}
            >
              {cat.label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* ── MODULE CARDS GROUPED BY CATEGORY ── */}
      <div className="space-y-6">
        {filteredCategories.map((category) => {
          const catModules = category.modules
          const allCatEnabled = catModules.every(m => draftModules.includes(m.key))
          const someCatEnabled = catModules.some(m => draftModules.includes(m.key))

          return (
            <div
              key={category.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-2xs space-y-4"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-200/50 dark:border-blue-900/50">
                    {category.label.charAt(0)}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {category.label}
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      {catModules.filter(m => draftModules.includes(m.key)).length} of {catModules.length} modules enabled
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCategory(catModules)}
                  className="px-2.5 py-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                >
                  {allCatEnabled ? "Disable Category" : "Enable Category"}
                </button>
              </div>

              {/* Module Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {catModules.map((mod) => {
                  const isEnabled = draftModules.includes(mod.key)

                  return (
                    <div
                      key={mod.key}
                      onClick={() => toggleModule(mod.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isEnabled
                          ? "bg-blue-50/20 dark:bg-blue-950/10 border-blue-300 dark:border-blue-800/80 shadow-xs ring-1 ring-blue-500/10"
                          : "bg-zinc-50/50 dark:bg-zinc-800/20 border-zinc-200 dark:border-zinc-800 opacity-75 hover:opacity-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              {mod.name}
                            </h4>
                            <span
                              className={`px-2 py-0.2 rounded-md text-[10px] font-extrabold ${
                                isEnabled
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40"
                                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              }`}
                            >
                              {isEnabled ? "ACTIVE" : "DISABLED"}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {mod.description}
                          </p>
                        </div>

                        {/* Switch Visual */}
                        <div className="shrink-0 pt-0.5">
                          <div
                            className={`w-10 h-6 rounded-full transition-colors relative ${
                              isEnabled ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 shadow-xs ${
                                isEnabled ? "left-5" : "left-1"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Status footer */}
                      <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-zinc-400 flex items-center gap-1 font-medium">
                          {isEnabled ? (
                            <>
                              <Eye size={11} className="text-emerald-500" />
                              <span>Visible to {selectedEntityMeta.type}</span>
                            </>
                          ) : (
                            <>
                              <EyeOff size={11} className="text-rose-500" />
                              <span>Hidden for {selectedEntityMeta.type}</span>
                            </>
                          )}
                        </span>
                        <span className="font-mono text-zinc-400">
                          {mod.key}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  );
}
