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

export function createSettingsFn52(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { pendingUsername, setIsSavingUsername, setErrorMsg, user, setShowUsernameConfirmModal, setSuccessMsg, setUsernameStatus, setUsernameStatusMsg } = getCtrl();
    const __fn: any = async () => {
    if (!pendingUsername) return
    setIsSavingUsername(true)
    setErrorMsg("")
    try {
      const res = await updateUserUsernameAsync(String(user?.id || user?.email), pendingUsername)
      if (res.success) {
        setShowUsernameConfirmModal(false)
        setSuccessMsg(`✅ Username updated to @${pendingUsername}! You can now sign in using this username or your email.`)
        setUsernameStatus("idle")
        setUsernameStatusMsg("This is your current username.")
        setTimeout(() => setSuccessMsg(""), 5000)
      } else {
        setErrorMsg(res.message || "Failed to update username.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update username.")
    } finally {
      setIsSavingUsername(false)
    }
  };
    return __fn(...__args);
  };
}
