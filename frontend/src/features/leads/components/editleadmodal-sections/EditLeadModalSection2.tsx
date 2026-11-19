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

export function EditLeadModalSection2({ ctrl }: { ctrl: any }) {
  const { isNoReminder, setIsNoReminder, reminderDate, setReminderDate, reminderTime, setReminderTime, reminderNotes, setReminderNotes, user, caller, setCaller, setOwner, teamMembers } = ctrl;
  return (
    <>
      {/* Reminder Date & Time */}
          <div className="grid grid-cols-4 items-start gap-3">
            <label className="text-zinc-500 font-medium flex items-center gap-1 pt-1">
              <Calendar size={13} className="text-amber-500" />
              <span>Reminder Date & Time</span>
            </label>
            <div className="col-span-3 space-y-1.5">
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isNoReminder}
                    onChange={(e) => setIsNoReminder(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-amber-600 dark:text-amber-400 font-medium">No Reminder (No Auto-Lock)</span>
                </label>
              </div>

              {!isNoReminder && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative flex items-center">
                    <input
                      type="date"
                      value={formatDateForInput(reminderDate)}
                      onChange={(e) => {
                        if (e.target.value) {
                          setReminderDate(formatDateForDisplay(e.target.value))
                        }
                      }}
                      className="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-amber-600 dark:text-amber-400 font-semibold cursor-pointer text-xs"
                    />
                    <Calendar size={14} className="absolute left-2.5 text-amber-500 pointer-events-none" />
                  </div>

                  {(() => {
                    const match = (reminderTime || "11:30 AM").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
                    let hStr = "11"
                    let mStr = "30"
                    let ampmStr = "AM"
                    if (match) {
                      const rawH = parseInt(match[1], 10)
                      ampmStr = (match[3] || (rawH >= 12 ? "PM" : "AM")).toUpperCase()
                      const h12 = rawH > 12 ? rawH - 12 : (rawH === 0 ? 12 : rawH)
                      hStr = String(h12).padStart(2, "0")
                      mStr = match[2]
                    }

                    const updateTime = (newH: string, newM: string, newAmpm: string) => {
                      setReminderTime(`${newH}:${newM} ${newAmpm}`)
                    }

                    return (
                      <div className="flex items-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md overflow-hidden p-0.5 gap-1 text-xs">
                        <Clock size={13} className="text-amber-500 shrink-0 ml-1" />
                        {/* Hour Selector */}
                        <select
                          value={hStr}
                          onChange={(e) => updateTime(e.target.value, mStr, ampmStr)}
                          className="bg-transparent text-amber-600 dark:text-amber-400 font-bold focus:outline-none cursor-pointer py-0.5 text-xs"
                        >
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((h) => (
                            <option key={h} value={h} className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {h}
                            </option>
                          ))}
                        </select>
                        <span className="font-bold text-amber-600 dark:text-amber-400">:</span>
                        {/* Minute Selector */}
                        <select
                          value={mStr}
                          onChange={(e) => updateTime(hStr, e.target.value, ampmStr)}
                          className="bg-transparent text-amber-600 dark:text-amber-400 font-bold focus:outline-none cursor-pointer py-0.5 text-xs"
                        >
                          {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map((m) => (
                            <option key={m} value={m} className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {m}
                            </option>
                          ))}
                          {!["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].includes(mStr) && (
                            <option value={mStr} className="bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                              {mStr}
                            </option>
                          )}
                        </select>

                        {/* AM/PM Switcher Buttons */}
                        <div className="flex items-center bg-zinc-200/70 dark:bg-zinc-700/60 rounded p-0.5 text-[10px]">
                          <button
                            type="button"
                            onClick={() => updateTime(hStr, mStr, "AM")}
                            className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                              ampmStr === "AM"
                                ? "bg-amber-500 text-white font-extrabold shadow-2xs"
                                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            }`}
                          >
                            AM
                          </button>
                          <button
                            type="button"
                            onClick={() => updateTime(hStr, mStr, "PM")}
                            className={`px-1.5 py-0.5 rounded font-bold transition-all cursor-pointer ${
                              ampmStr === "PM"
                                ? "bg-amber-500 text-white font-extrabold shadow-2xs"
                                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            }`}
                          >
                            PM
                          </button>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Remainder Notes */}
          <div className="grid grid-cols-4 items-start gap-3">
            <label className="text-zinc-500 font-medium pt-1.5 flex items-center gap-1">
              <FileText size={13} className="text-zinc-400" />
              <span>Remainder Notes</span>
            </label>
            <textarea
              rows={1}
              placeholder="Add reminder notes regarding follow up call..."
              value={reminderNotes}
              onChange={(e) => setReminderNotes(e.target.value)}
              className="col-span-3 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 resize-none text-xs"
            />
          </div>

          {/* Assigned to / Caller Member */}
          <div className="grid grid-cols-4 items-center gap-3">
            <label className="text-zinc-500 font-medium flex items-center gap-1">
              <UserIcon size={13} className="text-zinc-400" />
              <span>Assigned to</span>
            </label>
            {user?.role === "Clients" ? (
              <input
                type="text"
                placeholder="Type assigned member name (Optional)..."
                value={caller === "None" ? "" : (caller || "")}
                onChange={(e) => {
                  const val = e.target.value
                  setCaller(val.trim() ? val : "None")
                  setOwner(val.trim() ? val : "None")
                }}
                className="col-span-3 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 text-xs placeholder:text-zinc-400"
              />
            ) : (
              <select
                value={caller || "None"}
                onChange={(e) => {
                  setCaller(e.target.value)
                  setOwner(e.target.value)
                }}
                className="col-span-3 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 font-medium text-xs"
              >
                <option value="None">None (Unassigned)</option>
                {teamMembers.map((m) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} {m.role ? `(${m.role})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
    </>
  );
}
