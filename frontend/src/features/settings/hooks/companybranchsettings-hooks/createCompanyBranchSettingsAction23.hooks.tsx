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

export function createCompanyBranchSettingsAction23(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setTargetCompanyIdForBranch, setEditingBranch, setBranchModalTab, setBranchName, setBranchCode, setBranchBrandName, setBranchDivisionName, setBranchSubtitle, setBranchLogoUrl, setBranchManager, setBranchManagerPhone, setBranchManagerEmail, setBranchGstin, setBranchPan, setBranchCin, setBranchMsmeReg, setBranchAddress, setBranchCity, setBranchState, setBranchZip, setBranchCountry, setBranchPhone, setBranchEmail, setBranchWebsite, setBranchBankName, setBranchAccountHolder, setBranchAccountNumber, setBranchIfscCode, setBranchBankBranch, setBranchUpiId, setBranchPaymentQrUrl, setBranchBankProfileTab, setBranchGstBankName, setBranchGstAccountHolder, setBranchGstAccountNumber, setBranchGstIfscCode, setBranchGstBankBranch, setBranchGstUpiId, setBranchGstPaymentQrUrl, setBranchNongstBankName, setBranchNongstAccountHolder, setBranchNongstAccountNumber, setBranchNongstIfscCode, setBranchNongstBankBranch, setBranchNongstUpiId, setBranchNongstPaymentQrUrl, setBranchTermsConditions, setBranchSignatoryName, setBranchSignatoryDesignation, setBranchSignatureImageUrl, setBranchStampImageUrl, setBranchStatus, setIsBranchModalOpen } = getCtrl();
    const __fn: any = (branch: Branch) => {
    setTargetCompanyIdForBranch(branch.companyId)
    setEditingBranch(branch)
    setBranchModalTab("basic")
    setBranchName(branch.name || "")
    setBranchCode(branch.code || "")
    setBranchBrandName(branch.brand_name || "")
    setBranchDivisionName(branch.division_name || "")
    setBranchSubtitle(branch.subtitle || "")
    setBranchLogoUrl(branch.logo_url || "")
    setBranchManager(branch.managerName || "")
    setBranchManagerPhone(branch.managerPhone || "")
    setBranchManagerEmail(branch.managerEmail || "")
    setBranchGstin(branch.gstin || "")
    setBranchPan(branch.pan || "")
    setBranchCin(branch.cin || "")
    setBranchMsmeReg(branch.msme_reg || "")
    setBranchAddress(branch.address || "")
    setBranchCity(branch.city || "")
    setBranchState(branch.state || "")
    setBranchZip(branch.zip || "")
    setBranchCountry(branch.country || "India")
    setBranchPhone(branch.phone || "")
    setBranchEmail(branch.email || "")
    setBranchWebsite(branch.website || "")
    setBranchBankName(branch.bank_name || "")
    setBranchAccountHolder(branch.account_holder || "")
    setBranchAccountNumber(branch.account_number || "")
    setBranchIfscCode(branch.ifsc_code || "")
    setBranchBankBranch(branch.bank_branch || "")
    setBranchUpiId(branch.upi_id || "")
    setBranchPaymentQrUrl(branch.payment_qr_url || "")

    // Dual GST and Non-GST Profiles for Branch
    setBranchBankProfileTab("gst")
    setBranchGstBankName(branch.gst_bank_name || branch.bank_name || "")
    setBranchGstAccountHolder(branch.gst_account_holder || branch.account_holder || "")
    setBranchGstAccountNumber(branch.gst_account_number || branch.account_number || "")
    setBranchGstIfscCode(branch.gst_ifsc_code || branch.ifsc_code || "")
    setBranchGstBankBranch(branch.gst_bank_branch || branch.bank_branch || "")
    setBranchGstUpiId(branch.gst_upi_id || branch.upi_id || "")
    setBranchGstPaymentQrUrl(branch.gst_payment_qr_url || branch.payment_qr_url || "")

    setBranchNongstBankName(branch.nongst_bank_name || branch.bank_name || "")
    setBranchNongstAccountHolder(branch.nongst_account_holder || branch.account_holder || "")
    setBranchNongstAccountNumber(branch.nongst_account_number || branch.account_number || "")
    setBranchNongstIfscCode(branch.nongst_ifsc_code || branch.ifsc_code || "")
    setBranchNongstBankBranch(branch.nongst_bank_branch || branch.bank_branch || "")
    setBranchNongstUpiId(branch.nongst_upi_id || branch.upi_id || "")
    setBranchNongstPaymentQrUrl(branch.nongst_payment_qr_url || branch.payment_qr_url || "")

    setBranchTermsConditions(branch.terms_conditions || "")
    setBranchSignatoryName(branch.signatory_name || "")
    setBranchSignatoryDesignation(branch.signatory_designation || "")
    setBranchSignatureImageUrl(branch.signature_image_url || "")
    setBranchStampImageUrl(branch.stamp_image_url || "")
    setBranchStatus(branch.status)
    setIsBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
