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

export function createCompanyBranchSettingsAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { isSuperAdmin, setEditingCompany, setCompanyModalTab, setCompanyBrandName, setCompanyDivisionName, setCompanyName, setCompanySubtitle, setCompanySlug, setCompanyLogo, setCompanyLogoUrl, setCompanyCurrency, setCompanyCurrencySymbol, setCompanyCin, setCompanyGstin, setCompanyPan, setCompanyAddress, setCompanyPhone, setCompanyEmail, setCompanyWebsite, setCompanyUpiId, setCompanyAccountHolder, setCompanyBankName, setCompanyAccountNumber, setCompanyIfscCode, setCompanyBankBranch, setCompanyPaymentQrUrl, setCompanyBankProfileTab, setCompanyGstBankName, setCompanyGstAccountHolder, setCompanyGstAccountNumber, setCompanyGstIfscCode, setCompanyGstBankBranch, setCompanyGstUpiId, setCompanyGstPaymentQrUrl, setCompanyNongstBankName, setCompanyNongstAccountHolder, setCompanyNongstAccountNumber, setCompanyNongstIfscCode, setCompanyNongstBankBranch, setCompanyNongstUpiId, setCompanyNongstPaymentQrUrl, setCompanyTermsConditions, setCompanySignatoryName, setCompanySignatoryDesignation, setCompanySignatureImageUrl, setCompanyStampImageUrl, setCompanySmtpPreset, setCompanySmtpHost, setCompanySmtpPort, setCompanySmtpSecure, setCompanySmtpUser, setCompanySmtpPass, setCompanySmtpFromName, setCompanySmtpFromEmail, setCompanySmtpTestResult, setCompanyTestEmail, setIsCompanyModalOpen } = getCtrl();
    const __fn: any = () => {
    if (!isSuperAdmin) return
    setEditingCompany(null)
    setCompanyModalTab("basic")
    setCompanyBrandName("SAAMPARK")
    setCompanyDivisionName("")
    setCompanyName("SAAMPARK")
    setCompanySubtitle("")
    setCompanySlug("saampark")
    setCompanyLogo("🏢")
    setCompanyLogoUrl("/saampark-logo.png")
    setCompanyCurrency("INR")
    setCompanyCurrencySymbol("₹")
    setCompanyCin("")
    setCompanyGstin("")
    setCompanyPan("")
    setCompanyAddress("")
    setCompanyPhone("")
    setCompanyEmail("")
    setCompanyWebsite("")
    setCompanyUpiId("")
    setCompanyAccountHolder("")
    setCompanyBankName("")
    setCompanyAccountNumber("")
    setCompanyIfscCode("")
    setCompanyBankBranch("")
    setCompanyPaymentQrUrl("")
    setCompanyBankProfileTab("gst")
    setCompanyGstBankName("")
    setCompanyGstAccountHolder("")
    setCompanyGstAccountNumber("")
    setCompanyGstIfscCode("")
    setCompanyGstBankBranch("")
    setCompanyGstUpiId("")
    setCompanyGstPaymentQrUrl("")
    setCompanyNongstBankName("")
    setCompanyNongstAccountHolder("")
    setCompanyNongstAccountNumber("")
    setCompanyNongstIfscCode("")
    setCompanyNongstBankBranch("")
    setCompanyNongstUpiId("")
    setCompanyNongstPaymentQrUrl("")
    setCompanyTermsConditions("1. E.& O.E.\n2. Total payment due within due date to avoid suspension/cancellation.\n3. Please include invoice number in payment notes.\n4. All disputes subject to jurisdiction.")
    setCompanySignatoryName("Authorized Signatory")
    setCompanySignatoryDesignation("Managing Director")
    setCompanySignatureImageUrl("")
    setCompanyStampImageUrl("")
    setCompanySmtpPreset("gmail")
    setCompanySmtpHost("smtp.gmail.com")
    setCompanySmtpPort("587")
    setCompanySmtpSecure(false)
    setCompanySmtpUser("")
    setCompanySmtpPass("")
    setCompanySmtpFromName("SAAMPARK")
    setCompanySmtpFromEmail("")
    setCompanySmtpTestResult(null)
    setCompanyTestEmail("")
    setIsCompanyModalOpen(true)
  };
    return __fn(...__args);
  };
}
