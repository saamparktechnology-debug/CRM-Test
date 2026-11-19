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

export function createCompanyBranchSettingsHandler3(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { branchName, targetCompanyIdForBranch, isSuperAdmin, visibleCompanies, branchCode, branchBrandName, branchDivisionName, branchSubtitle, branchLogoUrl, branchManager, branchManagerPhone, branchManagerEmail, branchGstin, branchPan, branchCin, branchMsmeReg, branchAddress, branchCity, branchState, branchZip, branchCountry, branchPhone, branchEmail, branchWebsite, branchGstBankName, branchBankName, branchNongstBankName, branchGstAccountHolder, branchAccountHolder, branchNongstAccountHolder, branchGstAccountNumber, branchAccountNumber, branchNongstAccountNumber, branchGstIfscCode, branchIfscCode, branchNongstIfscCode, branchGstBankBranch, branchBankBranch, branchNongstBankBranch, branchGstUpiId, branchUpiId, branchNongstUpiId, branchGstPaymentQrUrl, branchPaymentQrUrl, branchNongstPaymentQrUrl, branchTermsConditions, branchSignatoryName, branchSignatoryDesignation, branchSignatureImageUrl, branchStampImageUrl, branchStatus, editingBranch, updateBranch, addBranch, fetchBranches, setIsBranchModalOpen } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!branchName.trim()) return

    let finalCompanyId = targetCompanyIdForBranch
    if (!isSuperAdmin) {
      const allowedIds = visibleCompanies.map(c => c.id)
      if (!allowedIds.includes(finalCompanyId)) {
        finalCompanyId = visibleCompanies[0]?.id || "tech"
      }
    }

    const payload: Partial<Branch> = {
      companyId: finalCompanyId,
      name: branchName.trim(),
      code: branchCode.trim().toUpperCase(),
      brand_name: branchBrandName.trim(),
      division_name: branchDivisionName.trim(),
      subtitle: branchSubtitle.trim(),
      logo_url: branchLogoUrl,
      managerName: branchManager.trim(),
      managerPhone: branchManagerPhone.trim(),
      managerEmail: branchManagerEmail.trim(),
      gstin: branchGstin.trim(),
      pan: branchPan.trim(),
      cin: branchCin.trim(),
      msme_reg: branchMsmeReg.trim(),
      address: branchAddress.trim(),
      city: branchCity.trim(),
      state: branchState.trim(),
      zip: branchZip.trim(),
      country: branchCountry.trim(),
      phone: branchPhone.trim(),
      email: branchEmail.trim(),
      website: branchWebsite.trim(),
      // Base/Fallback Banking
      bank_name: (branchGstBankName || branchBankName || branchNongstBankName).trim(),
      account_holder: (branchGstAccountHolder || branchAccountHolder || branchNongstAccountHolder).trim(),
      account_number: (branchGstAccountNumber || branchAccountNumber || branchNongstAccountNumber).trim(),
      ifsc_code: (branchGstIfscCode || branchIfscCode || branchNongstIfscCode).trim().toUpperCase(),
      bank_branch: (branchGstBankBranch || branchBankBranch || branchNongstBankBranch).trim(),
      upi_id: (branchGstUpiId || branchUpiId || branchNongstUpiId).trim(),
      payment_qr_url: branchGstPaymentQrUrl || branchPaymentQrUrl || branchNongstPaymentQrUrl,
      // Distinct GST Banking Profile
      gst_bank_name: branchGstBankName.trim(),
      gst_account_holder: branchGstAccountHolder.trim(),
      gst_account_number: branchGstAccountNumber.trim(),
      gst_ifsc_code: branchGstIfscCode.trim().toUpperCase(),
      gst_bank_branch: branchGstBankBranch.trim(),
      gst_upi_id: branchGstUpiId.trim(),
      gst_payment_qr_url: branchGstPaymentQrUrl,
      // Distinct Non-GST Banking Profile
      nongst_bank_name: branchNongstBankName.trim(),
      nongst_account_holder: branchNongstAccountHolder.trim(),
      nongst_account_number: branchNongstAccountNumber.trim(),
      nongst_ifsc_code: branchNongstIfscCode.trim().toUpperCase(),
      nongst_bank_branch: branchNongstBankBranch.trim(),
      nongst_upi_id: branchNongstUpiId.trim(),
      nongst_payment_qr_url: branchNongstPaymentQrUrl,
      terms_conditions: branchTermsConditions.trim(),
      signatory_name: branchSignatoryName.trim(),
      signatory_designation: branchSignatoryDesignation.trim(),
      signature_image_url: branchSignatureImageUrl,
      stamp_image_url: branchStampImageUrl,
      status: branchStatus,
    }

    const isEdit = !!editingBranch
    await executeWithFeedback(async () => {
      if (editingBranch) {
        await updateBranch(editingBranch.id, payload)
      } else {
        await addBranch(payload)
      }

      await fetchBranches().catch(() => {})
      setIsBranchModalOpen(false)
    }, {
      actionType: isEdit ? "update" : "create",
      loadingTitle: isEdit ? "Updating Branch..." : "Creating Branch...",
      loadingMsg: `Saving branch ${branchName.trim()} with GST and Non-GST profiles...`,
      successTitle: isEdit ? "Branch Updated!" : "Branch Created Successfully!",
      successMsg: `Branch ${branchName.trim()} has been saved with full GST and Non-GST records.`,
      errorTitle: "Branch Save Failed",
    })
  };
    return __fn(...__args);
  };
}
