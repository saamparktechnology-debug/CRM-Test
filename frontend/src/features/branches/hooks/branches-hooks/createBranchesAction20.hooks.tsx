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

export function createBranchesAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingBranch, activeCompanyId, selectableCompanies, companies, setBranchCompanyId, setBranchTab, setBranchBankProfileTab, setBranchForm, user, setIsBranchModalOpen } = getCtrl();
    const __fn: any = () => {
    setEditingBranch(null)
    const initialComp = (activeCompanyId && activeCompanyId !== "all") 
      ? activeCompanyId 
      : (selectableCompanies?.[0]?.id || companies?.[0]?.id || "tech")
    setBranchCompanyId(String(initialComp))
    const pComp = companies.find(c => isMatchingCompany(c, initialComp)) || companies[0]
    setBranchTab("basic")
    setBranchBankProfileTab("gst")
    setBranchForm({
      name: "",
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      brand_name: pComp?.brand_name || "SAAMPARK",
      division_name: pComp?.division_name || "",
      subtitle: pComp?.subtitle || "",
      logo_url: pComp?.logo_url || "",
      managerName: user?.name || "",
      managerPhone: user?.phone || "",
      managerEmail: user?.email || "",
      status: "Active",
      
      address: pComp?.address || "",
      city: pComp?.city || "",
      state: pComp?.state || "West Bengal",
      zip: pComp?.zip || "",
      country: pComp?.country || "India",
      phone: pComp?.phone || "",
      email: pComp?.email || "",
      website: pComp?.website || "",

      gstin: pComp?.gstin || "",
      pan: pComp?.pan || "",
      cin: pComp?.cin || "",
      msme_reg: pComp?.msme_reg || "",
      iso_certification: pComp?.iso_certification || "An ISO 9001:2015 Certified Company",

      bank_name: pComp?.bank_name || pComp?.gst_bank_name || "",
      account_holder: pComp?.account_holder || pComp?.gst_account_holder || "",
      account_number: pComp?.account_number || pComp?.gst_account_number || "",
      ifsc_code: pComp?.ifsc_code || pComp?.gst_ifsc_code || "",
      bank_branch: pComp?.bank_branch || pComp?.gst_bank_branch || "",
      upi_id: pComp?.upi_id || pComp?.gst_upi_id || "",
      payment_qr_url: pComp?.payment_qr_url || pComp?.gst_payment_qr_url || "",

      // Dual GST and Non-GST Bank Profiles for Branch
      gst_bank_name: pComp?.gst_bank_name || pComp?.bank_name || "",
      gst_account_holder: pComp?.gst_account_holder || pComp?.account_holder || "",
      gst_account_number: pComp?.gst_account_number || pComp?.account_number || "",
      gst_ifsc_code: pComp?.gst_ifsc_code || pComp?.ifsc_code || "",
      gst_bank_branch: pComp?.gst_bank_branch || pComp?.bank_branch || "",
      gst_upi_id: pComp?.gst_upi_id || pComp?.upi_id || "",
      gst_payment_qr_url: pComp?.gst_payment_qr_url || pComp?.payment_qr_url || "",

      nongst_bank_name: pComp?.nongst_bank_name || pComp?.bank_name || "",
      nongst_account_holder: pComp?.nongst_account_holder || pComp?.account_holder || "",
      nongst_account_number: pComp?.nongst_account_number || pComp?.account_number || "",
      nongst_ifsc_code: pComp?.nongst_ifsc_code || pComp?.ifsc_code || "",
      nongst_bank_branch: pComp?.nongst_bank_branch || pComp?.bank_branch || "",
      nongst_upi_id: pComp?.nongst_upi_id || pComp?.upi_id || "",
      nongst_payment_qr_url: pComp?.nongst_payment_qr_url || pComp?.payment_qr_url || "",

      signatory_name: pComp?.signatory_name || user?.name || "Authorized Signatory",
      signatory_designation: pComp?.signatory_designation || "Branch Manager",
      signature_image_url: pComp?.signature_image_url || "",
      stamp_image_url: pComp?.stamp_image_url || "",
      terms_conditions: pComp?.terms_conditions || (pComp as any)?.terms || "1. All disputes subject to local jurisdiction only.\n2. Goods/Services once billed are non-refundable.",
      invoice_notes: pComp?.invoice_notes || (pComp as any)?.notes || "Thank you for partnering with us.",
    })
    setIsBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
