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

export function createBranchesAction24(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingSubBranch, branches, activeCompanyId, companies, setSubBranchCompanyId, setSubBranchParentBranchId, setSubBranchTab, setSubBranchForm, setIsSubBranchModalOpen } = getCtrl();
    const __fn: any = (sb: SubBranch) => {
    setEditingSubBranch(sb)
    const effectiveParent = sb.parentBranchId || (sb as any).branch_id || ""
    const parent = branches.find(b => b.id === effectiveParent)
    const effectiveComp = sb.companyId || (parent as any)?.companyId || (parent as any)?.company_id || activeCompanyId || "tech"
    const pComp = companies.find(c => isMatchingCompany(c, effectiveComp)) || companies[0]
    setSubBranchCompanyId(effectiveComp)
    setSubBranchParentBranchId(effectiveParent)
    setSubBranchTab("basic")
    setSubBranchForm({
      name: sb.name || "",
      code: sb.code || "",
      brand_name: sb.brand_name || parent?.brand_name || pComp?.brand_name || "SAAMPARK",
      division_name: sb.division_name || parent?.division_name || pComp?.division_name || "",
      subtitle: sb.subtitle || parent?.subtitle || pComp?.subtitle || "",
      logo_url: sb.logo_url || parent?.logo_url || pComp?.logo_url || "",
      partnerName: sb.partnerName || (sb as any).partner_name || "",
      partnerPhone: sb.partnerPhone || (sb as any).partner_phone || "",
      partnerEmail: sb.partnerEmail || (sb as any).partner_email || "",
      partnerType: (sb.partnerType as any) || (sb as any).partner_type || "Franchise Partner",
      revenueSharePct: sb.revenueSharePct ?? (sb as any).revenue_share_pct ?? 30,
      status: (sb.status as any) || "Active",

      address: (sb as any).address || parent?.address || pComp?.address || "",
      city: (sb as any).city || parent?.city || pComp?.city || "",
      state: (sb as any).state || parent?.state || pComp?.state || "",
      zip: (sb as any).zip || (parent as any)?.zip || pComp?.zip || "",
      country: (sb as any).country || parent?.country || pComp?.country || "India",
      phone: (sb as any).phone || parent?.phone || pComp?.phone || "",
      email: (sb as any).email || parent?.email || pComp?.email || "",

      gstin: (sb as any).gstin || (parent as any)?.gstin || pComp?.gstin || "",
      pan: (sb as any).pan || (parent as any)?.pan || pComp?.pan || "",
      cin: (sb as any).cin || (parent as any)?.cin || pComp?.cin || "",
      msme_reg: (sb as any).msme_reg || (parent as any)?.msme_reg || pComp?.msme_reg || "",
      iso_certification: (sb as any).iso_certification || (parent as any)?.iso_certification || pComp?.iso_certification || "",

      bank_name: (sb as any).bank_name || sb.bankDetails?.bankName || (parent as any)?.bank_name || parent?.bankDetails?.bankName || pComp?.bank_name || pComp?.gst_bank_name || "",
      account_holder: (sb as any).account_holder || sb.bankDetails?.accountHolder || (parent as any)?.account_holder || parent?.bankDetails?.accountHolder || pComp?.account_holder || pComp?.gst_account_holder || "",
      account_number: (sb as any).account_number || sb.bankDetails?.accountNumber || (parent as any)?.account_number || parent?.bankDetails?.accountNumber || pComp?.account_number || pComp?.gst_account_number || "",
      ifsc_code: (sb as any).ifsc_code || sb.bankDetails?.ifscCode || (parent as any)?.ifsc_code || parent?.bankDetails?.ifscCode || pComp?.ifsc_code || pComp?.gst_ifsc_code || "",
      bank_branch: (sb as any).bank_branch || (parent as any)?.bank_branch || pComp?.bank_branch || "",
      upi_id: (sb as any).upi_id || sb.bankDetails?.upiId || (parent as any)?.upi_id || parent?.bankDetails?.upiId || pComp?.upi_id || "",
      payment_qr_url: (sb as any).payment_qr_url || (parent as any)?.payment_qr_url || pComp?.payment_qr_url || "",

      // Distinct GST Banking
      gst_bank_name: (sb as any).gst_bank_name || (sb as any).bank_name || sb.bankDetails?.bankName || (parent as any)?.gst_bank_name || (parent as any)?.bank_name || pComp?.gst_bank_name || pComp?.bank_name || "",
      gst_account_holder: (sb as any).gst_account_holder || (sb as any).account_holder || sb.bankDetails?.accountHolder || (parent as any)?.gst_account_holder || (parent as any)?.account_holder || pComp?.gst_account_holder || pComp?.account_holder || "",
      gst_account_number: (sb as any).gst_account_number || (sb as any).account_number || sb.bankDetails?.accountNumber || (parent as any)?.gst_account_number || (parent as any)?.account_number || pComp?.gst_account_number || pComp?.account_number || "",
      gst_ifsc_code: (sb as any).gst_ifsc_code || (sb as any).ifsc_code || sb.bankDetails?.ifscCode || (parent as any)?.gst_ifsc_code || (parent as any)?.ifsc_code || pComp?.gst_ifsc_code || pComp?.ifsc_code || "",
      gst_bank_branch: (sb as any).gst_bank_branch || (sb as any).bank_branch || (parent as any)?.gst_bank_branch || (parent as any)?.bank_branch || pComp?.gst_bank_branch || pComp?.bank_branch || "",
      gst_upi_id: (sb as any).gst_upi_id || (sb as any).upi_id || sb.bankDetails?.upiId || (parent as any)?.gst_upi_id || (parent as any)?.upi_id || pComp?.gst_upi_id || pComp?.upi_id || "",
      gst_payment_qr_url: (sb as any).gst_payment_qr_url || (sb as any).payment_qr_url || (parent as any)?.gst_payment_qr_url || (parent as any)?.payment_qr_url || pComp?.gst_payment_qr_url || pComp?.payment_qr_url || "",

      // Distinct Non-GST Banking
      nongst_bank_name: (sb as any).nongst_bank_name || (sb as any).bank_name || sb.bankDetails?.bankName || (parent as any)?.nongst_bank_name || (parent as any)?.bank_name || pComp?.nongst_bank_name || pComp?.bank_name || "",
      nongst_account_holder: (sb as any).nongst_account_holder || (sb as any).account_holder || sb.bankDetails?.accountHolder || (parent as any)?.nongst_account_holder || (parent as any)?.account_holder || pComp?.nongst_account_holder || pComp?.account_holder || "",
      nongst_account_number: (sb as any).nongst_account_number || (sb as any).account_number || sb.bankDetails?.accountNumber || (parent as any)?.nongst_account_number || (parent as any)?.account_number || pComp?.nongst_account_number || pComp?.account_number || "",
      nongst_ifsc_code: (sb as any).nongst_ifsc_code || (sb as any).ifsc_code || sb.bankDetails?.ifscCode || (parent as any)?.nongst_ifsc_code || (parent as any)?.ifsc_code || pComp?.nongst_ifsc_code || pComp?.ifsc_code || "",
      nongst_bank_branch: (sb as any).nongst_bank_branch || (sb as any).bank_branch || (parent as any)?.nongst_bank_branch || (parent as any)?.bank_branch || pComp?.nongst_bank_branch || pComp?.bank_branch || "",
      nongst_upi_id: (sb as any).nongst_upi_id || (sb as any).upi_id || sb.bankDetails?.upiId || (parent as any)?.nongst_upi_id || (parent as any)?.upi_id || pComp?.nongst_upi_id || pComp?.upi_id || "",
      nongst_payment_qr_url: (sb as any).nongst_payment_qr_url || (sb as any).payment_qr_url || (parent as any)?.nongst_payment_qr_url || (parent as any)?.payment_qr_url || pComp?.nongst_payment_qr_url || pComp?.payment_qr_url || "",

      signatory_name: (sb as any).signatory_name || (parent as any)?.signatory_name || pComp?.signatory_name || "Partner Signatory",
      signatory_designation: (sb as any).signatory_designation || "Franchise Partner",
      signature_image_url: (sb as any).signature_image_url || (parent as any)?.signature_image_url || pComp?.signature_image_url || "",
      stamp_image_url: (sb as any).stamp_image_url || (parent as any)?.stamp_image_url || pComp?.stamp_image_url || "",
      terms_conditions: (sb as any).terms_conditions || (parent as any)?.terms_conditions || pComp?.terms_conditions || (pComp as any)?.terms || "",
      invoice_notes: (sb as any).invoice_notes || (parent as any)?.invoice_notes || pComp?.invoice_notes || (pComp as any)?.notes || "",
    })
    setIsSubBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
