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

export function createSettingsAction21(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setIsUploadingAvatar, setErrorMsg, user, setAvatar, setSuccessMsg } = getCtrl();
    const __fn: any = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 12 * 1024 * 1024) {
      alert("Image size should be under 12MB.")
      return
    }

    setIsUploadingAvatar(true)
    setErrorMsg("")
    try {
      const uploadResult = await uploadToImgBB(file, `${user?.name || "avatar"}_${Date.now()}`, 400)
      if (uploadResult.url) {
        const finalAvatarUrl = uploadResult.url
        setAvatar(finalAvatarUrl)
        
        // Live sync avatar across session immediately
        if (user) {
          useAuthStore.setState({
            user: { ...user, avatar: finalAvatarUrl, avatarUrl: finalAvatarUrl } as any
          })
          recordUserAccount({
            ...user,
            avatarUrl: finalAvatarUrl,
            avatar: finalAvatarUrl,
            id: String(user.id),
          })
          cascadeUserAvatarChange(user.name, user.email, finalAvatarUrl).catch(() => {})

          // Sync to backend MySQL table
          try {
            const { api } = await import("@/lib/api")
            await api.put(`/users/${user.id || user.email}`, {
              avatar_url: finalAvatarUrl,
              avatar: finalAvatarUrl,
              avatarUrl: finalAvatarUrl,
            }).catch(() => {})
          } catch {}

          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("storage"))
            window.dispatchEvent(new CustomEvent("crm_avatar_changed", { detail: { avatar: finalAvatarUrl } }))
          }
        }

        setSuccessMsg("📸 Profile picture updated & live synced across Topbar, Leads, Projects & Comments!")
        setTimeout(() => setSuccessMsg(""), 4000)
      }
    } catch (err: any) {
      setErrorMsg("Failed to upload image. Please try again.")
    } finally {
      setIsUploadingAvatar(false)
    }
  };
    return __fn(...__args);
  };
}
