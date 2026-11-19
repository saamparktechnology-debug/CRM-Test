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

export function createCompanyBranchSettingsHandler2(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { isSuperAdmin, companyBrandName, companyDivisionName, companySubtitle, companyName, companySlug, companyLogo, companyLogoUrl, companyCurrency, companyCurrencySymbol, companyCin, companyGstin, companyPan, companyAddress, companyPhone, companyEmail, companyWebsite, companyGstUpiId, companyUpiId, companyNongstUpiId, companyGstAccountHolder, companyAccountHolder, companyNongstAccountHolder, companyGstBankName, companyBankName, companyNongstBankName, companyGstAccountNumber, companyAccountNumber, companyNongstAccountNumber, companyGstIfscCode, companyIfscCode, companyNongstIfscCode, companyGstBankBranch, companyBankBranch, companyNongstBankBranch, companyGstPaymentQrUrl, companyPaymentQrUrl, companyNongstPaymentQrUrl, companyTermsConditions, companySignatoryName, companySignatoryDesignation, companySignatureImageUrl, companyStampImageUrl, companySmtpHost, companySmtpPort, companySmtpSecure, companySmtpUser, companySmtpPass, companySmtpFromName, companySmtpFromEmail, isClientRole, user, editingCompany, updateCompany, addCompany, companyEnabledModulesState, setCompanyEnabledModules, fetchCompanies, setIsCompanyModalOpen } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin) {
      alert("Only Super Admin can modify or create company records.")
      return
    }

    const brand = companyBrandName.trim() || "SAAMPARK"
    const division = companyDivisionName.trim()
    const subtitle = companySubtitle.trim()

    const finalName = [brand, division].filter(Boolean).join(" ") || companyName.trim() || brand || "SAAMPARK"
    if (!finalName) return

    const slug = companySlug.trim() || finalName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const payload: Partial<Company> = {
      name: finalName,
      brand_name: brand,
      division_name: division,
      subtitle: subtitle,
      slug,
      logo: companyLogo || "🏢",
      logo_url: companyLogoUrl.trim(),
      currency: companyCurrency.trim() || "INR",
      currency_symbol: companyCurrencySymbol.trim() || "₹",
      cin: companyCin.trim(),
      gstin: companyGstin.trim(),
      pan: companyPan.trim(),
      address: companyAddress.trim(),
      phone: companyPhone.trim(),
      email: companyEmail.trim(),
      website: companyWebsite.trim(),
      // Base/Fallback Banking
      upi_id: (companyGstUpiId || companyUpiId || companyNongstUpiId).trim(),
      account_holder: (companyGstAccountHolder || companyAccountHolder || companyNongstAccountHolder).trim(),
      bank_name: (companyGstBankName || companyBankName || companyNongstBankName).trim(),
      account_number: (companyGstAccountNumber || companyAccountNumber || companyNongstAccountNumber).trim(),
      ifsc_code: (companyGstIfscCode || companyIfscCode || companyNongstIfscCode).trim(),
      bank_branch: (companyGstBankBranch || companyBankBranch || companyNongstBankBranch).trim(),
      payment_qr_url: companyGstPaymentQrUrl || companyPaymentQrUrl || companyNongstPaymentQrUrl,
      // Distinct GST Banking Profile
      gst_bank_name: companyGstBankName.trim(),
      gst_account_holder: companyGstAccountHolder.trim(),
      gst_account_number: companyGstAccountNumber.trim(),
      gst_ifsc_code: companyGstIfscCode.trim().toUpperCase(),
      gst_bank_branch: companyGstBankBranch.trim(),
      gst_upi_id: companyGstUpiId.trim(),
      gst_payment_qr_url: companyGstPaymentQrUrl,
      // Distinct Non-GST Banking Profile
      nongst_bank_name: companyNongstBankName.trim(),
      nongst_account_holder: companyNongstAccountHolder.trim(),
      nongst_account_number: companyNongstAccountNumber.trim(),
      nongst_ifsc_code: companyNongstIfscCode.trim().toUpperCase(),
      nongst_bank_branch: companyNongstBankBranch.trim(),
      nongst_upi_id: companyNongstUpiId.trim(),
      nongst_payment_qr_url: companyNongstPaymentQrUrl,
      terms_conditions: companyTermsConditions.trim(),
      signatory_name: companySignatoryName.trim(),
      signatory_designation: companySignatoryDesignation.trim(),
      signature_image_url: companySignatureImageUrl.trim(),
      stamp_image_url: companyStampImageUrl.trim(),
      smtp_host: companySmtpHost.trim() || "smtp.gmail.com",
      smtp_port: companySmtpPort.trim() || "587",
      smtp_secure: companySmtpSecure,
      smtp_user: companySmtpUser.trim(),
      smtp_pass: companySmtpPass.trim(),
      smtp_from_name: companySmtpFromName.trim() || finalName,
      smtp_from_email: companySmtpFromEmail.trim() || companySmtpUser.trim(),
      ...(isClientRole && user ? {
        clientId: user.id,
        createdById: user.id,
        createdByEmail: user.email,
        clientEmail: user.email,
      } : {}),
    }

    const isEdit = !!editingCompany
    const targetCompId = editingCompany ? (editingCompany.id || editingCompany.slug || slug) : slug

    await executeWithFeedback(async () => {
      if (editingCompany) {
        await updateCompany(editingCompany.id, payload)
      } else {
        await addCompany(payload)
      }

      if (isSuperAdmin && companyEnabledModulesState.length > 0) {
        setCompanyEnabledModules(targetCompId, companyEnabledModulesState)
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('saampark_data_synced'))
          window.dispatchEvent(new Event('storage'))
        }
      }

      await fetchCompanies().catch(() => {})
      setIsCompanyModalOpen(false)
    }, {
      actionType: isEdit ? "update" : "create",
      loadingTitle: isEdit ? "Saving Company Profile..." : "Creating Entity...",
      loadingMsg: `Applying corporate branding, GST/Non-GST profiles, and tax details for ${finalName}...`,
      successTitle: isEdit ? "Company Profile Saved!" : "Company Created Successfully!",
      successMsg: `Company profile for ${finalName} with GST and Non-GST credentials has been saved.`,
      errorTitle: "Company Save Failed",
    })
  };
    return __fn(...__args);
  };
}
