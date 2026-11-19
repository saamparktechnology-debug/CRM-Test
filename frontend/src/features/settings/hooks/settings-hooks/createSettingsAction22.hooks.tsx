"use client"

import { CompanyApiService } from "@/features/companies/services/companyService"
import { api } from "@/lib/api"
import * as React from "react"
import { motion } from "framer-motion"
import { 
  Settings, Building2, Mail, Lock, Sun, Moon, ShieldCheck, 
  Save, CheckCircle2, Globe, Key, AlertCircle, RefreshCw,
  Camera, Upload, User, Sparkles, Phone, MapPin, Briefcase, Tag,
  QrCode, CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useAuthStore, Company, DEFAULT_COMPANIES } from "@/store/useAuthStore"
import { useTheme } from "next-themes"
import { fetchModuleDataFromDB, saveModuleDataToDB } from "@/lib/storageSync"
import { 
  getUsers, 
  recordUserAccount, 
  getStoredUserAccountsAsync,
  cascadeUserAvatarChange, 
  checkUsernameAvailabilityAsync, 
  updateUserUsernameAsync 
} from "@/features/users/services/userService"
import { uploadToImgBB } from "@/lib/imgbbUpload"
import { KycData, KycStatus } from "@/features/users/types"
import { 
  getCompanyPaymentSettings, 
  saveCompanyPaymentSettings, 
  CompanyPaymentSettings,
  DEFAULT_COMPANY_PAYMENT_SETTINGS 
} from "@/features/settings/services/companyPaymentService"
import { EntityModulePermissionsTab } from "@/features/settings/components/EntityModulePermissionsTab"
import { SettingsSection1 } from "@/features/settings/components/settings-sections/SettingsSection1"
import { SettingsSection2 } from "@/features/settings/components/settings-sections/SettingsSection2"
import { SettingsSection3 } from "@/features/settings/components/settings-sections/SettingsSection3"
import { SettingsSection4 } from "@/features/settings/components/settings-sections/SettingsSection4"
import { SettingsSection5 } from "@/features/settings/components/settings-sections/SettingsSection5"
import { createSettingsHandler1 } from "@/features/settings/hooks/settings-hooks/createSettingsHandler1.hooks"
import { type SettingsTab } from "@/features/settings/components/settings-sections/SettingsHelpers"

export function createSettingsAction22(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setErrorMsg, newReqAccountNumber, newReqIfscCode, newReqConfirmAccountNumber, setIsSubmittingBankChange, newReqBankName, newReqAccountHolderName, user, newReqUpiId, newReqProofUrl, newReqReason, loginAs, setShowBankChangeModal, setSuccessMsg } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    if (!newReqAccountNumber.trim() || !newReqIfscCode.trim()) {
      setErrorMsg("Please provide both New Bank Account Number and IFSC Code.")
      return
    }
    if (newReqAccountNumber.trim() !== newReqConfirmAccountNumber.trim()) {
      setErrorMsg("New Account Number and Confirmation do not match.")
      return
    }

    setIsSubmittingBankChange(true)
    try {
      const changeRequest = {
        bankName: newReqBankName.trim() || "N/A",
        accountHolderName: newReqAccountHolderName.trim() || user?.name || "",
        accountNumber: newReqAccountNumber.trim(),
        ifscCode: newReqIfscCode.trim().toUpperCase(),
        upiId: newReqUpiId.trim() || "",
        bankProofUrl: newReqProofUrl || "",
        reason: newReqReason.trim() || "Salary Remittance Account Update",
        status: "pending",
        requestedAt: new Date().toISOString(),
      }

      const existingKyc = user?.kycData || {}
      const updatedKyc = {
        ...existingKyc,
        bankChangeRequest: changeRequest,
      }

      const updatedUser: any = {
        ...(user || {}),
        kycData: updatedKyc,
      }

      if (user?.role) {
        loginAs(user.role, updatedUser)
      }

      const targetId = user?.id || user?.email
      if (targetId) {
        const { api } = await import("@/lib/api")
        await api.put(`/users/${encodeURIComponent(targetId)}`, {
          kyc_data: updatedKyc,
          kycData: updatedKyc,
        }).catch(console.warn)
      }

      setShowBankChangeModal(false)
      setSuccessMsg("🏦 Bank change request submitted! Awaiting administrator approval. Remittances will use current account until approved.")
      setTimeout(() => setSuccessMsg(""), 6000)
    } catch (err: any) {
      setErrorMsg(`Failed to submit bank change request: ${err.message}`)
    } finally {
      setIsSubmittingBankChange(false)
    }
  };
    return __fn(...__args);
  };
}
