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

export function createSettingsAction20(getCtrl: () => any) {
  return (...__args: any[]) => {
    const {  } = getCtrl();
    const __fn: any = (comp: Company | undefined, compId: string) => {
    const isTech = String(compId).toLowerCase() === "tech" || String(compId).toLowerCase() === "1" || String(comp?.name || "").toLowerCase().includes("tech")
    
    // If company has saved smtp fields in DB / state
    if (comp && (comp.smtp_user || comp.smtp_pass || comp.smtp_host)) {
      const host = comp.smtp_host || (isTech ? "smtp.gmail.com" : "")
      let preset: "gmail" | "zoho" | "outlook" | "custom" = "gmail"
      if (host.includes("zoho")) preset = "zoho"
      else if (host.includes("outlook") || host.includes("office365")) preset = "outlook"
      else if (host && !host.includes("gmail")) preset = "custom"

      return {
        preset,
        host,
        port: String(comp.smtp_port || "587"),
        secure: comp.smtp_secure === true || String(comp.smtp_port) === "465",
        user: comp.smtp_user || "",
        pass: comp.smtp_pass || "",
        fromName: comp.smtp_from_name || comp.brand_name || comp.name || (isTech ? "SAAMPARK Technology" : "SAAMPARK Consultancy"),
        fromEmail: comp.smtp_from_email || comp.smtp_user || "",
      }
    }

    // Saampark Technology: prefilled working credentials (supriyogod@gmail.com / vctonocakbbgbvib)
    if (isTech) {
      return {
        preset: "gmail" as const,
        host: "smtp.gmail.com",
        port: "587",
        secure: false,
        user: "supriyogod@gmail.com",
        pass: "vctonocakbbgbvib",
        fromName: "SAAMPARK Technology",
        fromEmail: "supriyogod@gmail.com",
      }
    }

    // Saampark Consultancy & Any other company: strictly EMPTY until filled by Super Admin
    return {
      preset: "gmail" as const,
      host: "",
      port: "587",
      secure: false,
      user: "",
      pass: "",
      fromName: comp?.brand_name ? `${comp.brand_name} ${comp.division_name || comp.name || ""}`.trim() : (comp?.name || "SAAMPARK Consultancy"),
      fromEmail: "",
    }
  };
    return __fn(...__args);
  };
}
