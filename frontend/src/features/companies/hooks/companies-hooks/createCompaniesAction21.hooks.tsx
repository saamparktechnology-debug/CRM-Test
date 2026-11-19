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

export function createCompaniesAction21(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setEditingCompany, setCompanyTab, setCompanyBankSubTab, setCompanyLogoPos, setCompanySignaturePos, setCompanyStampPos, setCompanyLogoScale, setCompanyStampScale, setCompanySignatureScale, setCompanyCustomStamps, setCompanyZoom, setPreviewInvoiceType, setCompanyForm, setShowCompanyModal } = getCtrl();
    const __fn: any = (c: any) => {
    setEditingCompany(c)
    setCompanyTab("identity")
    setCompanyBankSubTab("gst")
    setCompanyLogoPos(c.logo_position || { x: 0, y: 0 })
    setCompanySignaturePos(c.signature_position || { x: 0, y: 0 })
    setCompanyStampPos(c.stamp_position || { x: 0, y: 0 })
    setCompanyLogoScale(c.logo_scale ?? 1)
    setCompanyStampScale(c.stamp_scale ?? 1)
    setCompanySignatureScale(c.signature_scale ?? 1)
    setCompanyCustomStamps(Array.isArray(c.custom_stamps) ? c.custom_stamps : [])
    setCompanyZoom(c.zoom || 100)
    setPreviewInvoiceType(c.preview_invoice_type || "gst")
    setCompanyForm({
      name: c.name || "", brand_name: c.brand_name || "", division_name: c.division_name || "", subtitle: c.subtitle || "", slug: c.slug || "", trademark_symbol: c.trademark_symbol || "",
      industry: c.industry || "Technology", currency: c.currency || "INR", logo_url: c.logo_url || "",
      gstin: c.gstin || "", pan: c.pan || "", cin: c.cin || "", msme_reg: c.msme_reg || "",
      iso_certification: c.iso_certification ?? "An ISO 9001:2015 Certified Company",
      signatory_name: c.signatory_name || "Authorized Signatory", signatory_designation: c.signatory_designation || "Managing Director", signature_image_url: c.signature_image_url || "", stamp_image_url: c.stamp_image_url || "",
      address: c.address || "", city: c.city || "", state: c.state || "", zip: c.zip || "", country: c.country || "India", phone: c.phone || "", email: c.email || "", website: c.website || "",
      bottom_footer_text: c.bottom_footer_text || "",
      bank_name: c.bank_name || "",
      account_holder: c.account_holder || "",
      account_number: c.account_number || "",
      ifsc_code: c.ifsc_code || "",
      bank_branch: c.bank_branch || "",
      upi_id: c.upi_id || "",
      payment_qr_url: c.payment_qr_url || "",
      gst_bank_name: c.gst_bank_name || "",
      gst_account_holder: c.gst_account_holder || "",
      gst_account_number: c.gst_account_number || "",
      gst_ifsc_code: c.gst_ifsc_code || "",
      gst_bank_branch: c.gst_bank_branch || "",
      gst_upi_id: c.gst_upi_id || "",
      gst_payment_qr_url: c.gst_payment_qr_url || "",
      nongst_bank_name: c.nongst_bank_name || "",
      nongst_account_holder: c.nongst_account_holder || "",
      nongst_account_number: c.nongst_account_number || "",
      nongst_ifsc_code: c.nongst_ifsc_code || "",
      nongst_bank_branch: c.nongst_bank_branch || "",
      nongst_upi_id: c.nongst_upi_id || "",
      nongst_payment_qr_url: c.nongst_payment_qr_url || "",
      terms_conditions: c.terms_conditions || c.terms || "1. All disputes subject to local jurisdiction only.\n2. Goods/Services once delivered are non-refundable.\n3. Disputed items must be notified within 7 business days.",
      invoice_notes: c.invoice_notes || c.notes || "Thank you for partnering with us. Please remit payment according to the stated terms.",
      quotation_notes: c.quotation_notes || "This quotation is valid for 30 calendar days from the date of issuance.",
      status: c.status || "active"
    })
    setShowCompanyModal(true)
  };
    return __fn(...__args);
  };
}
