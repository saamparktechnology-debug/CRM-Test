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

export function EditLeadModalSection3({ ctrl }: { ctrl: any }) {
  const { primaryContact, setPrimaryContact, phone, setPhone, hasSecondaryContact, setHasSecondaryContact, setSecondaryContact, setSecondaryPhone, secondaryContact, secondaryPhone, email, setEmail, source, setSource, customSource, setCustomSource, address, setAddress, country, setCountry, setState, setDistrict, setCity, state } = ctrl;
  return (
    <>
      {/* Primary contact */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Primary contact</label>
            <input
              type="text"
              value={primaryContact}
              onChange={(e) => setPrimaryContact(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            />
          </div>

          {/* Phone with India Flag */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Phone</label>
            <div className="col-span-3 flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden">
              <span className="px-2.5 py-2 text-base border-r border-zinc-200 dark:border-zinc-700 flex items-center gap-1">🇮🇳</span>
              <input
                type="text"
                placeholder="+91 XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-xs"
              />
            </div>
          </div>

          {/* Secondary Contact / Manager Option Toggle */}
          {!hasSecondaryContact ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <div />
              <div className="col-span-3">
                <button
                  type="button"
                  onClick={() => setHasSecondaryContact(true)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 py-1.5 px-3 rounded-lg border border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/60 transition-all cursor-pointer"
                >
                  <Plus size={13} />
                  <span>+ Add Secondary Contact / Manager (Optional)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/50 rounded-xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-blue-100 dark:border-blue-900/40 pb-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                  Secondary Contact / Manager Details (Optional)
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHasSecondaryContact(false)
                    setSecondaryContact("")
                    setSecondaryPhone("")
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1 px-2 py-0.5 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <X size={12} />
                  <span>Remove</span>
                </button>
              </div>

              {/* Secondary Contact Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-zinc-600 dark:text-zinc-300 font-medium">Manager Name</label>
                <input
                  type="text"
                  placeholder="Secondary contact or manager name"
                  value={secondaryContact}
                  onChange={(e) => setSecondaryContact(e.target.value)}
                  className="col-span-3 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
                />
              </div>

              {/* Secondary Phone */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-zinc-600 dark:text-zinc-300 font-medium">Manager Phone</label>
                <div className="col-span-3 flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden">
                  <span className="px-2.5 py-2 text-base border-r border-zinc-200 dark:border-zinc-700 flex items-center gap-1">🇮🇳</span>
                  <input
                    type="text"
                    placeholder="+91 XXXXXXXX"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-transparent focus:outline-none text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Email</label>
            <input
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* Source Selector with Others option */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Source</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200"
            >
              {STANDARD_SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Custom Source Form Input when Others is selected */}
          {source === "Others" && (
            <div className="grid grid-cols-4 items-center gap-4 animate-in fade-in duration-150">
              <label className="text-zinc-500 font-medium text-blue-600 dark:text-blue-400 font-semibold">
                Custom Source
              </label>
              <input
                type="text"
                placeholder="Type custom lead source..."
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="col-span-3 px-3 py-2 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-medium placeholder-zinc-400"
              />
            </div>
          )}

          {/* Address */}
          <div className="grid grid-cols-4 items-start gap-4">
            <label className="text-zinc-500 font-medium pt-2">Address</label>
            <textarea
              rows={2}
              placeholder="Building / Street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400"
            />
          </div>

          {/* 1st: Country with Search */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Country</label>
            <div className="col-span-3">
              <SearchableSelect
                value={country}
                onChange={(val) => {
                  setCountry(val)
                  if (val === "India") {
                    setState("West Bengal")
                    setDistrict("Paschim Medinipur")
                    setCity("Midnapore")
                  }
                }}
                options={ALL_COUNTRIES}
                placeholder="Select or search country..."
                searchPlaceholder="Search country or type custom..."
              />
            </div>
          </div>

          {/* 2nd: State with Search (Default: West Bengal) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">State</label>
            <div className="col-span-3">
              <SearchableSelect
                value={state}
                onChange={(val) => {
                  setState(val)
                  const dists = getDistrictsForState(val)
                  const defaultDist = val.toLowerCase().includes("bengal") ? "Paschim Medinipur" : (dists[0] || "")
                  setDistrict(defaultDist)
                  const c = getCitiesForDistrict(val, defaultDist)
                  setCity(c && c.length > 0 ? c[0] : "")
                }}
                options={country === "India" ? INDIAN_STATES : []}
                placeholder="Select or search state..."
                searchPlaceholder="Search state or type custom..."
              />
            </div>
          </div>
    </>
  );
}
