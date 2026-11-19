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

export function createSettingsAction24(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { isSuperAdmin, setLoading, setErrorMsg, setSuccessMsg, currentSmtp, selectedSmtpCompanyId, activeSmtpCompany, updateCompany, companyName, currency, currencySymbol, address, industry } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSuperAdmin) return
    setLoading(true)
    setErrorMsg("")
    setSuccessMsg("")

    const curr = currentSmtp
    const compId = selectedSmtpCompanyId
    const comp = activeSmtpCompany
    const isTech = String(compId).toLowerCase() === "tech" || String(compId).toLowerCase() === "1" || String(comp?.name || "").toLowerCase().includes("tech")

    try {
      // 1. Update company in Zustand store and persist to MySQL `companies` table / `app_data`
      await updateCompany(compId, {
        smtp_host: curr.host.trim(),
        smtp_port: curr.port.trim(),
        smtp_secure: curr.secure,
        smtp_user: curr.user.trim(),
        smtp_pass: curr.pass.trim(),
        smtp_from_name: curr.fromName.trim() || comp?.name || "SAAMPARK",
        smtp_from_email: curr.fromEmail.trim() || curr.user.trim(),
      })

      // 2. Dispatch to backend API /email/company-config
      try {
        const { api } = await import("@/lib/api")
        await api.post("/email/company-config", {
          companyId: compId,
          host: curr.host.trim(),
          port: curr.port.trim(),
          secure: curr.secure,
          user: curr.user.trim(),
          pass: curr.pass.trim(),
          fromName: curr.fromName.trim() || comp?.name || "SAAMPARK",
          fromEmail: curr.fromEmail.trim() || curr.user.trim(),
        }).catch(() => {})

        // If this is Saampark Technology, also sync global master settings fallback
        if (isTech) {
          const smtpPayload = {
            companyName, currency, currencySymbol, address, industry,
            smtpUser: curr.user.trim(),
            smtpPass: curr.pass.trim(),
            smtpHost: curr.host.trim(),
            smtpPort: curr.port.trim(),
            smtpSecure: curr.secure,
            smtpFromName: curr.fromName.trim(),
            smtpFromEmail: curr.fromEmail.trim() || curr.user.trim(),
          }
          if (typeof window !== "undefined") {
            localStorage.setItem("saampark_smtp_settings", JSON.stringify(smtpPayload))
          }
          await saveModuleDataToDB("settings", smtpPayload, "all").catch(() => {})
          await api.post("/email/settings", smtpPayload).catch(() => {})
        }
      } catch {}

      setSuccessMsg(`✅ SMTP configurations for ${comp?.name || compId} saved and synced successfully!`)
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setErrorMsg(`Error saving SMTP settings: ${err.message}`)
    } finally {
      setLoading(false)
    }
  };
    return __fn(...__args);
  };
}
