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

export function createCompanyBranchSettingsAction22(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setTargetCompanyIdForBranch, setEditingBranch, setBranchModalTab, setBranchName, setBranchCode, setBranchBrandName, setBranchDivisionName, setBranchSubtitle, setBranchLogoUrl, setBranchManager, setBranchManagerPhone, setBranchManagerEmail, setBranchGstin, setBranchPan, setBranchCin, setBranchMsmeReg, setBranchAddress, setBranchCity, setBranchState, setBranchZip, setBranchCountry, setBranchPhone, setBranchEmail, setBranchWebsite, setBranchBankName, setBranchAccountHolder, setBranchAccountNumber, setBranchIfscCode, setBranchBankBranch, setBranchUpiId, setBranchPaymentQrUrl, setBranchBankProfileTab, setBranchGstBankName, setBranchGstAccountHolder, setBranchGstAccountNumber, setBranchGstIfscCode, setBranchGstBankBranch, setBranchGstUpiId, setBranchGstPaymentQrUrl, setBranchNongstBankName, setBranchNongstAccountHolder, setBranchNongstAccountNumber, setBranchNongstIfscCode, setBranchNongstBankBranch, setBranchNongstUpiId, setBranchNongstPaymentQrUrl, setBranchTermsConditions, setBranchSignatoryName, setBranchSignatoryDesignation, setBranchSignatureImageUrl, setBranchStampImageUrl, setBranchStatus, setIsBranchModalOpen } = getCtrl();
    const __fn: any = (compId: string) => {
    setTargetCompanyIdForBranch(compId)
    setEditingBranch(null)
    setBranchModalTab("basic")
    setBranchName("")
    setBranchCode(`BR-${Math.floor(100 + Math.random() * 900)}`)
    setBranchBrandName("")
    setBranchDivisionName("")
    setBranchSubtitle("")
    setBranchLogoUrl("")
    setBranchManager("")
    setBranchManagerPhone("")
    setBranchManagerEmail("")
    setBranchGstin("")
    setBranchPan("")
    setBranchCin("")
    setBranchMsmeReg("")
    setBranchAddress("")
    setBranchCity("")
    setBranchState("")
    setBranchZip("")
    setBranchCountry("India")
    setBranchPhone("")
    setBranchEmail("")
    setBranchWebsite("")
    setBranchBankName("")
    setBranchAccountHolder("")
    setBranchAccountNumber("")
    setBranchIfscCode("")
    setBranchBankBranch("")
    setBranchUpiId("")
    setBranchPaymentQrUrl("")
    setBranchBankProfileTab("gst")
    setBranchGstBankName("")
    setBranchGstAccountHolder("")
    setBranchGstAccountNumber("")
    setBranchGstIfscCode("")
    setBranchGstBankBranch("")
    setBranchGstUpiId("")
    setBranchGstPaymentQrUrl("")
    setBranchNongstBankName("")
    setBranchNongstAccountHolder("")
    setBranchNongstAccountNumber("")
    setBranchNongstIfscCode("")
    setBranchNongstBankBranch("")
    setBranchNongstUpiId("")
    setBranchNongstPaymentQrUrl("")
    setBranchTermsConditions("")
    setBranchSignatoryName("")
    setBranchSignatoryDesignation("")
    setBranchSignatureImageUrl("")
    setBranchStampImageUrl("")
    setBranchStatus("Active")
    setIsBranchModalOpen(true)
  };
    return __fn(...__args);
  };
}
