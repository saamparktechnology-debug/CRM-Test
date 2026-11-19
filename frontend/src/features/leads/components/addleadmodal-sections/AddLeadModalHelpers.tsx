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

export function formatDateForInput(dateStr?: string): string {
  const parsed = parseLeadDate(dateStr) || new Date()
  const y = parsed.getFullYear()
  const m = String(parsed.getMonth() + 1).padStart(2, "0")
  const d = String(parsed.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatDateForDisplay(yyyyMmDd: string): string {
  return formatLeadReminderDate(yyyyMmDd)
}

export function formatTimeForInput(timeStr?: string): string {
  if (!timeStr || timeStr.toLowerCase() === "none") return "11:30"
  if (/^\d{2}:\d{2}$/.test(timeStr)) return timeStr
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i)
  if (match) {
    let hours = parseInt(match[1], 10)
    const minutes = match[2]
    const ampm = match[3]?.toUpperCase()
    if (ampm === "PM" && hours < 12) hours += 12
    if (ampm === "AM" && hours === 12) hours = 0
    return `${hours.toString().padStart(2, "0")}:${minutes}`
  }
  return "11:30"
}

export function formatTimeForDisplay(hhMm: string): string {
  if (!hhMm || hhMm.toLowerCase() === "none") return "11:30 AM"
  const [h, m] = hhMm.split(":").map(Number)
  if (isNaN(h) || isNaN(m)) return hhMm
  const ampm = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12.toString().padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`
}

export interface AddLeadModalProps {
  isOpen: boolean
  onClose: () => void
  onLeadAdded: (newLead: Lead) => void
}

export const STANDARD_SOURCES = [
  "Social Media",
  "Meta Ads",
  "Google Ads",
  "Local Market",
  "Store Visit",
  "My Leads",
]
