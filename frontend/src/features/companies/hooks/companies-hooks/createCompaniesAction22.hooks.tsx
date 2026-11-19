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

export function createCompaniesAction22(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingBranch, companies, setBranchCompanyId, setBranchModalViewMode, setBranchTab, setBranchBankProfileTab, setBranchSignaturePos, setBranchStampPos, setBranchLogoScale, setBranchStampScale, setBranchSignatureScale, setBranchCustomStamps, setBranchZoom, setPreviewInvoiceType, setBranchForm, setShowBranchModal } = getCtrl();
    const __fn: any = (companyId?: string) => {
    setEditingBranch(null)
    const effectiveCompId = String(companyId || (companies[0]?.id ? companies[0].id : "tech"))
    const pComp = companies.find(c => isMatchingCompany(c, effectiveCompId)) || companies[0]
    setBranchCompanyId(effectiveCompId)
    setBranchModalViewMode("split")
    setBranchTab("basic")
    setBranchBankProfileTab("gst")
    setBranchSignaturePos(pComp?.signature_position || { x: 0, y: 0 })
    setBranchStampPos(pComp?.stamp_position || { x: 0, y: 0 })
    setBranchLogoScale(pComp?.logo_scale ?? 1)
    setBranchStampScale(pComp?.stamp_scale ?? 1)
    setBranchSignatureScale(pComp?.signature_scale ?? 1)
    setBranchCustomStamps(Array.isArray(pComp?.custom_stamps) ? pComp.custom_stamps : [])
    setBranchZoom(pComp?.zoom || 100)
    setPreviewInvoiceType("gst")
    setBranchForm({
      name: "",
      code: `BR-${Math.floor(100 + Math.random() * 900)}`,
      brand_name: pComp?.brand_name || "SAAMPARK",
      division_name: pComp?.division_name || "",
      subtitle: pComp?.subtitle || "",
      logo_url: pComp?.logo_url || "",
      payment_qr_url: pComp?.payment_qr_url || "",
      gstin: pComp?.gstin || "",
      pan: pComp?.pan || "",
      cin: pComp?.cin || "",
      msme_reg: pComp?.msme_reg || "",
      iso_certification: pComp?.iso_certification || "",
      signatory_name: pComp?.signatory_name || "Authorized Signatory",
      signatory_designation: pComp?.signatory_designation || "Branch Manager",
      signature_image_url: pComp?.signature_image_url || "",
      stamp_image_url: pComp?.stamp_image_url || "",
      address: pComp?.address || "",
      city: pComp?.city || "",
      state: pComp?.state || "",
      zip: pComp?.zip || "",
      country: pComp?.country || "India",
      phone: pComp?.phone || "",
      email: pComp?.email || "",
      managerName: "",
      managerPhone: "",
      bank_name: pComp?.bank_name || pComp?.gst_bank_name || "",
      account_holder: pComp?.account_holder || pComp?.gst_account_holder || "",
      account_number: pComp?.account_number || pComp?.gst_account_number || "",
      ifsc_code: pComp?.ifsc_code || pComp?.gst_ifsc_code || "",
      bank_branch: pComp?.bank_branch || pComp?.gst_bank_branch || "",
      upi_id: pComp?.upi_id || pComp?.gst_upi_id || "",
      gst_bank_name: pComp?.gst_bank_name || pComp?.bank_name || "",
      gst_account_holder: pComp?.gst_account_holder || pComp?.account_holder || "",
      gst_account_number: pComp?.gst_account_number || pComp?.account_number || "",
      gst_ifsc_code: pComp?.gst_ifsc_code || pComp?.ifsc_code || "",
      gst_bank_branch: pComp?.gst_bank_branch || pComp?.bank_branch || "",
      gst_upi_id: pComp?.gst_upi_id || pComp?.upi_id || "",
      gst_payment_qr_url: pComp?.gst_payment_qr_url || pComp?.payment_qr_url || "",
      nongst_bank_name: pComp?.nongst_bank_name || "",
      nongst_account_holder: pComp?.nongst_account_holder || "",
      nongst_account_number: pComp?.nongst_account_number || "",
      nongst_ifsc_code: pComp?.nongst_ifsc_code || "",
      nongst_bank_branch: pComp?.nongst_bank_branch || "",
      nongst_upi_id: pComp?.nongst_upi_id || "",
      nongst_payment_qr_url: pComp?.nongst_payment_qr_url || "",
      terms_conditions: pComp?.terms_conditions || (pComp as any)?.terms || "",
      invoice_notes: pComp?.invoice_notes || (pComp as any)?.notes || "",
      status: "active"
    })
    setShowBranchModal(true)
  };
    return __fn(...__args);
  };
}
