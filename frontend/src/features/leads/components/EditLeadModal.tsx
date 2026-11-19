"use client"

import * as React from "react"
import { X, Plus, Check, Calendar, Clock, Wrench, FileText, User as UserIcon, Trash2, MapPin, Building, Info } from "lucide-react"
import { Lead, LeadStatus, LeadType } from "../types"
import { updateLead, unlockLead, parseLeadDate, formatLeadReminderDate, isReminderDateOverdue, MONTH_NAMES_SHORT, canUserUnlockLead, isLeadClientPrivate } from "../services/leadService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"

// Helper to convert date string to "YYYY-MM-DD" for input[type="date"] (Zero UTC Timezone Shift)
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, formatTimeForDisplay, type EditLeadModalProps, STANDARD_SOURCES } from "@/features/leads/components/editleadmodal-sections/EditLeadModalHelpers"
export * from "@/features/leads/components/editleadmodal-sections/EditLeadModalHelpers"

import {
  SearchableSelect,
  ALL_COUNTRIES,
  INDIAN_STATES,
  DISTRICTS_BY_STATE,
  CITIES_BY_DISTRICT,
  getDistrictsForState,
  getCitiesForDistrict,
} from "./SearchableLocationSelect"
import { EditLeadModalSection1 } from "@/features/leads/components/editleadmodal-sections/EditLeadModalSection1"
import { EditLeadModalSection2 } from "@/features/leads/components/editleadmodal-sections/EditLeadModalSection2"
import { EditLeadModalSection3 } from "@/features/leads/components/editleadmodal-sections/EditLeadModalSection3"
import { createEditLeadModalHandler1 } from "@/features/leads/hooks/editleadmodal-hooks/createEditLeadModalHandler1.hooks"


export function EditLeadModal({ isOpen, lead, onClose, onLeadUpdated, onDeleteLead }: EditLeadModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, activeCompanyId, activeBranchId, branches, subBranches } = useAuthStore()
  const isSuperOrAdmin = user?.role === "Super Admin" || user?.role === "Admin"

  const selectableCompanies = React.useMemo(() => {
    const list = getSelectableCompanies(companies, activeCompanyId, user, branches)
    if (lead?.companyId && !list.some(c => isMatchingCompany(c, lead.companyId))) {
      const leadComp = companies?.find(c => isMatchingCompany(c, lead.companyId))
      if (leadComp) return [leadComp, ...list]
    }
    return list
  }, [companies, activeCompanyId, user, branches, lead?.companyId])

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(
    lead?.companyId || activeCompanyId || user?.companyId || "tech"
  )
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(
    lead?.branchId || activeBranchId || user?.branchId || ""
  )
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>(
    (lead as any)?.subBranchId || ""
  )

  const availableBranches = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    const targetComp = selectedCompanyId || lead?.companyId || activeCompanyId || user?.companyId || "tech"
    if (targetComp && targetComp !== "all") {
      return branches.filter((b) =>
        isMatchingCompany({ id: b.companyId || (b as any).company_id, slug: b.companyId } as any, targetComp)
      )
    }
    return branches
  }, [branches, selectedCompanyId, lead?.companyId, activeCompanyId, user?.companyId])

  const availableSubBranchesForBranch = React.useMemo(() => {
    if (!selectedBranchId || !subBranches || !Array.isArray(subBranches)) return []
    const bId = String(selectedBranchId).toLowerCase().trim()
    const targetBranch = branches.find(b => String(b.id).toLowerCase().trim() === bId)
    const bCode = targetBranch?.code ? String(targetBranch.code).toLowerCase().trim() : ""
    const bName = targetBranch?.name ? String(targetBranch.name).toLowerCase().trim() : ""

    return subBranches.filter(sb => {
      const pId = String(sb.parentBranchId || (sb as any).branch_id || (sb as any).branchId || "").toLowerCase().trim()
      const pName = String((sb as any).branchName || (sb as any).branch_name || "").toLowerCase().trim()
      return pId === bId || (bCode && pId === bCode) || (bName && pName === bName)
    })
  }, [subBranches, selectedBranchId, branches])

  const handleCompanyChange = (newCompId: string) => {
    setSelectedCompanyId(newCompId)
    setSelectedBranchId("")
    setSelectedSubBranchId("")
  }

  const handleBranchChange = (newBranchId: string) => {
    setSelectedBranchId(newBranchId)
    setSelectedSubBranchId("")
  }

  const [teamMembers, setTeamMembers] = React.useState<{ id: string; name: string; role?: string }[]>([])
  const [type, setType] = React.useState<LeadType>("Organization")
  const [companyName, setCompanyName] = React.useState("")
  const [primaryContact, setPrimaryContact] = React.useState("")
  const [hasSecondaryContact, setHasSecondaryContact] = React.useState(false)
  const [secondaryContact, setSecondaryContact] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [secondaryPhone, setSecondaryPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [status, setStatus] = React.useState<LeadStatus>("New")
  const [selectedServices, setSelectedServices] = React.useState<string[]>([])
  const [customService, setCustomService] = React.useState("")
  const [isNoReminder, setIsNoReminder] = React.useState(false)
  const [reminderDate, setReminderDate] = React.useState(() => {
    const today = new Date()
    const d = String(today.getDate()).padStart(2, "0")
    const m = MONTH_NAMES_SHORT[today.getMonth()]
    const y = today.getFullYear()
    return `${d} ${m} ${y}`
  })
  const [reminderTime, setReminderTime] = React.useState("11:30 AM")
  const [reminderNotes, setReminderNotes] = React.useState("")
  const [caller, setCaller] = React.useState("")
  const [owner, setOwner] = React.useState("")
  const [managers, setManagers] = React.useState("")
  const [source, setSource] = React.useState("Social Media")
  const [customSource, setCustomSource] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [country, setCountry] = React.useState("India")
  const [state, setState] = React.useState("West Bengal")
  const [district, setDistrict] = React.useState("Paschim Medinipur")
  const [city, setCity] = React.useState("Midnapore")
  const [zip, setZip] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [vatNumber, setVatNumber] = React.useState("")
  const [gstNumber, setGstNumber] = React.useState("")
  const [currency, setCurrency] = React.useState("Keep it blank to use the default (INR - ₹)")
  const [relatedTo, setRelatedTo] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [unlockedLocally, setUnlockedLocally] = React.useState(false)

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    )
  }

  React.useEffect(() => {
    if (isOpen) {
      useAuthStore.getState().fetchCompanies?.().catch(() => {})
      useAuthStore.getState().fetchBranches?.().catch(() => {})
      if (user?.role === "Clients") {
        setTeamMembers([])
        return
      }

      getUsers("all").then((list) => {
        const isSuperAdmin = user?.role === "Super Admin"
        const userCompIds = user?.companyIds || (user?.companyId ? [user?.companyId] : ["tech"])

        const filteredByCompany = isSuperAdmin
          ? (list || [])
          : (list || []).filter((u) => {
              const uComps = u.companyIds || (u.companyId ? [u.companyId] : [])
              return uComps.some((c) => userCompIds.includes(c))
            })

        // Strictly team members / employees only — Super Admin and Admin cannot be assigned as team members
        const members = filteredByCompany
          .filter((u) => {
            const r = (u.role || "").toLowerCase().trim()
            return !r.includes("admin") && !r.includes("super") && !r.includes("client") && r !== "owner" && u.status !== "Inactive"
          })
          .map((u) => ({ id: u.id, name: u.name, role: u.role }))

        setTeamMembers(members)
      })
    }
  }, [isOpen, user])

  React.useEffect(() => {
    if (lead) {
      setType(lead.type || "Organization")
      setCompanyName(lead.name || "")
      setPrimaryContact(lead.primaryContact || "")
      const hasSec = !!(lead.secondaryContact || lead.secondaryPhone || lead.managers)
      setHasSecondaryContact(hasSec)
      setSecondaryContact(lead.secondaryContact || lead.managers || "")
      setPhone(lead.phone || "")
      setSecondaryPhone(lead.secondaryPhone || "")
      setEmail(lead.email || "")
      setStatus(lead.status || "New")
      setRelatedTo(lead.relatedTo || "")
      setSelectedCompanyId(lead.companyId || activeCompanyId || user?.companyId || "tech")
      setSelectedBranchId(lead.branchId || activeBranchId || user?.branchId || "")

      // Multi-service initialization (purely custom services)
      const rawSvcs = (lead.service || "").split(/,\s*/).map(s => s.trim()).filter(Boolean)
      setSelectedServices(rawSvcs)
      setCustomService("")

      // Reminder Date initialization
      const rawDate = lead.reminderDate || ""
      const parsedLeadDate = parseLeadDate(rawDate)
      if (!rawDate || !parsedLeadDate) {
        setIsNoReminder(true)
        const today = new Date()
        const d = String(today.getDate()).padStart(2, "0")
        const m = MONTH_NAMES_SHORT[today.getMonth()]
        const y = today.getFullYear()
        setReminderDate(`${d} ${m} ${y}`)
      } else {
        setIsNoReminder(false)
        setReminderDate(formatLeadReminderDate(rawDate))
      }

      // Reminder Time initialization
      setReminderTime(lead.reminderTime || "11:30 AM")

      setReminderNotes(lead.reminderNotes || "")
      setCaller(lead.caller || lead.owner || "")
      setOwner(lead.owner || "")
      setManagers(lead.managers || "")

      // Source & Custom Source initialization
      const leadSrc = lead.source || "Social Media"
      if (STANDARD_SOURCES.includes(leadSrc)) {
        setSource(leadSrc)
        setCustomSource("")
      } else {
        setSource("Others")
        setCustomSource(leadSrc)
      }

      setAddress(lead.address || "")
      setCountry(lead.country || "India")
      setState(lead.state || "West Bengal")
      setDistrict(lead.district || "Paschim Medinipur")
      setCity(lead.city || "Midnapore")
      setZip(lead.zip || "")
      setWebsite(lead.website || "")
      setVatNumber(lead.vatNumber || "")
      setGstNumber(lead.gstNumber || "")
      setCurrency(lead.currency || "Keep it blank to use the default (INR - ₹)")
    }
  }, [lead])

  React.useEffect(() => {
    setUnlockedLocally(false)
  }, [lead?.id, isOpen])

  const handleSave: any = createEditLeadModalHandler1(() => __ctrlRef.current);

  const handleUnlock = async () => {
    if (!lead) return
    try {
      const unlocked = await unlockLead(lead.id, user, lead.companyId || selectedCompanyId)
      setUnlockedLocally(true)
      if (unlocked.reminderDate && unlocked.reminderDate !== "None") {
        setReminderDate(formatLeadReminderDate(unlocked.reminderDate))
        setIsNoReminder(false)
      }
      onLeadUpdated(unlocked)
    } catch (err: any) {
      alert(err?.message || "Failed to unlock lead")
    }
  }

  const isWonOrLost = (lead?.status || "").toLowerCase().trim() === "won" || (lead?.status || "").toLowerCase().trim() === "lost"
  const isOverdue = lead ? isReminderDateOverdue(lead.reminderDate, lead.reminderTime) : false
  const isLeadExplicitlyUnlocked = Boolean(
    (lead as any)?.isExplicitlyUnlocked === true ||
    lead?.lockedReason?.includes("Unlocked") ||
    (lead as any)?.unlockedByAdmin === true ||
    (lead as any)?.unlockedByClient === true
  )
  const isEffectiveLocked = !unlockedLocally && Boolean(
    !isWonOrLost &&
    !isLeadExplicitlyUnlocked &&
    (lead?.isLocked || isOverdue)
  )

  if (!isOpen || !lead) return null

  
  __ctrl = { isOpen, lead, onClose, onLeadUpdated, onDeleteLead, user, companies, activeCompanyId, activeBranchId, branches, subBranches, isSuperOrAdmin, selectableCompanies, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, availableBranches, availableSubBranchesForBranch, handleCompanyChange, handleBranchChange, teamMembers, setTeamMembers, type, setType, companyName, setCompanyName, primaryContact, setPrimaryContact, hasSecondaryContact, setHasSecondaryContact, secondaryContact, setSecondaryContact, phone, setPhone, secondaryPhone, setSecondaryPhone, email, setEmail, status, setStatus, selectedServices, setSelectedServices, customService, setCustomService, isNoReminder, setIsNoReminder, reminderDate, setReminderDate, reminderTime, setReminderTime, reminderNotes, setReminderNotes, caller, setCaller, owner, setOwner, managers, setManagers, source, setSource, customSource, setCustomSource, address, setAddress, country, setCountry, state, setState, district, setDistrict, city, setCity, zip, setZip, website, setWebsite, vatNumber, setVatNumber, gstNumber, setGstNumber, currency, setCurrency, relatedTo, setRelatedTo, isSubmitting, setIsSubmitting, unlockedLocally, setUnlockedLocally, toggleService, handleSave, handleUnlock, isWonOrLost, isOverdue, isLeadExplicitlyUnlocked, isEffectiveLocked };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Edit Lead Details</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
              {status}
            </span>
            {isEffectiveLocked && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 flex items-center gap-1">
                🔒 LOCKED
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Locked Lead Alert Banner */}
        {isEffectiveLocked && (
          <div className="bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800 px-6 py-3 flex items-center justify-between gap-3 text-xs text-red-700 dark:text-red-300">
            <div className="flex items-center gap-2">
              <span className="text-base">🔒</span>
              <div>
                <p className="font-bold">Lead Auto-Locked</p>
                <p className="text-[11px] opacity-90">{lead.lockedReason || (isOverdue ? "Overdue: Lead reminder date expired." : "Daily status or reminder date update missed.")}</p>
              </div>
            </div>
            {canUserUnlockLead(user, lead) ? (
              <button
                type="button"
                onClick={handleUnlock}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md font-bold shadow-sm transition-colors text-xs whitespace-nowrap cursor-pointer"
              >
                🔓 {user?.role === "Clients" ? "Unlock My Lead" : "Unlock Lead"}
              </button>
            ) : (
              <span className="font-semibold italic text-[11px]">
                {isLeadClientPrivate(lead) ? "Only the creator client can unlock this lead" : "Only Admin can unlock"}
              </span>
            )}
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          <EditLeadModalSection1 ctrl={__ctrl} />

          <EditLeadModalSection2 ctrl={__ctrl} />

          <EditLeadModalSection3 ctrl={__ctrl} />

          {/* 3rd: District (Dist) with Search (Default: Paschim Medinipur) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Dist (District)</label>
            <div className="col-span-3">
              <SearchableSelect
                value={district}
                onChange={(val) => {
                  setDistrict(val)
                  const c = getCitiesForDistrict(state, val)
                  if (c && c.length > 0) {
                    setCity(c[0])
                  }
                }}
                options={getDistrictsForState(state)}
                placeholder="Select or search district..."
                searchPlaceholder="Search district or type custom..."
              />
            </div>
          </div>

          {/* 4th: City with Search (Default: Midnapore) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">City</label>
            <div className="col-span-3">
              <SearchableSelect
                value={city}
                onChange={(val) => setCity(val)}
                options={getCitiesForDistrict(state, district)}
                placeholder="Select or search city..."
                searchPlaceholder="Search city or type custom..."
              />
            </div>
          </div>

          {/* Postal / Zip Code (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-zinc-500 font-medium">Zip / PIN</label>
            <input
              type="text"
              placeholder="e.g. 721101"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="col-span-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 text-xs"
            />
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
          {onDeleteLead && lead && (
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to delete lead "${lead.name}"?`)) {
                  onDeleteLead(lead.id)
                  onClose()
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors shadow-2xs"
            >
              <Trash2 size={14} />
              <span>Delete Lead</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <X size={14} />
              <span>Close</span>
            </button>
            
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${
                isSubmitting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}
