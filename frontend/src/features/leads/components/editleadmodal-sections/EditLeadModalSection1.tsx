"use client"

import * as React from "react"
import { X, Plus, Check, Calendar, Clock, Wrench, FileText, User as UserIcon, Trash2, MapPin, Building, Info } from "lucide-react"
import { Lead, LeadStatus, LeadType } from "@/features/leads/types"
import { updateLead, unlockLead, parseLeadDate, formatLeadReminderDate, isReminderDateOverdue, MONTH_NAMES_SHORT, canUserUnlockLead, isLeadClientPrivate } from "@/features/leads/services/leadService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import {
  SearchableSelect,
  ALL_COUNTRIES,
  INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
  getDistrictsForState,
  getCitiesForDistrict,
} from "@/features/leads/components/SearchableLocationSelect"
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, formatTimeForDisplay, type EditLeadModalProps, STANDARD_SOURCES } from "@/features/leads/components/editleadmodal-sections/EditLeadModalHelpers"

export function EditLeadModalSection1({ ctrl }: { ctrl: any }) {
  const { lead, type, setType, isSuperOrAdmin, availableSubBranchesForBranch, selectedCompanyId, handleCompanyChange, selectableCompanies, selectedBranchId, handleBranchChange, availableBranches, selectedSubBranchId, setSelectedSubBranchId, companyName, setCompanyName, relatedTo, setRelatedTo, status, setStatus, customService, setCustomService, selectedServices, setSelectedServices } = ctrl;
  return (
    <>
      {/* Creator & Branch Context Info */}
          {(lead?.createdByName || lead?.createdBy || lead?.branchName || lead?.branchId) && (
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl backdrop-blur-md bg-white/70 dark:bg-zinc-800/60 border border-indigo-100/80 dark:border-indigo-900/40 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 flex-wrap shadow-2xs">
              {(lead?.createdByName || lead?.createdBy) && (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full backdrop-blur-md bg-white/80 dark:bg-zinc-800/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/30 flex items-center justify-center shadow-xs">
                    <Info size={11} className="stroke-[2.2]" />
                  </span>
                  <span className="text-zinc-500 font-medium">Added by:</span>
                  <strong className="text-indigo-950 dark:text-indigo-200 font-bold">{lead.createdByName || lead.createdBy} {lead.createdByRole ? `(${lead.createdByRole})` : ""}</strong>
                </span>
              )}
              {(lead?.branchName || lead?.branchId) && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-amber-500 shrink-0" />
                  <span className="text-zinc-500">Branch:</span>
                  <strong className="text-blue-600 dark:text-blue-400 font-semibold">{lead.branchName || lead.branchId}</strong>
                </span>
              )}
            </div>
          )}
          
          {/* Type radio buttons */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Type</label>
            <div className="col-span-3 flex items-center gap-6 text-zinc-700 dark:text-zinc-300">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editLeadType"
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
                  name="editLeadType"
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
                <label className="text-zinc-600 dark:text-zinc-300 font-semibold flex items-center gap-1.5 text-[11px]">
                  <MapPin size={13} className="text-amber-500" />
                  <span>Branch (Optional)</span>
                </label>
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

          {/* Lead Name / Company */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Lead / Company</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-semibold"
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

          {/* Move Stage / Status Selector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium text-blue-600 dark:text-blue-400 font-semibold">
              Move Stage (Status)
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as LeadStatus)}
              className="col-span-3 px-3 py-2 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900 dark:text-blue-100 font-bold"
            >
              <option value="New">New</option>
              <option value="Qualified">Qualified</option>
              <option value="Discussion">Discussion</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Store Visit">Store Visit</option>
              <option value="Our Office Visit">Our Office Visit</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
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
