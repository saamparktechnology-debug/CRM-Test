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

export function createCompanyBranchSettingsHandler4(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { subBranchName, subBranchParentBranchId, subBranchCompanyId, subBranchCode, subBranchBrandName, subBranchDivisionName, subBranchSubtitle, subBranchLogoUrl, subBranchPartnerName, subBranchPartnerPhone, subBranchPartnerEmail, subBranchCity, subBranchState, subBranchAddress, subBranchZip, subBranchCountry, subBranchPhone, subBranchEmail, subBranchWebsite, subBranchRevenueSharePct, subBranchPartnerType, subBranchGstin, subBranchPan, subBranchCin, subBranchMsmeReg, subBranchTermsConditions, subBranchSignatoryName, subBranchSignatoryDesignation, subBranchSignatureImageUrl, subBranchStampImageUrl, subBranchGstBankName, subBranchBankName, subBranchNongstBankName, subBranchGstAccountHolder, subBranchAccountHolder, subBranchNongstAccountHolder, subBranchGstAccountNumber, subBranchAccountNumber, subBranchNongstAccountNumber, subBranchGstIfscCode, subBranchIfscCode, subBranchNongstIfscCode, subBranchGstBankBranch, subBranchBankBranch, subBranchNongstBankBranch, subBranchGstUpiId, subBranchUpiId, subBranchNongstUpiId, subBranchGstPaymentQrUrl, subBranchPaymentQrUrl, subBranchNongstPaymentQrUrl, subBranchStatus, editingSubBranch, updateSubBranch, addSubBranch, fetchSubBranches, setIsSubBranchModalOpen } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subBranchName.trim() || !subBranchParentBranchId) {
      alert("Sub-Branch Name and Parent Branch are required.")
      return
    }

    const payload: Partial<SubBranch> = {
      parentBranchId: subBranchParentBranchId,
      companyId: subBranchCompanyId,
      name: subBranchName.trim(),
      code: subBranchCode.trim().toUpperCase(),
      brand_name: subBranchBrandName.trim(),
      division_name: subBranchDivisionName.trim(),
      subtitle: subBranchSubtitle.trim(),
      logo_url: subBranchLogoUrl.trim(),
      partnerName: subBranchPartnerName.trim(),
      partnerPhone: subBranchPartnerPhone.trim(),
      partnerEmail: subBranchPartnerEmail.trim(),
      city: subBranchCity.trim(),
      state: subBranchState.trim(),
      address: subBranchAddress.trim(),
      zip: subBranchZip.trim(),
      country: subBranchCountry.trim(),
      phone: subBranchPhone.trim(),
      email: subBranchEmail.trim(),
      website: subBranchWebsite.trim(),
      revenueSharePct: Number(subBranchRevenueSharePct),
      partnerType: subBranchPartnerType,
      gstin: subBranchGstin.trim(),
      pan: subBranchPan.trim(),
      cin: subBranchCin.trim(),
      msme_reg: subBranchMsmeReg.trim(),
      terms_conditions: subBranchTermsConditions.trim(),
      signatory_name: subBranchSignatoryName.trim(),
      signatory_designation: subBranchSignatoryDesignation.trim(),
      signature_image_url: subBranchSignatureImageUrl,
      stamp_image_url: subBranchStampImageUrl,
      // Base/Fallback Banking
      bank_name: (subBranchGstBankName || subBranchBankName || subBranchNongstBankName).trim(),
      account_holder: (subBranchGstAccountHolder || subBranchAccountHolder || subBranchNongstAccountHolder).trim(),
      account_number: (subBranchGstAccountNumber || subBranchAccountNumber || subBranchNongstAccountNumber).trim(),
      ifsc_code: (subBranchGstIfscCode || subBranchIfscCode || subBranchNongstIfscCode).trim().toUpperCase(),
      bank_branch: (subBranchGstBankBranch || subBranchBankBranch || subBranchNongstBankBranch).trim(),
      upi_id: (subBranchGstUpiId || subBranchUpiId || subBranchNongstUpiId).trim(),
      payment_qr_url: subBranchGstPaymentQrUrl || subBranchPaymentQrUrl || subBranchNongstPaymentQrUrl,
      // Distinct GST Banking Profile
      gst_bank_name: subBranchGstBankName.trim(),
      gst_account_holder: subBranchGstAccountHolder.trim(),
      gst_account_number: subBranchGstAccountNumber.trim(),
      gst_ifsc_code: subBranchGstIfscCode.trim().toUpperCase(),
      gst_bank_branch: subBranchGstBankBranch.trim(),
      gst_upi_id: subBranchGstUpiId.trim(),
      gst_payment_qr_url: subBranchGstPaymentQrUrl,
      // Distinct Non-GST Banking Profile
      nongst_bank_name: subBranchNongstBankName.trim(),
      nongst_account_holder: subBranchNongstAccountHolder.trim(),
      nongst_account_number: subBranchNongstAccountNumber.trim(),
      nongst_ifsc_code: subBranchNongstIfscCode.trim().toUpperCase(),
      nongst_bank_branch: subBranchNongstBankBranch.trim(),
      nongst_upi_id: subBranchNongstUpiId.trim(),
      nongst_payment_qr_url: subBranchNongstPaymentQrUrl,
      bankDetails: {
        accountHolder: (subBranchGstAccountHolder || subBranchAccountHolder || subBranchNongstAccountHolder).trim(),
        bankName: (subBranchGstBankName || subBranchBankName || subBranchNongstBankName).trim(),
        accountNumber: (subBranchGstAccountNumber || subBranchAccountNumber || subBranchNongstAccountNumber).trim(),
        ifscCode: (subBranchGstIfscCode || subBranchIfscCode || subBranchNongstIfscCode).trim().toUpperCase(),
        upiId: (subBranchGstUpiId || subBranchUpiId || subBranchNongstUpiId).trim(),
      },
      status: subBranchStatus,
    }

    const isEdit = !!editingSubBranch
    await executeWithFeedback(async () => {
      if (editingSubBranch) {
        await updateSubBranch(editingSubBranch.id, payload)
      } else {
        await addSubBranch(payload)
      }
      await fetchSubBranches().catch(() => {})
      setIsSubBranchModalOpen(false)
    }, {
      actionType: isEdit ? "update" : "create",
      loadingTitle: isEdit ? "Updating Sub-Branch..." : "Creating Sub-Branch...",
      loadingMsg: `Saving revenue share agreement (${subBranchRevenueSharePct}% Partner / ${100 - subBranchRevenueSharePct}% Company) for ${subBranchName}...`,
      successTitle: isEdit ? "Sub-Branch Updated!" : "Sub-Branch Created!",
      successMsg: `Sub-Branch "${subBranchName}" saved with ${subBranchRevenueSharePct}% partner revenue share.`,
      errorTitle: "Sub-Branch Save Failed",
    })
  };
    return __fn(...__args);
  };
}
