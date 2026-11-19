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

export function createSettingsAction25(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { currentSmtp, selectedSmtpCompanyId, activeSmtpCompany, setSmtpTestResult, setIsTestingSmtp, smtpTestRecipient } = getCtrl();
    const __fn: any = async () => {
    const curr = currentSmtp
    const compId = selectedSmtpCompanyId
    const comp = activeSmtpCompany

    if (!curr.user.trim() || !curr.pass.trim()) {
      setSmtpTestResult({
        success: false,
        message: `Please enter SMTP Username and App Password for ${comp?.name || compId} before testing.`,
      })
      return
    }

    setIsTestingSmtp(true)
    setSmtpTestResult(null)

    try {
      const { api } = await import("@/lib/api")
      const res = await api.post("/email/test-connection", {
        host: curr.host.trim() || "smtp.gmail.com",
        port: curr.port.trim() || "587",
        secure: curr.secure,
        user: curr.user.trim(),
        pass: curr.pass.trim(),
        fromName: curr.fromName.trim() || comp?.name || "SAAMPARK CRM",
        fromEmail: curr.fromEmail.trim() || curr.user.trim(),
        testEmail: smtpTestRecipient.trim() || curr.user.trim(),
        companyId: compId,
        companyName: comp?.name || (compId === "consultancy" ? "SAAMPARK Consultancy" : "SAAMPARK Technology"),
      })

      setSmtpTestResult({
        success: true,
        message: res.data?.message || `Verified! Test email successfully sent to ${smtpTestRecipient.trim() || curr.user.trim()} for ${comp?.name || compId}`,
      })
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: err.response?.data?.message || err.message || "Failed to authenticate SMTP connection. Please check your App Password or Host.",
      })
    } finally {
      setIsTestingSmtp(false)
    }
  };
    return __fn(...__args);
  };
}
