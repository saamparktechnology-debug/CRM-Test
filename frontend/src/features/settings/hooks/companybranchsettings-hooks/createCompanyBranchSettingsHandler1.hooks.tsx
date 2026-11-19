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

export function createCompanyBranchSettingsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { isSuperAdmin, setEditingCompany, setCompanyModalTab, setCompanyBrandName, setCompanyDivisionName, setCompanyName, setCompanySubtitle, setCompanySlug, setCompanyLogo, setCompanyLogoUrl, setCompanyCurrency, setCompanyCurrencySymbol, setCompanyCin, setCompanyGstin, setCompanyPan, setCompanyAddress, setCompanyPhone, setCompanyEmail, setCompanyWebsite, setCompanyUpiId, setCompanyAccountHolder, setCompanyBankName, setCompanyAccountNumber, setCompanyIfscCode, setCompanyBankBranch, setCompanyPaymentQrUrl, setCompanyBankProfileTab, setCompanyGstBankName, setCompanyGstAccountHolder, setCompanyGstAccountNumber, setCompanyGstIfscCode, setCompanyGstBankBranch, setCompanyGstUpiId, setCompanyGstPaymentQrUrl, setCompanyNongstBankName, setCompanyNongstAccountHolder, setCompanyNongstAccountNumber, setCompanyNongstIfscCode, setCompanyNongstBankBranch, setCompanyNongstUpiId, setCompanyNongstPaymentQrUrl, setCompanyTermsConditions, setCompanySignatoryName, setCompanySignatoryDesignation, setCompanySignatureImageUrl, setCompanyStampImageUrl, setCompanySmtpHost, setCompanySmtpPort, setCompanySmtpSecure, setCompanySmtpUser, setCompanySmtpPass, setCompanySmtpFromName, setCompanySmtpFromEmail, setCompanySmtpPreset, setCompanySmtpTestResult, setCompanyTestEmail, getEnabledModulesForCompany, setCompanyEnabledModulesState, setIsCompanyModalOpen } = getCtrl();
    const __fn: any = (company: Company) => {
    if (!isSuperAdmin) return
    setEditingCompany(company)
    setCompanyModalTab("basic")

    const brand = (company.brand_name || "SAAMPARK").trim()
    const division = (company.division_name || "").trim()
    
    setCompanyBrandName(brand)
    setCompanyDivisionName(division)
    setCompanyName(company.name || [brand, division].filter(Boolean).join(" "))
    setCompanySubtitle(company.subtitle || "")
    setCompanySlug(company.slug || company.id || "")
    setCompanyLogo(company.logo || "🏢")
    setCompanyLogoUrl(company.logo_url || "")
    setCompanyCurrency(company.currency || "INR")
    setCompanyCurrencySymbol(company.currency_symbol || "₹")
    setCompanyCin(company.cin || "")
    setCompanyGstin(company.gstin || "")
    setCompanyPan(company.pan || "")
    setCompanyAddress(company.address || "")
    setCompanyPhone(company.phone || "")
    setCompanyEmail(company.email || "")
    setCompanyWebsite(company.website || "")
    setCompanyUpiId(company.upi_id || "")
    setCompanyAccountHolder(company.account_holder || "")
    setCompanyBankName(company.bank_name || "")
    setCompanyAccountNumber(company.account_number || "")
    setCompanyIfscCode(company.ifsc_code || "")
    setCompanyBankBranch(company.bank_branch || "")
    setCompanyPaymentQrUrl(company.payment_qr_url || "")

    // Dual GST and Non-GST Profiles
    setCompanyBankProfileTab("gst")
    setCompanyGstBankName(company.gst_bank_name || company.bank_name || "")
    setCompanyGstAccountHolder(company.gst_account_holder || company.account_holder || "")
    setCompanyGstAccountNumber(company.gst_account_number || company.account_number || "")
    setCompanyGstIfscCode(company.gst_ifsc_code || company.ifsc_code || "")
    setCompanyGstBankBranch(company.gst_bank_branch || company.bank_branch || "")
    setCompanyGstUpiId(company.gst_upi_id || company.upi_id || "")
    setCompanyGstPaymentQrUrl(company.gst_payment_qr_url || company.payment_qr_url || "")

    setCompanyNongstBankName(company.nongst_bank_name || company.bank_name || "")
    setCompanyNongstAccountHolder(company.nongst_account_holder || company.account_holder || "")
    setCompanyNongstAccountNumber(company.nongst_account_number || company.account_number || "")
    setCompanyNongstIfscCode(company.nongst_ifsc_code || company.ifsc_code || "")
    setCompanyNongstBankBranch(company.nongst_bank_branch || company.bank_branch || "")
    setCompanyNongstUpiId(company.nongst_upi_id || company.upi_id || "")
    setCompanyNongstPaymentQrUrl(company.nongst_payment_qr_url || company.payment_qr_url || "")

    setCompanyTermsConditions(company.terms_conditions || "")
    setCompanySignatoryName(company.signatory_name || "Authorized Signatory")
    setCompanySignatoryDesignation(company.signatory_designation || "")
    setCompanySignatureImageUrl(company.signature_image_url || "")
    setCompanyStampImageUrl(company.stamp_image_url || "")

    // Load Company SMTP
    const host = company.smtp_host || "smtp.gmail.com"
    const port = String(company.smtp_port || "587")
    setCompanySmtpHost(host)
    setCompanySmtpPort(port)
    setCompanySmtpSecure(!!company.smtp_secure || port === "465")
    setCompanySmtpUser(company.smtp_user || "")
    setCompanySmtpPass(company.smtp_pass || "")
    setCompanySmtpFromName(company.smtp_from_name || company.name || "")
    setCompanySmtpFromEmail(company.smtp_from_email || company.email || "")
    if (host.includes("gmail")) setCompanySmtpPreset("gmail")
    else if (host.includes("zoho")) setCompanySmtpPreset("zoho")
    else if (host.includes("office365") || host.includes("outlook")) setCompanySmtpPreset("outlook")
    else setCompanySmtpPreset("custom")
    setCompanySmtpTestResult(null)
    setCompanyTestEmail(company.smtp_user || "")

    // Load Company Modules
    const compModules = getEnabledModulesForCompany(company.id || company.slug)
    setCompanyEnabledModulesState(compModules)

    setIsCompanyModalOpen(true)
  };
    return __fn(...__args);
  };
}
