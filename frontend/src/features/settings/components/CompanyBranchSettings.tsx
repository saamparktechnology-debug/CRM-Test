"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Pencil, Trash2, Shield, MapPin, Phone, Mail, 
  User, Check, X, AlertTriangle, Layers, ChevronDown, ChevronRight, ChevronLeft,
  Globe, CreditCard, FileText, QrCode, Sparkles, Lock, UploadCloud,
  Image as ImageIcon, CheckCircle2
} from "lucide-react"
import { useAuthStore, Company, Branch, SubBranch, getCompanyFullName, getCompanyLogoUrl, isMatchingCompany } from "@/store/useAuthStore"
import { getUsers } from "@/features/users/services/userService"
import { executeWithFeedback, useActionFeedbackStore } from "@/store/useActionFeedbackStore"
import { usePermissionStore, ALL_APP_MODULES, CLEAN_MODULE_CATEGORIES } from "@/store/usePermissionStore"
import { CompanyBranchSettingsSection1 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection1"
import { CompanyBranchSettingsSection2 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection2"
import { CompanyBranchSettingsSection3 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection3"
import { CompanyBranchSettingsSection4 } from "@/features/settings/components/companybranchsettings-sections/CompanyBranchSettingsSection4"
import { createCompanyBranchSettingsHandler1 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler1.hooks"
import { createCompanyBranchSettingsHandler2 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler2.hooks"
import { createCompanyBranchSettingsHandler3 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler3.hooks"
import { createCompanyBranchSettingsHandler4 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsHandler4.hooks"
import { createCompanyBranchSettingsAction20 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsAction20.hooks"
import { createCompanyBranchSettingsAction21 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsAction21.hooks"
import { createCompanyBranchSettingsAction22 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsAction22.hooks"
import { createCompanyBranchSettingsAction23 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsAction23.hooks"
import { createCompanyBranchSettingsAction24 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsAction24.hooks"
import { createCompanyBranchSettingsAction25 } from "@/features/settings/hooks/companybranchsettings-hooks/createCompanyBranchSettingsAction25.hooks"



export function CompanyBranchSettings() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { 
    user, 
    companies, 
    branches, 
    subBranches,
    fetchCompanies, 
    fetchBranches, 
    fetchSubBranches,
    addCompany, 
    updateCompany,
    deleteCompany, 
    addBranch, 
    updateBranch, 
    deleteBranch,
    addSubBranch,
    updateSubBranch,
    deleteSubBranch,
    activeCompanyId,
    switchCompany
  } = useAuthStore()

  const normRole = (user?.role || "").toLowerCase().trim()
  const isSuperAdmin = normRole === "super admin" || normRole.includes("super")
  const isAdmin = !isSuperAdmin && (normRole === "admin" || normRole.includes("admin"))

  // Filter companies visible for this user (Clients only see their own created entities)
  const isClientRole = normRole.includes("client")
  const visibleCompanies = React.useMemo(() => {
    let list = companies
    if (!isSuperAdmin) {
      if (isClientRole && user) {
        const uId = String(user.id || "").toLowerCase().trim()
        const uEmail = (user.email || "").toLowerCase().trim()
        list = companies.filter((c: any) => {
          const cOwnerId = String(c.clientId || c.createdById || c.ownerId || "").toLowerCase().trim()
          const cOwnerEmail = String(c.clientEmail || c.createdByEmail || c.ownerEmail || "").toLowerCase().trim()
          return (uId && cOwnerId === uId) || (uEmail && cOwnerEmail === uEmail)
        })
      } else {
        const adminCompanyIds = (user?.companyIds && user.companyIds.length > 0)
          ? user.companyIds
          : (user?.companyId ? [user.companyId] : ["tech"])
        list = companies.filter((c) => adminCompanyIds.some(id => isMatchingCompany(c, id)))
      }
    }

    const seen = new Set<string>()
    return list.filter(c => {
      const canon = isMatchingCompany(c, 'consultancy') ? 'consultancy' : (isMatchingCompany(c, 'tech') ? 'tech' : null)
      if (!canon || seen.has(canon)) return false
      seen.add(canon)
      return true
    })
  }, [isSuperAdmin, isClientRole, companies, user])

  const [expandedCompanyIds, setExpandedCompanyIds] = React.useState<string[]>([])
  const [allUsers, setAllUsers] = React.useState<any[]>([])

  // Modal States
  const COMPANY_TABS_LIST: Array<"basic" | "invoice" | "tax" | "contact" | "bank" | "smtp" | "modules"> = React.useMemo(() => {
    const list: Array<"basic" | "invoice" | "tax" | "contact" | "bank" | "smtp" | "modules"> = [
      "basic",
      "invoice",
      "tax",
      "contact",
      "bank",
      "smtp"
    ]
    if (isSuperAdmin) {
      list.push("modules")
    }
    return list
  }, [isSuperAdmin])
  const [isCompanyModalOpen, setIsCompanyModalOpen] = React.useState(false)
  const [companyModalTab, setCompanyModalTab] = React.useState<"basic" | "invoice" | "tax" | "contact" | "bank" | "smtp" | "modules">("basic")
  const [editingCompany, setEditingCompany] = React.useState<Company | null>(null)
  const { getEnabledModulesForCompany, setCompanyEnabledModules } = usePermissionStore()
  const [companyEnabledModulesState, setCompanyEnabledModulesState] = React.useState<string[]>([...ALL_APP_MODULES])

  // Company Form States (All invoice & enterprise configuration fields)
  const [companyBrandName, setCompanyBrandName] = React.useState("SAAMPARK")
  const [companyDivisionName, setCompanyDivisionName] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [companySubtitle, setCompanySubtitle] = React.useState("")
  const [companySlug, setCompanySlug] = React.useState("")
  const [companyLogo, setCompanyLogo] = React.useState("🏢")
  const [companyLogoUrl, setCompanyLogoUrl] = React.useState("")
  const [companyCurrency, setCompanyCurrency] = React.useState("INR")
  const [companyCurrencySymbol, setCompanyCurrencySymbol] = React.useState("₹")

  // Legal & Tax
  const [companyCin, setCompanyCin] = React.useState("")
  const [companyGstin, setCompanyGstin] = React.useState("")
  const [companyPan, setCompanyPan] = React.useState("")

  // Address & Contact
  const [companyAddress, setCompanyAddress] = React.useState("")
  const [companyPhone, setCompanyPhone] = React.useState("")
  const [companyEmail, setCompanyEmail] = React.useState("")
  const [companyWebsite, setCompanyWebsite] = React.useState("")

  // Banking & UPI (Default/Fallback)
  const [companyUpiId, setCompanyUpiId] = React.useState("")
  const [companyAccountHolder, setCompanyAccountHolder] = React.useState("")
  const [companyBankName, setCompanyBankName] = React.useState("")
  const [companyAccountNumber, setCompanyAccountNumber] = React.useState("")
  const [companyIfscCode, setCompanyIfscCode] = React.useState("")
  const [companyBankBranch, setCompanyBankBranch] = React.useState("")
  const [companyPaymentQrUrl, setCompanyPaymentQrUrl] = React.useState("")

  // Company Dual GST & Non-GST Bank Profiles
  const [companyBankProfileTab, setCompanyBankProfileTab] = React.useState<"gst" | "nongst">("gst")
  const [companyGstBankName, setCompanyGstBankName] = React.useState("")
  const [companyGstAccountHolder, setCompanyGstAccountHolder] = React.useState("")
  const [companyGstAccountNumber, setCompanyGstAccountNumber] = React.useState("")
  const [companyGstIfscCode, setCompanyGstIfscCode] = React.useState("")
  const [companyGstBankBranch, setCompanyGstBankBranch] = React.useState("")
  const [companyGstUpiId, setCompanyGstUpiId] = React.useState("")
  const [companyGstPaymentQrUrl, setCompanyGstPaymentQrUrl] = React.useState("")

  const [companyNongstBankName, setCompanyNongstBankName] = React.useState("")
  const [companyNongstAccountHolder, setCompanyNongstAccountHolder] = React.useState("")
  const [companyNongstAccountNumber, setCompanyNongstAccountNumber] = React.useState("")
  const [companyNongstIfscCode, setCompanyNongstIfscCode] = React.useState("")
  const [companyNongstBankBranch, setCompanyNongstBankBranch] = React.useState("")
  const [companyNongstUpiId, setCompanyNongstUpiId] = React.useState("")
  const [companyNongstPaymentQrUrl, setCompanyNongstPaymentQrUrl] = React.useState("")

  // Terms & Signatory
  const [companyTermsConditions, setCompanyTermsConditions] = React.useState("")
  const [companySignatoryName, setCompanySignatoryName] = React.useState("")
  const [companySignatoryDesignation, setCompanySignatoryDesignation] = React.useState("")
  const [companySignatureImageUrl, setCompanySignatureImageUrl] = React.useState("")
  const [companyStampImageUrl, setCompanyStampImageUrl] = React.useState("")

  // SMTP & Email Dispatch Configurations (Per Company)
  const [companySmtpPreset, setCompanySmtpPreset] = React.useState<"gmail" | "zoho" | "outlook" | "custom">("gmail")
  const [companySmtpHost, setCompanySmtpHost] = React.useState("smtp.gmail.com")
  const [companySmtpPort, setCompanySmtpPort] = React.useState("587")
  const [companySmtpSecure, setCompanySmtpSecure] = React.useState(false)
  const [companySmtpUser, setCompanySmtpUser] = React.useState("")
  const [companySmtpPass, setCompanySmtpPass] = React.useState("")
  const [companySmtpFromName, setCompanySmtpFromName] = React.useState("")
  const [companySmtpFromEmail, setCompanySmtpFromEmail] = React.useState("")
  const [showCompanySmtpPass, setShowCompanySmtpPass] = React.useState(false)
  const [isTestingCompanySmtp, setIsTestingCompanySmtp] = React.useState(false)
  const [companySmtpTestResult, setCompanySmtpTestResult] = React.useState<{ success?: boolean; message?: string } | null>(null)
  const [companyTestEmail, setCompanyTestEmail] = React.useState("")

  // Branch Modal States (5 Full Tabs)
  const BRANCH_TABS_LIST: Array<"basic" | "tax" | "contact" | "bank" | "signature"> = React.useMemo(() => [
    "basic",
    "tax",
    "contact",
    "bank",
    "signature"
  ], [])
  const [isBranchModalOpen, setIsBranchModalOpen] = React.useState(false)
  const [branchModalTab, setBranchModalTab] = React.useState<"basic" | "tax" | "contact" | "bank" | "signature">("basic")
  const [targetCompanyIdForBranch, setTargetCompanyIdForBranch] = React.useState<string>("tech")
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null)
  
  // 1. Identity & Branding
  const [branchName, setBranchName] = React.useState("")
  const [branchCode, setBranchCode] = React.useState("")
  const [branchBrandName, setBranchBrandName] = React.useState("")
  const [branchDivisionName, setBranchDivisionName] = React.useState("")
  const [branchSubtitle, setBranchSubtitle] = React.useState("")
  const [branchLogoUrl, setBranchLogoUrl] = React.useState("")
  const [branchManager, setBranchManager] = React.useState("")
  const [branchManagerPhone, setBranchManagerPhone] = React.useState("")
  const [branchManagerEmail, setBranchManagerEmail] = React.useState("")
  const [branchStatus, setBranchStatus] = React.useState<"Active" | "Inactive">("Active")

  // 2. Legal & Tax
  const [branchGstin, setBranchGstin] = React.useState("")
  const [branchPan, setBranchPan] = React.useState("")
  const [branchCin, setBranchCin] = React.useState("")
  const [branchMsmeReg, setBranchMsmeReg] = React.useState("")

  // 3. Address & Contact
  const [branchAddress, setBranchAddress] = React.useState("")
  const [branchCity, setBranchCity] = React.useState("")
  const [branchState, setBranchState] = React.useState("")
  const [branchZip, setBranchZip] = React.useState("")
  const [branchCountry, setBranchCountry] = React.useState("India")
  const [branchPhone, setBranchPhone] = React.useState("")
  const [branchEmail, setBranchEmail] = React.useState("")
  const [branchWebsite, setBranchWebsite] = React.useState("")

  // 4. Bank & UPI Pay (Default / Fallback)
  const [branchBankName, setBranchBankName] = React.useState("")
  const [branchAccountHolder, setBranchAccountHolder] = React.useState("")
  const [branchAccountNumber, setBranchAccountNumber] = React.useState("")
  const [branchIfscCode, setBranchIfscCode] = React.useState("")
  const [branchBankBranch, setBranchBankBranch] = React.useState("")
  const [branchUpiId, setBranchUpiId] = React.useState("")
  const [branchPaymentQrUrl, setBranchPaymentQrUrl] = React.useState("")
  const [branchTermsConditions, setBranchTermsConditions] = React.useState("")

  // Branch Dual GST & Non-GST Bank Profiles
  const [branchBankProfileTab, setBranchBankProfileTab] = React.useState<"gst" | "nongst">("gst")
  const [branchGstBankName, setBranchGstBankName] = React.useState("")
  const [branchGstAccountHolder, setBranchGstAccountHolder] = React.useState("")
  const [branchGstAccountNumber, setBranchGstAccountNumber] = React.useState("")
  const [branchGstIfscCode, setBranchGstIfscCode] = React.useState("")
  const [branchGstBankBranch, setBranchGstBankBranch] = React.useState("")
  const [branchGstUpiId, setBranchGstUpiId] = React.useState("")
  const [branchGstPaymentQrUrl, setBranchGstPaymentQrUrl] = React.useState("")

  const [branchNongstBankName, setBranchNongstBankName] = React.useState("")
  const [branchNongstAccountHolder, setBranchNongstAccountHolder] = React.useState("")
  const [branchNongstAccountNumber, setBranchNongstAccountNumber] = React.useState("")
  const [branchNongstIfscCode, setBranchNongstIfscCode] = React.useState("")
  const [branchNongstBankBranch, setBranchNongstBankBranch] = React.useState("")
  const [branchNongstUpiId, setBranchNongstUpiId] = React.useState("")
  const [branchNongstPaymentQrUrl, setBranchNongstPaymentQrUrl] = React.useState("")

  // 5. Signature & Stamp
  const [branchSignatoryName, setBranchSignatoryName] = React.useState("")
  const [branchSignatoryDesignation, setBranchSignatoryDesignation] = React.useState("")
  const [branchSignatureImageUrl, setBranchSignatureImageUrl] = React.useState("")
  const [branchStampImageUrl, setBranchStampImageUrl] = React.useState("")

  // Sub-Branch Modal & Form States (5 Full Tabs)
  const SUB_BRANCH_TABS_LIST: Array<"basic" | "tax" | "contact" | "bank" | "signature"> = React.useMemo(() => [
    "basic",
    "tax",
    "contact",
    "bank",
    "signature"
  ], [])
  const [isSubBranchModalOpen, setIsSubBranchModalOpen] = React.useState(false)
  const [subBranchModalTab, setSubBranchModalTab] = React.useState<"basic" | "tax" | "contact" | "bank" | "signature">("basic")
  const [editingSubBranch, setEditingSubBranch] = React.useState<SubBranch | null>(null)
  const [subBranchParentBranchId, setSubBranchParentBranchId] = React.useState<string>("")
  const [subBranchCompanyId, setSubBranchCompanyId] = React.useState<string>("tech")

  // 1. Identity & Branding
  const [subBranchName, setSubBranchName] = React.useState("")
  const [subBranchCode, setSubBranchCode] = React.useState("")
  const [subBranchBrandName, setSubBranchBrandName] = React.useState("")
  const [subBranchDivisionName, setSubBranchDivisionName] = React.useState("")
  const [subBranchSubtitle, setSubBranchSubtitle] = React.useState("")
  const [subBranchPartnerName, setSubBranchPartnerName] = React.useState("")
  const [subBranchPartnerPhone, setSubBranchPartnerPhone] = React.useState("")
  const [subBranchPartnerEmail, setSubBranchPartnerEmail] = React.useState("")
  const [subBranchRevenueSharePct, setSubBranchRevenueSharePct] = React.useState<number>(30)
  const [subBranchPartnerType, setSubBranchPartnerType] = React.useState<"Franchise Partner" | "Agency Partner" | "Satellite Office" | "Regional Associate">("Franchise Partner")
  const [subBranchStatus, setSubBranchStatus] = React.useState<"Active" | "Inactive">("Active")

  // 2. Legal & Tax
  const [subBranchGstin, setSubBranchGstin] = React.useState("")
  const [subBranchPan, setSubBranchPan] = React.useState("")
  const [subBranchCin, setSubBranchCin] = React.useState("")
  const [subBranchMsmeReg, setSubBranchMsmeReg] = React.useState("")

  // 3. Address & Contact
  const [subBranchAddress, setSubBranchAddress] = React.useState("")
  const [subBranchCity, setSubBranchCity] = React.useState("")
  const [subBranchState, setSubBranchState] = React.useState("")
  const [subBranchZip, setSubBranchZip] = React.useState("")
  const [subBranchCountry, setSubBranchCountry] = React.useState("India")
  const [subBranchPhone, setSubBranchPhone] = React.useState("")
  const [subBranchEmail, setSubBranchEmail] = React.useState("")
  const [subBranchWebsite, setSubBranchWebsite] = React.useState("")

  // 4. Bank & UPI Pay (Default / Fallback)
  const [subBranchAccountHolder, setSubBranchAccountHolder] = React.useState("")
  const [subBranchBankName, setSubBranchBankName] = React.useState("")
  const [subBranchAccountNumber, setSubBranchAccountNumber] = React.useState("")
  const [subBranchIfscCode, setSubBranchIfscCode] = React.useState("")
  const [subBranchBankBranch, setSubBranchBankBranch] = React.useState("")
  const [subBranchUpiId, setSubBranchUpiId] = React.useState("")
  const [subBranchPaymentQrUrl, setSubBranchPaymentQrUrl] = React.useState("")
  const [subBranchTermsConditions, setSubBranchTermsConditions] = React.useState("")

  // Sub-Branch Dual GST & Non-GST Bank Profiles
  const [subBranchBankProfileTab, setSubBranchBankProfileTab] = React.useState<"gst" | "nongst">("gst")
  const [subBranchGstBankName, setSubBranchGstBankName] = React.useState("")
  const [subBranchGstAccountHolder, setSubBranchGstAccountHolder] = React.useState("")
  const [subBranchGstAccountNumber, setSubBranchGstAccountNumber] = React.useState("")
  const [subBranchGstIfscCode, setSubBranchGstIfscCode] = React.useState("")
  const [subBranchGstBankBranch, setSubBranchGstBankBranch] = React.useState("")
  const [subBranchGstUpiId, setSubBranchGstUpiId] = React.useState("")
  const [subBranchGstPaymentQrUrl, setSubBranchGstPaymentQrUrl] = React.useState("")

  const [subBranchNongstBankName, setSubBranchNongstBankName] = React.useState("")
  const [subBranchNongstAccountHolder, setSubBranchNongstAccountHolder] = React.useState("")
  const [subBranchNongstAccountNumber, setSubBranchNongstAccountNumber] = React.useState("")
  const [subBranchNongstIfscCode, setSubBranchNongstIfscCode] = React.useState("")
  const [subBranchNongstBankBranch, setSubBranchNongstBankBranch] = React.useState("")
  const [subBranchNongstUpiId, setSubBranchNongstUpiId] = React.useState("")
  const [subBranchNongstPaymentQrUrl, setSubBranchNongstPaymentQrUrl] = React.useState("")

  // 5. Signature & Stamp
  const [subBranchLogoUrl, setSubBranchLogoUrl] = React.useState("")
  const [subBranchSignatoryName, setSubBranchSignatoryName] = React.useState("")
  const [subBranchSignatoryDesignation, setSubBranchSignatoryDesignation] = React.useState("")
  const [subBranchSignatureImageUrl, setSubBranchSignatureImageUrl] = React.useState("")
  const [subBranchStampImageUrl, setSubBranchStampImageUrl] = React.useState("")

  // Refs for file uploads
  const logoFileInputRef = React.useRef<HTMLInputElement>(null)
  const signatureFileInputRef = React.useRef<HTMLInputElement>(null)
  const companyStampInputRef = React.useRef<HTMLInputElement>(null)
  const qrFileInputRef = React.useRef<HTMLInputElement>(null)
  const companyGstQrInputRef = React.useRef<HTMLInputElement>(null)
  const companyNongstQrInputRef = React.useRef<HTMLInputElement>(null)

  const branchSignatureInputRef = React.useRef<HTMLInputElement>(null)
  const branchStampInputRef = React.useRef<HTMLInputElement>(null)
  const branchQrInputRef = React.useRef<HTMLInputElement>(null)
  const branchGstQrInputRef = React.useRef<HTMLInputElement>(null)
  const branchNongstQrInputRef = React.useRef<HTMLInputElement>(null)

  const subBranchLogoInputRef = React.useRef<HTMLInputElement>(null)
  const subBranchSignatureInputRef = React.useRef<HTMLInputElement>(null)
  const subBranchStampInputRef = React.useRef<HTMLInputElement>(null)
  const subBranchQrInputRef = React.useRef<HTMLInputElement>(null)
  const subBranchGstQrInputRef = React.useRef<HTMLInputElement>(null)
  const subBranchNongstQrInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    fetchCompanies()
    fetchBranches()
    fetchSubBranches()
    getUsers("all").then((list) => setAllUsers(list || []))
  }, [fetchCompanies, fetchBranches, fetchSubBranches])

  // Automatically expand first company
  React.useEffect(() => {
    if (visibleCompanies.length > 0 && expandedCompanyIds.length === 0) {
      setExpandedCompanyIds([visibleCompanies[0].id])
    }
  }, [visibleCompanies])

  const toggleCompanyExpand = (compId: string) => {
    setExpandedCompanyIds((prev) =>
      prev.includes(compId) ? prev.filter((id) => id !== compId) : [...prev, compId]
    )
  }

  // Handle Logo Upload with ImgBB
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert("Logo image size should not exceed 10MB.")
      return
    }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "company_logo", 800)
      if (res && res.success && res.url) {
        setCompanyLogoUrl(res.url)
      } else {
        alert("Failed to upload logo to ImgBB cloud.")
      }
    } catch (err: any) {
      alert("Upload error: " + err.message)
    }
  }

  // Handle Signature Upload with ImgBB
  const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert("Signature image size should not exceed 10MB.")
      return
    }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "company_signature", 800)
      if (res && res.success && res.url) {
        setCompanySignatureImageUrl(res.url)
      } else {
        alert("Failed to upload signature to ImgBB cloud.")
      }
    } catch (err: any) {
      alert("Upload error: " + err.message)
    }
  }

  // Handle Company Stamp / Seal Upload with ImgBB
  const handleCompanyStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert("Company stamp image size should not exceed 10MB.")
      return
    }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "company_stamp", 800)
      if (res && res.success && res.url) {
        setCompanyStampImageUrl(res.url)
      } else {
        alert("Failed to upload company stamp to ImgBB cloud.")
      }
    } catch (err: any) {
      alert("Upload error: " + err.message)
    }
  }

  // Handle QR Image Uploads via backend Multer multipart endpoint
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { alert("QR Code image size should not exceed 5MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "company_payment_qr", 800)
      if (res && res.success && res.url) {
        setCompanyPaymentQrUrl(res.url)
        if (companyBankProfileTab === "gst") setCompanyGstPaymentQrUrl(res.url)
        else setCompanyNongstPaymentQrUrl(res.url)
      } else {
        alert("Failed to upload QR Code image to server.")
      }
    } catch (err: any) {
      alert("Upload error: " + (err?.message || "Failed to upload QR image."))
    }
  }

  const handleCompanyGstQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "company_gst_qr", 800)
      if (res && res.success && res.url) {
        setCompanyGstPaymentQrUrl(res.url)
        setCompanyPaymentQrUrl(res.url)
      } else alert("Failed to upload GST QR to cloud.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleCompanyNongstQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "company_nongst_qr", 800)
      if (res && res.success && res.url) {
        setCompanyNongstPaymentQrUrl(res.url)
      } else alert("Failed to upload Non-GST QR to cloud.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleBranchGstQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "branch_gst_qr", 800)
      if (res && res.success && res.url) {
        setBranchGstPaymentQrUrl(res.url)
        setBranchPaymentQrUrl(res.url)
      } else alert("Failed to upload branch GST QR to cloud.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleBranchNongstQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "branch_nongst_qr", 800)
      if (res && res.success && res.url) {
        setBranchNongstPaymentQrUrl(res.url)
      } else alert("Failed to upload branch Non-GST QR to cloud.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleSubBranchGstQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "subbranch_gst_qr", 800)
      if (res && res.success && res.url) {
        setSubBranchGstPaymentQrUrl(res.url)
        setSubBranchPaymentQrUrl(res.url)
      } else alert("Failed to upload sub-branch GST QR to cloud.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleSubBranchNongstQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "subbranch_nongst_qr", 800)
      if (res && res.success && res.url) {
        setSubBranchNongstPaymentQrUrl(res.url)
      } else alert("Failed to upload sub-branch Non-GST QR to cloud.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  // Copy GST to Non-GST Helpers
  const handleCopyCompanyGstToNongst = () => {
    setCompanyNongstBankName(companyGstBankName || companyBankName)
    setCompanyNongstAccountHolder(companyGstAccountHolder || companyAccountHolder)
    setCompanyNongstAccountNumber(companyGstAccountNumber || companyAccountNumber)
    setCompanyNongstIfscCode(companyGstIfscCode || companyIfscCode)
    setCompanyNongstBankBranch(companyGstBankBranch || companyBankBranch)
    setCompanyNongstUpiId(companyGstUpiId || companyUpiId)
    setCompanyNongstPaymentQrUrl(companyGstPaymentQrUrl || companyPaymentQrUrl)
  }

  const handleCopyBranchGstToNongst = () => {
    setBranchNongstBankName(branchGstBankName || branchBankName)
    setBranchNongstAccountHolder(branchGstAccountHolder || branchAccountHolder)
    setBranchNongstAccountNumber(branchGstAccountNumber || branchAccountNumber)
    setBranchNongstIfscCode(branchGstIfscCode || branchIfscCode)
    setBranchNongstBankBranch(branchGstBankBranch || branchBankBranch)
    setBranchNongstUpiId(branchGstUpiId || branchUpiId)
    setBranchNongstPaymentQrUrl(branchGstPaymentQrUrl || branchPaymentQrUrl)
  }

  const handleCopySubBranchGstToNongst = () => {
    setSubBranchNongstBankName(subBranchGstBankName || subBranchBankName)
    setSubBranchNongstAccountHolder(subBranchGstAccountHolder || subBranchAccountHolder)
    setSubBranchNongstAccountNumber(subBranchGstAccountNumber || subBranchAccountNumber)
    setSubBranchNongstIfscCode(subBranchGstIfscCode || subBranchIfscCode)
    setSubBranchNongstBankBranch(subBranchGstBankBranch || subBranchBankBranch)
    setSubBranchNongstUpiId(subBranchGstUpiId || subBranchUpiId)
    setSubBranchNongstPaymentQrUrl(subBranchGstPaymentQrUrl || subBranchPaymentQrUrl)
  }

  // Sync composed company name when brand or division changes
  const updateBrandOrDivision = (newBrand: string, newDivision: string) => {
    setCompanyBrandName(newBrand)
    setCompanyDivisionName(newDivision)
    const composed = [newBrand.trim(), newDivision.trim()].filter(Boolean).join(" ")
    setCompanyName(composed)
    if (!editingCompany) {
      const generatedSlug = (newDivision.trim() || newBrand.trim())
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      setCompanySlug(generatedSlug)
    }
  }

  // ── COMPANY HANDLERS (Super Admin Only) ──────────────────────────────────────
  const handleOpenCreateCompany: any = createCompanyBranchSettingsAction20(() => __ctrlRef.current);

  const handleOpenEditCompany: any = createCompanyBranchSettingsHandler1(() => __ctrlRef.current);

  const handleSaveCompany: any = createCompanyBranchSettingsHandler2(() => __ctrlRef.current);

  const handleApplyCompanyPreset = (preset: "gmail" | "zoho" | "outlook" | "custom") => {
    setCompanySmtpPreset(preset)
    setCompanySmtpTestResult(null)
    if (preset === "gmail") {
      setCompanySmtpHost("smtp.gmail.com")
      setCompanySmtpPort("587")
      setCompanySmtpSecure(false)
    } else if (preset === "zoho") {
      setCompanySmtpHost("smtp.zoho.in")
      setCompanySmtpPort("465")
      setCompanySmtpSecure(true)
    } else if (preset === "outlook") {
      setCompanySmtpHost("smtp.office365.com")
      setCompanySmtpPort("587")
      setCompanySmtpSecure(false)
    }
  }

  const handleTestCompanySmtp: any = createCompanyBranchSettingsAction21(() => __ctrlRef.current);

  const handleDeleteCompany = async (compId: string, compName: string) => {
    useActionFeedbackStore.getState().showError({
      title: "Action Not Allowed",
      message: "Core companies (SAAMPARK Technology and Saampark Consultancy) cannot be deleted.",
      actionType: "delete",
    })
  }

  // Branch Upload Handlers
  const handleBranchSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("Signature image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "branch_signature", 800)
      if (res && res.success && res.url) setBranchSignatureImageUrl(res.url)
      else alert("Failed to upload branch signature to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleBranchStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("Stamp image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "branch_stamp", 800)
      if (res && res.success && res.url) setBranchStampImageUrl(res.url)
      else alert("Failed to upload branch stamp to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleBranchQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "branch_upi_qr", 800)
      if (res && res.success && res.url) {
        setBranchPaymentQrUrl(res.url)
        if (branchBankProfileTab === "gst") setBranchGstPaymentQrUrl(res.url)
        else setBranchNongstPaymentQrUrl(res.url)
      } else alert("Failed to upload branch UPI QR to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  // Sub-Branch Upload Handlers
  const handleSubBranchLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("Partner logo image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "subbranch_logo", 800)
      if (res && res.success && res.url) setSubBranchLogoUrl(res.url)
      else alert("Failed to upload partner logo to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleSubBranchSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("Signature image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "subbranch_signature", 800)
      if (res && res.success && res.url) setSubBranchSignatureImageUrl(res.url)
      else alert("Failed to upload sub-branch signature to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleSubBranchStampUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("Stamp image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "subbranch_stamp", 800)
      if (res && res.success && res.url) setSubBranchStampImageUrl(res.url)
      else alert("Failed to upload sub-branch stamp to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  const handleSubBranchQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { alert("QR Code image size should not exceed 10MB."); return; }
    try {
      const { uploadToImgBB } = await import("@/lib/imgbbUpload")
      const res = await uploadToImgBB(file, "subbranch_upi_qr", 800)
      if (res && res.success && res.url) {
        setSubBranchPaymentQrUrl(res.url)
        if (subBranchBankProfileTab === "gst") setSubBranchGstPaymentQrUrl(res.url)
        else setSubBranchNongstPaymentQrUrl(res.url)
      } else alert("Failed to upload sub-branch UPI QR to ImgBB.")
    } catch (err: any) { alert("Upload error: " + err.message) }
  }

  // ── BRANCH HANDLERS (Admin & Super Admin) ────────────────────────────────────
  const handleOpenCreateBranch: any = createCompanyBranchSettingsAction22(() => __ctrlRef.current);

  const handleOpenEditBranch: any = createCompanyBranchSettingsAction23(() => __ctrlRef.current);

  const handleSaveBranch: any = createCompanyBranchSettingsHandler3(() => __ctrlRef.current);

  const handleDeleteBranch = async (branchId: string, bName: string) => {
    await executeWithFeedback(async () => {
      await deleteBranch(branchId)
      await fetchBranches().catch(() => {})
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Branch...",
      loadingMsg: `Removing branch "${bName}"...`,
      successTitle: "Branch Deleted",
      successMsg: `Branch "${bName}" removed.`,
      errorTitle: "Delete Failed",
    })
  }

  // ── SUB-BRANCH HANDLERS (Percentage Wise Revenue Share & Full Details) ─────
  const handleOpenCreateSubBranch: any = createCompanyBranchSettingsAction24(() => __ctrlRef.current);

  const handleOpenEditSubBranch: any = createCompanyBranchSettingsAction25(() => __ctrlRef.current);

  const handleSaveSubBranch: any = createCompanyBranchSettingsHandler4(() => __ctrlRef.current);

  const handleDeleteSubBranch = async (subBranchId: string, sbName: string) => {
    await executeWithFeedback(async () => {
      await deleteSubBranch(subBranchId)
      await fetchSubBranches().catch(() => {})
    }, {
      actionType: "delete",
      loadingTitle: "Deleting Sub-Branch...",
      loadingMsg: `Removing sub-branch "${sbName}"...`,
      successTitle: "Sub-Branch Removed",
      successMsg: `Sub-Branch "${sbName}" deleted successfully.`,
      errorTitle: "Delete Failed",
    })
  }

  
  __ctrl = { user, companies, branches, subBranches, fetchCompanies, fetchBranches, fetchSubBranches, addCompany, updateCompany, deleteCompany, addBranch, updateBranch, deleteBranch, addSubBranch, updateSubBranch, deleteSubBranch, activeCompanyId, switchCompany, normRole, isSuperAdmin, isAdmin, isClientRole, visibleCompanies, expandedCompanyIds, setExpandedCompanyIds, allUsers, setAllUsers, COMPANY_TABS_LIST, isCompanyModalOpen, setIsCompanyModalOpen, companyModalTab, setCompanyModalTab, editingCompany, setEditingCompany, getEnabledModulesForCompany, setCompanyEnabledModules, companyEnabledModulesState, setCompanyEnabledModulesState, companyBrandName, setCompanyBrandName, companyDivisionName, setCompanyDivisionName, companyName, setCompanyName, companySubtitle, setCompanySubtitle, companySlug, setCompanySlug, companyLogo, setCompanyLogo, companyLogoUrl, setCompanyLogoUrl, companyCurrency, setCompanyCurrency, companyCurrencySymbol, setCompanyCurrencySymbol, companyCin, setCompanyCin, companyGstin, setCompanyGstin, companyPan, setCompanyPan, companyAddress, setCompanyAddress, companyPhone, setCompanyPhone, companyEmail, setCompanyEmail, companyWebsite, setCompanyWebsite, companyUpiId, setCompanyUpiId, companyAccountHolder, setCompanyAccountHolder, companyBankName, setCompanyBankName, companyAccountNumber, setCompanyAccountNumber, companyIfscCode, setCompanyIfscCode, companyBankBranch, setCompanyBankBranch, companyPaymentQrUrl, setCompanyPaymentQrUrl, companyBankProfileTab, setCompanyBankProfileTab, companyGstBankName, setCompanyGstBankName, companyGstAccountHolder, setCompanyGstAccountHolder, companyGstAccountNumber, setCompanyGstAccountNumber, companyGstIfscCode, setCompanyGstIfscCode, companyGstBankBranch, setCompanyGstBankBranch, companyGstUpiId, setCompanyGstUpiId, companyGstPaymentQrUrl, setCompanyGstPaymentQrUrl, companyNongstBankName, setCompanyNongstBankName, companyNongstAccountHolder, setCompanyNongstAccountHolder, companyNongstAccountNumber, setCompanyNongstAccountNumber, companyNongstIfscCode, setCompanyNongstIfscCode, companyNongstBankBranch, setCompanyNongstBankBranch, companyNongstUpiId, setCompanyNongstUpiId, companyNongstPaymentQrUrl, setCompanyNongstPaymentQrUrl, companyTermsConditions, setCompanyTermsConditions, companySignatoryName, setCompanySignatoryName, companySignatoryDesignation, setCompanySignatoryDesignation, companySignatureImageUrl, setCompanySignatureImageUrl, companyStampImageUrl, setCompanyStampImageUrl, companySmtpPreset, setCompanySmtpPreset, companySmtpHost, setCompanySmtpHost, companySmtpPort, setCompanySmtpPort, companySmtpSecure, setCompanySmtpSecure, companySmtpUser, setCompanySmtpUser, companySmtpPass, setCompanySmtpPass, companySmtpFromName, setCompanySmtpFromName, companySmtpFromEmail, setCompanySmtpFromEmail, showCompanySmtpPass, setShowCompanySmtpPass, isTestingCompanySmtp, setIsTestingCompanySmtp, companySmtpTestResult, setCompanySmtpTestResult, companyTestEmail, setCompanyTestEmail, BRANCH_TABS_LIST, isBranchModalOpen, setIsBranchModalOpen, branchModalTab, setBranchModalTab, targetCompanyIdForBranch, setTargetCompanyIdForBranch, editingBranch, setEditingBranch, branchName, setBranchName, branchCode, setBranchCode, branchBrandName, setBranchBrandName, branchDivisionName, setBranchDivisionName, branchSubtitle, setBranchSubtitle, branchLogoUrl, setBranchLogoUrl, branchManager, setBranchManager, branchManagerPhone, setBranchManagerPhone, branchManagerEmail, setBranchManagerEmail, branchStatus, setBranchStatus, branchGstin, setBranchGstin, branchPan, setBranchPan, branchCin, setBranchCin, branchMsmeReg, setBranchMsmeReg, branchAddress, setBranchAddress, branchCity, setBranchCity, branchState, setBranchState, branchZip, setBranchZip, branchCountry, setBranchCountry, branchPhone, setBranchPhone, branchEmail, setBranchEmail, branchWebsite, setBranchWebsite, branchBankName, setBranchBankName, branchAccountHolder, setBranchAccountHolder, branchAccountNumber, setBranchAccountNumber, branchIfscCode, setBranchIfscCode, branchBankBranch, setBranchBankBranch, branchUpiId, setBranchUpiId, branchPaymentQrUrl, setBranchPaymentQrUrl, branchTermsConditions, setBranchTermsConditions, branchBankProfileTab, setBranchBankProfileTab, branchGstBankName, setBranchGstBankName, branchGstAccountHolder, setBranchGstAccountHolder, branchGstAccountNumber, setBranchGstAccountNumber, branchGstIfscCode, setBranchGstIfscCode, branchGstBankBranch, setBranchGstBankBranch, branchGstUpiId, setBranchGstUpiId, branchGstPaymentQrUrl, setBranchGstPaymentQrUrl, branchNongstBankName, setBranchNongstBankName, branchNongstAccountHolder, setBranchNongstAccountHolder, branchNongstAccountNumber, setBranchNongstAccountNumber, branchNongstIfscCode, setBranchNongstIfscCode, branchNongstBankBranch, setBranchNongstBankBranch, branchNongstUpiId, setBranchNongstUpiId, branchNongstPaymentQrUrl, setBranchNongstPaymentQrUrl, branchSignatoryName, setBranchSignatoryName, branchSignatoryDesignation, setBranchSignatoryDesignation, branchSignatureImageUrl, setBranchSignatureImageUrl, branchStampImageUrl, setBranchStampImageUrl, SUB_BRANCH_TABS_LIST, isSubBranchModalOpen, setIsSubBranchModalOpen, subBranchModalTab, setSubBranchModalTab, editingSubBranch, setEditingSubBranch, subBranchParentBranchId, setSubBranchParentBranchId, subBranchCompanyId, setSubBranchCompanyId, subBranchName, setSubBranchName, subBranchCode, setSubBranchCode, subBranchBrandName, setSubBranchBrandName, subBranchDivisionName, setSubBranchDivisionName, subBranchSubtitle, setSubBranchSubtitle, subBranchPartnerName, setSubBranchPartnerName, subBranchPartnerPhone, setSubBranchPartnerPhone, subBranchPartnerEmail, setSubBranchPartnerEmail, subBranchRevenueSharePct, setSubBranchRevenueSharePct, subBranchPartnerType, setSubBranchPartnerType, subBranchStatus, setSubBranchStatus, subBranchGstin, setSubBranchGstin, subBranchPan, setSubBranchPan, subBranchCin, setSubBranchCin, subBranchMsmeReg, setSubBranchMsmeReg, subBranchAddress, setSubBranchAddress, subBranchCity, setSubBranchCity, subBranchState, setSubBranchState, subBranchZip, setSubBranchZip, subBranchCountry, setSubBranchCountry, subBranchPhone, setSubBranchPhone, subBranchEmail, setSubBranchEmail, subBranchWebsite, setSubBranchWebsite, subBranchAccountHolder, setSubBranchAccountHolder, subBranchBankName, setSubBranchBankName, subBranchAccountNumber, setSubBranchAccountNumber, subBranchIfscCode, setSubBranchIfscCode, subBranchBankBranch, setSubBranchBankBranch, subBranchUpiId, setSubBranchUpiId, subBranchPaymentQrUrl, setSubBranchPaymentQrUrl, subBranchTermsConditions, setSubBranchTermsConditions, subBranchBankProfileTab, setSubBranchBankProfileTab, subBranchGstBankName, setSubBranchGstBankName, subBranchGstAccountHolder, setSubBranchGstAccountHolder, subBranchGstAccountNumber, setSubBranchGstAccountNumber, subBranchGstIfscCode, setSubBranchGstIfscCode, subBranchGstBankBranch, setSubBranchGstBankBranch, subBranchGstUpiId, setSubBranchGstUpiId, subBranchGstPaymentQrUrl, setSubBranchGstPaymentQrUrl, subBranchNongstBankName, setSubBranchNongstBankName, subBranchNongstAccountHolder, setSubBranchNongstAccountHolder, subBranchNongstAccountNumber, setSubBranchNongstAccountNumber, subBranchNongstIfscCode, setSubBranchNongstIfscCode, subBranchNongstBankBranch, setSubBranchNongstBankBranch, subBranchNongstUpiId, setSubBranchNongstUpiId, subBranchNongstPaymentQrUrl, setSubBranchNongstPaymentQrUrl, subBranchLogoUrl, setSubBranchLogoUrl, subBranchSignatoryName, setSubBranchSignatoryName, subBranchSignatoryDesignation, setSubBranchSignatoryDesignation, subBranchSignatureImageUrl, setSubBranchSignatureImageUrl, subBranchStampImageUrl, setSubBranchStampImageUrl, logoFileInputRef, signatureFileInputRef, companyStampInputRef, qrFileInputRef, companyGstQrInputRef, companyNongstQrInputRef, branchSignatureInputRef, branchStampInputRef, branchQrInputRef, branchGstQrInputRef, branchNongstQrInputRef, subBranchLogoInputRef, subBranchSignatureInputRef, subBranchStampInputRef, subBranchQrInputRef, subBranchGstQrInputRef, subBranchNongstQrInputRef, toggleCompanyExpand, handleLogoUpload, handleSignatureUpload, handleCompanyStampUpload, handleQrUpload, handleCompanyGstQrUpload, handleCompanyNongstQrUpload, handleBranchGstQrUpload, handleBranchNongstQrUpload, handleSubBranchGstQrUpload, handleSubBranchNongstQrUpload, handleCopyCompanyGstToNongst, handleCopyBranchGstToNongst, handleCopySubBranchGstToNongst, updateBrandOrDivision, handleOpenCreateCompany, handleOpenEditCompany, handleSaveCompany, handleApplyCompanyPreset, handleTestCompanySmtp, handleDeleteCompany, handleBranchSignatureUpload, handleBranchStampUpload, handleBranchQrUpload, handleSubBranchLogoUpload, handleSubBranchSignatureUpload, handleSubBranchStampUpload, handleSubBranchQrUpload, handleOpenCreateBranch, handleOpenEditBranch, handleSaveBranch, handleDeleteBranch, handleOpenCreateSubBranch, handleOpenEditSubBranch, handleSaveSubBranch, handleDeleteSubBranch };
  __ctrlRef.current = __ctrl;
return (
    <div className="space-y-6">
      <CompanyBranchSettingsSection4 ctrl={__ctrl} />

      {/* ── CREATE / EDIT COMPANY & INVOICE CUSTOMIZATION MODAL (Super Admin Only) ── */}
      <AnimatePresence>
        <CompanyBranchSettingsSection1 ctrl={__ctrl} />
      </AnimatePresence>

      {/* ── CREATE / EDIT BRANCH MODAL (5 Full Tabs) ───────────────────────── */}
      <AnimatePresence>
        <CompanyBranchSettingsSection2 ctrl={__ctrl} />
      </AnimatePresence>

      {/* ── CREATE / EDIT SUB-BRANCH & REVENUE SHARE MODAL (5 Full Tabs) ──── */}
      <AnimatePresence>
        <CompanyBranchSettingsSection3 ctrl={__ctrl} />
      </AnimatePresence>
    </div>
  )
}
