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

export function AddLeadModalSection1({ ctrl }: { ctrl: any }) {
  const { setLeadMode, setSelectedClientId, setSelectedClient, leadMode, setSource, selectedClient, clientSearchQuery, setClientSearchQuery, setIsClientDropdownOpen, isClientDropdownOpen, availableClients, handleSelectExistingClient, setCompanyName, expectedTimeline, applyTimelinePreset, projectRequirement, setProjectRequirement, setReminderNotes, companyName, reminderDate } = ctrl;
  return (
    <>
      {/* Mode Switcher: New Lead vs Existing Client */}
          <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => {
                setLeadMode("new")
                setSelectedClientId("")
                setSelectedClient(null)
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                leadMode === "new"
                  ? "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs border border-zinc-200/60 dark:border-zinc-700"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <Building size={14} />
              <span>New Lead / Prospect</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLeadMode("existing_client")
                setSource("Existing Client")
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                leadMode === "existing_client"
                  ? "bg-white dark:bg-zinc-900 text-purple-600 dark:text-purple-400 shadow-xs border border-purple-200/60 dark:border-purple-800/60"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
            >
              <UserIcon size={14} />
              <span>Existing Client (Repeat Project)</span>
            </button>
          </div>

          {/* Existing Client Search & Selection Box */}
          {leadMode === "existing_client" && (
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <span>👥 Select Existing CRM Client</span>
                </span>
                {selectedClient && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    ✓ Client Details Autofilled
                  </span>
                )}
              </div>

              {/* Searchable input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search client by name, phone, or email..."
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value)
                    setIsClientDropdownOpen(true)
                  }}
                  onFocus={() => setIsClientDropdownOpen(true)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-800 border border-purple-300 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                />

                {/* Dropdown list */}
                {isClientDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-50 divide-y divide-zinc-100 dark:divide-zinc-700/60">
                    {availableClients
                      .filter((c) => {
                        if (!clientSearchQuery.trim()) return true
                        const q = clientSearchQuery.toLowerCase()
                        return (
                          (c.name || "").toLowerCase().includes(q) ||
                          (c.primaryContact || "").toLowerCase().includes(q) ||
                          (c.phone || "").toLowerCase().includes(q) ||
                          (c.email || "").toLowerCase().includes(q)
                        )
                      })
                      .slice(0, 30)
                      .map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            handleSelectExistingClient(c)
                            setClientSearchQuery("")
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors flex items-center justify-between text-xs cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-zinc-100">{c.name}</div>
                            <div className="text-[10px] text-zinc-500 flex items-center gap-2 mt-0.5">
                              {c.primaryContact && <span>Contact: {c.primaryContact}</span>}
                              {c.phone && <span>• {c.phone}</span>}
                              {c.city && <span>• {c.city}</span>}
                            </div>
                          </div>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                            {c.companyName || c.branchName || "Client"}
                          </span>
                        </button>
                      ))}
                    {availableClients.length === 0 && (
                      <div className="p-3 text-center text-xs text-zinc-400">No registered clients found.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Client Card */}
              {selectedClient && (
                <div className="flex items-center justify-between p-2.5 bg-white dark:bg-zinc-900/80 rounded-lg border border-purple-200 dark:border-purple-800/80 text-xs">
                  <div>
                    <div className="font-bold text-zinc-800 dark:text-zinc-100">{selectedClient.name}</div>
                    <div className="text-[11px] text-zinc-500">
                      {selectedClient.primaryContact} • {selectedClient.phone || "No phone"} {selectedClient.email ? `• ${selectedClient.email}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedClient(null)
                      setSelectedClientId("")
                      setCompanyName("")
                    }}
                    className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              )}

              {/* Future Project Timeline & Scope Scheduler */}
              <div className="pt-2 border-t border-purple-200/60 dark:border-purple-800/40 space-y-2">
                <label className="font-bold text-[11px] text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                  <Clock size={13} className="text-purple-600" />
                  <span>Project Timeline (e.g. Client plans after this month)</span>
                </label>
                
                {/* Quick Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "this_month", label: "This Month" },
                    { id: "next_month", label: "Next Month" },
                    { id: "after_2_months", label: "After 2 Months" },
                    { id: "next_quarter", label: "Next Quarter" },
                  ].map((p) => {
                    const isSelected = expectedTimeline.toLowerCase().includes(p.label.toLowerCase())
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyTimelinePreset(p.id as any)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-white dark:bg-zinc-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 hover:bg-purple-100"
                        }`}
                      >
                        {p.label}
                      </button>
                    )
                  })}
                </div>

                {/* Scope / Requirement description */}
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Project Requirement / Future Scope (e.g. Signage renovation, Annual reports, Branding)"
                    value={projectRequirement}
                    onChange={(e) => {
                      setProjectRequirement(e.target.value)
                      if (expectedTimeline) {
                        setReminderNotes(`Follow up with ${selectedClient?.name || companyName || "Client"} regarding ${e.target.value.trim() || "repeat project"} planned for ${expectedTimeline}`)
                      }
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                {expectedTimeline && (
                  <div className="p-2 rounded bg-purple-100/60 dark:bg-purple-950/60 text-[10.5px] text-purple-800 dark:text-purple-300 font-medium flex items-center justify-between">
                    <span>🎯 Target: <strong>{expectedTimeline}</strong></span>
                    <span>📅 Follow-up reminder set to: <strong>{reminderDate}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}
    </>
  );
}
