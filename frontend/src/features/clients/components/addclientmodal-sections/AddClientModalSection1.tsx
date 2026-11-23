"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, HelpCircle, User, Building, MapPin } from "lucide-react"
import { ClientItem } from "@/features/clients/types"
import { getUsers } from "@/features/users/services/userService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { sendClientWelcomeEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayEmail, getClientCategories, saveClientCategory, DEFAULT_CLIENT_CATEGORIES } from "@/features/clients/services/clientService"
import { lookupPincode } from "@/lib/pincodeService"
import { type AddClientModalProps } from "@/features/clients/components/addclientmodal-sections/AddClientModalHelpers"

export function AddClientModalSection1({ ctrl }: { ctrl: any }) {
  const { data: masterBundle } = useMasterBundle()
  const { isSuperOrAdmin, availableSubBranchesForBranch, selectedCompanyId, handleCompanyChange, selectableCompanies, isBranchLocked, branches, user, selectedBranchId, handleBranchChange, availableBranches, selectedSubBranchId, setSelectedSubBranchId, type, setType, companyName, setCompanyName, designation, setDesignation, customDesignation, setCustomDesignation, owner, setOwner, ownersList, managers, setManagers } = ctrl;
  return (
    <>
      {/* Company, Branch & Sub-Branch Selector */}
            {isSuperOrAdmin && (
              <div className={`grid grid-cols-1 ${availableSubBranchesForBranch.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80`}>
                {/* Company */}
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5 text-[11px]">
                    <Building size={13} className="text-blue-500" />
                    <span>Company Entity *</span>
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-bold cursor-pointer text-xs"
                  >
                    {selectableCompanies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Branch */}
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-300 font-semibold flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-amber-500" />
                      <span>Branch Location</span>
                    </span>
                    {isBranchLocked && (
                      <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                        🔒 Locked
                      </span>
                    )}
                  </label>
                  {isBranchLocked ? (
                    <div className="w-full px-2.5 py-1.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-between">
                      <span className="truncate">📍 {branches.find(b => b.id === user?.branchId)?.name || user?.branchId || "Assigned Branch"}</span>
                    </div>
                  ) : (
                    <select
                      value={selectedBranchId}
                      onChange={(e) => handleBranchChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800 dark:text-slate-200 font-bold cursor-pointer text-xs"
                    >
                      <option value="">🏢 Company HQ (All Branches)</option>
                      {availableBranches.map((b) => (
                        <option key={b.id} value={b.id}>
                          📍 {b.name || (b as any).branch_name || b.code || "Branch"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Dynamic Sub-Branch Selector (Visible when selected branch has sub-branches) */}
                {availableSubBranchesForBranch.length > 0 && (
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5 text-[11px]">
                      <span className="text-purple-500">🤝</span>
                      <span>Sub-Branch (Partner)</span>
                    </label>
                    <select
                      value={selectedSubBranchId}
                      onChange={(e) => setSelectedSubBranchId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-slate-800 dark:text-slate-200 font-bold cursor-pointer text-xs"
                    >
                      <option value="">-- Direct Branch Client --</option>
                      {availableSubBranchesForBranch.map((sb) => (
                        <option key={sb.id} value={sb.id}>
                          🤝 {sb.name || (sb as any).sub_branch_name || sb.code}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* Type */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Type</label>
              <div className="md:col-span-3 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    checked={type === "Organization"}
                    onChange={() => setType("Organization")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Organization</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="clientType"
                    checked={type === "Person"}
                    onChange={() => setType("Person")}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Person</span>
                </label>
              </div>
            </div>

            {/* Company Name */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Company name</label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Designation / Role */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Designation</label>
              <div className="md:col-span-3 flex flex-col sm:flex-row gap-2">
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                >
                  {(masterBundle?.options?.["client_designation"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
                </select>
                {designation === "Other" && (
                  <input
                    type="text"
                    value={customDesignation}
                    onChange={(e) => setCustomDesignation(e.target.value)}
                    placeholder="Enter custom title..."
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                )}
              </div>
            </div>

            {/* Owner */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                Owner <HelpCircle size={13} className="text-slate-400" />
              </label>
              <select
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ownersList.length === 0 ? (
                  <option value={user?.name || "Admin"}>{user?.name || "Admin"}</option>
                ) : (
                  ownersList.map((o) => (
                    <option key={o.id || o.name} value={o.name}>
                      {o.name} {o.role ? `(${o.role})` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Managers */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Managers</label>
              <input
                type="text"
                value={managers}
                onChange={(e) => setManagers(e.target.value)}
                placeholder="Managers"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
    </>
  );
}
