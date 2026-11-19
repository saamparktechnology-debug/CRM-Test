"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Building2, Plus, Search, Edit2, Trash2, ChevronRight, ChevronDown, 
  MapPin, Phone, Mail, Globe, Users, Briefcase, DollarSign, Building, 
  Loader2, AlertCircle, Shield, CreditCard, Award, CheckCircle2, Image,
  X, Sparkles, Eye, Landmark, QrCode, FileText, Check, ShieldCheck,
  Columns, Maximize2, Minimize2, Split, LayoutTemplate, Save, Copy, Layers
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { CompanyApiService, BranchApiService, SubBranchApiService } from "@/features/companies/services/companyService"
import { Company, Branch, SubBranch } from "@/features/companies/types"
import { useAuthStore, isMatchingCompany } from "@/store/useAuthStore"
import { markGlobalItemDeleted, unmarkGlobalItemDeleted, fetchModuleDataFromDB, saveModuleDataToDB, syncGlobalDeletedIds, isGlobalItemDeleted, getLocalDeletedIds } from "@/lib/storageSync"
import { ImageUploadField } from "@/components/ui/ImageUploadField"
import { OfficialInvoiceDocument, CustomTextStamp } from "@/features/invoice/components/OfficialInvoiceDocument"
import { InvoiceItem, InvoiceLineItem } from "@/features/invoice/services/invoiceService"
import { CompaniesSection1 } from "@/features/companies/components/companies-sections/CompaniesSection1"
import { CompaniesSection2 } from "@/features/companies/components/companies-sections/CompaniesSection2"
import { CompaniesSection3 } from "@/features/companies/components/companies-sections/CompaniesSection3"
import { CompaniesSection4 } from "@/features/companies/components/companies-sections/CompaniesSection4"
import { createCompaniesHandler1 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler1.hooks"
import { createCompaniesHandler2 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler2.hooks"
import { createCompaniesHandler3 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler3.hooks"
import { createCompaniesHandler4 } from "@/features/companies/hooks/companies-hooks/createCompaniesHandler4.hooks"
import { INDUSTRIES, CURRENCIES, PARTNER_TYPES, CANONICAL_COMPANIES, CANONICAL_BRANCHES, cleanStr, cleanUpper, isBranchDeleted , SafeModalBoundary } from "@/features/companies/components/companies-sections/CompaniesHelpers"

export function createCompaniesAction25(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingSubBranch, setSubBranchBranchId, branches, companies, setSubBranchCompanyId, setSubBranchModalViewMode, setSubBranchTab, setSubBranchBankProfileTab, setSubBranchSignaturePos, setSubBranchStampPos, setSubBranchLogoScale, setSubBranchStampScale, setSubBranchSignatureScale, setSubBranchCustomStamps, setSubBranchZoom, setPreviewInvoiceType, setSubBranchForm, setShowSubBranchModal } = getCtrl();
    const __fn: any = (branchId: string, companyId?: string) => {
    setEditingSubBranch(null)
    setSubBranchBranchId(String(branchId || ""))
    const pBranch = branches.find(b => String(b.id) === String(branchId) || (b.code && b.code === branchId))
    const effectiveCompId = String(companyId || pBranch?.company_id || pBranch?.companyId || (companies[0]?.id ? companies[0].id : "tech"))
    const pComp = companies.find(c => isMatchingCompany(c, effectiveCompId)) || companies[0]
    setSubBranchCompanyId(effectiveCompId)
    setSubBranchModalViewMode("split")
    setSubBranchTab("partner")
    setSubBranchBankProfileTab("gst")
    setSubBranchSignaturePos(pBranch?.signature_position || pComp?.signature_position || { x: 0, y: 0 })
    setSubBranchStampPos(pBranch?.stamp_position || pComp?.stamp_position || { x: 0, y: 0 })
    setSubBranchLogoScale(pBranch?.logo_scale ?? pComp?.logo_scale ?? 1)
    setSubBranchStampScale(pBranch?.stamp_scale ?? pComp?.stamp_scale ?? 1)
    setSubBranchSignatureScale(pBranch?.signature_scale ?? pComp?.signature_scale ?? 1)
    setSubBranchCustomStamps(Array.isArray(pBranch?.custom_stamps) && pBranch.custom_stamps.length > 0 ? pBranch.custom_stamps : (Array.isArray(pComp?.custom_stamps) ? pComp.custom_stamps : []))
    setSubBranchZoom(pBranch?.zoom || pComp?.zoom || 100)
    setPreviewInvoiceType("gst")
    setSubBranchForm({
      name: "",
      code: `SB-${Math.floor(100 + Math.random() * 900)}`,
      partner_name: "",
      partner_phone: "",
      partner_email: "",
      revenue_share_pct: 0,
      partner_type: "Regional Associate",
      address: pBranch?.address || pComp?.address || "",
      city: pBranch?.city || pComp?.city || "",
      state: pBranch?.state || pComp?.state || "",
      phone: pBranch?.phone || pComp?.phone || "",
      email: pBranch?.email || pComp?.email || "",
      gstin: pBranch?.gstin || pComp?.gstin || "",
      pan: pBranch?.pan || pComp?.pan || "",
      cin: pBranch?.cin || pComp?.cin || "",
      msme_reg: pBranch?.msme_reg || pComp?.msme_reg || "",
      subtitle: pBranch?.subtitle || pComp?.subtitle || "",
      iso_certification: pBranch?.iso_certification || pComp?.iso_certification || "",
      bank_name: pBranch?.bank_name || pBranch?.gst_bank_name || pComp?.bank_name || pComp?.gst_bank_name || "",
      account_holder: pBranch?.account_holder || pBranch?.gst_account_holder || pComp?.account_holder || pComp?.gst_account_holder || "",
      account_number: pBranch?.account_number || pBranch?.gst_account_number || pComp?.account_number || pComp?.gst_account_number || "",
      ifsc_code: pBranch?.ifsc_code || pBranch?.gst_ifsc_code || pComp?.ifsc_code || pComp?.gst_ifsc_code || "",
      bank_branch: pBranch?.bank_branch || pBranch?.gst_bank_branch || pComp?.bank_branch || pComp?.gst_bank_branch || "",
      upi_id: pBranch?.upi_id || pBranch?.gst_upi_id || pComp?.upi_id || pComp?.gst_upi_id || "",
      payment_qr_url: pBranch?.payment_qr_url || pBranch?.gst_payment_qr_url || pComp?.payment_qr_url || pComp?.gst_payment_qr_url || "",
      gst_bank_name: pBranch?.gst_bank_name || pBranch?.bank_name || pComp?.gst_bank_name || pComp?.bank_name || "",
      gst_account_holder: pBranch?.gst_account_holder || pBranch?.account_holder || pComp?.gst_account_holder || pComp?.account_holder || "",
      gst_account_number: pBranch?.gst_account_number || pBranch?.account_number || pComp?.gst_account_number || pComp?.account_number || "",
      gst_ifsc_code: pBranch?.gst_ifsc_code || pBranch?.ifsc_code || pComp?.gst_ifsc_code || pComp?.ifsc_code || "",
      gst_bank_branch: pBranch?.gst_bank_branch || pBranch?.bank_branch || pComp?.gst_bank_branch || pComp?.bank_branch || "",
      gst_upi_id: pBranch?.gst_upi_id || pBranch?.upi_id || pComp?.gst_upi_id || pComp?.upi_id || "",
      gst_payment_qr_url: pBranch?.gst_payment_qr_url || pBranch?.payment_qr_url || pComp?.gst_payment_qr_url || pComp?.payment_qr_url || "",
      nongst_bank_name: pBranch?.nongst_bank_name || pComp?.nongst_bank_name || "",
      nongst_account_holder: pBranch?.nongst_account_holder || pComp?.nongst_account_holder || "",
      nongst_account_number: pBranch?.nongst_account_number || pComp?.nongst_account_number || "",
      nongst_ifsc_code: pBranch?.nongst_ifsc_code || pComp?.nongst_ifsc_code || "",
      nongst_bank_branch: pBranch?.nongst_bank_branch || pComp?.nongst_bank_branch || "",
      nongst_upi_id: pBranch?.nongst_upi_id || pComp?.nongst_upi_id || "",
      nongst_payment_qr_url: pBranch?.nongst_payment_qr_url || pComp?.nongst_payment_qr_url || "",
      logo_url: pBranch?.logo_url || pComp?.logo_url || "",
      signature_image_url: pBranch?.signature_image_url || pComp?.signature_image_url || "",
      stamp_image_url: pBranch?.stamp_image_url || pComp?.stamp_image_url || "",
      signatory_name: pBranch?.signatory_name || pComp?.signatory_name || "Authorized Signatory",
      signatory_designation: pBranch?.signatory_designation || pComp?.signatory_designation || "Partner",
      terms_conditions: pBranch?.terms_conditions || pComp?.terms_conditions || (pComp as any)?.terms || "",
      invoice_notes: pBranch?.invoice_notes || pComp?.invoice_notes || (pComp as any)?.notes || "",
      status: "active"
    })
    setShowSubBranchModal(true)
  };
    return __fn(...__args);
  };
}
