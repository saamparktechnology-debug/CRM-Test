"use client"

import * as React from "react"
import { useMasterBundle } from "@/features/masters/hooks/useMasters"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, HelpCircle, User, Building, MapPin } from "lucide-react"
import { ClientItem } from "../types"
import { getUsers } from "@/features/users/services/userService"
import { useAuthStore, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { sendClientWelcomeEmailNotification } from "@/services/emailNotificationService"
import { formatDisplayEmail, getClientCategories, saveClientCategory, DEFAULT_CLIENT_CATEGORIES } from "../services/clientService"
import { lookupPincode } from "@/lib/pincodeService"
import { AddClientModalSection1 } from "@/features/clients/components/addclientmodal-sections/AddClientModalSection1"
import { AddClientModalSection2 } from "@/features/clients/components/addclientmodal-sections/AddClientModalSection2"


import { type AddClientModalProps } from "@/features/clients/components/addclientmodal-sections/AddClientModalHelpers"
export * from "@/features/clients/components/addclientmodal-sections/AddClientModalHelpers"

export function AddClientModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: AddClientModalProps) {
  const { data: masterBundle } = useMasterBundle()
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
    initialData?.branchId || user?.branchId || activeBranchId || ""
  )
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>(
    initialData?.subBranchId || user?.subBranchId || activeSubBranchId || ""
  )

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
    const normB = String(selectedBranchId).toLowerCase().trim()
    const targetB = availableBranches.find(b => String(b.id).toLowerCase().trim() === normB || String(b.name).toLowerCase().trim() === normB)
    const bId = targetB ? String(targetB.id).toLowerCase().trim() : normB
    const bName = targetB ? String(targetB.name).toLowerCase().trim() : ""

    return subBranches.filter(sb => {
      const pId = String(sb.parentBranchId || (sb as any).branch_id || (sb as any).branchId || "").toLowerCase().trim()
      const pName = String((sb as any).branchName || (sb as any).branch_name || "").toLowerCase().trim()
      return pId === bId || (bName && (pId === bName || pName === bName)) || pName === bId
    })
  }, [selectedBranchId, subBranches, availableBranches])

  const handleCompanyChange = (cId: string) => {
    setSelectedCompanyId(cId)
    if (!isBranchLocked) {
      setSelectedBranchId("")
      setSelectedSubBranchId("")
    }
  }

  const handleBranchChange = (bId: string) => {
    setSelectedBranchId(bId)
    setSelectedSubBranchId("")
  }

  const [type, setType] = React.useState<"Organization" | "Person">("Organization")
  const [companyName, setCompanyName] = React.useState("")
  const [designation, setDesignation] = React.useState("Proprietor")
  const [customDesignation, setCustomDesignation] = React.useState("")
  const [owner, setOwner] = React.useState("")
  const [managers, setManagers] = React.useState("")
  const [address, setAddress] = React.useState("")
  const [district, setDistrict] = React.useState("")
  const [city, setCity] = React.useState("")
  const [state, setState] = React.useState("")
  const [zip, setZip] = React.useState("")
  const [pincodePlaces, setPincodePlaces] = React.useState<string[]>([])
  const [pincodeDistricts, setPincodeDistricts] = React.useState<string[]>([])
  const [pincodeStates, setPincodeStates] = React.useState<string[]>([])
  const [isPincodeLoading, setIsPincodeLoading] = React.useState(false)
  const [country, setCountry] = React.useState("India")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [website, setWebsite] = React.useState("")
  const [vatNumber, setVatNumber] = React.useState("")
  const [gstNumber, setGstNumber] = React.useState("")
  
  // Category / Level State & Dynamic Creator
  const [availableCategories, setAvailableCategories] = React.useState<string[]>(DEFAULT_CLIENT_CATEGORIES)
  const [clientGroup, setClientGroup] = React.useState("Level 1")
  const [isAddingCategory, setIsAddingCategory] = React.useState(false)
  const [newCategoryInput, setNewCategoryInput] = React.useState("")

  const [currency, setCurrency] = React.useState("INR")
  const [currencySymbol, setCurrencySymbol] = React.useState("₹")
  const [label, setLabel] = React.useState("Corporate")
  const [disableOnlinePayment, setDisableOnlinePayment] = React.useState(false)
  const [ownersList, setOwnersList] = React.useState<{ id: string; name: string; role?: string }[]>([])

  React.useEffect(() => {
    if (isOpen) {
      getUsers("all").then((users) => {
        const staff = users
          .filter((u) => {
            const role = (u.role || "").toLowerCase().trim()
            return !role.includes("admin") && !role.includes("super") && !role.includes("client") && role !== "owner" && u.status !== "Inactive"
          })
          .map((u) => ({ id: u.id, name: u.name, role: u.role }))

        setOwnersList(staff)

        if (!owner) {
          setOwner(initialData?.owner || (staff.length > 0 ? staff[0].name : "Team"))
        }
      }).catch(() => {})

      if (initialData) {
        setSelectedCompanyId(initialData.companyId || activeCompanyId || "tech")
        setSelectedBranchId(initialData.branchId || "")
        setSelectedSubBranchId(initialData.subBranchId || "")
        setCompanyName(initialData.name || "")
        setDesignation(initialData.designation || "Proprietor")
        setCustomDesignation("")
        setPhone(initialData.phone || "")
        setEmail(formatDisplayEmail(initialData.email) || "")
        setClientGroup(initialData.group || "VIP")
        setLabel(initialData.label || "Corporate")
        setOwner(initialData.owner || user?.name || "")
        setManagers(initialData.managers || "")
        setAddress(initialData.address || "")
        setDistrict(initialData.district || "")
        setCity(initialData.city || "")
        setState(initialData.state || "")
        setZip(initialData.zip || "")
        setCountry(initialData.country || "India")
        setWebsite(initialData.website || "")
        setVatNumber(initialData.vatNumber || "")
        setGstNumber(initialData.gstNumber || "")
        setCurrency(initialData.currency || "INR")
        setDisableOnlinePayment(!!initialData.disableOnlinePayment)
      } else {
        setCompanyName("")
        setDesignation("Proprietor")
        setCustomDesignation("")
        setPhone("")
        setEmail("")
        setCountry("India")
        setDistrict("")
        setCity("")
        setState("")
        setZip("")
        setOwner(user?.name || "")
        setManagers("")
        setAddress("")
        setWebsite("")
        setVatNumber("")
        setGstNumber("")
        setClientGroup("Level 1")
        setLabel("Corporate")
        setDisableOnlinePayment(false)
      }

      getClientCategories(activeCompanyId || undefined).then((cats) => {
        if (Array.isArray(cats) && cats.length > 0) {
          setAvailableCategories(cats)
          if (initialData?.group) {
            setClientGroup(initialData.group)
          } else if (!initialData) {
            setClientGroup(cats[0])
          }
        }
      }).catch(() => {})
    }
  }, [initialData, isOpen, user, activeCompanyId])

  const handleAddCategory = async () => {
    if (!newCategoryInput.trim()) return
    const trimmed = newCategoryInput.trim()
    const updated = await saveClientCategory(trimmed, activeCompanyId || undefined)
    setAvailableCategories(updated)
    setClientGroup(trimmed)
    setNewCategoryInput("")
    setIsAddingCategory(false)
  }

  if (!isOpen) return null

  const handlePincodeChange = async (pin: string) => {
    setZip(pin)
    const cleanPin = pin.trim().replace(/\D/g, "")
    if (cleanPin.length === 6) {
      setIsPincodeLoading(true)
      const res = await lookupPincode(cleanPin)
      setIsPincodeLoading(false)
      if (res && res.status === "Success") {
        setPincodePlaces(res.places || [])
        setPincodeDistricts(res.districts || [])
        setPincodeStates(res.states || [])
        if (res.state) setState(res.state)
        if (res.district) setDistrict(res.district)
        if (res.places && res.places.length > 0) setCity(res.places[0])
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyName.trim()) return

    const targetBranchObj = availableBranches.find(b => String(b.id).toLowerCase().trim() === String(selectedBranchId).toLowerCase().trim() || String(b.name).toLowerCase().trim() === String(selectedBranchId).toLowerCase().trim())
    const finalBranchId = targetBranchObj ? String(targetBranchObj.id) : (selectedBranchId || undefined)
    const finalBranchName = targetBranchObj?.name || (finalBranchId ? user?.branchName : undefined)

    const targetSubBranchObj = selectedSubBranchId ? subBranches?.find(sb => String(sb.id).toLowerCase().trim() === String(selectedSubBranchId).toLowerCase().trim()) : undefined
    const finalSubBranchId = selectedSubBranchId || undefined
    const finalSubBranchName = targetSubBranchObj?.name || undefined

    const effectiveDesignation = designation === "Other" ? (customDesignation.trim() || "Client") : designation

    const newClient: ClientItem = {
      id: initialData ? initialData.id : `cli_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: companyName.trim(),
      primaryContact: companyName.trim(),
      designation: effectiveDesignation,
      phone: phone.trim(),
      email: email.trim(),
      group: clientGroup || "VIP",
      label: label || "Corporate",
      labelColor: "#d8b4fe",
      projectsCount: initialData?.projectsCount || 0,
      totalInvoiced: initialData?.totalInvoiced || "₹0.00",
      paymentReceived: initialData?.paymentReceived || "₹0.00",
      due: initialData?.due || "₹0.00",
      type,
      owner: owner || "Admin",
      managers,
      address,
      district,
      city,
      state,
      zip,
      country,
      vatNumber,
      gstNumber,
      currency,
      disableOnlinePayment,
      website,
      createdAt: initialData?.createdAt || Date.now(),
      branchId: finalBranchId,
      branchName: finalBranchName,
      subBranchId: finalSubBranchId,
      subBranchName: finalSubBranchName,
      companyId: selectedCompanyId || activeCompanyId || user?.companyId || "tech",
    }

    onSave(newClient)

    if (!initialData && newClient.email) {
      sendClientWelcomeEmailNotification(newClient).catch(() => null)
    }

    onClose()
  }



  
  __ctrl = { isOpen, onClose, onSave, initialData, user, companies, activeCompanyId, activeBranchId, activeSubBranchId, branches, subBranches, isSuperOrAdmin, selectableCompanies, isBranchLocked, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, availableBranches, availableSubBranchesForBranch, handleCompanyChange, handleBranchChange, type, setType, companyName, setCompanyName, designation, setDesignation, customDesignation, setCustomDesignation, owner, setOwner, managers, setManagers, address, setAddress, district, setDistrict, city, setCity, state, setState, zip, setZip, pincodePlaces, setPincodePlaces, pincodeDistricts, setPincodeDistricts, pincodeStates, setPincodeStates, isPincodeLoading, setIsPincodeLoading, country, setCountry, phone, setPhone, email, setEmail, website, setWebsite, vatNumber, setVatNumber, gstNumber, setGstNumber, availableCategories, setAvailableCategories, clientGroup, setClientGroup, isAddingCategory, setIsAddingCategory, newCategoryInput, setNewCategoryInput, currency, setCurrency, currencySymbol, setCurrencySymbol, label, setLabel, disableOnlinePayment, setDisableOnlinePayment, ownersList, setOwnersList, handleAddCategory, handlePincodeChange, handleSubmit };
  __ctrlRef.current = __ctrl;
return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto scrollbar-hide"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-medium text-slate-700 dark:text-slate-200">
              {initialData ? "Edit client" : "Add client"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs md:text-sm">
            <AddClientModalSection1 ctrl={__ctrl} />

            <AddClientModalSection2 ctrl={__ctrl} />

            {/* Currency - Default INR */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="INR">Keep it blank to use the default (INR - ₹)</option>
                {(masterBundle?.options?.["currency"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Currency Symbol */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Currency Symbol</label>
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="Keep it blank to use the default (₹)"
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Labels */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              <label className="text-slate-600 dark:text-slate-400 font-medium">Labels</label>
              <select
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="md:col-span-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(masterBundle?.options?.["client_category"] || []).map((opt) => (
                  <option key={opt.id} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Disable online payment */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center pt-1">
              <label className="text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
                Disable online payment <HelpCircle size={13} className="text-slate-400" />
              </label>
              <div className="md:col-span-3">
                <input
                  type="checkbox"
                  checked={disableOnlinePayment}
                  onChange={(e) => setDisableOnlinePayment(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Modal Controls */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <X size={14} /> Close
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <Check size={14} /> Save & continue
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 transition-colors shadow-xs"
              >
                <Check size={14} /> Save
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
