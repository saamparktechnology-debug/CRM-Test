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

export function createBranchesAction21(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingBranch, activeCompanyId, setBranchCompanyId, companies, setBranchTab, setBranchBankProfileTab, setBranchForm, setIsBranchModalOpen } = getCtrl();
    const __fn: any = (b: Branch) => {
    setEditingBranch(b)
    const effectiveComp = b.companyId || (b as any).company_id || activeCompanyId || "tech"
    setBranchCompanyId(effectiveComp)
    const pComp = companies.find(c => isMatchingCompany(c, effectiveComp)) || companies[0]
    setBranchTab("basic")
    setBranchBankProfileTab("gst")
    setBranchForm({
      name: b.name || "",
      code: b.code || "",
      brand_name: b.brand_name || pComp?.brand_name || "SAAMPARK",
      division_name: b.division_name || pComp?.division_name || "",
      subtitle: b.subtitle || pComp?.subtitle || "",
      logo_url: b.logo_url || pComp?.logo_url || "",
      managerName: b.managerName || "",
      managerPhone: (b as any).managerPhone || "",
      managerEmail: (b as any).managerEmail || "",
      status: (b.status as any) || "Active",

      address: b.address || pComp?.address || "",
      city: b.city || pComp?.city || "",
      state: b.state || pComp?.state || "",
      zip: (b as any).zip || pComp?.zip || "",
      country: b.country || pComp?.country || "India",
      phone: b.phone || pComp?.phone || "",
      email: b.email || pComp?.email || "",
      website: (b as any).website || pComp?.website || "",

      gstin: (b as any).gstin || pComp?.gstin || "",
      pan: (b as any).pan || pComp?.pan || "",
      cin: (b as any).cin || pComp?.cin || "",
      msme_reg: (b as any).msme_reg || pComp?.msme_reg || "",
      iso_certification: (b as any).iso_certification ?? pComp?.iso_certification ?? "An ISO 9001:2015 Certified Company",

      bank_name: (b as any).bank_name || b.bankDetails?.bankName || pComp?.bank_name || pComp?.gst_bank_name || "",
      account_holder: (b as any).account_holder || b.bankDetails?.accountHolder || pComp?.account_holder || pComp?.gst_account_holder || "",
      account_number: (b as any).account_number || b.bankDetails?.accountNumber || pComp?.account_number || pComp?.gst_account_number || "",
      ifsc_code: (b as any).ifsc_code || b.bankDetails?.ifscCode || pComp?.ifsc_code || pComp?.gst_ifsc_code || "",
      bank_branch: (b as any).bank_branch || pComp?.bank_branch || pComp?.gst_bank_branch || "",
      upi_id: (b as any).upi_id || b.bankDetails?.upiId || pComp?.upi_id || pComp?.gst_upi_id || "",
      payment_qr_url: (b as any).payment_qr_url || pComp?.payment_qr_url || pComp?.gst_payment_qr_url || "",

      // Distinct GST Banking
      gst_bank_name: (b as any).gst_bank_name || (b as any).bank_name || b.bankDetails?.bankName || pComp?.gst_bank_name || pComp?.bank_name || "",
      gst_account_holder: (b as any).gst_account_holder || (b as any).account_holder || b.bankDetails?.accountHolder || pComp?.gst_account_holder || pComp?.account_holder || "",
      gst_account_number: (b as any).gst_account_number || (b as any).account_number || b.bankDetails?.accountNumber || pComp?.gst_account_number || pComp?.account_number || "",
      gst_ifsc_code: (b as any).gst_ifsc_code || (b as any).ifsc_code || b.bankDetails?.ifscCode || pComp?.gst_ifsc_code || pComp?.ifsc_code || "",
      gst_bank_branch: (b as any).gst_bank_branch || (b as any).bank_branch || pComp?.gst_bank_branch || pComp?.bank_branch || "",
      gst_upi_id: (b as any).gst_upi_id || (b as any).upi_id || b.bankDetails?.upiId || pComp?.gst_upi_id || pComp?.upi_id || "",
      gst_payment_qr_url: (b as any).gst_payment_qr_url || (b as any).payment_qr_url || pComp?.gst_payment_qr_url || pComp?.payment_qr_url || "",

      // Distinct Non-GST Banking
      nongst_bank_name: (b as any).nongst_bank_name || (b as any).bank_name || b.bankDetails?.bankName || pComp?.nongst_bank_name || pComp?.bank_name || "",
      nongst_account_holder: (b as any).nongst_account_holder || (b as any).account_holder || b.bankDetails?.accountHolder || pComp?.nongst_account_holder || pComp?.account_holder || "",
      nongst_account_number: (b as any).nongst_account_number || (b as any).account_number || b.bankDetails?.accountNumber || pComp?.nongst_account_number || pComp?.account_number || "",
      nongst_ifsc_code: (b as any).nongst_ifsc_code || (b as any).ifsc_code || b.bankDetails?.ifscCode || pComp?.nongst_ifsc_code || pComp?.ifsc_code || "",
      nongst_bank_branch: (b as any).nongst_bank_branch || (b as any).bank_branch || pComp?.nongst_bank_branch || pComp?.bank_branch || "",
      nongst_upi_id: (b as any).nongst_upi_id || (b as any).upi_id || b.bankDetails?.upiId || pComp?.nongst_upi_id || pComp?.upi_id || "",
      nongst_payment_qr_url: (b as any).nongst_payment_qr_url || (b as any).payment_qr_url || pComp?.nongst_payment_qr_url || pComp?.payment_qr_url || "",

      signatory_name: (b as any).signatory_name || pComp?.signatory_name || "Authorized Signatory",
      signatory_designation: (b as any).signatory_designation || pComp?.signatory_designation || "Branch Manager",
      signature_image_url: (b as any).signature_image_url || pComp?.signature_image_url || "",
      stamp_image_url: (b as any).stamp_image_url || pComp?.stamp_image_url || "",
      terms_conditions: (b as any).terms_conditions || pComp?.terms_conditions || (pComp as any)?.terms || "",
      invoice_notes: (b as any).invoice_notes || pComp?.invoice_notes || (pComp as any)?.notes || "",
    })
    setIsBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
