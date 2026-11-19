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

export function createSettingsAction23(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setErrorMsg, kycDocNumber, kycDocFrontUrl, setLoading, kycFullName, user, kycDocType, kycDocBackUrl, kycBankName, kycAccountNumber, kycIfscCode, kycAccountHolderName, kycUpiId, setKycStatus, loginAs, email, name, setSuccessMsg } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!kycDocNumber.trim()) {
      setErrorMsg("Please enter your Document Number.")
      return
    }

    if (!kycDocFrontUrl) {
      setErrorMsg("Please upload at least the Front photo of your ID document.")
      return
    }

    setLoading(true)
    try {
      const kycPayload: KycData = {
        fullName: kycFullName.trim() || user?.name || "",
        docType: kycDocType,
        docNumber: kycDocNumber.trim(),
        docFrontUrl: kycDocFrontUrl,
        docBackUrl: kycDocBackUrl || undefined,
        bankName: kycBankName.trim() || undefined,
        accountNumber: kycAccountNumber.trim() || undefined,
        ifscCode: kycIfscCode.trim().toUpperCase() || undefined,
        accountHolderName: kycAccountHolderName.trim() || undefined,
        upiId: kycUpiId.trim() || undefined,
        submittedAt: new Date().toISOString(),
        rejectionReason: undefined,
      }

      const updatedUser: any = {
        ...(user || {}),
        kycStatus: "Processing" as KycStatus,
        kycData: kycPayload,
      }

      setKycStatus("Processing")

      // Update Auth Store
      if (user?.role) {
        loginAs(user.role, updatedUser)
      }

      // Record in userService & DB
      recordUserAccount({
        id: String(user?.id || Date.now()),
        email: user?.email || email,
        name: user?.name || name,
        kycStatus: "Processing",
        kycData: kycPayload,
      })

      // Sync with Team Banking & Payroll hub
      try {
        const { updateMemberBankingDetails } = await import("@/features/team/services/teamPaymentService")
        await updateMemberBankingDetails(String(user?.id || user?.email || email), {
          bankName: kycBankName.trim() || undefined,
          accountNumber: kycAccountNumber.trim() || undefined,
          ifscCode: kycIfscCode.trim().toUpperCase() || undefined,
          accountHolderName: kycAccountHolderName.trim() || undefined,
          upiId: kycUpiId.trim() || undefined,
        }, user?.companyId || "tech")
      } catch {}

      setSuccessMsg("🎉 KYC & Banking details saved successfully! Your account is now Under Review.")
      setTimeout(() => setSuccessMsg(""), 5000)
    } catch (err: any) {
      setErrorMsg(`Error submitting KYC: ${err.message}`)
    } finally {
      setLoading(false)
    }
  };
    return __fn(...__args);
  };
}
