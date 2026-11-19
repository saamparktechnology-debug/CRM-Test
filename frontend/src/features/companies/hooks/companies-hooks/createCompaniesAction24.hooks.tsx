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

export function createCompaniesAction24(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { companies, branchCompanyId, setBranchForm, setBranchCopiedNotice } = getCtrl();
    const __fn: any = () => {
    const parentCompany = companies.find(c => isMatchingCompany(c, branchCompanyId))
    if (!parentCompany) return
    setBranchForm(prev => ({
      ...prev,
      gst_bank_name: parentCompany.gst_bank_name || parentCompany.bank_name || prev.gst_bank_name,
      gst_account_holder: parentCompany.gst_account_holder || parentCompany.account_holder || prev.gst_account_holder,
      gst_account_number: parentCompany.gst_account_number || parentCompany.account_number || prev.gst_account_number,
      gst_ifsc_code: parentCompany.gst_ifsc_code || parentCompany.ifsc_code || prev.gst_ifsc_code,
      gst_bank_branch: parentCompany.gst_bank_branch || parentCompany.bank_branch || prev.gst_bank_branch,
      gst_upi_id: parentCompany.gst_upi_id || parentCompany.upi_id || prev.gst_upi_id,
      gst_payment_qr_url: parentCompany.gst_payment_qr_url || parentCompany.payment_qr_url || prev.gst_payment_qr_url,
      nongst_bank_name: parentCompany.nongst_bank_name || parentCompany.bank_name || prev.nongst_bank_name,
      nongst_account_holder: parentCompany.nongst_account_holder || parentCompany.account_holder || prev.nongst_account_holder,
      nongst_account_number: parentCompany.nongst_account_number || parentCompany.account_number || prev.nongst_account_number,
      nongst_ifsc_code: parentCompany.nongst_ifsc_code || parentCompany.ifsc_code || prev.nongst_ifsc_code,
      nongst_bank_branch: parentCompany.nongst_bank_branch || parentCompany.bank_branch || prev.nongst_bank_branch,
      nongst_upi_id: parentCompany.nongst_upi_id || parentCompany.upi_id || prev.nongst_upi_id,
      nongst_payment_qr_url: parentCompany.nongst_payment_qr_url || parentCompany.payment_qr_url || prev.nongst_payment_qr_url,
      bank_name: parentCompany.gst_bank_name || parentCompany.bank_name || prev.bank_name,
      account_holder: parentCompany.gst_account_holder || parentCompany.account_holder || prev.account_holder,
      account_number: parentCompany.gst_account_number || parentCompany.account_number || prev.account_number,
      ifsc_code: parentCompany.gst_ifsc_code || parentCompany.ifsc_code || prev.ifsc_code,
      bank_branch: parentCompany.gst_bank_branch || parentCompany.bank_branch || prev.bank_branch,
      upi_id: parentCompany.gst_upi_id || parentCompany.upi_id || prev.upi_id,
      payment_qr_url: parentCompany.gst_payment_qr_url || parentCompany.payment_qr_url || prev.payment_qr_url,
      signatory_name: parentCompany.signatory_name || prev.signatory_name,
      signatory_designation: parentCompany.signatory_designation || prev.signatory_designation,
      signature_image_url: parentCompany.signature_image_url || prev.signature_image_url,
      stamp_image_url: parentCompany.stamp_image_url || prev.stamp_image_url,
      terms_conditions: parentCompany.terms_conditions || (parentCompany as any).terms || prev.terms_conditions,
      invoice_notes: parentCompany.invoice_notes || (parentCompany as any).notes || prev.invoice_notes,
    }))
    setBranchCopiedNotice(true)
    setTimeout(() => setBranchCopiedNotice(false), 2500)
  };
    return __fn(...__args);
  };
}
