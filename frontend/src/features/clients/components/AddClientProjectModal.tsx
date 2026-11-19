"use client"

import * as React from "react"
import { 
  X, Check, DollarSign, Calculator, UserCheck, Users, Calendar, Briefcase, FileText, 
  Coins, RefreshCw, Layers, CreditCard, Building2, Mail, Phone, MapPin, 
  Plus, Trash2, Tag, ChevronDown, ChevronUp, Sparkles, Search, Receipt
} from "lucide-react"


import { useRouter } from "next/navigation"

import { ClientItem } from "../types"
import { getUsers } from "@/features/users/services/userService"
import { addProject } from "@/features/projects/services/projectService"
import { addInvoice, getInvoices, generateInvoiceNumber, InvoiceLineItem, AppliedDiscount } from "@/features/invoice/services/invoiceService"
import { addOrder } from "@/features/orders/services/orderService"
import { addPayment } from "@/features/payments/services/paymentService"
import { addSubscription, saveInstallmentRecord } from "@/features/subscriptions/services/subscriptionService"
import { taskService } from "@/features/tasks/services/taskService"
import { saveStoredClient, getClients, formatDisplayEmail } from "../services/clientService"
import { useAuthStore, getSelectableCompanies } from "@/store/useAuthStore"
import { sendInvoiceDetailsEmailNotification, sendPaymentReceiptEmailNotification } from "@/services/emailNotificationService"
import { lookupPincode } from "@/lib/pincodeService"
import { AddClientProjectModalSection1 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection1"
import { AddClientProjectModalSection2 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection2"
import { AddClientProjectModalSection3 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection3"
import { AddClientProjectModalSection4 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection4"
import { AddClientProjectModalSection5 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection5"
import { AddClientProjectModalSection6 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection6"
import { AddClientProjectModalSection7 } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalSection7"


import { type AddClientProjectModalProps, type ServiceFormItem, type FormDiscountItem, type AssignedMemberAllocation, SERVICE_PRESETS } from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalHelpers"
export * from "@/features/clients/components/addclientprojectmodal-sections/AddClientProjectModalHelpers"
import { createAddClientProjectModalAction20 } from "@/features/clients/hooks/addclientprojectmodal-hooks/createAddClientProjectModalAction20.hooks"
import { runAddClientProjectModalEffect50 } from "@/features/clients/hooks/addclientprojectmodal-hooks/runAddClientProjectModalEffect50.hooks"



export function AddClientProjectModal({
  isOpen,
  client,
  initialMode,
  onClose,
  onProjectCreated,
  onInvoiceCreated,
}: AddClientProjectModalProps) {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const router = useRouter()
  const { user, activeCompanyId, activeBranchId, branches, subBranches, companies } = useAuthStore()

  const [selectedClient, setSelectedClient] = React.useState<ClientItem | null>(client)
  const [allAvailableClients, setAllAvailableClients] = React.useState<ClientItem[]>([])
  const [clientSearchText, setClientSearchText] = React.useState("")
  const [isClientSearchDropdownOpen, setIsClientSearchDropdownOpen] = React.useState(false)

  const effectiveClient = selectedClient || client

  const filteredSearchClients = React.useMemo(() => {
    if (!clientSearchText.trim()) return allAvailableClients
    const q = clientSearchText.toLowerCase().trim()
    return allAvailableClients.filter(c => 
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.primaryContact && c.primaryContact.toLowerCase().includes(q))
    )
  }, [allAvailableClients, clientSearchText])

  const handleSelectClient = (c: ClientItem) => {
    setSelectedClient(c)
    setClientDesignation(c.designation || "Proprietor")
    setClientContactPersonName(c.primaryContact || "")
    setClientEmail(formatDisplayEmail(c.email) || "")
    setClientPhone(c.phone || "")
    setClientAddress(c.address || "")
    setClientCity(c.city || "")
    setClientState(c.state || "")
    setClientGst(c.gstNumber || c.vatNumber || "")
    setIsClientSearchDropdownOpen(false)
  }
  
  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(companies, activeCompanyId, user, branches, subBranches)
  }, [companies, activeCompanyId, user, branches, subBranches])

  const [selectedCompanyId, setSelectedCompanyId] = React.useState<string>(() => {
    if (activeCompanyId && activeCompanyId !== "all") return activeCompanyId
    return user?.companyId || "tech"
  })

  // Sync selectedCompanyId when selectableCompanies changes
  React.useEffect(() => {
    if (selectableCompanies.length > 0 && !selectableCompanies.some(c => c.id === selectedCompanyId || c.slug === selectedCompanyId)) {
      setSelectedCompanyId(selectableCompanies[0].id || selectableCompanies[0].slug || "tech")
    }
  }, [selectableCompanies, selectedCompanyId])

  const [selectedBranchId, setSelectedBranchId] = React.useState<string>(activeBranchId || user?.branchId || "")
  const [selectedSubBranchId, setSelectedSubBranchId] = React.useState<string>("")
  const isBranchLocked = Boolean(user?.branchId && user?.role !== "Super Admin")

  const availableBranches = React.useMemo(() => {
    return (branches || []).filter((b: any) => {
      if (!b) return false
      if (!selectedCompanyId || selectedCompanyId === "all") return true
      const bComp = String(b.companyId || b.company_id || "").toLowerCase().trim()
      const selComp = String(selectedCompanyId).toLowerCase().trim()
      return bComp === selComp || (selComp === "tech" && (bComp === "1" || !bComp)) || (selComp === "consultancy" && bComp === "2")
    })
  }, [branches, selectedCompanyId])

  const availableSubBranches = React.useMemo(() => {
    return (subBranches || []).filter((sb: any) => {
      if (!sb) return false
      if (!selectedCompanyId || selectedCompanyId === "all") return true
      const sbComp = String(sb.companyId || sb.company_id || "").toLowerCase().trim()
      const selComp = String(selectedCompanyId).toLowerCase().trim()
      return sbComp === selComp || (selComp === "tech" && (sbComp === "1" || !sbComp)) || (selComp === "consultancy" && sbComp === "2")
    })
  }, [subBranches, selectedCompanyId])

  const handleCompanyChange = (comp: string) => {
    setSelectedCompanyId(comp)
    setSelectedSubBranchId("")
    if (!isBranchLocked) {
      setSelectedBranchId("")
    }
  }

  const [creationMode, setCreationMode] = React.useState<"project_and_invoice" | "invoice_only">(initialMode || "project_and_invoice")
  const [projectTitle, setProjectTitle] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [customCategory, setCustomCategory] = React.useState("")
  const [isCustomCategory, setIsCustomCategory] = React.useState(false)

  const STANDARD_CATEGORIES = [
    "Website Development",
    "Software Development",
    "Android / iOS App",
    "Digital Marketing & SEO",
    "UI/UX & Graphics Design",
    "Cloud & Domain Hosting",
    "Print & Media Works",
    "General Consulting (Non-GST)",
  ]

  const effectiveCategory = (isCustomCategory || category === "custom")
    ? (customCategory.trim() || "Custom Category")
    : category

  const handleCategorySelect = (val: string) => {
    if (val === "custom") {
      setIsCustomCategory(true)
      setCategory("custom")
      if (!projectTitle || STANDARD_CATEGORIES.includes(projectTitle) || projectTitle === category) {
        if (customCategory.trim()) {
          setProjectTitle(customCategory.trim())
        }
      }
    } else {
      setIsCustomCategory(false)
      setCategory(val)
      if (!projectTitle || STANDARD_CATEGORIES.includes(projectTitle) || projectTitle === customCategory || projectTitle === category) {
        setProjectTitle(val)
      }
    }
  }

  const handleCustomCategoryChange = (val: string) => {
    setCustomCategory(val)
    if (!projectTitle || STANDARD_CATEGORIES.includes(projectTitle) || projectTitle === customCategory || projectTitle === category) {
      setProjectTitle(val)
    }
  }
  const [billedByAdmin, setBilledByAdmin] = React.useState(user?.name || "Admin")
  const [assignedAllocations, setAssignedAllocations] = React.useState<AssignedMemberAllocation[]>([])
  const assignedMembers = React.useMemo(() => assignedAllocations.map(a => a.name), [assignedAllocations])
  const [startDate, setStartDate] = React.useState(new Date().toISOString().split("T")[0])
  const [deadline, setDeadline] = React.useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 1)
    return d.toISOString().split("T")[0]
  })

  // 1. Dynamic Multi-Services State
  const [serviceItems, setServiceItems] = React.useState<ServiceFormItem[]>([
    {
      id: `svc_${Date.now()}`,
      serviceName: "",
      sacCode: "998313",
      qty: 1,
      unit: "Project",
      rate: "",
      charges: [],
      gstRate: 18,
    }
  ])

  // 2. Named Multi-Discounts State
  const [discountsList, setDiscountsList] = React.useState<FormDiscountItem[]>([])

  // 3. Payment Structure State
  const [paymentModel, setPaymentModel] = React.useState<"full" | "part" | "advance" | "subscription">("full")
  const [advanceAmount, setAdvanceAmount] = React.useState<number | "">("")
  const [partInitialPayment, setPartInitialPayment] = React.useState<number | "">("")
  const [installmentsCount, setInstallmentsCount] = React.useState<number>(3)
  const [subscriptionMonths, setSubscriptionMonths] = React.useState<number>(3)
  const [partPayTiming, setPartPayTiming] = React.useState<"pay_now" | "pay_after_3_months">("pay_now")
  const [billingCycle, setBillingCycle] = React.useState<"Monthly" | "Quarterly" | "Yearly">("Monthly")
  const [autoCreateSubscription, setAutoCreateSubscription] = React.useState<boolean>(true)
  const [paymentStatus, setPaymentStatus] = React.useState<"Payment Pending" | "Paid">("Paid")
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Client Details State (Prefilled & Editable)
  const [clientDesignation, setClientDesignation] = React.useState(client?.designation || "Proprietor")
  const [clientCustomDesignation, setClientCustomDesignation] = React.useState("")
  const [clientContactPersonName, setClientContactPersonName] = React.useState(client?.primaryContact || "")
  const [clientEmail, setClientEmail] = React.useState(client?.email || "")
  const [clientPhone, setClientPhone] = React.useState(client?.phone || "")
  const [clientAddress, setClientAddress] = React.useState(client?.address || "")
  const [clientDistrict, setClientDistrict] = React.useState(client?.district || "")
  const [clientCity, setClientCity] = React.useState(client?.city || "")
  const [clientState, setClientState] = React.useState(client?.state || "")
  const [clientZip, setClientZip] = React.useState(client?.zip || "")
  const [clientGst, setClientGst] = React.useState(client?.gstNumber || client?.vatNumber || "")
  const [pincodePlaces, setPincodePlaces] = React.useState<string[]>([])
  const [pincodeDistricts, setPincodeDistricts] = React.useState<string[]>([])
  const [pincodeStates, setPincodeStates] = React.useState<string[]>([])
  const [isPincodeLoading, setIsPincodeLoading] = React.useState(false)

  const handlePincodeChange = async (pin: string) => {
    setClientZip(pin)
    const cleanPin = pin.trim().replace(/\D/g, "")
    if (cleanPin.length === 6) {
      setIsPincodeLoading(true)
      const res = await lookupPincode(cleanPin)
      setIsPincodeLoading(false)
      if (res && res.status === "Success") {
        setPincodePlaces(res.places || [])
        setPincodeDistricts(res.districts || [])
        setPincodeStates(res.states || [])
        if (res.state) setClientState(res.state)
        if (res.district) setClientDistrict(res.district)
        if (res.places && res.places.length > 0) setClientCity(res.places[0])
      }
    }
  }

  const [adminsList, setAdminsList] = React.useState<{ id: string; name: string }[]>([])
  const [teamsList, setTeamsList] = React.useState<{ id: string; name: string; email?: string; role?: string; avatar?: string }[]>([])
  
  // Searchable Team Dropdown State
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = React.useState(false)
  const [teamSearchQuery, setTeamSearchQuery] = React.useState("")
  const teamDropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target as Node)) {
        setIsTeamDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredTeamsList = React.useMemo(() => {
    if (!teamSearchQuery.trim()) return teamsList
    const q = teamSearchQuery.toLowerCase().trim()
    return teamsList.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.role && t.role.toLowerCase().includes(q)) ||
        (t.email && t.email.toLowerCase().includes(q))
    )
  }, [teamsList, teamSearchQuery])

  React.useEffect(() => runAddClientProjectModalEffect50(() => __ctrlRef.current), [isOpen, user, client, initialMode]);

  const handleModeChange = (mode: "project_and_invoice" | "invoice_only") => {
    setCreationMode(mode)
    if (mode === "invoice_only") {
      setAssignedAllocations([])
    } else if (assignedAllocations.length === 0 && teamsList.length > 0) {
      setAssignedAllocations([
        {
          id: String(teamsList[0].id),
          name: teamsList[0].name,
          email: teamsList[0].email || "",
          role: teamsList[0].role || "Developer",
          avatar: teamsList[0].avatar,
          payoutType: "percentage",
          payoutValue: "",
        }
      ])
    }
  }

  // --- Dynamic Service Management ---
  const handleAddService = (preset?: typeof SERVICE_PRESETS[0]) => {
    const newItem: ServiceFormItem = {
      id: `svc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      serviceName: preset?.name || "",
      sacCode: preset?.sac || "998313",
      qty: 1,
      unit: preset?.unit || "Project",
      rate: "",
      charges: [],
      gstRate: preset !== undefined ? preset.gst : 18,
    }
    setServiceItems(prev => [...prev, newItem])
  }

  const handleRemoveService = (id: string) => {
    if (serviceItems.length <= 1) {
      alert("At least one service is required.")
      return
    }
    setServiceItems(prev => prev.filter(s => s.id !== id))
  }

  const handleUpdateService = (id: string, field: keyof ServiceFormItem, value: any) => {
    setServiceItems(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const handleAddCharge = (serviceId: string) => {
    const newCharge = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: "",
      amount: "" as number | "",
    }
    setServiceItems(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...s, charges: [...s.charges, newCharge] }
      }
      return s
    }))
  }

  const handleRemoveCharge = (serviceId: string, chargeId: string) => {
    setServiceItems(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...s, charges: s.charges.filter(c => c.id !== chargeId) }
      }
      return s
    }))
  }

  const handleUpdateCharge = (serviceId: string, chargeId: string, field: "name" | "amount", value: any) => {
    setServiceItems(prev => prev.map(s => {
      if (s.id === serviceId) {
        return {
          ...s,
          charges: s.charges.map(c => c.id === chargeId ? { ...c, [field]: value } : c)
        }
      }
      return s
    }))
  }

  // --- Dynamic Named Discounts Management ---
  const handleAddDiscount = () => {
    const newDisc: FormDiscountItem = {
      id: `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: "Promotional Discount",
      amount: "",
    }
    setDiscountsList(prev => [...prev, newDisc])
  }

  const handleRemoveDiscount = (id: string) => {
    setDiscountsList(prev => prev.filter(d => d.id !== id))
  }

  const handleUpdateDiscount = (id: string, field: keyof FormDiscountItem, value: any) => {
    setDiscountsList(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d))
  }

  // --- Combined Mathematical Calculations ---
  const itemCalculations = serviceItems.map((item) => {
    const numRate = typeof item.rate === "number" ? item.rate : 0
    const qty = item.qty > 0 ? item.qty : 1
    const itemCharges = item.charges.reduce((sum, c) => sum + (typeof c.amount === "number" ? c.amount : 0), 0)
    const itemBase = (numRate * qty) + itemCharges
    const itemGst = Math.round(itemBase * (item.gstRate / 100))
    const itemTotal = itemBase + itemGst
    return {
      ...item,
      numRate,
      qty,
      itemCharges,
      itemBase,
      itemGst,
      itemTotal,
    }
  })

  const totalServicesBase = itemCalculations.reduce((sum, it) => sum + (it.numRate * it.qty), 0)
  const totalPlatformCharges = itemCalculations.reduce((sum, it) => sum + it.itemCharges, 0)
  const totalGross = totalServicesBase + totalPlatformCharges
  const totalDiscounts = discountsList.reduce((sum, d) => sum + (typeof d.amount === "number" ? d.amount : 0), 0)
  const taxableBase = Math.max(0, totalGross - totalDiscounts)
  const discountRatio = totalGross > 0 ? taxableBase / totalGross : 1

  const finalItemCalculations = itemCalculations.map((item) => {
    const lineTaxable = Math.round(item.itemBase * discountRatio)
    const lineGst = Math.round(lineTaxable * (item.gstRate / 100))
    const lineTotal = lineTaxable + lineGst
    return {
      ...item,
      lineTaxable,
      itemGst: lineGst,
      itemTotal: lineTotal,
    }
  })

  const totalGstAmount = taxableBase > 0 ? finalItemCalculations.reduce((sum, it) => sum + it.itemGst, 0) : 0
  const totalAmount = taxableBase + totalGstAmount

  // Live Team Member Payout & Margin Calculations
  const memberPayouts = React.useMemo(() => {
    return assignedAllocations.map((m) => {
      const val = typeof m.payoutValue === "number" ? m.payoutValue : (Number(m.payoutValue) || 0)
      let calculatedAmount = 0
      let calculatedPercentage = 0

      if (m.payoutType === "percentage") {
        calculatedPercentage = val
        calculatedAmount = totalAmount > 0 ? Math.round((totalAmount * val) / 100) : 0
      } else {
        calculatedAmount = val
        calculatedPercentage = totalAmount > 0 ? Number(((val / totalAmount) * 100).toFixed(1)) : 0
      }

      return {
        ...m,
        calculatedAmount,
        calculatedPercentage,
      }
    })
  }, [assignedAllocations, totalAmount])

  const totalTeamPayout = React.useMemo(() => {
    return memberPayouts.reduce((acc, m) => acc + m.calculatedAmount, 0)
  }, [memberPayouts])

  const totalTeamPercentage = React.useMemo(() => {
    return totalAmount > 0 ? Number(((totalTeamPayout / totalAmount) * 100).toFixed(1)) : 0
  }, [totalTeamPayout, totalAmount])

  const companyMargin = Math.max(0, totalAmount - totalTeamPayout)
  const companyMarginPercentage = totalAmount > 0 ? Math.max(0, Number((100 - totalTeamPercentage).toFixed(1))) : 100

  const handleToggleMember = (tm: { id: string; name: string; email?: string; role?: string; avatar?: string }) => {
    setAssignedAllocations((prev) => {
      const exists = prev.some((a) => a.id === String(tm.id) || a.name.toLowerCase().trim() === tm.name.toLowerCase().trim())
      if (exists) {
        return prev.filter((a) => a.id !== String(tm.id) && a.name.toLowerCase().trim() !== tm.name.toLowerCase().trim())
      }
      return [
        ...prev,
        {
          id: String(tm.id),
          name: tm.name,
          email: tm.email || "",
          role: tm.role || "Developer",
          avatar: tm.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${tm.name}`,
          payoutType: "percentage",
          payoutValue: "",
        },
      ]
    })
  }

  const handleSelectAllMembers = () => {
    setAssignedAllocations(
      teamsList.map((tm) => {
        const existing = assignedAllocations.find((a) => a.id === String(tm.id) || a.name.toLowerCase().trim() === tm.name.toLowerCase().trim())
        if (existing) return existing
        return {
          id: String(tm.id),
          name: tm.name,
          email: tm.email || "",
          role: tm.role || "Developer",
          avatar: tm.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${tm.name}`,
          payoutType: "percentage",
          payoutValue: "",
        }
      })
    )
  }

  const handleClearMembers = () => {
    setAssignedAllocations([])
  }

  const handleUpdateMemberAllocation = (idOrName: string, field: "payoutType" | "payoutValue", val: any) => {
    setAssignedAllocations((prev) =>
      prev.map((a) => (a.id === idOrName || a.name === idOrName ? { ...a, [field]: val } : a))
    )
  }

  const handleRemoveMember = (idOrName: string) => {
    setAssignedAllocations((prev) => prev.filter((a) => a.id !== idOrName && a.name !== idOrName))
  }

  const numAdvance = typeof advanceAmount === "number" ? advanceAmount : 0
  const numPartInitial = typeof partInitialPayment === "number" ? partInitialPayment : 0

  const calculated3MonthDate = React.useMemo(() => {
    const baseDate = startDate ? new Date(startDate) : new Date()
    const validDate = isNaN(baseDate.getTime()) ? new Date() : baseDate
    const d = new Date(validDate)
    d.setMonth(d.getMonth() + (subscriptionMonths || 3))
    return d.toISOString().split("T")[0]
  }, [startDate, subscriptionMonths])

  // Distinct calculations per payment structure
  let effectiveAdvance = 0
  if (paymentModel === "full") {
    effectiveAdvance = paymentStatus === "Paid" ? totalAmount : 0
  } else if (paymentModel === "advance") {
    effectiveAdvance = Math.min(numAdvance, totalAmount)
  } else if (paymentModel === "part") {
    effectiveAdvance = partPayTiming === "pay_after_3_months" ? 0 : Math.min(numPartInitial, totalAmount)
  } else if (paymentModel === "subscription") {
    effectiveAdvance = paymentStatus === "Paid" ? Math.round(totalAmount / (subscriptionMonths || 1)) : 0
  }

  const remainingDue = Math.max(0, totalAmount - effectiveAdvance)
  const activeInstallmentsCount = (subscriptionMonths || installmentsCount || 1)
  const perInstallment = activeInstallmentsCount > 0 && remainingDue > 0 
    ? Math.round(remainingDue / activeInstallmentsCount) 
    : remainingDue

  const effectiveDeadline = (paymentModel === "part" && partPayTiming === "pay_after_3_months")
    ? (deadline || calculated3MonthDate)
    : (deadline || "30-06-2026")

  const handleSave: any = createAddClientProjectModalAction20(() => __ctrlRef.current);

  if (!isOpen) return null

  
  __ctrl = { isOpen, client, initialMode, onClose, onProjectCreated, onInvoiceCreated, router, user, activeCompanyId, activeBranchId, branches, subBranches, companies, selectedClient, setSelectedClient, allAvailableClients, setAllAvailableClients, clientSearchText, setClientSearchText, isClientSearchDropdownOpen, setIsClientSearchDropdownOpen, effectiveClient, filteredSearchClients, handleSelectClient, selectableCompanies, selectedCompanyId, setSelectedCompanyId, selectedBranchId, setSelectedBranchId, selectedSubBranchId, setSelectedSubBranchId, isBranchLocked, availableBranches, availableSubBranches, handleCompanyChange, creationMode, setCreationMode, projectTitle, setProjectTitle, category, setCategory, customCategory, setCustomCategory, isCustomCategory, setIsCustomCategory, STANDARD_CATEGORIES, effectiveCategory, handleCategorySelect, handleCustomCategoryChange, billedByAdmin, setBilledByAdmin, assignedAllocations, setAssignedAllocations, assignedMembers, startDate, setStartDate, deadline, setDeadline, serviceItems, setServiceItems, discountsList, setDiscountsList, paymentModel, setPaymentModel, advanceAmount, setAdvanceAmount, partInitialPayment, setPartInitialPayment, installmentsCount, setInstallmentsCount, subscriptionMonths, setSubscriptionMonths, partPayTiming, setPartPayTiming, billingCycle, setBillingCycle, autoCreateSubscription, setAutoCreateSubscription, paymentStatus, setPaymentStatus, description, setDescription, isSubmitting, setIsSubmitting, clientDesignation, setClientDesignation, clientCustomDesignation, setClientCustomDesignation, clientContactPersonName, setClientContactPersonName, clientEmail, setClientEmail, clientPhone, setClientPhone, clientAddress, setClientAddress, clientDistrict, setClientDistrict, clientCity, setClientCity, clientState, setClientState, clientZip, setClientZip, clientGst, setClientGst, pincodePlaces, setPincodePlaces, pincodeDistricts, setPincodeDistricts, pincodeStates, setPincodeStates, isPincodeLoading, setIsPincodeLoading, handlePincodeChange, adminsList, setAdminsList, teamsList, setTeamsList, isTeamDropdownOpen, setIsTeamDropdownOpen, teamSearchQuery, setTeamSearchQuery, teamDropdownRef, filteredTeamsList, handleModeChange, handleAddService, handleRemoveService, handleUpdateService, handleAddCharge, handleRemoveCharge, handleUpdateCharge, handleAddDiscount, handleRemoveDiscount, handleUpdateDiscount, itemCalculations, totalServicesBase, totalPlatformCharges, totalGross, totalDiscounts, taxableBase, discountRatio, finalItemCalculations, totalGstAmount, totalAmount, memberPayouts, totalTeamPayout, totalTeamPercentage, companyMargin, companyMarginPercentage, handleToggleMember, handleSelectAllMembers, handleClearMembers, handleUpdateMemberAllocation, handleRemoveMember, numAdvance, numPartInitial, calculated3MonthDate, effectiveAdvance, remainingDue, activeInstallmentsCount, perInstallment, effectiveDeadline, handleSave };
  __ctrlRef.current = __ctrl;
return (
    <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
          <div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={18} />
              <span>Multi-Service Project & Billing Setup</span>
            </h2>
            <p className="text-xs text-zinc-500">
              Add multiple custom services, line-level charges, independent GST rates & discounts for <strong>{effectiveClient?.name || "Selected Client"}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs flex-1">
          
          <AddClientProjectModalSection1 ctrl={__ctrl} />
          <AddClientProjectModalSection2 ctrl={__ctrl} />

          <AddClientProjectModalSection3 ctrl={__ctrl} />

          {/* Assign Team & Compensation Section */}
          <AddClientProjectModalSection4 ctrl={__ctrl} />


          <AddClientProjectModalSection5 ctrl={__ctrl} />

          <AddClientProjectModalSection6 ctrl={__ctrl} />
          <AddClientProjectModalSection7 ctrl={__ctrl} />

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>{isSubmitting ? "Generating Setup..." : creationMode === "project_and_invoice" ? "Create Project & Generate Invoice" : "Generate Invoice Only"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
