"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, MapPin, Users, X, Check, 
  ChevronDown, Globe, CreditCard, FileText, QrCode, Sparkles, Lock, 
  UploadCloud, CheckCircle2, Shield, Eye, Phone, Mail, Building,
  AlertCircle, ExternalLink, Image as ImageIcon, Briefcase, Info,
  Landmark, Stamp, FileCheck
} from "lucide-react"
import { useAuthStore, Branch, SubBranch, Company, isMatchingCompany, getSelectableCompanies } from "@/store/useAuthStore"
import { usePermissionStore } from "@/store/usePermissionStore"
import { executeWithFeedback } from "@/store/useActionFeedbackStore"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { BranchesSection1 } from "@/features/branches/components/branches-sections/BranchesSection1"
import { BranchesSection2 } from "@/features/branches/components/branches-sections/BranchesSection2"
import { BranchesSection3 } from "@/features/branches/components/branches-sections/BranchesSection3"
import { BranchesSection4 } from "@/features/branches/components/branches-sections/BranchesSection4"
import { BranchesSection5 } from "@/features/branches/components/branches-sections/BranchesSection5"


import { type Tab, type BranchModalTab, type SubBranchModalTab, cleanStr, cleanUpper , SafeModalBoundary } from "@/features/branches/components/branches-sections/BranchesHelpers"
export * from "@/features/branches/components/branches-sections/BranchesHelpers"
import { createBranchesAction20 } from "@/features/branches/hooks/branches-hooks/createBranchesAction20.hooks"
import { createBranchesAction21 } from "@/features/branches/hooks/branches-hooks/createBranchesAction21.hooks"
import { createBranchesAction22 } from "@/features/branches/hooks/branches-hooks/createBranchesAction22.hooks"
import { createBranchesAction23 } from "@/features/branches/hooks/branches-hooks/createBranchesAction23.hooks"
import { createBranchesAction24 } from "@/features/branches/hooks/branches-hooks/createBranchesAction24.hooks"
import { createBranchesAction25 } from "@/features/branches/hooks/branches-hooks/createBranchesAction25.hooks"




export default function BranchesMain() {
  const __ctrlRef = React.useRef<any>({});
  let __ctrl: any = {};

  const { 
    user, 
    activeCompanyId, 
    activeBranchId,
    activeSubBranchId,
    companies, 
    branches, 
    subBranches, 
    addBranch, 
    updateBranch, 
    deleteBranch, 
    addSubBranch, 
    updateSubBranch, 
    deleteSubBranch, 
    fetchBranches, 
    fetchSubBranches,
    fetchCompanies
  } = useAuthStore()

  const selectableCompanies = React.useMemo(() => {
    return getSelectableCompanies(companies, activeCompanyId, user, branches, subBranches)
  }, [companies, activeCompanyId, user, branches, subBranches])
  
  const { canPerformAction } = usePermissionStore()

  const canAdd = canPerformAction(user, "Settings", "add") || user?.role === "Super Admin"
  const canEdit = canPerformAction(user, "Settings", "edit") || user?.role === "Super Admin"
  const canDelete = canPerformAction(user, "Settings", "delete") || user?.role === "Super Admin"

  const [activeTab, setActiveTab] = React.useState<Tab>("branches")
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedCompanyFilter, setSelectedCompanyFilter] = React.useState<string>("all")
  const [selectedParentBranchFilter, setSelectedParentBranchFilter] = React.useState<string>("all")

  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = React.useState(false)
  const [editingBranch, setEditingBranch] = React.useState<Branch | null>(null)
  const [branchTab, setBranchTab] = React.useState<BranchModalTab>("basic")

  const [isSubBranchModalOpen, setIsSubBranchModalOpen] = React.useState(false)
  const [editingSubBranch, setEditingSubBranch] = React.useState<SubBranch | null>(null)
  const [subBranchTab, setSubBranchTab] = React.useState<SubBranchModalTab>("basic")

  const [viewingItem, setViewingItem] = React.useState<Branch | SubBranch | null>(null)
  const [viewingType, setViewingType] = React.useState<"branch" | "sub-branch">("branch")
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ id: string; name: string; type: "branch" | "sub-branch" } | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  const [branchCompanyId, setBranchCompanyId] = React.useState<string>("tech")
  const [branchPreviewScale, setBranchPreviewScale] = React.useState<"fit" | "normal" | "large">("fit")
  const [subBranchPreviewScale, setSubBranchPreviewScale] = React.useState<"fit" | "normal" | "large">("fit")
  const [branchForm, setBranchForm] = React.useState({
    name: "",
    code: "",
    brand_name: "SAAMPARK",
    division_name: "",
    subtitle: "",
    logo_url: "",
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    status: "Active" as "Active" | "Inactive",
    
    // Address & Contacts
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    email: "",
    website: "",

    // Legal & Tax IDs
    gstin: "",
    pan: "",
    cin: "",
    msme_reg: "",
    iso_certification: "An ISO 9001:2015 Certified Company",

    // Bank & UPI Details (Fallback)
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    upi_id: "",
    payment_qr_url: "",

    // Dual GST and Non-GST Bank Profiles for Branch
    gst_bank_name: "",
    gst_account_holder: "",
    gst_account_number: "",
    gst_ifsc_code: "",
    gst_bank_branch: "",
    gst_upi_id: "",
    gst_payment_qr_url: "",

    nongst_bank_name: "",
    nongst_account_holder: "",
    nongst_account_number: "",
    nongst_ifsc_code: "",
    nongst_bank_branch: "",
    nongst_upi_id: "",
    nongst_payment_qr_url: "",

    // Signatory & Invoice Customization
    signatory_name: "Authorized Signatory",
    signatory_designation: "Branch Manager",
    signature_image_url: "",
    stamp_image_url: "",
    terms_conditions: "",
    invoice_notes: "",
  })

  const [branchBankProfileTab, setBranchBankProfileTab] = React.useState<"gst" | "nongst">("gst")
  const [subBranchBankProfileTab, setSubBranchBankProfileTab] = React.useState<"gst" | "nongst">("gst")

  // ── SUB-BRANCH FORM STATE ──────────────────────────────────────────
  const [subBranchCompanyId, setSubBranchCompanyId] = React.useState<string>("tech")
  const [subBranchParentBranchId, setSubBranchParentBranchId] = React.useState<string>("")
  const [subBranchForm, setSubBranchForm] = React.useState({
    name: "",
    code: "",
    brand_name: "",
    division_name: "",
    subtitle: "",
    logo_url: "",
    partnerName: "",
    partnerPhone: "",
    partnerEmail: "",
    partnerType: "Franchise Partner" as "Franchise Partner" | "Agency Partner" | "Satellite Office" | "Regional Associate",
    revenueSharePct: 30,
    status: "Active" as "Active" | "Inactive",

    // Address & Contact
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
    email: "",

    // Tax & Bank
    gstin: "",
    pan: "",
    bank_name: "",
    account_holder: "",
    account_number: "",
    ifsc_code: "",
    bank_branch: "",
    upi_id: "",
    payment_qr_url: "",

    // Dual GST and Non-GST Bank Profiles for Sub-Branch
    gst_bank_name: "",
    gst_account_holder: "",
    gst_account_number: "",
    gst_ifsc_code: "",
    gst_bank_branch: "",
    gst_upi_id: "",
    gst_payment_qr_url: "",

    nongst_bank_name: "",
    nongst_account_holder: "",
    nongst_account_number: "",
    nongst_ifsc_code: "",
    nongst_bank_branch: "",
    nongst_upi_id: "",
    nongst_payment_qr_url: "",

    // Signatory & Stamp
    signatory_name: "Partner Signatory",
    signatory_designation: "Franchise Partner",
    signature_image_url: "",
    stamp_image_url: "",
  })

  React.useEffect(() => {
    fetchCompanies().catch(() => {})
    fetchBranches().catch(() => {})
    fetchSubBranches().catch(() => {})
  }, [])

  // Filter branches
  const filteredBranches = React.useMemo(() => {
    const freshActiveCompanyId = activeCompanyId
    const freshActiveBranchId = (user?.role !== "Super Admin" && user?.role !== "Admin") ? (user?.branchId || activeBranchId) : activeBranchId

    return branches.filter(b => {
      const matchesSearch = 
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.state || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.gstin || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.brand_name || "").toLowerCase().includes(searchQuery.toLowerCase())

      // Company filter: prioritize active company scope unless 'all'
      const compTarget = selectedCompanyFilter !== "all" 
        ? selectedCompanyFilter 
        : (freshActiveCompanyId && freshActiveCompanyId !== "all" ? freshActiveCompanyId : "all")

      const matchesCompany = compTarget === "all" || isMatchingCompany({ id: b.companyId || (b as any).company_id, slug: b.companyId } as any, compTarget)

      // Branch filter: if switched to a specific branch, isolate strictly to that branch!
      const matchesBranchScope = !freshActiveBranchId || freshActiveBranchId === "all" || String(b.id) === String(freshActiveBranchId) || (b.code && b.code.toLowerCase() === String(freshActiveBranchId).toLowerCase())

      return matchesSearch && matchesCompany && matchesBranchScope
    })
  }, [branches, searchQuery, selectedCompanyFilter, activeCompanyId, activeBranchId, user])

  // Filter sub-branches
  const filteredSubBranches = React.useMemo(() => {
    const freshActiveCompanyId = activeCompanyId
    const freshActiveBranchId = (user?.role !== "Super Admin" && user?.role !== "Admin") ? (user?.branchId || activeBranchId) : activeBranchId
    const freshActiveSubBranchId = (user?.role !== "Super Admin" && user?.role !== "Admin") ? (user?.subBranchId || activeSubBranchId) : activeSubBranchId

    return subBranches.filter(sb => {
      const matchesSearch = 
        sb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sb.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sb.city || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sb.partnerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sb.partnerType || "").toLowerCase().includes(searchQuery.toLowerCase())

      const compTarget = selectedCompanyFilter !== "all" 
        ? selectedCompanyFilter 
        : (freshActiveCompanyId && freshActiveCompanyId !== "all" ? freshActiveCompanyId : "all")

      const matchesCompany = compTarget === "all" || isMatchingCompany({ id: sb.companyId || (sb as any).company_id, slug: sb.companyId } as any, compTarget)

      const branchTarget = selectedParentBranchFilter !== "all"
        ? selectedParentBranchFilter
        : (freshActiveBranchId && freshActiveBranchId !== "all" ? freshActiveBranchId : "all")

      const matchesParentBranch = branchTarget === "all" || String(sb.parentBranchId) === String(branchTarget) || String((sb as any).branch_id) === String(branchTarget)

      const matchesSubBranchScope = !freshActiveSubBranchId || freshActiveSubBranchId === "all" || String(sb.id) === String(freshActiveSubBranchId) || (sb.code && sb.code.toLowerCase() === String(freshActiveSubBranchId).toLowerCase())

      return matchesSearch && matchesCompany && matchesParentBranch && matchesSubBranchScope
    })
  }, [subBranches, searchQuery, selectedCompanyFilter, selectedParentBranchFilter, activeCompanyId, activeBranchId, activeSubBranchId, user])

  // ── OPEN BRANCH MODALS ─────────────────────────────────────────────
  const openAddBranch: any = createBranchesAction20(() => __ctrlRef.current);

  const openEditBranch: any = createBranchesAction21(() => __ctrlRef.current);

  const handleCopyBranchGstToNongst = () => {
    setBranchForm(prev => ({
      ...prev,
      nongst_bank_name: prev.gst_bank_name || prev.bank_name,
      nongst_account_holder: prev.gst_account_holder || prev.account_holder,
      nongst_account_number: prev.gst_account_number || prev.account_number,
      nongst_ifsc_code: prev.gst_ifsc_code || prev.ifsc_code,
      nongst_bank_branch: prev.gst_bank_branch || prev.bank_branch,
      nongst_upi_id: prev.gst_upi_id || prev.upi_id,
      nongst_payment_qr_url: prev.gst_payment_qr_url || prev.payment_qr_url,
    }))
  }

  const handleCopySubBranchGstToNongst = () => {
    setSubBranchForm(prev => ({
      ...prev,
      nongst_bank_name: prev.gst_bank_name || prev.bank_name,
      nongst_account_holder: prev.gst_account_holder || prev.account_holder,
      nongst_account_number: prev.gst_account_number || prev.account_number,
      nongst_ifsc_code: prev.gst_ifsc_code || prev.ifsc_code,
      nongst_bank_branch: prev.gst_bank_branch || prev.bank_branch,
      nongst_upi_id: prev.gst_upi_id || prev.upi_id,
      nongst_payment_qr_url: prev.gst_payment_qr_url || prev.payment_qr_url,
    }))
  }

  // ── SAVE BRANCH ────────────────────────────────────────────────────
  const handleSaveBranch: any = createBranchesAction22(() => __ctrlRef.current);

  // ── OPEN SUB-BRANCH MODALS ─────────────────────────────────────────
  const openAddSubBranch: any = createBranchesAction23(() => __ctrlRef.current);

  const openEditSubBranch: any = createBranchesAction24(() => __ctrlRef.current);

  // ── SAVE SUB-BRANCH ────────────────────────────────────────────────
  const handleSaveSubBranch: any = createBranchesAction25(() => __ctrlRef.current);

  // ── DELETE CONFIRMATION ───────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return
    if (deleteConfirm.type === "branch") {
      await executeWithFeedback(async () => {
        await deleteBranch(deleteConfirm.id)
      }, {
        actionType: "delete",
        successTitle: "Branch Deleted",
        successMsg: `${deleteConfirm.name} deleted.`,
      })
    } else {
      await executeWithFeedback(async () => {
        await deleteSubBranch(deleteConfirm.id)
      }, {
        actionType: "delete",
        successTitle: "Sub-Branch Deleted",
        successMsg: `${deleteConfirm.name} deleted.`,
      })
    }
    setDeleteConfirm(null)
  }

  const getCompanyName = (companyId?: string) => {
    if (!companyId) return "SAAMPARK Group"
    const found = companies.find(c => String(c.id).toLowerCase() === String(companyId).toLowerCase())
    return found?.brand_name || found?.name || (companyId === "print" ? "Print Space India" : companyId === "digital" ? "SAAMPARK Digital Marketing" : "SAAMPARK Technology")
  }

  
  __ctrl = { user, activeCompanyId, activeBranchId, activeSubBranchId, companies, branches, subBranches, addBranch, updateBranch, deleteBranch, addSubBranch, updateSubBranch, deleteSubBranch, fetchBranches, fetchSubBranches, fetchCompanies, selectableCompanies, canPerformAction, canAdd, canEdit, canDelete, activeTab, setActiveTab, searchQuery, setSearchQuery, selectedCompanyFilter, setSelectedCompanyFilter, selectedParentBranchFilter, setSelectedParentBranchFilter, isBranchModalOpen, setIsBranchModalOpen, editingBranch, setEditingBranch, branchTab, setBranchTab, isSubBranchModalOpen, setIsSubBranchModalOpen, editingSubBranch, setEditingSubBranch, subBranchTab, setSubBranchTab, viewingItem, setViewingItem, viewingType, setViewingType, deleteConfirm, setDeleteConfirm, isSaving, setIsSaving, branchCompanyId, setBranchCompanyId, branchPreviewScale, setBranchPreviewScale, subBranchPreviewScale, setSubBranchPreviewScale, branchForm, setBranchForm, branchBankProfileTab, setBranchBankProfileTab, subBranchBankProfileTab, setSubBranchBankProfileTab, subBranchCompanyId, setSubBranchCompanyId, subBranchParentBranchId, setSubBranchParentBranchId, subBranchForm, setSubBranchForm, filteredBranches, filteredSubBranches, openAddBranch, openEditBranch, handleCopyBranchGstToNongst, handleCopySubBranchGstToNongst, handleSaveBranch, openAddSubBranch, openEditSubBranch, handleSaveSubBranch, handleDelete, getCompanyName };
  __ctrlRef.current = __ctrl;
return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.2 }} 
      className="space-y-6 max-w-[1600px] mx-auto p-4 sm:p-6"
    >
      <BranchesSection3 ctrl={__ctrl} />
      <BranchesSection4 ctrl={__ctrl} />

      {/* ── UPGRADED 5-TAB BRANCH MODAL ─── */}
      <AnimatePresence>
        <BranchesSection1 ctrl={__ctrl} />
      </AnimatePresence>

      {/* ── UPGRADED SUB-BRANCH / PARTNER MODAL ── */}
      <AnimatePresence>
        <BranchesSection2 ctrl={__ctrl} />
      </AnimatePresence>

      <BranchesSection5 ctrl={__ctrl} />
    </motion.div>
  )
}
