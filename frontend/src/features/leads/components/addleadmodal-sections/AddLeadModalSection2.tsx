"use client"

import * as React from "react"
import { X, Plus, Check, Calendar, Clock, Wrench, FileText, User as UserIcon, Tag, Building, MapPin } from "lucide-react"
import { Lead, LeadStatus, LeadType } from "@/features/leads/types"
import { addLead, parseLeadDate, formatLeadReminderDate, MONTH_NAMES_SHORT } from "@/features/leads/services/leadService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { getClients, ClientItem } from "@/features/clients/services/clientService"
import {
  SearchableSelect,
  ALL_COUNTRIES,
  INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
  getDistrictsForState,
  getCitiesForDistrict,
} from "@/features/leads/components/SearchableLocationSelect"
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, formatTimeForDisplay, type AddLeadModalProps, STANDARD_SOURCES } from "@/features/leads/components/addleadmodal-sections/AddLeadModalHelpers"

export function AddLeadModalSection2({ ctrl }: { ctrl: any }) {
  const { type, setType, isSuperOrAdmin, availableSubBranchesForBranch, selectedCompanyId, handleCompanyChange, selectableCompanies, isBranchLocked, branches, user, selectedBranchId, handleBranchChange, availableBranches, selectedSubBranchId, setSelectedSubBranchId, companyName, setCompanyName, relatedTo, setRelatedTo, customService, setCustomService, selectedServices, setSelectedServices } = ctrl;
  return (
    <>
      {/* Type radio buttons */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Type</label>
            <div className="col-span-3 flex items-center gap-6 text-zinc-700 dark:text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadType"
                  value="Organization"
                  checked={type === "Organization"}
                  onChange={() => setType("Organization")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Organization</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadType"
                  value="Person"
                  checked={type === "Person"}
                  onChange={() => setType("Person")}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span>Person</span>
              </label>
            </div>
          </div>

          {/* Company, Branch & Sub-Branch Selector for Super Admin / Admin */}
          {isSuperOrAdmin && (
            <div className={`grid grid-cols-1 ${availableSubBranchesForBranch.length > 0 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 p-3 bg-zinc-50/80 dark:bg-zinc-800/40 rounded-xl border border-zinc-200/80 dark:border-zinc-700/60`}>
              {/* Company */}
              <div className="space-y-1">
                <label className="text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <Building size={13} className="text-blue-500" />
                  <span>Company *</span>
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => handleCompanyChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold cursor-pointer shadow-2xs"
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
                <label className="text-zinc-600 dark:text-zinc-300 font-semibold flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-500" />
                    <span>Assigned Branch</span>
                  </span>
                  {isBranchLocked && (
                    <span className="text-[10px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      🔒 Locked
                    </span>
                  )}
                </label>
                {isBranchLocked ? (
                  <div className="w-full px-3 py-2 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center justify-between">
                    <span>📍 {branches.find(b => b.id === user?.branchId)?.name || user?.branchId || "Assigned Branch"}</span>
                    <span className="text-[10px] text-amber-600 font-normal">Fixed to your branch</span>
                  </div>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold cursor-pointer shadow-2xs"
                  >
                    <option value="">-- No Branch (Company Wide) --</option>
                    {availableBranches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name || (b as any).branch_name || b.code || "Branch"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Sub-Branch Selector (Visible when selected branch has sub-branches) */}
              {availableSubBranchesForBranch.length > 0 && (
                <div className="space-y-1">
                  <label className="text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                    <span className="text-purple-500">🤝</span>
                    <span>Sub-Branch (Partner)</span>
                  </label>
                  <select
                    value={selectedSubBranchId}
                    onChange={(e) => setSelectedSubBranchId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-purple-200 dark:border-purple-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-zinc-800 dark:text-zinc-200 font-semibold cursor-pointer shadow-2xs"
                  >
                    <option value="">-- No Sub-Branch (Branch HQ) --</option>
                    {availableSubBranchesForBranch.map((sb) => (
                      <option key={sb.id} value={sb.id}>
                        {sb.name} {sb.partnerType ? `(${sb.partnerType})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Lead / Company name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Lead / Company</label>
            <input
              type="text"
              placeholder="e.g. Sarah Cole / Gibson PLC"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* Related to */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Related to</label>
            <input
              type="text"
              placeholder="e.g. Project / Campaign / Website / Referral"
              value={relatedTo}
              onChange={(e) => setRelatedTo(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* Custom Services Tag Input (No preset examples) */}
          <div className="grid grid-cols-4 items-start gap-3">
            <label className="text-zinc-500 font-medium flex items-center gap-1 pt-1">
              <Wrench size={13} className="text-zinc-400" />
              <span>Services</span>
            </label>
            <div className="col-span-3 space-y-2 bg-zinc-50 dark:bg-zinc-800/60 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Type custom service (e.g. ERP Development) & press Enter or Add..."
                  value={customService}
                  onChange={(e) => setCustomService(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault()
                      const val = customService.trim().replace(/^,+|,+$/g, '')
                      if (val && !selectedServices.includes(val)) {
                        setSelectedServices((prev) => [...prev, val])
                        setCustomService("")
                      }
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    const val = customService.trim().replace(/^,+|,+$/g, '')
                    if (val && !selectedServices.includes(val)) {
                      setSelectedServices((prev) => [...prev, val])
                      setCustomService("")
                    }
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold cursor-pointer shrink-0"
                >
                  + Add
                </button>
              </div>

              {selectedServices.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {selectedServices.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                    >
                      <span>{s}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedServices((prev) => prev.filter((item) => item !== s))}
                        className="hover:text-rose-600 ml-0.5 text-zinc-400 font-bold cursor-pointer"
                        title="Remove service"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
    </>
  );
}
