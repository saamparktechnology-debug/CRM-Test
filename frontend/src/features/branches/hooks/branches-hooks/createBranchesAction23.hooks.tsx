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

export function createBranchesAction23(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingSubBranch, branches, activeCompanyId, selectableCompanies, companies, setSubBranchCompanyId, setSubBranchParentBranchId, setSubBranchTab, setSubBranchBankProfileTab, setSubBranchForm, setIsSubBranchModalOpen } = getCtrl();
    const __fn: any = () => {
    setEditingSubBranch(null)
    const validBranches = (branches || []).filter(b => Boolean(b && b.id))
    const defaultParent = validBranches[0]?.id || ""
    const parent = validBranches.find(b => b.id === defaultParent)
    const initialComp = (activeCompanyId && activeCompanyId !== "all")
      ? activeCompanyId
      : ((parent as any)?.companyId || (parent as any)?.company_id || selectableCompanies?.[0]?.id || companies?.[0]?.id || "tech")
    const pComp = companies.find(c => isMatchingCompany(c, initialComp)) || companies[0]
    setSubBranchCompanyId(String(initialComp))
    setSubBranchParentBranchId(defaultParent)
    setSubBranchTab("basic")
    setSubBranchBankProfileTab("gst")
    setSubBranchForm({
      name: "",
      code: `SB-${Math.floor(100 + Math.random() * 900)}`,
      brand_name: parent?.brand_name || pComp?.brand_name || "SAAMPARK",
      division_name: parent?.division_name || pComp?.division_name || "",
      subtitle: parent?.subtitle || pComp?.subtitle || "",
      logo_url: parent?.logo_url || pComp?.logo_url || "",
      partnerName: "",
      partnerPhone: "",
      partnerEmail: "",
      partnerType: "Franchise Partner",
      revenueSharePct: 30,
      status: "Active",

      address: parent?.address || pComp?.address || "",
      city: parent?.city || pComp?.city || "",
      state: parent?.state || pComp?.state || "",
      zip: (parent as any)?.zip || pComp?.zip || "",
      country: parent?.country || pComp?.country || "India",
      phone: parent?.phone || pComp?.phone || "",
      email: parent?.email || pComp?.email || "",

      gstin: (parent as any)?.gstin || pComp?.gstin || "",
      pan: (parent as any)?.pan || pComp?.pan || "",
      cin: (parent as any)?.cin || pComp?.cin || "",
      msme_reg: (parent as any)?.msme_reg || pComp?.msme_reg || "",
      iso_certification: (parent as any)?.iso_certification || pComp?.iso_certification || "",

      bank_name: (parent as any)?.bank_name || parent?.bankDetails?.bankName || pComp?.bank_name || pComp?.gst_bank_name || "",
      account_holder: (parent as any)?.account_holder || parent?.bankDetails?.accountHolder || pComp?.account_holder || pComp?.gst_account_holder || "",
      account_number: (parent as any)?.account_number || parent?.bankDetails?.accountNumber || pComp?.account_number || pComp?.gst_account_number || "",
      ifsc_code: (parent as any)?.ifsc_code || parent?.bankDetails?.ifscCode || pComp?.ifsc_code || pComp?.gst_ifsc_code || "",
      bank_branch: (parent as any)?.bank_branch || pComp?.bank_branch || "",
      upi_id: (parent as any)?.upi_id || parent?.bankDetails?.upiId || pComp?.upi_id || "",
      payment_qr_url: (parent as any)?.payment_qr_url || pComp?.payment_qr_url || "",

      // Dual GST and Non-GST Bank Profiles for Sub-Branch
      gst_bank_name: (parent as any)?.gst_bank_name || (parent as any)?.bank_name || parent?.bankDetails?.bankName || pComp?.gst_bank_name || pComp?.bank_name || "",
      gst_account_holder: (parent as any)?.gst_account_holder || (parent as any)?.account_holder || parent?.bankDetails?.accountHolder || pComp?.gst_account_holder || pComp?.account_holder || "",
      gst_account_number: (parent as any)?.gst_account_number || (parent as any)?.account_number || parent?.bankDetails?.accountNumber || pComp?.gst_account_number || pComp?.account_number || "",
      gst_ifsc_code: (parent as any)?.gst_ifsc_code || (parent as any)?.ifsc_code || parent?.bankDetails?.ifscCode || pComp?.gst_ifsc_code || pComp?.ifsc_code || "",
      gst_bank_branch: (parent as any)?.gst_bank_branch || (parent as any)?.bank_branch || pComp?.gst_bank_branch || pComp?.bank_branch || "",
      gst_upi_id: (parent as any)?.gst_upi_id || (parent as any)?.upi_id || parent?.bankDetails?.upiId || pComp?.gst_upi_id || pComp?.upi_id || "",
      gst_payment_qr_url: (parent as any)?.gst_payment_qr_url || (parent as any)?.payment_qr_url || pComp?.gst_payment_qr_url || pComp?.payment_qr_url || "",

      nongst_bank_name: (parent as any)?.nongst_bank_name || (parent as any)?.bank_name || parent?.bankDetails?.bankName || pComp?.nongst_bank_name || pComp?.bank_name || "",
      nongst_account_holder: (parent as any)?.nongst_account_holder || (parent as any)?.account_holder || parent?.bankDetails?.accountHolder || pComp?.nongst_account_holder || pComp?.account_holder || "",
      nongst_account_number: (parent as any)?.nongst_account_number || (parent as any)?.account_number || parent?.bankDetails?.accountNumber || pComp?.nongst_account_number || pComp?.account_number || "",
      nongst_ifsc_code: (parent as any)?.nongst_ifsc_code || (parent as any)?.ifsc_code || parent?.bankDetails?.ifscCode || pComp?.nongst_ifsc_code || pComp?.ifsc_code || "",
      nongst_bank_branch: (parent as any)?.nongst_bank_branch || (parent as any)?.bank_branch || pComp?.nongst_bank_branch || pComp?.bank_branch || "",
      nongst_upi_id: (parent as any)?.nongst_upi_id || (parent as any)?.upi_id || parent?.bankDetails?.upiId || pComp?.nongst_upi_id || pComp?.upi_id || "",
      nongst_payment_qr_url: (parent as any)?.nongst_payment_qr_url || (parent as any)?.payment_qr_url || pComp?.nongst_payment_qr_url || pComp?.payment_qr_url || "",

      signatory_name: (parent as any)?.signatory_name || pComp?.signatory_name || "Partner Signatory",
      signatory_designation: "Franchise Partner",
      signature_image_url: (parent as any)?.signature_image_url || pComp?.signature_image_url || "",
      stamp_image_url: (parent as any)?.stamp_image_url || pComp?.stamp_image_url || "",
      terms_conditions: (parent as any)?.terms_conditions || pComp?.terms_conditions || (pComp as any)?.terms || "",
      invoice_notes: (parent as any)?.invoice_notes || pComp?.invoice_notes || (pComp as any)?.notes || "",
    })
    setIsSubBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
