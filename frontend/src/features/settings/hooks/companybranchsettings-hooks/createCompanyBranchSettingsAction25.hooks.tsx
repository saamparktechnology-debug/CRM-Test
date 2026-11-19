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

export function createCompanyBranchSettingsAction25(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setSubBranchParentBranchId, setSubBranchCompanyId, setEditingSubBranch, setSubBranchModalTab, setSubBranchName, setSubBranchCode, setSubBranchBrandName, setSubBranchDivisionName, setSubBranchSubtitle, setSubBranchLogoUrl, setSubBranchPartnerName, setSubBranchPartnerPhone, setSubBranchPartnerEmail, setSubBranchCity, setSubBranchState, setSubBranchAddress, setSubBranchZip, setSubBranchCountry, setSubBranchPhone, setSubBranchEmail, setSubBranchWebsite, setSubBranchRevenueSharePct, setSubBranchPartnerType, setSubBranchGstin, setSubBranchPan, setSubBranchCin, setSubBranchMsmeReg, setSubBranchAccountHolder, setSubBranchBankName, setSubBranchAccountNumber, setSubBranchIfscCode, setSubBranchBankBranch, setSubBranchUpiId, setSubBranchPaymentQrUrl, setSubBranchBankProfileTab, setSubBranchGstBankName, setSubBranchGstAccountHolder, setSubBranchGstAccountNumber, setSubBranchGstIfscCode, setSubBranchGstBankBranch, setSubBranchGstUpiId, setSubBranchGstPaymentQrUrl, setSubBranchNongstBankName, setSubBranchNongstAccountHolder, setSubBranchNongstAccountNumber, setSubBranchNongstIfscCode, setSubBranchNongstBankBranch, setSubBranchNongstUpiId, setSubBranchNongstPaymentQrUrl, setSubBranchTermsConditions, setSubBranchSignatoryName, setSubBranchSignatoryDesignation, setSubBranchSignatureImageUrl, setSubBranchStampImageUrl, setSubBranchStatus, setIsSubBranchModalOpen } = getCtrl();
    const __fn: any = (sb: SubBranch) => {
    setSubBranchParentBranchId(sb.parentBranchId)
    setSubBranchCompanyId(sb.companyId)
    setEditingSubBranch(sb)
    setSubBranchModalTab("basic")
    setSubBranchName(sb.name || "")
    setSubBranchCode(sb.code || "")
    setSubBranchBrandName(sb.brand_name || "")
    setSubBranchDivisionName(sb.division_name || "")
    setSubBranchSubtitle(sb.subtitle || "")
    setSubBranchLogoUrl(sb.logo_url || "")
    setSubBranchPartnerName(sb.partnerName || "")
    setSubBranchPartnerPhone(sb.partnerPhone || "")
    setSubBranchPartnerEmail(sb.partnerEmail || "")
    setSubBranchCity(sb.city || "")
    setSubBranchState(sb.state || "")
    setSubBranchAddress(sb.address || "")
    setSubBranchZip(sb.zip || "")
    setSubBranchCountry(sb.country || "India")
    setSubBranchPhone(sb.phone || "")
    setSubBranchEmail(sb.email || "")
    setSubBranchWebsite(sb.website || "")
    setSubBranchRevenueSharePct(sb.revenueSharePct ?? 30)
    setSubBranchPartnerType(sb.partnerType || "Franchise Partner")
    setSubBranchGstin(sb.gstin || "")
    setSubBranchPan(sb.pan || "")
    setSubBranchCin(sb.cin || "")
    setSubBranchMsmeReg(sb.msme_reg || "")
    setSubBranchAccountHolder(sb.account_holder || sb.bankDetails?.accountHolder || "")
    setSubBranchBankName(sb.bank_name || sb.bankDetails?.bankName || "")
    setSubBranchAccountNumber(sb.account_number || sb.bankDetails?.accountNumber || "")
    setSubBranchIfscCode(sb.ifsc_code || sb.bankDetails?.ifscCode || "")
    setSubBranchBankBranch(sb.bank_branch || "")
    setSubBranchUpiId(sb.upi_id || sb.bankDetails?.upiId || "")
    setSubBranchPaymentQrUrl(sb.payment_qr_url || "")

    // Dual GST and Non-GST Profiles for Sub-Branch
    setSubBranchBankProfileTab("gst")
    setSubBranchGstBankName(sb.gst_bank_name || sb.bank_name || sb.bankDetails?.bankName || "")
    setSubBranchGstAccountHolder(sb.gst_account_holder || sb.account_holder || sb.bankDetails?.accountHolder || "")
    setSubBranchGstAccountNumber(sb.gst_account_number || sb.account_number || sb.bankDetails?.accountNumber || "")
    setSubBranchGstIfscCode(sb.gst_ifsc_code || sb.ifsc_code || sb.bankDetails?.ifscCode || "")
    setSubBranchGstBankBranch(sb.gst_bank_branch || sb.bank_branch || "")
    setSubBranchGstUpiId(sb.gst_upi_id || sb.upi_id || sb.bankDetails?.upiId || "")
    setSubBranchGstPaymentQrUrl(sb.gst_payment_qr_url || sb.payment_qr_url || "")

    setSubBranchNongstBankName(sb.nongst_bank_name || sb.bank_name || sb.bankDetails?.bankName || "")
    setSubBranchNongstAccountHolder(sb.nongst_account_holder || sb.account_holder || sb.bankDetails?.accountHolder || "")
    setSubBranchNongstAccountNumber(sb.nongst_account_number || sb.account_number || sb.bankDetails?.accountNumber || "")
    setSubBranchNongstIfscCode(sb.nongst_ifsc_code || sb.ifsc_code || sb.bankDetails?.ifscCode || "")
    setSubBranchNongstBankBranch(sb.nongst_bank_branch || sb.bank_branch || "")
    setSubBranchNongstUpiId(sb.nongst_upi_id || sb.upi_id || sb.bankDetails?.upiId || "")
    setSubBranchNongstPaymentQrUrl(sb.nongst_payment_qr_url || sb.payment_qr_url || "")

    setSubBranchTermsConditions(sb.terms_conditions || "")
    setSubBranchSignatoryName(sb.signatory_name || "")
    setSubBranchSignatoryDesignation(sb.signatory_designation || "")
    setSubBranchSignatureImageUrl(sb.signature_image_url || "")
    setSubBranchStampImageUrl(sb.stamp_image_url || "")
    setSubBranchStatus(sb.status)
    setIsSubBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
