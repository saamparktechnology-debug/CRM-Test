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

export function createCompanyBranchSettingsAction24(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setSubBranchParentBranchId, setSubBranchCompanyId, setEditingSubBranch, setSubBranchModalTab, setSubBranchName, setSubBranchCode, setSubBranchBrandName, setSubBranchDivisionName, setSubBranchSubtitle, setSubBranchLogoUrl, setSubBranchPartnerName, setSubBranchPartnerPhone, setSubBranchPartnerEmail, setSubBranchCity, setSubBranchState, setSubBranchAddress, setSubBranchZip, setSubBranchCountry, setSubBranchPhone, setSubBranchEmail, setSubBranchWebsite, setSubBranchRevenueSharePct, setSubBranchPartnerType, setSubBranchGstin, setSubBranchPan, setSubBranchCin, setSubBranchMsmeReg, setSubBranchAccountHolder, setSubBranchBankName, setSubBranchAccountNumber, setSubBranchIfscCode, setSubBranchBankBranch, setSubBranchUpiId, setSubBranchPaymentQrUrl, setSubBranchBankProfileTab, setSubBranchGstBankName, setSubBranchGstAccountHolder, setSubBranchGstAccountNumber, setSubBranchGstIfscCode, setSubBranchGstBankBranch, setSubBranchGstUpiId, setSubBranchGstPaymentQrUrl, setSubBranchNongstBankName, setSubBranchNongstAccountHolder, setSubBranchNongstAccountNumber, setSubBranchNongstIfscCode, setSubBranchNongstBankBranch, setSubBranchNongstUpiId, setSubBranchNongstPaymentQrUrl, setSubBranchTermsConditions, setSubBranchSignatoryName, setSubBranchSignatoryDesignation, setSubBranchSignatureImageUrl, setSubBranchStampImageUrl, setSubBranchStatus, setIsSubBranchModalOpen } = getCtrl();
    const __fn: any = (parentBranch: Branch) => {
    setSubBranchParentBranchId(parentBranch.id)
    setSubBranchCompanyId(parentBranch.companyId)
    setEditingSubBranch(null)
    setSubBranchModalTab("basic")
    setSubBranchName("")
    setSubBranchCode(`SB-${Math.floor(100 + Math.random() * 900)}`)
    setSubBranchBrandName("")
    setSubBranchDivisionName("")
    setSubBranchSubtitle("")
    setSubBranchLogoUrl("")
    setSubBranchPartnerName("")
    setSubBranchPartnerPhone("")
    setSubBranchPartnerEmail("")
    setSubBranchCity(parentBranch.city || "")
    setSubBranchState(parentBranch.state || "")
    setSubBranchAddress("")
    setSubBranchZip("")
    setSubBranchCountry("India")
    setSubBranchPhone("")
    setSubBranchEmail("")
    setSubBranchWebsite("")
    setSubBranchRevenueSharePct(30)
    setSubBranchPartnerType("Franchise Partner")
    setSubBranchGstin("")
    setSubBranchPan("")
    setSubBranchCin("")
    setSubBranchMsmeReg("")
    setSubBranchAccountHolder("")
    setSubBranchBankName("")
    setSubBranchAccountNumber("")
    setSubBranchIfscCode("")
    setSubBranchBankBranch("")
    setSubBranchUpiId("")
    setSubBranchPaymentQrUrl("")
    setSubBranchBankProfileTab("gst")
    setSubBranchGstBankName("")
    setSubBranchGstAccountHolder("")
    setSubBranchGstAccountNumber("")
    setSubBranchGstIfscCode("")
    setSubBranchGstBankBranch("")
    setSubBranchGstUpiId("")
    setSubBranchGstPaymentQrUrl("")
    setSubBranchNongstBankName("")
    setSubBranchNongstAccountHolder("")
    setSubBranchNongstAccountNumber("")
    setSubBranchNongstIfscCode("")
    setSubBranchNongstBankBranch("")
    setSubBranchNongstUpiId("")
    setSubBranchNongstPaymentQrUrl("")
    setSubBranchTermsConditions("")
    setSubBranchSignatoryName("")
    setSubBranchSignatoryDesignation("")
    setSubBranchSignatureImageUrl("")
    setSubBranchStampImageUrl("")
    setSubBranchStatus("Active")
    setIsSubBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
