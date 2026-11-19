"use client"

import * as React from "react"
import { X, Plus, Check, Calendar, Clock, Wrench, FileText, User as UserIcon, Tag, Building, MapPin } from "lucide-react"
import { Lead, LeadStatus, LeadType } from "../types"
import { addLead, parseLeadDate, formatLeadReminderDate, MONTH_NAMES_SHORT } from "../services/leadService"

// Helper to convert date string to "YYYY-MM-DD" for input[type="date"] (Zero UTC Timezone Shift)
import { formatDateForInput, formatDateForDisplay, formatTimeForInput, formatTimeForDisplay, type AddLeadModalProps, STANDARD_SOURCES } from "@/features/leads/components/addleadmodal-sections/AddLeadModalHelpers"
export * from "@/features/leads/components/addleadmodal-sections/AddLeadModalHelpers"

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
} from "./SearchableLocationSelect"
import { AddLeadModalSection1 } from "@/features/leads/components/addleadmodal-sections/AddLeadModalSection1"
import { AddLeadModalSection2 } from "@/features/leads/components/addleadmodal-sections/AddLeadModalSection2"
import { AddLeadModalSection3 } from "@/features/leads/components/addleadmodal-sections/AddLeadModalSection3"
import { AddLeadModalSection4 } from "@/features/leads/components/addleadmodal-sections/AddLeadModalSection4"
import { createAddLeadModalHandler1 } from "@/features/leads/hooks/addleadmodal-hooks/createAddLeadModalHandler1.hooks"


export function AddLeadModal({ isOpen, onClose, onLeadAdded }: AddLeadModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches } = useAuthStore()
  const isSuperOrAdmin = user?.role === "Super Admin" || user?.role === "Admin"

  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(companies, activeCompanyId, user, branches, subBranches)
  }, [companies, activeCompanyId, user, branches, subBranches])

  const isBranchLocked = Boolean(user?.branchId && user?.role !== "Super Admin")

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(() => {
    if (activeCompanyId && activeCompanyId !== "all") return activeCompanyId
    return user?.companyId || "tech"
  })
  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(
    user?.branchId || activeBranchId || ""
  )
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>(
    user?.subBranchId || activeSubBranchId || ""
  )

  const hasInitializedRef = React.useRef(false)

  React.useEffect(() => {
    if (!isOpen) {
      hasInitializedRef.current = false
      return
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true

      useAuthStore.getState().fetchCompanies?.().catch(() => {})
      useAuthStore.getState().fetchBranches?.().catch(() => {})
      useAuthStore.getState().fetchSubBranches?.().catch(() => {})

      const currentComp = activeCompanyId && activeCompanyId !== "all" 
        ? activeCompanyId 
        : (user?.companyId || selectableCompanies[0]?.id || "tech")
      const matchedCompObj = selectableCompanies.find(c => isMatchingCompany(c, currentComp)) || selectableCompanies[0]
      const finalCompId = matchedCompObj?.id || currentComp
      setSelectedCompanyId(finalCompId)

      if (user?.branchId && user?.role !== "Super Admin") {
        setSelectedBranchId(user.branchId)
      } else {
        setSelectedBranchId(activeBranchId || "")
      }
    }
  }, [isOpen])

  const availableBranches = React.useMemo(() => {
    if (!branches || !Array.isArray(branches)) return []
    const targetComp = selectedCompanyId || activeCompanyId || user?.companyId || "tech"
    if (targetComp && targetComp !== "all") {
      return branches.filter((b) =>
        isMatchingCompany({ id: b.companyId || (b as any).company_id, slug: b.companyId } as any, targetComp)
      )
    }
    return branches
  }, [branches, selectedCompanyId, activeCompanyId, user?.companyId])

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
    if (!isBranchLocked) {
      setSelectedBranchId("")
      setSelectedSubBranchId("")
    }
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
  const [isNoReminder, setIsNoReminder] = React.useState(true)
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

  // Existing Client & Future Project Timeline
  const [leadMode, setLeadMode] = React.useState<"new" | "existing_client">("new")
  const [availableClients, setAvailableClients] = React.useState<ClientItem[]>([])
  const [selectedClientId, setSelectedClientId] = React.useState<string>("")
  const [clientSearchQuery, setClientSearchQuery] = React.useState<string>("")
  const [isClientDropdownOpen, setIsClientDropdownOpen] = React.useState(false)
  const [selectedClient, setSelectedClient] = React.useState<ClientItem | null>(null)
  const [expectedTimeline, setExpectedTimeline] = React.useState<string>("")
  const [expectedStartDate, setExpectedStartDate] = React.useState<string>("")
  const [projectRequirement, setProjectRequirement] = React.useState<string>("")

  const applyTimelinePreset = (preset: "this_month" | "next_month" | "after_2_months" | "next_quarter") => {
    const now = new Date()
    let targetMonthIndex: number
    let targetYear: number = now.getFullYear()

    if (preset === "this_month") {
      targetMonthIndex = now.getMonth()
    } else if (preset === "next_month") {
      targetMonthIndex = now.getMonth() + 1
    } else if (preset === "after_2_months") {
      targetMonthIndex = now.getMonth() + 2
    } else {
      targetMonthIndex = now.getMonth() + 3
    }

    const d = new Date(targetYear, targetMonthIndex, 1)
    const monthName = d.toLocaleString("en-US", { month: "long" })
    const monthShort = MONTH_NAMES_SHORT[d.getMonth()]
    const yr = d.getFullYear()

    let timelineLabel = ""
    if (preset === "this_month") timelineLabel = `This Month (${monthShort} ${yr})`
    else if (preset === "next_month") timelineLabel = `Next Month (${monthShort} ${yr})`
    else if (preset === "after_2_months") timelineLabel = `After 2 Months (${monthShort} ${yr})`
    else timelineLabel = `Next Quarter (${monthShort} ${yr})`

    setExpectedTimeline(timelineLabel)
    setExpectedStartDate(`${yr}-${String(d.getMonth() + 1).padStart(2, "0")}-01`)

    // Follow-up reminder auto-scheduled 3 days before that month starts, or in 2 days if this month
    let reminderTarget: Date
    if (preset === "this_month") {
      reminderTarget = new Date(now.getTime() + 2 * 86400000)
    } else {
      reminderTarget = new Date(d.getTime() - 3 * 86400000)
      if (reminderTarget.getTime() <= now.getTime()) {
        reminderTarget = new Date(now.getTime() + 86400000)
      }
    }

    const remD = String(reminderTarget.getDate()).padStart(2, "0")
    const remM = MONTH_NAMES_SHORT[reminderTarget.getMonth()]
    const remY = reminderTarget.getFullYear()

    setIsNoReminder(false)
    setReminderDate(`${remD} ${remM} ${remY}`)
    setReminderTime("11:30 AM")

    const clientNameStr = selectedClient?.name || companyName || "Client"
    const scopeStr = projectRequirement.trim() || "repeat project"
    setReminderNotes(`Follow up with ${clientNameStr} regarding ${scopeStr} planned for ${monthName} ${yr}`)
  }

  const handleSelectExistingClient = (c: ClientItem) => {
    setSelectedClient(c)
    setSelectedClientId(c.id)
    setCompanyName(c.name || "")
    setPrimaryContact(c.primaryContact || c.name || "")
    setPhone(c.phone || "")
    setEmail(c.email || "")
    if (c.address) setAddress(c.address)
    if (c.city) setCity(c.city)
    if (c.district) setDistrict(c.district)
    if (c.state) setState(c.state)
    if (c.zip) setZip(c.zip)
    if (c.country) setCountry(c.country)
    if (c.gstNumber || c.vatNumber) setGstNumber(c.gstNumber || c.vatNumber || "")
    setSource("Existing Client")
    if (c.type) setType(c.type)
    if (c.companyId) setSelectedCompanyId(c.companyId)
    if (c.branchId) setSelectedBranchId(c.branchId)
    setIsClientDropdownOpen(false)
  }

  const resetForm = React.useCallback(() => {
    setLeadMode("new")
    setSelectedClientId("")
    setSelectedClient(null)
    setClientSearchQuery("")
    setIsClientDropdownOpen(false)
    setExpectedTimeline("")
    setExpectedStartDate("")
    setProjectRequirement("")
    setType("Organization")
    setCompanyName("")
    setPrimaryContact("")
    setHasSecondaryContact(false)
    setSecondaryContact("")
    setPhone("")
    setSecondaryPhone("")
    setEmail("")
    setStatus("New")
    setSelectedServices([])
    setCustomService("")
    setIsNoReminder(true)
    const today = new Date()
    const d = String(today.getDate()).padStart(2, "0")
    const m = MONTH_NAMES_SHORT[today.getMonth()]
    const y = today.getFullYear()
    setReminderDate(`${d} ${m} ${y}`)
    setReminderTime("11:30 AM")
    setReminderNotes("")
    setManagers("")
    setSource("Social Media")
    setCustomSource("")
    setAddress("")
    setCountry("India")
    setState("West Bengal")
    setDistrict("Paschim Medinipur")
    setCity("Midnapore")
    setZip("")
    setWebsite("")
    setVatNumber("")
    setGstNumber("")
    setCurrency("Keep it blank to use the default (INR - ₹)")
  }, [])

  const toggleService = (svc: string) => {
    setSelectedServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc]
    )
  }

  React.useEffect(() => {
    if (isOpen) {
      resetForm()

      getClients("all").then((cList) => {
        setAvailableClients(cList || [])
      }).catch(() => {})

      if (user?.role === "Clients") {
        setTeamMembers([])
        setCaller("None")
        setOwner("None")
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

        setCaller("None")
        setOwner("None")
      })
    }
  }, [isOpen, user, resetForm])

  if (!isOpen) return null

  const handleSave: any = createAddLeadModalHandler1(() => __ctrlRef.current);

  
  __ctrl = { isOpen, onClose, onLeadAdded, user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, isSuperOrAdmin, selectableCompanies, isBranchLocked, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, hasInitializedRef, availableBranches, availableSubBranchesForBranch, handleCompanyChange, handleBranchChange, teamMembers, setTeamMembers, type, setType, companyName, setCompanyName, primaryContact, setPrimaryContact, hasSecondaryContact, setHasSecondaryContact, secondaryContact, setSecondaryContact, phone, setPhone, secondaryPhone, setSecondaryPhone, email, setEmail, status, setStatus, selectedServices, setSelectedServices, customService, setCustomService, isNoReminder, setIsNoReminder, reminderDate, setReminderDate, reminderTime, setReminderTime, reminderNotes, setReminderNotes, caller, setCaller, owner, setOwner, managers, setManagers, source, setSource, customSource, setCustomSource, address, setAddress, country, setCountry, state, setState, district, setDistrict, city, setCity, zip, setZip, website, setWebsite, vatNumber, setVatNumber, gstNumber, setGstNumber, currency, setCurrency, relatedTo, setRelatedTo, isSubmitting, setIsSubmitting, leadMode, setLeadMode, availableClients, setAvailableClients, selectedClientId, setSelectedClientId, clientSearchQuery, setClientSearchQuery, isClientDropdownOpen, setIsClientDropdownOpen, selectedClient, setSelectedClient, expectedTimeline, setExpectedTimeline, expectedStartDate, setExpectedStartDate, projectRequirement, setProjectRequirement, applyTimelinePreset, handleSelectExistingClient, resetForm, toggleService, handleSave };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] my-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Add lead</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          <AddLeadModalSection1 ctrl={__ctrl} />
          
          <AddLeadModalSection2 ctrl={__ctrl} />

          <AddLeadModalSection3 ctrl={__ctrl} />

          <AddLeadModalSection4 ctrl={__ctrl} />

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
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-zinc-50/50 dark:bg-zinc-800/40 border-t border-zinc-100 dark:border-zinc-800">
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
                <span>Save</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
