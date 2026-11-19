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
import { createSettingsAction20 } from "@/features/settings/hooks/settings-hooks/createSettingsAction20.hooks"
import { createSettingsAction21 } from "@/features/settings/hooks/settings-hooks/createSettingsAction21.hooks"
import { createSettingsAction22 } from "@/features/settings/hooks/settings-hooks/createSettingsAction22.hooks"
import { createSettingsAction23 } from "@/features/settings/hooks/settings-hooks/createSettingsAction23.hooks"
import { createSettingsAction24 } from "@/features/settings/hooks/settings-hooks/createSettingsAction24.hooks"
import { createSettingsAction25 } from "@/features/settings/hooks/settings-hooks/createSettingsAction25.hooks"

export function runSettingsEffect50(getCtrl: () => any) {
  const { fetchCompanies, setCompanyName, setCurrency, setCurrencySymbol, setAddress, setIndustry, setCompanySmtpMap, setPayQrUrl, setPayBankName, setPayAccountHolder, setPayAccountNumber, setPayIfsc, setPayUpiId, setPayBranch, setPaySwiftCode, setPayNotes, user, setName, setEmail, setUsername, setPhone, setAvatar, setDepartment, setKycStatus, setKycFullName, setKycDocType, setKycDocNumber, setKycDocFrontUrl, setKycDocBackUrl, setKycBankName, setKycAccountNumber, setKycIfscCode, setKycAccountHolderName, setKycUpiId, setKycRejectionReason } = getCtrl();
  const __fn: any = () => {
    // 1. Fetch companies to ensure latest per-company SMTP configs are loaded
    fetchCompanies().catch(() => {})

    // 2. Fetch from DB master scope
    fetchModuleDataFromDB("settings", null, "all").then((saved: any) => {
      if (saved && typeof saved === "object") {
        if (saved.companyName) setCompanyName(saved.companyName)
        if (saved.currency) setCurrency(saved.currency)
        if (saved.currencySymbol) setCurrencySymbol(saved.currencySymbol)
        if (saved.address) setAddress(saved.address)
        if (saved.industry) setIndustry(saved.industry)
        if (saved.smtpUser && saved.smtpPass) {
          setCompanySmtpMap((prev) => ({
            ...prev,
            tech: {
              preset: saved.smtpHost?.includes("gmail") ? "gmail" : (saved.smtpHost?.includes("zoho") ? "zoho" : "custom"),
              host: saved.smtpHost || "smtp.gmail.com",
              port: String(saved.smtpPort || "587"),
              secure: saved.smtpSecure === true,
              user: saved.smtpUser || "supriyogod@gmail.com",
              pass: saved.smtpPass || "vctonocakbbgbvib",
              fromName: saved.smtpFromName || "SAAMPARK Technology",
              fromEmail: saved.smtpFromEmail || saved.smtpUser || "supriyogod@gmail.com",
            }
          }))
        }
      }
    })

    getCompanyPaymentSettings().then((pSet) => {
      if (pSet) {
        if (pSet.qrCodeUrl) setPayQrUrl(pSet.qrCodeUrl)
        if (pSet.bankName) setPayBankName(pSet.bankName)
        if (pSet.accountHolderName) setPayAccountHolder(pSet.accountHolderName)
        if (pSet.accountNumber) setPayAccountNumber(pSet.accountNumber)
        if (pSet.ifscCode) setPayIfsc(pSet.ifscCode)
        if (pSet.upiId) setPayUpiId(pSet.upiId)
        if (pSet.branch) setPayBranch(pSet.branch)
        if (pSet.swiftCode) setPaySwiftCode(pSet.swiftCode)
        if (pSet.notes) setPayNotes(pSet.notes)
      }
    }).catch(() => {})

    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      if (user.username) setUsername(user.username)
      if (user.phone) setPhone(user.phone)
      if (user.avatar || (user as any).avatarUrl) setAvatar(user.avatar || (user as any).avatarUrl)
      if (user.department) setDepartment(user.department)
      if (user.kycStatus) setKycStatus(user.kycStatus)

      if (user.kycData) {
        const kd = user.kycData
        if (kd.fullName) setKycFullName(kd.fullName)
        if (kd.docType) setKycDocType(kd.docType)
        if (kd.docNumber) setKycDocNumber(kd.docNumber)
        if (kd.docFrontUrl) setKycDocFrontUrl(kd.docFrontUrl)
        if (kd.docBackUrl) setKycDocBackUrl(kd.docBackUrl)
        if (kd.bankName) setKycBankName(kd.bankName)
        if (kd.accountNumber) setKycAccountNumber(kd.accountNumber)
        if (kd.ifscCode) setKycIfscCode(kd.ifscCode)
        if (kd.accountHolderName) setKycAccountHolderName(kd.accountHolderName)
        if (kd.upiId) setKycUpiId(kd.upiId)
        if (kd.rejectionReason) setKycRejectionReason(kd.rejectionReason)
      }

      // Live DB sync: fetch fresh user account to get KYC approved by Admin in real-time
      const syncFreshKYC = () => {
        getStoredUserAccountsAsync().then((accounts) => {
          const uId = String(user.id || "").toLowerCase().trim()
          const uEmail = (user.email || "").toLowerCase().trim()
          const fresh = accounts.find((a) => {
            const aId = String(a.id || "").toLowerCase().trim()
            const aEmail = (a.email || "").toLowerCase().trim()
            return (uId && aId === uId) || (uEmail && aEmail === uEmail)
          })
          if (fresh) {
            if (fresh.kycStatus) setKycStatus(fresh.kycStatus)
            if (fresh.kycData) {
              const kd = fresh.kycData
              if (kd.fullName) setKycFullName(kd.fullName)
              if (kd.docType) setKycDocType(kd.docType)
              if (kd.docNumber) setKycDocNumber(kd.docNumber)
              if (kd.docFrontUrl) setKycDocFrontUrl(kd.docFrontUrl)
              if (kd.docBackUrl) setKycDocBackUrl(kd.docBackUrl)
              if (kd.bankName) setKycBankName(kd.bankName)
              if (kd.accountNumber) setKycAccountNumber(kd.accountNumber)
              if (kd.ifscCode) setKycIfscCode(kd.ifscCode)
              if (kd.accountHolderName) setKycAccountHolderName(kd.accountHolderName)
              if (kd.upiId) setKycUpiId(kd.upiId)
              if (kd.rejectionReason) setKycRejectionReason(kd.rejectionReason)
            }
            if (fresh.kycStatus && fresh.kycStatus !== user.kycStatus) {
              useAuthStore.setState({
                user: {
                  ...user,
                  kycStatus: fresh.kycStatus,
                  kycData: fresh.kycData,
                }
              })
            }
          }
        }).catch(() => {})
      }

      syncFreshKYC()

      if (typeof window !== "undefined") {
        window.addEventListener("saampark_kyc_updated", syncFreshKYC)
        window.addEventListener("storage", syncFreshKYC)
        return () => {
          window.removeEventListener("saampark_kyc_updated", syncFreshKYC)
          window.removeEventListener("storage", syncFreshKYC)
        }
      }
    }
  };
  return __fn();
}
