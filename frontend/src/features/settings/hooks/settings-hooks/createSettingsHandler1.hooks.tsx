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
import { type SettingsTab } from "@/features/settings/components/settings-sections/SettingsHelpers"

export function createSettingsHandler1(getCtrl: () => any) {
  return (...__args: any[]) => {
    const { setErrorMsg, newPassword, currentPassword, confirmPassword, setLoading, user, isSuperAdmin, name, email, phone, department, avatar, jobTitle, location, bio, skills, loginAs, setCurrentPassword, setNewPassword, setConfirmPassword, setSuccessMsg } = getCtrl();
    const __fn: any = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    // If changing password, require current password verification
    if (newPassword) {
      if (!currentPassword) {
        setErrorMsg("⚠️ Please enter your current/previous password to authorize a password change.")
        return
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg("⚠️ New password and confirmation password do not match.")
        return
      }
      if (newPassword.length < 6) {
        setErrorMsg("⚠️ New password must be at least 6 characters long.")
        return
      }
    }

    setLoading(true)
    try {
      const updatedUserData: any = {
        ...(user || {}),
        name: isSuperAdmin ? name : (user?.name || name),
        email: isSuperAdmin ? email : (user?.email || email),
        phone: isSuperAdmin ? phone : (user?.phone || phone),
        department: isSuperAdmin ? department : (user?.department || department),
        avatar,
        avatarUrl: avatar,
        jobTitle,
        location,
        bio,
        skills,
      }

      if (newPassword) {
        updatedUserData.password = newPassword
      }

      // Update Auth Store
      if (user?.role) {
        loginAs(user.role, updatedUserData)
      }

      // Sync to MySQL users table
      try {
        const { api } = await import("@/lib/api")
        await api.put(`/users/${user?.id || email}`, {
          full_name: updatedUserData.name,
          email: updatedUserData.email,
          phone: updatedUserData.phone,
          department: updatedUserData.department,
          avatar_url: avatar,
          avatarUrl: avatar,
          avatar: avatar,
          password: newPassword || undefined,
        }).catch((err) => console.warn("Backend profile update warning:", err))
      } catch {}

      // Save to database users list
      recordUserAccount({
        id: String(user?.id || Date.now()),
        name: updatedUserData.name,
        email: updatedUserData.email,
        phone: updatedUserData.phone,
        department: updatedUserData.department,
        avatarUrl: avatar,
        password: newPassword ? newPassword : ((user as any)?.password || undefined),
        username: user?.username || undefined,
        companyIds: user?.companyIds || (user?.companyId ? [user.companyId] : ["tech"]),
        companyId: user?.companyId || "tech",
        branchId: user?.branchId,
        branchName: user?.branchName,
        role: (user?.role as any) || "Admin",
        status: "Active",
      })

      if (avatar && user) {
        cascadeUserAvatarChange(updatedUserData.name, updatedUserData.email, avatar).catch(() => {})
      }

      // Clear password fields
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"))
      }

      setSuccessMsg("✅ Profile updated successfully! Cloud image & details live-synced across CRM.")
      setTimeout(() => setSuccessMsg(""), 4000)
    } catch (err: any) {
      setErrorMsg(`Error updating profile: ${err.message}`)
    } finally {
      setLoading(false)
    }
  };
    return __fn(...__args);
  };
}
